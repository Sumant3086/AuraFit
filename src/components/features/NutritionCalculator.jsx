import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './nutritionCalculator.css';
import { FaAppleAlt, FaCalculator, FaUser } from 'react-icons/fa';
import api from '../../services/api';

const NutritionCalculator = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    gender: 'male',
    weight: '',
    height: '',
    activityLevel: 'moderate',
    goal: 'maintenance',
    dietaryRestrictions: [],
    allergies: []
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
        weight: profileData.weight || '',
        height: profileData.height || '',
        activityLevel: profileData.activityLevel || 'moderate',
        goal: profileData.goals.includes('weight-loss') ? 'weight-loss' : 
              profileData.goals.includes('muscle-gain') ? 'muscle-gain' : 'maintenance',
        dietaryRestrictions: profileData.dietaryRestrictions || [],
        allergies: profileData.allergies || []
      });
      setHasProfile(true);
    }
  }, []);
  
  const [nutritionPlan, setNutritionPlan] = useState(null);
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
    setLoading(true);
    setError('');

    try {
      const response = await api.nutritionPlans.calculate({
        userId: formData.email,
        name: formData.name,
        email: formData.email,
        userProfile: {
          age: parseInt(formData.age),
          gender: formData.gender,
          weight: parseFloat(formData.weight),
          height: parseFloat(formData.height),
          activityLevel: formData.activityLevel,
          goal: formData.goal,
          dietaryRestrictions: formData.dietaryRestrictions,
          allergies: formData.allergies
        }
      });
      
      setNutritionPlan(response.data);
    } catch (err) {
      setError(err.message || 'Failed to calculate nutrition plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feature-section nutrition-calculator">
      <div className="feature-header">
        <div className="feature-icon"><FaAppleAlt /></div>
        <h2>Nutrition Calculator & Meal Planner</h2>
        <p>Get personalized nutrition recommendations and meal plans</p>
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

      <div className="nutrition-form-container">
        <form onSubmit={handleSubmit} className="nutrition-form">
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
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Weight (kg)</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                step="0.1"
                required
              />
            </div>
            <div className="form-group">
              <label>Height (cm)</label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                step="0.1"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Activity Level</label>
            <select name="activityLevel" value={formData.activityLevel} onChange={handleChange}>
              <option value="sedentary">Sedentary (little or no exercise)</option>
              <option value="light">Light (exercise 1-3 days/week)</option>
              <option value="moderate">Moderate (exercise 3-5 days/week)</option>
              <option value="active">Active (exercise 6-7 days/week)</option>
              <option value="very-active">Very Active (intense exercise daily)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Goal</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="goal"
                  value="weight-loss"
                  checked={formData.goal === 'weight-loss'}
                  onChange={handleChange}
                />
                Weight Loss
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="goal"
                  value="muscle-gain"
                  checked={formData.goal === 'muscle-gain'}
                  onChange={handleChange}
                />
                Muscle Gain
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="goal"
                  value="maintenance"
                  checked={formData.goal === 'maintenance'}
                  onChange={handleChange}
                />
                Maintenance
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Dietary Restrictions (Optional)</label>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="dietaryRestrictions"
                  value="vegetarian"
                  onChange={handleChange}
                />
                Vegetarian
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="dietaryRestrictions"
                  value="vegan"
                  onChange={handleChange}
                />
                Vegan
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="dietaryRestrictions"
                  value="gluten-free"
                  onChange={handleChange}
                />
                Gluten-Free
              </label>
            </div>
          </div>

          <button type="submit" className="calculate-btn" disabled={loading}>
            <FaCalculator /> {loading ? 'Calculating...' : 'Calculate My Nutrition Plan'}
          </button>

          {error && <p className="error-message">{error}</p>}
        </form>

        {nutritionPlan && (
          <div className="nutrition-results">
            <h3>Your Personalized Nutrition Plan</h3>
            
            <div className="macros-grid">
              <div className="macro-card">
                <div className="macro-label">Daily Calories</div>
                <div className="macro-value">{nutritionPlan.calculations.targetCalories}</div>
                <div className="macro-unit">kcal</div>
              </div>
              <div className="macro-card">
                <div className="macro-label">Protein</div>
                <div className="macro-value">{nutritionPlan.calculations.protein}</div>
                <div className="macro-unit">grams</div>
              </div>
              <div className="macro-card">
                <div className="macro-label">Carbs</div>
                <div className="macro-value">{nutritionPlan.calculations.carbs}</div>
                <div className="macro-unit">grams</div>
              </div>
              <div className="macro-card">
                <div className="macro-label">Fats</div>
                <div className="macro-value">{nutritionPlan.calculations.fats}</div>
                <div className="macro-unit">grams</div>
              </div>
            </div>

            <div className="meal-plan-section">
              <h4>Sample Meal Plan</h4>
              {Object.entries(nutritionPlan.mealPlan).map(([mealType, meals]) => (
                <div key={mealType} className="meal-type-section">
                  <h5>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</h5>
                  <div className="meals-grid">
                    {meals.map((meal, index) => (
                      <div key={index} className="meal-card">
                        <div className="meal-name">{meal.meal}</div>
                        <div className="meal-macros">
                          <span>{meal.calories} cal</span>
                          <span>P: {meal.protein}g</span>
                          <span>C: {meal.carbs}g</span>
                          <span>F: {meal.fats}g</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="recommendations-section">
              <h4>Recommendations</h4>
              <ul>
                {nutritionPlan.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NutritionCalculator;
