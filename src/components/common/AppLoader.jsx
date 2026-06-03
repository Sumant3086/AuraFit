import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logoSvg from '../../assets/logos/aurafit-logo.svg';

/**
 * AppLoader — Minimal splash screen shown during initial JS parse.
 * Matches the new design system: #080808 bg, SVG logo, restrained animation.
 */
export default function AppLoader({ children }) {
  const [ready, setReady]   = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Give fonts + critical assets ~350ms to load before fading in
    const t1 = setTimeout(() => setReady(true), 350);
    const t2 = setTimeout(() => setVisible(false), 950);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              background: '#080808',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 24,
            }}
          >
            <motion.img
              src={logoSvg}
              alt="AuraFit"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              style={{ width: 72, height: 72, borderRadius: 16 }}
            />

            {/* Minimal loader — three dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              style={{ display: 'flex', gap: 5, alignItems: 'center' }}
            >
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.2, 0.8, 0.2] }}
                  transition={{ duration: 1.1, delay: i * 0.18, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ width: 3, height: 3, borderRadius: '50%', background: '#5C5C5C' }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: ready ? 1 : 0 }}
        transition={{ duration: 0.25 }}
      >
        {children}
      </motion.div>
    </>
  );
}
