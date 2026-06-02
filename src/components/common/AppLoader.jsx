import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '../../assets/logos/aurafit-logo.png';

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
            {/* Real brand logo */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              style={{
                background: '#fff',
                borderRadius: 14,
                padding: '8px 14px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
              }}
            >
              <img
                src={logoImg}
                alt="AuraFit"
                style={{ height: 52, width: 'auto', display: 'block' }}
              />
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
