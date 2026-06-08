import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LuFlame, LuArrowRight, LuQrCode } from 'react-icons/lu';

/* ── Inactivity Detection ─────────────────────────────────── */
// Shows when a member hasn't checked in for 4+ days.
// Uses loss-aversion framing carefully — focus on what's still possible,
// not what was lost. The 5-day window is the critical recovery period
// before full lapse becomes likely.
//
// Psychology notes:
// - Never say "you failed" or "you missed" — say "it's been X days"
// - Focus on the next action, not the gap
// - Streak recovery framing is more effective than punishment

function getLastCheckInDays(history) {
  if (!history || history.length === 0) return null;
  // history is array of date strings or objects
  const dates = history.map(h => new Date(h.date || h)).sort((a, b) => b - a);
  const lastDate = dates[0];
  if (!lastDate || isNaN(lastDate)) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  lastDate.setHours(0, 0, 0, 0);
  return Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
}

function getMessage(daysSince, streak) {
  // 4 days: gentle nudge
  if (daysSince === 4) {
    return {
      title: "Your routine is slipping",
      body: `It's been 4 days since your last check-in. Four days is the threshold — after this, habits start to break.`,
      cta: 'Check in today',
      severity: 'warning',
    };
  }
  // 5-6 days: clearer signal
  if (daysSince >= 5 && daysSince <= 6) {
    return {
      title: `${daysSince} days since your last visit`,
      body: streak > 3
        ? `Your ${streak}-day streak is at risk. A check-in today keeps it alive.`
        : 'Getting back in today keeps your consistency score intact. Every day you wait makes it harder.',
      cta: 'Get back on track',
      severity: 'warning',
    };
  }
  // 7-9 days: direct
  if (daysSince >= 7 && daysSince <= 9) {
    return {
      title: `A week away`,
      body: streak > 7
        ? `Your ${streak}-day streak ended. Start a new one today — your previous best is the target to beat.`
        : "A week off means your body has started deconditioned slightly. One session reverses that.",
      cta: 'Start fresh today',
      severity: 'alert',
    };
  }
  // 10+ days: re-engagement
  return {
    title: `${daysSince} days since your last visit`,
    body: `Most members who come back after a gap say the hardest part was the first visit back. Not the training — just showing up.`,
    cta: 'Come back today',
    severity: 'alert',
  };
}

export default function InactivityAlert({ stats, checkedInToday }) {
  const daysSince = useMemo(() => {
    if (checkedInToday) return 0;
    return getLastCheckInDays(stats?.history);
  }, [stats?.history, checkedInToday]);

  // Only show if 4+ days inactive
  if (!daysSince || daysSince < 4) return null;

  const streak = stats?.currentStreak || 0;
  const msg    = getMessage(daysSince, streak);

  const isAlert   = msg.severity === 'alert';
  const borderColor = isAlert ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.25)';
  const bgColor     = isAlert ? 'var(--red-dim)'    : 'var(--amber-dim)';
  const textColor   = isAlert ? 'var(--red)'        : 'var(--amber)';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: bgColor,
          border: `1px solid ${borderColor}`,
          borderRadius: 'var(--r-xl)',
          padding: 'var(--sp-4) var(--sp-5)',
          marginBottom: 'var(--sp-4)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1, minWidth: 200 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: isAlert ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)', border: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <LuFlame size={15} color={textColor} strokeWidth={1.8} />
          </div>
          <div>
            <p style={{ color: 'var(--text-1)', fontWeight: 700, fontSize: 14, margin: '0 0 4px', letterSpacing: '-0.01em' }}>
              {msg.title}
            </p>
            <p style={{ color: 'var(--text-2)', fontSize: 13, margin: 0, lineHeight: 1.55 }}>
              {msg.body}
            </p>
          </div>
        </div>

        <Link to="/checkin" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <button
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: isAlert ? 'var(--red)' : 'var(--amber)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--r-md)',
              padding: '8px 14px',
              fontSize: 12, fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              whiteSpace: 'nowrap',
            }}
          >
            <LuQrCode size={12} strokeWidth={2} />
            {msg.cta}
          </button>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}
