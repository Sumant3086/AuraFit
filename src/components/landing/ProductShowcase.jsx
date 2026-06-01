import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

/* ── Feature highlight row ─────────────────────────────────── */
function Highlight({ icon, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        background: 'var(--brand-purple-dim)', border: '1px solid var(--border-accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
      }}>
        {icon}
      </div>
      <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{text}</span>
    </div>
  );
}

/* ── AI Workout card mock ──────────────────────────────────── */
function WorkoutMock() {
  const days = [
    { day: 'Mon', focus: 'Push', done: true },
    { day: 'Tue', focus: 'Pull', done: true },
    { day: 'Wed', focus: 'Rest', done: false, rest: true },
    { day: 'Thu', focus: 'Legs', done: false },
    { day: 'Fri', focus: 'Cardio', done: false },
  ];

  return (
    <div style={{
      background: 'var(--surface-raised)', border: '1px solid var(--border-default)',
      borderRadius: 20, padding: 24, boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: 11, margin: 0, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700 }}>AI-Generated</p>
          <p style={{ color: 'var(--text-primary)', fontSize: 18, fontWeight: 800, margin: '4px 0 0', letterSpacing: '-0.02em' }}>Your Weekly Plan</p>
        </div>
        <div style={{
          background: 'rgba(157,0,255,0.1)', border: '1px solid rgba(157,0,255,0.3)',
          borderRadius: 8, padding: '4px 10px',
          color: '#9d00ff', fontSize: 11, fontWeight: 700,
        }}>
          🤖 Gemini AI
        </div>
      </div>

      {days.map((d, i) => (
        <motion.div
          key={d.day}
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 12px', borderRadius: 10, marginBottom: 6,
            background: d.done ? 'rgba(16,185,129,0.06)' : d.rest ? 'transparent' : 'var(--surface-overlay)',
            border: `1px solid ${d.done ? 'rgba(16,185,129,0.15)' : d.rest ? 'var(--border-subtle)' : 'var(--border-subtle)'}`,
          }}
        >
          <span style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 700, width: 28 }}>{d.day}</span>
          <div style={{
            flex: 1, height: 6, background: 'var(--surface-high)', borderRadius: 3, overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: d.done ? '100%' : d.rest ? '0%' : '0%',
              background: d.done ? 'linear-gradient(90deg,#10b981,#34d399)' : 'var(--brand-gradient)',
              borderRadius: 3,
              transition: 'width 0.6s ease',
            }} />
          </div>
          <span style={{
            fontSize: 12, fontWeight: 600,
            color: d.done ? '#10b981' : d.rest ? 'var(--text-muted)' : 'var(--text-secondary)',
            width: 52, textAlign: 'right',
          }}>
            {d.done ? '✓ Done' : d.rest ? 'Rest' : d.focus}
          </span>
        </motion.div>
      ))}

      <div style={{
        marginTop: 14, padding: '10px 14px',
        background: 'rgba(157,0,255,0.06)',
        border: '1px solid rgba(157,0,255,0.15)',
        borderRadius: 10,
        display: 'flex', gap: 10, alignItems: 'center',
      }}>
        <span style={{ fontSize: 16 }}>💡</span>
        <p style={{ color: 'var(--text-secondary)', fontSize: 12, margin: 0 }}>
          Increase bench press by 2.5kg this week based on your progress
        </p>
      </div>
    </div>
  );
}

/* ── Progress tracker mock ─────────────────────────────────── */
function ProgressMock() {
  const weeks = [62, 58, 56, 55, 53.5, 52.8, 52, 51.5];
  const maxW = Math.max(...weeks);
  const minW = Math.min(...weeks);

  return (
    <div style={{
      background: 'var(--surface-raised)', border: '1px solid var(--border-default)',
      borderRadius: 20, padding: 24, boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
    }}>
      <div style={{ marginBottom: 16 }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 11, margin: 0, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700 }}>Progress Tracker</p>
        <p style={{ color: 'var(--text-primary)', fontSize: 18, fontWeight: 800, margin: '4px 0 0', letterSpacing: '-0.02em' }}>Body Weight Journey</p>
      </div>

      {/* Chart */}
      <div style={{ position: 'relative', height: 80, marginBottom: 12 }}>
        <svg width="100%" height="80" viewBox={`0 0 ${weeks.length * 40} 80`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9d00ff" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#9d00ff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={`M ${weeks.map((w, i) => `${i * 40 + 20},${60 - ((w - minW) / (maxW - minW)) * 50}`).join(' L ')} L ${(weeks.length - 1) * 40 + 20},80 L 20,80 Z`}
            fill="url(#chartGrad)"
          />
          <polyline
            points={weeks.map((w, i) => `${i * 40 + 20},${60 - ((w - minW) / (maxW - minW)) * 50}`).join(' ')}
            fill="none" stroke="#9d00ff" strokeWidth="2.5" strokeLinejoin="round"
          />
          {weeks.map((w, i) => (
            <circle key={i} cx={i * 40 + 20} cy={60 - ((w - minW) / (maxW - minW)) * 50}
              r="3" fill="#9d00ff" />
          ))}
        </svg>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {[
          { label: 'Start', value: '62 kg', color: 'var(--text-muted)' },
          { label: 'Current', value: '51.5 kg', color: '#10b981' },
          { label: 'Lost', value: '−10.5 kg', color: '#9d00ff' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--surface-overlay)', borderRadius: 10,
            padding: '10px 12px', textAlign: 'center',
          }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 10, margin: '0 0 4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
            <p style={{ color: s.color, fontSize: 16, fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 14, display: 'flex', gap: 8, alignItems: 'center',
        background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
        borderRadius: 10, padding: '8px 12px',
      }}>
        <span style={{ fontSize: 16 }}>🏅</span>
        <p style={{ color: '#10b981', fontSize: 12, fontWeight: 600, margin: 0 }}>
          8-week milestone achieved! +500 points earned
        </p>
      </div>
    </div>
  );
}

/* ── Section ────────────────────────────────────────────────── */
function ShowcaseRow({ tag, headline, copy, highlights, cta, ctaPath, mockup, flip = false }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
      gap: 'clamp(40px,6vw,80px)',
      alignItems: 'center',
      marginBottom: 'clamp(60px,8vw,100px)',
    }}
      className="showcase-row"
    >
      <motion.div
        initial={{ opacity: 0, x: flip ? 24 : -24 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ order: flip ? 2 : 1 }}
      >
        <div style={{
          display: 'inline-flex', background: 'var(--brand-purple-dim)',
          border: '1px solid var(--border-accent)', borderRadius: 999,
          padding: '5px 14px', marginBottom: 'clamp(14px,2vw,20px)',
        }}>
          <span style={{ color: 'var(--brand-purple)', fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{tag}</span>
        </div>

        <h2 style={{
          color: 'var(--text-primary)',
          fontSize: 'clamp(26px,3.5vw,42px)',
          fontWeight: 800, lineHeight: 1.15,
          letterSpacing: '-0.02em',
          margin: '0 0 clamp(12px,2vw,16px)',
        }}>
          {headline}
        </h2>

        <p style={{
          color: 'var(--text-secondary)', fontSize: 'clamp(14px,1.5vw,17px)',
          lineHeight: 1.7, margin: '0 0 clamp(20px,3vw,28px)',
        }}>
          {copy}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 'clamp(24px,3vw,32px)' }}>
          {highlights.map(h => <Highlight key={h.text} icon={h.icon} text={h.text} />)}
        </div>

        <Link to={ctaPath} style={{ textDecoration: 'none' }}>
          <motion.div
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              color: 'var(--brand-purple)', fontSize: 15, fontWeight: 700,
              background: 'var(--brand-purple-dim)', border: '1px solid var(--border-accent)',
              borderRadius: 999, padding: '10px 20px', cursor: 'pointer',
            }}
          >
            {cta} <span>→</span>
          </motion.div>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: flip ? -24 : 24 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        style={{ order: flip ? 1 : 2 }}
      >
        {mockup}
      </motion.div>
    </div>
  );
}

export default function ProductShowcase() {
  return (
    <section style={{
      padding: 'clamp(80px,10vw,120px) clamp(20px,4vw,60px)',
      background: 'var(--surface-bg)',
      maxWidth: 1280, margin: '0 auto',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', marginBottom: 'clamp(60px,8vw,96px)' }}
      >
        <h2 style={{
          color: 'var(--text-primary)', fontSize: 'clamp(28px,4vw,48px)',
          fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1,
          margin: '0 0 clamp(10px,1.5vw,16px)',
        }}>
          Everything you need,{' '}
          <span style={{
            background: 'var(--brand-gradient)', WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            in one platform
          </span>
        </h2>
        <p style={{
          color: 'var(--text-secondary)', fontSize: 'clamp(15px,1.6vw,18px)',
          maxWidth: 520, margin: '0 auto', lineHeight: 1.65,
        }}>
          Designed to work the way real athletes do — adaptive, intuitive, and always improving.
        </p>
      </motion.div>

      <ShowcaseRow
        tag="AI Intelligence"
        headline="Workouts that learn from you, every session"
        copy="Our Gemini AI analyzes your history, recovery, and goals to generate progressive workout plans that evolve as you improve — no two plans are the same."
        highlights={[
          { icon: '🧠', text: 'Adapts weekly based on your performance data' },
          { icon: '💪', text: 'Covers strength, HIIT, yoga, boxing, and cardio' },
          { icon: '📅', text: 'Fits your exact schedule — 2 to 7 days/week' },
        ]}
        cta="Generate your plan"
        ctaPath="/features"
        mockup={<WorkoutMock />}
      />

      <ShowcaseRow
        flip
        tag="Progress Analytics"
        headline="See your transformation unfold, week by week"
        copy="Track weight, body fat, measurements, and strength milestones with beautiful visual charts. Gamified milestones and achievements keep you motivated on the hardest days."
        highlights={[
          { icon: '📊', text: 'Body composition trends over time' },
          { icon: '🏅', text: 'Achievement system with 14+ badges to earn' },
          { icon: '🔥', text: 'Streak tracking and daily habit reinforcement' },
        ]}
        cta="Track your progress"
        ctaPath="/features"
        mockup={<ProgressMock />}
      />

      <style>{`
        @media (max-width: 768px) {
          .showcase-row { grid-template-columns: 1fr !important; }
          .showcase-row > *:nth-child(1) { order: 1 !important; }
          .showcase-row > *:nth-child(2) { order: 2 !important; }
        }
      `}</style>
    </section>
  );
}
