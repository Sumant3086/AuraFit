const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');
const { awardPoints, checkAchievements, seedAchievements } = require('../services/gamificationService');
const { sendEmail, templates } = require('../services/emailService');

// POST /api/onboarding/complete - Complete onboarding
router.post('/complete', verifyToken, async (req, res) => {
  try {
    const {
      gender, dateOfBirth, fitnessGoal, experienceLevel,
      address, bio, phone, referralCode,
    } = req.body;

    if (req.user.onboardingCompleted) {
      return res.status(400).json({ success: false, message: 'Onboarding already completed' });
    }

    // Process referral if provided
    if (referralCode && referralCode !== req.user.referralCode) {
      const { processReferral } = require('../services/gamificationService');
      await processReferral(referralCode, req.user._id);
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      {
        gender, dateOfBirth, fitnessGoal, experienceLevel,
        address, bio, phone,
        onboardingCompleted: true,
        $inc: { points: 100 }, // Onboarding bonus
      },
      { new: true }
    ).select('-password');

    // Check onboarding achievement
    const unlockedAchievements = await checkAchievements(req.user._id, { onboarding: true });

    // Welcome email
    sendEmail({
      to: updated.email,
      ...templates.welcome(updated.name),
    }).catch(() => {});

    res.json({
      success: true,
      message: 'Onboarding completed! +100 points earned',
      data: updated,
      achievements: unlockedAchievements,
      pointsEarned: 100,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/onboarding/status - Check onboarding status
router.get('/status', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('onboardingCompleted fitnessGoal experienceLevel gender dateOfBirth bio points referralCode');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/onboarding/profile-picture - Update profile picture URL
router.post('/profile-picture', verifyToken, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ success: false, message: 'URL required' });

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { profilePicture: url },
      { new: true }
    ).select('-password');

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
