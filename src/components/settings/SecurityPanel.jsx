import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const DEVICE_ICONS = {
  mobile: '📱',
  tablet: '📲',
  desktop: '💻',
  unknown: '🖥️',
};

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function SecurityPanel() {
  const { apiClient } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/sessions');
      setSessions(res.data.data || []);
    } catch {
      setSessions([]);
    }
    setLoading(false);
  };

  const revokeSession = async (sessionId) => {
    setRevoking(sessionId);
    try {
      await apiClient.delete(`/sessions/${sessionId}`);
      setSessions(prev => prev.filter(s => s._id !== sessionId));
      toast.success('Session revoked.');
    } catch {
      toast.error('Failed to revoke session.');
    }
    setRevoking(null);
  };

  const revokeAll = async () => {
    if (!window.confirm('This will sign out all other devices. Continue?')) return;
    setRevoking('all');
    try {
      await apiClient.delete('/sessions');
      // Keep only the first session (current one)
      setSessions(prev => prev.slice(0, 1));
      toast.success('All other sessions revoked.');
    } catch {
      toast.error('Failed to revoke sessions.');
    }
    setRevoking(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 700, margin: 0 }}>Active Sessions</h3>
          <p style={{ color: '#555', fontSize: 13, margin: '4px 0 0' }}>Manage your logged-in devices</p>
        </div>
        {sessions.length > 1 && (
          <button onClick={revokeAll} disabled={revoking === 'all'} style={{
            padding: '8px 16px', background: '#ff444422', border: '1px solid #ff444444',
            borderRadius: 10, color: '#ff4444', cursor: 'pointer', fontSize: 13, fontWeight: 700,
          }}>
            {revoking === 'all' ? 'Revoking...' : 'Revoke All Others'}
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2].map(i => (
            <div key={i} className="skeleton" style={{ borderRadius: 12, height: 70 }} />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)', borderRadius: 14, padding: 24, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-3)', fontSize: 14, margin: 0 }}>No active sessions found. Session tracking begins after next login.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <AnimatePresence>
            {sessions.map((session, i) => (
              <motion.div
                key={session._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  background: 'var(--surface-2)',
                  border: `1px solid ${i === 0 ? 'var(--accent-border)' : 'var(--border-1)'}`,
                  borderRadius: 14,
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: i === 0 ? 'var(--accent-dim)' : 'var(--surface-3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20,
                }}>
                  {DEVICE_ICONS[session.deviceType] || '🖥️'}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <p style={{ color: 'var(--text-1)', fontWeight: 700, margin: 0, fontSize: 14 }}>
                      {session.deviceName || 'Unknown Device'}
                    </p>
                    {i === 0 && (
                      <span style={{
                        background: 'var(--green-dim)', color: 'var(--green)',
                        border: '1px solid rgba(22,163,74,0.25)',
                        fontSize: 10, fontWeight: 700, padding: '2px 8px',
                        borderRadius: 10, textTransform: 'uppercase', letterSpacing: 0.5,
                      }}>
                        Current
                      </span>
                    )}
                  </div>
                  <p style={{ color: 'var(--text-3)', fontSize: 12, margin: 0 }}>
                    {session.ip && `${session.ip} • `}
                    Last active {timeAgo(session.lastActive)}
                    {session.createdAt && ` • Signed in ${timeAgo(session.createdAt)}`}
                  </p>
                </div>

                {i !== 0 && (
                  <button
                    onClick={() => revokeSession(session._id)}
                    disabled={revoking === session._id}
                    style={{
                      padding: '7px 14px', background: 'transparent',
                      border: '1px solid var(--border-2)', borderRadius: 10,
                      color: 'var(--text-3)', cursor: 'pointer', fontSize: 12,
                      whiteSpace: 'nowrap', flexShrink: 0,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.target.style.borderColor = 'var(--red)'; e.target.style.color = 'var(--red)'; }}
                    onMouseLeave={e => { e.target.style.borderColor = 'var(--border-2)'; e.target.style.color = 'var(--text-3)'; }}
                  >
                    {revoking === session._id ? '...' : 'Revoke'}
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Security tips */}
      <div style={{ background: 'var(--green-dim)', border: '1px solid rgba(22,163,74,0.22)', borderRadius: 14, padding: 16, marginTop: 20 }}>
        <p style={{ color: 'var(--green)', fontWeight: 700, margin: '0 0 8px', fontSize: 14 }}>🔒 Security Tips</p>
        <ul style={{ color: 'var(--text-3)', fontSize: 13, lineHeight: 2, margin: 0, paddingLeft: 16 }}>
          <li>Revoke sessions on devices you no longer use</li>
          <li>If you see an unfamiliar location, change your password immediately</li>
          <li>Enable notifications for account activity alerts</li>
        </ul>
      </div>
    </div>
  );
}
