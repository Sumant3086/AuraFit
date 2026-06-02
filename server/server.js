const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

// Validate environment before anything else
const { validateEnvironment } = require('./utils/envCheck');
validateEnvironment();

const { helmetConfig, sanitizeInput, apiLimiter, preventNoSQLInjection } = require('./middleware/security');
const { requestLogger, errorHandler, logger } = require('./middleware/logger');
const { metricsMiddleware } = require('./routes/metrics');

const app = express();

// ── Security Middleware ──────────────────────────────────────
app.use(helmetConfig);
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-razorpay-signature'],
}));

// ── Body parsing ─────────────────────────────────────────────
// Webhooks need raw body — mount before json() for that path
app.use('/api/webhooks', require('./routes/webhooks'));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Observability ────────────────────────────────────────────
app.use(requestLogger);
app.use(metricsMiddleware);

// ── Input protection ─────────────────────────────────────────
app.use(sanitizeInput);
app.use(preventNoSQLInjection);

// ── Rate limiting ─────────────────────────────────────────────
app.use('/api/', apiLimiter);

// ── Static files ──────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../build')));

// ── Database ──────────────────────────────────────────────────
const { connectDB } = require('./config/database');
connectDB();

// ── Startup services ──────────────────────────────────────────
const { seedAchievements } = require('./services/gamificationService');
seedAchievements();

const { initCronJobs } = require('./jobs/cronJobs');
initCronJobs();

// ── API Routes ───────────────────────────────────────────────
// Core
app.use('/api/auth', require('./routes/auth'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/admin', require('./routes/admin'));

// Commerce
app.use('/api/memberships', require('./routes/memberships'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/products', require('./routes/products'));

// Fitness content
app.use('/api/classes', require('./routes/classes'));
app.use('/api/workout-plans', require('./routes/workoutPlans'));
app.use('/api/nutrition-plans', require('./routes/nutritionPlans'));
app.use('/api/progress-tracker', require('./routes/progressTracker'));

// v2.0 features
app.use('/api/gyms', require('./routes/gyms'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/achievements', require('./routes/achievements'));
app.use('/api/trainer-bookings', require('./routes/trainerBookings'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/onboarding', require('./routes/onboarding'));

// v2.1 features
app.use('/api/social', require('./routes/social'));
app.use('/api/ai-chat', require('./routes/aiChat'));
app.use('/api/reports', require('./routes/reports'));

// v2.2 features
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/trainers', require('./routes/trainers'));

// v2.3 features
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/metrics', require('./routes/metrics'));
app.use('/api/seed', require('./routes/seed'));
// ────────────────────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: '2.3.0',
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`🚀 AuraFit v2.3.0 running on port ${PORT}`);
  logger.info(`🔒 Security: Helmet + CORS + Rate Limiting + NoSQL injection guard`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`📊 Metrics: GET /api/metrics (admin only)`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(`❌ Port ${PORT} is already in use.`);
    logger.error(`   Run: npx kill-port ${PORT}  (or close the other server instance)`);
    logger.error(`   Or set a different PORT in server/.env`);
    process.exit(1);
  } else {
    throw err;
  }
});

// Initialize WebSocket
const { initializeSocket } = require('./socket/socketServer');
initializeSocket(server);
logger.info('🔌 WebSocket initialized');

// Graceful shutdown
const shutdown = (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  server.close(() => {
    mongoose.connection.close(false, () => {
      logger.info('MongoDB connection closed.');
      process.exit(0);
    });
  });
  setTimeout(() => process.exit(1), 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => logger.error('Unhandled Rejection:', reason));
process.on('uncaughtException', (err) => { logger.error('Uncaught Exception:', err); process.exit(1); });
