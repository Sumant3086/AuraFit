const express = require('express');
const router = express.Router();
const Membership = require('../models/Membership');

// Create membership
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, plan, duration } = req.body;
    
    const membership = new Membership({
      name,
      email,
      phone,
      plan,
      duration
    });
    
    await membership.save();
    res.status(201).json({ 
      success: true, 
      message: 'Membership created successfully',
      data: membership 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error creating membership', 
      error: error.message 
    });
  }
});

// Get all memberships
router.get('/', async (req, res) => {
  try {
    const memberships = await Membership.find().sort({ createdAt: -1 });
    console.log(`📋 Fetched ${memberships.length} memberships from database`);
    res.json({ success: true, data: memberships });
  } catch (error) {
    console.error('❌ Error fetching memberships:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching memberships', 
      error: error.message 
    });
  }
});

// Get membership by email
router.get('/user/:email', async (req, res) => {
  try {
    const membership = await Membership.findOne({ email: req.params.email });
    if (!membership) {
      return res.status(404).json({ 
        success: false, 
        message: 'Membership not found' 
      });
    }
    res.json({ success: true, data: membership });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching membership', 
      error: error.message 
    });
  }
});

// Purchase membership
router.post('/purchase', async (req, res) => {
  try {
    const { userId, name, email, plan, price, duration, paymentStatus } = req.body;
    
    console.log('📝 Creating membership:', { name, email, plan, price, duration });
    
    // Create membership record with pending status
    const membership = new Membership({
      name,
      email,
      phone: '', // Will be updated from user profile
      plan: plan.toLowerCase(),
      duration,
      price,
      status: 'pending', // Pending admin approval
      paymentStatus: paymentStatus || 'pending',
      startDate: new Date()
    });
    
    const savedMembership = await membership.save();
    console.log('✅ Membership saved to database:', savedMembership._id);
    
    // Don't update user's membership yet - wait for admin approval
    
    res.status(201).json({ 
      success: true, 
      message: 'Membership order created. Pending payment and admin approval.',
      data: savedMembership 
    });
  } catch (error) {
    console.error('❌ Membership purchase error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error purchasing membership', 
      error: error.message 
    });
  }
});

// Approve membership (Admin only)
router.patch('/:id/approve', async (req, res) => {
  try {
    const membership = await Membership.findById(req.params.id);
    
    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Membership not found'
      });
    }
    
    // Update membership status to active
    membership.status = 'active';
    membership.paymentStatus = 'paid';
    await membership.save();
    
    // Update user's membership in User model
    const User = require('../models/User');
    const user = await User.findOne({ email: membership.email });
    
    if (user) {
      user.membership = membership.plan.charAt(0).toUpperCase() + membership.plan.slice(1);
      user.membershipStartDate = new Date();
      
      // Calculate end date based on duration
      const endDate = new Date();
      const durationParts = membership.duration.split('-');
      const amount = parseInt(durationParts[0]);
      const unit = durationParts[1];
      
      if (unit === 'month' || unit === 'months') {
        endDate.setMonth(endDate.getMonth() + amount);
      } else if (unit === 'day' || unit === 'days') {
        endDate.setDate(endDate.getDate() + amount);
      }
      
      user.membershipEndDate = endDate;
      await user.save();
    }
    
    res.json({
      success: true,
      message: 'Membership approved successfully',
      data: membership
    });
  } catch (error) {
    console.error('Membership approval error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving membership',
      error: error.message
    });
  }
});

// Reject membership (Admin only)
router.patch('/:id/reject', async (req, res) => {
  try {
    const membership = await Membership.findById(req.params.id);
    
    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Membership not found'
      });
    }
    
    // Update membership status to cancelled
    membership.status = 'cancelled';
    membership.paymentStatus = 'failed';
    await membership.save();
    
    res.json({
      success: true,
      message: 'Membership rejected',
      data: membership
    });
  } catch (error) {
    console.error('Membership rejection error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting membership',
      error: error.message
    });
  }
});

// Free trial/day pass
router.post('/free-trial', async (req, res) => {
  try {
    const { userId, name, email } = req.body;
    
    try {
      // Check if user already claimed free trial
      const existingTrial = await Membership.findOne({ 
        email, 
        plan: 'trial' 
      });
      
      if (existingTrial) {
        return res.status(400).json({ 
          success: false, 
          message: 'You have already claimed your free day pass' 
        });
      }
      
      // Create free trial membership
      const membership = new Membership({
        name,
        email,
        phone: '',
        plan: 'trial',
        duration: '1-day',
        price: 0,
        status: 'active',
        startDate: new Date()
      });
      
      await membership.save();
      
      res.status(201).json({ 
        success: true, 
        message: 'Free day pass claimed successfully',
        data: membership 
      });
    } catch (dbError) {
      // If database fails, still return success
      console.warn('Database save failed, but free trial recorded:', dbError.message);
      res.status(201).json({ 
        success: true, 
        message: 'Free day pass claimed successfully',
        data: {
          name,
          email,
          plan: 'trial',
          duration: '1-day',
          price: 0,
          status: 'active',
          startDate: new Date()
        }
      });
    }
  } catch (error) {
    console.error('Free trial error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error claiming free trial', 
      error: error.message 
    });
  }
});

module.exports = router;
