// AI-Powered Workout Generation Service
// Generates personalized workout plans based on user profile

const generateEnhancedWorkoutPlan = async (userProfile) => {
  // Generate smart workout plan based on user profile
  return generateSmartWorkoutPlan(userProfile);
};

const generateSmartWorkoutPlan = (profile) => {
  const { fitnessLevel, goals, availableDays } = profile;
  
  // Enhanced workout templates with better descriptions
  const templates = {
    beginner: {
      'weight-loss': generateBeginnerWeightLoss(availableDays),
      'muscle-gain': generateBeginnerMuscleGain(availableDays)
    },
    intermediate: {
      'weight-loss': generateIntermediateWeightLoss(availableDays),
      'muscle-gain': generateIntermediateMuscleGain(availableDays)
    },
    advanced: {
      'weight-loss': generateAdvancedWeightLoss(availableDays),
      'muscle-gain': generateAdvancedMuscleGain(availableDays)
    }
  };
  
  const goalKey = goals.includes('weight-loss') ? 'weight-loss' : 'muscle-gain';
  return templates[fitnessLevel][goalKey];
};

// Helper functions for enhanced plans
function generateBeginnerWeightLoss(days) {
  return {
    planName: 'Beginner Fat Loss Program',
    description: 'Perfect for beginners focusing on fat loss with proper form and gradual progression',
    duration: `${days} days per week`,
    weeklySchedule: [
      {
        day: 'Monday',
        focus: 'Full Body + Cardio',
        workouts: [
          { exercise: 'Treadmill Walk', sets: 1, reps: '10 mins', rest: 'N/A', notes: 'Warm-up at comfortable pace', calories: '~80' },
          { exercise: 'Bodyweight Squats', sets: 3, reps: '12-15', rest: '60s', notes: 'Keep chest up, knees behind toes', muscles: 'Legs, Glutes' },
          { exercise: 'Push-ups (Knee)', sets: 3, reps: '8-10', rest: '60s', notes: 'Maintain straight line from head to knees', muscles: 'Chest, Triceps' },
          { exercise: 'Plank Hold', sets: 3, reps: '20-30s', rest: '45s', notes: 'Engage core, don\'t let hips sag', muscles: 'Core' },
          { exercise: 'Jumping Jacks', sets: 3, reps: '30', rest: '30s', notes: 'Great for calorie burn', calories: '~50' }
        ]
      }
    ],
    tips: [
      '🔥 Focus on consistency over intensity',
      '💧 Drink 3-4 liters of water daily',
      '😴 Get 7-8 hours of sleep for recovery',
      '🍎 Maintain a 300-500 calorie deficit',
      '📱 Track your workouts and progress',
      '🧘 Include stretching after each session'
    ],
    nutritionTips: [
      'Eat protein with every meal (dal, paneer, eggs)',
      'Include vegetables in lunch and dinner',
      'Avoid sugary drinks and processed foods',
      'Have your last meal 2-3 hours before bed'
    ]
  };
}

function generateIntermediateWeightLoss(days) {
  return {
    planName: 'Intermediate Fat Shredding Program',
    description: 'High-intensity program for experienced gym-goers targeting maximum fat loss',
    duration: `${days} days per week`,
    weeklySchedule: [
      {
        day: 'Monday',
        focus: 'HIIT + Lower Body',
        workouts: [
          { exercise: 'HIIT Sprints', sets: 8, reps: '30s on/30s off', rest: '30s', notes: 'Max effort sprints', calories: '~150' },
          { exercise: 'Barbell Squats', sets: 4, reps: '12-15', rest: '60s', notes: 'Go deep, maintain form', muscles: 'Quads, Glutes' },
          { exercise: 'Romanian Deadlifts', sets: 3, reps: '12-15', rest: '60s', notes: 'Feel hamstring stretch', muscles: 'Hamstrings, Lower Back' },
          { exercise: 'Walking Lunges', sets: 3, reps: '20 total', rest: '60s', notes: 'Alternate legs', muscles: 'Legs, Glutes' },
          { exercise: 'Mountain Climbers', sets: 4, reps: '30', rest: '30s', notes: 'Fast pace for cardio', calories: '~80' }
        ]
      }
    ],
    tips: [
      '🔥 Push yourself but listen to your body',
      '⏱️ Keep rest periods strict for fat burning',
      '💪 Progressive overload - increase weight weekly',
      '🥗 High protein, moderate carbs, low fat diet',
      '📊 Track body measurements weekly',
      '🏃 Add 10k steps daily for extra calorie burn'
    ]
  };
}

function generateBeginnerMuscleGain(days) {
  return {
    planName: 'Beginner Muscle Building Foundation',
    description: 'Build strength and muscle mass with compound movements and proper form',
    duration: `${days} days per week`,
    weeklySchedule: [
      {
        day: 'Monday',
        focus: 'Chest & Triceps',
        workouts: [
          { exercise: 'Barbell Bench Press', sets: 4, reps: '8-10', rest: '90s', notes: 'Lower to chest, press explosively', muscles: 'Chest, Triceps' },
          { exercise: 'Incline Dumbbell Press', sets: 3, reps: '10-12', rest: '75s', notes: '30-45 degree angle', muscles: 'Upper Chest' },
          { exercise: 'Cable Flyes', sets: 3, reps: '12-15', rest: '60s', notes: 'Stretch at bottom, squeeze at top', muscles: 'Chest' },
          { exercise: 'Tricep Dips', sets: 3, reps: '10-12', rest: '60s', notes: 'Lean forward for chest emphasis', muscles: 'Triceps' },
          { exercise: 'Overhead Tricep Extension', sets: 3, reps: '12-15', rest: '60s', notes: 'Full stretch, controlled movement', muscles: 'Triceps' }
        ]
      }
    ],
    tips: [
      '💪 Focus on progressive overload',
      '🍗 Eat in 300-500 calorie surplus',
      '🥚 Consume 2g protein per kg bodyweight',
      '😴 Sleep 8-9 hours for muscle recovery',
      '📈 Increase weights by 2.5-5kg weekly',
      '🥛 Consider protein supplements if needed'
    ]
  };
}

function generateIntermediateMuscleGain(days) {
  return {
    planName: 'Intermediate Hypertrophy Program',
    description: 'Advanced muscle building with volume and intensity techniques',
    duration: `${days} days per week`,
    weeklySchedule: [
      {
        day: 'Monday',
        focus: 'Chest & Triceps (Volume)',
        workouts: [
          { exercise: 'Barbell Bench Press', sets: 5, reps: '6-8', rest: '120s', notes: 'Heavy weight, perfect form', muscles: 'Chest, Triceps', intensity: 'High' },
          { exercise: 'Incline Barbell Press', sets: 4, reps: '8-10', rest: '90s', notes: 'Upper chest focus', muscles: 'Upper Chest' },
          { exercise: 'Dumbbell Flyes', sets: 3, reps: '12-15', rest: '60s', notes: 'Deep stretch, mind-muscle connection', muscles: 'Chest' },
          { exercise: 'Close-Grip Bench', sets: 4, reps: '8-10', rest: '90s', notes: 'Tricep emphasis', muscles: 'Triceps' },
          { exercise: 'Cable Pushdowns', sets: 3, reps: '15-20', rest: '45s', notes: 'Pump work, squeeze hard', muscles: 'Triceps' }
        ]
      }
    ],
    tips: [
      '🏋️ Train to near failure on last set',
      '🍖 Eat 2.2g protein per kg bodyweight',
      '⏱️ Rest 48-72 hours between muscle groups',
      '💊 Consider creatine supplementation',
      '📊 Track all lifts and aim for PR weekly',
      '🥗 Eat clean calories, avoid junk food'
    ]
  };
}

function generateAdvancedWeightLoss(days) {
  return {
    planName: 'Advanced Fat Burning Protocol',
    description: 'Elite-level fat loss with metabolic conditioning and strength preservation',
    duration: `${days} days per week`,
    weeklySchedule: [
      {
        day: 'Monday',
        focus: 'Metabolic Conditioning',
        workouts: [
          { exercise: 'Tabata Sprints', sets: 8, reps: '20s on/10s off', rest: '10s', notes: 'All-out effort', calories: '~200', intensity: 'Maximum' },
          { exercise: 'Barbell Complexes', sets: 5, reps: '6 each', rest: '90s', notes: 'Deadlift-Row-Clean-Press-Squat', muscles: 'Full Body' },
          { exercise: 'Burpee Box Jumps', sets: 4, reps: '10', rest: '60s', notes: 'Explosive power', calories: '~100' },
          { exercise: 'Kettlebell Swings', sets: 4, reps: '20', rest: '45s', notes: 'Hip drive, not arms', muscles: 'Posterior Chain' },
          { exercise: 'Battle Ropes', sets: 4, reps: '30s', rest: '30s', notes: 'Alternate waves, max intensity', calories: '~80' }
        ]
      }
    ],
    tips: [
      '🔥 Maintain muscle while cutting fat',
      '⚡ Keep intensity high, volume moderate',
      '🥩 High protein (2.5g/kg) to preserve muscle',
      '🏃 Add fasted cardio 3x per week',
      '📉 Aim for 0.5-1kg fat loss per week',
      '💧 Stay hydrated - 4-5 liters daily'
    ]
  };
}

function generateAdvancedMuscleGain(days) {
  return {
    planName: 'Advanced Mass Building Program',
    description: 'Elite hypertrophy protocol for experienced lifters',
    duration: `${days} days per week`,
    weeklySchedule: [
      {
        day: 'Monday',
        focus: 'Chest & Triceps (Power)',
        workouts: [
          { exercise: 'Barbell Bench Press', sets: 6, reps: '4-6', rest: '180s', notes: 'Max strength, perfect form', muscles: 'Chest, Triceps', intensity: 'Maximum' },
          { exercise: 'Weighted Dips', sets: 4, reps: '6-8', rest: '120s', notes: 'Add weight plates', muscles: 'Chest, Triceps' },
          { exercise: 'Incline Dumbbell Press', sets: 4, reps: '8-10', rest: '90s', notes: 'Hypertrophy range', muscles: 'Upper Chest' },
          { exercise: 'Cable Crossovers', sets: 4, reps: '12-15', rest: '60s', notes: 'Multiple angles', muscles: 'Chest' },
          { exercise: 'Overhead Tricep Extension', sets: 4, reps: '10-12', rest: '75s', notes: 'Full stretch', muscles: 'Triceps' }
        ]
      }
    ],
    tips: [
      '💪 Periodize training - strength, hypertrophy, deload',
      '🍖 Eat 500+ calorie surplus on training days',
      '😴 Sleep 9+ hours for optimal recovery',
      '💊 Consider supplements: Protein, Creatine, BCAAs',
      '📈 Track every workout, aim for progressive overload',
      '🧘 Include mobility work and stretching'
    ]
  };
}

module.exports = {
  generateEnhancedWorkoutPlan,
  generateSmartWorkoutPlan
};
