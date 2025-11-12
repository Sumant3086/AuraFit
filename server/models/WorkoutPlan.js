const mongoose = require('mongoose');

const workoutPlanSchema = new mongoose.Schema({
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
  userProfile: {
    age: Number,
    gender: String,
    fitnessLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced']
    },
    goals: [String],
    availableDays: Number,
    sessionDuration: Number,
    equipment: [String],
    injuries: [String]
  },
  generatedPlan: {
    planName: String,
    duration: String,
    description: String,
    weeklySchedule: [{
      day: String,
      workouts: [{
        exercise: String,
        sets: Number,
        reps: String,
        rest: String,
        notes: String
      }]
    }],
    tips: [String]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);
