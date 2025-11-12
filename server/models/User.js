const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    trim: true
  },
  membership: {
    type: String,
    enum: ['Basic', 'Pro', 'Premium', 'None'],
    default: 'None'
  },
  membershipStartDate: {
    type: Date
  },
  membershipEndDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Suspended'],
    default: 'Active'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  enrolledClasses: [{
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
