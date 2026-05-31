const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', default: null }, // null = platform-wide
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  type: {
    type: String,
    enum: ['info', 'warning', 'success', 'promo', 'event', 'maintenance'],
    default: 'info',
  },

  // Target audience
  targetRoles: [{ type: String, enum: ['all', 'member', 'trainer', 'gym_admin'] }],

  // Scheduling
  publishAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },

  // Engagement
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  pinned: { type: Boolean, default: false },

  // CTA
  ctaText: { type: String, default: '' },
  ctaLink: { type: String, default: '' },

  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

announcementSchema.index({ gymId: 1, isActive: 1 });
announcementSchema.index({ publishAt: -1 });
announcementSchema.index({ pinned: -1, publishAt: -1 });

module.exports = mongoose.model('Announcement', announcementSchema);
