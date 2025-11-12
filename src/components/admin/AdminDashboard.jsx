import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './admin.css';
import { 
  FaUsers, 
  FaDumbbell, 
  FaShoppingCart, 
  FaSignOutAlt, 
  FaHome,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaUserCheck,
  FaBell,
  FaChartLine,
  FaAppleAlt,
  FaHeadset
} from 'react-icons/fa';
import Logo from '../logo/Logo';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeMembers: 0,
    totalOrders: 0,
    revenue: 0,
    todayVisits: 0,
    newSignups: 0
  });
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: '🛒 New Order Placed', message: 'Rahul Sharma ordered Whey Protein (₹2,499)', time: '5 minutes ago', unread: true, type: 'order' },
    { id: 2, title: '👤 New User Signup', message: 'Priya Patel joined with Premium membership', time: '1 hour ago', unread: true, type: 'user' },
    { id: 3, title: '⚠️ Class Capacity Alert', message: 'Yoga class has reached maximum capacity (20/20)', time: '2 hours ago', unread: false, type: 'alert' },
    { id: 4, title: '💪 Workout Plan Generated', message: 'Vikram Singh created a new workout plan', time: '3 hours ago', unread: false, type: 'activity' },
    { id: 5, title: '🍎 Nutrition Plan Created', message: 'Sneha Reddy calculated nutrition requirements', time: '5 hours ago', unread: false, type: 'activity' }
  ]);

  useEffect(() => {
    // Check if admin is logged in
    const admin = localStorage.getItem('admin');
    if (!admin) {
      navigate('/admin/login');
      return;
    }

    // Load dashboard data
    loadDashboardData();
  }, [navigate]);

  useEffect(() => {
    // Load data based on active tab
    if (activeTab === 'users') {
      loadAllUsers();
    } else if (activeTab === 'orders') {
      loadOrders();
    } else if (activeTab === 'memberships') {
      loadMemberships();
    }
  }, [activeTab]);

  useEffect(() => {
    // Close notification dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notification-wrapper')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const loadDashboardData = async () => {
    try {
      // Fetch statistics
      const statsResponse = await fetch('http://localhost:5000/api/admin/stats');
      const statsData = await statsResponse.json();
      
      if (statsData.success) {
        setStats(statsData.data);
      }

      // Fetch recent users
      const usersResponse = await fetch('http://localhost:5000/api/admin/users/recent');
      const usersData = await usersResponse.json();
      
      if (usersData.success) {
        setUsers(usersData.data.map(user => ({
          id: user._id,
          name: user.name,
          email: user.email,
          membership: user.membership || 'None',
          status: user.status,
          joinDate: new Date(user.createdAt).toLocaleDateString('en-IN')
        })));
      }
      
      // Also load all users for the Users tab
      loadAllUsers();
      
      // Load memberships for dashboard
      loadMemberships();
    } catch (error) {
      console.warn('Using demo data - MongoDB not connected:', error.message);
      // Fallback to demo data if API fails (MongoDB not connected)
      setStats({
        totalUsers: 156,
        activeMembers: 89,
        totalOrders: 234,
        revenue: 456789,
        todayVisits: 42,
        newSignups: 12
      });
      
      setUsers([
        { id: 1, name: 'Rahul Sharma', email: 'rahul@example.com', membership: 'Premium', status: 'Active', joinDate: '15/01/2024' },
        { id: 2, name: 'Priya Patel', email: 'priya@example.com', membership: 'Pro', status: 'Active', joinDate: '20/02/2024' },
        { id: 3, name: 'Vikram Singh', email: 'vikram@example.com', membership: 'Basic', status: 'Active', joinDate: '10/03/2024' },
        { id: 4, name: 'Sneha Reddy', email: 'sneha@example.com', membership: 'Premium', status: 'Inactive', joinDate: '05/01/2024' },
        { id: 5, name: 'Arjun Kumar', email: 'arjun@example.com', membership: 'Pro', status: 'Active', joinDate: '28/02/2024' },
      ]);
      
      // Load demo data for other tabs
      loadAllUsers();
      loadMemberships();
    }
  };

  const loadAllUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/users');
      const data = await response.json();
      
      if (data.success) {
        setAllUsers(data.data.map(user => ({
          id: user._id,
          name: user.name,
          email: user.email,
          membership: user.membership,
          status: user.status,
          joinDate: new Date(user.createdAt).toLocaleDateString('en-IN')
        })));
      }
    } catch (error) {
      console.warn('Using demo data - MongoDB not connected');
      // Demo data fallback
      setAllUsers([
        { id: 1, name: 'Rahul Sharma', email: 'rahul@example.com', membership: 'Premium', status: 'Active', joinDate: '15/01/2024' },
        { id: 2, name: 'Priya Patel', email: 'priya@example.com', membership: 'Pro', status: 'Active', joinDate: '20/02/2024' },
        { id: 3, name: 'Vikram Singh', email: 'vikram@example.com', membership: 'Basic', status: 'Active', joinDate: '10/03/2024' },
        { id: 4, name: 'Sneha Reddy', email: 'sneha@example.com', membership: 'Premium', status: 'Inactive', joinDate: '05/01/2024' },
        { id: 5, name: 'Arjun Kumar', email: 'arjun@example.com', membership: 'Pro', status: 'Active', joinDate: '28/02/2024' },
        { id: 6, name: 'Amit Verma', email: 'amit@example.com', membership: 'Basic', status: 'Active', joinDate: '12/03/2024' },
        { id: 7, name: 'Neha Gupta', email: 'neha@example.com', membership: 'Premium', status: 'Active', joinDate: '18/02/2024' },
        { id: 8, name: 'Rohan Das', email: 'rohan@example.com', membership: 'Pro', status: 'Active', joinDate: '25/01/2024' },
      ]);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/orders');
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.warn('Using demo data - MongoDB not connected');
      // Demo orders fallback
      setOrders([
        { _id: 'ORD001', userName: 'Rahul Sharma', userEmail: 'rahul@example.com', items: [{ productName: 'Whey Protein' }], totalAmount: 2499, status: 'Delivered', orderDate: new Date('2024-03-10') },
        { _id: 'ORD002', userName: 'Priya Patel', userEmail: 'priya@example.com', items: [{ productName: 'Yoga Mat' }, { productName: 'Resistance Bands' }], totalAmount: 1899, status: 'Shipped', orderDate: new Date('2024-03-12') },
        { _id: 'ORD003', userName: 'Vikram Singh', userEmail: 'vikram@example.com', items: [{ productName: 'Dumbbells Set' }], totalAmount: 3999, status: 'Processing', orderDate: new Date('2024-03-14') },
        { _id: 'ORD004', userName: 'Sneha Reddy', userEmail: 'sneha@example.com', items: [{ productName: 'Gym Bag' }], totalAmount: 1299, status: 'Pending', orderDate: new Date('2024-03-15') },
      ]);
    }
  };

  const loadMemberships = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/memberships');
      const data = await response.json();
      
      if (data.success) {
        setMemberships(data.data);
      }
    } catch (error) {
      console.warn('Using demo data - MongoDB not connected');
      // Demo memberships fallback
      setMemberships([
        { _id: 'MEM001', name: 'Rahul Sharma', email: 'rahul@example.com', plan: 'premium', duration: '1-month', price: 2499, status: 'active', startDate: new Date('2024-03-01'), createdAt: new Date('2024-03-01') },
        { _id: 'MEM002', name: 'Priya Patel', email: 'priya@example.com', plan: 'pro', duration: '1-month', price: 1699, status: 'active', startDate: new Date('2024-03-05'), createdAt: new Date('2024-03-05') },
        { _id: 'MEM003', name: 'Vikram Singh', email: 'vikram@example.com', plan: 'basic', duration: '1-month', price: 999, status: 'active', startDate: new Date('2024-03-10'), createdAt: new Date('2024-03-10') },
      ]);
    }
  };

  const handleApproveMembership = async (membershipId) => {
    if (!window.confirm('Approve this membership?')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/memberships/${membershipId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Membership approved successfully!');
        loadMemberships(); // Reload memberships
      } else {
        alert(data.message || 'Failed to approve membership');
      }
    } catch (error) {
      console.error('Error approving membership:', error);
      alert('Error approving membership');
    }
  };

  const handleRejectMembership = async (membershipId) => {
    if (!window.confirm('Reject this membership? This action cannot be undone.')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/memberships/${membershipId}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Membership rejected');
        loadMemberships(); // Reload memberships
      } else {
        alert(data.message || 'Failed to reject membership');
      }
    } catch (error) {
      console.error('Error rejecting membership:', error);
      alert('Error rejecting membership');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin');
    navigate('/admin/login');
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, unread: false } : notif
    ));
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="admin-container-new">
      <header className="admin-topbar">
        <div className="topbar-left">
          <Logo size="small" color="gradient" />
        </div>
        
        <div className="topbar-center">
          <h1 onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
            Admin Panel
          </h1>
        </div>
        
        <div className="topbar-right">
          <div className="notification-wrapper">
            <button 
              className={`notification-btn ${showNotifications ? 'active' : ''}`}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <FaBell />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>
            
            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <h3>Notifications</h3>
                  {notifications.length > 0 && (
                    <button className="notification-clear" onClick={clearNotifications}>
                      Clear All
                    </button>
                  )}
                </div>
                <div className="notification-list">
                  {notifications.length > 0 ? (
                    notifications.map(notif => (
                      <div 
                        key={notif.id} 
                        className={`notification-item ${notif.unread ? 'unread' : ''}`}
                        onClick={() => markAsRead(notif.id)}
                      >
                        <div className="notification-title">{notif.title}</div>
                        <div className="notification-message">{notif.message}</div>
                        <div className="notification-time">{notif.time}</div>
                      </div>
                    ))
                  ) : (
                    <div className="notification-empty">
                      <FaBell />
                      <div>No notifications</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="admin-profile">
            <div className="admin-badge">
              <FaUserCheck />
            </div>
            <div className="admin-info">
              <span className="admin-name">Sumant Yadav</span>
              <span className="admin-role">Administrator</span>
            </div>
            <button className="logout-btn-new" onClick={handleLogout}>
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </header>

      <div className="admin-content-wrapper">
        <nav className="admin-tabs-grid">
          <button 
            className={activeTab === 'dashboard' ? 'tab-active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            <FaHome /> Dashboard
          </button>
          <button 
            className={activeTab === 'users' ? 'tab-active' : ''}
            onClick={() => setActiveTab('users')}
          >
            <FaUsers /> Users
          </button>
          <button 
            className={activeTab === 'memberships' ? 'tab-active' : ''}
            onClick={() => setActiveTab('memberships')}
          >
            <FaMoneyBillWave /> Memberships
          </button>
          <button 
            className={activeTab === 'workout-plans' ? 'tab-active' : ''}
            onClick={() => setActiveTab('workout-plans')}
          >
            <FaDumbbell /> Workout Plans
          </button>
          <button 
            className={activeTab === 'nutrition-plans' ? 'tab-active' : ''}
            onClick={() => setActiveTab('nutrition-plans')}
          >
            <FaAppleAlt /> Nutrition Plans
          </button>
          <button 
            className={activeTab === 'progress-tracking' ? 'tab-active' : ''}
            onClick={() => setActiveTab('progress-tracking')}
          >
            <FaChartLine /> Progress Tracking
          </button>
          <button 
            className={activeTab === 'classes' ? 'tab-active' : ''}
            onClick={() => setActiveTab('classes')}
          >
            <FaCalendarAlt /> Class Enrollments
          </button>
          <button 
            className={activeTab === 'orders' ? 'tab-active' : ''}
            onClick={() => setActiveTab('orders')}
          >
            <FaShoppingCart /> Shop Orders
          </button>
          <button 
            className={activeTab === 'contacts' ? 'tab-active' : ''}
            onClick={() => setActiveTab('contacts')}
          >
            <FaHeadset /> Contact Queries
          </button>
        </nav>

        <main className="admin-main-new">

        {activeTab === 'dashboard' && (
          <div className="dashboard-grid">
            <div className="stat-card-new" onClick={() => setActiveTab('users')} title="Click to view all users">
              <div className="stat-header">
                <FaUsers className="stat-icon-new users-icon" />
                <span className="stat-label">Total Users</span>
              </div>
              <div className="stat-value">{stats.totalUsers}</div>
              <div className="stat-change positive">+12 this month</div>
            </div>

            <div className="stat-card-new" onClick={() => setActiveTab('memberships')} title="Click to view all memberships">
              <div className="stat-header">
                <FaMoneyBillWave className="stat-icon-new revenue-icon" />
                <span className="stat-label">Memberships</span>
              </div>
              <div className="stat-value">{memberships.length}</div>
              <div className="stat-change positive">Active subscriptions</div>
            </div>

            <div className="stat-card-new" onClick={() => setActiveTab('orders')} title="Click to view all orders">
              <div className="stat-header">
                <FaShoppingCart className="stat-icon-new orders-icon" />
                <span className="stat-label">Shop Orders</span>
              </div>
              <div className="stat-value">{stats.totalOrders}</div>
              <div className="stat-change positive">+23 today</div>
            </div>

            <div className="stat-card-new" onClick={() => setActiveTab('workout-plans')} title="Click to view workout plans">
              <div className="stat-header">
                <FaDumbbell className="stat-icon-new members-icon" />
                <span className="stat-label">Workout Plans</span>
              </div>
              <div className="stat-value">0</div>
              <div className="stat-change">AI Generated</div>
            </div>

            <div className="stat-card-new" onClick={() => setActiveTab('nutrition-plans')} title="Click to view nutrition plans">
              <div className="stat-header">
                <FaAppleAlt className="stat-icon-new revenue-icon" />
                <span className="stat-label">Nutrition Plans</span>
              </div>
              <div className="stat-value">0</div>
              <div className="stat-change">AI Calculated</div>
            </div>

            <div className="stat-card-new" onClick={() => setActiveTab('progress-tracking')} title="Click to view progress tracking">
              <div className="stat-header">
                <FaChartLine className="stat-icon-new visits-icon" />
                <span className="stat-label">Progress Entries</span>
              </div>
              <div className="stat-value">0</div>
              <div className="stat-change">Body Tracking</div>
            </div>

            <div className="stat-card-new" onClick={() => setActiveTab('classes')} title="Click to view class enrollments">
              <div className="stat-header">
                <FaCalendarAlt className="stat-icon-new signups-icon" />
                <span className="stat-label">Class Enrollments</span>
              </div>
              <div className="stat-value">0</div>
              <div className="stat-change">Total Enrolled</div>
            </div>

            <div className="recent-activity-card">
              <h2>Recent Users</h2>
              <div className="users-list">
                {users.slice(0, 5).map(user => (
                  <div key={user.id} className="user-item">
                    <div className="user-avatar">{user.name.charAt(0)}</div>
                    <div className="user-details">
                      <div className="user-name">{user.name}</div>
                      <div className="user-email">{user.email}</div>
                    </div>
                    <span className={`badge-new ${user.membership.toLowerCase()}`}>
                      {user.membership}
                    </span>
                    <span className={`status-new ${user.status.toLowerCase()}`}>
                      {user.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="admin-content">
            <div className="content-header">
              <div>
                <h2><FaUsers /> All Users ({allUsers.length})</h2>
                <p className="tab-description">Manage all registered users and their memberships</p>
              </div>
              <div className="header-stats">
                <div className="mini-stat">
                  <span className="mini-stat-value">{allUsers.filter(u => u.status === 'Active').length}</span>
                  <span className="mini-stat-label">Active</span>
                </div>
                <div className="mini-stat">
                  <span className="mini-stat-value">{allUsers.filter(u => u.membership !== 'None').length}</span>
                  <span className="mini-stat-label">With Membership</span>
                </div>
              </div>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Membership</th>
                  <th>Status</th>
                  <th>Join Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.length > 0 ? (
                  allUsers.map(user => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td><span className={`badge ${user.membership.toLowerCase()}`}>{user.membership}</span></td>
                      <td><span className={`status ${user.status.toLowerCase()}`}>{user.status}</span></td>
                      <td>{user.joinDate}</td>
                      <td>
                        <button className="action-btn view">View</button>
                        <button className="action-btn edit">Edit</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'memberships' && (
          <div className="admin-content">
            <div className="content-header">
              <div>
                <h2><FaMoneyBillWave /> Membership Purchases ({memberships.length})</h2>
                <p className="tab-description">View all membership purchases and subscriptions</p>
              </div>
              <div className="header-stats">
                <div className="mini-stat">
                  <span className="mini-stat-value">{memberships.filter(m => m.status === 'active').length}</span>
                  <span className="mini-stat-label">Active</span>
                </div>
                <div className="mini-stat">
                  <span className="mini-stat-value">₹{memberships.reduce((sum, m) => sum + (m.price || 0), 0).toLocaleString()}</span>
                  <span className="mini-stat-label">Total Revenue</span>
                </div>
              </div>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Member Name</th>
                  <th>Email</th>
                  <th>Plan</th>
                  <th>Duration</th>
                  <th>Price</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Purchased</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {memberships.length > 0 ? (
                  memberships.map(membership => (
                    <tr key={membership._id}>
                      <td>{membership.name}</td>
                      <td>{membership.email}</td>
                      <td><span className={`badge ${membership.plan}`}>{membership.plan.toUpperCase()}</span></td>
                      <td>{membership.duration}</td>
                      <td>₹{membership.price || 0}</td>
                      <td><span className={`status ${membership.paymentStatus || 'pending'}`}>{membership.paymentStatus || 'pending'}</span></td>
                      <td><span className={`status ${membership.status}`}>{membership.status}</span></td>
                      <td>{new Date(membership.createdAt).toLocaleDateString('en-IN')}</td>
                      <td>
                        {membership.status === 'pending' ? (
                          <>
                            <button 
                              className="action-btn view"
                              onClick={() => handleApproveMembership(membership._id)}
                            >
                              Approve
                            </button>
                            <button 
                              className="action-btn edit"
                              onClick={() => handleRejectMembership(membership._id)}
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span style={{ color: '#888' }}>
                            {membership.status === 'active' ? '✓ Approved' : '✗ Rejected'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                      No membership purchases yet. Users will appear here when they purchase memberships.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="admin-content">
            <h2><FaShoppingCart /> All Orders ({orders.length})</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map(order => (
                    <tr key={order._id}>
                      <td>#{order._id.slice(-6).toUpperCase()}</td>
                      <td>
                        <div>{order.userName}</div>
                        <div style={{ fontSize: '0.85rem', color: '#888' }}>{order.userEmail}</div>
                      </td>
                      <td>{order.items.length} items</td>
                      <td>₹{order.totalAmount.toLocaleString()}</td>
                      <td><span className={`status ${order.status.toLowerCase()}`}>{order.status}</span></td>
                      <td>{new Date(order.orderDate).toLocaleDateString('en-IN')}</td>
                      <td>
                        <button className="action-btn view">View</button>
                        <button className="action-btn edit">Update</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'workout-plans' && (
          <div className="admin-content">
            <h2><FaDumbbell /> AI-Generated Workout Plans</h2>
            <p className="tab-description">View all workout plans generated by users through the AI Workout Generator</p>
            <div className="data-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Plan Type</th>
                    <th>Fitness Level</th>
                    <th>Goals</th>
                    <th>Days/Week</th>
                    <th>Generated</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                      No workout plans generated yet. Users will appear here when they use the AI Workout Generator.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'nutrition-plans' && (
          <div className="admin-content">
            <h2><FaAppleAlt /> AI-Generated Nutrition Plans</h2>
            <p className="tab-description">View all nutrition plans calculated by users through the Nutrition Calculator</p>
            <div className="data-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Goal</th>
                    <th>Calories</th>
                    <th>Protein</th>
                    <th>Carbs</th>
                    <th>Fats</th>
                    <th>Generated</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                      No nutrition plans generated yet. Users will appear here when they use the Nutrition Calculator.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'progress-tracking' && (
          <div className="admin-content">
            <h2><FaChartLine /> User Progress Tracking</h2>
            <p className="tab-description">View all body measurements and progress tracked by users</p>
            <div className="data-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Weight</th>
                    <th>BMI</th>
                    <th>Body Fat %</th>
                    <th>Goal Type</th>
                    <th>Target Weight</th>
                    <th>Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                      No progress data tracked yet. Users will appear here when they use the Body Tracker.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'classes' && (
          <div className="admin-content">
            <h2><FaCalendarAlt /> Class Enrollments</h2>
            <p className="tab-description">View all class enrollments and manage capacity</p>
            <div className="data-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Class Name</th>
                    <th>Instructor</th>
                    <th>Schedule</th>
                    <th>Enrolled</th>
                    <th>Capacity</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                      No class enrollments yet. Users will appear here when they enroll in classes.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="admin-content">
            <h2><FaHeadset /> Contact Form Submissions</h2>
            <p className="tab-description">View all contact queries submitted by users</p>
            <div className="data-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Subject</th>
                    <th>Message</th>
                    <th>Submitted</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                      No contact queries yet. Users will appear here when they submit the contact form.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
