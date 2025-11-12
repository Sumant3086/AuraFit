const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  plan: {
    type: String,
    required: true,
    enum: ['basic', 'pro', 'premium', 'trial']
  },
  duration: {
    type: String,
    required: true,
    enum: ['1-day', '1-month', '3-months', '6-months', '12-months']
  },
  price: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'expired', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'pending', 'failed'],
    default: 'paid'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Membership', membershipSchema);
