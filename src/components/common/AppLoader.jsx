import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * AppLoader — Premium first-load splash screen.
 * Shown briefly on initial app load to prevent flash of unstyled content
 * and establish the brand identity immediately.
 */
export default function AppLoader({ children }) {
  const [loaded, setLoaded] = useState(false);
  const [splash, setSplash] = useState(true);

  useEffect(() => {
    // Mark as ready after fonts + critical resources load
    const timer = setTimeout(() => {
      setLoaded(true);
      // Keep splash visible briefly for brand imprint
      setTimeout(() => setSplash(false), 600);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {splash && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              background: '#050507',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 20,
            }}
          >
            {/* Logo mark */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <svg width="56" height="56" viewBox="0 0 40 40" fill="none" aria-label="AuraFit">
                <defs>
                  <linearGradient id="splash-g" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#9d00ff" />
                    <stop offset="100%" stopColor="#00d4ff" />
                  </linearGradient>
                </defs>
                <rect width="40" height="40" rx="10" fill="url(#splash-g)" />
                <rect x="7" y="13.5" width="6" height="13" rx="2.5" fill="white" opacity="0.95" />
                <rect x="13" y="17.5" width="14" height="5" rx="2" fill="white" opacity="0.85" />
                <rect x="27" y="13.5" width="6" height="13" rx="2.5" fill="white" opacity="0.95" />
                <circle cx="33.5" cy="9.5" r="1.5" fill="white" opacity="0.55" />
              </svg>
            </motion.div>

            {/* Wordmark */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              style={{ display: 'flex', alignItems: 'baseline' }}
            >
              <span style={{
                fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg,#9d00ff,#00d4ff)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Aura
              </span>
              <span style={{
                fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em',
                color: 'rgba(240,240,246,0.65)', WebkitTextFillColor: 'rgba(240,240,246,0.65)',
              }}>
                Fit
              </span>
            </motion.div>

            {/* Loading indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{ display: 'flex', gap: 5 }}
            >
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1, delay: i * 0.2, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ width: 4, height: 4, borderRadius: '50%', background: '#9d00ff' }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: loaded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </>
  );
}
