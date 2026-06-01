const mongoose = require('mongoose');

const userSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  refreshToken: { type: String, required: true, index: true },
  deviceName: { type: String, default: 'Unknown Device' },
  deviceType: { type: String, enum: ['mobile', 'tablet', 'desktop', 'unknown'], default: 'unknown' },
  browser: { type: String, default: 'Unknown Browser' },
  os: { type: String, default: 'Unknown OS' },
  ip: { type: String },
  location: { type: String, default: 'Unknown Location' },
  lastActive: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
});

// TTL: auto-expire sessions after 7 days of inactivity
userSessionSchema.index({ lastActive: 1 }, { expireAfterSeconds: 7 * 86400 });
userSessionSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model('UserSession', userSessionSchema);
