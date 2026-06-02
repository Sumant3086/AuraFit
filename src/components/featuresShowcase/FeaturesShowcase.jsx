import React from 'react';
import './featuresShowcase.css';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const FEATURES = [
  {
    icon: '🤖',
    title: 'Workouts that adapt to you',
    desc: 'Gemini AI analyses your history, goals, and recovery to generate a progressive plan that evolves every week — never the same routine twice.',
    cta: 'Generate your plan',
    stat: '10,000+ plans generated',
  },
  {
    icon: '🥗',
    title: 'Nutrition, down to the macro',
    desc: 'Precision meal planning built around your body composition and dietary preferences. Indian and international options, calculated to the gram.',
    cta: 'Calculate your macros',
    stat: 'Supports 40+ dietary needs',
  },
  {
    icon: '📊',
    title: 'Progress you can see and feel',
    desc: 'Track weight, body fat, measurements, and strength gains with visual charts. Milestones trigger badge rewards to keep the momentum going.',
    cta: 'See your data',
    stat: 'Used by 5,000+ members',
  },
];

export default function FeaturesShowcase() {
  return (
    <section className="features-showcase">
      <div className="showcase-header">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div style={{
            display: 'inline-flex', background: 'var(--brand-purple-dim)',
            border: '1px solid var(--border-accent)', borderRadius: '999px',
            padding: '5px 14px', marginBottom: 16,
          }}>
            <span style={{ color: 'var(--brand-purple)', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Platform features
            </span>
          </div>
          <h2>Built for real results,<br /><span className="gradient-text">backed by science</span></h2>
          <p>Every feature is designed around one question: will this actually help members train better and stay consistent?</p>
        </motion.div>
      </div>

      <div className="showcase-grid">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            className="showcase-card"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: i * 0.1, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="card-icon" style={{ fontSize: 36 }}>{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
            <div style={{ marginTop: 'auto', paddingTop: 16 }}>
              <Link to="/features" className="card-link">
                {f.cta} →
              </Link>
              <p style={{ color: 'var(--text-muted)', fontSize: 11, margin: '10px 0 0', fontWeight: 600 }}>
                {f.stat}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="showcase-cta">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <Link to="/features" className="cta-button">
            Explore all features
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
