const mongoose = require('mongoose');

const progressTrackerSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  measurements: [{
    date: {
      type: Date,
      default: Date.now
    },
    weight: Number,
    height: Number,
    chest: Number,
    waist: Number,
    hips: Number,
    biceps: Number,
    thighs: Number,
    bodyFat: Number,
    bmi: Number,
    photos: {
      front: String,
      side: String,
      back: String
    },
    notes: String
  }],
  goals: {
    targetWeight: Number,
    targetBodyFat: Number,
    targetDate: Date,
    goalType: {
      type: String,
      enum: ['weight-loss', 'muscle-gain', 'maintenance', 'athletic-performance']
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ProgressTracker', progressTrackerSchema);
