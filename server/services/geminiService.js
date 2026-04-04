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

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const selectedDays = daysOfWeek.slice(0, userProfile.availableDays);
    
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

IMPORTANT: Create a COMPLETE ${userProfile.availableDays}-day workout plan with DIFFERENT exercises for each day. Each day should target different muscle groups or training styles.

Days to include: ${selectedDays.join(', ')}

Please provide a comprehensive workout plan in the following JSON format:
{
  "planName": "Descriptive plan name",
  "description": "Brief description of the plan",
  "duration": "${userProfile.availableDays} days per week",
  "weeklySchedule": [
    {
      "day": "Monday",
      "focus": "Chest & Triceps",
      "workouts": [
        {
          "exercise": "Bench Press",
          "sets": 4,
          "reps": "8-10",
          "rest": "90s",
          "notes": "Lower to chest, press explosively",
          "muscles": "Chest, Triceps",
          "calories": "~120"
        },
        {
          "exercise": "Incline Dumbbell Press",
          "sets": 3,
          "reps": "10-12",
          "rest": "75s",
          "notes": "30-45 degree angle",
          "muscles": "Upper Chest",
          "calories": "~100"
        }
      ]
    },
    {
      "day": "Wednesday",
      "focus": "Back & Biceps",
      "workouts": [
        {
          "exercise": "Pull-ups",
          "sets": 4,
          "reps": "8-10",
          "rest": "90s",
          "notes": "Full range of motion",
          "muscles": "Back, Biceps",
          "calories": "~110"
        }
      ]
    }
  ],
  "tips": ["Focus on progressive overload", "Stay hydrated", "Get 7-8 hours sleep"],
  "nutritionTips": ["Eat protein with every meal", "Include vegetables", "Avoid processed foods"]
}

CRITICAL: Generate exactly ${userProfile.availableDays} different days with unique exercises for each day. Follow proper split training (e.g., Day 1: Chest/Triceps, Day 2: Back/Biceps, Day 3: Legs/Shoulders). Include 5-7 exercises per day.`;

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

IMPORTANT: Provide 3 DIFFERENT meal options for each meal type (breakfast, lunch, dinner, snacks). Each option should be unique and varied.

Please provide a comprehensive meal plan in the following JSON format:
{
  "mealPlan": {
    "breakfast": [
      {"meal": "Oatmeal with Berries & Almonds", "calories": 380, "protein": 15, "carbs": 52, "fats": 12, "description": "Fiber-rich breakfast with antioxidants"},
      {"meal": "Greek Yogurt Parfait", "calories": 350, "protein": 25, "carbs": 40, "fats": 8, "description": "High-protein breakfast"},
      {"meal": "Scrambled Eggs with Avocado Toast", "calories": 420, "protein": 22, "carbs": 35, "fats": 18, "description": "Balanced breakfast with healthy fats"}
    ],
    "lunch": [
      {"meal": "Grilled Chicken Salad", "calories": 450, "protein": 40, "carbs": 30, "fats": 15, "description": "Lean protein with vegetables"},
      {"meal": "Quinoa Buddha Bowl", "calories": 480, "protein": 20, "carbs": 65, "fats": 14, "description": "Plant-based complete meal"},
      {"meal": "Turkey & Hummus Wrap", "calories": 420, "protein": 32, "carbs": 45, "fats": 12, "description": "Convenient portable lunch"}
    ],
    "dinner": [
      {"meal": "Baked Salmon with Roasted Vegetables", "calories": 520, "protein": 42, "carbs": 35, "fats": 22, "description": "Omega-3 rich dinner"},
      {"meal": "Lean Beef Stir-fry with Brown Rice", "calories": 500, "protein": 38, "carbs": 48, "fats": 16, "description": "High-protein Asian-inspired"},
      {"meal": "Grilled Chicken with Sweet Potato", "calories": 480, "protein": 45, "carbs": 42, "fats": 12, "description": "Classic bodybuilding meal"}
    ],
    "snacks": [
      {"meal": "Protein Shake with Banana", "calories": 200, "protein": 25, "carbs": 20, "fats": 3, "description": "Post-workout recovery"},
      {"meal": "Mixed Nuts & Dried Fruit", "calories": 220, "protein": 6, "carbs": 18, "fats": 16, "description": "Energy-dense snack"},
      {"meal": "Apple with Almond Butter", "calories": 210, "protein": 7, "carbs": 24, "fats": 11, "description": "Balanced mid-day snack"}
    ]
  },
  "recommendations": [
    "Drink 8-10 glasses of water daily",
    "Eat every 3-4 hours to maintain metabolism",
    "Include colorful vegetables in every meal",
    "Prepare meals in advance for consistency"
  ],
  "hydration": "Aim for 3-4 liters of water daily, more on workout days",
  "supplements": ["Multivitamin", "Omega-3 Fish Oil", "Vitamin D", "Whey Protein (if needed)"]
}

Make it culturally diverse, practical, and aligned with their dietary restrictions and goals. Ensure each meal option is DIFFERENT and provides variety.`;

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
              { exercise: 'Treadmill Walk', sets: 1, reps: '10 mins', rest: 'N/A', notes: 'Warm-up', calories: '~80', muscles: 'Cardio' },
              { exercise: 'Bodyweight Squats', sets: 3, reps: '12-15', rest: '60s', notes: 'Keep chest up', muscles: 'Legs, Glutes', calories: '~60' },
              { exercise: 'Push-ups (Knee)', sets: 3, reps: '8-10', rest: '60s', notes: 'Maintain form', muscles: 'Chest, Triceps', calories: '~50' },
              { exercise: 'Plank Hold', sets: 3, reps: '20-30s', rest: '45s', notes: 'Engage core', muscles: 'Core', calories: '~30' },
              { exercise: 'Jumping Jacks', sets: 3, reps: '30', rest: '30s', notes: 'Cardio finisher', muscles: 'Full Body', calories: '~70' }
            ]
          },
          {
            day: 'Wednesday',
            focus: 'Upper Body + Core',
            workouts: [
              { exercise: 'Cycling', sets: 1, reps: '10 mins', rest: 'N/A', notes: 'Warm-up', calories: '~90', muscles: 'Cardio' },
              { exercise: 'Dumbbell Rows', sets: 3, reps: '10-12', rest: '60s', notes: 'Each arm', muscles: 'Back, Biceps', calories: '~70' },
              { exercise: 'Shoulder Press', sets: 3, reps: '10-12', rest: '60s', notes: 'Light weights', muscles: 'Shoulders', calories: '~60' },
              { exercise: 'Bicycle Crunches', sets: 3, reps: '15-20', rest: '45s', notes: 'Controlled movement', muscles: 'Abs', calories: '~40' },
              { exercise: 'Mountain Climbers', sets: 3, reps: '20', rest: '45s', notes: 'Fast pace', muscles: 'Core, Cardio', calories: '~80' }
            ]
          },
          {
            day: 'Friday',
            focus: 'Lower Body + HIIT',
            workouts: [
              { exercise: 'Jump Rope', sets: 3, reps: '2 mins', rest: '60s', notes: 'Warm-up', calories: '~100', muscles: 'Cardio' },
              { exercise: 'Lunges', sets: 3, reps: '10 each leg', rest: '60s', notes: 'Alternate legs', muscles: 'Legs, Glutes', calories: '~70' },
              { exercise: 'Glute Bridges', sets: 3, reps: '15-20', rest: '45s', notes: 'Squeeze at top', muscles: 'Glutes, Hamstrings', calories: '~50' },
              { exercise: 'Burpees', sets: 3, reps: '8-10', rest: '60s', notes: 'Full body exercise', muscles: 'Full Body', calories: '~90' },
              { exercise: 'High Knees', sets: 3, reps: '30s', rest: '30s', notes: 'HIIT finisher', muscles: 'Cardio', calories: '~80' }
            ]
          },
          {
            day: 'Saturday',
            focus: 'Active Recovery + Flexibility',
            workouts: [
              { exercise: 'Light Jog', sets: 1, reps: '15 mins', rest: 'N/A', notes: 'Easy pace', calories: '~120', muscles: 'Cardio' },
              { exercise: 'Yoga Flow', sets: 1, reps: '10 mins', rest: 'N/A', notes: 'Stretching', calories: '~40', muscles: 'Full Body' },
              { exercise: 'Foam Rolling', sets: 1, reps: '10 mins', rest: 'N/A', notes: 'Recovery', calories: '~20', muscles: 'Recovery' },
              { exercise: 'Cat-Cow Stretch', sets: 3, reps: '10', rest: '30s', notes: 'Spine mobility', calories: '~15', muscles: 'Back' },
              { exercise: 'Child Pose Hold', sets: 2, reps: '60s', rest: '30s', notes: 'Relaxation', calories: '~10', muscles: 'Full Body' }
            ]
          },
          {
            day: 'Sunday',
            focus: 'Full Body Circuit',
            workouts: [
              { exercise: 'Jumping Jacks', sets: 1, reps: '5 mins', rest: 'N/A', notes: 'Warm-up', calories: '~60', muscles: 'Cardio' },
              { exercise: 'Bodyweight Squats', sets: 4, reps: '15', rest: '45s', notes: 'Deep squats', muscles: 'Legs', calories: '~70' },
              { exercise: 'Push-ups', sets: 4, reps: '10', rest: '45s', notes: 'Full range', muscles: 'Chest, Triceps', calories: '~60' },
              { exercise: 'Plank', sets: 4, reps: '30s', rest: '30s', notes: 'Hold steady', muscles: 'Core', calories: '~40' },
              { exercise: 'Burpees', sets: 4, reps: '10', rest: '60s', notes: 'Circuit finisher', muscles: 'Full Body', calories: '~100' }
            ]
          }
        ].slice(0, availableDays),
        tips: ['Focus on consistency', 'Drink 3-4 liters water daily', 'Get 7-8 hours sleep', 'Track your progress weekly'],
        nutritionTips: ['Eat protein with every meal', 'Include vegetables', 'Avoid sugary drinks', 'Maintain calorie deficit']
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
