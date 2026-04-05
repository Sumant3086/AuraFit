import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import './auth.css';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import Logo from '../logo/Logo';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Block admin email from user login
      if (formData.email === 'sumant@gmail.com') {
        setError('This is an admin account. Please use the admin portal to login.');
        setLoading(false);
        return;
      }

      // Call login API
      const data = await authAPI.login({
        email: formData.email,
        password: formData.password
      });

      if (data.success) {
        // Save user to localStorage
        localStorage.setItem('user', JSON.stringify({
          id: data.data.id,
          name: data.data.name,
          email: data.data.email,
          membership: data.data.membership
        }));
        
        // Check if there's a pending action after login
        const redirectPath = localStorage.getItem('redirectAfterLogin');
        const pendingReservation = localStorage.getItem('pendingReservation');
        
        if (redirectPath) {
          localStorage.removeItem('redirectAfterLogin');
          if (pendingReservation) {
            const classData = JSON.parse(pendingReservation);
            localStorage.removeItem('pendingReservation');
            alert(`Welcome back! Your spot for ${classData.name} class is now reserved!`);
          }
          navigate(redirectPath);
        } else {
          navigate('/');
        }
      } else {
        // Display the specific error message from server
        setError(data.message || 'Invalid email or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Logo size="medium" color="gradient" />
          <h1>Welcome Back</h1>
          <p>Login to continue your fitness journey</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label><FaEnvelope style={{ marginRight: '8px' }} />Email Address</label>
            <div className="input-wrapper">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label><FaLock style={{ marginRight: '8px' }} />Password</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="forgot-password">
              Forgot Password?
            </Link>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
          <p style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Link to="/admin/login" style={{ color: '#ff00ff', fontSize: '0.9rem' }}>
              Admin Login →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
