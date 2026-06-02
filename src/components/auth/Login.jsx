import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './auth.css';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import Logo from '../logo/Logo';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
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
        // Use AuthContext login to store tokens + user
        if (data.data.accessToken) {
          login(data.data.user, { accessToken: data.data.accessToken, refreshToken: data.data.refreshToken });
        } else {
          // Backward compat: server returned old format
          localStorage.setItem('user', JSON.stringify(data.data));
        }

        // Check if there's a pending action after login
        const redirectPath = localStorage.getItem('redirectAfterLogin');
        const pendingReservation = localStorage.getItem('pendingReservation');

        if (redirectPath) {
          localStorage.removeItem('redirectAfterLogin');
          if (pendingReservation) {
            const classData = JSON.parse(pendingReservation);
            localStorage.removeItem('pendingReservation');
          }
          navigate(redirectPath);
        } else if (data.data.user?.onboardingCompleted === false) {
          navigate('/onboarding');
        } else {
          navigate('/dashboard');
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
          <Logo size="medium" />
          <h1>Welcome back</h1>
          <p>Sign in to continue your training</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Email</label>
            <div className="input-wrapper">
              <input
                type="email" name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Stay signed in</span>
            </label>
            <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Signing in…' : 'Continue'}
          </button>
        </form>

        <div className="auth-footer">
          <p>New to AuraFit? <Link to="/signup">Create an account</Link></p>
          <p style={{ marginTop: 14 }}>
            <Link to="/admin/login" style={{ color: 'var(--text-muted)', fontSize: 12 }}>
              Admin portal →
            </Link>
          </p>
        </div>

        {/* Social proof */}
        <div className="auth-social-proof">
          <div className="proof-item">
            <span className="proof-value">5k+</span>
            <span className="proof-label">Members</span>
          </div>
          <div className="proof-sep" />
          <div className="proof-item">
            <span className="proof-value">4.9★</span>
            <span className="proof-label">Rating</span>
          </div>
          <div className="proof-sep" />
          <div className="proof-item">
            <span className="proof-value">98%</span>
            <span className="proof-label">Satisfaction</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
