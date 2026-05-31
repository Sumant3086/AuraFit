const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym' },
  checkInTime: { type: Date, default: Date.now },
  checkOutTime: { type: Date },
  duration: { type: Number, default: 0 }, // in minutes
  method: { type: String, enum: ['qr', 'manual', 'app'], default: 'qr' },
  qrToken: { type: String },
  notes: { type: String, default: '' },
  date: { type: String }, // YYYY-MM-DD for easy daily queries
}, { timestamps: true });

attendanceSchema.index({ userId: 1, date: 1 });
attendanceSchema.index({ gymId: 1, date: 1 });
attendanceSchema.index({ checkInTime: -1 });
attendanceSchema.index({ userId: 1, checkInTime: -1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
