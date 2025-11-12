const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Class = require('../models/Class');
const Membership = require('../models/Membership');

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    // Get total users
    const totalUsers = await User.countDocuments();
    
    // Get active members (users with active memberships)
    const activeMembers = await User.countDocuments({
      membership: { $in: ['Basic', 'Pro', 'Premium'] },
      status: 'Active'
    });
    
    // Get total orders
    const totalOrders = await Order.countDocuments();
    
    // Calculate total revenue
    const revenueData = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const revenue = revenueData.length > 0 ? revenueData[0].total : 0;
    
    // Get today's visits (users who logged in today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayVisits = await User.countDocuments({
      lastLogin: { $gte: today }
    });
    
    // Get new signups this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newSignups = await User.countDocuments({
      createdAt: { $gte: weekAgo }
    });
    
    console.log(`📊 Stats: ${totalUsers} users, ${activeMembers} active, ${totalOrders} orders, ₹${revenue} revenue`);
    
    res.json({
      success: true,
      data: {
        totalUsers,
        activeMembers,
        totalOrders,
        revenue,
        todayVisits,
        newSignups
      }
    });
  } catch (error) {
    console.error('❌ Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(100);
    
    console.log(`👥 Admin fetched ${users.length} users`);
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// Get recent users
router.get('/users/recent', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching recent users',
      error: error.message
    });
  }
});

// Get all orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ orderDate: -1 })
      .limit(100);
    
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
});

// Get recent orders
router.get('/orders/recent', async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ orderDate: -1 })
      .limit(10);
    
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching recent orders',
      error: error.message
    });
  }
});

// Get all memberships
router.get('/memberships', async (req, res) => {
  try {
    const memberships = await Membership.find();
    
    res.json({
      success: true,
      data: memberships
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching memberships',
      error: error.message
    });
  }
});

// Update user status
router.patch('/users/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User status updated',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user status',
      error: error.message
    });
  }
});

// Update order status
router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Order status updated',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
});

// Get enrolled classes data
router.get('/classes/enrolled', async (req, res) => {
  try {
    const classes = await Class.find()
      .select('title instructor enrolled capacity schedule')
      .sort({ enrolled: -1 });
    
    res.json({
      success: true,
      data: classes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching class enrollment data',
      error: error.message
    });
  }
});

module.exports = router;
