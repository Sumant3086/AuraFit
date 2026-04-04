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
          "sets": "appropriate sets",
          "reps": "appropriate reps",
          "rest": "appropriate rest",
          "notes": "Lower to chest, press explosively",
          "muscles": "Chest, Triceps",
          "calories": "estimated calories"
        },
        {
          "exercise": "Incline Dumbbell Press",
          "sets": "appropriate sets",
          "reps": "appropriate reps",
          "rest": "appropriate rest",
          "notes": "appropriate angle",
          "muscles": "Upper Chest",
          "calories": "estimated calories"
        }
      ]
    },
    {
      "day": "Wednesday",
      "focus": "Back & Biceps",
      "workouts": [
        {
          "exercise": "Pull-ups",
          "sets": "appropriate sets",
          "reps": "appropriate reps",
          "rest": "appropriate rest",
          "notes": "Full range of motion",
          "muscles": "Back, Biceps",
          "calories": "estimated calories"
        }
      ]
    }
  ],
  "tips": ["Focus on progressive overload", "Stay hydrated", "Get adequate sleep"],
  "nutritionTips": ["Eat protein with every meal", "Include vegetables", "Avoid processed foods"]
}

CRITICAL: Generate exactly ${userProfile.availableDays} different days with unique exercises for each day. Follow proper split training (e.g., Chest/Triceps, Back/Biceps, Legs/Shoulders). Include appropriate number of exercises per day based on session duration and fitness level.`;

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

IMPORTANT: Provide multiple DIFFERENT meal options for each meal type (breakfast, lunch, dinner, snacks). Each option should be unique and varied.

Please provide a comprehensive meal plan in the following JSON format:
{
  "mealPlan": {
    "breakfast": [
      {"meal": "Oatmeal with Berries & Almonds", "calories": "appropriate calories", "protein": "appropriate protein", "carbs": "appropriate carbs", "fats": "appropriate fats", "description": "Fiber-rich breakfast with antioxidants"},
      {"meal": "Greek Yogurt Parfait", "calories": "appropriate calories", "protein": "appropriate protein", "carbs": "appropriate carbs", "fats": "appropriate fats", "description": "High-protein breakfast"},
      {"meal": "Scrambled Eggs with Avocado Toast", "calories": "appropriate calories", "protein": "appropriate protein", "carbs": "appropriate carbs", "fats": "appropriate fats", "description": "Balanced breakfast with healthy fats"}
    ],
    "lunch": [
      {"meal": "Grilled Chicken Salad", "calories": "appropriate calories", "protein": "appropriate protein", "carbs": "appropriate carbs", "fats": "appropriate fats", "description": "Lean protein with vegetables"},
      {"meal": "Quinoa Buddha Bowl", "calories": "appropriate calories", "protein": "appropriate protein", "carbs": "appropriate carbs", "fats": "appropriate fats", "description": "Plant-based complete meal"},
      {"meal": "Turkey & Hummus Wrap", "calories": "appropriate calories", "protein": "appropriate protein", "carbs": "appropriate carbs", "fats": "appropriate fats", "description": "Convenient portable lunch"}
    ],
    "dinner": [
      {"meal": "Baked Salmon with Roasted Vegetables", "calories": "appropriate calories", "protein": "appropriate protein", "carbs": "appropriate carbs", "fats": "appropriate fats", "description": "Omega-3 rich dinner"},
      {"meal": "Lean Beef Stir-fry with Brown Rice", "calories": "appropriate calories", "protein": "appropriate protein", "carbs": "appropriate carbs", "fats": "appropriate fats", "description": "High-protein Asian-inspired"},
      {"meal": "Grilled Chicken with Sweet Potato", "calories": "appropriate calories", "protein": "appropriate protein", "carbs": "appropriate carbs", "fats": "appropriate fats", "description": "Classic bodybuilding meal"}
    ],
    "snacks": [
      {"meal": "Protein Shake with Banana", "calories": "appropriate calories", "protein": "appropriate protein", "carbs": "appropriate carbs", "fats": "appropriate fats", "description": "Post-workout recovery"},
      {"meal": "Mixed Nuts & Dried Fruit", "calories": "appropriate calories", "protein": "appropriate protein", "carbs": "appropriate carbs", "fats": "appropriate fats", "description": "Energy-dense snack"},
      {"meal": "Apple with Almond Butter", "calories": "appropriate calories", "protein": "appropriate protein", "carbs": "appropriate carbs", "fats": "appropriate fats", "description": "Balanced mid-day snack"}
    ]
  },
  "recommendations": [
    "Drink adequate glasses of water daily",
    "Eat regularly throughout the day to maintain metabolism",
    "Include colorful vegetables in every meal",
    "Prepare meals in advance for consistency"
  ],
  "hydration": "Aim for adequate water intake daily, more on workout days",
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
  
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const selectedDays = daysOfWeek.slice(0, availableDays);
  
  const templates = {
    beginner: {
      'weight-loss': {
        planName: 'Beginner Fat Loss Program',
        description: 'Perfect for beginners focusing on fat loss with proper form',
        duration: `${availableDays} days per week`,
        weeklySchedule: selectedDays.map((day, index) => {
          const workoutTypes = [
            {
              focus: 'Full Body + Cardio',
              workouts: [
                { exercise: 'Treadmill Walk', sets: 'warm-up', reps: 'moderate duration', rest: 'N/A', notes: 'Warm-up', calories: 'moderate', muscles: 'Cardio' },
                { exercise: 'Bodyweight Squats', sets: 'moderate', reps: 'moderate range', rest: 'moderate', notes: 'Keep chest up', muscles: 'Legs, Glutes', calories: 'moderate' },
                { exercise: 'Push-ups (Knee)', sets: 'moderate', reps: 'moderate range', rest: 'moderate', notes: 'Maintain form', muscles: 'Chest, Triceps', calories: 'moderate' },
                { exercise: 'Plank Hold', sets: 'moderate', reps: 'moderate duration', rest: 'short', notes: 'Engage core', muscles: 'Core', calories: 'low' },
                { exercise: 'Jumping Jacks', sets: 'moderate', reps: 'moderate count', rest: 'short', notes: 'Cardio finisher', muscles: 'Full Body', calories: 'moderate' }
              ]
            },
            {
              focus: 'Upper Body + Core',
              workouts: [
                { exercise: 'Cycling', sets: 'warm-up', reps: 'moderate duration', rest: 'N/A', notes: 'Warm-up', calories: 'moderate', muscles: 'Cardio' },
                { exercise: 'Dumbbell Rows', sets: 'moderate', reps: 'moderate range', rest: 'moderate', notes: 'Each arm', muscles: 'Back, Biceps', calories: 'moderate' },
                { exercise: 'Shoulder Press', sets: 'moderate', reps: 'moderate range', rest: 'moderate', notes: 'Light weights', muscles: 'Shoulders', calories: 'moderate' },
                { exercise: 'Bicycle Crunches', sets: 'moderate', reps: 'moderate range', rest: 'short', notes: 'Controlled movement', muscles: 'Abs', calories: 'low' },
                { exercise: 'Mountain Climbers', sets: 'moderate', reps: 'moderate count', rest: 'short', notes: 'Fast pace', muscles: 'Core, Cardio', calories: 'moderate' }
              ]
            },
            {
              focus: 'Lower Body + HIIT',
              workouts: [
                { exercise: 'Jump Rope', sets: 'moderate', reps: 'moderate duration', rest: 'moderate', notes: 'Warm-up', calories: 'high', muscles: 'Cardio' },
                { exercise: 'Lunges', sets: 'moderate', reps: 'each leg', rest: 'moderate', notes: 'Alternate legs', muscles: 'Legs, Glutes', calories: 'moderate' },
                { exercise: 'Glute Bridges', sets: 'moderate', reps: 'moderate range', rest: 'short', notes: 'Squeeze at top', muscles: 'Glutes, Hamstrings', calories: 'moderate' },
                { exercise: 'Burpees', sets: 'moderate', reps: 'moderate range', rest: 'moderate', notes: 'Full body exercise', muscles: 'Full Body', calories: 'high' },
                { exercise: 'High Knees', sets: 'moderate', reps: 'moderate duration', rest: 'short', notes: 'HIIT finisher', muscles: 'Cardio', calories: 'moderate' }
              ]
            },
            {
              focus: 'Active Recovery + Flexibility',
              workouts: [
                { exercise: 'Light Jog', sets: 'single', reps: 'moderate duration', rest: 'N/A', notes: 'Easy pace', calories: 'moderate', muscles: 'Cardio' },
                { exercise: 'Yoga Flow', sets: 'single', reps: 'moderate duration', rest: 'N/A', notes: 'Stretching', calories: 'low', muscles: 'Full Body' },
                { exercise: 'Foam Rolling', sets: 'single', reps: 'moderate duration', rest: 'N/A', notes: 'Recovery', calories: 'low', muscles: 'Recovery' },
                { exercise: 'Cat-Cow Stretch', sets: 'moderate', reps: 'moderate count', rest: 'short', notes: 'Spine mobility', calories: 'low', muscles: 'Back' },
                { exercise: 'Child Pose Hold', sets: 'few', reps: 'moderate duration', rest: 'short', notes: 'Relaxation', calories: 'low', muscles: 'Full Body' }
              ]
            },
            {
              focus: 'Full Body Circuit',
              workouts: [
                { exercise: 'Jumping Jacks', sets: 'warm-up', reps: 'moderate duration', rest: 'N/A', notes: 'Warm-up', calories: 'moderate', muscles: 'Cardio' },
                { exercise: 'Bodyweight Squats', sets: 'moderate-high', reps: 'moderate count', rest: 'short', notes: 'Deep squats', muscles: 'Legs', calories: 'moderate' },
                { exercise: 'Push-ups', sets: 'moderate-high', reps: 'moderate count', rest: 'short', notes: 'Full range', muscles: 'Chest, Triceps', calories: 'moderate' },
                { exercise: 'Plank', sets: 'moderate-high', reps: 'moderate duration', rest: 'short', notes: 'Hold steady', muscles: 'Core', calories: 'low' },
                { exercise: 'Burpees', sets: 'moderate-high', reps: 'moderate count', rest: 'moderate', notes: 'Circuit finisher', muscles: 'Full Body', calories: 'high' }
              ]
            }
          ];
          
          return {
            day: day,
            ...workoutTypes[index % workoutTypes.length]
          };
        }),
        tips: ['Focus on consistency', 'Stay well hydrated', 'Get adequate sleep', 'Track your progress regularly'],
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
  const caloriesPerMeal = Math.round(calculations.targetCalories / 4); // Rough distribution
  const proteinPerMeal = Math.round(calculations.protein / 4);
  const carbsPerMeal = Math.round(calculations.carbs / 4);
  const fatsPerMeal = Math.round(calculations.fats / 4);
  
  return {
    mealPlan: {
      breakfast: [
        { meal: 'Oatmeal with Berries', calories: caloriesPerMeal, protein: proteinPerMeal, carbs: carbsPerMeal, fats: fatsPerMeal, description: 'Healthy start' },
        { meal: 'Greek Yogurt Parfait', calories: caloriesPerMeal, protein: proteinPerMeal, carbs: carbsPerMeal, fats: fatsPerMeal, description: 'Protein-rich' },
        { meal: 'Scrambled Eggs & Toast', calories: caloriesPerMeal, protein: proteinPerMeal, carbs: carbsPerMeal, fats: fatsPerMeal, description: 'Classic breakfast' }
      ],
      lunch: [
        { meal: 'Grilled Chicken Salad', calories: caloriesPerMeal, protein: proteinPerMeal, carbs: carbsPerMeal, fats: fatsPerMeal, description: 'Lean protein' },
        { meal: 'Quinoa Bowl', calories: caloriesPerMeal, protein: proteinPerMeal, carbs: carbsPerMeal, fats: fatsPerMeal, description: 'Plant-based' },
        { meal: 'Turkey Wrap', calories: caloriesPerMeal, protein: proteinPerMeal, carbs: carbsPerMeal, fats: fatsPerMeal, description: 'Convenient meal' }
      ],
      dinner: [
        { meal: 'Salmon with Vegetables', calories: caloriesPerMeal, protein: proteinPerMeal, carbs: carbsPerMeal, fats: fatsPerMeal, description: 'Omega-3 rich' },
        { meal: 'Lean Beef Stir-fry', calories: caloriesPerMeal, protein: proteinPerMeal, carbs: carbsPerMeal, fats: fatsPerMeal, description: 'High protein' },
        { meal: 'Tofu Curry', calories: caloriesPerMeal, protein: proteinPerMeal, carbs: carbsPerMeal, fats: fatsPerMeal, description: 'Vegetarian option' }
      ],
      snacks: [
        { meal: 'Protein Shake', calories: Math.round(caloriesPerMeal * 0.5), protein: Math.round(proteinPerMeal * 0.8), carbs: Math.round(carbsPerMeal * 0.4), fats: Math.round(fatsPerMeal * 0.3), description: 'Post-workout' },
        { meal: 'Mixed Nuts', calories: Math.round(caloriesPerMeal * 0.5), protein: Math.round(proteinPerMeal * 0.3), carbs: Math.round(carbsPerMeal * 0.2), fats: Math.round(fatsPerMeal * 0.8), description: 'Healthy fats' },
        { meal: 'Apple with Peanut Butter', calories: Math.round(caloriesPerMeal * 0.5), protein: Math.round(proteinPerMeal * 0.4), carbs: Math.round(carbsPerMeal * 0.5), fats: Math.round(fatsPerMeal * 0.5), description: 'Energy boost' }
      ]
    },
    recommendations: [
      'Drink adequate water throughout the day',
      'Eat regularly to maintain metabolism',
      'Include a variety of colorful vegetables',
      'Prepare meals in advance for consistency'
    ],
    hydration: 'Aim for adequate water intake daily',
    supplements: ['Multivitamin', 'Omega-3', 'Vitamin D']
  };
}

module.exports = {
  generateAIWorkoutPlan,
  generateAINutritionPlan
};
