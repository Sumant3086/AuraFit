import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import './admin.css';

const FEATURES = [
  'Real-time analytics dashboard',
  'User & membership management',
  'Order tracking & revenue reports',
  'Business KPI metrics (MRR, churn)',
  'Database seeding & demo tools',
];

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Authenticate via the real backend — JWT-based, no client-side credential bundling
      const data = await authAPI.login({ email: formData.email, password: formData.password });

      if (data.success) {
        const user = data.data.user;
        const isAdminRole = ['admin', 'super_admin', 'gym_admin'].includes(user?.role);

        if (!isAdminRole) {
          setError('This account does not have admin access.');
          return;
        }

        // Use AuthContext to store JWT tokens properly (same as regular user login)
        login(user, {
          accessToken: data.data.accessToken,
          refreshToken: data.data.refreshToken,
        });
        navigate('/admin/dashboard');
      } else {
        setError(data.message || 'Invalid email or password.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <motion.div
        className="admin-login-left"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="admin-branding">
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            AuraFit
          </motion.h1>
          <motion.h2 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            Admin dashboard
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            Manage your gym operations with real-time analytics,
            member management, and business KPIs — all in one place.
          </motion.p>
          <div className="admin-features">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature}
                className="feature-item"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                <FiCheckCircle size={16} />
                <span>{feature}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        className="admin-login-right"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="admin-login-card">
          <div className="admin-login-header">
            <h1>Admin sign in</h1>
            <p>Use your admin account credentials</p>
          </div>

          {error && (
            <motion.div
              className="admin-error-message"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="admin-login-form">
            <div className="admin-form-group">
              <div className="admin-input-wrapper">
                <FiMail size={18} color="#00d4ff" />
                <input
                  type="email" name="email"
                  placeholder="Admin email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="admin-form-group">
              <div className="admin-input-wrapper">
                <FiLock size={18} color="#00d4ff" />
                <input
                  type="password" name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <motion.button
              type="submit"
              className="admin-login-btn"
              whileHover={loading ? {} : { scale: 1.02 }}
              whileTap={loading ? {} : { scale: 0.98 }}
              disabled={loading}
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </motion.button>
          </form>

          <Link to="/" className="back-to-user">← Back to site</Link>
        </div>
      </motion.div>
    </div>
  );
}
