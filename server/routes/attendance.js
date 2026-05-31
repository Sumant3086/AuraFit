const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const { verifyToken, verifyAdmin, verifyGymAdmin } = require('../middleware/auth');
const { generateMemberQR, verifyCheckInToken } = require('../services/qrService');
const { updateStreak, checkAchievements } = require('../services/gamificationService');

// GET /api/attendance/qr - Generate QR code for member check-in
router.get('/qr', verifyToken, async (req, res) => {
  try {
    const result = await generateMemberQR(req.user._id.toString(), req.user.gymId?.toString());
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/attendance/scan - Scan QR and check in (trainer/admin scans)
router.post('/scan', verifyToken, async (req, res) => {
  try {
    const { token, userId, gymId, timestamp } = req.body;

    const verification = verifyCheckInToken(token, userId, gymId, timestamp);
    if (!verification.valid) {
      return res.status(400).json({ success: false, message: verification.reason });
    }

    const today = new Date().toISOString().split('T')[0];

    // Prevent duplicate check-in same day
    const existing = await Attendance.findOne({ userId, date: today });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Already checked in today', data: existing });
    }

    const attendance = await Attendance.create({
      userId,
      gymId: gymId || req.user.gymId,
      date: today,
      method: 'qr',
      qrToken: token,
    });

    // Update streak and check achievements
    await updateStreak(userId);
    const totalAttendance = await Attendance.countDocuments({ userId });
    const unlockedAchievements = await checkAchievements(userId, { attendanceCount: totalAttendance });

    res.json({
      success: true,
      message: 'Check-in successful!',
      data: attendance,
      achievements: unlockedAchievements,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/attendance/self-checkin - Member self check-in (app-based)
router.post('/self-checkin', verifyToken, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const existing = await Attendance.findOne({ userId: req.user._id, date: today });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Already checked in today', data: existing });
    }

    const attendance = await Attendance.create({
      userId: req.user._id,
      gymId: req.user.gymId,
      date: today,
      method: 'app',
    });

    const updatedUser = await updateStreak(req.user._id);
    const totalAttendance = await Attendance.countDocuments({ userId: req.user._id });
    const unlockedAchievements = await checkAchievements(req.user._id, { attendanceCount: totalAttendance });

    res.json({
      success: true,
      message: 'Checked in successfully!',
      data: attendance,
      streak: updatedUser?.currentStreak,
      pointsEarned: 10,
      achievements: unlockedAchievements,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/attendance/checkout - Check out
router.post('/checkout', verifyToken, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const attendance = await Attendance.findOne({ userId: req.user._id, date: today, checkOutTime: null });

    if (!attendance) {
      return res.status(404).json({ success: false, message: 'No active check-in found' });
    }

    const checkOutTime = new Date();
    const duration = Math.round((checkOutTime - attendance.checkInTime) / 60000);

    const updated = await Attendance.findByIdAndUpdate(
      attendance._id,
      { checkOutTime, duration },
      { new: true }
    );

    res.json({ success: true, data: updated, duration });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/attendance/my - Get my attendance history
router.get('/my', verifyToken, async (req, res) => {
  try {
    const { limit = 30, page = 1 } = req.query;
    const records = await Attendance.find({ userId: req.user._id })
      .sort({ checkInTime: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const total = await Attendance.countDocuments({ userId: req.user._id });
    const thisMonth = await Attendance.countDocuments({
      userId: req.user._id,
      checkInTime: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
    });

    res.json({ success: true, data: records, total, thisMonth });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/attendance/gym/:gymId - Get gym attendance (admin)
router.get('/gym/:gymId', ...verifyGymAdmin, async (req, res) => {
  try {
    const { date, limit = 50 } = req.query;
    const query = { gymId: req.params.gymId };
    if (date) query.date = date;

    const records = await Attendance.find(query)
      .populate('userId', 'name email profilePicture membership')
      .sort({ checkInTime: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({ success: true, data: records, total: records.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/attendance/stats/:userId - Attendance stats
router.get('/stats/:userId', verifyToken, async (req, res) => {
  try {
    const userId = req.params.userId === 'me' ? req.user._id : req.params.userId;
    const [total, thisMonth, thisWeek] = await Promise.all([
      Attendance.countDocuments({ userId }),
      Attendance.countDocuments({
        userId,
        checkInTime: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      }),
      Attendance.countDocuments({
        userId,
        checkInTime: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
    ]);

    // Daily attendance for last 30 days
    const last30Days = await Attendance.find({
      userId,
      checkInTime: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    }).select('date checkInTime duration').lean();

    res.json({ success: true, data: { total, thisMonth, thisWeek, history: last30Days } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
