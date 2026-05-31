import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  confirmed: '#00c853',
  pending: '#ffd700',
  cancelled: '#ff4444',
  completed: '#00d4ff',
};

export default function TrainerDashboard() {
  const { user, apiClient } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bookRes] = await Promise.all([
        apiClient.get('/trainer-bookings/trainer').catch(() => ({ data: { data: [] } })),
      ]);
      const allBookings = bookRes.data.data || [];
      setBookings(allBookings);

      // Calculate stats from bookings
      const now = new Date();
      const thisMonth = allBookings.filter(b => {
        const d = new Date(b.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
      const completed = allBookings.filter(b => b.status === 'completed');
      const pending = allBookings.filter(b => b.status === 'pending');
      const revenue = completed.reduce((sum, b) => sum + (b.amount || 0), 0);
      const thisMonthRevenue = thisMonth.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.amount || 0), 0);

      setStats({
        totalSessions: allBookings.length,
        completedSessions: completed.length,
        pendingSessions: pending.length,
        thisMonthSessions: thisMonth.length,
        totalRevenue: revenue,
        thisMonthRevenue,
        avgRating: 4.7, // placeholder until ratings are implemented
      });
    } catch {}
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    try {
      await apiClient.patch(`/trainer-bookings/${id}/status`, { status });
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b));
      toast.success(`Session ${status}!`);
    } catch {
      toast.error('Failed to update session status');
    }
  };

  const now = new Date();
  const upcomingBookings = bookings.filter(b =>
    ['confirmed', 'pending'].includes(b.status) && new Date(b.date) >= now
  ).sort((a, b) => new Date(a.date) - new Date(b.date));

  const historyBookings = bookings.filter(b =>
    b.status === 'completed' || b.status === 'cancelled' || new Date(b.date) < now
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  const displayBookings = tab === 'upcoming' ? upcomingBookings : historyBookings;

  const greet = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a0a2e, #0a1a2e)', padding: '32px 20px 60px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{ color: '#555', fontSize: 14, margin: '0 0 4px' }}>{greet()},</p>
              <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 800, margin: '0 0 4px' }}>
                {user?.name?.split(' ')[0]} 🏋️
              </h1>
              <p style={{ color: '#9d00ff', margin: 0, fontSize: 14 }}>Trainer Dashboard • AuraFit Pro</p>
            </div>
            <div style={{ background: '#0a0a0a22', border: '1px solid #ffffff22', borderRadius: 14, padding: '12px 20px', textAlign: 'right' }}>
              <p style={{ color: '#ffd700', fontSize: 22, fontWeight: 800, margin: '0 0 2px' }}>
                ₹{(stats?.thisMonthRevenue || 0).toLocaleString()}
              </p>
              <p style={{ color: '#555', fontSize: 12, margin: 0 }}>This month revenue</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: '-32px auto 0', padding: '0 16px' }}>
        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 28 }}>
          {[
            { label: 'Total Sessions', value: stats?.totalSessions || 0, icon: '📅', color: '#00d4ff' },
            { label: 'Completed', value: stats?.completedSessions || 0, icon: '✅', color: '#00c853' },
            { label: 'Pending', value: stats?.pendingSessions || 0, icon: '⏳', color: '#ffd700' },
            { label: 'Rating', value: `${stats?.avgRating || '—'}★`, icon: '⭐', color: '#ff6b35' },
          ].map(s => (
            <div key={s.label} style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 12, padding: '14px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ color: s.color, fontSize: 20, fontWeight: 800 }}>{s.value}</div>
              <div style={{ color: '#555', fontSize: 11 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Revenue card */}
        <div style={{
          background: 'linear-gradient(135deg, #1a0a2e, #0a0a1a)',
          border: '1px solid #9d00ff33', borderRadius: 16, padding: 20, marginBottom: 24,
          display: 'flex', gap: 20, flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1 }}>
            <p style={{ color: '#888', fontSize: 13, margin: '0 0 4px' }}>Total Revenue</p>
            <p style={{ color: '#ffd700', fontSize: 28, fontWeight: 800, margin: 0 }}>
              ₹{(stats?.totalRevenue || 0).toLocaleString()}
            </p>
            <p style={{ color: '#555', fontSize: 12, margin: '4px 0 0' }}>All time earnings</p>
          </div>
          <div style={{ width: 1, background: '#1a1a1a', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ color: '#888', fontSize: 13, margin: '0 0 4px' }}>This Month</p>
            <p style={{ color: '#00c853', fontSize: 28, fontWeight: 800, margin: 0 }}>
              ₹{(stats?.thisMonthRevenue || 0).toLocaleString()}
            </p>
            <p style={{ color: '#555', fontSize: 12, margin: '4px 0 0' }}>{stats?.thisMonthSessions || 0} sessions this month</p>
          </div>
          <div style={{ width: 1, background: '#1a1a1a', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ color: '#888', fontSize: 13, margin: '0 0 4px' }}>Avg per Session</p>
            <p style={{ color: '#00d4ff', fontSize: 28, fontWeight: 800, margin: 0 }}>
              ₹{stats?.completedSessions ? Math.round(stats.totalRevenue / stats.completedSessions).toLocaleString() : '0'}
            </p>
            <p style={{ color: '#555', fontSize: 12, margin: '4px 0 0' }}>Per completed session</p>
          </div>
        </div>

        {/* Bookings */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: 0 }}>Sessions</h2>
            <div style={{ display: 'flex', gap: 6 }}>
              {['upcoming', 'history'].map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                  background: tab === t ? 'linear-gradient(135deg, #9d00ff, #00d4ff)' : '#111',
                  color: tab === t ? '#fff' : '#555', fontSize: 13,
                }}>
                  {t === 'upcoming' ? `Upcoming (${upcomingBookings.length})` : `History (${historyBookings.length})`}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ background: '#111', borderRadius: 14, height: 90, animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : displayBookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>{tab === 'upcoming' ? '📅' : '📋'}</div>
              <p style={{ color: '#666', fontSize: 15 }}>
                {tab === 'upcoming' ? 'No upcoming sessions. Members can book you via the Trainer Booking page.' : 'No session history yet.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {displayBookings.map(booking => (
                <BookingCard key={booking._id} booking={booking} onUpdateStatus={updateStatus} />
              ))}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div style={{ marginTop: 28 }}>
          <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 700, margin: '0 0 14px' }}>Quick Access</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {[
              { label: 'Book Management', icon: '📅', path: '/book-trainer' },
              { label: 'Community', icon: '🤝', path: '/community' },
              { label: 'My Profile', icon: '👤', path: '/profile' },
            ].map(l => (
              <Link key={l.label} to={l.path} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: '#111', border: '1px solid #1a1a1a', borderRadius: 14,
                  padding: '16px 12px', textAlign: 'center', cursor: 'pointer',
                }}>
                  <div style={{ fontSize: 26, marginBottom: 6 }}>{l.icon}</div>
                  <p style={{ color: '#ccc', fontSize: 13, margin: 0 }}>{l.label}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BookingCard({ booking, onUpdateStatus }) {
  const statusColor = STATUS_COLORS[booking.status] || '#555';
  const memberName = booking.memberId?.name || 'Member';
  const sessionType = (booking.sessionType || '').replace(/_/g, ' ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: '#111', border: '1px solid #1a1a1a', borderRadius: 14,
        padding: '16px 18px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{
              background: `${statusColor}22`, color: statusColor, fontSize: 11,
              padding: '3px 10px', borderRadius: 12, fontWeight: 700, textTransform: 'uppercase',
            }}>
              {booking.status}
            </span>
            {booking.amount > 0 && (
              <span style={{ color: '#ffd700', fontSize: 13, fontWeight: 700 }}>₹{booking.amount}</span>
            )}
          </div>
          <p style={{ color: '#fff', fontWeight: 700, margin: '0 0 2px', fontSize: 15 }}>
            {memberName}
          </p>
          <p style={{ color: '#555', fontSize: 13, margin: 0 }}>
            {booking.date} • {booking.startTime} – {booking.endTime}
            {sessionType && ` • ${sessionType}`}
          </p>
          {booking.notes && (
            <p style={{ color: '#444', fontSize: 12, margin: '6px 0 0', fontStyle: 'italic' }}>"{booking.notes}"</p>
          )}
        </div>

        {booking.status === 'pending' && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => onUpdateStatus(booking._id, 'confirmed')} style={{
              padding: '8px 14px', background: '#00c85322', border: '1px solid #00c85344',
              borderRadius: 10, color: '#00c853', cursor: 'pointer', fontSize: 13, fontWeight: 700,
            }}>
              Confirm
            </button>
            <button onClick={() => onUpdateStatus(booking._id, 'cancelled')} style={{
              padding: '8px 14px', background: '#ff444422', border: '1px solid #ff444444',
              borderRadius: 10, color: '#ff4444', cursor: 'pointer', fontSize: 13, fontWeight: 700,
            }}>
              Decline
            </button>
          </div>
        )}
        {booking.status === 'confirmed' && (
          <button onClick={() => onUpdateStatus(booking._id, 'completed')} style={{
            padding: '8px 14px', background: '#00d4ff22', border: '1px solid #00d4ff44',
            borderRadius: 10, color: '#00d4ff', cursor: 'pointer', fontSize: 13, fontWeight: 700,
          }}>
            Mark Done
          </button>
        )}
      </div>
    </motion.div>
  );
}
