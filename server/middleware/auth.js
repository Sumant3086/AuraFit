const jwt = require('jsonwebtoken');
const User = require('../models/User');

// These MUST be set in environment — no hardcoded fallbacks (security risk)
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be set in environment variables. See server/.env.example');
}
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

const generateAccessToken = (userId, role) => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
};

const generateTokens = (userId, role) => ({
  accessToken: generateAccessToken(userId, role),
  refreshToken: generateRefreshToken(userId),
});

// Verify token and attach user to req
const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token. User not found.' });
    }
    if (user.status === 'Suspended') {
      return res.status(403).json({ success: false, message: 'Account suspended. Contact support.' });
    }

    req.user = user;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired.', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

// Refresh access token
const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token required.' });
    }

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token.' });
    }

    const tokens = generateTokens(user._id, user.role);
    res.json({ success: true, data: { ...tokens, user: { id: user._id, name: user.name, email: user.email, role: user.role } } });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
  }
};

// Role-based authorization factory
const requireRole = (...allowedRoles) => async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  // Normalize legacy roles
  const role = req.user.role;
  const isAdmin = role === 'admin' || role === 'super_admin' || role === 'gym_admin';
  const isAllowed = allowedRoles.includes(role) || (allowedRoles.includes('admin') && isAdmin);

  if (!isAllowed) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Required role: ${allowedRoles.join(' or ')}.`,
    });
  }
  next();
};

// Shorthand middleware
const verifyAdmin = [verifyToken, requireRole('admin', 'super_admin', 'gym_admin')];
const verifyTrainer = [verifyToken, requireRole('admin', 'super_admin', 'gym_admin', 'trainer')];
const verifySuperAdmin = [verifyToken, requireRole('admin', 'super_admin')];
const verifyGymAdmin = [verifyToken, requireRole('admin', 'super_admin', 'gym_admin')];

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  verifyToken,
  refreshAccessToken,
  requireRole,
  verifyAdmin,
  verifyTrainer,
  verifySuperAdmin,
  verifyGymAdmin,
};
