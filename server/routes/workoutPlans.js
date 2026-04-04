const express = require('express');
const router = express.Router();
const WorkoutPlan = require('../models/WorkoutPlan');

// Generate AI workout plan
router.post('/generate', async (req, res) => {
  try {
    const { userId, name, email, userProfile } = req.body;
    
    console.log('🤖 Generating AI workout plan for:', name);
    
    // Try AI-powered generation first
    const { generateAIWorkoutPlan } = require('../services/geminiService');
    const generatedPlan = await generateAIWorkoutPlan(userProfile);
    
    console.log('✅ AI workout plan generated successfully');
    
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
        message: 'AI-powered workout plan generated successfully',
        data: workoutPlan 
      });
    } catch (dbError) {
      // If database save fails, still return the generated plan
      console.warn('⚠️ Database save failed, returning plan without saving:', dbError.message);
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
    console.error('❌ Error generating workout plan:', error);
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
  
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const selectedDays = daysOfWeek.slice(0, availableDays);
  
  // Base workout templates with dynamic values
  const workoutTemplates = {
    beginner: {
      'weight-loss': selectedDays.map(day => ({ 
        day, 
        workouts: [
          { exercise: 'Brisk Walking', sets: 'warm-up', reps: 'moderate duration', rest: 'N/A', notes: 'Warm up first' },
          { exercise: 'Bodyweight Squats', sets: 'moderate', reps: 'moderate range', rest: 'moderate', notes: 'Focus on form' },
          { exercise: 'Push-ups (Modified)', sets: 'moderate', reps: 'moderate range', rest: 'moderate', notes: 'Knee push-ups if needed' },
          { exercise: 'Plank', sets: 'moderate', reps: 'moderate duration', rest: 'short', notes: 'Keep core tight' }
        ]
      })),
      'muscle-gain': selectedDays.map(day => ({ 
        day, 
        workouts: [
          { exercise: 'Barbell Squats', sets: 'moderate-high', reps: 'moderate range', rest: 'moderate-long', notes: 'Focus on depth' },
          { exercise: 'Leg Press', sets: 'moderate', reps: 'moderate range', rest: 'moderate', notes: 'Full range of motion' },
          { exercise: 'Leg Curls', sets: 'moderate', reps: 'moderate-high range', rest: 'moderate', notes: 'Controlled tempo' },
          { exercise: 'Calf Raises', sets: 'moderate-high', reps: 'high range', rest: 'short', notes: 'Squeeze at top' }
        ]
      }))
    },
    intermediate: {
      'weight-loss': selectedDays.map(day => ({ 
        day, 
        workouts: [
          { exercise: 'HIIT Sprints', sets: 'multiple', reps: 'intervals', rest: 'short', notes: 'Max effort' },
          { exercise: 'Barbell Squats', sets: 'moderate-high', reps: 'moderate-high range', rest: 'moderate', notes: 'Moderate weight' },
          { exercise: 'Romanian Deadlifts', sets: 'moderate', reps: 'moderate-high range', rest: 'moderate', notes: 'Feel hamstring stretch' },
          { exercise: 'Box Jumps', sets: 'moderate', reps: 'moderate range', rest: 'moderate', notes: 'Land softly' }
        ]
      })),
      'muscle-gain': selectedDays.map(day => ({ 
        day, 
        workouts: [
          { exercise: 'Barbell Squats', sets: 'high', reps: 'low-moderate range', rest: 'long', notes: 'Heavy weight' },
          { exercise: 'Front Squats', sets: 'moderate-high', reps: 'moderate range', rest: 'moderate-long', notes: 'Upright torso' },
          { exercise: 'Bulgarian Split Squats', sets: 'moderate', reps: 'moderate range each', rest: 'moderate', notes: 'Rear foot elevated' },
          { exercise: 'Leg Extensions', sets: 'moderate', reps: 'moderate-high range', rest: 'moderate', notes: 'Squeeze quads' }
        ]
      }))
    },
    advanced: {
      'weight-loss': selectedDays.map(day => ({ 
        day, 
        workouts: [
          { exercise: 'Tabata Sprints', sets: 'multiple', reps: 'intervals', rest: 'minimal', notes: 'All-out effort' },
          { exercise: 'Barbell Complexes', sets: 'high', reps: 'each movement', rest: 'moderate-long', notes: 'Deadlift-Row-Clean-Press-Squat' },
          { exercise: 'Plyometric Push-ups', sets: 'moderate-high', reps: 'moderate range', rest: 'moderate', notes: 'Explosive' },
          { exercise: 'Sled Pushes', sets: 'moderate-high', reps: 'moderate distance', rest: 'moderate-long', notes: 'Heavy load' }
        ]
      })),
      'muscle-gain': selectedDays.map(day => ({ 
        day, 
        workouts: [
          { exercise: 'Deadlifts', sets: 'high', reps: 'low range', rest: 'very long', notes: 'Heavy, perfect form' },
          { exercise: 'Weighted Pull-ups', sets: 'moderate-high', reps: 'low-moderate range', rest: 'long', notes: 'Add weight' },
          { exercise: 'T-Bar Rows', sets: 'moderate-high', reps: 'moderate range', rest: 'moderate-long', notes: 'Chest supported' },
          { exercise: 'Face Pulls', sets: 'moderate', reps: 'high range', rest: 'moderate', notes: 'Rear delts' }
        ]
      }))
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
      'Always warm up before starting',
      'Focus on proper form over heavy weights',
      'Stay hydrated throughout your workout',
      'Get adequate rest between workout days',
      'Track your progress and adjust weights accordingly',
      'Listen to your body and avoid overtraining'
    ]
  };
}

module.exports = router;
