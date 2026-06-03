import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LuArrowRight } from 'react-icons/lu';

export default function LandingCTA() {
  return (
    <section style={{
      background: 'var(--surface-1)',
      borderTop: '1px solid var(--border-1)',
      padding: 'clamp(64px,10vw,96px) clamp(20px,5vw,60px)',
    }}>
      <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 style={{
            fontSize: 'clamp(28px,4vw,44px)',
            fontWeight: 'var(--weight-bold)',
            letterSpacing: 'var(--tracking-snug)',
            color: 'var(--text-1)',
            lineHeight: 'var(--leading-tight)',
            marginBottom: 'var(--sp-5)',
          }}>
            Most people know what to do.
            <br />
            AuraFit helps you do it.
          </h2>

          <p style={{
            color: 'var(--text-2)',
            fontSize: 'clamp(15px,1.6vw,17px)',
            lineHeight: 'var(--leading-normal)',
            marginBottom: 'var(--sp-8)',
          }}>
            Free to start. No commitment required.
          </p>

          <div style={{ display: 'flex', gap: 'var(--sp-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup">
              <motion.button
                whileHover={{ opacity: 0.88 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'var(--text-1)',
                  color: 'var(--bg)',
                  border: 'none',
                  padding: '13px 26px',
                  borderRadius: 'var(--r-md)',
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--weight-semibold)',
                  cursor: 'pointer',
                }}
              >
                Create free account
                <LuArrowRight size={15} />
              </motion.button>
            </Link>

            <Link to="/pricing">
              <motion.button
                whileHover={{ background: 'var(--surface-3)' }}
                whileTap={{ scale: 0.97 }}
                style={{
                  background: 'transparent',
                  color: 'var(--text-2)',
                  border: '1px solid var(--border-2)',
                  padding: '13px 26px',
                  borderRadius: 'var(--r-md)',
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--weight-medium)',
                  cursor: 'pointer',
                }}
              >
                View pricing
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
