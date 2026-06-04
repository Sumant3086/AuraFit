import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FiUsers, FiDollarSign, FiShoppingBag, FiTrendingUp,
  FiActivity, FiUserPlus, FiCheckCircle, FiXCircle,
  FiLogOut, FiDatabase, FiRefreshCw, FiHeart, FiTarget,
  FiCalendar, FiMenu, FiX, FiHome, FiPackage, FiCreditCard,
  FiBarChart2, FiMessageCircle, FiLock, FiAlertCircle
} from 'react-icons/fi';
import { adminAPI, membershipAPI, productsAPI, classesAPI } from '../../services/api';
import shopData from '../shop/shopData';
import classesByDay from '../classes/classesData';
import AnalyticsCharts from './AnalyticsCharts';
import AdminKPIBoard from './AdminKPIBoard';
import './admin.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [dbStatus, setDbStatus] = useState('checking');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeMembers: 0,
    totalOrders: 0,
    revenue: 0,
    todayVisits: 0,
    newSignups: 0
  });
  
  const [users, setUsers] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadStats(),
        loadUsers(),
        loadMemberships(),
        loadOrders(),
        loadProducts(),
        loadClasses(),
        checkDBStatus()
      ]);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkDBStatus = async () => {
    try {
      const health = await adminAPI.healthCheck();
      setDbStatus(health?.status || health?.success ? 'connected' : 'disconnected');
    } catch {
      setDbStatus('disconnected');
    }
  };

  const loadStats = async () => {
    try {
      const data = await adminAPI.getStats();
      if (data?.success && data.data) setStats(data.data);
    } catch (error) {
      console.error('Stats error:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await adminAPI.getUsers();
      if (data?.success && data.data) setUsers(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error('Users error:', error);
    }
  };

  const loadMemberships = async () => {
    try {
      const data = await membershipAPI.getAll();
      if (data?.success && data.data) setMemberships(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error('Memberships error:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const data = await adminAPI.getOrders();
      if (data?.success && data.data) setOrders(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error('Orders error:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await productsAPI.getAll();
      if (data?.success && data.data) setProducts(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error('Products error:', error);
    }
  };

  const loadClasses = async () => {
    try {
      const data = await classesAPI.getAll();
      if (data?.success && data.data) setClasses(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error('Classes error:', error);
    }
  };

  const seedDatabase = async () => {
    if (seeding) return;
    setSeeding(true);

    try {
      let productsSeeded = 0;
      let classesSeeded = 0;

      const existingProductsRes = await productsAPI.getAll();
      const existingClassesRes = await classesAPI.getAll();
      
      const existingProducts = existingProductsRes?.data || [];
      const existingClasses = existingClassesRes?.data || [];

      if (existingProducts.length > 0 && existingClasses.length > 0) {
        toast(`Database already has ${existingProducts.length} products and ${existingClasses.length} classes.`, { icon: 'ℹ️' });
        setSeeding(false);
        return;
      }

      if (shopData?.length > 0) {
        for (const item of shopData) {
          try {
            const priceNumeric = Number(String(item.price).replace(/[^0-9.-]+/g, '')) || 0;
            const category = item.name.toLowerCase().includes('bottle') ? 'accessories' : 'apparel';
            
            await productsAPI.create({
              name: item.name,
              description: `${item.name} - premium quality gym wear`,
              price: priceNumeric,
              category,
              image: item.linkImg[Object.keys(item.linkImg)[0]] || '',
              stock: 50,
              rating: 4.5
            });
            productsSeeded++;
          } catch (err) {
            console.error(`Failed to seed product ${item.name}:`, err.message);
          }
        }
      }

      if (classesByDay && Object.keys(classesByDay).length > 0) {
        const classesFlat = Object.keys(classesByDay).reduce((acc, day) => {
          const list = classesByDay[day].map(c => ({ ...c, day, schedule: { day, time: c.time } }));
          return acc.concat(list);
        }, []);

        for (const c of classesFlat) {
          try {
            await classesAPI.create({
              name: c.name,
              description: c.description || `${c.name} - ${c.icon || 'Fitness class'}`,
              instructor: c.trainer || 'Professional Trainer',
              schedule: c.schedule || { day: c.day || 'Monday', time: c.time || '10:00 AM' },
              duration: parseInt(c.duration) || 60,
              capacity: c.spots || 20,
              enrolled: 0,
              level: (c.level || 'all').toLowerCase(),
              isActive: true
            });
            classesSeeded++;
          } catch (err) {
            console.error(`Failed to seed class ${c.name}:`, err.message);
          }
        }
      }

      toast.success(`Seeded ${productsSeeded} products and ${classesSeeded} classes.`);
      await loadDashboardData();
    } catch (error) {
      toast.error(`Seeding failed: ${error.message}`);
    } finally {
      setSeeding(false);
    }
  };

  const approveMembership = async (id) => {
    try {
      const response = await fetch(`/api/memberships/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Membership approved.');
        loadMemberships();
        loadStats();
      }
    } catch {
      toast.error('Failed to approve membership.');
    }
  };

  const rejectMembership = async (id) => {
    try {
      const response = await fetch(`/api/memberships/${id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Membership rejected.');
        loadMemberships();
        loadStats();
      }
    } catch {
      toast.error('Failed to reject membership.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <motion.div 
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  const menuItems = [
    { id: 'overview',     label: 'Overview',      icon: FiHome },
    { id: 'users',        label: 'Users',          icon: FiUsers,      count: users.length },
    { id: 'memberships',  label: 'Memberships',    icon: FiCreditCard, count: memberships.filter(m => m.status === 'pending').length },
    { id: 'orders',       label: 'Payments',       icon: FiShoppingBag, count: orders.length },
    { id: 'products',     label: 'Products',       icon: FiPackage,    count: products.length },
    { id: 'classes',      label: 'Classes',        icon: FiActivity,   count: classes.length },
    { id: 'trainers',     label: 'Trainers',       icon: FiUserPlus },
    { id: 'community',    label: 'Community',      icon: FiMessageCircle },
    { id: 'tracking',     label: 'Analytics',      icon: FiBarChart2 },
    { id: 'kpis',         label: 'Business KPIs',  icon: FiTrendingUp },
    { id: 'audit',        label: 'Audit Logs',     icon: FiCheckCircle },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <h2>🏋️ AURA FIT</h2>
            <span>Admin Panel</span>
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <motion.button
              key={item.id}
              className={activeTab === item.id ? 'sidebar-item active' : 'sidebar-item'}
              onClick={() => setActiveTab(item.id)}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <item.icon className="sidebar-icon" />
              {sidebarOpen && (
                <>
                  <span className="sidebar-label">{item.label}</span>
                  {item.count > 0 && <span className="sidebar-badge">{item.count}</span>}
                </>
              )}
            </motion.button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-item" onClick={handleLogout}>
            <FiLogOut className="sidebar-icon" />
            {sidebarOpen && <span className="sidebar-label">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main-content">
        {/* Top Bar */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <FiMenu />
            </button>
            <h1>{menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}</h1>
          </div>
          <div className="topbar-right">
            <div className={`status-indicator ${dbStatus}`}>
              <FiDatabase />
              <span>{dbStatus === 'connected' ? 'Connected' : 'Disconnected'}</span>
            </div>
            <motion.button 
              onClick={seedDatabase} 
              className="topbar-btn seed" 
              disabled={seeding}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiRefreshCw className={seeding ? 'spinning' : ''} />
              {seeding ? 'Seeding...' : 'Seed Data'}
            </motion.button>
          </div>
        </header>

        {/* Content Area */}
        <div className="admin-content">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="content-section"
              >
                <div className="stats-grid-modern">
                  <motion.div className="stat-card-modern cyan" whileHover={{ y: -5 }}>
                    <div className="stat-card-header">
                      <FiUsers className="stat-card-icon" />
                      <span className="stat-card-trend">+12%</span>
                    </div>
                    <h3 className="stat-card-value">{stats.totalUsers}</h3>
                    <p className="stat-card-label">Total Users</p>
                  </motion.div>

                  <motion.div className="stat-card-modern green" whileHover={{ y: -5 }}>
                    <div className="stat-card-header">
                      <FiActivity className="stat-card-icon" />
                      <span className="stat-card-trend">+8%</span>
                    </div>
                    <h3 className="stat-card-value">{stats.activeMembers}</h3>
                    <p className="stat-card-label">Active Members</p>
                  </motion.div>

                  <motion.div className="stat-card-modern purple" whileHover={{ y: -5 }}>
                    <div className="stat-card-header">
                      <FiShoppingBag className="stat-card-icon" />
                      <span className="stat-card-trend">+15%</span>
                    </div>
                    <h3 className="stat-card-value">{stats.totalOrders}</h3>
                    <p className="stat-card-label">Total Orders</p>
                  </motion.div>

                  <motion.div className="stat-card-modern gold" whileHover={{ y: -5 }}>
                    <div className="stat-card-header">
                      <FiDollarSign className="stat-card-icon" />
                      <span className="stat-card-trend">+23%</span>
                    </div>
                    <h3 className="stat-card-value">₹{stats.revenue.toLocaleString()}</h3>
                    <p className="stat-card-label">Revenue</p>
                  </motion.div>

                  <motion.div className="stat-card-modern pink" whileHover={{ y: -5 }}>
                    <div className="stat-card-header">
                      <FiTrendingUp className="stat-card-icon" />
                      <span className="stat-card-trend">+5%</span>
                    </div>
                    <h3 className="stat-card-value">{stats.todayVisits}</h3>
                    <p className="stat-card-label">Today's Visits</p>
                  </motion.div>

                  <motion.div className="stat-card-modern blue" whileHover={{ y: -5 }}>
                    <div className="stat-card-header">
                      <FiUserPlus className="stat-card-icon" />
                      <span className="stat-card-trend">+18%</span>
                    </div>
                    <h3 className="stat-card-value">{stats.newSignups}</h3>
                    <p className="stat-card-label">New Signups</p>
                  </motion.div>
                </div>

                <div className="charts-grid">
                  <div className="chart-card">
                    <h3>Recent Activity</h3>
                    <div className="activity-list">
                      <div className="activity-item">
                        <FiUserPlus className="activity-icon cyan" />
                        <div className="activity-info">
                          <p className="activity-title">New user registered</p>
                          <span className="activity-time">2 minutes ago</span>
                        </div>
                      </div>
                      <div className="activity-item">
                        <FiShoppingBag className="activity-icon purple" />
                        <div className="activity-info">
                          <p className="activity-title">New order placed</p>
                          <span className="activity-time">15 minutes ago</span>
                        </div>
                      </div>
                      <div className="activity-item">
                        <FiCreditCard className="activity-icon green" />
                        <div className="activity-info">
                          <p className="activity-title">Membership approved</p>
                          <span className="activity-time">1 hour ago</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="chart-card">
                    <h3>Quick Stats</h3>
                    <div className="quick-stats">
                      <div className="quick-stat-item">
                        <span className="quick-stat-label">Products</span>
                        <span className="quick-stat-value">{products.length}</span>
                      </div>
                      <div className="quick-stat-item">
                        <span className="quick-stat-label">Classes</span>
                        <span className="quick-stat-value">{classes.length}</span>
                      </div>
                      <div className="quick-stat-item">
                        <span className="quick-stat-label">Pending</span>
                        <span className="quick-stat-value">{memberships.filter(m => m.status === 'pending').length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="content-section">
                {users.length === 0 ? (
                  <div className="empty-state-modern">
                    <FiUsers className="empty-icon" />
                    <p>No users found</p>
                  </div>
                ) : (
                  <div className="table-card">
                    <table className="modern-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Membership</th>
                          <th>Status</th>
                          <th>Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user._id}>
                            <td><strong>{user.name}</strong></td>
                            <td>{user.email}</td>
                            <td><span className={`badge-modern ${user.membership?.toLowerCase() || 'none'}`}>{user.membership || 'None'}</span></td>
                            <td><span className={`badge-modern ${user.status?.toLowerCase() || 'active'}`}>{user.status || 'Active'}</span></td>
                            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'memberships' && (
              <motion.div key="memberships" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="content-section">
                {memberships.length === 0 ? (
                  <div className="empty-state-modern">
                    <FiCreditCard className="empty-icon" />
                    <p>No membership requests</p>
                  </div>
                ) : (
                  <div className="table-card">
                    <table className="modern-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Plan</th>
                          <th>Price</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {memberships.map((membership) => (
                          <tr key={membership._id}>
                            <td><strong>{membership.name}</strong></td>
                            <td>{membership.email}</td>
                            <td><span className={`badge-modern ${membership.plan}`}>{membership.plan}</span></td>
                            <td>₹{membership.price}</td>
                            <td><span className={`badge-modern ${membership.status}`}>{membership.status}</span></td>
                            <td>
                              {membership.status === 'pending' ? (
                                <div className="action-btns-modern">
                                  <button onClick={() => approveMembership(membership._id)} className="btn-modern approve">
                                    <FiCheckCircle /> Approve
                                  </button>
                                  <button onClick={() => rejectMembership(membership._id)} className="btn-modern reject">
                                    <FiXCircle /> Reject
                                  </button>
                                </div>
                              ) : <span>—</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'orders' && (
              <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="content-section">
                {orders.length === 0 ? (
                  <div className="empty-state-modern">
                    <FiShoppingBag className="empty-icon" />
                    <p>No orders yet</p>
                  </div>
                ) : (
                  <div className="table-card">
                    <table className="modern-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Customer</th>
                          <th>Items</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order._id}>
                            <td><strong>#{order._id?.slice(-6)}</strong></td>
                            <td>{order.customerName || order.userName}</td>
                            <td>{order.items?.length || 0} items</td>
                            <td>₹{order.totalAmount}</td>
                            <td><span className={`badge-modern ${order.status?.toLowerCase() || 'pending'}`}>{order.status || 'Pending'}</span></td>
                            <td>{new Date(order.orderDate || order.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'products' && (
              <motion.div key="products" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="content-section">
                {products.length === 0 ? (
                  <div className="empty-state-modern">
                    <FiPackage className="empty-icon" />
                    <p>No products found. Click "Seed Data" to add products.</p>
                  </div>
                ) : (
                  <div className="table-card">
                    <table className="modern-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th>Stock</th>
                          <th>Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product._id}>
                            <td><strong>{product.name}</strong></td>
                            <td><span className="badge-modern">{product.category}</span></td>
                            <td>₹{product.price}</td>
                            <td>{product.stock}</td>
                            <td>⭐ {product.rating || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'classes' && (
              <motion.div key="classes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="content-section">
                {classes.length === 0 ? (
                  <div className="empty-state-modern">
                    <FiActivity className="empty-icon" />
                    <p>No classes found. Click "Seed Data" to add classes.</p>
                  </div>
                ) : (
                  <div className="table-card">
                    <table className="modern-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Instructor</th>
                          <th>Schedule</th>
                          <th>Duration</th>
                          <th>Enrolled/Capacity</th>
                          <th>Level</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classes.map((cls) => (
                          <tr key={cls._id}>
                            <td><strong>{cls.name}</strong></td>
                            <td>{cls.instructor}</td>
                            <td>{cls.schedule?.day} {cls.schedule?.time}</td>
                            <td>{cls.duration} min</td>
                            <td>{cls.enrolled || 0}/{cls.capacity}</td>
                            <td><span className="badge-modern">{cls.level}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'tracking' && (
              <motion.div key="tracking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="content-section">
                <AnalyticsCharts />
                
                <div className="analytics-grid" style={{ marginTop: '2rem' }}>
                  <div className="analytics-card">
                    <FiHeart className="analytics-icon cyan" />
                    <h3>Workout Plans</h3>
                    <p className="analytics-value">0</p>
                    <span className="analytics-label">Generated plans</span>
                  </div>
                  <div className="analytics-card">
                    <FiTarget className="analytics-icon green" />
                    <h3>Nutrition Plans</h3>
                    <p className="analytics-value">0</p>
                    <span className="analytics-label">Generated plans</span>
                  </div>
                  <div className="analytics-card">
                    <FiActivity className="analytics-icon purple" />
                    <h3>Progress Trackers</h3>
                    <p className="analytics-value">0</p>
                    <span className="analytics-label">Active trackers</span>
                  </div>
                  <div className="analytics-card">
                    <FiCalendar className="analytics-icon pink" />
                    <h3>Class Bookings</h3>
                    <p className="analytics-value">{classes.reduce((sum, c) => sum + (c.enrolled || 0), 0)}</p>
                    <span className="analytics-label">Total enrollments</span>
                  </div>
                </div>
              </motion.div>
            )}
            {activeTab === 'kpis' && (
              <motion.div key="kpis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="content-section">
                <div style={{ marginBottom: 24 }}>
                  <h2 style={{ color: 'var(--text-1)', fontSize: 22, fontWeight: 800, margin: '0 0 6px' }}>Business KPIs</h2>
                  <p style={{ color: 'var(--text-3)', fontSize: 14, margin: 0 }}>MRR, churn, retention, conversion, and growth metrics</p>
                </div>
                <AdminKPIBoard />
              </motion.div>
            )}

            {/* ── Trainers tab ── */}
            {activeTab === 'trainers' && (
              <motion.div key="trainers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="content-section">
                <AdminTrainersTab apiClient={null} />
              </motion.div>
            )}

            {/* ── Community moderation tab ── */}
            {activeTab === 'community' && (
              <motion.div key="community" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="content-section">
                <AdminCommunityTab />
              </motion.div>
            )}

            {/* ── Audit logs tab ── */}
            {activeTab === 'audit' && (
              <motion.div key="audit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="content-section">
                <AdminAuditTab />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

/* ── Admin: Trainers Tab ──────────────────────────────────── */
function AdminTrainersTab() {
  const { apiClient } = require('../../context/AuthContext').useAuth ? { apiClient: null } : {};
  const [trainers, setTrainers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const { apiClient: api } = require('../../context/AuthContext').useAuth?.() || {};

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/trainers', {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        });
        const data = await res.json();
        setTrainers(data.data || []);
      } catch {}
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ color: 'var(--text-1)', fontSize: 22, fontWeight: 800, margin: '0 0 6px' }}>Trainers</h2>
        <p style={{ color: 'var(--text-3)', fontSize: 14, margin: 0 }}>
          {loading ? 'Loading…' : `${trainers.length} registered trainers`}
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3].map(i => <div key={i} style={{ height: 64, background: 'var(--surface-2)', borderRadius: 12, animation: 'pulse 1.5s infinite' }} />)}
        </div>
      ) : trainers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-3)' }}>
          <FiUserPlus size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p style={{ margin: 0 }}>No trainers registered yet.</p>
          <p style={{ margin: '8px 0 0', fontSize: 13 }}>Trainers appear here after their account is created and assigned the trainer role.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {trainers.map(t => (
            <div key={t._id} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              background: 'var(--surface-2)', border: '1px solid var(--border-1)',
              borderRadius: 12, padding: '14px 16px',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent)', fontWeight: 700, fontSize: 15,
              }}>
                {t.name?.[0]?.toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: 'var(--text-1)', fontWeight: 600, margin: 0, fontSize: 14 }}>{t.name}</p>
                <p style={{ color: 'var(--text-3)', fontSize: 12, margin: '2px 0 0' }}>
                  {t.specialization || 'General'} · {t.email}
                </p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ color: 'var(--text-1)', fontWeight: 700, margin: 0, fontSize: 14 }}>
                  {t.totalRatings ? `${t.rating?.toFixed(1)}★` : '—'}
                </p>
                <p style={{ color: 'var(--text-3)', fontSize: 11, margin: 0 }}>{t.totalRatings || 0} reviews</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Admin: Community Moderation Tab ─────────────────────── */
function AdminCommunityTab() {
  const [posts, setPosts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/social/feed?limit=30', {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        });
        const data = await res.json();
        setPosts(data.data || []);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const deletePost = async (id) => {
    try {
      await fetch(`/api/social/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      setPosts(p => p.filter(x => x._id !== id));
    } catch {}
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ color: 'var(--text-1)', fontSize: 22, fontWeight: 800, margin: '0 0 6px' }}>Community</h2>
        <p style={{ color: 'var(--text-3)', fontSize: 14, margin: 0 }}>
          {loading ? 'Loading…' : `${posts.length} recent posts`}
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3].map(i => <div key={i} style={{ height: 80, background: 'var(--surface-2)', borderRadius: 12, animation: 'pulse 1.5s infinite' }} />)}
        </div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-3)' }}>
          <FiMessageCircle size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p>No community posts yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {posts.map(p => (
            <div key={p._id} style={{
              background: 'var(--surface-2)', border: '1px solid var(--border-1)',
              borderRadius: 12, padding: '14px 16px',
              display: 'flex', alignItems: 'flex-start', gap: 12,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-1)', fontWeight: 600, fontSize: 13 }}>{p.userName}</span>
                  <span style={{ color: 'var(--text-3)', fontSize: 11, background: 'var(--surface-3)', borderRadius: 8, padding: '2px 8px' }}>{p.type}</span>
                </div>
                <p style={{ color: 'var(--text-2)', fontSize: 13, margin: 0, lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.content}
                </p>
                <p style={{ color: 'var(--text-3)', fontSize: 11, margin: '4px 0 0' }}>
                  {new Date(p.createdAt).toLocaleDateString()} · {p.likes?.length || 0} likes
                </p>
              </div>
              <button
                onClick={() => deletePost(p._id)}
                style={{
                  background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: 8, padding: '6px 12px', color: 'var(--red)',
                  cursor: 'pointer', fontSize: 12, flexShrink: 0,
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Admin: Audit Logs Tab ────────────────────────────────── */
function AdminAuditTab() {
  const [logs, setLogs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/metrics/audit-logs?limit=50', {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        });
        const data = await res.json();
        setLogs(data.data || []);
      } catch {}
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ color: 'var(--text-1)', fontSize: 22, fontWeight: 800, margin: '0 0 6px' }}>Audit Logs</h2>
        <p style={{ color: 'var(--text-3)', fontSize: 14, margin: 0 }}>Admin actions, security events, and system changes</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1,2,3,4,5].map(i => <div key={i} style={{ height: 52, background: 'var(--surface-2)', borderRadius: 10, animation: 'pulse 1.5s infinite' }} />)}
        </div>
      ) : logs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-3)' }}>
          <FiLock size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p style={{ margin: 0 }}>No audit logs yet.</p>
          <p style={{ margin: '8px 0 0', fontSize: 13 }}>Admin actions are logged here with timestamps and details.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {logs.map((log, i) => (
            <div key={log._id || i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'var(--surface-2)', border: '1px solid var(--border-1)',
              borderRadius: 10, padding: '10px 14px',
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: log.status === 'failed' ? 'var(--red)' : 'var(--green)',
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: 'var(--text-1)', fontSize: 13, fontWeight: 600, margin: 0 }}>
                  {log.action} — {log.resource}
                </p>
                <p style={{ color: 'var(--text-3)', fontSize: 11, margin: '2px 0 0' }}>
                  {log.adminEmail} · {new Date(log.createdAt).toLocaleString()}
                </p>
              </div>
              {log.resourceId && (
                <span style={{ color: 'var(--text-3)', fontSize: 10, fontFamily: 'monospace', flexShrink: 0 }}>
                  {String(log.resourceId).slice(-8)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

