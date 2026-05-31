import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const TYPE_STYLES = {
  info: { bg: '#0a1628', border: '#1e3a5f', icon: 'ℹ️', label: 'Info' },
  warning: { bg: '#1a1000', border: '#7a5900', icon: '⚠️', label: 'Notice' },
  success: { bg: '#001a0a', border: '#006633', icon: '✅', label: 'Great News' },
  promo: { bg: '#1a0a2e', border: '#6600cc', icon: '🎁', label: 'Special Offer' },
  event: { bg: '#1a0a00', border: '#cc4400', icon: '🎉', label: 'Event' },
  maintenance: { bg: '#0a0a0a', border: '#444', icon: '🔧', label: 'Maintenance' },
};

export default function AnnouncementBanner({ gymId }) {
  const { apiClient, user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [current, setCurrent] = useState(0);
  const [dismissed, setDismissed] = useState(new Set());

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
    const interval = setInterval(fetch, 5 * 60 * 1000); // refresh every 5 min
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
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -60, opacity: 0 }}
        style={{
          background: style.bg, border: `1px solid ${style.border}`,
          borderRadius: 12, padding: '12px 16px', marginBottom: 16,
          display: 'flex', alignItems: 'flex-start', gap: 12, position: 'relative',
        }}
      >
        <span style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>{style.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            {ann.pinned && <span style={{ fontSize: 10, background: '#ffd70022', color: '#ffd700', border: '1px solid #ffd70044', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>PINNED</span>}
            <span style={{ fontSize: 12, color: style.border, fontWeight: 700 }}>{style.label}</span>
          </div>
          <p style={{ color: '#fff', fontWeight: 600, margin: '0 0 4px', fontSize: 14 }}>{ann.title}</p>
          <p style={{ color: '#888', margin: 0, fontSize: 13, lineHeight: 1.5 }}>{ann.content}</p>
          {ann.ctaText && ann.ctaLink && (
            <a href={ann.ctaLink} style={{ display: 'inline-block', marginTop: 8, color: '#9d00ff', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
              {ann.ctaText} →
            </a>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {visible.length > 1 && (
            <div style={{ display: 'flex', gap: 4 }}>
              <NavBtn onClick={() => setCurrent(c => (c - 1 + visible.length) % visible.length)}>‹</NavBtn>
              <NavBtn onClick={() => setCurrent(c => (c + 1) % visible.length)}>›</NavBtn>
            </div>
          )}
          <button onClick={() => dismiss(ann._id)} style={{
            background: 'none', border: '1px solid #333', color: '#555', cursor: 'pointer',
            width: 24, height: 24, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
          }}>×</button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

const NavBtn = ({ onClick, children }) => (
  <button onClick={onClick} style={{
    background: '#1a1a1a', border: '1px solid #333', color: '#888', cursor: 'pointer',
    width: 24, height: 24, borderRadius: 4, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>{children}</button>
);
