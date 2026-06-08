import { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FiUsers, FiDollarSign, FiShoppingBag, FiTrendingUp,
  FiActivity, FiUserPlus, FiCheckCircle,
  FiLogOut, FiDatabase, FiRefreshCw, FiHeart, FiTarget,
  FiCalendar, FiMenu, FiX, FiHome, FiPackage, FiCreditCard,
  FiBarChart2, FiMessageCircle, FiLock, FiAlertCircle,
  FiRepeat, FiMap, FiBell, FiHelpCircle, FiShield,
  FiFileText, FiTrendingDown, FiZap,
} from 'react-icons/fi';
import { adminAPI, membershipAPI, productsAPI, classesAPI } from '../../services/api';
import shopData from '../shop/shopData';
import classesByDay from '../classes/classesData';
import AnalyticsCharts from './AnalyticsCharts';
import AdminKPIBoard from './AdminKPIBoard';
import './admin.css';

// Lazy-load all business modules
const MembershipOps = lazy(() => import('./modules/MembershipOps'));
const SubscriptionLifecycle = lazy(() => import('./modules/SubscriptionLifecycle'));
const RazorpayCenter = lazy(() => import('./modules/RazorpayCenter'));
const FinancialAnalytics = lazy(() => import('./modules/FinancialAnalytics'));
const UserLifecycle = lazy(() => import('./modules/UserLifecycle'));
const CRMLeads = lazy(() => import('./modules/CRMLeads'));
const TrainerOps = lazy(() => import('./modules/TrainerOps'));
const ClassCapacity = lazy(() => import('./modules/ClassCapacity'));
const MultiBranch = lazy(() => import('./modules/MultiBranch'));
const NotificationCenter = lazy(() => import('./modules/NotificationCenter'));
const SupportDesk = lazy(() => import('./modules/SupportDesk'));
const AuditCompliance = lazy(() => import('./modules/AuditCompliance'));
const ReportingExports = lazy(() => import('./modules/ReportingExports'));
const RetentionChurn = lazy(() => import('./modules/RetentionChurn'));

const ModuleLoader = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 24 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <div key={i} style={{ height: 56, background: 'var(--surface-2)', borderRadius: 10, animation: 'pulse 1.5s ease-in-out infinite' }} />
    ))}
  </div>
);

const NAV_GROUPS = [
  {
    label: 'OVERVIEW',
    items: [
      { id: 'overview', label: 'Dashboard', icon: FiHome },
      { id: 'kpis', label: 'Business KPIs', icon: FiTrendingUp },
    ],
  },
  {
    label: 'MEMBERSHIP',
    items: [
      { id: 'membership-ops', label: 'Membership Ops', icon: FiCreditCard },
      { id: 'subscription', label: 'Subscription Lifecycle', icon: FiRepeat },
      { id: 'retention', label: 'Retention & Churn', icon: FiTrendingDown },
    ],
  },
  {
    label: 'REVENUE',
    items: [
      { id: 'razorpay', label: 'Razorpay Center', icon: FiDollarSign },
      { id: 'financial', label: 'Financial Analytics', icon: FiBarChart2 },
      { id: 'tracking', label: 'Analytics Charts', icon: FiZap },
    ],
  },
  {
    label: 'CUSTOMERS',
    items: [
      { id: 'user-lifecycle', label: 'User Lifecycle', icon: FiUsers },
      { id: 'crm', label: 'CRM & Leads', icon: FiMessageCircle },
      { id: 'support', label: 'Support Desk', icon: FiHelpCircle },
      { id: 'notifications', label: 'Notification Center', icon: FiBell },
    ],
  },
  {
    label: 'OPERATIONS',
    items: [
      { id: 'trainer-ops', label: 'Trainer Operations', icon: FiUserPlus },
      { id: 'class-capacity', label: 'Class & Capacity', icon: FiActivity },
      { id: 'branches', label: 'Multi-Branch', icon: FiMap },
    ],
  },
  {
    label: 'LEGACY',
    items: [
      { id: 'users', label: 'Users', icon: FiUsers },
      { id: 'memberships', label: 'Memberships', icon: FiCreditCard },
      { id: 'orders', label: 'Payments', icon: FiShoppingBag },
      { id: 'products', label: 'Products', icon: FiPackage },
      { id: 'classes', label: 'Classes', icon: FiActivity },
      { id: 'trainers', label: 'Trainers', icon: FiUserPlus },
      { id: 'community', label: 'Community', icon: FiMessageCircle },
    ],
  },
  {
    label: 'COMPLIANCE',
    items: [
      { id: 'audit', label: 'Audit & Compliance', icon: FiShield },
      { id: 'reports', label: 'Reports & Exports', icon: FiFileText },
    ],
  },
];

// Flat list for topbar title lookup
const ALL_ITEMS = NAV_GROUPS.flatMap(g => g.items);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [dbStatus, setDbStatus] = useState('checking');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [stats, setStats] = useState({ totalUsers: 0, activeMembers: 0, totalOrders: 0, revenue: 0, todayVisits: 0, newSignups: 0 });
  const [users, setUsers] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [classes, setClasses] = useState([]);

  useEffect(() => { loadDashboardData(); }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadStats(), loadUsers(), loadMemberships(), loadOrders(), loadProducts(), loadClasses(), checkDBStatus()]);
    } catch {}
    finally { setLoading(false); }
  };

  const checkDBStatus = async () => {
    try {
      const health = await adminAPI.healthCheck();
      setDbStatus(health?.status || health?.success ? 'connected' : 'disconnected');
    } catch { setDbStatus('disconnected'); }
  };

  const loadStats = async () => {
    try { const d = await adminAPI.getStats(); if (d?.success && d.data) setStats(d.data); } catch {}
  };
  const loadUsers = async () => {
    try { const d = await adminAPI.getUsers(); if (d?.success) setUsers(Array.isArray(d.data) ? d.data : []); } catch {}
  };
  const loadMemberships = async () => {
    try { const d = await membershipAPI.getAll(); if (d?.success) setMemberships(Array.isArray(d.data) ? d.data : []); } catch {}
  };
  const loadOrders = async () => {
    try { const d = await adminAPI.getOrders(); if (d?.success) setOrders(Array.isArray(d.data) ? d.data : []); } catch {}
  };
  const loadProducts = async () => {
    try { const d = await productsAPI.getAll(); if (d?.success) setProducts(Array.isArray(d.data) ? d.data : []); } catch {}
  };
  const loadClasses = async () => {
    try { const d = await classesAPI.getAll(); if (d?.success) setClasses(Array.isArray(d.data) ? d.data : []); } catch {}
  };

  const seedDatabase = async () => {
    if (seeding) return;
    setSeeding(true);
    try {
      let productsSeeded = 0, classesSeeded = 0;
      const [ep, ec] = await Promise.all([productsAPI.getAll(), classesAPI.getAll()]);
      if ((ep?.data?.length || 0) > 0 && (ec?.data?.length || 0) > 0) {
        toast(`Already has ${ep.data.length} products and ${ec.data.length} classes.`, { icon: 'ℹ️' });
        return;
      }
      if (shopData?.length > 0) {
        for (const item of shopData) {
          try {
            await productsAPI.create({ name: item.name, description: `${item.name} - premium quality`, price: Number(String(item.price).replace(/[^0-9.-]+/g, '')) || 0, category: item.name.toLowerCase().includes('bottle') ? 'accessories' : 'apparel', image: item.linkImg?.[Object.keys(item.linkImg)[0]] || '', stock: 50, rating: 4.5 });
            productsSeeded++;
          } catch {}
        }
      }
      if (classesByDay) {
        const flat = Object.entries(classesByDay).flatMap(([day, list]) => list.map(c => ({ ...c, day })));
        for (const c of flat) {
          try {
            await classesAPI.create({ name: c.name, description: c.description || c.name, instructor: c.trainer || 'Professional Trainer', schedule: { day: c.day, time: c.time || '10:00 AM' }, duration: parseInt(c.duration) || 60, capacity: c.spots || 20, enrolled: 0, level: (c.level || 'all').toLowerCase(), isActive: true });
            classesSeeded++;
          } catch {}
        }
      }
      toast.success(`Seeded ${productsSeeded} products and ${classesSeeded} classes.`);
      loadDashboardData();
    } catch (err) { toast.error(`Seeding failed: ${err.message}`); }
    finally { setSeeding(false); }
  };

  const approveMembership = async (id) => {
    try {
      const r = await fetch(`/api/memberships/${id}/approve`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' } });
      const d = await r.json();
      if (d.success) { toast.success('Approved'); loadMemberships(); loadStats(); }
    } catch { toast.error('Failed'); }
  };
  const rejectMembership = async (id) => {
    try {
      const r = await fetch(`/api/memberships/${id}/reject`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' } });
      const d = await r.json();
      if (d.success) { toast.success('Rejected'); loadMemberships(); loadStats(); }
    } catch { toast.error('Failed'); }
  };

  const handleLogout = () => { localStorage.removeItem('admin'); navigate('/admin/login'); };

  if (loading) {
    return (
      <div className="admin-loading">
        <motion.div className="loading-spinner" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  const pendingCount = memberships.filter(m => m.status === 'pending').length;

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar${sidebarOpen ? ' open' : ' closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <h2>AURA FIT</h2>
            {sidebarOpen && <span>Business OS</span>}
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        <nav className="sidebar-nav" style={{ overflowY: 'auto', flex: 1 }}>
          {NAV_GROUPS.map(group => (
            <div key={group.label}>
              {sidebarOpen && (
                <div className="sidebar-group-label">
                  {group.label}
                </div>
              )}
              {group.items.map(item => (
                <motion.button
                  key={item.id}
                  className={activeTab === item.id ? 'sidebar-item active' : 'sidebar-item'}
                  onClick={() => setActiveTab(item.id)}
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <item.icon className="sidebar-icon" />
                  {sidebarOpen && (
                    <>
                      <span className="sidebar-label">{item.label}</span>
                      {item.id === 'memberships' && pendingCount > 0 && (
                        <span className="sidebar-badge">{pendingCount}</span>
                      )}
                    </>
                  )}
                </motion.button>
              ))}
            </div>
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
        <header className="admin-topbar">
          <div className="topbar-left">
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}><FiMenu /></button>
            <h1>{ALL_ITEMS.find(i => i.id === activeTab)?.label || 'Dashboard'}</h1>
          </div>
          <div className="topbar-right">
            <div className={`status-indicator ${dbStatus}`}>
              <FiDatabase />
              <span>{dbStatus === 'connected' ? 'Connected' : 'Disconnected'}</span>
            </div>
            <motion.button onClick={seedDatabase} className="topbar-btn seed" disabled={seeding} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <FiRefreshCw className={seeding ? 'spinning' : ''} />
              {seeding ? 'Seeding...' : 'Seed Data'}
            </motion.button>
          </div>
        </header>

        <div className="admin-content">
          <AnimatePresence mode="wait">

            {/* ── Business Modules ─────────────────────────────── */}
            {['membership-ops', 'subscription', 'razorpay', 'financial', 'user-lifecycle', 'crm',
              'trainer-ops', 'class-capacity', 'branches', 'notifications', 'support',
              'audit', 'reports', 'retention'].includes(activeTab) && (
              <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="content-section">
                <Suspense fallback={<ModuleLoader />}>
                  {activeTab === 'membership-ops' && <MembershipOps />}
                  {activeTab === 'subscription' && <SubscriptionLifecycle />}
                  {activeTab === 'razorpay' && <RazorpayCenter />}
                  {activeTab === 'financial' && <FinancialAnalytics />}
                  {activeTab === 'user-lifecycle' && <UserLifecycle />}
                  {activeTab === 'crm' && <CRMLeads />}
                  {activeTab === 'trainer-ops' && <TrainerOps />}
                  {activeTab === 'class-capacity' && <ClassCapacity />}
                  {activeTab === 'branches' && <MultiBranch />}
                  {activeTab === 'notifications' && <NotificationCenter />}
                  {activeTab === 'support' && <SupportDesk />}
                  {activeTab === 'audit' && <AuditCompliance />}
                  {activeTab === 'reports' && <ReportingExports />}
                  {activeTab === 'retention' && <RetentionChurn />}
                </Suspense>
              </motion.div>
            )}

            {/* ── Overview ─────────────────────────────────────── */}
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="content-section">
                <div className="stats-grid-modern">
                  {[
                    { icon: FiUsers, color: 'cyan', value: stats.totalUsers, label: 'Total Users' },
                    { icon: FiActivity, color: 'green', value: stats.activeMembers, label: 'Active Members' },
                    { icon: FiShoppingBag, color: 'purple', value: stats.totalOrders, label: 'Total Orders' },
                    { icon: FiDollarSign, color: 'gold', value: `₹${(stats.revenue || 0).toLocaleString()}`, label: 'Revenue' },
                    { icon: FiTrendingUp, color: 'pink', value: stats.todayVisits, label: "Today's Visits" },
                    { icon: FiUserPlus, color: 'blue', value: stats.newSignups, label: 'New Signups (7d)' },
                  ].map(({ icon: Icon, color, value, label }) => (
                    <motion.div key={label} className={`stat-card-modern ${color}`} whileHover={{ y: -5 }}>
                      <div className="stat-card-header">
                        <Icon className="stat-card-icon" />
                      </div>
                      <h3 className="stat-card-value">{value}</h3>
                      <p className="stat-card-label">{label}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="charts-grid">
                  <div className="chart-card">
                    <h3>Quick Stats</h3>
                    <div className="quick-stats">
                      <div className="quick-stat-item"><span className="quick-stat-label">Products</span><span className="quick-stat-value">{products.length}</span></div>
                      <div className="quick-stat-item"><span className="quick-stat-label">Classes</span><span className="quick-stat-value">{classes.length}</span></div>
                      <div className="quick-stat-item"><span className="quick-stat-label">Pending Memberships</span><span className="quick-stat-value">{pendingCount}</span></div>
                      <div className="quick-stat-item"><span className="quick-stat-label">Check-ins Today</span><span className="quick-stat-value">{stats.todayCheckIns || 0}</span></div>
                      <div className="quick-stat-item"><span className="quick-stat-label">Total Check-ins</span><span className="quick-stat-value">{stats.totalCheckIns || 0}</span></div>
                    </div>
                  </div>

                  <div className="chart-card">
                    <h3>Business Modules</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                      {[
                        { tab: 'membership-ops', label: 'Membership Operations', icon: FiCreditCard },
                        { tab: 'razorpay', label: 'Razorpay Center', icon: FiDollarSign },
                        { tab: 'retention', label: 'Retention & Churn', icon: FiTrendingDown },
                        { tab: 'support', label: 'Support Desk', icon: FiHelpCircle },
                        { tab: 'reports', label: 'Reports & Exports', icon: FiFileText },
                      ].map(({ tab, label, icon: Icon }) => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border-1)', background: 'var(--surface-3)', cursor: 'pointer', textAlign: 'left' }}>
                          <Icon size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                          <span style={{ color: 'var(--text-2)', fontSize: 13 }}>{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── KPIs ─────────────────────────────────────────── */}
            {activeTab === 'kpis' && (
              <motion.div key="kpis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="content-section">
                <AdminKPIBoard />
              </motion.div>
            )}

            {/* ── Analytics Charts ──────────────────────────────── */}
            {activeTab === 'tracking' && (
              <motion.div key="tracking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="content-section">
                <AnalyticsCharts />
              </motion.div>
            )}

            {/* ── Legacy: Users ─────────────────────────────────── */}
            {activeTab === 'users' && (
              <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="content-section">
                <div className="table-card">
                  {users.length === 0 ? (
                    <div className="empty-state-modern"><FiUsers className="empty-icon" /><p>No users found</p></div>
                  ) : (
                    <table className="modern-table">
                      <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Membership</th><th>Status</th><th>Joined</th></tr></thead>
                      <tbody>
                        {users.map(u => (
                          <tr key={u._id}>
                            <td><strong>{u.name}</strong></td>
                            <td>{u.email}</td>
                            <td><span className="badge-modern">{u.role}</span></td>
                            <td><span className={`badge-modern ${(u.membership || 'none').toLowerCase()}`}>{u.membership || 'None'}</span></td>
                            <td><span className={`badge-modern ${(u.status || 'active').toLowerCase()}`}>{u.status || 'Active'}</span></td>
                            <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── Legacy: Memberships ───────────────────────────── */}
            {activeTab === 'memberships' && (
              <motion.div key="memberships" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="content-section">
                {memberships.length === 0 ? (
                  <div className="empty-state-modern"><FiCreditCard className="empty-icon" /><p>No membership requests</p></div>
                ) : (
                  <div className="table-card">
                    <table className="modern-table">
                      <thead><tr><th>Name</th><th>Email</th><th>Plan</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
                      <tbody>
                        {memberships.map(m => (
                          <tr key={m._id}>
                            <td><strong>{m.name}</strong></td>
                            <td>{m.email}</td>
                            <td><span className={`badge-modern ${m.plan}`}>{m.plan}</span></td>
                            <td>₹{m.price}</td>
                            <td><span className={`badge-modern ${m.status}`}>{m.status}</span></td>
                            <td>
                              {m.status === 'pending' ? (
                                <div className="action-btns-modern">
                                  <button onClick={() => approveMembership(m._id)} className="btn-modern approve"><FiCheckCircle /> Approve</button>
                                  <button onClick={() => rejectMembership(m._id)} className="btn-modern reject">Reject</button>
                                </div>
                              ) : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Legacy: Orders ────────────────────────────────── */}
            {activeTab === 'orders' && (
              <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="content-section">
                {orders.length === 0 ? (
                  <div className="empty-state-modern"><FiShoppingBag className="empty-icon" /><p>No orders yet</p></div>
                ) : (
                  <div className="table-card">
                    <table className="modern-table">
                      <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
                      <tbody>
                        {orders.map(o => (
                          <tr key={o._id}>
                            <td><strong>#{o._id?.slice(-6)}</strong></td>
                            <td>{o.userName}</td>
                            <td>{o.items?.length || 0} items</td>
                            <td>₹{o.totalAmount}</td>
                            <td><span className={`badge-modern ${(o.paymentStatus || 'pending').toLowerCase()}`}>{o.paymentStatus || 'Pending'}</span></td>
                            <td>{new Date(o.orderDate || o.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Legacy: Products ──────────────────────────────── */}
            {activeTab === 'products' && (
              <motion.div key="products" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="content-section">
                {products.length === 0 ? (
                  <div className="empty-state-modern"><FiPackage className="empty-icon" /><p>No products. Click "Seed Data" to add.</p></div>
                ) : (
                  <div className="table-card">
                    <table className="modern-table">
                      <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Rating</th></tr></thead>
                      <tbody>
                        {products.map(p => (
                          <tr key={p._id}>
                            <td><strong>{p.name}</strong></td>
                            <td><span className="badge-modern">{p.category}</span></td>
                            <td>₹{p.price}</td>
                            <td>{p.stock}</td>
                            <td>{p.rating || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Legacy: Classes ───────────────────────────────── */}
            {activeTab === 'classes' && (
              <motion.div key="classes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="content-section">
                {classes.length === 0 ? (
                  <div className="empty-state-modern"><FiActivity className="empty-icon" /><p>No classes. Click "Seed Data" to add.</p></div>
                ) : (
                  <div className="table-card">
                    <table className="modern-table">
                      <thead><tr><th>Name</th><th>Instructor</th><th>Schedule</th><th>Duration</th><th>Enrolled/Capacity</th><th>Level</th></tr></thead>
                      <tbody>
                        {classes.map(c => (
                          <tr key={c._id}>
                            <td><strong>{c.name}</strong></td>
                            <td>{c.instructor}</td>
                            <td>{c.schedule?.day} {c.schedule?.time}</td>
                            <td>{c.duration} min</td>
                            <td>{c.enrolled || 0}/{c.capacity}</td>
                            <td><span className="badge-modern">{c.level}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Legacy: Trainers ──────────────────────────────── */}
            {activeTab === 'trainers' && (
              <motion.div key="trainers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="content-section">
                <AdminTrainersTab />
              </motion.div>
            )}

            {/* ── Legacy: Community ─────────────────────────────── */}
            {activeTab === 'community' && (
              <motion.div key="community" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="content-section">
                <AdminCommunityTab />
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
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/trainers', { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } });
        const data = await res.json();
        setTrainers(data.data || []);
      } catch {}
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ color: 'var(--text-1)', fontSize: 20, fontWeight: 800, margin: '0 0 4px' }}>Trainers</h2>
        <p style={{ color: 'var(--text-3)', fontSize: 13, margin: 0 }}>{loading ? 'Loading...' : `${trainers.length} registered trainers`}</p>
      </div>
      {loading ? <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{[1,2,3].map(i => <div key={i} style={{ height: 64, background: 'var(--surface-2)', borderRadius: 12, animation: 'pulse 1.5s infinite' }} />)}</div>
        : trainers.length === 0 ? <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-3)' }}><FiUserPlus size={40} style={{ marginBottom: 12, opacity: 0.3 }} /><p>No trainers yet.</p></div>
        : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{trainers.map(t => (
          <div key={t._id} style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>{t.name?.[0]?.toUpperCase()}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: 'var(--text-1)', fontWeight: 600, margin: 0, fontSize: 14 }}>{t.name}</p>
              <p style={{ color: 'var(--text-3)', fontSize: 12, margin: '2px 0 0' }}>{t.specialization || 'General'} · {t.email}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: 'var(--text-1)', fontWeight: 700, margin: 0, fontSize: 14 }}>{t.totalRatings ? `${t.rating?.toFixed(1)}★` : '—'}</p>
              <p style={{ color: 'var(--text-3)', fontSize: 11, margin: 0 }}>{t.totalRatings || 0} reviews</p>
            </div>
          </div>
        ))}</div>}
    </div>
  );
}

/* ── Admin: Community Moderation Tab ─────────────────────── */
function AdminCommunityTab() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/social/feed?limit=30', { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } });
        const data = await res.json();
        setPosts(data.data || []);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const deletePost = async (id) => {
    try {
      await fetch(`/api/social/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } });
      setPosts(p => p.filter(x => x._id !== id));
    } catch {}
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ color: 'var(--text-1)', fontSize: 20, fontWeight: 800, margin: '0 0 4px' }}>Community Moderation</h2>
        <p style={{ color: 'var(--text-3)', fontSize: 13, margin: 0 }}>{loading ? 'Loading...' : `${posts.length} recent posts`}</p>
      </div>
      {loading ? <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{[1,2,3].map(i => <div key={i} style={{ height: 80, background: 'var(--surface-2)', borderRadius: 12, animation: 'pulse 1.5s infinite' }} />)}</div>
        : posts.length === 0 ? <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-3)' }}><FiMessageCircle size={40} style={{ marginBottom: 12, opacity: 0.3 }} /><p>No posts yet.</p></div>
        : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{posts.map(p => (
          <div key={p._id} style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                <span style={{ color: 'var(--text-1)', fontWeight: 600, fontSize: 13 }}>{p.userName}</span>
                <span style={{ color: 'var(--text-3)', fontSize: 11, background: 'var(--surface-3)', borderRadius: 8, padding: '2px 8px' }}>{p.type}</span>
              </div>
              <p style={{ color: 'var(--text-2)', fontSize: 13, margin: 0, lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.content}</p>
              <p style={{ color: 'var(--text-3)', fontSize: 11, margin: '4px 0 0' }}>{new Date(p.createdAt).toLocaleDateString()} · {p.likes?.length || 0} likes</p>
            </div>
            <button onClick={() => deletePost(p._id)} style={{ background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '6px 12px', color: 'var(--red)', cursor: 'pointer', fontSize: 12, flexShrink: 0 }}>Remove</button>
          </div>
        ))}</div>}
    </div>
  );
}
