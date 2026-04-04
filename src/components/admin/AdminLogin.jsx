import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiCheckCircle } from 'react-icons/fi';
import './admin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'sumant@gmail.com';
    const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'sumant3086';
    const ADMIN_NAME = import.meta.env.VITE_ADMIN_NAME || 'Sumant Yadav';

    try {
      if (formData.email === ADMIN_EMAIL && formData.password === ADMIN_PASSWORD) {
        const adminData = {
          email: ADMIN_EMAIL,
          name: ADMIN_NAME,
          role: 'admin',
          loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('admin', JSON.stringify(adminData));
        navigate('/admin/dashboard');
      } else {
        setError('Invalid admin credentials. Please try again.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error('Login error:', err);
    }
  };

  const features = [
    'Real-time Analytics Dashboard',
    'User & Membership Management',
    'Order Tracking & Revenue Reports',
    'Database Seeding Tools',
    'Advanced Data Visualization'
  ];

  return (
    <div className="admin-login-container">
      <motion.div 
        className="admin-login-left"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="admin-branding">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            🏋️ AURA FIT
          </motion.h1>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Admin Dashboard
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Manage your gym operations with powerful analytics, user management, 
            and real-time insights all in one place.
          </motion.p>
          <div className="admin-features">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="feature-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <FiCheckCircle size={20} />
                <span>{feature}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="admin-login-right"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="admin-login-card">
          <div className="admin-login-header">
            <h1>Welcome Back</h1>
            <p>Sign in to access your admin dashboard</p>
          </div>

          {error && (
            <motion.div 
              className="admin-error-message"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="admin-login-form">
            <div className="admin-form-group">
              <div className="admin-input-wrapper">
                <FiMail size={20} color="#00f5ff" />
                <input
                  type="email"
                  name="email"
                  placeholder="Admin Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="admin-form-group">
              <div className="admin-input-wrapper">
                <FiLock size={20} color="#00f5ff" />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <motion.button
              type="submit"
              className="admin-login-btn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Sign In
            </motion.button>
          </form>

          <Link to="/" className="back-to-user">
            ← Back to User Site
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
