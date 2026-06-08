import React from 'react';
import { motion } from 'framer-motion';
import { LuFlame } from 'react-icons/lu';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function getTodayIndex() {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1; // 0=Mon ... 6=Sun
}

function getWeekBoundaries() {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon ...
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { monday, sunday };
}

export default function WeekProgress({ stats, trainingDaysPerWeek = 3 }) {
  const todayIdx = getTodayIndex();

  // Count check-ins this week from attendance stats
  const thisWeek = stats?.thisWeek || 0;
  const goal = trainingDaysPerWeek;
  const pct = goal > 0 ? Math.min(100, Math.round((thisWeek / goal) * 100)) : 0;

  // Build a simple 7-day indicator
  // We don't have per-day data here, so we show a count-based ring
  const remaining = Math.max(0, goal - thisWeek);

  const statusColor = thisWeek >= goal ? 'var(--green)' : thisWeek > 0 ? 'var(--accent)' : 'var(--text-3)';

  return (
    <div style={{
      background: 'var(--surface-2)',
      border: '1px solid var(--border-1)',
      borderRadius: 'var(--r-xl)',
      padding: 'var(--sp-5)',
      marginBottom: 'var(--sp-4)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-4)' }}>
        <div>
          <p style={{ color: 'var(--text-3)', fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', margin: '0 0 4px' }}>
            This week
          </p>
          <p style={{ color: 'var(--text-1)', fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: '-0.025em', lineHeight: 1 }}>
            {thisWeek}
            <span style={{ color: 'var(--text-3)', fontSize: 13, fontWeight: 500, marginLeft: 4 }}>
              / {goal} sessions
            </span>
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          {thisWeek >= goal ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <LuFlame size={13} color="var(--amber)" fill="var(--amber)" />
              <span style={{ color: 'var(--green)', fontSize: 12, fontWeight: 600 }}>Week complete</span>
            </div>
          ) : (
            <span style={{ color: 'var(--text-3)', fontSize: 12 }}>
              {remaining} remaining
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 'var(--sp-3)' }}>
        <div className="progress-track">
          <motion.div
            className={`progress-fill ${thisWeek >= goal ? 'progress-fill--green' : ''}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      {/* Day indicators */}
      <div style={{ display: 'flex', gap: 4 }}>
        {DAYS.map((d, i) => {
          const isToday = i === todayIdx;
          const isDone = i < todayIdx && i < thisWeek;
          const isFuture = i > todayIdx;
          return (
            <div
              key={i}
              title={DAY_NAMES[i]}
              style={{
                flex: 1,
                height: 32,
                borderRadius: 8,
                background: isToday
                  ? 'var(--accent-dim)'
                  : isDone
                    ? 'rgba(34,197,94,0.15)'
                    : 'var(--surface-3)',
                border: `1px solid ${isToday ? 'var(--accent-border)' : isDone ? 'rgba(34,197,94,0.25)' : 'var(--border-1)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{
                fontSize: 10,
                fontWeight: isToday ? 700 : 500,
                color: isToday ? 'var(--accent)' : isDone ? 'var(--green)' : isFuture ? 'var(--text-4)' : 'var(--text-3)',
              }}>
                {d}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
