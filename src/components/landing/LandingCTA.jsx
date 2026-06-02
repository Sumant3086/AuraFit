import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function LandingCTA() {
  return (
    <section style={{
      padding: 'clamp(64px,8vw,96px) clamp(20px,4vw,60px)',
      background: 'var(--surface-raised)',
      borderTop: '1px solid var(--border-subtle)',
    }}>
      <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 style={{
            color: 'var(--text-primary)',
            fontSize: 'clamp(26px,4vw,44px)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            margin: '0 0 clamp(12px,2vw,16px)',
          }}>
            Most people know what to do.<br />
            <span style={{
              background: 'linear-gradient(135deg, #9d00ff, #00d4ff)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              AuraFit gives you a system.
            </span>
          </h2>

          <p style={{
            color: 'var(--text-secondary)',
            fontSize: 'clamp(15px,1.6vw,18px)',
            lineHeight: 1.65,
            maxWidth: 480, margin: '0 auto clamp(28px,4vw,36px)',
          }}>
            AI-generated plans, consistent tracking, and a community to keep you accountable — free to start, no commitment required.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'linear-gradient(135deg, #9d00ff, #00d4ff)',
                  padding: 'clamp(13px,2vw,15px) clamp(22px,3vw,32px)',
                  borderRadius: 12, color: '#fff', fontWeight: 700,
                  fontSize: 'clamp(14px,1.5vw,16px)',
                  boxShadow: '0 4px 20px rgba(157,0,255,0.2)',
                  cursor: 'pointer',
                }}
              >
                Create free account
              </motion.div>
            </Link>
            <Link to="/pricing" style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'inline-flex', alignItems: 'center',
                  border: '1px solid var(--border-default)',
                  padding: 'clamp(13px,2vw,15px) clamp(22px,3vw,32px)',
                  borderRadius: 12,
                  color: 'var(--text-secondary)', fontWeight: 600,
                  fontSize: 'clamp(14px,1.5vw,16px)',
                  cursor: 'pointer',
                }}
              >
                View pricing
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
