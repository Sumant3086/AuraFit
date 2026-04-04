import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUsers, FiDollarSign, FiShoppingBag, FiTrendingUp, 
  FiActivity, FiUserPlus, FiCheckCircle, FiXCircle,
  FiClock, FiLogOut, FiDatabase, FiRefreshCw
} from 'react-icons/fi';
import { adminAPI, membershipAPI, ordersAPI, productsAPI, classesAPI } from '../../services/api';
import shopData from '../shop/shopData';
import classesByDay from '../classes/classesData';
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
      if (data.success) setStats(data.data);
    } catch (error) {
      console.error('Stats error:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await adminAPI.getUsers();
      if (data.success) setUsers(data.data || []);
    } catch (error) {
      console.error('Users error:', error);
    }
  };

  const loadMemberships = async () => {
    try {
      const data = await membershipAPI.getAll();
      if (data.success) setMemberships(data.data || []);
    } catch (error) {
      console.error('Memberships error:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const data = await adminAPI.getOrders();
      if (data.success) setOrders(data.data || []);
    } catch (error) {
      console.error('Orders error:', error);
    }
  };

  const seedDatabase = async () => {
    if (seeding) return;
    setSeeding(true);

    try {
      const existingProducts = (await productsAPI.getAll()).data || [];
      const existingClasses = (await classesAPI.getAll()).data || [];

      if (existingProducts.length > 0 || existingClasses.length > 0) {
        alert('Database already contains data. Skipping seed.');
        setSeeding(false);
        return;
      }

      // Seed products
      const productPromises = shopData.map(item => {
        const priceNumeric = Number(String(item.price).replace(/[^0-9.-]+/g, '')) || 0;
        const category = item.name.toLowerCase().includes('bottle') ? 'accessories' : 'apparel';
        return productsAPI.create({
          name: item.name,
          description: `${item.name} - premium quality`,
          price: priceNumeric,
          category,
          image: item.linkImg[Object.keys(item.linkImg)[0]] || '',
          stock: 10
        });
      });

      await Promise.all(productPromises);

      // Seed classes
      const classesFlat = Object.keys(classesByDay).reduce((acc, day) => {
        const list = classesByDay[day].map(c => ({ ...c, schedule: { day, time: c.time } }));
        return acc.concat(list);
      }, []);

      const classPromises = classesFlat.map(c => classesAPI.create({
        name: c.name,
        description: c.description || c.icon || 'Class session',
        instructor: c.trainer || 'Staff',
        schedule: c.schedule || { day: 'Monday', time: c.time },
        duration: parseInt(c.duration) || 60,
        capacity: c.spots || 20,
        level: (c.level || 'all').toLowerCase()
      }));

      await Promise.all(classPromises);

      alert('✅ Database seeded successfully!');
      await loadDashboardData();
    } catch (error) {
      console.error('Seeding error:', error);
      alert('❌ Seeding failed. Check console.');
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
      console.error('Approve error:', error);
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
      console.error('Reject error:', error);
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
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Loading Dashboard...
        </motion.p>
      </div>
    );
  }

  const statCards = [
    { icon: FiUsers, label: 'Total Users', value: stats.totalUsers, color: 'cyan', gradient: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)' },
    { icon: FiActivity, label: 'Active Members', value: stats.activeMembers, color: 'green', gradient: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)' },
    { icon: FiShoppingBag, label: 'Total Orders', value: stats.totalOrders, color: 'purple', gradient: 'linear-gradient(135deg, #9d00ff 0%, #6600cc 100%)' },
    { icon: FiDollarSign, label: 'Total Revenue', value: `₹${stats.revenue.toLocaleString()}`, color: 'gold', gradient: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)' },
    { icon: FiTrendingUp, label: "Today's Visits", value: stats.todayVisits, color: 'pink', gradient: 'linear-gradient(135deg, #ff00ff 0%, #ff0080 100%)' },
    { icon: FiUserPlus, label: 'New Signups', value: stats.newSignups, color: 'blue', gradient: 'linear-gradient(135deg, #00f5ff 0%, #00d4ff 100%)' }
  ];

  return (
    <div className="admin-container">
      {/* Header */}
      <motion.header 
        className="admin-header"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="admin-logo">
          <h1>🏋️ AURA FIT</h1>
          <span>Admin Dashboard</span>
        </div>
        <div className="admin-actions">
          <div className={`db-status ${dbStatus}`}>
            <FiDatabase />
            <span>{dbStatus === 'connected' ? 'Connected' : 'Disconnected'}</span>
          </div>
          <motion.button 
            onClick={seedDatabase} 
            className="seed-btn" 
            disabled={seeding}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiRefreshCw className={seeding ? 'spinning' : ''} />
            {seeding ? 'Seeding...' : 'Seed Data'}
          </motion.button>
          <motion.button 
            onClick={handleLogout} 
            className="logout-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiLogOut />
            Logout
          </motion.button>
        </div>
      </motion.header>

      {/* Navigation */}
      <motion.nav 
        className="admin-nav"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {[
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'users', label: `Users (${users.length})`, icon: '👥' },
          { id: 'memberships', label: `Memberships (${memberships.filter(m => m.status === 'pending').length})`, icon: '💳' },
          { id: 'orders', label: `Orders (${orders.length})`, icon: '🛒' }
        ].map((tab) => (
          <motion.button
            key={tab.id}
            className={activeTab === tab.id ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setActiveTab(tab.id)}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </motion.button>
        ))}
      </motion.nav>

      {/* Main Content */}
      <main className="admin-main">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="overview-section"
            >
              <h2>Dashboard Overview</h2>
              <div className="stats-grid">
                {statCards.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="stat-card"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <div className="stat-icon" style={{ background: stat.gradient }}>
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
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="users-section"
            >
              <h2>All Users ({users.length})</h2>
              <div className="table-container">
                <table className="admin-table">
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
                    {users.map((user, index) => (
                      <motion.tr
                        key={user._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`membership-badge ${user.membership?.toLowerCase()}`}>
                            {user.membership || 'None'}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${user.status?.toLowerCase()}`}>
                            {user.status}
                          </span>
                        </td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'memberships' && (
            <motion.div
              key="memberships"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="memberships-section"
            >
              <h2>Membership Requests</h2>
              <div className="table-container">
                <table className="admin-table">
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
                    {memberships.map((membership, index) => (
                      <motion.tr
                        key={membership._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <td>{membership.name}</td>
                        <td>{membership.email}</td>
                        <td>
                          <span className={`plan-badge ${membership.plan}`}>
                            {membership.plan}
                          </span>
                        </td>
                        <td>₹{membership.price}</td>
                        <td>
                          <span className={`status-badge ${membership.status}`}>
                            {membership.status}
                          </span>
                        </td>
                        <td>
                          {membership.status === 'pending' && (
                            <div className="action-buttons">
                              <motion.button
                                onClick={() => approveMembership(membership._id)}
                                className="approve-btn"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <FiCheckCircle /> Approve
                              </motion.button>
                              <motion.button
                                onClick={() => rejectMembership(membership._id)}
                                className="reject-btn"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <FiXCircle /> Reject
                              </motion.button>
                            </div>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="orders-section"
            >
              <h2>All Orders ({orders.length})</h2>
              <div className="table-container">
                <table className="admin-table">
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
                    {orders.map((order, index) => (
                      <motion.tr
                        key={order._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <td>#{order._id?.slice(-6)}</td>
                        <td>{order.customerName}</td>
                        <td>{order.items?.length || 0} items</td>
                        <td>₹{order.totalAmount}</td>
                        <td>
                          <span className={`status-badge ${order.status?.toLowerCase()}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminDashboard;
