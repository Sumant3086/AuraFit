import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './admin.css';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaShieldAlt } from 'react-icons/fa';
import Logo from '../logo/Logo';

const AdminLogin = () => {
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

    // Admin credentials from environment variables
    const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL || 'sumant@gmail.com';
    const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || 'sumant3086';
    const ADMIN_NAME = process.env.REACT_APP_ADMIN_NAME || 'Sumant Yadav';

    try {
      if (formData.email === ADMIN_EMAIL && formData.password === ADMIN_PASSWORD) {
        localStorage.setItem('admin', JSON.stringify({ 
          email: formData.email, 
          role: 'admin',
          name: ADMIN_NAME
        }));
        setTimeout(() => {
          navigate('/admin/dashboard'); // Updated to use single dashboard
        }, 1000);
      } else {
        setError('Access Denied: Invalid admin credentials');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-left">
        <div className="admin-branding">
          <Logo size="large" color="gradient" />
          <h1>AURA FIT</h1>
          <h2>Admin Portal</h2>
          <p>Manage your fitness empire with powerful tools and insights</p>
          <div className="admin-features">
            <div className="feature-item">
              <FaShieldAlt />
              <span>Secure Access</span>
            </div>
            <div className="feature-item">
              <FaShieldAlt />
              <span>Real-time Analytics</span>
            </div>
            <div className="feature-item">
              <FaShieldAlt />
              <span>User Management</span>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-login-right">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <div className="shield-icon">
              <FaShieldAlt />
            </div>
            <h1>Admin Login</h1>
            <p>Enter your credentials to access the dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="admin-login-form">
            {error && <div className="admin-error-message">{error}</div>}
            
            <div className="admin-form-group">
              <label>Admin Email</label>
              <div className="admin-input-wrapper">
                <FaEnvelope className="admin-input-icon" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter admin email"
                  required
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label>Password</label>
              <div className="admin-input-wrapper">
                <FaLock className="admin-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter admin password"
                  required
                />
                <button
                  type="button"
                  className="admin-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="admin-login-btn" disabled={loading}>
              {loading ? 'Authenticating...' : 'Access Dashboard'}
            </button>
          </form>

          <div className="admin-login-footer">
            <div className="security-notice">
              <FaShieldAlt />
              <span>Restricted Access - Admin Only</span>
            </div>
            <Link to="/login" className="back-to-user">
              ← Back to User Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
