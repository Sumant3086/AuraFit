const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');

// Rate limiting configuration
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { success: false, message },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// General API rate limiter - 100 requests per 15 minutes
const apiLimiter = createRateLimiter(
  15 * 60 * 1000,
  100,
  'Too many requests from this IP, please try again later.'
);

// Strict limiter for auth routes - 5 requests per 15 minutes
const authLimiter = createRateLimiter(
  15 * 60 * 1000,
  5,
  'Too many authentication attempts, please try again later.'
);

// Payment limiter - 10 requests per hour
const paymentLimiter = createRateLimiter(
  60 * 60 * 1000,
  10,
  'Too many payment requests, please try again later.'
);

// Stricter rate limiter for search/AI endpoints
const searchLimiter = createRateLimiter(
  60 * 1000,
  30,
  'Search rate limit exceeded. Please slow down.'
);

const aiLimiter = createRateLimiter(
  60 * 1000,
  10,
  'AI request limit exceeded. Please wait a moment.'
);

const uploadLimiter = createRateLimiter(
  60 * 60 * 1000,
  30,
  'Upload limit exceeded for this hour.'
);

// Helmet security headers — production-grade CSP
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://res.cloudinary.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:', 'https://res.cloudinary.com', 'https://lh3.googleusercontent.com'],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://checkout.razorpay.com',
      ],
      connectSrc: [
        "'self'",
        'https://api.razorpay.com',
        'https://checkout.razorpay.com',
        'https://api.cloudinary.com',
        'https://generativelanguage.googleapis.com',
        'wss:',
        'ws:',
      ],
      frameSrc: ["'self'", 'https://api.razorpay.com'],
      workerSrc: ["'self'", 'blob:'],
      manifestSrc: ["'self'"],
      mediaSrc: ["'self'", 'https://res.cloudinary.com', 'blob:'],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        // Remove potential XSS patterns
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
          .trim();
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };

  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);
  
  next();
};

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Common validation rules
const validationRules = {
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  
  password: body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  
  name: body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  phone: body('phone')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must be 10 digits'),
  
  mongoId: (field) => body(field)
    .matches(/^[0-9a-fA-F]{24}$/)
    .withMessage(`Invalid ${field} format`),
};

// MongoDB injection prevention
const preventNoSQLInjection = (req, res, next) => {
  const checkForInjection = (obj) => {
    if (typeof obj !== 'object' || obj === null) return false;
    for (const key of Object.keys(obj)) {
      if (key.startsWith('$') || key.includes('.')) return true;
      if (typeof obj[key] === 'object' && checkForInjection(obj[key])) return true;
    }
    return false;
  };

  if (req.body && checkForInjection(req.body)) {
    return res.status(400).json({ success: false, message: 'Invalid request parameters.' });
  }
  if (req.query && checkForInjection(req.query)) {
    return res.status(400).json({ success: false, message: 'Invalid query parameters.' });
  }
  next();
};

module.exports = {
  apiLimiter,
  authLimiter,
  paymentLimiter,
  searchLimiter,
  aiLimiter,
  uploadLimiter,
  helmetConfig,
  sanitizeInput,
  preventNoSQLInjection,
  handleValidationErrors,
  validationRules,
};
