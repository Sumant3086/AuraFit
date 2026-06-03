import React from 'react';
import { motion } from 'framer-motion';
import { LuShieldCheck, LuZap, LuRefreshCw, LuSmartphone, LuBrain, LuTarget } from 'react-icons/lu';

const ITEMS = [
  { icon: LuShieldCheck, label: 'Secure payments',    desc: 'Razorpay encrypted' },
  { icon: LuBrain,       label: 'Gemini AI',          desc: 'Adaptive planning' },
  { icon: LuZap,         label: 'Instant setup',      desc: 'Start in 2 minutes' },
  { icon: LuRefreshCw,   label: 'Cancel anytime',     desc: 'No lock-in' },
  { icon: LuSmartphone,  label: 'Works offline',      desc: 'Installable PWA' },
  { icon: LuTarget,      label: 'Personalized',       desc: 'Built for your goals' },
];

export default function TrustBar() {
  return (
    <section style={{
      background: 'var(--surface-1)',
      borderBottom: '1px solid var(--border-1)',
      padding: 'var(--sp-10) clamp(20px,5vw,60px)',
    }}>
      <div style={{ maxWidth: 'var(--max-wide)', margin: '0 auto' }}>
        <p style={{
          color: 'var(--text-3)',
          fontSize: 'var(--text-xs)',
          fontWeight: 'var(--weight-medium)',
          letterSpacing: 'var(--tracking-wider)',
          textTransform: 'uppercase',
          textAlign: 'center',
          marginBottom: 'var(--sp-8)',
        }}>
          What's included
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 'var(--sp-6)',
        }}>
          {ITEMS.map(({ icon: Icon, label, desc }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-3)' }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 'var(--r-md)',
                background: 'var(--surface-2)',
                border: '1px solid var(--border-1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={14} color="var(--text-2)" strokeWidth={1.5} />
              </div>
              <div>
                <p style={{ color: 'var(--text-1)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', margin: '0 0 2px' }}>
                  {label}
                </p>
                <p style={{ color: 'var(--text-3)', fontSize: 'var(--text-xs)', margin: 0 }}>
                  {desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
