import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ease, dur } from '../../lib/motion';

/** Animated KPI / stat card — used across Dashboard, Admin, Trainer pages */
export default function StatCard({
  label,
  value,
  icon: Icon,
  iconColor = 'var(--text-2)',
  change,        // e.g. "+12%" — shown in green
  loading = false,
  accent = false, // highlighted card
  style,
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-30px' });

  if (loading) {
    return (
      <div style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border-1)',
        borderRadius: 'var(--r-xl)',
        padding: 'var(--sp-5)',
        ...style,
      }}>
        <div style={{ width: 28, height: 28, background: 'var(--surface-3)', borderRadius: 'var(--r-md)', marginBottom: 'var(--sp-4)' }} className="skeleton-pulse" />
        <div style={{ width: '40%', height: 28, background: 'var(--surface-3)', borderRadius: 4, marginBottom: 6 }} className="skeleton-pulse" />
        <div style={{ width: '60%', height: 10, background: 'var(--surface-3)', borderRadius: 4 }} className="skeleton-pulse" />
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: dur.base, ease: ease.out }}
      style={{
        background: accent ? 'var(--accent-dim)' : 'var(--surface-2)',
        border: `1px solid ${accent ? 'var(--accent-border)' : 'var(--border-1)'}`,
        borderRadius: 'var(--r-xl)',
        padding: 'var(--sp-5)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sp-2)',
        ...style,
      }}
    >
      {Icon && (
        <div style={{
          width: 32, height: 32, borderRadius: 'var(--r-md)',
          background: 'var(--surface-3)', border: '1px solid var(--border-1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 'var(--sp-2)',
        }}>
          <Icon size={15} color={iconColor} strokeWidth={1.5} />
        </div>
      )}

      <p style={{
        color: 'var(--text-1)',
        fontSize: 'clamp(20px,2.5vw,28px)',
        fontWeight: 800,
        letterSpacing: '-0.03em',
        lineHeight: 1,
        margin: 0,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {value ?? '—'}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ color: 'var(--text-3)', fontSize: 'var(--text-xs)', margin: 0, fontWeight: 500 }}>
          {label}
        </p>
        {change && (
          <span style={{
            color: change.startsWith('+') ? 'var(--green)' : 'var(--red)',
            fontSize: 'var(--text-xs)', fontWeight: 600,
          }}>
            {change}
          </span>
        )}
      </div>
    </motion.div>
  );
}
