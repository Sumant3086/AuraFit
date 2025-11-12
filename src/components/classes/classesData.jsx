const classesByDay = {
    Monday: [
        { 
          name: 'Power Strength', 
          time: '6:00 AM - 7:00 AM', 
          trainer: 'Rajesh Kumar', 
          icon: 'FaDumbbell',
          description: 'Build explosive strength with compound movements - squats, deadlifts, and presses',
          level: 'Intermediate',
          duration: '60 min',
          spots: 15
        },
        { 
          name: 'Yoga Flow', 
          time: '7:30 AM - 8:30 AM', 
          trainer: 'Priya Sharma', 
          icon: 'FaSpa',
          description: 'Dynamic vinyasa flow combining breath work, flexibility, and mindfulness',
          level: 'All Levels',
          duration: '60 min',
          spots: 20
        },
        { 
          name: 'HIIT Cardio', 
          time: '5:00 PM - 6:00 PM', 
          trainer: 'Vikram Singh', 
          icon: 'FaRunning',
          description: 'Maximum calorie burn with high-intensity intervals - burn up to 600 calories',
          level: 'Advanced',
          duration: '60 min',
          spots: 12
        },
        { 
          name: 'Boxing Fitness', 
          time: '6:30 PM - 7:30 PM', 
          trainer: 'Arjun Patel', 
          icon: 'GiBoxingGlove',
          description: 'Professional boxing techniques combined with cardio conditioning and core work',
          level: 'Intermediate',
          duration: '60 min',
          spots: 15
        },
        { 
          name: 'Zumba Dance', 
          time: '8:00 PM - 9:00 PM', 
          trainer: 'Neha Kapoor', 
          icon: 'GiMusicalNotes',
          description: 'High-energy Latin-inspired dance workout - burn calories while having fun',
          level: 'All Levels',
          duration: '60 min',
          spots: 25
        },
      ],
      Tuesday: [
        { 
          name: 'Spinning Cycle', 
          time: '6:00 AM - 7:00 AM', 
          trainer: 'Amit Verma', 
          icon: 'FaBiking',
          description: 'Indoor cycling endurance',
          level: 'Intermediate',
          duration: '60 min',
          spots: 18
        },
        { 
          name: 'Pilates Core', 
          time: '10:00 AM - 11:00 AM', 
          trainer: 'Kavita Reddy', 
          icon: 'FaHeart',
          description: 'Core strengthening & flexibility',
          level: 'Beginner',
          duration: '60 min',
          spots: 15
        },
        { 
          name: 'CrossFit', 
          time: '5:30 PM - 6:30 PM', 
          trainer: 'Rohit Malhotra', 
          icon: 'GiWeightLiftingUp',
          description: 'Functional fitness training',
          level: 'Advanced',
          duration: '60 min',
          spots: 12
        },
        { 
          name: 'Yoga Therapy', 
          time: '7:00 PM - 8:00 PM', 
          trainer: 'Priya Sharma', 
          icon: 'FaSpa',
          description: 'Therapeutic yoga practice',
          level: 'All Levels',
          duration: '60 min',
          spots: 20
        },
      ],
      Wednesday: [
        { 
          name: 'Power Strength', 
          time: '6:00 AM - 7:00 AM', 
          trainer: 'Rajesh Kumar', 
          icon: 'FaDumbbell',
          description: 'Full body strength workout',
          level: 'Intermediate',
          duration: '60 min',
          spots: 15
        },
        { 
          name: 'Functional Training', 
          time: '11:00 AM - 12:00 PM', 
          trainer: 'Sanjay Gupta', 
          icon: 'GiMuscleUp',
          description: 'Movement-based training',
          level: 'Intermediate',
          duration: '60 min',
          spots: 14
        },
        { 
          name: 'Kickboxing', 
          time: '5:00 PM - 6:00 PM', 
          trainer: 'Arjun Patel', 
          icon: 'GiBoxingGlove',
          description: 'Martial arts cardio workout',
          level: 'Intermediate',
          duration: '60 min',
          spots: 15
        },
        { 
          name: 'Spinning Cycle', 
          time: '6:30 PM - 7:30 PM', 
          trainer: 'Amit Verma', 
          icon: 'FaBiking',
          description: 'High-energy cycling session',
          level: 'All Levels',
          duration: '60 min',
          spots: 18
        },
        { 
          name: 'Meditation & Stretching', 
          time: '8:00 PM - 9:00 PM', 
          trainer: 'Priya Sharma', 
          icon: 'FaSpa',
          description: 'Relaxation & flexibility',
          level: 'All Levels',
          duration: '60 min',
          spots: 25
        },
      ],
      Thursday: [
        { 
          name: 'Boot Camp', 
          time: '6:00 AM - 7:00 AM', 
          trainer: 'Vikram Singh', 
          icon: 'GiMuscleUp',
          description: 'Military-style fitness training',
          level: 'Advanced',
          duration: '60 min',
          spots: 12
        },
        { 
          name: 'Yoga Flow', 
          time: '7:30 AM - 8:30 AM', 
          trainer: 'Kavita Reddy', 
          icon: 'FaSpa',
          description: 'Dynamic yoga sequences',
          level: 'All Levels',
          duration: '60 min',
          spots: 20
        },
        { 
          name: 'Boxing Fitness', 
          time: '5:30 PM - 6:30 PM', 
          trainer: 'Arjun Patel', 
          icon: 'GiBoxingGlove',
          description: 'Boxing techniques & fitness',
          level: 'Intermediate',
          duration: '60 min',
          spots: 15
        },
        { 
          name: 'HIIT Cardio', 
          time: '7:00 PM - 8:00 PM', 
          trainer: 'Rohit Malhotra', 
          icon: 'FaRunning',
          description: 'Intense interval training',
          level: 'Advanced',
          duration: '60 min',
          spots: 12
        },
      ],
      Friday: [
        { 
          name: 'Spinning Cycle', 
          time: '6:00 AM - 7:00 AM', 
          trainer: 'Amit Verma', 
          icon: 'FaBiking',
          description: 'Morning cycling session',
          level: 'All Levels',
          duration: '60 min',
          spots: 18
        },
        { 
          name: 'Power Strength', 
          time: '10:00 AM - 11:00 AM', 
          trainer: 'Rajesh Kumar', 
          icon: 'FaDumbbell',
          description: 'Strength & muscle building',
          level: 'Intermediate',
          duration: '60 min',
          spots: 15
        },
        { 
          name: 'Zumba Dance', 
          time: '5:00 PM - 6:00 PM', 
          trainer: 'Neha Kapoor', 
          icon: 'GiMusicalNotes',
          description: 'Weekend dance party workout',
          level: 'All Levels',
          duration: '60 min',
          spots: 25
        },
        { 
          name: 'CrossFit', 
          time: '6:30 PM - 7:30 PM', 
          trainer: 'Rohit Malhotra', 
          icon: 'GiWeightLiftingUp',
          description: 'Functional fitness challenge',
          level: 'Advanced',
          duration: '60 min',
          spots: 12
        },
        { 
          name: 'Yoga & Meditation', 
          time: '8:00 PM - 9:00 PM', 
          trainer: 'Priya Sharma', 
          icon: 'FaSpa',
          description: 'Weekend relaxation session',
          level: 'All Levels',
          duration: '60 min',
          spots: 20
        },
      ],
      Saturday: [
        { 
          name: 'Yoga Flow', 
          time: '7:00 AM - 8:00 AM', 
          trainer: 'Priya Sharma', 
          icon: 'FaSpa',
          description: 'Weekend morning yoga',
          level: 'All Levels',
          duration: '60 min',
          spots: 20
        },
        { 
          name: 'Boot Camp', 
          time: '9:00 AM - 10:00 AM', 
          trainer: 'Vikram Singh', 
          icon: 'GiMuscleUp',
          description: 'Outdoor fitness challenge',
          level: 'Advanced',
          duration: '60 min',
          spots: 12
        },
        { 
          name: 'Spinning Cycle', 
          time: '11:00 AM - 12:00 PM', 
          trainer: 'Amit Verma', 
          icon: 'FaBiking',
          description: 'Weekend cycling session',
          level: 'Intermediate',
          duration: '60 min',
          spots: 18
        },
        { 
          name: 'Zumba Dance', 
          time: '4:00 PM - 5:00 PM', 
          trainer: 'Neha Kapoor', 
          icon: 'GiMusicalNotes',
          description: 'Saturday dance party',
          level: 'All Levels',
          duration: '60 min',
          spots: 25
        },
        { 
          name: 'Boxing Fitness', 
          time: '5:30 PM - 6:30 PM', 
          trainer: 'Arjun Patel', 
          icon: 'GiBoxingGlove',
          description: 'Weekend boxing workout',
          level: 'Intermediate',
          duration: '60 min',
          spots: 15
        },
      ],
      Sunday: [
        { 
          name: 'Yoga & Meditation', 
          time: '8:00 AM - 9:00 AM', 
          trainer: 'Kavita Reddy', 
          icon: 'FaSpa',
          description: 'Sunday morning relaxation',
          level: 'All Levels',
          duration: '60 min',
          spots: 20
        },
        { 
          name: 'Pilates Core', 
          time: '10:00 AM - 11:00 AM', 
          trainer: 'Priya Sharma', 
          icon: 'FaHeart',
          description: 'Core & flexibility training',
          level: 'Beginner',
          duration: '60 min',
          spots: 15
        },
        { 
          name: 'Functional Training', 
          time: '4:00 PM - 5:00 PM', 
          trainer: 'Sanjay Gupta', 
          icon: 'GiMuscleUp',
          description: 'Sunday functional workout',
          level: 'Intermediate',
          duration: '60 min',
          spots: 14
        },
        { 
          name: 'Spinning Cycle', 
          time: '5:30 PM - 6:30 PM', 
          trainer: 'Amit Verma', 
          icon: 'FaBiking',
          description: 'Weekend cycling session',
          level: 'All Levels',
          duration: '60 min',
          spots: 18
        },
      ]
  };

export default classesByDay;