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
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const selectedDays = daysOfWeek.slice(0, days);
  
  return {
    planName: 'Beginner Fat Loss Program',
    description: 'Perfect for beginners focusing on fat loss with proper form and gradual progression',
    duration: `${days} days per week`,
    weeklySchedule: selectedDays.map(day => ({
      day,
      focus: 'Full Body + Cardio',
      workouts: [
        { exercise: 'Treadmill Walk', sets: 'warm-up', reps: 'moderate duration', rest: 'N/A', notes: 'Warm-up at comfortable pace', calories: 'moderate' },
        { exercise: 'Bodyweight Squats', sets: 'moderate', reps: 'moderate range', rest: 'moderate', notes: 'Keep chest up, knees behind toes', muscles: 'Legs, Glutes' },
        { exercise: 'Push-ups (Knee)', sets: 'moderate', reps: 'moderate range', rest: 'moderate', notes: 'Maintain straight line from head to knees', muscles: 'Chest, Triceps' },
        { exercise: 'Plank Hold', sets: 'moderate', reps: 'moderate duration', rest: 'short', notes: 'Engage core, don\'t let hips sag', muscles: 'Core' },
        { exercise: 'Jumping Jacks', sets: 'moderate', reps: 'moderate count', rest: 'short', notes: 'Great for calorie burn', calories: 'moderate' }
      ]
    })),
    tips: [
      '🔥 Focus on consistency over intensity',
      '💧 Stay well hydrated throughout the day',
      '😴 Get adequate sleep for recovery',
      '🍎 Maintain a moderate calorie deficit',
      '📱 Track your workouts and progress',
      '🧘 Include stretching after each session'
    ],
    nutritionTips: [
      'Eat protein with every meal (dal, paneer, eggs)',
      'Include vegetables in lunch and dinner',
      'Avoid sugary drinks and processed foods',
      'Have your last meal a few hours before bed'
    ]
  };
}

function generateIntermediateWeightLoss(days) {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const selectedDays = daysOfWeek.slice(0, days);
  
  return {
    planName: 'Intermediate Fat Shredding Program',
    description: 'High-intensity program for experienced gym-goers targeting maximum fat loss',
    duration: `${days} days per week`,
    weeklySchedule: selectedDays.map(day => ({
      day,
      focus: 'HIIT + Lower Body',
      workouts: [
        { exercise: 'HIIT Sprints', sets: 'multiple', reps: 'intervals', rest: 'short', notes: 'Max effort sprints', calories: 'high' },
        { exercise: 'Barbell Squats', sets: 'moderate-high', reps: 'moderate range', rest: 'moderate', notes: 'Go deep, maintain form', muscles: 'Quads, Glutes' },
        { exercise: 'Romanian Deadlifts', sets: 'moderate', reps: 'moderate range', rest: 'moderate', notes: 'Feel hamstring stretch', muscles: 'Hamstrings, Lower Back' },
        { exercise: 'Walking Lunges', sets: 'moderate', reps: 'moderate total', rest: 'moderate', notes: 'Alternate legs', muscles: 'Legs, Glutes' },
        { exercise: 'Mountain Climbers', sets: 'moderate-high', reps: 'moderate count', rest: 'short', notes: 'Fast pace for cardio', calories: 'moderate' }
      ]
    })),
    tips: [
      '🔥 Push yourself but listen to your body',
      '⏱️ Keep rest periods strict for fat burning',
      '💪 Progressive overload - increase weight regularly',
      '🥗 High protein, moderate carbs, low fat diet',
      '📊 Track body measurements regularly',
      '🏃 Add daily steps for extra calorie burn'
    ]
  };
}

function generateBeginnerMuscleGain(days) {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const selectedDays = daysOfWeek.slice(0, days);
  
  return {
    planName: 'Beginner Muscle Building Foundation',
    description: 'Build strength and muscle mass with compound movements and proper form',
    duration: `${days} days per week`,
    weeklySchedule: selectedDays.map(day => ({
      day,
      focus: 'Chest & Triceps',
      workouts: [
        { exercise: 'Barbell Bench Press', sets: 'moderate-high', reps: 'moderate range', rest: 'moderate-long', notes: 'Lower to chest, press explosively', muscles: 'Chest, Triceps' },
        { exercise: 'Incline Dumbbell Press', sets: 'moderate', reps: 'moderate range', rest: 'moderate', notes: 'appropriate angle', muscles: 'Upper Chest' },
        { exercise: 'Cable Flyes', sets: 'moderate', reps: 'moderate-high range', rest: 'moderate', notes: 'Stretch at bottom, squeeze at top', muscles: 'Chest' },
        { exercise: 'Tricep Dips', sets: 'moderate', reps: 'moderate range', rest: 'moderate', notes: 'Lean forward for chest emphasis', muscles: 'Triceps' },
        { exercise: 'Overhead Tricep Extension', sets: 'moderate', reps: 'moderate-high range', rest: 'moderate', notes: 'Full stretch, controlled movement', muscles: 'Triceps' }
      ]
    })),
    tips: [
      '💪 Focus on progressive overload',
      '🍗 Eat in moderate calorie surplus',
      '🥚 Consume adequate protein per kg bodyweight',
      '😴 Get plenty of sleep for muscle recovery',
      '📈 Increase weights progressively',
      '🥛 Consider protein supplements if needed'
    ]
  };
}

function generateIntermediateMuscleGain(days) {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const selectedDays = daysOfWeek.slice(0, days);
  
  return {
    planName: 'Intermediate Hypertrophy Program',
    description: 'Advanced muscle building with volume and intensity techniques',
    duration: `${days} days per week`,
    weeklySchedule: selectedDays.map(day => ({
      day,
      focus: 'Chest & Triceps (Volume)',
      workouts: [
        { exercise: 'Barbell Bench Press', sets: 'high', reps: 'low-moderate range', rest: 'long', notes: 'Heavy weight, perfect form', muscles: 'Chest, Triceps', intensity: 'High' },
        { exercise: 'Incline Barbell Press', sets: 'moderate-high', reps: 'moderate range', rest: 'moderate-long', notes: 'Upper chest focus', muscles: 'Upper Chest' },
        { exercise: 'Dumbbell Flyes', sets: 'moderate', reps: 'moderate-high range', rest: 'moderate', notes: 'Deep stretch, mind-muscle connection', muscles: 'Chest' },
        { exercise: 'Close-Grip Bench', sets: 'moderate-high', reps: 'moderate range', rest: 'moderate-long', notes: 'Tricep emphasis', muscles: 'Triceps' },
        { exercise: 'Cable Pushdowns', sets: 'moderate', reps: 'high range', rest: 'short', notes: 'Pump work, squeeze hard', muscles: 'Triceps' }
      ]
    })),
    tips: [
      '🏋️ Train to near failure on last set',
      '🍖 Eat adequate protein per kg bodyweight',
      '⏱️ Rest adequately between muscle groups',
      '💊 Consider creatine supplementation',
      '📊 Track all lifts and aim for PR regularly',
      '🥗 Eat clean calories, avoid junk food'
    ]
  };
}

function generateAdvancedWeightLoss(days) {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const selectedDays = daysOfWeek.slice(0, days);
  
  return {
    planName: 'Advanced Fat Burning Protocol',
    description: 'Elite-level fat loss with metabolic conditioning and strength preservation',
    duration: `${days} days per week`,
    weeklySchedule: selectedDays.map(day => ({
      day,
      focus: 'Metabolic Conditioning',
      workouts: [
        { exercise: 'Tabata Sprints', sets: 'multiple', reps: 'intervals', rest: 'minimal', notes: 'All-out effort', calories: 'very high', intensity: 'Maximum' },
        { exercise: 'Barbell Complexes', sets: 'high', reps: 'each movement', rest: 'moderate-long', notes: 'Deadlift-Row-Clean-Press-Squat', muscles: 'Full Body' },
        { exercise: 'Burpee Box Jumps', sets: 'moderate-high', reps: 'moderate count', rest: 'moderate', notes: 'Explosive power', calories: 'high' },
        { exercise: 'Kettlebell Swings', sets: 'moderate-high', reps: 'moderate-high count', rest: 'short', notes: 'Hip drive, not arms', muscles: 'Posterior Chain' },
        { exercise: 'Battle Ropes', sets: 'moderate-high', reps: 'moderate duration', rest: 'short', notes: 'Alternate waves, max intensity', calories: 'moderate' }
      ]
    })),
    tips: [
      '🔥 Maintain muscle while cutting fat',
      '⚡ Keep intensity high, volume moderate',
      '🥩 High protein to preserve muscle',
      '🏃 Add fasted cardio regularly',
      '📉 Aim for steady fat loss',
      '💧 Stay well hydrated'
    ]
  };
}

function generateAdvancedMuscleGain(days) {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const selectedDays = daysOfWeek.slice(0, days);
  
  return {
    planName: 'Advanced Mass Building Program',
    description: 'Elite hypertrophy protocol for experienced lifters',
    duration: `${days} days per week`,
    weeklySchedule: selectedDays.map(day => ({
      day,
      focus: 'Chest & Triceps (Power)',
      workouts: [
        { exercise: 'Barbell Bench Press', sets: 'high', reps: 'low range', rest: 'very long', notes: 'Max strength, perfect form', muscles: 'Chest, Triceps', intensity: 'Maximum' },
        { exercise: 'Weighted Dips', sets: 'moderate-high', reps: 'low-moderate range', rest: 'long', notes: 'Add weight plates', muscles: 'Chest, Triceps' },
        { exercise: 'Incline Dumbbell Press', sets: 'moderate-high', reps: 'moderate range', rest: 'moderate-long', notes: 'Hypertrophy range', muscles: 'Upper Chest' },
        { exercise: 'Cable Crossovers', sets: 'moderate-high', reps: 'moderate-high range', rest: 'moderate', notes: 'Multiple angles', muscles: 'Chest' },
        { exercise: 'Overhead Tricep Extension', sets: 'moderate-high', reps: 'moderate range', rest: 'moderate', notes: 'Full stretch', muscles: 'Triceps' }
      ]
    })),
    tips: [
      '💪 Periodize training - strength, hypertrophy, deload',
      '🍖 Eat significant calorie surplus on training days',
      '😴 Get plenty of sleep for optimal recovery',
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
