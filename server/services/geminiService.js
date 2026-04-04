// Google Gemini AI Service
// Real AI-powered workout and nutrition plan generation

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

/**
 * Generate AI-powered workout plan using Google Gemini
 */
async function generateAIWorkoutPlan(userProfile) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `You are an expert fitness trainer. Create a detailed, personalized workout plan based on the following user profile:

User Profile:
- Age: ${userProfile.age}
- Gender: ${userProfile.gender}
- Fitness Level: ${userProfile.fitnessLevel}
- Goals: ${userProfile.goals.join(', ')}
- Available Days: ${userProfile.availableDays} days per week
- Session Duration: ${userProfile.sessionDuration} minutes
- Equipment: ${userProfile.equipment.length > 0 ? userProfile.equipment.join(', ') : 'Bodyweight only'}
- Injuries/Limitations: ${userProfile.injuries.length > 0 ? userProfile.injuries.join(', ') : 'None'}

Please provide a comprehensive workout plan in the following JSON format:
{
  "planName": "Descriptive plan name",
  "description": "Brief description of the plan",
  "duration": "${userProfile.availableDays} days per week",
  "weeklySchedule": [
    {
      "day": "Monday",
      "focus": "Muscle group or training type",
      "workouts": [
        {
          "exercise": "Exercise name",
          "sets": 3,
          "reps": "8-12",
          "rest": "60s",
          "notes": "Form cues and tips",
          "muscles": "Target muscles",
          "calories": "~100"
        }
      ]
    }
  ],
  "tips": ["Tip 1", "Tip 2", "Tip 3"],
  "nutritionTips": ["Nutrition tip 1", "Nutrition tip 2"]
}

Make it specific, actionable, and tailored to their fitness level and goals. Include 4-6 exercises per day with proper progression.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const plan = JSON.parse(jsonMatch[0]);
      return plan;
    }
    
    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('❌ Gemini AI Error:', error.message);
    // Fallback to template-based generation
    return generateTemplateWorkoutPlan(userProfile);
  }
}

/**
 * Generate AI-powered nutrition plan using Google Gemini
 */
async function generateAINutritionPlan(userProfile, calculations) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `You are an expert nutritionist. Create a detailed, personalized nutrition and meal plan based on the following:

User Profile:
- Age: ${userProfile.age}
- Gender: ${userProfile.gender}
- Weight: ${userProfile.weight} kg
- Height: ${userProfile.height} cm
- Activity Level: ${userProfile.activityLevel}
- Goal: ${userProfile.goal}
- Dietary Restrictions: ${userProfile.dietaryRestrictions.length > 0 ? userProfile.dietaryRestrictions.join(', ') : 'None'}
- Allergies: ${userProfile.allergies.length > 0 ? userProfile.allergies.join(', ') : 'None'}

Calculated Macros:
- Daily Calories: ${calculations.targetCalories} kcal
- Protein: ${calculations.protein}g
- Carbs: ${calculations.carbs}g
- Fats: ${calculations.fats}g

Please provide a comprehensive meal plan in the following JSON format:
{
  "mealPlan": {
    "breakfast": [
      {"meal": "Meal name", "calories": 400, "protein": 25, "carbs": 45, "fats": 12, "description": "Brief description"}
    ],
    "lunch": [...],
    "dinner": [...],
    "snacks": [...]
  },
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"],
  "hydration": "Water intake recommendation",
  "supplements": ["Supplement suggestions if needed"]
}

Provide 3 meal options for each meal type. Make it culturally diverse, practical, and aligned with their dietary restrictions and goals.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const plan = JSON.parse(jsonMatch[0]);
      return plan;
    }
    
    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('❌ Gemini AI Error:', error.message);
    // Fallback to template-based generation
    return generateTemplateMealPlan(userProfile, calculations);
  }
}

/**
 * Fallback template-based workout generation
 */
function generateTemplateWorkoutPlan(userProfile) {
  const { fitnessLevel, goals, availableDays } = userProfile;
  
  const templates = {
    beginner: {
      'weight-loss': {
        planName: 'Beginner Fat Loss Program',
        description: 'Perfect for beginners focusing on fat loss with proper form',
        duration: `${availableDays} days per week`,
        weeklySchedule: [
          {
            day: 'Monday',
            focus: 'Full Body + Cardio',
            workouts: [
              { exercise: 'Treadmill Walk', sets: 1, reps: '10 mins', rest: 'N/A', notes: 'Warm-up', calories: '~80' },
              { exercise: 'Bodyweight Squats', sets: 3, reps: '12-15', rest: '60s', notes: 'Keep chest up', muscles: 'Legs, Glutes' },
              { exercise: 'Push-ups (Knee)', sets: 3, reps: '8-10', rest: '60s', notes: 'Maintain form', muscles: 'Chest, Triceps' },
              { exercise: 'Plank Hold', sets: 3, reps: '20-30s', rest: '45s', notes: 'Engage core', muscles: 'Core' }
            ]
          }
        ],
        tips: ['Focus on consistency', 'Drink 3-4 liters water daily', 'Get 7-8 hours sleep'],
        nutritionTips: ['Eat protein with every meal', 'Include vegetables', 'Avoid sugary drinks']
      }
    }
  };
  
  const goalKey = goals.includes('weight-loss') ? 'weight-loss' : 'muscle-gain';
  return templates[fitnessLevel]?.[goalKey] || templates.beginner['weight-loss'];
}

/**
 * Fallback template-based meal plan generation
 */
function generateTemplateMealPlan(userProfile, calculations) {
  return {
    mealPlan: {
      breakfast: [
        { meal: 'Oatmeal with Berries', calories: 350, protein: 12, carbs: 55, fats: 8, description: 'Healthy start' },
        { meal: 'Greek Yogurt Parfait', calories: 320, protein: 20, carbs: 40, fats: 8, description: 'Protein-rich' },
        { meal: 'Scrambled Eggs & Toast', calories: 380, protein: 22, carbs: 35, fats: 15, description: 'Classic breakfast' }
      ],
      lunch: [
        { meal: 'Grilled Chicken Salad', calories: 450, protein: 35, carbs: 30, fats: 18, description: 'Lean protein' },
        { meal: 'Quinoa Bowl', calories: 480, protein: 18, carbs: 65, fats: 15, description: 'Plant-based' },
        { meal: 'Turkey Wrap', calories: 420, protein: 28, carbs: 45, fats: 12, description: 'Convenient meal' }
      ],
      dinner: [
        { meal: 'Salmon with Vegetables', calories: 520, protein: 40, carbs: 35, fats: 22, description: 'Omega-3 rich' },
        { meal: 'Lean Beef Stir-fry', calories: 480, protein: 38, carbs: 40, fats: 18, description: 'High protein' },
        { meal: 'Tofu Curry', calories: 450, protein: 22, carbs: 50, fats: 16, description: 'Vegetarian option' }
      ],
      snacks: [
        { meal: 'Protein Shake', calories: 180, protein: 25, carbs: 15, fats: 3, description: 'Post-workout' },
        { meal: 'Mixed Nuts', calories: 200, protein: 6, carbs: 8, fats: 18, description: 'Healthy fats' },
        { meal: 'Apple with Peanut Butter', calories: 220, protein: 8, carbs: 25, fats: 12, description: 'Energy boost' }
      ]
    },
    recommendations: [
      'Drink 8-10 glasses of water daily',
      'Eat every 3-4 hours to maintain metabolism',
      'Include a variety of colorful vegetables',
      'Prepare meals in advance for consistency'
    ],
    hydration: 'Aim for 3-4 liters of water daily',
    supplements: ['Multivitamin', 'Omega-3', 'Vitamin D']
  };
}

module.exports = {
  generateAIWorkoutPlan,
  generateAINutritionPlan
};
