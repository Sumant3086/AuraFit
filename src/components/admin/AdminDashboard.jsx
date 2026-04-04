import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiUsers, FiDollarSign, FiShoppingBag, FiTrendingUp, 
  FiActivity, FiUserPlus, FiCheckCircle, FiXCircle,
  FiLogOut, FiDatabase, FiRefreshCw, FiHeart, FiTarget, FiCalendar
} from 'react-icons/fi';
import { adminAPI, membershipAPI, ordersAPI, productsAPI, classesAPI } from '../../services/api';
import shopData from '../shop/shopData';
import classesByDay from '../classes/classesData';
import Footer from '../footer/Footer';
import './admin.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [dbStatus, setDbStatus] = useState('checking');
  
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

  const statCards = [
    { icon: FiUsers, label: 'Total Users', value: stats.totalUsers },
    { icon: FiActivity, label: 'Active Members', value: stats.activeMembers },
    { icon: FiShoppingBag, label: 'Total Orders', value: stats.totalOrders },
    { icon: FiDollarSign, label: 'Revenue', value: `₹${stats.revenue.toLocaleString()}` },
    { icon: FiTrendingUp, label: "Today's Visits", value: stats.todayVisits },
    { icon: FiUserPlus, label: 'New Signups', value: stats.newSignups }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥', count: users.length },
    { id: 'memberships', label: 'Memberships', icon: '💳', count: memberships.filter(m => m.status === 'pending').length },
    { id: 'orders', label: 'Orders', icon: '🛒', count: orders.length },
    { id: 'products', label: 'Products', icon: '📦', count: products.length },
    { id: 'classes', label: 'Classes', icon: '🏋️', count: classes.length },
    { id: 'tracking', label: 'Tracking', icon: '📈' }
  ];

  return (
    <>
      {/* Admin Dashboard Content - Using User Site Layout */}
      <div className="admin-dashboard-wrapper">
        {/* Hero Section with Admin Header */}
        <section className="admin-hero">
          <div className="admin-hero-content">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="admin-hero-title">
                <span className="gradient-text">ADMIN DASHBOARD</span>
              </h1>
              <p className="admin-hero-subtitle">
                Manage your gym operations with powerful analytics and real-time insights
              </p>
              
              <div className="admin-hero-actions">
                <div className={`db-status-badge ${dbStatus}`}>
                  <FiDatabase />
                  <span>{dbStatus === 'connected' ? 'Connected' : 'Disconnected'}</span>
                </div>
                <button onClick={seedDatabase} className="admin-btn seed-btn" disabled={seeding}>
                  <FiRefreshCw className={seeding ? 'spinning' : ''} />
                  {seeding ? 'Seeding...' : 'Seed Data'}
                </button>
                <button onClick={handleLogout} className="admin-btn logout-btn">
                  <FiLogOut />
                  Logout
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <section className="admin-tabs-section">
          <div className="container">
            <div className="admin-tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={activeTab === tab.id ? 'admin-tab active' : 'admin-tab'}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="tab-icon">{tab.icon}</span>
                  <span className="tab-label">{tab.label}</span>
                  {tab.count > 0 && <span className="tab-badge">{tab.count}</span>}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="admin-content-section">
          <div className="container">
            {activeTab === 'overview' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-overview">
                <h2 className="section-title gradient-text">Dashboard Overview</h2>
                <div className="stats-grid">
                  {statCards.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      className="stat-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="stat-icon">
                        <stat.icon />
                      </div>
                      <div className="stat-info">
                        <h3>{stat.value}</h3>
                        <p>{stat.label}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-users">
                <h2 className="section-title gradient-text">All Users ({users.length})</h2>
                {users.length === 0 ? (
                  <div className="empty-state">
                    <p>No users found. Users will appear here after signup.</p>
                  </div>
                ) : (
                  <div className="data-table-wrapper">
                    <table className="data-table">
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
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td><span className={`badge ${user.membership?.toLowerCase() || 'none'}`}>{user.membership || 'None'}</span></td>
                            <td><span className={`badge ${user.status?.toLowerCase() || 'active'}`}>{user.status || 'Active'}</span></td>
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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-memberships">
                <h2 className="section-title gradient-text">Membership Requests</h2>
                {memberships.length === 0 ? (
                  <div className="empty-state">
                    <p>No membership requests yet.</p>
                  </div>
                ) : (
                  <div className="data-table-wrapper">
                    <table className="data-table">
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
                            <td>{membership.name}</td>
                            <td>{membership.email}</td>
                            <td><span className={`badge ${membership.plan}`}>{membership.plan}</span></td>
                            <td>₹{membership.price}</td>
                            <td><span className={`badge ${membership.status}`}>{membership.status}</span></td>
                            <td>
                              {membership.status === 'pending' ? (
                                <div className="action-btns">
                                  <button onClick={() => approveMembership(membership._id)} className="btn-approve">
                                    <FiCheckCircle /> Approve
                                  </button>
                                  <button onClick={() => rejectMembership(membership._id)} className="btn-reject">
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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-orders">
                <h2 className="section-title gradient-text">All Orders ({orders.length})</h2>
                {orders.length === 0 ? (
                  <div className="empty-state">
                    <p>No orders yet.</p>
                  </div>
                ) : (
                  <div className="data-table-wrapper">
                    <table className="data-table">
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
                            <td>#{order._id?.slice(-6)}</td>
                            <td>{order.customerName || order.userName}</td>
                            <td>{order.items?.length || 0} items</td>
                            <td>₹{order.totalAmount}</td>
                            <td><span className={`badge ${order.status?.toLowerCase() || 'pending'}`}>{order.status || 'Pending'}</span></td>
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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-products">
                <h2 className="section-title gradient-text">Products ({products.length})</h2>
                {products.length === 0 ? (
                  <div className="empty-state">
                    <p>No products found. Click "Seed Data" to add products.</p>
                  </div>
                ) : (
                  <div className="data-table-wrapper">
                    <table className="data-table">
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
                            <td>{product.name}</td>
                            <td><span className="badge">{product.category}</span></td>
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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-classes">
                <h2 className="section-title gradient-text">Classes ({classes.length})</h2>
                {classes.length === 0 ? (
                  <div className="empty-state">
                    <p>No classes found. Click "Seed Data" to add classes.</p>
                  </div>
                ) : (
                  <div className="data-table-wrapper">
                    <table className="data-table">
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
                            <td>{cls.name}</td>
                            <td>{cls.instructor}</td>
                            <td>{cls.schedule?.day} {cls.schedule?.time}</td>
                            <td>{cls.duration} min</td>
                            <td>{cls.enrolled || 0}/{cls.capacity}</td>
                            <td><span className="badge">{cls.level}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'tracking' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-tracking">
                <h2 className="section-title gradient-text">User Activity Tracking</h2>
                <div className="tracking-grid">
                  <div className="tracking-card">
                    <FiHeart className="tracking-icon" />
                    <h3>Workout Plans</h3>
                    <p className="tracking-count">0</p>
                    <p className="tracking-desc">Generated plans</p>
                  </div>
                  <div className="tracking-card">
                    <FiTarget className="tracking-icon" />
                    <h3>Nutrition Plans</h3>
                    <p className="tracking-count">0</p>
                    <p className="tracking-desc">Generated plans</p>
                  </div>
                  <div className="tracking-card">
                    <FiActivity className="tracking-icon" />
                    <h3>Progress Trackers</h3>
                    <p className="tracking-count">0</p>
                    <p className="tracking-desc">Active trackers</p>
                  </div>
                  <div className="tracking-card">
                    <FiCalendar className="tracking-icon" />
                    <h3>Class Bookings</h3>
                    <p className="tracking-count">{classes.reduce((sum, c) => sum + (c.enrolled || 0), 0)}</p>
                    <p className="tracking-desc">Total enrollments</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </section>
      </div>

      {/* Footer - Same as User Site */}
      <Footer />
    </>
  );
};

export default AdminDashboard;
