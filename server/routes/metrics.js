const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Order = require('../models/Order');
const Attendance = require('../models/Attendance');
const SocialPost = require('../models/SocialPost');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const { getOnlineUsersCount } = require('../socket/socketServer');
const { logger } = require('../middleware/logger');

// In-memory metrics accumulator (resets on restart)
const metrics = {
  requests: 0,
  errors: 0,
  responseTimes: [],
  startTime: Date.now(),
};

// Middleware to track request metrics (attach to server.js)
function metricsMiddleware(req, res, next) {
  metrics.requests++;
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    metrics.responseTimes.push(duration);
    if (metrics.responseTimes.length > 1000) metrics.responseTimes.shift();
    if (res.statusCode >= 500) metrics.errors++;
  });

  next();
}

// GET /api/metrics — Production health + performance metrics (admin only)
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const now = Date.now();
    const uptime = Math.floor((now - metrics.startTime) / 1000);
    const onlineUsers = getOnlineUsersCount();

    const avgResponseTime = metrics.responseTimes.length > 0
      ? Math.round(metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length)
      : 0;

    const p95 = (() => {
      if (metrics.responseTimes.length === 0) return 0;
      const sorted = [...metrics.responseTimes].sort((a, b) => a - b);
      return sorted[Math.floor(sorted.length * 0.95)] || 0;
    })();

    const [
      totalUsers, activeMembers, totalOrders, todayCheckIns, totalPosts, unreadNotifications, recentErrors
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ membership: { $in: ['Basic', 'Pro', 'Premium'] }, status: 'Active' }),
      Order.countDocuments({ paymentStatus: 'Paid' }),
      Attendance.countDocuments({ date: new Date().toISOString().split('T')[0] }),
      SocialPost.countDocuments(),
      Notification.countDocuments({ read: false }),
      AuditLog.countDocuments({ createdAt: { $gte: new Date(Date.now() - 3600000) }, status: 'failed' }),
    ]);

    res.json({
      success: true,
      data: {
        system: {
          uptime,
          uptimeFormatted: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
          nodeVersion: process.version,
          environment: process.env.NODE_ENV || 'development',
          memoryUsage: {
            heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
          },
        },
        performance: {
          totalRequests: metrics.requests,
          errorCount: metrics.errors,
          errorRate: metrics.requests > 0 ? `${((metrics.errors / metrics.requests) * 100).toFixed(2)}%` : '0%',
          avgResponseTime: `${avgResponseTime}ms`,
          p95ResponseTime: `${p95}ms`,
        },
        realtime: {
          onlineUsers,
        },
        database: {
          totalUsers,
          activeMembers,
          paidOrders: totalOrders,
          todayCheckIns,
          communityPosts: totalPosts,
          unreadNotifications,
          recentFailedAuditLogs: recentErrors,
        },
        health: {
          status: metrics.errors < 10 ? 'healthy' : 'degraded',
          score: Math.max(0, 100 - Math.round((metrics.errors / Math.max(metrics.requests, 1)) * 100)),
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/metrics/audit-logs — Recent admin actions
router.get('/audit-logs', verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, action, resource } = req.query;
    const query = {};
    if (action) query.action = new RegExp(action, 'i');
    if (resource) query.resource = resource;

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await AuditLog.countDocuments(query);
    res.json({ success: true, data: logs, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
module.exports.metricsMiddleware = metricsMiddleware;
