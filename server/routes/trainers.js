const express = require('express');
const router = express.Router();
const User = require('../models/User');
const TrainerBooking = require('../models/TrainerBooking');
const { verifyToken } = require('../middleware/auth');

// GET /api/trainers — List all trainers (public)
router.get('/', async (req, res) => {
  try {
    const { specialization, search, gymId } = req.query;
    const query = { role: 'trainer', status: 'Active' };
    if (specialization) query.specialization = new RegExp(specialization, 'i');
    if (gymId) query.gymId = gymId;
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { specialization: new RegExp(search, 'i') },
        { bio: new RegExp(search, 'i') },
      ];
    }

    const trainers = await User.find(query)
      .select('name profilePicture bio specialization certifications rating totalRatings currentStreak points gymId availability createdAt')
      .sort({ rating: -1, totalRatings: -1 })
      .lean();

    // Add session count for each trainer
    const enriched = await Promise.all(
      trainers.map(async (t) => {
        const sessionCount = await TrainerBooking.countDocuments({ trainerId: t._id, status: 'completed' });
        return { ...t, sessionCount };
      })
    );

    res.json({ success: true, data: enriched, total: enriched.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/trainers/:id — Get trainer profile with reviews
router.get('/:id', async (req, res) => {
  try {
    const trainer = await User.findOne({ _id: req.params.id, role: 'trainer' })
      .select('name profilePicture bio specialization certifications rating totalRatings currentStreak points gymId availability createdAt')
      .lean();

    if (!trainer) return res.status(404).json({ success: false, message: 'Trainer not found.' });

    // Fetch completed sessions with ratings
    const reviews = await TrainerBooking.find({
      trainerId: trainer._id,
      status: 'completed',
      memberRating: { $exists: true, $gt: 0 },
    })
      .populate('memberId', 'name profilePicture')
      .select('memberRating memberReview createdAt memberId')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const sessionCount = await TrainerBooking.countDocuments({ trainerId: trainer._id, status: 'completed' });
    const upcomingCount = await TrainerBooking.countDocuments({
      trainerId: trainer._id,
      status: { $in: ['confirmed', 'pending'] },
      date: { $gte: new Date().toISOString().split('T')[0] },
    });

    res.json({
      success: true,
      data: { ...trainer, sessionCount, upcomingCount, reviews },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/trainers/:id/review — Submit rating after session
router.post('/:id/review', verifyToken, async (req, res) => {
  try {
    const { rating, review, bookingId } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ success: false, message: 'Rating must be 1-5.' });

    // Verify the booking exists and belongs to this member/trainer
    const booking = await TrainerBooking.findOne({
      _id: bookingId,
      memberId: req.user._id,
      trainerId: req.params.id,
      status: 'completed',
    });
    if (!booking) return res.status(404).json({ success: false, message: 'No completed session found.' });
    if (booking.memberRating) return res.status(409).json({ success: false, message: 'You already reviewed this session.' });

    // Save review on the booking
    await TrainerBooking.findByIdAndUpdate(bookingId, { memberRating: rating, memberReview: review || '' });

    // Update trainer's rating average
    const trainer = await User.findById(req.params.id);
    const currentTotal = (trainer.rating || 0) * (trainer.totalRatings || 0);
    const newTotalRatings = (trainer.totalRatings || 0) + 1;
    const newRating = (currentTotal + rating) / newTotalRatings;

    await User.findByIdAndUpdate(req.params.id, {
      rating: Math.round(newRating * 10) / 10,
      totalRatings: newTotalRatings,
    });

    res.json({ success: true, message: 'Review submitted! Thank you.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
