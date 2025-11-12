import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './userProfile.css';
import { FaUser, FaSave, FaEdit, FaArrowLeft } from 'react-icons/fa';
import Navbar from '../navbar/Navbar';
import Dropdown from '../navbar/Dropdown';

const UserProfile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const toggle = () => {
    setIsOpen(!isOpen);
  };
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    age: '',
    gender: 'male',
    weight: '',
    height: '',
    phone: '',
    fitnessLevel: 'beginner',
    activityLevel: 'moderate',
    goals: [],
    dietaryRestrictions: [],
    allergies: [],
    injuries: []
  });

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }

    // Load existing profile data
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setProfileData(JSON.parse(savedProfile));
    } else {
      // Pre-fill with user data
      const userData = JSON.parse(user);
      setProfileData(prev => ({
        ...prev,
        name: userData.name || '',
        email: userData.email || ''
      }));
      setIsEditing(true); // Auto-enable editing for first-time users
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      const array = profileData[name];
      if (checked) {
        setProfileData({ ...profileData, [name]: [...array, value] });
      } else {
        setProfileData({ ...profileData, [name]: array.filter(item => item !== value) });
      }
    } else {
      setProfileData({ ...profileData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Save to localStorage
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    
    setIsEditing(false);
    alert('Profile saved successfully! Your data will be used across all features.');
  };

  const calculateBMI = () => {
    if (profileData.weight && profileData.height) {
      const heightInMeters = profileData.height / 100;
      return (profileData.weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return 'N/A';
  };

  return (
    <>
      <Navbar toggle={toggle} />
      <Dropdown isOpen={isOpen} toggle={toggle} />
      
      <div className="profile-container">
        <div className="profile-back-btn">
          <Link to="/" className="back-link">
            <FaArrowLeft /> Back to Home
          </Link>
        </div>

        <div className="profile-header">
          <div className="profile-icon">
            <FaUser />
          </div>
          <h1>My Profile</h1>
          <p>Complete your profile to use all features without re-entering data</p>
        </div>

      <div className="profile-content">
        <div className="profile-summary">
          <h3>Profile Summary</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Name</span>
              <span className="summary-value">{profileData.name || 'Not set'}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Email</span>
              <span className="summary-value">{profileData.email || 'Not set'}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Age</span>
              <span className="summary-value">{profileData.age || 'Not set'}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">BMI</span>
              <span className="summary-value">{calculateBMI()}</span>
            </div>
          </div>
          
          {!isEditing && (
            <button className="edit-btn" onClick={() => setIsEditing(true)}>
              <FaEdit /> Edit Profile
            </button>
          )}
        </div>

        {isEditing && (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-section">
              <h4>Personal Information</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Age *</label>
                  <input
                    type="number"
                    name="age"
                    value={profileData.age}
                    onChange={handleChange}
                    min="13"
                    max="100"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Gender *</label>
                  <select name="gender" value={profileData.gender} onChange={handleChange} required>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Weight (kg) *</label>
                  <input
                    type="number"
                    name="weight"
                    value={profileData.weight}
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
                    value={profileData.height}
                    onChange={handleChange}
                    step="0.1"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Phone (Optional)</label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-section">
              <h4>Fitness Information</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Fitness Level</label>
                  <select name="fitnessLevel" value={profileData.fitnessLevel} onChange={handleChange}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Activity Level</label>
                  <select name="activityLevel" value={profileData.activityLevel} onChange={handleChange}>
                    <option value="sedentary">Sedentary (little or no exercise)</option>
                    <option value="light">Light (exercise 1-3 days/week)</option>
                    <option value="moderate">Moderate (exercise 3-5 days/week)</option>
                    <option value="active">Active (exercise 6-7 days/week)</option>
                    <option value="very-active">Very Active (intense exercise daily)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Fitness Goals (Select all that apply)</label>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="goals"
                      value="weight-loss"
                      checked={profileData.goals.includes('weight-loss')}
                      onChange={handleChange}
                    />
                    Weight Loss
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="goals"
                      value="muscle-gain"
                      checked={profileData.goals.includes('muscle-gain')}
                      onChange={handleChange}
                    />
                    Muscle Gain
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="goals"
                      value="strength"
                      checked={profileData.goals.includes('strength')}
                      onChange={handleChange}
                    />
                    Strength
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="goals"
                      value="endurance"
                      checked={profileData.goals.includes('endurance')}
                      onChange={handleChange}
                    />
                    Endurance
                  </label>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4>Dietary Preferences (Optional)</h4>
              <div className="form-group">
                <label>Dietary Restrictions</label>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="dietaryRestrictions"
                      value="vegetarian"
                      checked={profileData.dietaryRestrictions.includes('vegetarian')}
                      onChange={handleChange}
                    />
                    Vegetarian
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="dietaryRestrictions"
                      value="vegan"
                      checked={profileData.dietaryRestrictions.includes('vegan')}
                      onChange={handleChange}
                    />
                    Vegan
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="dietaryRestrictions"
                      value="gluten-free"
                      checked={profileData.dietaryRestrictions.includes('gluten-free')}
                      onChange={handleChange}
                    />
                    Gluten-Free
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Allergies (Optional)</label>
                <input
                  type="text"
                  name="allergies"
                  value={profileData.allergies.join(', ')}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    allergies: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                  })}
                  placeholder="e.g., Peanuts, Dairy, Shellfish"
                />
              </div>

              <div className="form-group">
                <label>Injuries/Limitations (Optional)</label>
                <input
                  type="text"
                  name="injuries"
                  value={profileData.injuries.join(', ')}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    injuries: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                  })}
                  placeholder="e.g., Knee injury, Lower back pain"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
              <button type="submit" className="save-btn">
                <FaSave /> Save Profile
              </button>
            </div>
          </form>
        )}
      </div>
      
      <div className="profile-quick-links">
        <h3>Quick Links</h3>
        <div className="quick-links-grid">
          <Link to="/features" className="quick-link-card">
            <span>AI Features</span>
          </Link>
          <Link to="/my-orders" className="quick-link-card">
            <span>My Orders</span>
          </Link>
          <Link to="/classes" className="quick-link-card">
            <span>Classes</span>
          </Link>
          <Link to="/shop" className="quick-link-card">
            <span>Shop</span>
          </Link>
          <Link to="/pricing" className="quick-link-card">
            <span>Pricing</span>
          </Link>
        </div>
      </div>
    </div>
    </>
  );
};

export default UserProfile;
