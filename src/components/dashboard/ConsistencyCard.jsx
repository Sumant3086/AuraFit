import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { LuCalendar, LuTrendingUp, LuTrendingDown, LuMinus } from 'react-icons/lu';

/* ── Consistency Score ────────────────────────────────────── */
// A percentage-based consistency metric that's more psychologically
// resilient than a streak. Missing one day doesn't reset to zero.
// Formula: (actual sessions / expected sessions) × 100, capped at 100%.
// Expected = (trainingDaysPerWeek / 7) × daysElapsed in period.

function getConsistencyColor(pct) {
  if (pct >= 80) return { color: 'var(--green)',  bg: 'var(--green-dim)',  border: 'rgba(34,197,94,0.2)',   label: 'Excellent' };
  if (pct >= 60) return { color: 'var(--accent)', bg: 'var(--accent-dim)', border: 'var(--accent-border)',  label: 'Good' };
  if (pct >= 40) return { color: 'var(--amber)',  bg: 'var(--amber-dim)',  border: 'rgba(245,158,11,0.2)',  label: 'Building' };
  return               { color: 'var(--red)',    bg: 'var(--red-dim)',    border: 'rgba(239,68,68,0.2)',   label: 'Needs work' };
}

function getConsistencyMessage(pct, trainingDays) {
  if (pct >= 90) return 'You\'re hitting your schedule. This is exactly how progress compounds.';
  if (pct >= 80) return `Consistent ${trainingDays}x/week training. Keep this standard.`;
  if (pct >= 60) return 'You\'re close to your schedule. One extra session this week closes the gap.';
  if (pct >= 40) return `Your goal requires ${trainingDays} sessions/week. You're under that right now.`;
  return `Training less than scheduled. ${trainingDays}x/week is what your plan is built around.`;
}

function computeMonthConsistency(stats, trainingDaysPerWeek) {
  const today      = new Date();
  const dayOfMonth = today.getDate();
  const expected   = Math.max(1, Math.round((trainingDaysPerWeek / 7) * dayOfMonth));
  const actual     = stats?.thisMonth || 0;
  return { expected, actual, pct: Math.min(100, Math.round((actual / expected) * 100)) };
}

function computeWeekConsistency(stats, trainingDaysPerWeek) {
  // Which day of the week are we in? (0=Mon, 6=Sun)
  const today = new Date();
  const dow = today.getDay(); // 0=Sun...6=Sat
  const daysThisWeekElapsed = dow === 0 ? 7 : dow; // if Sunday, whole week elapsed
  const expected = Math.max(1, Math.round((trainingDaysPerWeek / 7) * daysThisWeekElapsed));
  const actual   = stats?.thisWeek || 0;
  return { expected, actual, pct: Math.min(100, Math.round((actual / expected) * 100)) };
}

export default function ConsistencyCard({ stats, trainingDaysPerWeek = 3 }) {
  const month = useMemo(() => computeMonthConsistency(stats, trainingDaysPerWeek), [stats, trainingDaysPerWeek]);
  const week  = useMemo(() => computeWeekConsistency(stats,  trainingDaysPerWeek), [stats, trainingDaysPerWeek]);

  const monthStyle = getConsistencyColor(month.pct);
  const weekStyle  = getConsistencyColor(week.pct);
  const trend      = month.pct >= 70 ? 'up' : month.pct >= 50 ? 'flat' : 'down';

  return (
    <div style={{
      background: 'var(--surface-2)',
      border: '1px solid var(--border-1)',
      borderRadius: 'var(--r-xl)',
      padding: 'var(--sp-5)',
      marginBottom: 'var(--sp-4)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <LuCalendar size={13} color="var(--text-3)" strokeWidth={1.8} />
          <p style={{ color: 'var(--text-3)', fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', margin: 0 }}>
            Consistency
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: monthStyle.bg, border: `1px solid ${monthStyle.border}`, borderRadius: 'var(--r-pill)', padding: '3px 10px' }}>
          {trend === 'up'   && <LuTrendingUp   size={11} color={monthStyle.color} />}
          {trend === 'flat' && <LuMinus         size={11} color={monthStyle.color} />}
          {trend === 'down' && <LuTrendingDown  size={11} color={monthStyle.color} />}
          <span style={{ color: monthStyle.color, fontSize: 11, fontWeight: 700 }}>{monthStyle.label}</span>
        </div>
      </div>

      {/* Two-column score display */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 'var(--sp-4)' }}>
        {/* Monthly */}
        <div style={{ background: 'var(--surface-3)', border: '1px solid var(--border-1)', borderRadius: 10, padding: '12px 14px' }}>
          <p style={{ color: 'var(--text-3)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 4px' }}>
            This month
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <motion.span
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ color: monthStyle.color, fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}
            >
              {month.pct}
            </motion.span>
            <span style={{ color: 'var(--text-3)', fontSize: 13, fontWeight: 600 }}>%</span>
          </div>
          <p style={{ color: 'var(--text-4)', fontSize: 10, margin: '4px 0 0' }}>
            {month.actual} / {month.expected} sessions
          </p>
        </div>

        {/* Weekly */}
        <div style={{ background: 'var(--surface-3)', border: '1px solid var(--border-1)', borderRadius: 10, padding: '12px 14px' }}>
          <p style={{ color: 'var(--text-3)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 4px' }}>
            This week
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <motion.span
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ color: weekStyle.color, fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}
            >
              {week.pct}
            </motion.span>
            <span style={{ color: 'var(--text-3)', fontSize: 13, fontWeight: 600 }}>%</span>
          </div>
          <p style={{ color: 'var(--text-4)', fontSize: 10, margin: '4px 0 0' }}>
            {week.actual} / {week.expected} sessions
          </p>
        </div>
      </div>

      {/* Contextual insight */}
      <p style={{ color: 'var(--text-3)', fontSize: 12, margin: 0, lineHeight: 1.55 }}>
        {getConsistencyMessage(month.pct, trainingDaysPerWeek)}
      </p>
    </div>
  );
}
