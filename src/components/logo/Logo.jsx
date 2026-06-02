import React from 'react';

/**
 * AuraFit Logo — SVG-based, accessible, scales cleanly from 16px to any size.
 *
 * Props:
 *   size     — 'xs' | 'sm' | 'medium' | 'large' | 'xl'  (default: 'medium')
 *   variant  — 'full' | 'mark' | 'wordmark'               (default: 'full')
 *   theme    — 'dark' | 'light' | 'gradient'              (default: 'gradient')
 *   showTagline — boolean, shows 'AI Fitness' subtitle    (default: false)
 */

const SIZES = {
  xs:     { mark: 20, fontSize: 14, subSize: 9,  gap: 7 },
  sm:     { mark: 26, fontSize: 18, subSize: 10, gap: 8 },
  medium: { mark: 32, fontSize: 22, subSize: 11, gap: 10 },
  large:  { mark: 40, fontSize: 28, subSize: 13, gap: 12 },
  xl:     { mark: 52, fontSize: 36, subSize: 16, gap: 14 },
};

function Mark({ size = 32, theme = 'gradient' }) {
  const id = `af-g-${size}-${theme}`;
  const isLight = theme === 'light';
  const fgColor = isLight ? '#1a1a2e' : '#ffffff';

  return (
    <svg
      width={size} height={size} viewBox="0 0 40 40"
      fill="none" aria-hidden="true"
      style={{ flexShrink: 0, display: 'block' }}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9d00ff" />
          <stop offset="100%" stopColor="#00d4ff" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="40" height="40" rx="10"
        fill={theme === 'gradient' ? `url(#${id})` : isLight ? '#f0f0f6' : '#17171f'}
      />

      {/* Left weight plate */}
      <rect x="7" y="13.5" width="6" height="13" rx="2.5" fill={fgColor} opacity="0.95" />
      {/* Bar */}
      <rect x="13" y="17.5" width="14" height="5" rx="2" fill={fgColor} opacity="0.85" />
      {/* Right weight plate */}
      <rect x="27" y="13.5" width="6" height="13" rx="2.5" fill={fgColor} opacity="0.95" />

      {/* Energy dot — top-right, subtle */}
      <circle cx="33.5" cy="9.5" r="1.5" fill={fgColor} opacity="0.55" />
    </svg>
  );
}

function Wordmark({ fontSize, subSize, theme }) {
  const isLight = theme === 'light';
  const primaryColor = isLight ? '#0a0a10' : '#f0f0f6';
  const dimColor = isLight ? 'rgba(10,10,16,0.6)' : 'rgba(240,240,246,0.7)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1, userSelect: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'baseline' }}>
        {/* "Aura" — gradient or solid */}
        <span style={{
          fontSize, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1,
          background: theme === 'gradient' ? 'linear-gradient(135deg,#9d00ff,#00d4ff)' : 'none',
          WebkitBackgroundClip: theme === 'gradient' ? 'text' : 'unset',
          WebkitTextFillColor: theme === 'gradient' ? 'transparent' : primaryColor,
          backgroundClip: theme === 'gradient' ? 'text' : 'unset',
          color: theme !== 'gradient' ? primaryColor : undefined,
        }}>
          Aura
        </span>
        {/* "Fit" — slightly dimmed for contrast */}
        <span style={{
          fontSize, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1,
          color: dimColor, WebkitTextFillColor: dimColor,
        }}>
          Fit
        </span>
      </div>
      {subSize && (
        <span style={{
          fontSize: subSize, fontWeight: 600,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: isLight ? 'rgba(10,10,16,0.35)' : 'rgba(240,240,246,0.3)',
          WebkitTextFillColor: isLight ? 'rgba(10,10,16,0.35)' : 'rgba(240,240,246,0.3)',
          marginTop: 3,
        }}>
          AI Fitness
        </span>
      )}
    </div>
  );
}

export default function Logo({
  size = 'medium',
  variant = 'full',
  theme = 'gradient',
  showTagline = false,
  style = {},
}) {
  const dim = SIZES[size] || SIZES.medium;

  return (
    <div
      role="img"
      aria-label="AuraFit"
      style={{ display: 'inline-flex', alignItems: 'center', gap: dim.gap, cursor: 'pointer', ...style }}
    >
      {(variant === 'full' || variant === 'mark') && (
        <Mark size={dim.mark} theme={theme} />
      )}
      {(variant === 'full' || variant === 'wordmark') && (
        <Wordmark fontSize={dim.fontSize} subSize={showTagline ? dim.subSize : null} theme={theme} />
      )}
    </div>
  );
}
