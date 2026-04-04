import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUsers, FiDollarSign, FiShoppingBag, FiTrendingUp, 
  FiActivity, FiUserPlus, FiCheckCircle, FiXCircle,
  FiLogOut, FiDatabase, FiRefreshCw, FiHeart, FiTarget, 
  FiCalendar, FiMenu, FiX, FiHome, FiPackage, FiCreditCard,
  FiBarChart2
} from 'react-icons/fi';
import { adminAPI, membershipAPI, productsAPI, classesAPI } from '../../services/api';
import shopData from '../shop/shopData';
import classesByDay from '../classes/classesData';
import AnalyticsCharts from './AnalyticsCharts';
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
        alert(`Database already has ${existingProducts.length} products and ${existingClasses.length} classes.`);
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

      alert(`✅ Seeding complete!\n${productsSeeded} products and ${classesSeeded} classes added.`);
      await loadDashboardData();
    } catch (error) {
      console.error('Seeding error:', error);
      alert(`❌ Seeding failed: ${error.message}`);
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
        alert('✅ Membership approved!');
        loadMemberships();
        loadStats();
      }
    } catch (error) {
      alert('❌ Error approving membership');
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
        alert('❌ Membership rejected');
        loadMemberships();
        loadStats();
      }
    } catch (error) {
      alert('❌ Error rejecting membership');
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
    { id: 'overview', label: 'Overview', icon: FiHome },
    { id: 'users', label: 'Users', icon: FiUsers, count: users.length },
    { id: 'memberships', label: 'Memberships', icon: FiCreditCard, count: memberships.filter(m => m.status === 'pending').length },
    { id: 'orders', label: 'Orders', icon: FiShoppingBag, count: orders.length },
    { id: 'products', label: 'Products', icon: FiPackage, count: products.length },
    { id: 'classes', label: 'Classes', icon: FiActivity, count: classes.length },
    { id: 'tracking', label: 'Analytics', icon: FiBarChart2 }
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
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
