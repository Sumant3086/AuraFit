const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Create new order
router.post('/', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
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
    const orders = await Order.find({ userEmail: req.params.email })
      .sort({ orderDate: -1 });
    
    console.log(`📦 Fetched ${orders.length} orders for email: ${req.params.email}`);
    
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
