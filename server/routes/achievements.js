const express = require('express');
const router = express.Router();
const { Achievement, UserAchievement } = require('../models/Achievement');
const User = require('../models/User');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const { getLeaderboard, checkAchievements } = require('../services/gamificationService');

// GET /api/achievements - Get all achievements catalog
router.get('/', async (req, res) => {
  try {
    const achievements = await Achievement.find({ isActive: true }).lean();
    res.json({ success: true, data: achievements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/achievements/my - Get my earned achievements
router.get('/my', verifyToken, async (req, res) => {
  try {
    const earned = await UserAchievement.find({ userId: req.user._id })
      .sort({ earnedAt: -1 })
      .lean();

    const allAchievements = await Achievement.find({ isActive: true }).lean();
    const earnedKeys = new Set(earned.map(e => e.achievementKey));

    const enriched = allAchievements.map(ach => ({
      ...ach,
      earned: earnedKeys.has(ach.key),
      earnedAt: earned.find(e => e.achievementKey === ach.key)?.earnedAt || null,
    }));

    const user = await User.findById(req.user._id).select('points currentStreak longestStreak level badges');

    res.json({
      success: true,
      data: enriched,
      stats: {
        totalEarned: earned.length,
        totalAvailable: allAchievements.length,
        points: user.points,
        level: Math.floor(user.points / 100) + 1,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/achievements/leaderboard - Global or gym leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { gymId, limit = 20, period } = req.query;
    const leaderboard = await getLeaderboard(gymId, period, parseInt(limit));
    res.json({ success: true, data: leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/achievements/leaderboard/my-rank - Get my rank
router.get('/leaderboard/my-rank', verifyToken, async (req, res) => {
  try {
    const myPoints = req.user.points;
    const rank = await User.countDocuments({ points: { $gt: myPoints } }) + 1;
    const total = await User.countDocuments({ role: { $in: ['member', 'user', 'trainer'] } });

    res.json({ success: true, data: { rank, total, points: myPoints, percentile: Math.round((1 - rank / total) * 100) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/achievements/check - Manually trigger achievement check
router.post('/check', verifyToken, async (req, res) => {
  try {
    const { Attendance } = require('../models/Attendance');
    const { WorkoutPlan } = require('../models/WorkoutPlan') || {};
    const totalAttendance = await require('../models/Attendance').countDocuments({ userId: req.user._id });
    const unlocked = await checkAchievements(req.user._id, { attendanceCount: totalAttendance });
    res.json({ success: true, data: unlocked, message: `${unlocked.length} new achievements unlocked` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/achievements/user/:userId - Get user achievements (public profile)
router.get('/user/:userId', async (req, res) => {
  try {
    const earned = await UserAchievement.find({ userId: req.params.userId })
      .sort({ earnedAt: -1 })
      .lean();

    const achievements = await Achievement.find({ key: { $in: earned.map(e => e.achievementKey) } }).lean();
    const enriched = earned.map(e => ({
      ...achievements.find(a => a.key === e.achievementKey),
      earnedAt: e.earnedAt,
    }));

    res.json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
