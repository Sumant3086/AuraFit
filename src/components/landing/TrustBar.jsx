import React from 'react';
import { motion } from 'framer-motion';

const TRUST = [
  { icon: '🔒', label: 'Secure payments', desc: 'Encrypted via Razorpay' },
  { icon: '🤖', label: 'Google Gemini AI', desc: 'AI-powered workouts & nutrition' },
  { icon: '⚡', label: 'Instant setup', desc: 'Start training in under 2 minutes' },
  { icon: '🔄', label: 'Cancel anytime', desc: 'No lock-in, no hidden fees' },
  { icon: '📱', label: 'Works offline', desc: 'Installable PWA' },
  { icon: '🎯', label: 'Personalized to you', desc: 'Plans built around your goals' },
];

export default function TrustBar() {
  return (
    <section style={{
      borderTop: '1px solid var(--border-subtle)',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'var(--surface-raised)',
      padding: 'clamp(32px,4vw,48px) clamp(20px,4vw,60px)',
      overflow: 'hidden',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{
            textAlign: 'center', color: 'var(--text-muted)',
            fontSize: 12, fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', marginBottom: 'clamp(20px,3vw,32px)',
          }}
        >
          Built with these in mind
        </motion.p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 'clamp(12px,2vw,24px)',
        }}>
          {TRUST.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: 'flex', gap: 12, alignItems: 'flex-start',
                padding: 'clamp(12px,1.5vw,16px)',
                background: 'var(--surface-overlay)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }}>{item.icon}</span>
              <div>
                <p style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 700, margin: '0 0 2px' }}>{item.label}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: 11, margin: 0, lineHeight: 1.4 }}>{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
