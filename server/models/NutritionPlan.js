const mongoose = require('mongoose');

const nutritionPlanSchema = new mongoose.Schema({
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
    weight: Number,
    height: Number,
    activityLevel: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'active', 'very-active']
    },
    goal: {
      type: String,
      enum: ['weight-loss', 'muscle-gain', 'maintenance']
    },
    dietaryRestrictions: [String],
    allergies: [String]
  },
  calculations: {
    bmr: Number,
    tdee: Number,
    targetCalories: Number,
    protein: Number,
    carbs: Number,
    fats: Number
  },
  mealPlan: {
    breakfast: [{
      meal: String,
      calories: Number,
      protein: Number,
      carbs: Number,
      fats: Number
    }],
    lunch: [{
      meal: String,
      calories: Number,
      protein: Number,
      carbs: Number,
      fats: Number
    }],
    dinner: [{
      meal: String,
      calories: Number,
      protein: Number,
      carbs: Number,
      fats: Number
    }],
    snacks: [{
      meal: String,
      calories: Number,
      protein: Number,
      carbs: Number,
      fats: Number
    }]
  },
  recommendations: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('NutritionPlan', nutritionPlanSchema);
