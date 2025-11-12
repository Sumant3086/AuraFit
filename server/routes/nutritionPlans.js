const express = require('express');
const router = express.Router();
const NutritionPlan = require('../models/NutritionPlan');

// Calculate nutrition plan
router.post('/calculate', async (req, res) => {
  try {
    const { userId, name, email, userProfile } = req.body;
    
    const calculations = calculateNutrition(userProfile);
    const mealPlan = generateMealPlan(calculations, userProfile);
    const recommendations = generateRecommendations(userProfile);
    
    try {
      // Try to save to database
      const nutritionPlan = new NutritionPlan({
        userId,
        name,
        email,
        userProfile,
        calculations,
        mealPlan,
        recommendations
      });
      
      await nutritionPlan.save();
      
      res.status(201).json({ 
        success: true, 
        message: 'Nutrition plan created successfully',
        data: nutritionPlan 
      });
    } catch (dbError) {
      // If database save fails, still return the calculated plan
      console.warn('Database save failed, returning plan without saving:', dbError.message);
      res.status(201).json({ 
        success: true, 
        message: 'Nutrition plan calculated (not saved to database)',
        data: {
          userId,
          name,
          email,
          userProfile,
          calculations,
          mealPlan,
          recommendations,
          createdAt: new Date()
        }
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error creating nutrition plan', 
      error: error.message 
    });
  }
});

// Get nutrition plans by userId
router.get('/user/:userId', async (req, res) => {
  try {
    const plans = await NutritionPlan.find({ 
      userId: req.params.userId 
    }).sort({ createdAt: -1 });
    
    res.json({ success: true, data: plans });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching nutrition plans', 
      error: error.message 
    });
  }
});

module.exports = router;

// Helper Functions
function calculateNutrition(profile) {
  const { age, gender, weight, height, activityLevel, goal } = profile;
  
  // Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
  let bmr;
  if (gender === 'male') {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
  
  // Activity multipliers
  const activityMultipliers = {
    'sedentary': 1.2,
    'light': 1.375,
    'moderate': 1.55,
    'active': 1.725,
    'very-active': 1.9
  };
  
  // Calculate TDEE (Total Daily Energy Expenditure)
  const tdee = bmr * (activityMultipliers[activityLevel] || 1.2);
  
  // Adjust calories based on goal
  let targetCalories;
  if (goal === 'weight-loss') {
    targetCalories = tdee - 500; // 500 calorie deficit
  } else if (goal === 'muscle-gain') {
    targetCalories = tdee + 300; // 300 calorie surplus
  } else {
    targetCalories = tdee; // maintenance
  }
  
  // Calculate macros
  const protein = weight * 2.2; // 2.2g per kg
  const fats = targetCalories * 0.25 / 9; // 25% of calories from fats
  const carbs = (targetCalories - (protein * 4) - (fats * 9)) / 4;
  
  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories: Math.round(targetCalories),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fats: Math.round(fats)
  };
}

function generateMealPlan(calculations, profile) {
  const { targetCalories, protein, carbs, fats } = calculations;
  const { goal, dietaryRestrictions = [] } = profile;
  
  const isVegetarian = dietaryRestrictions.includes('vegetarian');
  const isVegan = dietaryRestrictions.includes('vegan');
  
  // Meal distribution (breakfast: 25%, lunch: 35%, dinner: 30%, snacks: 10%)
  const mealPlan = {
    breakfast: generateMeals('breakfast', targetCalories * 0.25, protein * 0.25, carbs * 0.25, fats * 0.25, isVegetarian, isVegan),
    lunch: generateMeals('lunch', targetCalories * 0.35, protein * 0.35, carbs * 0.35, fats * 0.35, isVegetarian, isVegan),
    dinner: generateMeals('dinner', targetCalories * 0.30, protein * 0.30, carbs * 0.30, fats * 0.30, isVegetarian, isVegan),
    snacks: generateMeals('snacks', targetCalories * 0.10, protein * 0.10, carbs * 0.10, fats * 0.10, isVegetarian, isVegan)
  };
  
  return mealPlan;
}

function generateMeals(mealType, calories, protein, carbs, fats, isVegetarian, isVegan) {
  const mealDatabase = {
    breakfast: [
      { meal: 'Oatmeal with Berries & Almonds', calories: 350, protein: 12, carbs: 55, fats: 10 },
      { meal: 'Greek Yogurt Parfait', calories: 300, protein: 20, carbs: 35, fats: 8 },
      { meal: 'Scrambled Eggs with Whole Wheat Toast', calories: 400, protein: 25, carbs: 40, fats: 15 },
      { meal: 'Protein Smoothie Bowl', calories: 380, protein: 30, carbs: 45, fats: 12 },
      { meal: 'Avocado Toast with Poached Eggs', calories: 420, protein: 18, carbs: 38, fats: 22 }
    ],
    lunch: [
      { meal: 'Grilled Chicken Salad', calories: 450, protein: 40, carbs: 30, fats: 18 },
      { meal: 'Quinoa Buddha Bowl', calories: 500, protein: 22, carbs: 65, fats: 16 },
      { meal: 'Turkey & Avocado Wrap', calories: 480, protein: 35, carbs: 45, fats: 20 },
      { meal: 'Salmon with Sweet Potato', calories: 520, protein: 38, carbs: 50, fats: 18 },
      { meal: 'Chickpea Curry with Brown Rice', calories: 490, protein: 18, carbs: 70, fats: 14 }
    ],
    dinner: [
      { meal: 'Grilled Steak with Vegetables', calories: 550, protein: 45, carbs: 35, fats: 25 },
      { meal: 'Baked Cod with Quinoa', calories: 480, protein: 40, carbs: 50, fats: 12 },
      { meal: 'Chicken Stir-Fry', calories: 500, protein: 42, carbs: 48, fats: 16 },
      { meal: 'Lentil Soup with Whole Grain Bread', calories: 420, protein: 24, carbs: 60, fats: 10 },
      { meal: 'Turkey Meatballs with Zucchini Noodles', calories: 460, protein: 38, carbs: 32, fats: 20 }
    ],
    snacks: [
      { meal: 'Apple with Almond Butter', calories: 180, protein: 6, carbs: 20, fats: 10 },
      { meal: 'Protein Shake', calories: 150, protein: 25, carbs: 8, fats: 3 },
      { meal: 'Mixed Nuts', calories: 170, protein: 6, carbs: 8, fats: 14 },
      { meal: 'Greek Yogurt', calories: 140, protein: 15, carbs: 12, fats: 4 },
      { meal: 'Hummus with Veggies', calories: 120, protein: 5, carbs: 15, fats: 6 }
    ]
  };
  
  let meals = mealDatabase[mealType] || [];
  
  // Filter based on dietary restrictions
  if (isVegan) {
    meals = meals.filter(m => !m.meal.toLowerCase().includes('chicken') && 
                              !m.meal.toLowerCase().includes('turkey') &&
                              !m.meal.toLowerCase().includes('egg') &&
                              !m.meal.toLowerCase().includes('yogurt') &&
                              !m.meal.toLowerCase().includes('salmon') &&
                              !m.meal.toLowerCase().includes('cod') &&
                              !m.meal.toLowerCase().includes('steak'));
  } else if (isVegetarian) {
    meals = meals.filter(m => !m.meal.toLowerCase().includes('chicken') && 
                              !m.meal.toLowerCase().includes('turkey') &&
                              !m.meal.toLowerCase().includes('salmon') &&
                              !m.meal.toLowerCase().includes('cod') &&
                              !m.meal.toLowerCase().includes('steak'));
  }
  
  // Return 2-3 meal options
  return meals.slice(0, 3);
}

function generateRecommendations(profile) {
  const { goal, activityLevel } = profile;
  const recommendations = [];
  
  if (goal === 'weight-loss') {
    recommendations.push('Maintain a consistent calorie deficit of 300-500 calories');
    recommendations.push('Prioritize protein to preserve muscle mass');
    recommendations.push('Include plenty of vegetables for satiety');
    recommendations.push('Stay hydrated - drink at least 8 glasses of water daily');
  } else if (goal === 'muscle-gain') {
    recommendations.push('Eat in a slight calorie surplus (200-300 calories)');
    recommendations.push('Consume 1.6-2.2g of protein per kg of body weight');
    recommendations.push('Time your carbs around workouts for energy');
    recommendations.push('Don\'t neglect healthy fats for hormone production');
  } else {
    recommendations.push('Maintain your current calorie intake');
    recommendations.push('Focus on nutrient-dense whole foods');
    recommendations.push('Balance your macronutrients throughout the day');
  }
  
  recommendations.push('Meal prep on weekends to stay consistent');
  recommendations.push('Track your food intake for the first few weeks');
  recommendations.push('Adjust portions based on your progress');
  
  return recommendations;
}
