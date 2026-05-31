import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function EmptyState({
  icon = '📭',
  title = 'Nothing here yet',
  description = '',
  action,
  actionPath,
  onAction,
  compact = false,
}) {
  const padding = compact ? '40px 20px' : '80px 20px';

  const btn = action && (
    <motion.div whileTap={{ scale: 0.97 }} style={{ display: 'inline-block', marginTop: 20 }}>
      {actionPath ? (
        <Link to={actionPath} style={{
          display: 'inline-block', padding: '12px 28px',
          background: 'linear-gradient(135deg, #9d00ff, #00d4ff)',
          borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 15, textDecoration: 'none',
        }}>
          {action}
        </Link>
      ) : (
        <button onClick={onAction} style={{
          padding: '12px 28px', background: 'linear-gradient(135deg, #9d00ff, #00d4ff)',
          border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer',
        }}>
          {action}
        </button>
      )}
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ textAlign: 'center', padding }}
    >
      <div style={{ fontSize: compact ? 48 : 64, marginBottom: 12 }}>{icon}</div>
      <h3 style={{ color: '#fff', fontSize: compact ? 18 : 22, fontWeight: 700, margin: '0 0 8px' }}>{title}</h3>
      {description && (
        <p style={{ color: '#555', fontSize: compact ? 13 : 15, margin: '0 auto', maxWidth: 340, lineHeight: 1.6 }}>
          {description}
        </p>
      )}
      {btn}
    </motion.div>
  );
}
