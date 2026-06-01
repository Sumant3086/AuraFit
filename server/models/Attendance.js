const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym' },
  userName: { type: String, default: '' }, // Denormalized for faster queries
  checkInTime: { type: Date, default: Date.now },
  checkOutTime: { type: Date },
  duration: { type: Number, default: 0 }, // minutes
  method: { type: String, enum: ['qr', 'manual', 'app'], default: 'qr' },
  qrToken: { type: String },
  pointsEarned: { type: Number, default: 10 },
  streak: { type: Number, default: 1 },
  notes: { type: String, default: '' },
  date: { type: String }, // YYYY-MM-DD for efficient daily queries
}, { timestamps: true });

attendanceSchema.index({ userId: 1, date: 1 }, { unique: false });
attendanceSchema.index({ gymId: 1, date: 1 });
attendanceSchema.index({ checkInTime: -1 });
attendanceSchema.index({ userId: 1, checkInTime: -1 });
attendanceSchema.index({ date: 1 }); // for daily gym-wide stats

module.exports = mongoose.model('Attendance', attendanceSchema);
