const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, trim: true },

  // Multi-tenant gym association
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', default: null },

  // Expanded role system
  role: {
    type: String,
    enum: ['super_admin', 'gym_admin', 'trainer', 'member', 'user', 'admin'],
    default: 'member',
  },

  // Membership
  membership: { type: String, enum: ['Basic', 'Pro', 'Premium', 'None'], default: 'None' },
  membershipStartDate: { type: Date },
  membershipEndDate: { type: Date },
  status: { type: String, enum: ['Active', 'Inactive', 'Suspended'], default: 'Active' },

  // Profile
  profilePicture: { type: String, default: '' },
  bio: { type: String, default: '' },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other', ''], default: '' },
  address: { type: String, default: '' },

  // Fitness profile (from onboarding)
  fitnessGoal: {
    type: String,
    enum: ['weight_loss', 'muscle_gain', 'endurance', 'flexibility', 'general_fitness', ''],
    default: '',
  },
  experienceLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', ''],
    default: '',
  },
  onboardingCompleted: { type: Boolean, default: false },

  // Gamification
  points: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastCheckIn: { type: Date },
  badges: [{ type: String }],
  achievements: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Achievement' }],

  // Referral system
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: String, default: '' },
  referralCount: { type: Number, default: 0 },

  // Trainer-specific fields
  specialization: { type: String, default: '' },
  certifications: [{ type: String }],
  availability: [{
    day: String,
    slots: [{ start: String, end: String, isBooked: Boolean }],
  }],
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },

  // Notifications preferences
  emailNotifications: { type: Boolean, default: true },
  pushNotifications: { type: Boolean, default: true },

  enrolledClasses: [{
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    enrolledAt: { type: Date, default: Date.now },
  }],

  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Generate referral code before save
userSchema.pre('save', function (next) {
  if (!this.referralCode) {
    this.referralCode = 'AF' + Math.random().toString(36).substr(2, 8).toUpperCase();
  }
  // Backward compat: map old 'admin' role
  if (this.role === 'admin') this.role = 'admin';
  if (this.role === 'user') this.role = 'member';
  next();
});

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ gymId: 1 });
userSchema.index({ role: 1 });
userSchema.index({ referralCode: 1 });
userSchema.index({ points: -1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
