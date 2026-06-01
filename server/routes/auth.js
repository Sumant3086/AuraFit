const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateTokens, verifyToken, refreshAccessToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/security');
const { processReferral } = require('../services/gamificationService');
const { sendEmail, templates } = require('../services/emailService');
const { recordSession } = require('./sessions');

// POST /api/auth/signup
router.post('/signup', authLimiter, async (req, res) => {
  try {
    const { name, email, password, phone, referralCode } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Check admin credentials (backward compat)
    const isAdmin = email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD;

    const user = await User.create({
      name, email, password: hashedPassword, phone,
      role: isAdmin ? 'admin' : 'member',
    });

    // Process referral after user creation
    if (referralCode) {
      await processReferral(referralCode, user._id).catch(() => {});
    }

    const tokens = generateTokens(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        ...tokens,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          membership: user.membership,
          referralCode: user.referralCode,
          onboardingCompleted: user.onboardingCompleted,
          points: user.points,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error registering user', error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.status === 'Suspended') {
      return res.status(403).json({ success: false, message: 'Account suspended. Contact support.' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Update last login and award daily login points
    await User.findByIdAndUpdate(user._id, {
      lastLogin: new Date(),
      $inc: { points: 5 },
    });

    const tokens = generateTokens(user._id, user.role);

    // Record session in background (non-blocking)
    recordSession(user._id, tokens.refreshToken, req).catch(() => {});

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        ...tokens,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          membership: user.membership,
          gymId: user.gymId,
          referralCode: user.referralCode,
          onboardingCompleted: user.onboardingCompleted,
          points: user.points,
          currentStreak: user.currentStreak,
          badges: user.badges,
          profilePicture: user.profilePicture,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error logging in', error: error.message });
  }
});

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', refreshAccessToken);

// GET /api/auth/me - Get current user
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').lean();
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/verify-email
router.post('/verify-email', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email' });
    }
    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error verifying email' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', authLimiter, async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email and new password required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(user._id, { password: hashedPassword });

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error resetting password' });
  }
});

// PUT /api/auth/profile - Update profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const allowedFields = ['name', 'phone', 'bio', 'address', 'profilePicture', 'emailNotifications', 'pushNotifications', 'fitnessGoal', 'experienceLevel', 'gender', 'dateOfBirth'];
    const updates = {};
    allowedFields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/change-password
router.post('/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(req.user._id, { password: hashedPassword });

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
