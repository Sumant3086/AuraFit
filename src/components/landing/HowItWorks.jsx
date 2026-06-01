import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const STEPS = [
  {
    number: '01',
    icon: '✏️',
    title: 'Create your profile',
    desc: 'Tell us your goals, fitness level, and schedule. Takes under 2 minutes. Our onboarding earns you 100 bonus points immediately.',
    detail: 'Goal selection · Experience level · Schedule preferences',
    color: '#9d00ff',
  },
  {
    number: '02',
    icon: '🤖',
    title: 'AI builds your plan',
    desc: 'Gemini AI generates a personalized workout and nutrition plan calibrated to your body, goals, and available equipment.',
    detail: 'Workout schedule · Macro targets · Meal suggestions',
    color: '#00d4ff',
  },
  {
    number: '03',
    icon: '📍',
    title: 'Check in and train',
    desc: 'QR check-ins, real trainer bookings, group classes, and a community of fellow members all keep you accountable.',
    detail: 'QR check-in · Trainer sessions · Group classes',
    color: '#10b981',
  },
  {
    number: '04',
    icon: '📈',
    title: 'Track and transform',
    desc: 'Body composition tracking, streak rewards, achievement badges, and leaderboard rankings make progress addictive.',
    detail: 'Progress charts · Achievements · Leaderboard',
    color: '#f59e0b',
  },
];

export default function HowItWorks() {
  return (
    <section style={{
      padding: 'clamp(80px,10vw,120px) clamp(20px,4vw,60px)',
      background: 'linear-gradient(180deg, var(--surface-bg) 0%, var(--surface-raised) 50%, var(--surface-bg) 100%)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: 'clamp(48px,7vw,80px)' }}
        >
          <div style={{
            display: 'inline-flex', background: 'var(--brand-purple-dim)',
            border: '1px solid var(--border-accent)', borderRadius: 999,
            padding: '5px 14px', marginBottom: 'clamp(12px,2vw,20px)',
          }}>
            <span style={{ color: 'var(--brand-purple)', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Simple process
            </span>
          </div>

          <h2 style={{
            color: 'var(--text-primary)', fontSize: 'clamp(28px,4vw,48px)',
            fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1,
            margin: '0 0 clamp(10px,1.5vw,16px)',
          }}>
            From signup to transformation<br />
            <span style={{ background: 'var(--brand-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              in four steps
            </span>
          </h2>
          <p style={{
            color: 'var(--text-secondary)', fontSize: 'clamp(15px,1.6vw,18px)',
            maxWidth: 480, margin: '0 auto', lineHeight: 1.65,
          }}>
            Built to get you from zero to consistent — with the least friction possible.
          </p>
        </motion.div>

        {/* Steps grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'clamp(12px,2vw,20px)',
          position: 'relative',
        }}>
          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: 'var(--surface-raised)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-2xl)',
                padding: 'clamp(24px,3vw,32px)',
                position: 'relative', overflow: 'hidden',
              }}
            >
              {/* Decorative number background */}
              <div style={{
                position: 'absolute', top: -16, right: 12,
                fontSize: 88, fontWeight: 900, lineHeight: 1,
                color: `${step.color}08`,
                userSelect: 'none', pointerEvents: 'none',
                letterSpacing: '-0.04em',
              }}>
                {step.number}
              </div>

              {/* Step indicator */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: `${step.color}18`, border: `1px solid ${step.color}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22,
                }}>
                  {step.icon}
                </div>
                <span style={{
                  color: step.color, fontSize: 11, fontWeight: 800,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>
                  Step {step.number}
                </span>
              </div>

              <h3 style={{
                color: 'var(--text-primary)', fontSize: 'clamp(17px,1.8vw,20px)',
                fontWeight: 700, margin: '0 0 10px', letterSpacing: '-0.01em',
                lineHeight: 1.2,
              }}>
                {step.title}
              </h3>

              <p style={{
                color: 'var(--text-secondary)', fontSize: 14,
                lineHeight: 1.65, margin: '0 0 16px',
              }}>
                {step.desc}
              </p>

              <div style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: 12,
                color: 'var(--text-muted)', fontSize: 12,
                fontWeight: 600, lineHeight: 1.6,
              }}>
                {step.detail}
              </div>

              {/* Top accent line */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, ${step.color}00, ${step.color}, ${step.color}00)`,
              }} />
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          style={{ textAlign: 'center', marginTop: 'clamp(40px,5vw,60px)' }}
        >
          <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '0 0 16px' }}>
            Join 5,000+ members already on their journey
          </p>
          <Link to="/signup" style={{ textDecoration: 'none' }}>
            <motion.div
              whileHover={{ scale: 1.04, boxShadow: '0 12px 40px rgba(157,0,255,0.4)' }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: 'var(--brand-gradient)',
                padding: '14px 32px', borderRadius: 'var(--radius-pill)',
                color: '#fff', fontWeight: 700, fontSize: 16,
                boxShadow: '0 8px 32px rgba(157,0,255,0.3)',
                cursor: 'pointer',
              }}
            >
              Start your transformation — it's free →
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
