const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Get all orders (for testing/admin)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ orderDate: -1 })
      .limit(100);
    
    console.log(`📦 Fetched ${orders.length} total orders`);
    
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('❌ Error fetching all orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
});

// Create new order
router.post('/', async (req, res) => {
  try {
    console.log('📝 Creating new order:', req.body);
    
    const order = new Order(req.body);
    await order.save();
    
    console.log('✅ Order created:', order._id);
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    console.error('❌ Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
});

// Get user orders by userId
router.get('/user/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .sort({ orderDate: -1 });
    
    console.log(`📦 Fetched ${orders.length} orders for user: ${req.params.userId}`);
    
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
});

// Get user orders by email
router.get('/user/email/:email', async (req, res) => {
  try {
    const email = req.params.email;
    console.log(`📦 Fetching orders for email: ${email}`);
    
    const orders = await Order.find({ userEmail: email })
      .sort({ orderDate: -1 });
    
    console.log(`✅ Found ${orders.length} orders for: ${email}`);
    
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('❌ Error fetching orders by email:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
});

module.exports = router;
