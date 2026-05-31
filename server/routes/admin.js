const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Class = require('../models/Class');
const Membership = require('../models/Membership');
const Attendance = require('../models/Attendance');
const Announcement = require('../models/Announcement');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Helper: require admin (legacy OR token-based)
const adminGuard = async (req, res, next) => {
  // Try token auth first
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'aura_fit_secret_key_2024');
      const user = await User.findById(decoded.userId).select('-password');
      if (user && (user.role === 'admin' || user.role === 'super_admin' || user.role === 'gym_admin')) {
        req.user = user;
        return next();
      }
    } catch {}
  }

  // Fallback: check x-admin-email header (legacy approach)
  const adminEmail = req.headers['x-admin-email'];
  const adminPassword = req.headers['x-admin-password'];
  if (adminEmail === process.env.ADMIN_EMAIL && adminPassword === process.env.ADMIN_PASSWORD) {
    return next();
  }

  res.status(403).json({ success: false, message: 'Admin access required' });
};

// GET /api/admin/stats — Dashboard statistics
router.get('/stats', adminGuard, async (req, res) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(Date.now() - 7 * 86400000);
    const monthAgo = new Date(Date.now() - 30 * 86400000);

    const [
      totalUsers, activeMembers, totalOrders, revenueData,
      todayVisits, newSignups, todayCheckIns, totalCheckIns,
      activeAnnouncements,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ membership: { $in: ['Basic', 'Pro', 'Premium'] }, status: 'Active' }),
      Order.countDocuments(),
      Order.aggregate([{ $match: { paymentStatus: 'Paid' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      User.countDocuments({ lastLogin: { $gte: today } }),
      User.countDocuments({ createdAt: { $gte: weekAgo } }),
      Attendance.countDocuments({ date: today.toISOString().split('T')[0] }),
      Attendance.countDocuments(),
      Announcement.countDocuments({ isActive: true }),
    ]);

    // Monthly revenue trend (last 6 months)
    const revenueByMonth = await Order.aggregate([
      { $match: { paymentStatus: 'Paid', orderDate: { $gte: monthAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$orderDate' } }, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // User growth trend (last 7 days)
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: weekAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Membership distribution
    const membershipDist = await User.aggregate([
      { $group: { _id: '$membership', count: { $sum: 1 } } },
    ]);

    // Top earners (gamification leaderboard preview)
    const topMembers = await User.find({ role: { $in: ['member', 'user'] } })
      .select('name points currentStreak badges')
      .sort({ points: -1 })
      .limit(5)
      .lean();

    res.json({
      success: true,
      data: {
        totalUsers,
        activeMembers,
        totalOrders,
        revenue: revenueData[0]?.total || 0,
        todayVisits,
        newSignups,
        todayCheckIns,
        totalCheckIns,
        activeAnnouncements,
        revenueByMonth,
        userGrowth,
        membershipDist,
        topMembers,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching statistics', error: error.message });
  }
});

// GET /api/admin/users
router.get('/users', adminGuard, async (req, res) => {
  try {
    const { search, role, membership, status, page = 1, limit = 100 } = req.query;
    const query = {};
    if (role) query.role = role;
    if (membership) query.membership = membership;
    if (status) query.status = status;
    if (search) query.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
    ];

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);
    res.json({ success: true, data: users, total });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching users', error: error.message });
  }
});

// GET /api/admin/users/recent
router.get('/users/recent', adminGuard, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).limit(10);
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error', error: error.message });
  }
});

// GET /api/admin/orders
router.get('/orders', adminGuard, async (req, res) => {
  try {
    const { status, paymentStatus, page = 1, limit = 100 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const orders = await Order.find(query)
      .sort({ orderDate: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);
    res.json({ success: true, data: orders, total });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error', error: error.message });
  }
});

// GET /api/admin/orders/recent
router.get('/orders/recent', adminGuard, async (req, res) => {
  try {
    const orders = await Order.find().sort({ orderDate: -1 }).limit(10);
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error', error: error.message });
  }
});

// GET /api/admin/memberships
router.get('/memberships', adminGuard, async (req, res) => {
  try {
    const memberships = await Membership.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: memberships });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error', error: error.message });
  }
});

// PATCH /api/admin/users/:id/status
router.patch('/users/:id/status', adminGuard, async (req, res) => {
  try {
    const { status, role } = req.body;
    const updates = {};
    if (status) updates.status = status;
    if (role) updates.role = role;

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User updated', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error', error: error.message });
  }
});

// PATCH /api/admin/orders/:id/status
router.patch('/orders/:id/status', adminGuard, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, message: 'Order status updated', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error', error: error.message });
  }
});

// GET /api/admin/classes/enrolled
router.get('/classes/enrolled', adminGuard, async (req, res) => {
  try {
    const classes = await Class.find().select('name instructor enrolled capacity schedule').sort({ enrolled: -1 });
    res.json({ success: true, data: classes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error', error: error.message });
  }
});

// GET /api/admin/attendance — Daily attendance overview
router.get('/attendance', adminGuard, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const records = await Attendance.find({ date: targetDate })
      .populate('userId', 'name email membership')
      .sort({ checkInTime: -1 })
      .lean();

    // Last 30 days stats
    const trend = await Attendance.aggregate([
      { $match: { checkInTime: { $gte: new Date(Date.now() - 30 * 86400000) } } },
      { $group: { _id: '$date', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, data: { records, total: records.length, trend } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error', error: error.message });
  }
});

// POST /api/admin/announcements — Quick announcement
router.post('/announcements', adminGuard, async (req, res) => {
  try {
    const adminUser = req.user || await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (!adminUser) return res.status(400).json({ success: false, message: 'Admin user not found' });

    const announcement = await Announcement.create({
      ...req.body,
      authorId: adminUser._id,
      gymId: null, // platform-wide
    });
    res.status(201).json({ success: true, data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error', error: error.message });
  }
});

// PATCH /api/admin/users/:id/role — Change user role
router.patch('/users/:id/role', adminGuard, async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['member', 'trainer', 'gym_admin', 'super_admin', 'user', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user, message: `Role updated to ${role}` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error', error: error.message });
  }
});

module.exports = router;
