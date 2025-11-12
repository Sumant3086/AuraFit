import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './newAdmin.css';
import { 
  FaUsers, 
  FaDumbbell, 
  FaShoppingCart, 
  FaMoneyBillWave,
  FaChartLine,
  FaBell,
  FaSignOutAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaSearch,
  FaDownload
} from 'react-icons/fa';
import Logo from '../logo/Logo';

const NewAdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    activeMembers: 0,
    totalOrders: 0,
    todayRevenue: 0
  });
  
  const [users, setUsers] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Check if admin is logged in
    const admin = localStorage.getItem('admin');
    if (!admin) {
      navigate('/admin/login');
      return;
    }

    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      // Test server connection first
      const healthCheck = await fetch('http://localhost:5000/api/health');
      if (healthCheck.ok) {
        console.log('✅ Server is connected');
      }
      
      // Load all data
      await Promise.all([
        loadUsers(),
        loadMemberships(),
        loadOrders()
      ]);
      
      // Load stats after other data is loaded
      await loadStats();
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      console.log('Make sure the backend server is running on http://localhost:5000');
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/users');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Users loaded:', data);
      if (data.success) {
        setUsers(data.data || []);
      } else {
        console.error('Failed to load users:', data.message);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    }
  };

  const loadMemberships = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/memberships');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Memberships loaded:', data);
      if (data.success) {
        setMemberships(data.data || []);
      } else {
        console.error('Failed to load memberships:', data.message);
        setMemberships([]);
      }
    } catch (error) {
      console.error('Error loading memberships:', error);
      setMemberships([]);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/orders');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Orders loaded:', data);
      if (data.success) {
        setOrders(data.data || []);
      } else {
        console.error('Failed to load orders:', data.message);
        setOrders([]);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/stats');
      const data = await response.json();
      if (data.success) {
        setStats({
          totalUsers: data.data.totalUsers || 0,
          totalRevenue: data.data.revenue || 0,
          pendingApprovals: memberships.filter(m => m.status === 'pending').length,
          activeMembers: data.data.activeMembers || 0,
          totalOrders: data.data.totalOrders || 0,
          todayRevenue: 0
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      // Calculate from loaded data
      setStats({
        totalUsers: users.length,
        totalRevenue: memberships.reduce((sum, m) => sum + (m.price || 0), 0),
        pendingApprovals: memberships.filter(m => m.status === 'pending').length,
        activeMembers: users.filter(u => u.membership && u.membership !== 'None').length,
        totalOrders: orders.length,
        todayRevenue: 0
      });
    }
  };

  const handleApproveMembership = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/memberships/${id}/approve`, {
        method: 'PATCH'
      });
      const data = await response.json();
      if (data.success) {
        alert('✅ Membership approved!');
        loadMemberships();
        loadStats();
      }
    } catch (error) {
      alert('Error approving membership');
    }
  };

  const handleRejectMembership = async (id) => {
    if (!window.confirm('Reject this membership?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/memberships/${id}/reject`, {
        method: 'PATCH'
      });
      const data = await response.json();
      if (data.success) {
        alert('❌ Membership rejected');
        loadMemberships();
        loadStats();
      }
    } catch (error) {
      alert('Error rejecting membership');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin');
    navigate('/admin/login');
  };

  return (
    <div className="new-admin-container">
      {/* Sidebar */}
      <aside className="admin-sidebar-new">
        <div className="sidebar-header">
          <Logo size="small" color="gradient" />
          <h2>Admin Panel</h2>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={activeTab === 'overview' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('overview')}
          >
            <FaChartLine /> Overview
          </button>
          <button 
            className={activeTab === 'users' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('users')}
          >
            <FaUsers /> Users
          </button>
          <button 
            className={activeTab === 'memberships' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('memberships')}
          >
            <FaMoneyBillWave /> Memberships
            {memberships.filter(m => m.status === 'pending').length > 0 && (
              <span className="badge-count">{memberships.filter(m => m.status === 'pending').length}</span>
            )}
          </button>
          <button 
            className={activeTab === 'orders' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('orders')}
          >
            <FaShoppingCart /> Orders
          </button>
          <button 
            className={activeTab === 'activity' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('activity')}
          >
            <FaBell /> Activity
          </button>
        </nav>

        <button className="logout-btn-new" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main-content">
        {/* Header */}
        <header className="content-header-new">
          <div>
            <h1>Welcome back, Admin! 👋</h1>
            <p>Here's what's happening with your gym today</p>
          </div>
          <div className="header-actions">
            <div className="search-box">
              <FaSearch />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="icon-btn">
              <FaBell />
              <span className="notification-dot"></span>
            </button>
          </div>
        </header>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-content">
            {/* Stats Grid */}
            <div className="stats-grid-new">
              <div className="stat-card-gradient">
                <div className="stat-icon users-gradient">
                  <FaUsers />
                </div>
                <div className="stat-info">
                  <h3>{stats.totalUsers}</h3>
                  <p>Total Users</p>
                  <span className="stat-change positive">+12% this month</span>
                </div>
              </div>

              <div className="stat-card-gradient">
                <div className="stat-icon revenue-gradient">
                  <FaMoneyBillWave />
                </div>
                <div className="stat-info">
                  <h3>₹{stats.totalRevenue.toLocaleString()}</h3>
                  <p>Total Revenue</p>
                  <span className="stat-change positive">+8% this week</span>
                </div>
              </div>

              <div className="stat-card-gradient">
                <div className="stat-icon pending-gradient">
                  <FaClock />
                </div>
                <div className="stat-info">
                  <h3>{stats.pendingApprovals}</h3>
                  <p>Pending Approvals</p>
                  <span className="stat-change">Needs attention</span>
                </div>
              </div>

              <div className="stat-card-gradient">
                <div className="stat-icon members-gradient">
                  <FaDumbbell />
                </div>
                <div className="stat-info">
                  <h3>{stats.activeMembers}</h3>
                  <p>Active Members</p>
                  <span className="stat-change positive">+5 today</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              <h2>Quick Actions</h2>
              <div className="action-cards">
                <button className="action-card" onClick={() => setActiveTab('memberships')}>
                  <FaCheckCircle />
                  <span>Approve Memberships</span>
                  {stats.pendingApprovals > 0 && <span className="badge">{stats.pendingApprovals}</span>}
                </button>
                <button className="action-card" onClick={() => setActiveTab('users')}>
                  <FaUsers />
                  <span>Manage Users</span>
                </button>
                <button className="action-card" onClick={() => setActiveTab('orders')}>
                  <FaShoppingCart />
                  <span>View Orders</span>
                </button>
                <button className="action-card">
                  <FaDownload />
                  <span>Export Data</span>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="recent-section">
              <h2>Recent Memberships</h2>
              <div className="activity-list">
                {memberships.slice(0, 5).map(membership => (
                  <div key={membership._id} className="activity-item">
                    <div className="activity-icon">
                      <FaMoneyBillWave />
                    </div>
                    <div className="activity-details">
                      <p><strong>{membership.name}</strong> purchased <strong>{membership.plan}</strong> plan</p>
                      <span>{new Date(membership.createdAt).toLocaleString()}</span>
                    </div>
                    <span className={`status-badge ${membership.status}`}>
                      {membership.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="tab-content">
            <div className="tab-header">
              <h2><FaUsers /> All Users ({users.length})</h2>
              <button className="btn-primary">
                <FaDownload /> Export
              </button>
            </div>
            <div className="data-table-wrapper">
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
                  {users.map(user => (
                    <tr key={user._id}>
                      <td><strong>{user.name}</strong></td>
                      <td>{user.email}</td>
                      <td><span className={`badge ${user.membership?.toLowerCase()}`}>{user.membership || 'None'}</span></td>
                      <td><span className={`status-badge ${user.status?.toLowerCase()}`}>{user.status}</span></td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Memberships Tab */}
        {activeTab === 'memberships' && (
          <div className="tab-content">
            <div className="tab-header">
              <h2><FaMoneyBillWave /> Memberships ({memberships.length})</h2>
              <div className="filter-buttons">
                <button className="btn-filter">All</button>
                <button className="btn-filter active">Pending</button>
                <button className="btn-filter">Active</button>
              </div>
            </div>
            <div className="data-table-wrapper">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Plan</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {memberships.map(membership => (
                    <tr key={membership._id}>
                      <td>
                        <div>
                          <strong>{membership.name}</strong>
                          <br />
                          <small>{membership.email}</small>
                        </div>
                      </td>
                      <td><span className={`badge ${membership.plan}`}>{membership.plan.toUpperCase()}</span></td>
                      <td><strong>₹{membership.price}</strong></td>
                      <td><span className={`status-badge ${membership.status}`}>{membership.status}</span></td>
                      <td>{new Date(membership.createdAt).toLocaleDateString()}</td>
                      <td>
                        {membership.status === 'pending' ? (
                          <div className="action-buttons">
                            <button 
                              className="btn-approve"
                              onClick={() => handleApproveMembership(membership._id)}
                            >
                              <FaCheckCircle /> Approve
                            </button>
                            <button 
                              className="btn-reject"
                              onClick={() => handleRejectMembership(membership._id)}
                            >
                              <FaTimesCircle /> Reject
                            </button>
                          </div>
                        ) : (
                          <span className="action-done">
                            {membership.status === 'active' ? '✓ Approved' : '✗ Rejected'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="tab-content">
            <div className="tab-header">
              <h2><FaShoppingCart /> Shop Orders ({orders.length})</h2>
              <button className="btn-primary">
                <FaDownload /> Export
              </button>
            </div>
            <div className="data-table-wrapper">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order._id}>
                      <td><strong>#{order._id.slice(-6).toUpperCase()}</strong></td>
                      <td>
                        <div>
                          <strong>{order.userName}</strong>
                          <br />
                          <small>{order.userEmail}</small>
                        </div>
                      </td>
                      <td>{order.items?.length || 0} items</td>
                      <td><strong>₹{order.totalAmount}</strong></td>
                      <td><span className={`status-badge ${order.status?.toLowerCase()}`}>{order.status}</span></td>
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

export default NewAdminDashboard;
