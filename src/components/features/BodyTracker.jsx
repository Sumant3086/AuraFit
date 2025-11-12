import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './bodyTracker.css';
import { FaChartLine, FaWeight, FaUser } from 'react-icons/fa';
import api from '../../services/api';

const BodyTracker = () => {
  const [formData, setFormData] = useState({
    userId: '',
    name: '',
    email: '',
    weight: '',
    height: '',
    chest: '',
    waist: '',
    hips: '',
    biceps: '',
    thighs: '',
    bodyFat: '',
    notes: ''
  });
  
  const [hasProfile, setHasProfile] = useState(false);

  // Load profile data on component mount
  useEffect(() => {
    const profile = localStorage.getItem('userProfile');
    if (profile) {
      const profileData = JSON.parse(profile);
      setFormData(prev => ({
        ...prev,
        userId: profileData.email || '',
        name: profileData.name || '',
        email: profileData.email || '',
        weight: profileData.weight || '',
        height: profileData.height || ''
      }));
      setHasProfile(true);
    }
  }, []);
  
  const [goalData, setGoalData] = useState({
    targetWeight: '',
    targetBodyFat: '',
    goalType: 'weight-loss'
  });
  
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleGoalChange = (e) => {
    const { name, value } = e.target;
    setGoalData({ ...goalData, [name]: value });
  };

  const calculateBMI = (weight, height) => {
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const bmi = calculateBMI(parseFloat(formData.weight), parseFloat(formData.height));
      
      await api.progressTracker.create({
        userId: formData.email,
        name: formData.name,
        email: formData.email,
        measurements: {
          weight: parseFloat(formData.weight),
          height: parseFloat(formData.height),
          chest: parseFloat(formData.chest) || 0,
          waist: parseFloat(formData.waist) || 0,
          hips: parseFloat(formData.hips) || 0,
          biceps: parseFloat(formData.biceps) || 0,
          thighs: parseFloat(formData.thighs) || 0,
          bodyFat: parseFloat(formData.bodyFat) || 0,
          bmi: parseFloat(bmi),
          notes: formData.notes
        },
        goals: {
          targetWeight: parseFloat(goalData.targetWeight) || 0,
          targetBodyFat: parseFloat(goalData.targetBodyFat) || 0,
          goalType: goalData.goalType
        }
      });
      
      setSuccess('Progress tracked successfully!');
      
      // Reset form
      setFormData({
        userId: formData.email,
        name: formData.name,
        email: formData.email,
        weight: '',
        height: '',
        chest: '',
        waist: '',
        hips: '',
        biceps: '',
        thighs: '',
        bodyFat: '',
        notes: ''
      });
    } catch (err) {
      setError(err.message || 'Failed to track progress');
    } finally {
      setLoading(false);
    }
  };

  const fetchComparison = async () => {
    if (!formData.email) {
      setError('Please enter your email to view comparison');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.progressTracker.getComparison(formData.email);
      setComparison(response.data);
    } catch (err) {
      setError(err.message || 'Not enough data for comparison');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feature-section body-tracker">
      <div className="feature-header">
        <div className="feature-icon"><FaChartLine /></div>
        <h2>Body Measurement Tracker</h2>
        <p>Track your progress with detailed measurements and before/after comparisons</p>
        {!hasProfile && (
          <div className="profile-notice">
            <FaUser /> 
            <span>Complete your <Link to="/profile" className="profile-link-inline">profile</Link> to skip filling basic info</span>
          </div>
        )}
        {hasProfile && (
          <div className="profile-loaded">
            ✓ Profile data loaded! <Link to="/profile" className="profile-link-inline">Edit Profile</Link>
          </div>
        )}
      </div>

      <div className="tracker-container">
        <form onSubmit={handleSubmit} className="tracker-form">
          <div className="form-section">
            <h4>Personal Information</h4>
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
          </div>

          <div className="form-section">
            <h4>Current Measurements</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Weight (kg) *</label>
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
                <label>Height (cm) *</label>
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

            <div className="form-row">
              <div className="form-group">
                <label>Chest (cm)</label>
                <input
                  type="number"
                  name="chest"
                  value={formData.chest}
                  onChange={handleChange}
                  step="0.1"
                />
              </div>
              <div className="form-group">
                <label>Waist (cm)</label>
                <input
                  type="number"
                  name="waist"
                  value={formData.waist}
                  onChange={handleChange}
                  step="0.1"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Hips (cm)</label>
                <input
                  type="number"
                  name="hips"
                  value={formData.hips}
                  onChange={handleChange}
                  step="0.1"
                />
              </div>
              <div className="form-group">
                <label>Biceps (cm)</label>
                <input
                  type="number"
                  name="biceps"
                  value={formData.biceps}
                  onChange={handleChange}
                  step="0.1"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Thighs (cm)</label>
                <input
                  type="number"
                  name="thighs"
                  value={formData.thighs}
                  onChange={handleChange}
                  step="0.1"
                />
              </div>
              <div className="form-group">
                <label>Body Fat %</label>
                <input
                  type="number"
                  name="bodyFat"
                  value={formData.bodyFat}
                  onChange={handleChange}
                  step="0.1"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                placeholder="How are you feeling? Any observations?"
              />
            </div>
          </div>

          <div className="form-section">
            <h4>Goals</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Target Weight (kg)</label>
                <input
                  type="number"
                  name="targetWeight"
                  value={goalData.targetWeight}
                  onChange={handleGoalChange}
                  step="0.1"
                />
              </div>
              <div className="form-group">
                <label>Target Body Fat %</label>
                <input
                  type="number"
                  name="targetBodyFat"
                  value={goalData.targetBodyFat}
                  onChange={handleGoalChange}
                  step="0.1"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Goal Type</label>
              <select name="goalType" value={goalData.goalType} onChange={handleGoalChange}>
                <option value="weight-loss">Weight Loss</option>
                <option value="muscle-gain">Muscle Gain</option>
                <option value="maintenance">Maintenance</option>
                <option value="athletic-performance">Athletic Performance</option>
              </select>
            </div>
          </div>

          <button type="submit" className="track-btn" disabled={loading}>
            <FaWeight /> {loading ? 'Saving...' : 'Track My Progress'}
          </button>

          {success && <p className="success-message">{success}</p>}
          {error && <p className="error-message">{error}</p>}
        </form>

        <div className="comparison-section">
          <button onClick={fetchComparison} className="comparison-btn" disabled={loading}>
            View Before/After Comparison
          </button>

          {comparison && (
            <div className="comparison-results">
              <h3>Your Progress</h3>
              
              <div className="comparison-grid">
                <div className="comparison-card before">
                  <h4>Before</h4>
                  <div className="measurement-item">
                    <span>Weight:</span>
                    <span>{comparison.before.weight} kg</span>
                  </div>
                  <div className="measurement-item">
                    <span>Body Fat:</span>
                    <span>{comparison.before.bodyFat}%</span>
                  </div>
                  <div className="measurement-item">
                    <span>Waist:</span>
                    <span>{comparison.before.waist} cm</span>
                  </div>
                  <div className="measurement-item">
                    <span>BMI:</span>
                    <span>{comparison.before.bmi}</span>
                  </div>
                </div>

                <div className="comparison-card after">
                  <h4>After</h4>
                  <div className="measurement-item">
                    <span>Weight:</span>
                    <span>{comparison.after.weight} kg</span>
                  </div>
                  <div className="measurement-item">
                    <span>Body Fat:</span>
                    <span>{comparison.after.bodyFat}%</span>
                  </div>
                  <div className="measurement-item">
                    <span>Waist:</span>
                    <span>{comparison.after.waist} cm</span>
                  </div>
                  <div className="measurement-item">
                    <span>BMI:</span>
                    <span>{comparison.after.bmi}</span>
                  </div>
                </div>

                <div className="comparison-card changes">
                  <h4>Changes</h4>
                  <div className="measurement-item">
                    <span>Weight:</span>
                    <span className={comparison.changes.weight < 0 ? 'positive' : 'negative'}>
                      {comparison.changes.weight > 0 ? '+' : ''}{comparison.changes.weight} kg
                    </span>
                  </div>
                  <div className="measurement-item">
                    <span>Body Fat:</span>
                    <span className={comparison.changes.bodyFat < 0 ? 'positive' : 'negative'}>
                      {comparison.changes.bodyFat > 0 ? '+' : ''}{comparison.changes.bodyFat}%
                    </span>
                  </div>
                  <div className="measurement-item">
                    <span>Waist:</span>
                    <span className={comparison.changes.waist < 0 ? 'positive' : 'negative'}>
                      {comparison.changes.waist > 0 ? '+' : ''}{comparison.changes.waist} cm
                    </span>
                  </div>
                </div>
              </div>

              {comparison.progress && (
                <div className="progress-indicator">
                  <h4>Goal Progress</h4>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${Math.min(comparison.progress.percentage, 100)}%` }}
                    >
                      {comparison.progress.percentage}%
                    </div>
                  </div>
                  <p>{comparison.progress.remaining} kg to goal</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BodyTracker;
