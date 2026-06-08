import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './auth.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Logo from '../logo/Logo';

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword]             = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      const data = await authAPI.signup({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      if (data.success) {
        if (data.data.accessToken) {
          login(data.data.user, { accessToken: data.data.accessToken, refreshToken: data.data.refreshToken });
        } else {
          localStorage.setItem('user', JSON.stringify(data.data));
        }
        const redirect = localStorage.getItem('redirectAfterLogin');
        if (redirect) {
          localStorage.removeItem('redirectAfterLogin');
          navigate(redirect);
        } else {
          navigate('/onboarding');
        }
      } else {
        setError(data.message || 'Failed to create account. Please try again.');
      }
    } catch {
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
          <h1>Create your account</h1>
          <p>Set up your profile and get a personalised plan.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message" role="alert">{error}</div>}

          <div className="form-group">
            <label htmlFor="su-name">Full name</label>
            <div className="input-wrapper">
              <input
                id="su-name" type="text" name="name"
                value={formData.name} onChange={handleChange}
                placeholder="Your name"
                autoComplete="name"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="su-email">Email</label>
            <div className="input-wrapper">
              <input
                id="su-email" type="email" name="email"
                value={formData.email} onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="su-phone">Phone <span style={{ fontWeight: 400, opacity: 0.6 }}>(optional)</span></label>
            <div className="input-wrapper">
              <input
                id="su-phone" type="tel" name="phone"
                value={formData.phone} onChange={handleChange}
                placeholder="+91 98765 43210"
                autoComplete="tel"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="su-password">Password</label>
            <div className="input-wrapper">
              <input
                id="su-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                autoComplete="new-password"
                required
              />
              <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="su-confirm">Confirm password</label>
            <div className="input-wrapper">
              <input
                id="su-confirm"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Same password again"
                autoComplete="new-password"
                required
              />
              <button type="button" className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Creating your account…' : 'Create account'}
          </button>

          <p style={{
            color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', margin: '6px 0 0',
            lineHeight: 1.5,
          }}>
            By continuing you agree to our{' '}
            <Link to="/contact" style={{ color: 'var(--brand-purple)' }}>Terms of Service</Link>
          </p>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Sign in</Link></p>
          <p style={{ marginTop: 14 }}>
            <Link to="/admin/login" style={{ color: 'var(--text-muted)', fontSize: 12 }}>Admin portal →</Link>
          </p>
        </div>

        {/* Honest trust points — no fake membership counts */}
        <div className="auth-social-proof">
          <div className="proof-item">
            <span className="proof-value">Free</span>
            <span className="proof-label">to start</span>
          </div>
          <div className="proof-sep" />
          <div className="proof-item">
            <span className="proof-value">2 min</span>
            <span className="proof-label">Setup</span>
          </div>
          <div className="proof-sep" />
          <div className="proof-item">
            <span className="proof-value">No card</span>
            <span className="proof-label">required</span>
          </div>
        </div>
      </div>
    </div>
  );
}
