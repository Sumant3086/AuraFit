import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI, membershipAPI, ordersAPI, productsAPI, classesAPI } from '../../services/api';
import shopData from '../shop/shopData';
import classesByDay from '../classes/classesData';
import './admin.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedStatus, setSeedStatus] = useState('');
  const [dbStatus, setDbStatus] = useState('Unknown');
  
  // Data states
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

  // Seed database with front-end sample data (products & classes)
  const seedDatabase = async () => {
    if (seeding) return;
    setSeeding(true);
    setSeedStatus('Checking existing data...');

    try {
      // Check existing counts
      const existingProducts = (await productsAPI.getAll()).data || [];
      const existingClasses = (await classesAPI.getAll()).data || [];

      if (existingProducts.length > 0 || existingClasses.length > 0) {
        setSeedStatus('Database already has products or classes. Skipping seeding.');
        setTimeout(() => setSeedStatus(''), 3000);
        setSeeding(false);
        return;
      }

      setSeedStatus('Seeding products...');

      // Products: convert front-end shopData items to Product shape
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

      setSeedStatus('Seeding classes...');

      // Classes: flatten classesByDay and create class entries
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

      setSeedStatus('Data seeded successfully. Refreshing dashboard...');
      // Refresh data
      await loadDashboardData();
      setTimeout(() => setSeedStatus(''), 3000);
    } catch (error) {
      console.error('Seeding error:', error);
      setSeedStatus('Seeding failed. Check server logs.');
    } finally {
      setSeeding(false);
    }
  };

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
        loadOrders()
      ]);

      // Check DB health
      try {
        const health = await adminAPI.healthCheck();
        if (health && (health.status || health.success)) {
          setDbStatus('Connected');
        } else {
          setDbStatus('Disconnected');
        }
      } catch (err) {
        setDbStatus('Disconnected');
      }
    } catch (error) {
      console.error('❌ Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await adminAPI.getStats();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('❌ Stats error:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await adminAPI.getUsers();
      if (data.success) {
        setUsers(data.data || []);
      }
    } catch (error) {
      console.error('❌ Users error:', error);
    }
  };

  const loadMemberships = async () => {
    try {
      const data = await membershipAPI.getAll();
      if (data.success) {
        setMemberships(data.data || []);
      }
    } catch (error) {
      console.error('❌ Memberships error:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const data = await adminAPI.getOrders();
      if (data.success) {
        setOrders(data.data || []);
      }
    } catch (error) {
      console.error('❌ Orders error:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin');
    navigate('/admin/login');
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
      console.error('❌ Approve error:', error);
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
      console.error('❌ Reject error:', error);
      alert('❌ Error rejecting membership');
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-logo">
          <h1>🏋️ AURA FIT</h1>
          <span>Admin Dashboard</span>
        </div>
        <div className="admin-user">
          <span>Welcome, Admin!</span>
          <div className="db-status" title="MongoDB status">{dbStatus}</div>
          <button onClick={seedDatabase} className="seed-btn" disabled={seeding}>
            {seeding ? (seedStatus || 'Seeding...') : 'Seed Data'}
          </button>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="admin-nav">
        <button 
          className={activeTab === 'overview' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={activeTab === 'users' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('users')}
        >
          👥 Users ({users.length})
        </button>
        <button 
          className={activeTab === 'memberships' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('memberships')}
        >
          💳 Memberships ({memberships.filter(m => m.status === 'pending').length})
        </button>
        <button 
          className={activeTab === 'orders' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('orders')}
        >
          🛒 Orders ({orders.length})
        </button>
      </nav>

      {/* Main Content */}
      <main className="admin-main">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <h2>Dashboard Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <h3>{stats.totalUsers}</h3>
                  <p>Total Users</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💪</div>
                <div className="stat-info">
                  <h3>{stats.activeMembers}</h3>
                  <p>Active Members</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🛒</div>
                <div className="stat-info">
                  <h3>{stats.totalOrders}</h3>
                  <p>Total Orders</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <h3>₹{stats.revenue.toLocaleString()}</h3>
                  <p>Total Revenue</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📈</div>
                <div className="stat-info">
                  <h3>{stats.todayVisits}</h3>
                  <p>Today's Visits</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🆕</div>
                <div className="stat-info">
                  <h3>{stats.newSignups}</h3>
                  <p>New Signups</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-section">
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
                  {users.map(user => (
                    <tr key={user._id}>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'memberships' && (
          <div className="memberships-section">
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
                  {memberships.map(membership => (
                    <tr key={membership._id}>
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
                            <button 
                              onClick={() => approveMembership(membership._id)}
                              className="approve-btn"
                            >
                              ✅ Approve
                            </button>
                            <button 
                              onClick={() => rejectMembership(membership._id)}
                              className="reject-btn"
                            >
                              ❌ Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="orders-section">
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
                  {orders.map(order => (
                    <tr key={order._id}>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;