import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LuArrowRight } from 'react-icons/lu';

const STEPS = [
  {
    n: '01',
    title: 'Set your profile',
    body: 'Tell us your goal, experience level, and available days. Takes under two minutes.',
  },
  {
    n: '02',
    title: 'Get your plan',
    body: 'AI generates a weekly workout and nutrition plan calibrated to your body and schedule.',
  },
  {
    n: '03',
    title: 'Check in and train',
    body: 'QR check-ins, trainer bookings, and group classes keep you accountable on hard days.',
  },
  {
    n: '04',
    title: 'Watch the progress',
    body: 'Body measurements, attendance, and strength gains tracked week over week.',
  },
];

export default function HowItWorks() {
  return (
    <section style={{
      background: 'var(--bg)',
      borderBottom: '1px solid var(--border-1)',
      padding: 'clamp(64px,10vw,100px) clamp(20px,5vw,60px)',
    }}>
      <div style={{ maxWidth: 'var(--max-wide)', margin: '0 auto' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: 'clamp(48px,7vw,72px)' }}
        >
          <p style={{
            color: 'var(--text-3)', fontSize: 'var(--text-xs)',
            fontWeight: 'var(--weight-medium)', letterSpacing: 'var(--tracking-wider)',
            textTransform: 'uppercase', marginBottom: 'var(--sp-4)',
          }}>
            How it works
          </p>
          <h2 style={{
            fontSize: 'clamp(28px,4vw,44px)',
            fontWeight: 'var(--weight-bold)',
            letterSpacing: 'var(--tracking-snug)',
            color: 'var(--text-1)',
            maxWidth: 480,
            lineHeight: 'var(--leading-tight)',
          }}>
            Four steps to a real routine
          </h2>
        </motion.div>

        {/* Steps */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 1,
          background: 'var(--border-1)',
          border: '1px solid var(--border-1)',
          borderRadius: 'var(--r-xl)',
          overflow: 'hidden',
          marginBottom: 'var(--sp-12)',
        }}>
          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.08, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: 'var(--surface-1)',
                padding: 'var(--sp-8) var(--sp-6)',
              }}
            >
              <p style={{
                color: 'var(--text-3)',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--weight-medium)',
                letterSpacing: 'var(--tracking-wider)',
                margin: '0 0 var(--sp-5)',
              }}>
                {step.n}
              </p>
              <p style={{
                color: 'var(--text-1)',
                fontSize: 'var(--text-md)',
                fontWeight: 'var(--weight-semibold)',
                letterSpacing: 'var(--tracking-normal)',
                margin: '0 0 var(--sp-3)',
              }}>
                {step.title}
              </p>
              <p style={{
                color: 'var(--text-2)',
                fontSize: 'var(--text-sm)',
                lineHeight: 'var(--leading-normal)',
                margin: 0,
              }}>
                {step.body}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <Link to="/signup">
            <motion.button
              whileHover={{ opacity: 0.85 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'var(--text-1)',
                color: 'var(--bg)',
                border: 'none',
                padding: '13px 24px',
                borderRadius: 'var(--r-md)',
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--weight-semibold)',
                cursor: 'pointer',
              }}
            >
              Ready to build a routine?
              <LuArrowRight size={15} />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
