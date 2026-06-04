import React from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { ease, dur } from '../../lib/motion';

/**
 * PageLayout — universal interior page wrapper.
 *
 * Provides:
 *  - Consistent background, max-width, padding
 *  - Optional page header (title, subtitle, actions row)
 *  - Entrance animation on every route change
 *  - Semantic <main> element for accessibility
 *
 * Usage:
 *   <PageLayout title="Settings" subtitle="Manage your account">
 *     {children}
 *   </PageLayout>
 */
export default function PageLayout({
  children,
  title,
  subtitle,
  actions,         // Right-side header buttons
  maxWidth = 'var(--max-content)',
  noPadding = false,
  headerBorder = true,
  style = {},
}) {
  const { pathname } = useLocation();

  return (
    <motion.main
      key={pathname}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: dur.base, ease: ease.out }}
      style={{
        background: 'var(--bg)',
        minHeight: '100vh',
        paddingBottom: 80,
        ...style,
      }}
    >
      {/* Page header */}
      {title && (
        <div style={{
          borderBottom: headerBorder ? '1px solid var(--border-1)' : 'none',
          padding: 'var(--sp-8) clamp(16px,4vw,32px) var(--sp-6)',
        }}>
          <div style={{ maxWidth, margin: '0 auto' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              gap: 'var(--sp-4)',
              flexWrap: 'wrap',
            }}>
              <div>
                <h1 style={{
                  fontSize: 'clamp(22px,3.5vw,30px)',
                  fontWeight: 700,
                  letterSpacing: '-0.025em',
                  color: 'var(--text-1)',
                  margin: 0,
                  lineHeight: 1.15,
                }}>
                  {title}
                </h1>
                {subtitle && (
                  <p style={{
                    color: 'var(--text-3)',
                    fontSize: 'var(--text-sm)',
                    margin: '4px 0 0',
                  }}>
                    {subtitle}
                  </p>
                )}
              </div>
              {actions && (
                <div style={{ display: 'flex', gap: 'var(--sp-2)', flexShrink: 0 }}>
                  {actions}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{
        maxWidth,
        margin: '0 auto',
        padding: noPadding ? 0 : 'var(--sp-6) clamp(16px,4vw,32px)',
      }}>
        {children}
      </div>
    </motion.main>
  );
}

/** Consistent section label (uppercase, muted, small) */
export function SectionLabel({ children, style }) {
  return (
    <p style={{
      color: 'var(--text-3)',
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      margin: '0 0 var(--sp-3)',
      ...style,
    }}>
      {children}
    </p>
  );
}

/** Standard card container */
export function Card({ children, style, padding = 'var(--sp-5)' }) {
  return (
    <div style={{
      background: 'var(--surface-2)',
      border: '1px solid var(--border-1)',
      borderRadius: 'var(--r-xl)',
      padding,
      ...style,
    }}>
      {children}
    </div>
  );
}

/** Primary action button */
export function PrimaryButton({ children, onClick, disabled, style, size = 'md' }) {
  const pad = size === 'sm' ? '7px 14px' : '11px 20px';
  return (
    <motion.button
      whileHover={disabled ? {} : { opacity: 0.88 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: disabled ? 'var(--surface-3)' : 'var(--text-1)',
        color: disabled ? 'var(--text-3)' : 'var(--bg)',
        border: 'none', borderRadius: 'var(--r-md)',
        padding: pad,
        fontSize: size === 'sm' ? 'var(--text-xs)' : 'var(--text-sm)',
        fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
        letterSpacing: '-0.01em',
        ...style,
      }}
    >
      {children}
    </motion.button>
  );
}

/** Ghost/secondary button */
export function GhostButton({ children, onClick, style, size = 'md' }) {
  const pad = size === 'sm' ? '6px 12px' : '10px 18px';
  return (
    <motion.button
      whileHover={{ background: 'var(--surface-3)' }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: 'transparent',
        color: 'var(--text-2)',
        border: '1px solid var(--border-2)', borderRadius: 'var(--r-md)',
        padding: pad,
        fontSize: size === 'sm' ? 'var(--text-xs)' : 'var(--text-sm)',
        fontWeight: 500, cursor: 'pointer',
        ...style,
      }}
    >
      {children}
    </motion.button>
  );
}
