import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LuCalendar, LuTrendingUp, LuTarget, LuArrowRight } from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';
import Footer from '../footer/Footer';

const ease = [0.16, 1, 0.3, 1];

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function getMonthRecommendation(consistencyPct, goal) {
  const goalMap = {
    weight_loss:    'Track your nutrition daily this month. Consistency in diet drives fat loss more than any other variable.',
    muscle_gain:    'Focus on progressive overload. If you\'re not logging PRs, you\'re not building muscle systematically.',
    endurance:      'Add one extra class per week this month. Volume is the primary driver of cardiovascular adaptation.',
    flexibility:    'Book the yoga or mobility class you\'ve been skipping. Twenty minutes daily matters more than one long session.',
    general_fitness:'Vary your training types this month. Mix strength, cardio, and mobility sessions for balanced adaptation.',
  };

  if (consistencyPct < 50) {
    return 'Your attendance was below your scheduled target this month. Next month, focus on showing up before you focus on training harder.';
  }
  if (consistencyPct < 80) {
    return goalMap[goal] || 'You\'re close to your target consistency. One additional session per week next month closes the gap.';
  }
  return goalMap[goal] || 'You\'re tracking well. Maintain this frequency and increase intensity to continue progressing.';
}

export default function MonthlyProgress() {
  const { user, apiClient }  = useAuth();
  const [stats, setStats]    = useState(null);
  const [loading, setLoading]= useState(true);

  const today     = new Date();
  const month     = today.getMonth();
  const year      = today.getFullYear();
  const monthName = MONTH_NAMES[month];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiClient.get('/attendance/stats/me').catch(() => ({ data: { data: null } }));
        if (!cancelled && res.data.data) setStats(res.data.data);
      } catch {}
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [apiClient]);

  const trainingDaysPerWeek = user?.trainingDaysPerWeek || 3;
  const goal                = user?.fitnessGoal || 'general_fitness';

  // Calculate expected sessions for the full month (so far)
  const dayOfMonth     = today.getDate();
  const expectedSoFar  = Math.max(1, Math.round((trainingDaysPerWeek / 7) * dayOfMonth));
  const actual         = stats?.thisMonth || 0;
  const consistencyPct = Math.min(100, Math.round((actual / expectedSoFar) * 100));
  const totalPoints    = user?.points || 0;
  const streak         = user?.currentStreak || stats?.currentStreak || 0;

  const recommendation = getMonthRecommendation(consistencyPct, goal);

  const SUMMARY_STATS = [
    { label: 'Check-ins', value: actual,         suffix: '',    desc: 'This month' },
    { label: 'Consistency', value: consistencyPct, suffix: '%',   desc: 'vs target' },
    { label: 'Streak',    value: streak,          suffix: 'd',   desc: 'Current' },
    { label: 'Points',    value: totalPoints.toLocaleString(), suffix: '', desc: 'Total earned' },
  ];

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 80 }}>

      {/* ── Header ─────────────────────────────────────── */}
      <div style={{ borderBottom: '1px solid var(--border-1)', padding: 'clamp(56px,9vw,88px) 0 clamp(36px,5vw,52px)' }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
            <p style={{ color: 'var(--accent)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 20, height: 1, background: 'var(--accent)', opacity: 0.6, display: 'inline-block' }} />
              Progress
            </p>
            <h1 style={{ fontSize: 'clamp(26px,5vw,48px)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-1)', margin: '0 0 8px', lineHeight: 1.1 }}>
              {monthName} {year}
            </h1>
            <p style={{ color: 'var(--text-2)', fontSize: 'clamp(14px,1.5vw,16px)', maxWidth: 440, margin: 0, lineHeight: 1.65 }}>
              Your training summary for this month — attendance, consistency, and what to focus on next.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 'var(--sp-8)', paddingBottom: 'var(--sp-20)' }}>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {[1,2,3,4].map(i => <div key={i} style={{ height: 80, background: 'var(--surface-2)', borderRadius: 'var(--r-xl)' }} className="skeleton" />)}
          </div>
        ) : (
          <>
            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 'var(--sp-5)' }} className="monthly-grid">
              {SUMMARY_STATS.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.4, ease }}
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 'var(--r-xl)', padding: 'var(--sp-5)' }}
                >
                  <p style={{ color: 'var(--text-3)', fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', margin: '0 0 6px' }}>
                    {s.label}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 3 }}>
                    <span style={{ color: 'var(--text-1)', fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>
                      {s.value}
                    </span>
                    {s.suffix && <span style={{ color: 'var(--text-3)', fontSize: 14, fontWeight: 600 }}>{s.suffix}</span>}
                  </div>
                  <p style={{ color: 'var(--text-4)', fontSize: 11, margin: 0 }}>{s.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Consistency progress */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28, ease }}
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 'var(--r-xl)', padding: 'var(--sp-5)', marginBottom: 'var(--sp-5)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <LuCalendar size={13} color="var(--text-3)" strokeWidth={1.8} />
                  <p style={{ color: 'var(--text-3)', fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', margin: 0 }}>Month target</p>
                </div>
                <span style={{ color: 'var(--text-2)', fontSize: 13, fontWeight: 600 }}>
                  {actual} of {expectedSoFar} sessions
                </span>
              </div>
              <div className="progress-track" style={{ height: 8 }}>
                <motion.div
                  className={`progress-fill ${consistencyPct >= 80 ? 'progress-fill--green' : consistencyPct < 50 ? '' : ''}`}
                  style={{
                    height: '100%',
                    background: consistencyPct >= 80 ? 'var(--green)' : consistencyPct >= 50 ? 'var(--accent)' : 'var(--amber)',
                    borderRadius: 'var(--r-pill)',
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${consistencyPct}%` }}
                  transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <p style={{ color: 'var(--text-4)', fontSize: 11, margin: '8px 0 0', textAlign: 'right' }}>
                {consistencyPct}% of your {trainingDaysPerWeek}×/week schedule
              </p>
            </motion.div>

            {/* Monthly recommendation */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, ease }}
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 'var(--r-xl)', padding: 'var(--sp-5)', marginBottom: 'var(--sp-5)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <LuTarget size={14} color="var(--accent)" strokeWidth={1.8} />
                <p style={{ color: 'var(--text-3)', fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', margin: 0 }}>
                  Next month focus
                </p>
              </div>
              <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.65, margin: 0 }}>
                {recommendation}
              </p>
            </motion.div>

            {/* Quick links */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Personal Records', desc: 'Log your best lifts', to: '/progress/records', icon: LuTrendingUp },
                { label: 'Book a trainer', desc: 'Get professional review', to: '/book-trainer', icon: LuCalendar },
              ].map(l => (
                <Link key={l.to} to={l.to} style={{ textDecoration: 'none' }}>
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="pf-card pf-card--interactive"
                    style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <l.icon size={13} color="var(--accent)" strokeWidth={1.8} />
                      <span style={{ color: 'var(--text-1)', fontSize: 13, fontWeight: 600 }}>{l.label}</span>
                    </div>
                    <p style={{ color: 'var(--text-3)', fontSize: 12, margin: 0 }}>{l.desc}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />

      <style>{`
        @media (max-width: 480px) {
          .monthly-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
