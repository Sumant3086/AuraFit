import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  LuTarget, LuCalendar,
  LuDumbbell, LuQrCode, LuUsers as LuCoach,
  LuBarChart2, LuTrendingUp, LuActivity,
  LuSalad, LuMoon,
  LuUsers, LuFlame, LuCheck,
  LuArrowRight,
} from 'react-icons/lu';
import WorkoutGenerator from './WorkoutGenerator';
import BodyTracker from './BodyTracker';
import NutritionCalculator from './NutritionCalculator';
import Footer from '../footer/Footer';

const ease = [0.16, 1, 0.3, 1];

/* ── Journey phases ──────────────────────────────────────────
   Five stages a serious member moves through over time.
   Each section answers: "What does this help me do right now?"
──────────────────────────────────────────────────────────── */
const PHASES = [
  {
    id: 'plan',
    number: '01',
    label: 'Plan',
    headline: 'Before your first session, you have a structured programme.',
    body: 'Most people train without a plan. AuraFit generates a structured weekly programme based on your goal, experience level, training schedule, and available equipment — before you ever set foot in the gym.',
    points: [
      { icon: LuTarget,    text: 'Personalised weekly split — Push/Pull/Legs, Upper/Lower, or Full-body' },
      { icon: LuDumbbell,  text: 'Working sets, rep targets, and progressive load week-over-week' },
      { icon: LuCalendar,  text: 'Class schedule aligned to your training days' },
    ],
    actions: [
      { label: 'Generate your programme', to: '/features', tab: 'workout', primary: true },
      { label: 'Browse classes', to: '/classes', primary: false },
    ],
    accent: 'var(--accent)',
    accentDim: 'var(--accent-dim)',
    accentBorder: 'var(--accent-border)',
  },
  {
    id: 'train',
    number: '02',
    label: 'Train',
    headline: 'Every session is recorded. Every visit counts.',
    body: "Check in at the gym. Attend a class. Book a session with a trainer. AuraFit records everything — not to judge, but to make your consistency visible to you. You can't improve what you don't measure.",
    points: [
      { icon: LuQrCode,   text: 'QR attendance check-in — every visit logged automatically' },
      { icon: LuCalendar, text: 'Group classes bookable directly from the live schedule' },
      { icon: LuCoach,    text: 'Personal trainer sessions with certified coaches' },
    ],
    actions: [
      { label: 'Go to check-in', to: '/checkin', primary: true },
      { label: 'Book a trainer', to: '/trainers', primary: false },
    ],
    accent: 'var(--amber)',
    accentDim: 'var(--amber-dim)',
    accentBorder: 'rgba(245,158,11,0.28)',
  },
  {
    id: 'track',
    number: '03',
    label: 'Track',
    headline: 'Know whether the work is paying off.',
    body: "Logging your body metrics weekly gives you a six-week trend — not just today's number. Track your personal records to see your strength improving over time. The data is yours, not a dashboard for us.",
    points: [
      { icon: LuActivity,    text: 'Body weight, body fat %, and circumference measurements' },
      { icon: LuTrendingUp,  text: 'Six-week rolling trend — direction matters more than any single reading' },
      { icon: LuBarChart2,   text: 'Personal records across all exercises with 1RM estimation' },
    ],
    actions: [
      { label: 'Open body tracker', to: '/features', tab: 'body', primary: true },
      { label: 'Log a personal record', to: '/progress/records', primary: false },
    ],
    accent: 'var(--cyan-color)',
    accentDim: 'var(--cyan-dim)',
    accentBorder: 'rgba(6,182,212,0.28)',
  },
  {
    id: 'improve',
    number: '04',
    label: 'Improve',
    headline: 'Nutrition and recovery are training too.',
    body: 'Calculate your daily calorie and macro targets based on your actual body and goal. Every Monday morning, AuraFit delivers a performance review — specific feedback based on the previous week, not generic advice.',
    points: [
      { icon: LuSalad,      text: 'TDEE calculation with accurate Harris-Benedict formula' },
      { icon: LuTarget,     text: 'Daily protein, carbohydrate, and fat targets per your goal' },
      { icon: LuMoon,       text: 'Weekly AI-generated insight: what changed, what to adjust' },
    ],
    actions: [
      { label: 'Open nutrition calculator', to: '/features', tab: 'nutrition', primary: true },
      { label: 'View monthly progress', to: '/progress/monthly', primary: false },
    ],
    accent: 'var(--green)',
    accentDim: 'var(--green-dim)',
    accentBorder: 'rgba(34,197,94,0.28)',
  },
  {
    id: 'consistent',
    number: '05',
    label: 'Stay Consistent',
    headline: 'The gym is more motivating when others are training with you.',
    body: 'Leaderboards based on attendance consistency. Achievement milestones at real behavioral thresholds. A community feed where members share results, ask questions, and hold each other accountable.',
    points: [
      { icon: LuFlame,  text: 'Consistency score — percentage-based, not a binary streak' },
      { icon: LuTarget, text: 'Milestone achievements at 7, 21, 30, 60, 90-day training marks' },
      { icon: LuUsers,  text: 'Community feed for sharing results and asking questions' },
    ],
    actions: [
      { label: 'Open community', to: '/community', primary: true },
      { label: 'See leaderboard', to: '/leaderboard', primary: false },
    ],
    accent: '#EC4899',
    accentDim: 'rgba(236,72,153,0.09)',
    accentBorder: 'rgba(236,72,153,0.28)',
  },
];

/* ── AI Tool tabs ─────────────────────────────────────────── */
const TOOLS = [
  { id: 'workout',   label: 'Training Plan Generator', component: <WorkoutGenerator /> },
  { id: 'nutrition', label: 'Nutrition Calculator',    component: <NutritionCalculator /> },
  { id: 'body',      label: 'Body Metrics Tracker',    component: <BodyTracker /> },
];

export default function Features() {
  const [activeTool, setActiveTool] = useState('workout');

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* ── Page hero ─────────────────────────────────────── */}
      <div style={{
        borderBottom: '1px solid var(--border-1)',
        padding: 'clamp(64px,10vw,108px) 0 clamp(44px,6vw,72px)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% 0%, var(--accent-dim) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative' }}>
          <motion.div
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            style={{ maxWidth: '52ch' }}
          >
            <p style={{ color: 'var(--accent)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 20, height: 1, background: 'var(--accent)', opacity: 0.6, display: 'inline-block' }} />
              The member journey
            </p>
            <h1 style={{ fontSize: 'clamp(28px,5vw,52px)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-1)', margin: '0 0 18px', lineHeight: 1.08 }}>
              From your first session to real, measurable progress.
            </h1>
            <p style={{ color: 'var(--text-2)', fontSize: 'clamp(14px,1.6vw,16px)', margin: 0, lineHeight: 1.7 }}>
              AuraFit is built around five stages every serious member moves through. Each stage has tools, data, and structure to support what you're trying to do at that point in your journey.
            </p>
          </motion.div>

          {/* Phase anchor pills */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease, delay: 0.15 }}
            style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 32 }}
          >
            {PHASES.map(p => (
              <a
                key={p.id}
                href={`#phase-${p.id}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '5px 13px',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border-2)',
                  borderRadius: 'var(--r-pill)',
                  color: 'var(--text-2)',
                  fontSize: 12, fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'border-color 0.15s, color 0.15s, background 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-3)'; e.currentTarget.style.color = 'var(--text-1)'; e.currentTarget.style.background = 'var(--surface-3)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.background = 'var(--surface-2)'; }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, opacity: 0.5 }}>{p.number}</span>
                {p.label}
              </a>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Journey phases ────────────────────────────────── */}
      <div className="container" style={{ paddingTop: 'var(--sp-16)', paddingBottom: 'var(--sp-8)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {PHASES.map((phase, i) => (
            <motion.div
              key={phase.id}
              id={`phase-${phase.id}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.05, duration: 0.5, ease }}
              className="journey-phase"
            >
              {/* Phase connector line */}
              {i < PHASES.length - 1 && (
                <div style={{
                  position: 'absolute',
                  left: 'calc(var(--sp-6) + 21px)',
                  bottom: 0,
                  width: 1,
                  height: 'var(--sp-5)',
                  background: 'var(--border-1)',
                  transform: 'translateY(100%)',
                }} />
              )}

              <div className="phase-inner">
                {/* ── Phase number badge ─────────────────── */}
                <div className="phase-number-col">
                  <div style={{
                    width: 44, height: 44, borderRadius: 'var(--r-lg)', flexShrink: 0,
                    background: phase.accentDim,
                    border: `1px solid ${phase.accentBorder}`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ color: phase.accent, fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
                      {phase.number}
                    </span>
                    <span style={{ color: phase.accent, fontSize: 10, fontWeight: 700, marginTop: 1 }}>{phase.label}</span>
                  </div>

                  {/* Vertical connector */}
                  {i < PHASES.length - 1 && (
                    <div style={{ flex: 1, width: 1, background: 'var(--border-1)', minHeight: 32, marginTop: 8 }} />
                  )}
                </div>

                {/* ── Phase content ──────────────────────── */}
                <div className="phase-content">
                  <h2 style={{
                    color: 'var(--text-1)', fontWeight: 800,
                    fontSize: 'clamp(16px,2.2vw,20px)',
                    margin: '0 0 12px',
                    lineHeight: 1.3,
                    letterSpacing: '-0.02em',
                    paddingTop: 10,
                  }}>
                    {phase.headline}
                  </h2>

                  <p style={{
                    color: 'var(--text-2)', fontSize: 'clamp(13px,1.4vw,15px)',
                    lineHeight: 1.75, margin: '0 0 20px', maxWidth: '58ch',
                  }}>
                    {phase.body}
                  </p>

                  {/* Bullet points */}
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {phase.points.map(pt => (
                      <li key={pt.text} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <div style={{
                          width: 26, height: 26, borderRadius: 'var(--r-md)', flexShrink: 0, marginTop: 1,
                          background: phase.accentDim,
                          border: `1px solid ${phase.accentBorder}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <pt.icon size={12} color={phase.accent} strokeWidth={2} />
                        </div>
                        <span style={{ color: 'var(--text-2)', fontSize: 'clamp(12px,1.3vw,14px)', lineHeight: 1.55, paddingTop: 5 }}>{pt.text}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingBottom: 'var(--sp-8)' }}>
                    {phase.actions.map(action => (
                      <Link
                        key={action.label}
                        to={action.to}
                        state={action.tab ? { tab: action.tab } : undefined}
                        style={{ textDecoration: 'none' }}
                      >
                        <button
                          className={action.primary ? 'btn btn-secondary' : 'btn btn-ghost'}
                          style={{ gap: 6, fontSize: 12 }}
                        >
                          {action.label}
                          <LuArrowRight size={12} strokeWidth={2} />
                        </button>
                      </Link>
                    ))}
                  </div>

                  {/* Bottom separator */}
                  {i < PHASES.length - 1 && (
                    <div style={{ height: 1, background: 'var(--border-1)', marginBottom: 'var(--sp-8)' }} />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── AI Tools section ──────────────────────────────── */}
      <div style={{ borderTop: '1px solid var(--border-1)' }}>
        <div className="container" style={{ paddingTop: 'var(--sp-10)', paddingBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 'var(--sp-6)' }}>
            <div>
              <p style={{ color: 'var(--accent)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 20, height: 1, background: 'var(--accent)', opacity: 0.6, display: 'inline-block' }} />
                AI tools
              </p>
              <h2 style={{ color: 'var(--text-1)', fontSize: 'clamp(18px,3vw,28px)', fontWeight: 800, margin: 0, letterSpacing: '-0.025em' }}>
                The tools behind the journey
              </h2>
            </div>
            <p style={{ color: 'var(--text-3)', fontSize: 13, maxWidth: '38ch', lineHeight: 1.55, margin: 0 }}>
              Three integrated tools you use at different stages. Not standalone utilities — parts of one connected system.
            </p>
          </div>

          {/* Tool tabs */}
          <div style={{ borderBottom: '1px solid var(--border-1)', display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
            {TOOLS.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTool(t.id)}
                style={{
                  padding: '11px 18px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTool === t.id ? '2px solid var(--accent)' : '2px solid transparent',
                  color: activeTool === t.id ? 'var(--text-1)' : 'var(--text-3)',
                  fontSize: 13,
                  fontWeight: activeTool === t.id ? 600 : 400,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.15s, border-color 0.15s',
                  marginBottom: -1,
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Active tool ──────────────────────────────────── */}
      <div key={activeTool} style={{ paddingBottom: 'var(--sp-20)' }}>
        {TOOLS.find(t => t.id === activeTool)?.component}
      </div>

      <Footer />

      <style>{`
        .journey-phase {
          position: relative;
        }
        .phase-inner {
          display: flex;
          gap: var(--sp-6);
          align-items: flex-start;
        }
        .phase-number-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
          padding-top: var(--sp-3);
        }
        .phase-content {
          flex: 1;
          min-width: 0;
        }
        @media (max-width: 520px) {
          .phase-inner {
            gap: var(--sp-4);
          }
        }
      `}</style>
    </div>
  );
}
