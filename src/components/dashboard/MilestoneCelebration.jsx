import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuX, LuAward, LuFlame, LuTrendingUp } from 'react-icons/lu';

/* ── Milestone System ─────────────────────────────────────── */
// Milestones are real behavioral thresholds, not arbitrary badge unlocks.
// Each one represents a meaningful stage in the member's fitness journey.
// They are dismissable and never shown twice (stored in localStorage).
//
// Research basis:
// - 7 days: The habit formation check-in (neurologically significant)
// - 21 days: Behavior pattern is established
// - 30 days: One full month of commitment
// - 50 check-ins: Represents a serious member
// - 100 check-ins: Long-term committed member

const MILESTONES = [
  // Streak milestones — consecutive training days
  { id: 'streak-7',   type: 'streak',   threshold: 7,   title: '7-day streak',      body: 'Seven consecutive days of training. Research shows this is where habits begin to form.',         icon: LuFlame,    color: 'var(--amber)' },
  { id: 'streak-14',  type: 'streak',   threshold: 14,  title: 'Two-week streak',   body: 'Fourteen days. The routine is establishing itself. This is when most people stop — you didn\'t.',  icon: LuFlame,    color: 'var(--amber)' },
  { id: 'streak-21',  type: 'streak',   threshold: 21,  title: '21-day streak',     body: 'Three weeks of consistent training. Neurologically, this is when behavior patterns set.',         icon: LuFlame,    color: 'var(--amber)' },
  { id: 'streak-30',  type: 'streak',   threshold: 30,  title: '30-day streak',     body: 'A full month without missing a training day. This is rare. You\'re in the top tier of members.', icon: LuFlame,    color: 'var(--amber)' },
  { id: 'streak-60',  type: 'streak',   threshold: 60,  title: '60-day streak',     body: 'Two months. At this point training isn\'t a habit — it\'s part of who you are.',                  icon: LuFlame,    color: 'var(--amber)' },
  { id: 'streak-90',  type: 'streak',   threshold: 90,  title: '90-day streak',     body: 'Ninety days. Quarter of a year without breaking. The commitment is no longer in question.',       icon: LuFlame,    color: 'var(--amber)' },
  // Check-in milestones — total visits
  { id: 'checkin-10',  type: 'checkin', threshold: 10,  title: '10 check-ins',      body: 'Ten sessions recorded. You\'re past the "trying it out" phase. This is a real commitment.',        icon: LuAward,    color: 'var(--accent)' },
  { id: 'checkin-25',  type: 'checkin', threshold: 25,  title: '25 check-ins',      body: 'Twenty-five sessions. The equivalent of nearly a month of daily training. Strong.',               icon: LuAward,    color: 'var(--accent)' },
  { id: 'checkin-50',  type: 'checkin', threshold: 50,  title: '50 check-ins',      body: 'Fifty visits recorded. This puts you in the top 20% of members by attendance frequency.',         icon: LuAward,    color: 'var(--accent)' },
  { id: 'checkin-100', type: 'checkin', threshold: 100, title: '100 check-ins',     body: 'One hundred sessions. The physical and mental adaptations you\'ve made are permanent.',            icon: LuAward,    color: '#F59E0B' },
  { id: 'checkin-200', type: 'checkin', threshold: 200, title: '200 check-ins',     body: 'Two hundred visits. At this volume, AuraFit is infrastructure in your life, not a gym.',          icon: LuTrendingUp, color: '#22C55E' },
];

const STORAGE_KEY = 'aurafit:milestones_seen';

function getSeenMilestones() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

function markSeen(id) {
  const seen = getSeenMilestones();
  if (!seen.includes(id)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...seen, id]));
  }
}

export default function MilestoneCelebration({ stats }) {
  const [dismissed, setDismissed] = useState(false);

  const milestone = useMemo(() => {
    if (!stats) return null;
    const seen    = getSeenMilestones();
    const streak  = stats.currentStreak || 0;
    const total   = stats.total || 0;

    // Find the highest-value unseen milestone the member just hit
    return MILESTONES.find(m => {
      if (seen.includes(m.id)) return false;
      if (m.type === 'streak')  return streak >= m.threshold;
      if (m.type === 'checkin') return total  >= m.threshold;
      return false;
    }) || null;
  }, [stats]);

  const handleDismiss = () => {
    if (milestone) markSeen(milestone.id);
    setDismissed(true);
  };

  if (!milestone || dismissed) return null;

  const Icon = milestone.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -6 }}
        transition={{ type: 'spring', bounce: 0.3, duration: 0.45 }}
        style={{
          background: `linear-gradient(135deg, ${milestone.color === 'var(--amber)' ? 'rgba(245,158,11,0.08)' : 'var(--accent-dim)'}, var(--surface-2))`,
          border: `1px solid ${milestone.color === 'var(--amber)' ? 'rgba(245,158,11,0.25)' : 'var(--accent-border)'}`,
          borderRadius: 'var(--r-xl)',
          padding: 'var(--sp-5)',
          marginBottom: 'var(--sp-4)',
          position: 'relative',
        }}
      >
        {/* Dismiss */}
        <button
          onClick={handleDismiss}
          style={{
            position: 'absolute', top: 12, right: 12,
            background: 'none', border: 'none',
            color: 'var(--text-4)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 24, height: 24, borderRadius: 6,
          }}
          aria-label="Dismiss"
        >
          <LuX size={13} strokeWidth={2} />
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, paddingRight: 24 }}>
          {/* Icon */}
          <motion.div
            initial={{ rotate: -10, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', bounce: 0.5 }}
            style={{
              width: 44, height: 44, borderRadius: 12,
              background: milestone.color === 'var(--amber)' ? 'var(--amber-dim)' : 'var(--accent-dim)',
              border: `1px solid ${milestone.color === 'var(--amber)' ? 'rgba(245,158,11,0.25)' : 'var(--accent-border)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon size={20} color={milestone.color} strokeWidth={1.8} />
          </motion.div>

          {/* Content */}
          <div>
            <motion.p
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              style={{
                color: milestone.color,
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.08em', margin: '0 0 4px',
              }}
            >
              Milestone
            </motion.p>
            <motion.p
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                color: 'var(--text-1)', fontWeight: 800, fontSize: 16,
                margin: '0 0 6px', letterSpacing: '-0.015em',
              }}
            >
              {milestone.title}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{ color: 'var(--text-2)', fontSize: 13, margin: 0, lineHeight: 1.6, maxWidth: '46ch' }}
            >
              {milestone.body}
            </motion.p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
