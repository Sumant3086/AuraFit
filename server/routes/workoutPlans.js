const express = require('express');
const router = express.Router();
const WorkoutPlan = require('../models/WorkoutPlan');

// Generate AI workout plan
router.post('/generate', async (req, res) => {
  try {
    const { userId, name, email, userProfile } = req.body;
    
    // Enhanced AI-powered workout plan generation
    const { generateSmartWorkoutPlan } = require('../services/openaiService');
    const generatedPlan = generateSmartWorkoutPlan(userProfile);
    
    try {
      // Try to save to database
      const workoutPlan = new WorkoutPlan({
        userId,
        name,
        email,
        userProfile,
        generatedPlan
      });
      
      await workoutPlan.save();
      
      res.status(201).json({ 
        success: true, 
        message: 'Enhanced workout plan generated successfully',
        data: workoutPlan 
      });
    } catch (dbError) {
      // If database save fails, still return the generated plan
      console.warn('Database save failed, returning plan without saving:', dbError.message);
      res.status(201).json({ 
        success: true, 
        message: 'Workout plan generated (not saved to database)',
        data: {
          userId,
          name,
          email,
          userProfile,
          generatedPlan,
          createdAt: new Date()
        }
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error generating workout plan', 
      error: error.message 
    });
  }
});

// Get workout plans by userId
router.get('/user/:userId', async (req, res) => {
  try {
    const plans = await WorkoutPlan.find({ 
      userId: req.params.userId,
      isActive: true 
    }).sort({ createdAt: -1 });
    
    res.json({ success: true, data: plans });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching workout plans', 
      error: error.message 
    });
  }
});

// Get specific workout plan
router.get('/:id', async (req, res) => {
  try {
    const plan = await WorkoutPlan.findById(req.params.id);
    
    if (!plan) {
      return res.status(404).json({ 
        success: false, 
        message: 'Workout plan not found' 
      });
    }
    
    res.json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching workout plan', 
      error: error.message 
    });
  }
});

// AI Workout Plan Generator Function
function generateWorkoutPlan(profile) {
  const { fitnessLevel, goals, availableDays, sessionDuration, equipment } = profile;
  
  // Base workout templates
  const workoutTemplates = {
    beginner: {
      'weight-loss': [
        { day: 'Monday', workouts: [
          { exercise: 'Brisk Walking', sets: 1, reps: '30 mins', rest: 'N/A', notes: 'Warm up for 5 mins' },
          { exercise: 'Bodyweight Squats', sets: 3, reps: '10-12', rest: '60s', notes: 'Focus on form' },
          { exercise: 'Push-ups (Modified)', sets: 3, reps: '8-10', rest: '60s', notes: 'Knee push-ups if needed' },
          { exercise: 'Plank', sets: 3, reps: '20-30s', rest: '45s', notes: 'Keep core tight' }
        ]},
        { day: 'Wednesday', workouts: [
          { exercise: 'Cycling', sets: 1, reps: '25 mins', rest: 'N/A', notes: 'Moderate intensity' },
          { exercise: 'Lunges', sets: 3, reps: '10 each leg', rest: '60s', notes: 'Alternate legs' },
          { exercise: 'Dumbbell Rows', sets: 3, reps: '10-12', rest: '60s', notes: 'Use light weights' },
          { exercise: 'Mountain Climbers', sets: 3, reps: '15-20', rest: '45s', notes: 'Controlled movement' }
        ]},
        { day: 'Friday', workouts: [
          { exercise: 'Jump Rope', sets: 3, reps: '2 mins', rest: '60s', notes: 'Or high knees' },
          { exercise: 'Goblet Squats', sets: 3, reps: '12-15', rest: '60s', notes: 'Hold dumbbell' },
          { exercise: 'Shoulder Press', sets: 3, reps: '10-12', rest: '60s', notes: 'Light dumbbells' },
          { exercise: 'Burpees', sets: 3, reps: '8-10', rest: '60s', notes: 'Modify as needed' }
        ]}
      ],
      'muscle-gain': [
        { day: 'Monday', workouts: [
          { exercise: 'Barbell Squats', sets: 4, reps: '8-10', rest: '90s', notes: 'Focus on depth' },
          { exercise: 'Leg Press', sets: 3, reps: '10-12', rest: '75s', notes: 'Full range of motion' },
          { exercise: 'Leg Curls', sets: 3, reps: '12-15', rest: '60s', notes: 'Controlled tempo' },
          { exercise: 'Calf Raises', sets: 4, reps: '15-20', rest: '45s', notes: 'Squeeze at top' }
        ]},
        { day: 'Wednesday', workouts: [
          { exercise: 'Bench Press', sets: 4, reps: '8-10', rest: '90s', notes: 'Chest to bar' },
          { exercise: 'Incline Dumbbell Press', sets: 3, reps: '10-12', rest: '75s', notes: '30-45 degree angle' },
          { exercise: 'Cable Flyes', sets: 3, reps: '12-15', rest: '60s', notes: 'Stretch at bottom' },
          { exercise: 'Tricep Dips', sets: 3, reps: '10-12', rest: '60s', notes: 'Lean forward' }
        ]},
        { day: 'Friday', workouts: [
          { exercise: 'Deadlifts', sets: 4, reps: '6-8', rest: '120s', notes: 'Keep back straight' },
          { exercise: 'Pull-ups', sets: 3, reps: '8-10', rest: '90s', notes: 'Use assistance if needed' },
          { exercise: 'Barbell Rows', sets: 3, reps: '10-12', rest: '75s', notes: 'Pull to lower chest' },
          { exercise: 'Bicep Curls', sets: 3, reps: '12-15', rest: '60s', notes: 'No swinging' }
        ]}
      ]
    },
    intermediate: {
      'weight-loss': [
        { day: 'Monday', workouts: [
          { exercise: 'HIIT Sprints', sets: 8, reps: '30s on/30s off', rest: '30s', notes: 'Max effort' },
          { exercise: 'Barbell Squats', sets: 4, reps: '12-15', rest: '60s', notes: 'Moderate weight' },
          { exercise: 'Romanian Deadlifts', sets: 3, reps: '12-15', rest: '60s', notes: 'Feel hamstring stretch' },
          { exercise: 'Box Jumps', sets: 3, reps: '10-12', rest: '60s', notes: 'Land softly' }
        ]},
        { day: 'Wednesday', workouts: [
          { exercise: 'Battle Ropes', sets: 4, reps: '30s', rest: '45s', notes: 'Alternate waves' },
          { exercise: 'Push-ups', sets: 4, reps: '15-20', rest: '45s', notes: 'Explosive if possible' },
          { exercise: 'Dumbbell Rows', sets: 4, reps: '12-15', rest: '60s', notes: 'Each arm' },
          { exercise: 'Kettlebell Swings', sets: 4, reps: '15-20', rest: '60s', notes: 'Hip drive' }
        ]},
        { day: 'Friday', workouts: [
          { exercise: 'Rowing Machine', sets: 1, reps: '20 mins', rest: 'N/A', notes: 'Intervals: 1min hard/1min easy' },
          { exercise: 'Thrusters', sets: 4, reps: '12-15', rest: '60s', notes: 'Squat to press' },
          { exercise: 'Pull-ups', sets: 4, reps: '8-12', rest: '75s', notes: 'Full range' },
          { exercise: 'Plank to Push-up', sets: 3, reps: '10-12', rest: '60s', notes: 'Alternate arms' }
        ]}
      ],
      'muscle-gain': [
        { day: 'Monday', workouts: [
          { exercise: 'Barbell Squats', sets: 5, reps: '6-8', rest: '120s', notes: 'Heavy weight' },
          { exercise: 'Front Squats', sets: 4, reps: '8-10', rest: '90s', notes: 'Upright torso' },
          { exercise: 'Bulgarian Split Squats', sets: 3, reps: '10-12 each', rest: '75s', notes: 'Rear foot elevated' },
          { exercise: 'Leg Extensions', sets: 3, reps: '12-15', rest: '60s', notes: 'Squeeze quads' }
        ]},
        { day: 'Wednesday', workouts: [
          { exercise: 'Bench Press', sets: 5, reps: '6-8', rest: '120s', notes: 'Progressive overload' },
          { exercise: 'Incline Barbell Press', sets: 4, reps: '8-10', rest: '90s', notes: 'Upper chest focus' },
          { exercise: 'Dumbbell Flyes', sets: 3, reps: '12-15', rest: '60s', notes: 'Deep stretch' },
          { exercise: 'Close-Grip Bench', sets: 3, reps: '10-12', rest: '75s', notes: 'Tricep emphasis' }
        ]},
        { day: 'Friday', workouts: [
          { exercise: 'Deadlifts', sets: 5, reps: '5-6', rest: '150s', notes: 'Heavy, perfect form' },
          { exercise: 'Weighted Pull-ups', sets: 4, reps: '6-8', rest: '120s', notes: 'Add weight' },
          { exercise: 'T-Bar Rows', sets: 4, reps: '8-10', rest: '90s', notes: 'Chest supported' },
          { exercise: 'Face Pulls', sets: 3, reps: '15-20', rest: '60s', notes: 'Rear delts' }
        ]}
      ]
    },
    advanced: {
      'weight-loss': [
        { day: 'Monday', workouts: [
          { exercise: 'Tabata Sprints', sets: 8, reps: '20s on/10s off', rest: '10s', notes: 'All-out effort' },
          { exercise: 'Barbell Complexes', sets: 5, reps: '6 each', rest: '90s', notes: 'Deadlift-Row-Clean-Press-Squat' },
          { exercise: 'Plyometric Push-ups', sets: 4, reps: '10-12', rest: '60s', notes: 'Explosive' },
          { exercise: 'Sled Pushes', sets: 4, reps: '30m', rest: '90s', notes: 'Heavy load' }
        ]},
        { day: 'Wednesday', workouts: [
          { exercise: 'Assault Bike', sets: 10, reps: '30s max/30s rest', rest: '30s', notes: 'Max calories' },
          { exercise: 'Clean and Press', sets: 5, reps: '5-6', rest: '120s', notes: 'Technical lift' },
          { exercise: 'Muscle-ups', sets: 4, reps: '5-8', rest: '120s', notes: 'Strict form' },
          { exercise: 'Turkish Get-ups', sets: 3, reps: '5 each side', rest: '90s', notes: 'Controlled' }
        ]},
        { day: 'Friday', workouts: [
          { exercise: 'CrossFit WOD', sets: 1, reps: 'AMRAP 20min', rest: 'N/A', notes: '5 Pull-ups, 10 Push-ups, 15 Squats' },
          { exercise: 'Snatch', sets: 5, reps: '3-5', rest: '150s', notes: 'Olympic lift' },
          { exercise: 'Handstand Push-ups', sets: 4, reps: '8-10', rest: '90s', notes: 'Wall assisted' },
          { exercise: 'Farmer Carries', sets: 4, reps: '50m', rest: '75s', notes: 'Heavy dumbbells' }
        ]}
      ],
      'muscle-gain': [
        { day: 'Monday', workouts: [
          { exercise: 'Barbell Squats', sets: 6, reps: '4-6', rest: '180s', notes: 'Max strength' },
          { exercise: 'Pause Squats', sets: 4, reps: '6-8', rest: '120s', notes: '3 second pause' },
          { exercise: 'Hack Squats', sets: 4, reps: '8-10', rest: '90s', notes: 'Deep stretch' },
          { exercise: 'Walking Lunges', sets: 3, reps: '15 each', rest: '75s', notes: 'Weighted' }
        ]},
        { day: 'Wednesday', workouts: [
          { exercise: 'Bench Press', sets: 6, reps: '4-6', rest: '180s', notes: 'Powerlifting style' },
          { exercise: 'Weighted Dips', sets: 4, reps: '6-8', rest: '120s', notes: 'Heavy weight' },
          { exercise: 'Cable Crossovers', sets: 4, reps: '12-15', rest: '60s', notes: 'Multiple angles' },
          { exercise: 'Overhead Tricep Extension', sets: 4, reps: '10-12', rest: '75s', notes: 'Full stretch' }
        ]},
        { day: 'Friday', workouts: [
          { exercise: 'Deadlifts', sets: 6, reps: '3-5', rest: '180s', notes: 'Competition style' },
          { exercise: 'Weighted Pull-ups', sets: 5, reps: '5-7', rest: '150s', notes: 'Heavy plates' },
          { exercise: 'Pendlay Rows', sets: 4, reps: '6-8', rest: '120s', notes: 'Explosive pull' },
          { exercise: 'Shrugs', sets: 4, reps: '12-15', rest: '60s', notes: 'Heavy weight' }
        ]}
      ]
    }
  };
  
  // Select appropriate template
  const levelTemplates = workoutTemplates[fitnessLevel] || workoutTemplates.beginner;
  const goalKey = goals.includes('weight-loss') ? 'weight-loss' : 'muscle-gain';
  let schedule = levelTemplates[goalKey] || levelTemplates['weight-loss'];
  
  // Adjust based on available days
  if (availableDays < schedule.length) {
    schedule = schedule.slice(0, availableDays);
  }
  
  return {
    planName: `${fitnessLevel.charAt(0).toUpperCase() + fitnessLevel.slice(1)} ${goalKey.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Plan`,
    duration: `${availableDays} days per week`,
    description: `Personalized ${fitnessLevel} level workout plan designed for ${goalKey.replace('-', ' ')}`,
    weeklySchedule: schedule,
    tips: [
      'Always warm up for 5-10 minutes before starting',
      'Focus on proper form over heavy weights',
      'Stay hydrated throughout your workout',
      'Get adequate rest between workout days',
      'Track your progress and adjust weights accordingly',
      'Listen to your body and avoid overtraining'
    ]
  };
}

module.exports = router;
