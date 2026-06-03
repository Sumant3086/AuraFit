import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LuBrain, LuSalad, LuBarChart2, LuArrowRight } from 'react-icons/lu';

const FEATURES = [
  {
    Icon: LuBrain,
    title: 'Workouts built for you',
    desc: 'AI generates a structured weekly plan around your goals, schedule, and available equipment. Updates as you improve.',
    cta: 'Generate your plan',
    stat: 'Adapts weekly',
  },
  {
    Icon: LuSalad,
    title: 'Nutrition to the macro',
    desc: 'Precision meal planning calibrated to your body composition and dietary preferences. Indian and international options.',
    cta: 'Calculate macros',
    stat: '40+ dietary profiles',
  },
  {
    Icon: LuBarChart2,
    title: 'Progress you can see',
    desc: 'Track weight, body fat, and strength milestones. Visual charts show what is actually changing week over week.',
    cta: 'Start tracking',
    stat: 'Week-over-week trends',
  },
];

export default function FeaturesShowcase() {
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
          style={{ marginBottom: 'clamp(40px,7vw,64px)' }}
        >
          <p style={{
            color: 'var(--text-3)', fontSize: 'var(--text-xs)',
            fontWeight: 'var(--weight-medium)', letterSpacing: 'var(--tracking-wider)',
            textTransform: 'uppercase', marginBottom: 'var(--sp-4)',
          }}>
            Platform features
          </p>
          <h2 style={{
            fontSize: 'clamp(26px,3.5vw,40px)',
            fontWeight: 'var(--weight-bold)',
            letterSpacing: 'var(--tracking-snug)',
            color: 'var(--text-1)',
            lineHeight: 'var(--leading-tight)',
            maxWidth: 440,
          }}>
            Built to actually help you improve
          </h2>
        </motion.div>

        {/* Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 1,
          background: 'var(--border-1)',
          border: '1px solid var(--border-1)',
          borderRadius: 'var(--r-xl)',
          overflow: 'hidden',
          marginBottom: 'var(--sp-8)',
        }}>
          {FEATURES.map(({ Icon, title, desc, cta, stat }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.08, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: 'var(--surface-1)',
                padding: 'var(--sp-8) var(--sp-6)',
                display: 'flex', flexDirection: 'column',
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 'var(--r-md)',
                background: 'var(--surface-3)',
                border: '1px solid var(--border-1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 'var(--sp-5)',
              }}>
                <Icon size={16} color="var(--text-2)" strokeWidth={1.5} />
              </div>

              <h3 style={{
                color: 'var(--text-1)', fontSize: 'var(--text-md)',
                fontWeight: 'var(--weight-semibold)',
                letterSpacing: 'var(--tracking-normal)',
                margin: '0 0 var(--sp-3)',
              }}>
                {title}
              </h3>

              <p style={{
                color: 'var(--text-2)', fontSize: 'var(--text-sm)',
                lineHeight: 'var(--leading-normal)', margin: '0 0 var(--sp-6)',
                flex: 1,
              }}>
                {desc}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/features" style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  color: 'var(--text-2)', fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--weight-medium)',
                }}>
                  {cta}
                  <LuArrowRight size={12} strokeWidth={1.5} />
                </Link>
                <span style={{ color: 'var(--text-3)', fontSize: 'var(--text-xs)' }}>
                  {stat}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <Link to="/features">
          <motion.button
            whileHover={{ background: 'var(--surface-3)' }}
            whileTap={{ scale: 0.98 }}
            style={{
              background: 'var(--surface-2)', color: 'var(--text-1)',
              border: '1px solid var(--border-2)',
              padding: '11px 22px', borderRadius: 'var(--r-md)',
              fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)',
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
            }}
          >
            Explore all features
            <LuArrowRight size={13} strokeWidth={1.5} />
          </motion.button>
        </Link>
      </div>
    </section>
  );
}
