import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  LuCalendar, LuCheck, LuClock, LuX, LuDumbbell,
  LuTrendingUp, LuUsers, LuStar, LuArrowRight, LuActivity,
} from 'react-icons/lu';
import toast from 'react-hot-toast';

const ease = [0.16, 1, 0.3, 1];

const STATUS_STYLE = {
  confirmed: { color: 'var(--green)',  bg: 'var(--green-dim)',  border: 'rgba(34,197,94,0.2)' },
  pending:   { color: 'var(--amber)',  bg: 'var(--amber-dim)',  border: 'rgba(245,158,11,0.2)' },
  cancelled: { color: 'var(--red)',    bg: 'var(--red-dim)',    border: 'rgba(239,68,68,0.2)' },
  completed: { color: 'var(--accent)', bg: 'var(--accent-dim)', border: 'var(--accent-border)' },
};

function greet() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export default function TrainerDashboard() {
  const { user, apiClient } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('upcoming');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await apiClient.get('/trainer-bookings/trainer').catch(() => ({ data: { data: [] } }));
      const all = res.data.data || [];
      setBookings(all);

      const now       = new Date();
      const thisMonth = all.filter(b => {
        const d = new Date(b.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
      const completed = all.filter(b => b.status === 'completed');
      const pending   = all.filter(b => b.status === 'pending');
      const revenue   = completed.reduce((sum, b) => sum + (b.amount || 0), 0);

      setStats({
        totalSessions:    all.length,
        completedSessions: completed.length,
        pendingSessions:   pending.length,
        thisMonthSessions: thisMonth.length,
        totalRevenue:      revenue,
        thisMonthRevenue:  thisMonth.filter(b => b.status === 'completed').reduce((s, b) => s + (b.amount || 0), 0),
        avgRating:         4.7,
      });
    } catch {}
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    try {
      await apiClient.patch(`/trainer-bookings/${id}/status`, { status });
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b));
      toast.success(`Session ${status}.`);
    } catch {
      toast.error('Failed to update session status');
    }
  };

  const now              = new Date();
  const upcomingBookings = bookings.filter(b => ['confirmed','pending'].includes(b.status) && new Date(b.date) >= now).sort((a,b) => new Date(a.date) - new Date(b.date));
  const historyBookings  = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled' || new Date(b.date) < now).sort((a,b) => new Date(b.date) - new Date(a.date));
  const displayBookings  = tab === 'upcoming' ? upcomingBookings : historyBookings;

  const avgPerSession = stats?.completedSessions
    ? Math.round(stats.totalRevenue / stats.completedSessions)
    : 0;

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 80 }}>

      {/* ── Header ──────────────────────────────────────── */}
      <div style={{ borderBottom: '1px solid var(--border-1)', padding: 'clamp(40px,7vw,64px) 0 clamp(28px,4vw,36px)', background: 'var(--surface-1)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 clamp(16px,4vw,32px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{ color: 'var(--text-3)', fontSize: 13, margin: '0 0 4px' }}>{greet()}</p>
              <h1 style={{ color: 'var(--text-1)', fontSize: 'clamp(22px,4vw,30px)', fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.025em' }}>
                {user?.name?.split(' ')[0]}
              </h1>
              <p style={{ color: 'var(--accent)', margin: 0, fontSize: 13, fontWeight: 600 }}>Trainer Dashboard</p>
            </div>
            {/* This-month revenue */}
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)', borderRadius: 'var(--r-xl)', padding: '14px 20px', textAlign: 'right' }}>
              <p style={{ color: 'var(--amber)', fontSize: 22, fontWeight: 800, margin: '0 0 2px', letterSpacing: '-0.02em' }}>
                ₹{(stats?.thisMonthRevenue || 0).toLocaleString()}
              </p>
              <p style={{ color: 'var(--text-3)', fontSize: 11, margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                This month
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: 'var(--sp-6) clamp(16px,4vw,32px)' }}>

        {/* ── Stats grid ────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 'var(--sp-5)' }} className="trainer-stats-grid">
          {[
            { label: 'Total sessions', value: stats?.totalSessions || 0,    Icon: LuCalendar,  color: 'var(--accent)' },
            { label: 'Completed',      value: stats?.completedSessions || 0, Icon: LuCheck,     color: 'var(--green)' },
            { label: 'Pending',        value: stats?.pendingSessions || 0,   Icon: LuClock,     color: 'var(--amber)' },
            { label: 'Rating',         value: stats?.avgRating ? `${stats.avgRating}` : '—', Icon: LuStar, color: 'var(--amber)' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 'var(--r-xl)', padding: '16px 12px', textAlign: 'center' }}>
              <s.Icon size={16} color={s.color} strokeWidth={1.8} style={{ margin: '0 auto 8px', display: 'block' }} />
              <p style={{ color: 'var(--text-1)', fontWeight: 800, fontSize: 20, margin: '0 0 3px', letterSpacing: '-0.02em' }}>{s.value}</p>
              <p style={{ color: 'var(--text-3)', fontSize: 10, margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Revenue card ──────────────────────────────── */}
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 'var(--r-xl)', padding: 'var(--sp-5)', marginBottom: 'var(--sp-5)', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Total revenue',      value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`,   color: 'var(--amber)', sub: 'All time earnings' },
            { label: 'This month',         value: `₹${(stats?.thisMonthRevenue || 0).toLocaleString()}`, color: 'var(--green)', sub: `${stats?.thisMonthSessions || 0} sessions` },
            { label: 'Per session avg.',   value: avgPerSession ? `₹${avgPerSession.toLocaleString()}` : '—', color: 'var(--accent)', sub: 'Completed sessions' },
          ].map((r, i) => (
            <div key={r.label} style={{ flex: 1, minWidth: 100, position: 'relative', paddingLeft: i > 0 ? 20 : 0 }}>
              {i > 0 && <div style={{ width: 1, background: 'var(--border-1)', height: '100%', position: 'absolute', left: 0, top: 0 }} />}
              <p style={{ color: 'var(--text-3)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 4px' }}>{r.label}</p>
              <p style={{ color: r.color, fontSize: 24, fontWeight: 800, margin: '0 0 3px', letterSpacing: '-0.025em' }}>{r.value}</p>
              <p style={{ color: 'var(--text-4)', fontSize: 11, margin: 0 }}>{r.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Bookings ──────────────────────────────────── */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
            <h2 style={{ color: 'var(--text-1)', fontSize: 15, fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>Sessions</h2>
            <div style={{ display: 'flex', gap: 4, background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 'var(--r-pill)', padding: 3 }}>
              {['upcoming','history'].map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  padding: '5px 14px',
                  borderRadius: 'var(--r-pill)',
                  border: 'none',
                  background: tab === t ? 'var(--text-1)' : 'transparent',
                  color: tab === t ? 'var(--bg)' : 'var(--text-3)',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  transition: 'background 0.15s, color 0.15s',
                  fontFamily: 'var(--font-sans)',
                }}>
                  {t === 'upcoming' ? `Upcoming (${upcomingBookings.length})` : `History (${historyBookings.length})`}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ height: 80, borderRadius: 'var(--r-xl)' }} className="skeleton" />
              ))}
            </div>
          ) : displayBookings.length === 0 ? (
            <div className="empty-state">
              <LuCalendar size={36} className="empty-state-icon" />
              <p className="empty-state-title">
                {tab === 'upcoming' ? 'No upcoming sessions' : 'No session history'}
              </p>
              <p className="empty-state-desc">
                {tab === 'upcoming' ? 'Members can book you via the Trainer Booking page.' : 'Completed sessions will appear here.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {displayBookings.map((booking, i) => (
                <BookingCard key={booking._id} booking={booking} index={i} onUpdateStatus={updateStatus} />
              ))}
            </div>
          )}
        </div>

        {/* ── Quick links ───────────────────────────────── */}
        <div style={{ marginTop: 'var(--sp-6)' }}>
          <p style={{ color: 'var(--text-3)', fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', margin: '0 0 12px' }}>Quick access</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
            {[
              { label: 'Manage bookings', Icon: LuCalendar, path: '/book-trainer' },
              { label: 'Community',       Icon: LuUsers,    path: '/community' },
              { label: 'My profile',      Icon: LuActivity, path: '/profile' },
            ].map(l => (
              <Link key={l.label} to={l.path} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ y: -2 }}
                  className="pf-card pf-card--interactive"
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 'var(--sp-4)', textAlign: 'center' }}
                >
                  <l.Icon size={18} color="var(--accent)" strokeWidth={1.8} />
                  <p style={{ color: 'var(--text-2)', fontSize: 12, margin: 0, fontWeight: 500 }}>{l.label}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .trainer-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}

function BookingCard({ booking, index, onUpdateStatus }) {
  const st = STATUS_STYLE[booking.status] || STATUS_STYLE.pending;
  const memberName  = booking.memberId?.name || 'Member';
  const sessionType = (booking.sessionType || '').replace(/_/g, ' ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      className="pf-card"
      style={{ padding: 'var(--sp-4) var(--sp-5)' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
            <span style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}`, borderRadius: 'var(--r-pill)', padding: '2px 9px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {booking.status}
            </span>
            {booking.amount > 0 && (
              <span style={{ color: 'var(--amber)', fontSize: 13, fontWeight: 700 }}>₹{booking.amount}</span>
            )}
          </div>
          <p style={{ color: 'var(--text-1)', fontWeight: 700, margin: '0 0 3px', fontSize: 14, letterSpacing: '-0.01em' }}>
            {memberName}
          </p>
          <p style={{ color: 'var(--text-3)', fontSize: 12, margin: 0 }}>
            {booking.date} · {booking.startTime} – {booking.endTime}
            {sessionType && ` · ${sessionType}`}
          </p>
          {booking.notes && (
            <p style={{ color: 'var(--text-3)', fontSize: 12, margin: '5px 0 0', fontStyle: 'italic' }}>
              "{booking.notes}"
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {booking.status === 'pending' && (
            <>
              <button
                onClick={() => onUpdateStatus(booking._id, 'confirmed')}
                className="btn btn-sm"
                style={{ background: 'var(--green-dim)', color: 'var(--green)', border: '1px solid rgba(34,197,94,0.2)' }}
              >
                Confirm
              </button>
              <button
                onClick={() => onUpdateStatus(booking._id, 'cancelled')}
                className="btn btn-sm"
                style={{ background: 'var(--red-dim)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                Decline
              </button>
            </>
          )}
          {booking.status === 'confirmed' && (
            <button
              onClick={() => onUpdateStatus(booking._id, 'completed')}
              className="btn btn-secondary btn-sm"
              style={{ gap: 5 }}
            >
              <LuCheck size={12} strokeWidth={2.5} />
              Mark done
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
