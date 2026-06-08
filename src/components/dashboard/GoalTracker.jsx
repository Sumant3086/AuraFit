import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LuTarget, LuArrowRight, LuTrendingUp, LuFlame, LuCheck } from 'react-icons/lu';

/* ── Goal configuration ───────────────────────────────────── */
// Each goal maps to a clear training focus, a consistency threshold,
// and the primary metric that indicates progress.
const GOAL_CONFIG = {
  weight_loss: {
    label: 'Lose body fat',
    focus: 'Calorie deficit + strength training to preserve muscle',
    metric: 'consistency',
    weeklyFocus: 'Prioritise check-ins. Nutrition adherence matters more than any single session.',
    color: '#06B6D4',
  },
  muscle_gain: {
    label: 'Build muscle',
    focus: 'Progressive overload — add weight or reps each week',
    metric: 'records',
    weeklyFocus: 'Log your lifts. If the numbers aren\'t moving, neither are you.',
    color: '#8B5CF6',
  },
  endurance: {
    label: 'Improve fitness',
    focus: 'Volume first — sessions per week matter more than session intensity',
    metric: 'consistency',
    weeklyFocus: 'More sessions with moderate effort beats fewer high-intensity sessions.',
    color: '#22C55E',
  },
  flexibility: {
    label: 'Mobility & recovery',
    focus: 'Daily practice of 20+ minutes matters more than long sessions',
    metric: 'consistency',
    weeklyFocus: 'Book the yoga or stretch class you\'ve been skipping.',
    color: '#F59E0B',
  },
  general_fitness: {
    label: 'General health',
    focus: 'Balanced training — strength, cardio, and flexibility',
    metric: 'consistency',
    weeklyFocus: 'Mix class types. Consistency across modalities builds durable fitness.',
    color: '#EC4899',
  },
};

function getDaysSince(dateStr) {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
}

function getOnTrackStatus(consistencyPct) {
  if (consistencyPct >= 80) return { label: 'On track',  color: 'var(--green)',  bg: 'var(--green-dim)',  border: 'rgba(34,197,94,0.2)' };
  if (consistencyPct >= 50) return { label: 'Behind',    color: 'var(--amber)',  bg: 'var(--amber-dim)',  border: 'rgba(245,158,11,0.2)' };
  return                           { label: 'At risk',   color: 'var(--red)',    bg: 'var(--red-dim)',    border: 'rgba(239,68,68,0.2)' };
}

export default function GoalTracker({ user, stats, trainingDaysPerWeek = 3 }) {
  const goal = user?.fitnessGoal || 'general_fitness';
  const config = GOAL_CONFIG[goal] || GOAL_CONFIG.general_fitness;

  const memberSince = getDaysSince(user?.createdAt);
  const memberWeeks = Math.floor(memberSince / 7);

  // Calculate expected check-ins this month based on training schedule
  const daysInMonth    = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const dayOfMonth     = new Date().getDate();
  const daysElapsed    = dayOfMonth;
  const expectedSoFar  = Math.round((trainingDaysPerWeek / 7) * daysElapsed);
  const actualSoFar    = stats?.thisMonth || 0;
  const consistencyPct = expectedSoFar > 0 ? Math.min(100, Math.round((actualSoFar / expectedSoFar) * 100)) : 0;

  const status = getOnTrackStatus(consistencyPct);

  return (
    <div style={{
      background: 'var(--surface-2)',
      border: '1px solid var(--border-1)',
      borderRadius: 'var(--r-xl)',
      overflow: 'hidden',
      marginBottom: 'var(--sp-4)',
    }}>
      {/* Top accent stripe */}
      <div style={{ height: 3, background: config.color, opacity: 0.7 }} />

      <div style={{ padding: 'var(--sp-5)' }}>
        {/* Goal header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-4)' }}>
          <div>
            <p style={{ color: 'var(--text-3)', fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', margin: '0 0 4px' }}>
              Your goal
            </p>
            <p style={{ color: 'var(--text-1)', fontWeight: 700, fontSize: 15, margin: 0, letterSpacing: '-0.01em' }}>
              {config.label}
            </p>
          </div>

          {/* Status badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: status.bg, border: `1px solid ${status.border}`, borderRadius: 'var(--r-pill)', padding: '3px 10px' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: status.color, flexShrink: 0 }} />
            <span style={{ color: status.color, fontSize: 11, fontWeight: 700 }}>{status.label}</span>
          </div>
        </div>

        {/* Consistency metric */}
        <div style={{ marginBottom: 'var(--sp-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: 'var(--text-3)', fontSize: 11 }}>Month consistency</span>
            <span style={{ color: 'var(--text-1)', fontSize: 13, fontWeight: 700 }}>{actualSoFar} of {expectedSoFar} sessions</span>
          </div>
          <div className="progress-track">
            <motion.div
              className="progress-fill"
              style={{
                background: consistencyPct >= 80 ? 'var(--green)' : consistencyPct >= 50 ? 'var(--amber)' : 'var(--red)',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${consistencyPct}%` }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>

        {/* Training focus */}
        <div style={{ background: 'var(--surface-3)', border: '1px solid var(--border-1)', borderRadius: 10, padding: '10px 12px', marginBottom: 'var(--sp-4)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <LuTarget size={13} color="var(--text-3)" strokeWidth={1.8} style={{ marginTop: 2, flexShrink: 0 }} />
            <p style={{ color: 'var(--text-2)', fontSize: 12, margin: 0, lineHeight: 1.55 }}>
              <strong style={{ color: 'var(--text-1)', fontWeight: 600 }}>Focus: </strong>
              {config.focus}
            </p>
          </div>
        </div>

        {/* This week's specific focus */}
        <p style={{ color: 'var(--text-3)', fontSize: 12, margin: '0 0 var(--sp-4)', lineHeight: 1.55, fontStyle: 'italic' }}>
          This week: {config.weeklyFocus}
        </p>

        {/* Member since */}
        {memberWeeks > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <LuTrendingUp size={12} color="var(--text-4)" strokeWidth={1.5} />
            <span style={{ color: 'var(--text-4)', fontSize: 11 }}>
              Member for {memberWeeks === 1 ? '1 week' : `${memberWeeks} weeks`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
