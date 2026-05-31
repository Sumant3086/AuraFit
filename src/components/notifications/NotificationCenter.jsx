import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

const TYPE_ICONS = {
  achievement: '🏅', checkin: '📍', social: '💬', booking: '📅',
  membership: '💎', streak: '🔥', system: 'ℹ️', referral: '🎁', level_up: '⬆️',
};
const TYPE_COLORS = {
  achievement: '#ffd700', checkin: '#00c853', social: '#00d4ff', booking: '#9d00ff',
  membership: '#ffd700', streak: '#ff6b35', system: '#666', referral: '#00c853', level_up: '#9d00ff',
};
const TABS = ['All', 'Unread', 'Social', 'System'];

export default function NotificationCenter() {
  const { apiClient, isAuthenticated } = useAuth();
  const { notifications: socketNotifs } = useSocket();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [tab, setTab] = useState('All');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      if (open) fetchNotifications();
    }
  }, [isAuthenticated, open]);

  // Merge real-time socket notifications
  useEffect(() => {
    if (socketNotifs.length > 0) {
      const latest = socketNotifs[0];
      setNotifications(prev => {
        const exists = prev.find(n => n._id === latest._id);
        if (exists) return prev;
        return [{ ...latest, read: false }, ...prev];
      });
      setUnreadCount(c => c + 1);
    }
  }, [socketNotifs]);

  const fetchUnreadCount = async () => {
    try {
      const res = await apiClient.get('/notifications/unread-count');
      setUnreadCount(res.data.count || 0);
    } catch {}
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/notifications?limit=30');
      setNotifications(res.data.data || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch {}
    setLoading(false);
  };

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
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Notifications"
        style={{
          background: 'none', border: '1px solid #222', borderRadius: 20,
          padding: '5px 10px', cursor: 'pointer', position: 'relative',
          display: 'flex', alignItems: 'center', gap: 4, color: '#ccc',
          transition: 'border 0.2s',
        }}
      >
        <span style={{ fontSize: 16 }}>🔔</span>
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div key="badge" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              style={{
                position: 'absolute', top: -4, right: -4,
                width: 18, height: 18, borderRadius: '50%',
                background: 'linear-gradient(135deg, #9d00ff, #ff1493)',
                color: '#fff', fontSize: 10, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 998 }} onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              style={{
                position: 'absolute', top: 'calc(100% + 12px)', right: 0, zIndex: 999,
                width: 'min(380px, calc(100vw - 24px))', maxHeight: '75vh',
                background: '#111', borderRadius: 20, border: '1px solid #222',
                boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
                display: 'flex', flexDirection: 'column', overflow: 'hidden',
              }}
            >
              <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid #1a1a1a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <h3 style={{ color: '#fff', fontWeight: 700, margin: 0, fontSize: 16 }}>
                    Notifications {unreadCount > 0 && <span style={{ color: '#9d00ff' }}>({unreadCount})</span>}
                  </h3>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: '#9d00ff', cursor: 'pointer', fontSize: 12 }}>Mark all read</button>
                    )}
                    {notifications.length > 0 && (
                      <button onClick={clearAll} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: 12 }}>Clear</button>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {TABS.map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{
                      padding: '4px 12px', borderRadius: 14, border: 'none', cursor: 'pointer', fontSize: 12,
                      background: tab === t ? '#9d00ff' : '#1a1a1a', color: tab === t ? '#fff' : '#555',
                    }}>{t}</button>
                  ))}
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
                {loading ? (
                  <div style={{ padding: 20, textAlign: 'center', color: '#555', fontSize: 14 }}>Loading...</div>
                ) : filtered.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: 40, marginBottom: 10 }}>🔔</div>
                    <p style={{ color: '#555', fontSize: 14, margin: 0 }}>
                      {tab === 'Unread' ? 'All caught up!' : 'No notifications yet.'}
                    </p>
                  </div>
                ) : (
                  filtered.map((n, i) => (
                    <div
                      key={n._id || i}
                      onClick={() => { if (!n.read) markRead(n._id); }}
                      style={{
                        padding: '12px 18px', cursor: 'pointer',
                        background: n.read ? 'transparent' : '#0a0a1a',
                        borderLeft: `3px solid ${n.read ? 'transparent' : (TYPE_COLORS[n.type] || '#9d00ff')}`,
                        transition: 'background 0.15s',
                      }}
                    >
                      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                          background: `${TYPE_COLORS[n.type] || '#9d00ff'}22`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                        }}>
                          {TYPE_ICONS[n.type] || 'ℹ️'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <p style={{ color: n.read ? '#aaa' : '#fff', fontWeight: n.read ? 400 : 700, margin: 0, fontSize: 13, lineHeight: 1.3 }}>
                              {n.title}
                            </p>
                            {!n.read && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#9d00ff', flexShrink: 0, marginTop: 3 }} />}
                          </div>
                          <p style={{ color: '#555', fontSize: 12, margin: '3px 0', lineHeight: 1.4 }}>{n.message}</p>
                          <p style={{ color: '#333', fontSize: 11, margin: 0 }}>{timeAgo(n.createdAt)}</p>
                        </div>
                      </div>
                      {n.link && (
                        <div style={{ paddingLeft: 46, marginTop: 4 }}>
                          <Link to={n.link} onClick={() => setOpen(false)} style={{ color: TYPE_COLORS[n.type] || '#9d00ff', fontSize: 12, fontWeight: 600 }}>View →</Link>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
