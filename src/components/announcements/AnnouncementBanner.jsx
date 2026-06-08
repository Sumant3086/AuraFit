import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

/* Token-compatible announcement type styles */
const TYPE_STYLES = {
  info:        { dimColor: 'var(--accent-dim)',  borderColor: 'var(--accent-border)',         textColor: 'var(--accent)',  icon: 'ℹ️', label: 'Info' },
  warning:     { dimColor: 'var(--amber-dim)',   borderColor: 'rgba(180,83,9,0.25)',           textColor: 'var(--amber)',   icon: '⚠️', label: 'Notice' },
  success:     { dimColor: 'var(--green-dim)',   borderColor: 'rgba(22,163,74,0.25)',          textColor: 'var(--green)',   icon: '✅', label: 'Great News' },
  promo:       { dimColor: 'var(--accent-dim)',  borderColor: 'var(--accent-border)',          textColor: 'var(--accent)',  icon: '🎁', label: 'Special Offer' },
  event:       { dimColor: 'var(--amber-dim)',   borderColor: 'rgba(180,83,9,0.25)',           textColor: 'var(--amber)',   icon: '🎉', label: 'Event' },
  maintenance: { dimColor: 'var(--surface-3)',   borderColor: 'var(--border-2)',               textColor: 'var(--text-2)',  icon: '🔧', label: 'Maintenance' },
};

export default function AnnouncementBanner({ gymId }) {
  const { apiClient, user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [current, setCurrent]             = useState(0);
  const [dismissed, setDismissed]         = useState(new Set());

  useEffect(() => {
    const fetch = async () => {
      try {
        const params = new URLSearchParams();
        if (gymId) params.set('gymId', gymId);
        if (user?.role) params.set('role', user.role);
        const res = await apiClient.get(`/announcements?${params}`);
        setAnnouncements(res.data.data || []);
      } catch {}
    };
    fetch();
    const interval = setInterval(fetch, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [gymId, user?.role]);

  const visible = announcements.filter(a => !dismissed.has(a._id));
  if (visible.length === 0) return null;

  const ann = visible[current % visible.length];
  if (!ann) return null;

  const style = TYPE_STYLES[ann.type] || TYPE_STYLES.info;

  const dismiss = async (id) => {
    setDismissed(d => new Set([...d, id]));
    try { await apiClient.patch(`/announcements/${id}/read`); } catch {}
  };

  return (
    <AnimatePresence>
      <motion.div
        key={ann._id}
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -40, opacity: 0 }}
        style={{
          background: style.dimColor,
          border: `1px solid ${style.borderColor}`,
          borderRadius: 'var(--r-lg)',
          padding: '12px 16px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
        }}
      >
        <span style={{ fontSize: 18, flexShrink: 0, marginTop: 2 }}>{style.icon}</span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            {ann.pinned && (
              <span style={{
                fontSize: 9, background: 'var(--amber-dim)', color: 'var(--amber)',
                border: '1px solid rgba(245,158,11,0.25)', padding: '1px 6px',
                borderRadius: 4, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                Pinned
              </span>
            )}
            <span style={{ fontSize: 11, color: style.textColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              {style.label}
            </span>
          </div>
          <p style={{ color: 'var(--text-1)', fontWeight: 600, margin: '0 0 4px', fontSize: 14 }}>{ann.title}</p>
          <p style={{ color: 'var(--text-2)', margin: 0, fontSize: 13, lineHeight: 1.55 }}>{ann.content}</p>
          {ann.ctaText && ann.ctaLink && (
            <a href={ann.ctaLink} style={{ display: 'inline-block', marginTop: 8, color: style.textColor, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
              {ann.ctaText} →
            </a>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {visible.length > 1 && (
            <div style={{ display: 'flex', gap: 2 }}>
              <NavBtn onClick={() => setCurrent(c => (c - 1 + visible.length) % visible.length)}>‹</NavBtn>
              <NavBtn onClick={() => setCurrent(c => (c + 1) % visible.length)}>›</NavBtn>
            </div>
          )}
          <button
            onClick={() => dismiss(ann._id)}
            style={{
              background: 'none', border: '1px solid var(--border-2)', color: 'var(--text-3)',
              cursor: 'pointer', width: 24, height: 24, borderRadius: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
              transition: 'background 0.12s, color 0.12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-3)'; e.currentTarget.style.color = 'var(--text-1)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-3)'; }}
          >
            ×
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

const NavBtn = ({ onClick, children }) => (
  <button
    onClick={onClick}
    style={{
      background: 'var(--surface-2)', border: '1px solid var(--border-2)', color: 'var(--text-3)',
      cursor: 'pointer', width: 24, height: 24, borderRadius: 4, fontSize: 14,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'background 0.12s, color 0.12s',
    }}
    onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-3)'; e.currentTarget.style.color = 'var(--text-1)'; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-3)'; }}
  >
    {children}
  </button>
);
