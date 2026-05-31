const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { helmetConfig, sanitizeInput, apiLimiter } = require('./middleware/security');
const { requestLogger, errorHandler, logger } = require('./middleware/logger');

dotenv.config();

const app = express();

// Security Middleware
app.use(helmetConfig);
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger
app.use(requestLogger);

// Input sanitization
app.use(sanitizeInput);

// Rate limiting
app.use('/api/', apiLimiter);

// Serve static files (React build + PWA assets)
app.use(express.static(path.join(__dirname, '../build')));

// MongoDB Connection
const { connectDB } = require('./config/database');
connectDB();

// Seed achievement catalog on startup
const { seedAchievements } = require('./services/gamificationService');
seedAchievements();

// ── API Routes ──────────────────────────────────────────────
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

// New features
app.use('/api/gyms', require('./routes/gyms'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/achievements', require('./routes/achievements'));
app.use('/api/trainer-bookings', require('./routes/trainerBookings'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/onboarding', require('./routes/onboarding'));
// ────────────────────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: '2.0.0',
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});

// SPA fallback (must come after API routes)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`🚀 AuraFit v2.0 running on port ${PORT}`);
  logger.info(`🔒 Security: Helmet, CORS, Rate Limiting active`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
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
