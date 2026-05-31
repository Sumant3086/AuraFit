const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  // Achievement definition (global catalog)
  key: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true }, // emoji or icon name
  category: {
    type: String,
    enum: ['attendance', 'workout', 'nutrition', 'social', 'milestone', 'streak', 'referral'],
    required: true,
  },
  points: { type: Number, default: 50 },
  tier: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum'], default: 'bronze' },

  // Criteria for automatic unlock
  criteria: {
    type: { type: String }, // 'attendance_count', 'streak_days', 'workout_count', 'referral_count', 'points_total'
    value: { type: Number },
  },

  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

// User achievement (earned)
const userAchievementSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  achievementKey: { type: String, required: true },
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym' },
  earnedAt: { type: Date, default: Date.now },
  notified: { type: Boolean, default: false },
});

userAchievementSchema.index({ userId: 1, achievementKey: 1 }, { unique: true });
userAchievementSchema.index({ userId: 1, earnedAt: -1 });

const Achievement = mongoose.model('Achievement', achievementSchema);
const UserAchievement = mongoose.model('UserAchievement', userAchievementSchema);

module.exports = { Achievement, UserAchievement };
