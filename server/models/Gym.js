const mongoose = require('mongoose');

const gymSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, default: '' },
  tagline: { type: String, default: '' },
  logo: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  images: [{ type: String }],

  // Contact
  email: { type: String, required: true },
  phone: { type: String },
  website: { type: String, default: '' },

  // Location
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' },
  },
  mapLink: { type: String, default: '' },

  // Business
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: String, enum: ['free', 'starter', 'pro', 'enterprise'], default: 'free' },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },

  // Stats
  totalMembers: { type: Number, default: 0 },
  totalTrainers: { type: Number, default: 0 },

  // Features config
  features: {
    qrCheckIn: { type: Boolean, default: true },
    aiWorkouts: { type: Boolean, default: true },
    nutritionPlans: { type: Boolean, default: true },
    trainerBooking: { type: Boolean, default: true },
    leaderboard: { type: Boolean, default: true },
    announcements: { type: Boolean, default: true },
  },

  // Amenities
  amenities: [{ type: String }],

  // Social
  socialLinks: {
    instagram: { type: String, default: '' },
    facebook: { type: String, default: '' },
    youtube: { type: String, default: '' },
    twitter: { type: String, default: '' },
  },

  // Reviews/testimonials
  testimonials: [{
    memberName: String,
    memberAvatar: String,
    text: String,
    rating: Number,
    date: { type: Date, default: Date.now },
  }],

  // Working hours
  workingHours: {
    weekdays: { open: { type: String, default: '06:00' }, close: { type: String, default: '22:00' } },
    weekends: { open: { type: String, default: '08:00' }, close: { type: String, default: '20:00' } },
  },

  // SEO
  metaTitle: { type: String, default: '' },
  metaDescription: { type: String, default: '' },
  keywords: [{ type: String }],

  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

gymSchema.index({ slug: 1 }, { unique: true });
gymSchema.index({ adminId: 1 });
gymSchema.index({ status: 1 });
gymSchema.index({ 'address.city': 1 });

module.exports = mongoose.model('Gym', gymSchema);
