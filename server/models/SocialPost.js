const mongoose = require('mongoose');

const socialPostSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userAvatar: String,
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['achievement', 'progress', 'motivation', 'question', 'general'],
    default: 'general'
  },
  images: [String],
  achievement: {
    title: String,
    icon: String,
    milestone: String
  },
  likes: [{
    userId: String,
    userName: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    userId: String,
    userName: String,
    userAvatar: String,
    text: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  visibility: {
    type: String,
    enum: ['public', 'members-only', 'private'],
    default: 'members-only'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SocialPost', socialPostSchema);
