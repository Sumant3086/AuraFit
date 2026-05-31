const express = require('express');
const router = express.Router();
const TrainerBooking = require('../models/TrainerBooking');
const User = require('../models/User');
const { verifyToken, verifyTrainer } = require('../middleware/auth');
const { sendEmail, templates } = require('../services/emailService');

// GET /api/trainer-bookings/trainers - List available trainers
router.get('/trainers', async (req, res) => {
  try {
    const { gymId, specialization } = req.query;
    const query = { role: 'trainer', status: 'Active' };
    if (gymId) query.gymId = gymId;
    if (specialization) query.specialization = new RegExp(specialization, 'i');

    const trainers = await User.find(query)
      .select('name profilePicture specialization certifications rating totalRatings bio availability gymId')
      .lean();

    res.json({ success: true, data: trainers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/trainer-bookings/trainer/:trainerId/availability - Get trainer's booked slots
router.get('/trainer/:trainerId/availability', async (req, res) => {
  try {
    const { date } = req.query;
    const trainer = await User.findById(req.params.trainerId).select('availability').lean();

    const bookedSlots = await TrainerBooking.find({
      trainerId: req.params.trainerId,
      date: date || new Date().toISOString().split('T')[0],
      status: { $in: ['pending', 'confirmed'] },
    }).select('startTime endTime').lean();

    res.json({ success: true, data: { availability: trainer?.availability || [], bookedSlots } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/trainer-bookings - Create booking
router.post('/', verifyToken, async (req, res) => {
  try {
    const { trainerId, date, startTime, endTime, sessionType, notes, gymId } = req.body;

    const trainer = await User.findById(trainerId);
    if (!trainer || trainer.role !== 'trainer') {
      return res.status(404).json({ success: false, message: 'Trainer not found' });
    }

    // Check slot availability
    const conflict = await TrainerBooking.findOne({
      trainerId,
      date,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
      ],
    });

    if (conflict) {
      return res.status(409).json({ success: false, message: 'This slot is already booked' });
    }

    const booking = await TrainerBooking.create({
      memberId: req.user._id,
      trainerId,
      gymId: gymId || req.user.gymId,
      date,
      startTime,
      endTime,
      duration: 60,
      sessionType,
      notes,
    });

    // Email notifications
    const member = req.user;
    sendEmail({
      to: member.email,
      ...templates.bookingConfirmed(member.name, trainer.name, date, startTime),
    }).catch(() => {});

    res.status(201).json({ success: true, data: booking, message: 'Booking created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/trainer-bookings/my - Get my bookings (member)
router.get('/my', verifyToken, async (req, res) => {
  try {
    const { status, upcoming } = req.query;
    const query = { memberId: req.user._id };
    if (status) query.status = status;
    if (upcoming === 'true') query.date = { $gte: new Date().toISOString().split('T')[0] };

    const bookings = await TrainerBooking.find(query)
      .populate('trainerId', 'name profilePicture specialization rating')
      .sort({ date: 1, startTime: 1 })
      .lean();

    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/trainer-bookings/trainer - Get trainer's bookings
router.get('/trainer', ...verifyTrainer, async (req, res) => {
  try {
    const { date, status } = req.query;
    const query = { trainerId: req.user._id };
    if (date) query.date = date;
    if (status) query.status = status;

    const bookings = await TrainerBooking.find(query)
      .populate('memberId', 'name email profilePicture membership')
      .sort({ date: 1, startTime: 1 })
      .lean();

    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/trainer-bookings/:id/status - Update booking status
router.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    const { status, trainerNotes } = req.body;
    const booking = await TrainerBooking.findById(req.params.id);

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Only trainer or member can update their booking
    const isTrainer = booking.trainerId.toString() === req.user._id.toString();
    const isMember = booking.memberId.toString() === req.user._id.toString();

    if (!isTrainer && !isMember) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Members can only cancel
    if (isMember && status !== 'cancelled') {
      return res.status(403).json({ success: false, message: 'Members can only cancel bookings' });
    }

    const updated = await TrainerBooking.findByIdAndUpdate(
      req.params.id,
      { status, ...(trainerNotes && { trainerNotes }) },
      { new: true }
    );

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/trainer-bookings/:id/review - Submit session review
router.post('/:id/review', verifyToken, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const booking = await TrainerBooking.findById(req.params.id);

    if (!booking || booking.memberId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only review completed sessions' });
    }

    await TrainerBooking.findByIdAndUpdate(req.params.id, { memberRating: rating, memberReview: review });

    // Update trainer's average rating
    const trainer = await User.findById(booking.trainerId);
    const newTotal = trainer.totalRatings + 1;
    const newRating = ((trainer.rating * trainer.totalRatings) + rating) / newTotal;
    await User.findByIdAndUpdate(booking.trainerId, { rating: newRating, totalRatings: newTotal });

    res.json({ success: true, message: 'Review submitted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/trainer-bookings/trainer/availability - Set trainer availability
router.put('/trainer/availability', ...verifyTrainer, async (req, res) => {
  try {
    const { availability } = req.body;
    await User.findByIdAndUpdate(req.user._id, { availability });
    res.json({ success: true, message: 'Availability updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
