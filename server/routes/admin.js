const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Class = require('../models/Class');
const Membership = require('../models/Membership');
const Attendance = require('../models/Attendance');
const Announcement = require('../models/Announcement');
const Contact = require('../models/Contact');
const AuditLog = require('../models/AuditLog');
const TrainerBooking = require('../models/TrainerBooking');
const Gym = require('../models/Gym');
const Notification = require('../models/Notification');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Helper: require admin (legacy OR token-based)
const adminGuard = async (req, res, next) => {
  // Try token auth first
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
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

// GET /api/admin/kpis — Business KPI metrics (MRR, churn, retention, conversion)
router.get('/kpis', adminGuard, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // MRR pricing map (monthly equivalents in INR)
    const PLAN_MONTHLY_PRICE = { Basic: 999, Pro: 1999, Premium: 3999 };

    const [
      totalUsers,
      activeMembers,
      newThisMonth,
      newLastMonth,
      activeLastMonth,
      churned,
      dailyActive,
      weeklyActive,
      orderRevenue,
      membershipRevenue,
    ] = await Promise.all([
      User.countDocuments({ role: { $in: ['member', 'user'] } }),
      User.find({ membership: { $in: ['Basic', 'Pro', 'Premium'] }, status: 'Active' }).select('membership').lean(),
      User.countDocuments({ createdAt: { $gte: startOfMonth } }),
      User.countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: startOfMonth } }),
      User.countDocuments({ membership: { $in: ['Basic', 'Pro', 'Premium'] }, status: 'Active', createdAt: { $lt: startOfMonth } }),
      User.countDocuments({ membership: 'None', updatedAt: { $gte: startOfMonth } }),
      User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 86400000) } }),
      User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 7 * 86400000) } }),
      Order.aggregate([{ $match: { paymentStatus: 'Paid' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Membership.aggregate([{ $match: { paymentStatus: 'paid', status: 'active' } }, { $group: { _id: null, total: { $sum: '$price' } } }]),
    ]);

    // MRR calculation
    const mrr = activeMembers.reduce((sum, m) => sum + (PLAN_MONTHLY_PRICE[m.membership] || 0), 0);
    const arr = mrr * 12;

    // Churn rate
    const churnRate = activeLastMonth > 0 ? Math.round((churned / activeLastMonth) * 1000) / 10 : 0;
    const retentionRate = Math.round((100 - churnRate) * 10) / 10;

    // Conversion rate (free users → paid members)
    const conversionRate = totalUsers > 0 ? Math.round((activeMembers.length / totalUsers) * 1000) / 10 : 0;

    // ARPU
    const totalRevenue = (orderRevenue[0]?.total || 0) + (membershipRevenue[0]?.total || 0);
    const arpu = totalUsers > 0 ? Math.round(totalRevenue / totalUsers) : 0;

    // DAU/MAU ratio
    const mau = weeklyActive;
    const dauMauRatio = mau > 0 ? Math.round((dailyActive / mau) * 1000) / 10 : 0;

    // Growth rate (MoM)
    const growthRate = newLastMonth > 0 ? Math.round(((newThisMonth - newLastMonth) / newLastMonth) * 1000) / 10 : 0;

    // Monthly cohort data (last 6 months)
    const cohorts = await Promise.all(
      Array.from({ length: 6 }, (_, i) => {
        const start = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        const end = new Date(now.getFullYear(), now.getMonth() - (4 - i), 0);
        return User.countDocuments({ createdAt: { $gte: start, $lte: end } }).then(count => ({
          month: start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          users: count,
        }));
      })
    );

    // Revenue by plan
    const revenueByPlan = {};
    activeMembers.forEach(m => {
      revenueByPlan[m.membership] = (revenueByPlan[m.membership] || 0) + (PLAN_MONTHLY_PRICE[m.membership] || 0);
    });

    res.json({
      success: true,
      data: {
        mrr,
        arr,
        churnRate,
        retentionRate,
        conversionRate,
        arpu,
        dauMauRatio,
        dailyActive,
        weeklyActive,
        growthRate,
        newThisMonth,
        newLastMonth,
        activeMemberCount: activeMembers.length,
        totalRevenue,
        cohorts,
        revenueByPlan,
        planBreakdown: {
          Basic: activeMembers.filter(m => m.membership === 'Basic').length,
          Pro: activeMembers.filter(m => m.membership === 'Pro').length,
          Premium: activeMembers.filter(m => m.membership === 'Premium').length,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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

/* ═══════════════════════════════════════════════════════════
   MEMBERSHIP OPERATIONS
═══════════════════════════════════════════════════════════ */

// GET /api/admin/memberships/stats
router.get('/memberships/stats', adminGuard, async (req, res) => {
  try {
    const [byPlan, byStatus, totalRevenue, avgDuration] = await Promise.all([
      Membership.aggregate([{ $group: { _id: '$plan', count: { $sum: 1 }, revenue: { $sum: '$price' } } }]),
      Membership.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Membership.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$price' } } }]),
      Membership.aggregate([{ $match: { status: 'active' } }, { $group: { _id: null, avg: { $avg: '$price' } } }]),
    ]);
    res.json({ success: true, data: { byPlan, byStatus, totalRevenue: totalRevenue[0]?.total || 0, avgRevenue: avgDuration[0]?.avg || 0 } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/admin/memberships/expiring?days=30
router.get('/memberships/expiring', adminGuard, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const cutoff = new Date(Date.now() + days * 86400000);
    const memberships = await Membership.find({
      status: 'active',
      endDate: { $exists: true, $lte: cutoff, $gte: new Date() },
    }).sort({ endDate: 1 }).limit(200).lean();
    res.json({ success: true, data: memberships, count: memberships.length });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/admin/memberships/full — with pagination + filters
router.get('/memberships/full', adminGuard, async (req, res) => {
  try {
    const { search, plan, status, paymentStatus, page = 1, limit = 50 } = req.query;
    const query = {};
    if (plan) query.plan = plan;
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (search) query.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
    ];
    const [data, total] = await Promise.all([
      Membership.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit)).lean(),
      Membership.countDocuments(query),
    ]);
    res.json({ success: true, data, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PATCH /api/admin/memberships/:id/extend
router.patch('/memberships/:id/extend', adminGuard, async (req, res) => {
  try {
    const { days } = req.body;
    const m = await Membership.findById(req.params.id);
    if (!m) return res.status(404).json({ success: false, message: 'Not found' });
    const base = m.endDate && m.endDate > new Date() ? m.endDate : new Date();
    m.endDate = new Date(base.getTime() + days * 86400000);
    m.status = 'active';
    await m.save();
    res.json({ success: true, data: m, message: `Extended by ${days} days` });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PATCH /api/admin/memberships/:id/cancel
router.patch('/memberships/:id/cancel', adminGuard, async (req, res) => {
  try {
    const m = await Membership.findByIdAndUpdate(req.params.id, { status: 'cancelled' }, { new: true });
    if (!m) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: m });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

/* ═══════════════════════════════════════════════════════════
   REVENUE & FINANCIAL ANALYTICS
═══════════════════════════════════════════════════════════ */

// GET /api/admin/revenue?from=&to=
router.get('/revenue', adminGuard, async (req, res) => {
  try {
    const from = req.query.from ? new Date(req.query.from) : new Date(Date.now() - 90 * 86400000);
    const to = req.query.to ? new Date(req.query.to) : new Date();

    const [ordersByDay, ordersByStatus, topProducts, membershipRevenue, revenueByMethod] = await Promise.all([
      Order.aggregate([
        { $match: { paymentStatus: 'Paid', orderDate: { $gte: from, $lte: to } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$orderDate' } }, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $match: { orderDate: { $gte: from, $lte: to } } },
        { $group: { _id: '$paymentStatus', count: { $sum: 1 }, amount: { $sum: '$totalAmount' } } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'Paid', orderDate: { $gte: from, $lte: to } } },
        { $unwind: '$items' },
        { $group: { _id: '$items.productName', qty: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
        { $sort: { revenue: -1 } },
        { $limit: 10 },
      ]),
      Membership.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: from, $lte: to } } },
        { $group: { _id: '$plan', count: { $sum: 1 }, revenue: { $sum: '$price' } } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'Paid', orderDate: { $gte: from, $lte: to } } },
        { $group: { _id: '$paymentMethod', count: { $sum: 1 }, amount: { $sum: '$totalAmount' } } },
        { $sort: { amount: -1 } },
      ]),
    ]);

    const totalOrderRevenue = ordersByStatus.find(s => s._id === 'Paid')?.amount || 0;
    const totalMembershipRevenue = membershipRevenue.reduce((s, r) => s + r.revenue, 0);

    res.json({
      success: true,
      data: {
        ordersByDay,
        ordersByStatus,
        topProducts,
        membershipRevenue,
        revenueByMethod,
        summary: {
          totalOrderRevenue,
          totalMembershipRevenue,
          grandTotal: totalOrderRevenue + totalMembershipRevenue,
          from: from.toISOString(),
          to: to.toISOString(),
        },
      },
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

/* ═══════════════════════════════════════════════════════════
   USER LIFECYCLE MANAGEMENT
═══════════════════════════════════════════════════════════ */

// GET /api/admin/users/lifecycle — segments: new, active, dormant, churned, at-risk
router.get('/users/lifecycle', adminGuard, async (req, res) => {
  try {
    const now = new Date();
    const d7 = new Date(now - 7 * 86400000);
    const d30 = new Date(now - 30 * 86400000);
    const d60 = new Date(now - 60 * 86400000);
    const d90 = new Date(now - 90 * 86400000);

    const [newUsers, activeUsers, dormant30, dormant60, dormant90, neverLoggedIn, completedOnboarding] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: d7 } }),
      User.countDocuments({ lastLogin: { $gte: d30 }, membership: { $in: ['Basic', 'Pro', 'Premium'] } }),
      User.countDocuments({ lastLogin: { $lt: d30, $gte: d60 }, membership: { $in: ['Basic', 'Pro', 'Premium'] } }),
      User.countDocuments({ lastLogin: { $lt: d60, $gte: d90 }, membership: { $in: ['Basic', 'Pro', 'Premium'] } }),
      User.countDocuments({ lastLogin: { $lt: d90 }, membership: { $in: ['Basic', 'Pro', 'Premium'] } }),
      User.countDocuments({ lastLogin: null, createdAt: { $lt: d7 } }),
      User.countDocuments({ onboardingCompleted: true }),
    ]);

    res.json({ success: true, data: { newUsers, activeUsers, dormant30, dormant60, dormant90, neverLoggedIn, completedOnboarding } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/admin/users/dormant?days=30
router.get('/users/dormant', adminGuard, async (req, res) => {
  try {
    const { days = 30, page = 1, limit = 50, membership } = req.query;
    const cutoff = new Date(Date.now() - parseInt(days) * 86400000);
    const query = {
      $or: [{ lastLogin: { $lt: cutoff } }, { lastLogin: null }],
    };
    if (membership) query.membership = membership;

    const [data, total] = await Promise.all([
      User.find(query).select('-password').sort({ lastLogin: 1 }).skip((page - 1) * limit).limit(parseInt(limit)).lean(),
      User.countDocuments(query),
    ]);
    res.json({ success: true, data, total });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/admin/users/:id/timeline
router.get('/users/:id/timeline', adminGuard, async (req, res) => {
  try {
    const userId = req.params.id;
    const [user, orders, memberships, bookings, attendance] = await Promise.all([
      User.findById(userId).select('-password').lean(),
      Order.find({ userId }).sort({ orderDate: -1 }).limit(10).lean(),
      Membership.find({ email: (await User.findById(userId).select('email').lean())?.email }).sort({ createdAt: -1 }).lean(),
      TrainerBooking.find({ memberId: userId }).sort({ createdAt: -1 }).limit(10).lean(),
      Attendance.find({ userId }).sort({ checkInTime: -1 }).limit(10).lean(),
    ]);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: { user, orders, memberships, bookings, attendance } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

/* ═══════════════════════════════════════════════════════════
   CRM & LEAD MANAGEMENT
═══════════════════════════════════════════════════════════ */

// GET /api/admin/leads
router.get('/leads', adminGuard, async (req, res) => {
  try {
    const { search, status, category, priority, page = 1, limit = 50 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (search) query.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { message: new RegExp(search, 'i') },
    ];
    const [data, total] = await Promise.all([
      Contact.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit)).lean(),
      Contact.countDocuments(query),
    ]);
    res.json({ success: true, data, total });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/admin/leads/stats
router.get('/leads/stats', adminGuard, async (req, res) => {
  try {
    const [byStatus, byCategory, recent] = await Promise.all([
      Contact.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Contact.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      Contact.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 86400000) } }),
    ]);
    res.json({ success: true, data: { byStatus, byCategory, recent } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PATCH /api/admin/leads/:id
router.patch('/leads/:id', adminGuard, async (req, res) => {
  try {
    const updates = {};
    ['status', 'priority', 'category', 'assignedTo', 'adminNotes', 'response'].forEach(k => {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    });
    if (req.body.status === 'resolved') updates.resolvedAt = new Date();
    if (req.body.response) updates.respondedAt = new Date();
    const doc = await Contact.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: doc });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

/* ═══════════════════════════════════════════════════════════
   TRAINER OPERATIONS
═══════════════════════════════════════════════════════════ */

// GET /api/admin/trainer-ops/overview
router.get('/trainer-ops/overview', adminGuard, async (req, res) => {
  try {
    const [trainers, bookingsByStatus, bookingsByType, topTrainers, recentBookings] = await Promise.all([
      User.find({ role: 'trainer' }).select('-password').lean(),
      TrainerBooking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      TrainerBooking.aggregate([{ $group: { _id: '$sessionType', count: { $sum: 1 }, revenue: { $sum: '$amount' } } }]),
      TrainerBooking.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: '$trainerId', sessions: { $sum: 1 }, revenue: { $sum: '$amount' } } },
        { $sort: { sessions: -1 } },
        { $limit: 5 },
      ]),
      TrainerBooking.find().sort({ createdAt: -1 }).limit(20)
        .populate('memberId', 'name email')
        .populate('trainerId', 'name email specialization')
        .lean(),
    ]);
    res.json({ success: true, data: { trainers, bookingsByStatus, bookingsByType, topTrainers, recentBookings } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/admin/trainer-ops/bookings?trainerId=&status=&from=&to=
router.get('/trainer-ops/bookings', adminGuard, async (req, res) => {
  try {
    const { trainerId, status, from, to, page = 1, limit = 50 } = req.query;
    const query = {};
    if (trainerId) query.trainerId = trainerId;
    if (status) query.status = status;
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = from;
      if (to) query.date.$lte = to;
    }
    const [data, total] = await Promise.all([
      TrainerBooking.find(query).sort({ createdAt: -1 })
        .populate('memberId', 'name email').populate('trainerId', 'name email specialization')
        .skip((page - 1) * limit).limit(parseInt(limit)).lean(),
      TrainerBooking.countDocuments(query),
    ]);
    res.json({ success: true, data, total });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PATCH /api/admin/trainer-ops/bookings/:id
router.patch('/trainer-ops/bookings/:id', adminGuard, async (req, res) => {
  try {
    const b = await TrainerBooking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!b) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: b });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

/* ═══════════════════════════════════════════════════════════
   CLASS & CAPACITY MANAGEMENT
═══════════════════════════════════════════════════════════ */

// GET /api/admin/class-ops/capacity
router.get('/class-ops/capacity', adminGuard, async (req, res) => {
  try {
    const classes = await Class.find().sort({ 'schedule.day': 1, 'schedule.time': 1 }).lean();
    const withCapacity = classes.map(c => ({
      ...c,
      fillRate: c.capacity > 0 ? Math.round((c.enrolled / c.capacity) * 100) : 0,
      available: Math.max(0, (c.capacity || 0) - (c.enrolled || 0)),
      status: c.enrolled >= c.capacity ? 'full' : c.enrolled / c.capacity >= 0.8 ? 'almost_full' : 'available',
    }));
    const stats = {
      total: classes.length,
      full: withCapacity.filter(c => c.status === 'full').length,
      almostFull: withCapacity.filter(c => c.status === 'almost_full').length,
      totalEnrollments: classes.reduce((s, c) => s + (c.enrolled || 0), 0),
      totalCapacity: classes.reduce((s, c) => s + (c.capacity || 0), 0),
    };
    res.json({ success: true, data: withCapacity, stats });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/admin/class-ops/performance
router.get('/class-ops/performance', adminGuard, async (req, res) => {
  try {
    const classes = await Class.find().lean();
    const performance = classes.map(c => ({
      _id: c._id,
      name: c.name,
      instructor: c.instructor,
      level: c.level,
      schedule: c.schedule,
      enrolled: c.enrolled || 0,
      capacity: c.capacity || 0,
      fillRate: c.capacity > 0 ? Math.round(((c.enrolled || 0) / c.capacity) * 100) : 0,
      isActive: c.isActive,
    })).sort((a, b) => b.fillRate - a.fillRate);
    res.json({ success: true, data: performance });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PATCH /api/admin/class-ops/:id
router.patch('/class-ops/:id', adminGuard, async (req, res) => {
  try {
    const cls = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cls) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: cls });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

/* ═══════════════════════════════════════════════════════════
   MULTI-BRANCH GYM MANAGEMENT
═══════════════════════════════════════════════════════════ */

// GET /api/admin/branches
router.get('/branches', adminGuard, async (req, res) => {
  try {
    const { status, plan, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (plan) query.plan = plan;
    if (search) query.$or = [{ name: new RegExp(search, 'i') }, { 'address.city': new RegExp(search, 'i') }];
    const gyms = await Gym.find(query).sort({ createdAt: -1 }).lean();

    // Attach member/trainer counts
    const withCounts = await Promise.all(gyms.map(async g => {
      const [members, trainers] = await Promise.all([
        User.countDocuments({ gymId: g._id, role: { $in: ['member', 'user'] } }),
        User.countDocuments({ gymId: g._id, role: 'trainer' }),
      ]);
      return { ...g, memberCount: members, trainerCount: trainers };
    }));
    res.json({ success: true, data: withCounts });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/admin/branches
router.post('/branches', adminGuard, async (req, res) => {
  try {
    const adminUser = req.user || await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (!adminUser) return res.status(400).json({ success: false, message: 'Admin user not found' });
    const gym = await Gym.create({ ...req.body, adminId: adminUser._id });
    res.status(201).json({ success: true, data: gym });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PATCH /api/admin/branches/:id
router.patch('/branches/:id', adminGuard, async (req, res) => {
  try {
    const gym = await Gym.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!gym) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: gym });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

/* ═══════════════════════════════════════════════════════════
   NOTIFICATION CENTER
═══════════════════════════════════════════════════════════ */

// GET /api/admin/notify/announcements
router.get('/notify/announcements', adminGuard, async (req, res) => {
  try {
    const { status, type, page = 1, limit = 50 } = req.query;
    const query = {};
    if (status === 'active') query.isActive = true;
    if (type) query.type = type;
    const [data, total] = await Promise.all([
      Announcement.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit)).lean(),
      Announcement.countDocuments(query),
    ]);
    res.json({ success: true, data, total });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/admin/notify/stats
router.get('/notify/stats', adminGuard, async (req, res) => {
  try {
    const [totalNotifications, unreadNotifications, announcementTypes, recentAnns] = await Promise.all([
      Notification.countDocuments(),
      Notification.countDocuments({ read: false }),
      Announcement.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
      Announcement.find().sort({ createdAt: -1 }).limit(5).lean(),
    ]);
    res.json({ success: true, data: { totalNotifications, unreadNotifications, announcementTypes, recentAnns } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/admin/notify/broadcast
router.post('/notify/broadcast', adminGuard, async (req, res) => {
  try {
    const adminUser = req.user || await User.findOne({ email: process.env.ADMIN_EMAIL });
    const announcement = await Announcement.create({ ...req.body, authorId: adminUser?._id, gymId: req.body.gymId || null });
    // If targeting all members, create notifications in bulk
    if (!req.body.gymId) {
      const members = await User.find({ role: { $in: ['member', 'user'] } }).select('_id').lean();
      const notifications = members.map(m => ({
        userId: m._id,
        type: 'system',
        title: req.body.title,
        message: req.body.content,
        data: { announcementId: announcement._id },
      }));
      if (notifications.length > 0) {
        await Notification.insertMany(notifications, { ordered: false }).catch(() => {});
      }
    }
    res.status(201).json({ success: true, data: announcement });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PATCH /api/admin/notify/announcements/:id
router.patch('/notify/announcements/:id', adminGuard, async (req, res) => {
  try {
    const ann = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ann) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: ann });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

/* ═══════════════════════════════════════════════════════════
   SUPPORT DESK
═══════════════════════════════════════════════════════════ */

// GET /api/admin/support/tickets
router.get('/support/tickets', adminGuard, async (req, res) => {
  try {
    const { search, status, category, priority, page = 1, limit = 50 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (search) query.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { message: new RegExp(search, 'i') },
    ];
    const [data, total, stats] = await Promise.all([
      Contact.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit)).lean(),
      Contact.countDocuments(query),
      Contact.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);
    res.json({ success: true, data, total, stats });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PATCH /api/admin/support/tickets/:id
router.patch('/support/tickets/:id', adminGuard, async (req, res) => {
  try {
    const updates = {};
    ['status', 'priority', 'category', 'assignedTo', 'adminNotes'].forEach(k => {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    });
    if (req.body.status === 'resolved') updates.resolvedAt = new Date();
    const doc = await Contact.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: doc });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/admin/support/tickets/:id/respond
router.post('/support/tickets/:id/respond', adminGuard, async (req, res) => {
  try {
    const { response } = req.body;
    const doc = await Contact.findByIdAndUpdate(
      req.params.id,
      { response, respondedAt: new Date(), status: 'resolved' },
      { new: true }
    );
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: doc });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

/* ═══════════════════════════════════════════════════════════
   AUDIT & COMPLIANCE LOGS
═══════════════════════════════════════════════════════════ */

// GET /api/admin/audit-logs?action=&resource=&status=&from=&to=
router.get('/audit-logs', adminGuard, async (req, res) => {
  try {
    const { action, resource, status, from, to, page = 1, limit = 100 } = req.query;
    const query = {};
    if (action) query.action = new RegExp(action, 'i');
    if (resource) query.resource = resource;
    if (status) query.status = status;
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }
    const [data, total, byAction, byResource] = await Promise.all([
      AuditLog.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit)).lean(),
      AuditLog.countDocuments(query),
      AuditLog.aggregate([{ $group: { _id: '$action', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 }]),
      AuditLog.aggregate([{ $group: { _id: '$resource', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    ]);
    res.json({ success: true, data, total, byAction, byResource });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

/* ═══════════════════════════════════════════════════════════
   REPORTING & EXPORTS (CSV)
═══════════════════════════════════════════════════════════ */

const toCSV = (rows, cols) => {
  const header = cols.map(c => c.label).join(',');
  const body = rows.map(r => cols.map(c => {
    const v = c.fn ? c.fn(r) : (r[c.key] ?? '');
    return `"${String(v).replace(/"/g, '""')}"`;
  }).join(',')).join('\n');
  return `${header}\n${body}`;
};

// GET /api/admin/exports/memberships
router.get('/exports/memberships', adminGuard, async (req, res) => {
  try {
    const { from, to, status, plan } = req.query;
    const query = {};
    if (status) query.status = status;
    if (plan) query.plan = plan;
    if (from || to) { query.createdAt = {}; if (from) query.createdAt.$gte = new Date(from); if (to) query.createdAt.$lte = new Date(to); }
    const data = await Membership.find(query).sort({ createdAt: -1 }).lean();
    const csv = toCSV(data, [
      { label: 'Name', key: 'name' }, { label: 'Email', key: 'email' }, { label: 'Phone', key: 'phone' },
      { label: 'Plan', key: 'plan' }, { label: 'Duration', key: 'duration' }, { label: 'Price', key: 'price' },
      { label: 'Status', key: 'status' }, { label: 'Payment', key: 'paymentStatus' },
      { label: 'Start Date', fn: r => r.startDate ? new Date(r.startDate).toLocaleDateString() : '' },
      { label: 'End Date', fn: r => r.endDate ? new Date(r.endDate).toLocaleDateString() : '' },
      { label: 'Created', fn: r => new Date(r.createdAt).toLocaleDateString() },
    ]);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="memberships.csv"');
    res.send(csv);
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/admin/exports/users
router.get('/exports/users', adminGuard, async (req, res) => {
  try {
    const { role, membership, status } = req.query;
    const query = {};
    if (role) query.role = role;
    if (membership) query.membership = membership;
    if (status) query.status = status;
    const data = await User.find(query).select('-password').lean();
    const csv = toCSV(data, [
      { label: 'Name', key: 'name' }, { label: 'Email', key: 'email' }, { label: 'Phone', key: 'phone' },
      { label: 'Role', key: 'role' }, { label: 'Membership', key: 'membership' }, { label: 'Status', key: 'status' },
      { label: 'Points', key: 'points' }, { label: 'Streak', key: 'currentStreak' },
      { label: 'Last Login', fn: r => r.lastLogin ? new Date(r.lastLogin).toLocaleDateString() : 'Never' },
      { label: 'Joined', fn: r => new Date(r.createdAt).toLocaleDateString() },
    ]);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
    res.send(csv);
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/admin/exports/orders
router.get('/exports/orders', adminGuard, async (req, res) => {
  try {
    const { paymentStatus, from, to } = req.query;
    const query = {};
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (from || to) { query.orderDate = {}; if (from) query.orderDate.$gte = new Date(from); if (to) query.orderDate.$lte = new Date(to); }
    const data = await Order.find(query).sort({ orderDate: -1 }).lean();
    const csv = toCSV(data, [
      { label: 'Order ID', fn: r => String(r._id).slice(-8) }, { label: 'Customer', key: 'userName' },
      { label: 'Email', key: 'userEmail' }, { label: 'Items', fn: r => r.items?.length || 0 },
      { label: 'Total', key: 'totalAmount' }, { label: 'Payment', key: 'paymentStatus' },
      { label: 'Status', key: 'status' }, { label: 'Method', key: 'paymentMethod' },
      { label: 'Date', fn: r => new Date(r.orderDate || r.createdAt).toLocaleDateString() },
    ]);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="orders.csv"');
    res.send(csv);
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/admin/exports/attendance
router.get('/exports/attendance', adminGuard, async (req, res) => {
  try {
    const { from, to } = req.query;
    const query = {};
    if (from || to) { query.checkInTime = {}; if (from) query.checkInTime.$gte = new Date(from); if (to) query.checkInTime.$lte = new Date(to); }
    const data = await Attendance.find(query).populate('userId', 'name email membership').sort({ checkInTime: -1 }).limit(5000).lean();
    const csv = toCSV(data, [
      { label: 'Member', fn: r => r.userId?.name || '' }, { label: 'Email', fn: r => r.userId?.email || '' },
      { label: 'Membership', fn: r => r.userId?.membership || '' }, { label: 'Date', key: 'date' },
      { label: 'Check In', fn: r => r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString() : '' },
      { label: 'Check Out', fn: r => r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString() : '' },
      { label: 'Duration (min)', key: 'duration' }, { label: 'Method', key: 'method' },
    ]);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="attendance.csv"');
    res.send(csv);
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

/* ═══════════════════════════════════════════════════════════
   RETENTION & CHURN ANALYTICS
═══════════════════════════════════════════════════════════ */

// GET /api/admin/retention/overview
router.get('/retention/overview', adminGuard, async (req, res) => {
  try {
    const now = new Date();
    const PLAN_MONTHLY_PRICE = { Basic: 999, Pro: 1999, Premium: 3999 };
    const months = Array.from({ length: 6 }, (_, i) => {
      const start = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const end = new Date(now.getFullYear(), now.getMonth() - (4 - i), 0);
      return { start, end, label: start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) };
    });

    const cohortData = await Promise.all(months.map(async m => {
      const [newUsers, retained, churned] = await Promise.all([
        User.countDocuments({ createdAt: { $gte: m.start, $lte: m.end } }),
        User.countDocuments({ createdAt: { $gte: m.start, $lte: m.end }, membership: { $in: ['Basic', 'Pro', 'Premium'] }, status: 'Active' }),
        User.countDocuments({ createdAt: { $gte: m.start, $lte: m.end }, membership: 'None' }),
      ]);
      return { month: m.label, newUsers, retained, churned, retentionRate: newUsers > 0 ? Math.round((retained / newUsers) * 100) : 0 };
    }));

    // At-risk: active members who haven't checked in for 14+ days
    const atRiskCutoff = new Date(Date.now() - 14 * 86400000);
    const atRisk = await User.find({
      membership: { $in: ['Basic', 'Pro', 'Premium'] },
      status: 'Active',
      $or: [{ lastLogin: { $lt: atRiskCutoff } }, { lastLogin: null }],
    }).select('-password').limit(100).lean();

    // LTV calculation
    const activeMembers = await User.find({ membership: { $in: ['Basic', 'Pro', 'Premium'] }, status: 'Active' }).select('membership createdAt').lean();
    const avgLTV = activeMembers.length > 0 ? Math.round(
      activeMembers.reduce((sum, m) => {
        const monthsActive = Math.max(1, Math.round((Date.now() - new Date(m.createdAt)) / (30 * 86400000)));
        return sum + (PLAN_MONTHLY_PRICE[m.membership] || 0) * monthsActive;
      }, 0) / activeMembers.length
    ) : 0;

    res.json({ success: true, data: { cohortData, atRisk, atRiskCount: atRisk.length, avgLTV, activeMemberCount: activeMembers.length } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/admin/retention/at-risk
router.get('/retention/at-risk', adminGuard, async (req, res) => {
  try {
    const { days = 14, page = 1, limit = 50 } = req.query;
    const cutoff = new Date(Date.now() - parseInt(days) * 86400000);
    const query = {
      membership: { $in: ['Basic', 'Pro', 'Premium'] },
      status: 'Active',
      $or: [{ lastLogin: { $lt: cutoff } }, { lastLogin: null }],
    };
    const [data, total] = await Promise.all([
      User.find(query).select('-password').sort({ lastLogin: 1 }).skip((page - 1) * limit).limit(parseInt(limit)).lean(),
      User.countDocuments(query),
    ]);
    res.json({ success: true, data, total });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

/* ═══════════════════════════════════════════════════════════
   RAZORPAY OPERATIONS CENTER
═══════════════════════════════════════════════════════════ */

// GET /api/admin/payments/overview
router.get('/payments/overview', adminGuard, async (req, res) => {
  try {
    const { from, to, status, method, page = 1, limit = 50 } = req.query;
    const query = {};
    if (status) query.paymentStatus = status;
    if (method) query.paymentMethod = method;
    if (from || to) {
      query.orderDate = {};
      if (from) query.orderDate.$gte = new Date(from);
      if (to) query.orderDate.$lte = new Date(to);
    }

    const [data, total, byStatus, byMethod, summary] = await Promise.all([
      Order.find(query).sort({ orderDate: -1 }).skip((page - 1) * limit).limit(parseInt(limit)).lean(),
      Order.countDocuments(query),
      Order.aggregate([{ $group: { _id: '$paymentStatus', count: { $sum: 1 }, amount: { $sum: '$totalAmount' } } }]),
      Order.aggregate([{ $match: { paymentStatus: 'Paid' } }, { $group: { _id: '$paymentMethod', count: { $sum: 1 }, amount: { $sum: '$totalAmount' } } }, { $sort: { amount: -1 } }]),
      Order.aggregate([
        { $group: {
          _id: null,
          totalPaid: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'Paid'] }, '$totalAmount', 0] } },
          totalRefunded: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'Refunded'] }, '$totalAmount', 0] } },
          totalFailed: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'Failed'] }, '$totalAmount', 0] } },
          totalPending: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'Pending'] }, '$totalAmount', 0] } },
        }},
      ]),
    ]);

    res.json({ success: true, data, total, byStatus, byMethod, summary: summary[0] || {} });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PATCH /api/admin/payments/:id/refund — Mark as refunded (operational tracking)
router.patch('/payments/:id/refund', adminGuard, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus: 'Refunded', status: 'Cancelled' },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order, message: 'Marked as refunded' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
