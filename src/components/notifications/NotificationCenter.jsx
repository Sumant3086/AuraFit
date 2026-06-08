import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

const TYPE_ICONS = {
  achievement: '🏅', checkin: '📍', social: '💬', booking: '📅',
  membership: '💎', streak: '🔥', system: 'ℹ️', referral: '🎁', level_up: '⬆️',
};

/* All colors reference CSS token values — readable in both dark and light */
const TYPE_META = {
  achievement: { color: 'var(--amber)',    dim: 'var(--amber-dim)'   },
  checkin:     { color: 'var(--green)',    dim: 'var(--green-dim)'   },
  social:      { color: 'var(--cyan-color)', dim: 'var(--cyan-dim)' },
  booking:     { color: 'var(--accent)',   dim: 'var(--accent-dim)'  },
  membership:  { color: 'var(--amber)',    dim: 'var(--amber-dim)'   },
  streak:      { color: 'var(--orange)',   dim: 'var(--orange-dim)'  },
  system:      { color: 'var(--text-3)',   dim: 'var(--surface-3)'   },
  referral:    { color: 'var(--green)',    dim: 'var(--green-dim)'   },
  level_up:    { color: 'var(--accent)',   dim: 'var(--accent-dim)'  },
};

const DEFAULT_META = { color: 'var(--accent)', dim: 'var(--accent-dim)' };

const TABS = ['All', 'Unread', 'Social', 'System'];

export default function NotificationCenter() {
  const { apiClient, isAuthenticated } = useAuth();
  const { notifications: socketNotifs } = useSocket();
  const [open, setOpen]                 = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]   = useState(0);
  const [tab, setTab]                   = useState('All');
  const [loading, setLoading]           = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await apiClient.get('/notifications/unread-count');
      setUnreadCount(res.data.count || 0);
    } catch {}
  }, [apiClient]);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/notifications?limit=30');
      setNotifications(res.data.data || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch {}
    setLoading(false);
  }, [apiClient]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchUnreadCount();
    if (open) fetchNotifications();
  }, [isAuthenticated, open, fetchUnreadCount, fetchNotifications]);

  useEffect(() => {
    if (!socketNotifs.length) return;
    const latest = socketNotifs[0];
    setNotifications(prev => {
      if (prev.find(n => n._id === latest._id)) return prev;
      return [{ ...latest, read: false }, ...prev];
    });
    setUnreadCount(c => c + 1);
  }, [socketNotifs]);

  const markRead = async (id) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await apiClient.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  };

  const clearAll = async () => {
    try {
      await apiClient.delete('/notifications');
      setNotifications([]);
      setUnreadCount(0);
    } catch {}
  };

  const filtered = notifications.filter(n => {
    if (tab === 'Unread') return !n.read;
    if (tab === 'Social') return n.type === 'social';
    if (tab === 'System') return ['system', 'membership', 'booking'].includes(n.type);
    return true;
  });

  const timeAgo = (date) => {
    const diff = (Date.now() - new Date(date)) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (!isAuthenticated) return null;

  return (
    <div style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Notifications"
        className="af-nav__icon-btn"
        style={{ position: 'relative' }}
      >
        <span style={{ fontSize: 15 }}>🔔</span>
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              key="badge"
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              style={{
                position: 'absolute', top: -4, right: -4,
                width: 16, height: 16, borderRadius: '50%',
                background: 'var(--accent)',
                color: '#fff', fontSize: 9, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1.5px solid var(--bg)',
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 998 }} onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ type: 'spring', damping: 28, stiffness: 380 }}
              style={{
                position: 'absolute', top: 'calc(100% + 10px)', right: 0, zIndex: 999,
                width: 'min(360px, calc(100vw - 24px))', maxHeight: '72vh',
                background: 'var(--surface-2)',
                border: '1px solid var(--border-2)',
                borderRadius: 'var(--r-xl)',
                boxShadow: 'var(--shadow-xl)',
                display: 'flex', flexDirection: 'column', overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--border-1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <h3 style={{ color: 'var(--text-1)', fontWeight: 700, margin: 0, fontSize: 14, letterSpacing: '-0.01em' }}>
                    Notifications
                    {unreadCount > 0 && (
                      <span style={{ color: 'var(--accent)', marginLeft: 6, fontWeight: 700 }}>({unreadCount})</span>
                    )}
                  </h3>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                        Mark all read
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button onClick={clearAll} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 12 }}>
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 4 }}>
                  {TABS.map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{
                      padding: '4px 10px', borderRadius: 'var(--r-pill)', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: tab === t ? 600 : 400,
                      background: tab === t ? 'var(--accent)' : 'var(--surface-3)',
                      color: tab === t ? '#fff' : 'var(--text-3)',
                      transition: 'background 0.12s, color 0.12s',
                    }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* List */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0', scrollbarWidth: 'thin' }}>
                {loading ? (
                  <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>Loading…</div>
                ) : filtered.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: 36, marginBottom: 8, opacity: 0.3 }}>🔔</div>
                    <p style={{ color: 'var(--text-3)', fontSize: 13, margin: 0 }}>
                      {tab === 'Unread' ? 'All caught up!' : 'No notifications yet.'}
                    </p>
                  </div>
                ) : (
                  filtered.map((n, i) => {
                    const meta = TYPE_META[n.type] || DEFAULT_META;
                    return (
                      <div
                        key={n._id || i}
                        onClick={() => { if (!n.read) markRead(n._id); }}
                        style={{
                          padding: '11px 16px', cursor: 'pointer',
                          background: n.read ? 'transparent' : 'var(--accent-dim)',
                          borderLeft: `2px solid ${n.read ? 'transparent' : meta.color}`,
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-3)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = n.read ? 'transparent' : 'var(--accent-dim)'; }}
                      >
                        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                            background: meta.dim,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                          }}>
                            {TYPE_ICONS[n.type] || 'ℹ️'}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                              <p style={{ color: n.read ? 'var(--text-2)' : 'var(--text-1)', fontWeight: n.read ? 400 : 600, margin: 0, fontSize: 13, lineHeight: 1.35 }}>
                                {n.title}
                              </p>
                              {!n.read && (
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color, flexShrink: 0, marginTop: 4 }} />
                              )}
                            </div>
                            <p style={{ color: 'var(--text-3)', fontSize: 12, margin: '3px 0', lineHeight: 1.4 }}>{n.message}</p>
                            <p style={{ color: 'var(--text-4)', fontSize: 11, margin: 0 }}>{timeAgo(n.createdAt)}</p>
                          </div>
                        </div>
                        {n.link && (
                          <div style={{ paddingLeft: 42, marginTop: 4 }}>
                            <Link
                              to={n.link}
                              onClick={() => setOpen(false)}
                              style={{ color: meta.color, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}
                            >
                              View →
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
