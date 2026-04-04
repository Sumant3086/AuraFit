import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './workoutGenerator.css';
import { FaDumbbell, FaRobot, FaUser } from 'react-icons/fa';
import api from '../../services/api';

const WorkoutGenerator = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    gender: 'male',
    fitnessLevel: 'beginner',
    goals: [],
    availableDays: 3,
    sessionDuration: 60,
    equipment: [],
    injuries: []
  });
  
  const [hasProfile, setHasProfile] = useState(false);

  // Load profile data on component mount
  useEffect(() => {
    const profile = localStorage.getItem('userProfile');
    if (profile) {
      const profileData = JSON.parse(profile);
      setFormData({
        name: profileData.name || '',
        email: profileData.email || '',
        age: profileData.age || '',
        gender: profileData.gender || 'male',
        fitnessLevel: profileData.fitnessLevel || 'beginner',
        goals: profileData.goals || [],
        availableDays: 3,
        sessionDuration: 60,
        equipment: [],
        injuries: profileData.injuries || []
      });
      setHasProfile(true);
    }
  }, []);
  
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      const array = formData[name];
      if (checked) {
        setFormData({ ...formData, [name]: [...array, value] });
      } else {
        setFormData({ ...formData, [name]: array.filter(item => item !== value) });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.goals.length === 0) {
      setError('Please select at least one fitness goal');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const response = await api.workoutPlans.generate({
        userId: formData.email,
        name: formData.name,
        email: formData.email,
        userProfile: {
          age: parseInt(formData.age),
          gender: formData.gender,
          fitnessLevel: formData.fitnessLevel,
          goals: formData.goals,
          availableDays: parseInt(formData.availableDays),
          sessionDuration: parseInt(formData.sessionDuration),
          equipment: formData.equipment,
          injuries: formData.injuries
        }
      });
      
      if (response.success && response.data && response.data.generatedPlan) {
        setGeneratedPlan(response.data.generatedPlan);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Workout generation error:', err);
      setError('Unable to connect to server. Please make sure the backend is running on port 5000.');
      
      // Provide a fallback plan
      const fallbackPlan = generateFallbackPlan(formData);
      setGeneratedPlan(fallbackPlan);
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackPlan = (data) => {
    const { fitnessLevel, goals, availableDays } = data;
    const goalText = goals.join(', ') || 'general fitness';
    
    return {
      planName: `${fitnessLevel.charAt(0).toUpperCase() + fitnessLevel.slice(1)} ${goalText} Plan`,
      description: `Personalized ${fitnessLevel} level workout plan designed for ${goalText}`,
      duration: `${availableDays} days per week`,
      weeklySchedule: [
        {
          day: 'Monday',
          workouts: [
            { exercise: 'Warm-up Cardio', sets: 'warm-up', reps: 'moderate duration', rest: 'N/A', notes: 'Light jog or cycling' },
            { exercise: 'Squats', sets: 'moderate', reps: 'moderate range', rest: 'moderate', notes: 'Bodyweight or weighted' },
            { exercise: 'Push-ups', sets: 'moderate', reps: 'moderate range', rest: 'moderate', notes: 'Modify as needed' },
            { exercise: 'Plank', sets: 'moderate', reps: 'moderate duration', rest: 'short', notes: 'Keep core tight' }
          ]
        },
        {
          day: 'Wednesday',
          workouts: [
            { exercise: 'Cycling', sets: 'warm-up', reps: 'moderate duration', rest: 'N/A', notes: 'Moderate intensity' },
            { exercise: 'Lunges', sets: 'moderate', reps: 'each leg', rest: 'moderate', notes: 'Alternate legs' },
            { exercise: 'Dumbbell Rows', sets: 'moderate', reps: 'moderate range', rest: 'moderate', notes: 'Each arm' },
            { exercise: 'Mountain Climbers', sets: 'moderate', reps: 'moderate count', rest: 'short', notes: 'Controlled pace' }
          ]
        },
        {
          day: 'Friday',
          workouts: [
            { exercise: 'Jump Rope', sets: 'moderate', reps: 'moderate duration', rest: 'moderate', notes: 'Or high knees' },
            { exercise: 'Deadlifts', sets: 'moderate', reps: 'moderate range', rest: 'moderate-long', notes: 'Light to moderate weight' },
            { exercise: 'Shoulder Press', sets: 'moderate', reps: 'moderate range', rest: 'moderate', notes: 'Dumbbells or barbell' },
            { exercise: 'Burpees', sets: 'moderate', reps: 'moderate count', rest: 'moderate', notes: 'Full body exercise' }
          ]
        }
      ].slice(0, availableDays),
      tips: [
        'Always warm up before starting your workout',
        'Focus on proper form over heavy weights',
        'Stay hydrated throughout your session',
        'Get adequate rest between workout days',
        'Track your progress weekly',
        'Listen to your body and avoid overtraining'
      ]
    };
  };

  return (
    <div className="feature-section workout-generator">
      <div className="feature-header">
        <div className="feature-icon"><FaRobot /></div>
        <h2>AI Workout Plan Generator</h2>
        <p>Get a personalized workout plan tailored to your goals and fitness level</p>
        {!hasProfile && (
          <div className="profile-notice">
            <FaUser /> 
            <span>Complete your <Link to="/profile" className="profile-link-inline">profile</Link> to skip filling this form</span>
          </div>
        )}
        {hasProfile && (
          <div className="profile-loaded">
            ✓ Profile data loaded! <Link to="/profile" className="profile-link-inline">Edit Profile</Link>
          </div>
        )}
      </div>

      <div className="workout-form-container">
        <form onSubmit={handleSubmit} className="workout-form">
          <div className="form-row">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                min="13"
                max="100"
                required
              />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Fitness Level</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="fitnessLevel"
                  value="beginner"
                  checked={formData.fitnessLevel === 'beginner'}
                  onChange={handleChange}
                />
                Beginner
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="fitnessLevel"
                  value="intermediate"
                  checked={formData.fitnessLevel === 'intermediate'}
                  onChange={handleChange}
                />
                Intermediate
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="fitnessLevel"
                  value="advanced"
                  checked={formData.fitnessLevel === 'advanced'}
                  onChange={handleChange}
                />
                Advanced
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Goals (Select all that apply)</label>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="goals"
                  value="weight-loss"
                  onChange={handleChange}
                />
                Weight Loss
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="goals"
                  value="muscle-gain"
                  onChange={handleChange}
                />
                Muscle Gain
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="goals"
                  value="strength"
                  onChange={handleChange}
                />
                Strength
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="goals"
                  value="endurance"
                  onChange={handleChange}
                />
                Endurance
              </label>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Days per Week</label>
              <select name="availableDays" value={formData.availableDays} onChange={handleChange}>
                <option value="2">2 days</option>
                <option value="3">3 days</option>
                <option value="4">4 days</option>
                <option value="5">5 days</option>
                <option value="6">6 days</option>
              </select>
            </div>
            <div className="form-group">
              <label>Session Duration (minutes)</label>
              <select name="sessionDuration" value={formData.sessionDuration} onChange={handleChange}>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
                <option value="90">90 minutes</option>
              </select>
            </div>
          </div>

          <button type="submit" className="generate-btn" disabled={loading}>
            <FaDumbbell /> {loading ? 'Generating...' : 'Generate My Workout Plan'}
          </button>

          {error && <p className="error-message">{error}</p>}
        </form>

        {generatedPlan && (
          <div className="generated-plan">
            <h3>{generatedPlan.planName}</h3>
            <p className="plan-description">{generatedPlan.description}</p>
            <p className="plan-duration"><strong>Duration:</strong> {generatedPlan.duration}</p>

            <div className="weekly-schedule">
              {generatedPlan.weeklySchedule.map((day, index) => (
                <div key={index} className="day-section">
                  <div className="day-header">
                    <div className="day-title">{day.day}</div>
                    <div className="day-focus">{day.focus}</div>
                  </div>
                  
                  <div className="workout-table-container">
                    <table className="workout-table">
                      <thead>
                        <tr>
                          <th>Exercise</th>
                          <th>Sets × Reps</th>
                          <th>Rest</th>
                          <th>Notes</th>
                          <th>Calories</th>
                        </tr>
                      </thead>
                      <tbody>
                        {day.workouts.map((workout, wIndex) => (
                          <tr key={wIndex}>
                            <td data-label="Exercise">
                              <div className="exercise-name">{workout.exercise}</div>
                              {workout.muscles && (
                                <div className="exercise-muscles">🎯 {workout.muscles}</div>
                              )}
                            </td>
                            <td data-label="Sets × Reps">
                              <span className="sets-reps">{workout.sets} × {workout.reps}</span>
                            </td>
                            <td data-label="Rest">
                              <span className="rest-time">{workout.rest}</span>
                            </td>
                            <td data-label="Notes">
                              <div className="exercise-notes">{workout.notes}</div>
                            </td>
                            <td data-label="Calories">
                              {workout.calories && (
                                <span className="calories-badge">{workout.calories}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>

            <div className="plan-tips">
              <h4>💡 Tips for Success:</h4>
              <ul>
                {generatedPlan.tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>

            {generatedPlan.nutritionTips && (
              <div className="plan-tips" style={{borderLeftColor: '#00ff88', background: 'rgba(0, 255, 136, 0.1)'}}>
                <h4 style={{color: '#00ff88'}}>🥗 Nutrition Tips:</h4>
                <ul>
                  {generatedPlan.nutritionTips.map((tip, index) => (
                    <li key={index} style={{color: '#ccc'}}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutGenerator;
