const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { createOrder, verifyPaymentSignature } = require('../services/razorpayService');
require('dotenv').config();

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
    console.log('📝 Creating new order with data:', JSON.stringify(req.body, null, 2));
    
    // Validate required fields
    const { userId, userName, userEmail, items, totalAmount } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }
    
    // Validate each item
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.productName || !item.quantity || !item.price) {
        return res.status(400).json({
          success: false,
          message: `Invalid item at index ${i}: missing required fields`
        });
      }
      
      if (typeof item.price !== 'number' || isNaN(item.price)) {
        return res.status(400).json({
          success: false,
          message: `Invalid price for item ${item.productName}: ${item.price}`
        });
      }
    }
    
    const order = new Order(req.body);
    await order.save();
    
    console.log('✅ Order created successfully:', order._id);
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    console.error('❌ Error creating order:', error);
    
    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors,
        details: error.message
      });
    }
    
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

// Update order status
router.put('/:id/status', async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    
    await order.save();
    
    console.log(`✅ Order ${order._id} status updated: ${status || order.status}, payment: ${paymentStatus || order.paymentStatus}`);
    
    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
});

// Create Razorpay order
router.post('/create-razorpay-order', async (req, res) => {
  try {
    const { amount, orderId } = req.body;
    
    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required'
      });
    }
    
    const result = await createOrder(amount, 'INR', orderId);
    
    if (result.success) {
      res.json({
        success: true,
        data: {
          orderId: result.orderId,
          amount: result.amount,
          currency: result.currency,
          keyId: process.env.RAZORPAY_KEY_ID
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to create Razorpay order',
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Error creating Razorpay order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating Razorpay order',
      error: error.message
    });
  }
});

// Verify Razorpay payment
router.post('/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );
    
    if (isValid) {
      res.json({
        success: true,
        message: 'Payment verified successfully',
        paymentId: razorpay_payment_id
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('❌ Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.message
    });
  }
});

// Get Razorpay configuration
router.get('/payment/razorpay-config', (req, res) => {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    
    if (!keyId) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay configuration not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        keyId: keyId
      }
    });
  } catch (error) {
    console.error('❌ Error getting Razorpay config:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting payment configuration',
      error: error.message
    });
  }
});

// Confirm payment (webhook or manual confirmation)
router.post('/:id/confirm-payment', async (req, res) => {
  try {
    const orderId = req.params.id;
    const { paymentId, paymentStatus = 'Paid' } = req.body;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    order.paymentStatus = paymentStatus;
    order.status = 'Processing';
    
    if (paymentId) {
      order.paymentId = paymentId;
    }
    
    await order.save();
    
    console.log(`✅ Payment confirmed for order ${orderId}`);
    
    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      data: order
    });
  } catch (error) {
    console.error('❌ Error confirming payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming payment',
      error: error.message
    });
  }
});

module.exports = router;
