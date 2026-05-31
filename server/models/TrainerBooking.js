const mongoose = require('mongoose');

const trainerBookingSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym' },

  date: { type: String, required: true }, // YYYY-MM-DD
  startTime: { type: String, required: true }, // HH:mm
  endTime: { type: String, required: true },
  duration: { type: Number, default: 60 }, // minutes

  sessionType: {
    type: String,
    enum: ['personal_training', 'assessment', 'nutrition_consultation', 'group_session'],
    default: 'personal_training',
  },

  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
    default: 'pending',
  },

  notes: { type: String, default: '' },
  trainerNotes: { type: String, default: '' },

  // Rating after session
  memberRating: { type: Number, min: 1, max: 5 },
  memberReview: { type: String, default: '' },

  // Payment (if paid sessions)
  isPaid: { type: Boolean, default: false },
  amount: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

trainerBookingSchema.index({ memberId: 1, date: 1 });
trainerBookingSchema.index({ trainerId: 1, date: 1 });
trainerBookingSchema.index({ gymId: 1, date: 1 });
trainerBookingSchema.index({ status: 1 });

module.exports = mongoose.model('TrainerBooking', trainerBookingSchema);
