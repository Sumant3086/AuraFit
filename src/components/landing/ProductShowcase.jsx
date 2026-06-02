import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const SECTIONS = [
  {
    tag: 'AI Intelligence',
    headline: 'Workouts built for you, not copied from the internet',
    copy: 'Describe your goals, schedule, and available equipment. Gemini AI generates a structured weekly training program — and updates it as you progress.',
    highlights: [
      { icon: '🎯', text: 'Adapts to your fitness level and goals' },
      { icon: '📅', text: 'Fits your available days and session length' },
      { icon: '🔄', text: 'Updates weekly based on what you complete' },
    ],
    cta: 'Try the workout generator',
    path: '/features',
    visual: {
      title: 'AI-generated plan',
      badge: 'Gemini AI',
      items: [
        { label: 'Monday', detail: 'Push — Chest & Triceps', status: 'scheduled' },
        { label: 'Tuesday', detail: 'Pull — Back & Biceps', status: 'scheduled' },
        { label: 'Wednesday', detail: 'Rest & recovery', status: 'rest' },
        { label: 'Thursday', detail: 'Lower body & Core', status: 'scheduled' },
        { label: 'Friday', detail: 'Cardio & mobility', status: 'scheduled' },
      ],
    },
  },
  {
    tag: 'Progress Tracking',
    headline: 'Track what matters, see what changes',
    copy: 'Log your weight, body measurements, and strength gains. Visual charts show progress over time — honest, without fabricated before/after numbers.',
    highlights: [
      { icon: '📊', text: 'Weight and body fat over time' },
      { icon: '💪', text: 'Strength milestones per exercise' },
      { icon: '🏅', text: 'Achievements unlock as you improve' },
    ],
    cta: 'See the tracker',
    path: '/features',
    flip: true,
    visual: {
      title: 'Body weight log',
      badge: 'Progress',
      metrics: [
        { label: 'Start weight', value: '—', note: 'Set on day 1' },
        { label: 'Current', value: '—', note: 'Updated each check-in' },
        { label: 'Change', value: '—', note: 'Calculated automatically' },
      ],
      note: 'Log your first entry to start tracking',
    },
  },
];

function FeatureVisualWorkout({ visual }) {
  return (
    <div style={{
      background: 'var(--surface-raised)', border: '1px solid var(--border-default)',
      borderRadius: 16, padding: 22, boxShadow: 'var(--shadow-md)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p style={{ color: 'var(--text-primary)', fontSize: 15, fontWeight: 700, margin: 0 }}>{visual.title}</p>
        <span style={{
          background: 'var(--brand-purple-dim)', color: 'var(--brand-purple)',
          border: '1px solid var(--border-accent)',
          borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 700,
        }}>
          {visual.badge}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {visual.items.map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 8,
            background: item.status === 'rest' ? 'transparent' : 'var(--surface-overlay)',
            border: `1px solid ${item.status === 'rest' ? 'var(--border-subtle)' : 'var(--border-default)'}`,
            opacity: item.status === 'rest' ? 0.5 : 1,
          }}>
            <span style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, width: 80, flexShrink: 0 }}>
              {item.label}
            </span>
            <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{item.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureVisualProgress({ visual }) {
  return (
    <div style={{
      background: 'var(--surface-raised)', border: '1px solid var(--border-default)',
      borderRadius: 16, padding: 22, boxShadow: 'var(--shadow-md)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p style={{ color: 'var(--text-primary)', fontSize: 15, fontWeight: 700, margin: 0 }}>{visual.title}</p>
        <span style={{
          background: 'rgba(16,185,129,0.1)', color: '#10b981',
          border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 700,
        }}>
          {visual.badge}
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
        {visual.metrics.map(m => (
          <div key={m.label} style={{
            background: 'var(--surface-overlay)', borderRadius: 10,
            padding: '12px 10px', textAlign: 'center',
          }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px' }}>{m.label}</p>
            <p style={{ color: 'var(--text-primary)', fontSize: 20, fontWeight: 800, margin: '0 0 3px', letterSpacing: '-0.02em' }}>{m.value}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 10, margin: 0 }}>{m.note}</p>
          </div>
        ))}
      </div>
      <div style={{
        background: 'var(--surface-overlay)', border: '1px dashed var(--border-default)',
        borderRadius: 10, padding: '16px', textAlign: 'center',
      }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>
          📊 {visual.note}
        </p>
      </div>
    </div>
  );
}

export default function ProductShowcase() {
  return (
    <section style={{
      padding: 'clamp(64px,8vw,100px) clamp(20px,4vw,60px)',
      background: 'var(--surface-bg)',
      maxWidth: 1200, margin: '0 auto',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: 'center', marginBottom: 'clamp(48px,7vw,72px)' }}
      >
        <h2 style={{
          color: 'var(--text-primary)', fontSize: 'clamp(26px,3.5vw,42px)',
          fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15,
          margin: '0 0 clamp(10px,1.5vw,14px)',
        }}>
          Two core features,{' '}
          <span style={{
            background: 'linear-gradient(135deg, #9d00ff, #00d4ff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            done properly
          </span>
        </h2>
        <p style={{
          color: 'var(--text-secondary)', fontSize: 'clamp(15px,1.5vw,17px)',
          maxWidth: 480, margin: '0 auto', lineHeight: 1.6,
        }}>
          Most apps give you a feature list. AuraFit gives you two things that actually work — AI workout planning and honest progress tracking.
        </p>
      </motion.div>

      {SECTIONS.map((section, i) => (
        <div
          key={section.tag}
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
            gap: 'clamp(32px,5vw,64px)',
            alignItems: 'center',
            marginBottom: i < SECTIONS.length - 1 ? 'clamp(56px,8vw,80px)' : 0,
          }}
          className="showcase-row"
        >
          <motion.div
            initial={{ opacity: 0, x: section.flip ? 20 : -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            style={{ order: section.flip ? 2 : 1 }}
          >
            <div style={{
              display: 'inline-flex', background: 'var(--brand-purple-dim)',
              border: '1px solid var(--border-accent)', borderRadius: 999,
              padding: '4px 12px', marginBottom: 16,
            }}>
              <span style={{ color: 'var(--brand-purple)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                {section.tag}
              </span>
            </div>
            <h3 style={{
              color: 'var(--text-primary)', fontSize: 'clamp(22px,2.8vw,32px)',
              fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2,
              margin: '0 0 12px',
            }}>
              {section.headline}
            </h3>
            <p style={{
              color: 'var(--text-secondary)', fontSize: 15,
              lineHeight: 1.65, margin: '0 0 20px',
            }}>
              {section.copy}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {section.highlights.map(h => (
                <div key={h.text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{h.icon}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{h.text}</span>
                </div>
              ))}
            </div>
            <Link to={section.path} style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  color: 'var(--brand-purple)', fontSize: 14, fontWeight: 700,
                  background: 'var(--brand-purple-dim)', border: '1px solid var(--border-accent)',
                  borderRadius: 999, padding: '9px 18px', cursor: 'pointer',
                }}
              >
                {section.cta} →
              </motion.div>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: section.flip ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            style={{ order: section.flip ? 1 : 2 }}
          >
            {i === 0 ? <FeatureVisualWorkout visual={section.visual} /> : <FeatureVisualProgress visual={section.visual} />}
          </motion.div>
        </div>
      ))}

      <style>{`
        @media (max-width: 680px) {
          .showcase-row { grid-template-columns: 1fr !important; }
          .showcase-row > * { order: unset !important; }
        }
      `}</style>
    </section>
  );
}
