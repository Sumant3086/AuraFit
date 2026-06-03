import React from 'react';
import logoSvg from '../../assets/logos/aurafit-logo.svg';

/**
 * AuraFit Logo — uses the official SVG brand asset (1024×1024 square).
 *
 * The SVG has a dark #080808 rounded-rect background with the gradient
 * icon mark and "AURAFIT" wordmark — works as an app-icon style logo
 * on any dark surface without needing a container.
 *
 * Props:
 *   size  — 'xs'|'sm'|'medium'|'large'|'xl'  (default: 'medium')
 *   style — extra inline styles
 */

const SIZES = { xs: 28, sm: 36, medium: 44, large: 56, xl: 72 };

export default function Logo({ size = 'medium', style = {} }) {
  const h = SIZES[size] || SIZES.medium;
  const r = Math.round(h * 0.22); // match the SVG rx="240" proportionally

  return (
    <div
      role="img"
      aria-label="AuraFit"
      style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', flexShrink: 0, ...style }}
    >
      <img
        src={logoSvg}
        alt="AuraFit"
        height={h}
        width={h}
        style={{ height: h, width: h, borderRadius: r, display: 'block' }}
        draggable={false}
      />
    </div>
  );
}
