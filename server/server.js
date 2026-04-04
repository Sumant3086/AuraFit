const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { helmetConfig, sanitizeInput, apiLimiter } = require('./middleware/security');

dotenv.config();

const app = express();

// Security Middleware
app.use(helmetConfig);
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization
app.use(sanitizeInput);

// Rate limiting for all API routes
app.use('/api/', apiLimiter);

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../build')));

// MongoDB Connection
const { connectDB } = require('./config/database');
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/memberships', require('./routes/memberships'));
app.use('/api/classes', require('./routes/classes'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/workout-plans', require('./routes/workoutPlans'));
app.use('/api/nutrition-plans', require('./routes/nutritionPlans'));
app.use('/api/progress-tracker', require('./routes/progressTracker'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔒 Security: Helmet, CORS, Rate Limiting enabled`);
});

// Initialize WebSocket
const { initializeSocket } = require('./socket/socketServer');
initializeSocket(server);
console.log('🔌 WebSocket server initialized');
