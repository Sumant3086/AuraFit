const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  instructor: {
    type: String,
    required: true
  },
  schedule: {
    day: {
      type: String,
      required: true
    },
    time: {
      type: String,
      required: true
    }
  },
  duration: {
    type: Number,
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  enrolled: {
    type: Number,
    default: 0
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  image: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Class', classSchema);
