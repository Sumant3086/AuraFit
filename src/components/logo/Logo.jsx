import React from 'react';
import logoImg from '../../assets/logos/aurafit-logo.png';

/**
 * AuraFit Logo — uses the official brand PNG asset.
 *
 * Props:
 *   size    — 'xs'|'sm'|'medium'|'large'|'xl'  (default: 'medium')
 *   variant — 'full'|'mark'                     (default: 'full')
 *   theme   — 'dark'|'light'|'gradient'         (default: 'gradient')
 *   style   — extra inline styles
 *
 * Note: The logo PNG has a white background. On dark surfaces it is displayed
 * inside a small rounded container with a white fill so it reads cleanly.
 */

const HEIGHT = { xs: 24, sm: 32, medium: 40, large: 52, xl: 68 };

export default function Logo({
  size = 'medium',
  variant = 'full',
  theme = 'gradient',
  style = {},
}) {
  const h = HEIGHT[size] || HEIGHT.medium;
  const isDark = theme !== 'light';

  if (variant === 'mark') {
    // Show just the icon portion at square crop (approx 70% of width is the icon)
    return (
      <div
        role="img"
        aria-label="AuraFit"
        style={{
          width: h, height: h,
          borderRadius: Math.round(h * 0.22),
          background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', flexShrink: 0,
          boxShadow: isDark ? '0 0 0 1px rgba(255,255,255,0.06)' : 'none',
          ...style,
        }}
      >
        <img
          src={logoImg}
          alt="AuraFit"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
          draggable={false}
        />
      </div>
    );
  }

  // Full logo — white pill container so the logo reads on any background
  return (
    <div
      role="img"
      aria-label="AuraFit"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        cursor: 'pointer',
        ...style,
      }}
    >
      <div style={{
        background: isDark ? 'rgba(255,255,255,0.92)' : 'transparent',
        borderRadius: Math.round(h * 0.18),
        padding: isDark ? `${Math.round(h * 0.08)}px ${Math.round(h * 0.14)}px` : 0,
        display: 'flex', alignItems: 'center',
        boxShadow: isDark ? '0 1px 4px rgba(0,0,0,0.15)' : 'none',
      }}>
        <img
          src={logoImg}
          alt="AuraFit — Train Smart. Live Strong."
          height={h}
          style={{
            height: h,
            width: 'auto',
            display: 'block',
            objectFit: 'contain',
          }}
          draggable={false}
        />
      </div>
    </div>
  );
}
