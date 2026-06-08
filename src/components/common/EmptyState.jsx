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
        <Link to={actionPath} className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
          {action}
        </Link>
      ) : (
        <button onClick={onAction} className="btn btn-primary btn-lg">
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
      <div style={{ fontSize: compact ? 40 : 56, marginBottom: 12, opacity: 0.35 }}>{icon}</div>
      <h3 style={{ color: 'var(--text-1)', fontSize: compact ? 17 : 20, fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.01em' }}>{title}</h3>
      {description && (
        <p style={{ color: 'var(--text-3)', fontSize: compact ? 13 : 14, margin: '0 auto', maxWidth: 340, lineHeight: 1.65 }}>
          {description}
        </p>
      )}
      {btn}
    </motion.div>
  );
}
