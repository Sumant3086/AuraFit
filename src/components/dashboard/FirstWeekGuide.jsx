import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LuBrain, LuQrCode, LuCalendar, LuBarChart2, LuUsers,
  LuCheck, LuChevronDown, LuChevronUp,
} from 'react-icons/lu';

const GUIDE_STEPS = [
  {
    id: 'plan',
    icon: LuBrain,
    title: 'Generate your training plan',
    desc: 'Your first structured programme — personalised to your goal, schedule, and equipment.',
    cta: 'Open training plan',
    path: '/features',
    color: 'var(--accent)',
  },
  {
    id: 'checkin',
    icon: LuQrCode,
    title: 'Complete your first check-in',
    desc: 'Visit the gym and check in. This starts your attendance streak — the single best predictor of long-term consistency.',
    cta: 'Go to check-in',
    path: '/checkin',
    color: 'var(--green)',
  },
  {
    id: 'class',
    icon: LuCalendar,
    title: 'Book your first class',
    desc: 'Attend an instructor-led session this week. Group training accelerates technique and keeps you accountable.',
    cta: 'See class schedule',
    path: '/classes',
    color: '#F59E0B',
  },
  {
    id: 'metrics',
    icon: LuBarChart2,
    title: 'Log your baseline metrics',
    desc: 'Record your starting weight and measurements. Without a baseline, you can\'t measure progress.',
    cta: 'Open body tracker',
    path: '/features',
    color: '#06B6D4',
  },
  {
    id: 'trainer',
    icon: LuUsers,
    title: 'Meet a trainer (optional)',
    desc: 'A single assessment session gives you technique feedback and a more accurate training plan.',
    cta: 'Browse trainers',
    path: '/trainers',
    color: '#6366F1',
    optional: true,
  },
];

export default function FirstWeekGuide({ completedSteps = [] }) {
  const [collapsed, setCollapsed] = useState(false);

  const completed = completedSteps.length;
  const total = GUIDE_STEPS.filter(s => !s.optional).length;
  const pct = Math.round((completed / total) * 100);
  const allDone = completed >= total;

  if (allDone) return null; // Guide disappears once core steps complete

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border-1)',
        borderRadius: 'var(--r-xl)',
        overflow: 'hidden',
        marginBottom: 'var(--sp-4)',
      }}
    >
      {/* Header */}
      <div
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--sp-4) var(--sp-5)', cursor: 'pointer' }}
        onClick={() => setCollapsed(v => !v)}
      >
        <div>
          <p style={{ color: 'var(--text-3)', fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', margin: '0 0 4px' }}>
            First week
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <p style={{ color: 'var(--text-1)', fontWeight: 700, fontSize: 14, margin: 0 }}>
              Getting started — {completed} of {total} complete
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 48, height: 4, background: 'var(--surface-3)', borderRadius: 99, overflow: 'hidden' }}>
            <motion.div
              style={{ height: '100%', background: 'var(--accent)', borderRadius: 99 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          {collapsed ? <LuChevronDown size={14} color="var(--text-3)" /> : <LuChevronUp size={14} color="var(--text-3)" />}
        </div>
      </div>

      {/* Steps */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ borderTop: '1px solid var(--border-1)' }}>
              {GUIDE_STEPS.map((s, i) => {
                const done = completedSteps.includes(s.id);
                return (
                  <div
                    key={s.id}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-4)',
                      padding: 'var(--sp-4) var(--sp-5)',
                      borderBottom: i < GUIDE_STEPS.length - 1 ? '1px solid var(--border-1)' : 'none',
                      background: done ? 'var(--surface-1)' : 'transparent',
                      opacity: done ? 0.55 : 1,
                    }}
                  >
                    {/* Step icon */}
                    <div style={{
                      width: 36, height: 36, borderRadius: 9, flexShrink: 0, marginTop: 1,
                      background: done ? 'var(--green-dim)' : `${s.color === 'var(--accent)' ? 'var(--accent-dim)' : s.color === 'var(--green)' ? 'var(--green-dim)' : 'var(--amber-dim)'}`,
                      border: `1px solid ${done ? 'rgba(34,197,94,0.25)' : s.color === 'var(--accent)' ? 'var(--accent-border)' : 'rgba(34,197,94,0.2)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {done
                        ? <LuCheck size={15} color="var(--green)" strokeWidth={2.5} />
                        : <s.icon size={15} color={done ? 'var(--green)' : s.color} strokeWidth={1.8} />
                      }
                    </div>

                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <p style={{ color: done ? 'var(--text-3)' : 'var(--text-1)', fontWeight: 600, fontSize: 13, margin: 0, textDecoration: done ? 'line-through' : 'none' }}>
                          {s.title}
                        </p>
                        {s.optional && (
                          <span className="pill pill--default" style={{ fontSize: 9, padding: '1px 6px' }}>Optional</span>
                        )}
                      </div>
                      <p style={{ color: 'var(--text-3)', fontSize: 12, margin: '0 0 8px', lineHeight: 1.55 }}>
                        {s.desc}
                      </p>
                      {!done && (
                        <Link to={s.path} style={{ textDecoration: 'none' }}>
                          <button className="btn btn-sm btn-secondary" style={{ gap: 5 }}>
                            {s.cta}
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
