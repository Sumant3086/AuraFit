import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const TIER = {
  bronze:   { color: '#cd7c54', bg: 'rgba(205,124,84,0.12)',  border: 'rgba(205,124,84,0.3)',  label: 'Bronze' },
  silver:   { color: '#94a3b8', bg: 'rgba(148,163,184,0.10)', border: 'rgba(148,163,184,0.25)', label: 'Silver' },
  gold:     { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.35)',  label: 'Gold' },
  platinum: { color: '#a5f3fc', bg: 'rgba(165,243,252,0.10)', border: 'rgba(165,243,252,0.25)', label: 'Platinum' },
};

const CATEGORIES = {
  all:        { label: 'All',        icon: '✦' },
  attendance: { label: 'Attendance', icon: '📍' },
  workout:    { label: 'Workout',    icon: '💪' },
  nutrition:  { label: 'Nutrition',  icon: '🥗' },
  streak:     { label: 'Streak',     icon: '🔥' },
  milestone:  { label: 'Milestone',  icon: '🎯' },
  referral:   { label: 'Referral',   icon: '🤝' },
  social:     { label: 'Social',     icon: '👥' },
};

export default function Achievements() {
  const { apiClient, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [earnedOnly, setEarnedOnly] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await apiClient.get('/achievements/my');
      setData(res.data);
    } catch {
      toast.error('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  useEffect(() => { load(); }, [load]);

  const achievements = data?.data || [];
  const stats        = data?.stats || {};
  const earnedCount  = achievements.filter(a => a.earned).length;
  const totalPoints  = stats.points || user?.points || 0;
  const level        = Math.floor(totalPoints / 100) + 1;
  const levelPts     = totalPoints % 100;

  const categories = ['all', ...new Set(achievements.map(a => a.category).filter(Boolean))];

  const visible = achievements
    .filter(a => filter === 'all' || a.category === filter)
    .filter(a => !earnedOnly || a.earned)
    .sort((a, b) => (b.earned ? 1 : 0) - (a.earned ? 1 : 0));

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--surface-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 40 }}>🏅</div>
          <div style={{ display: 'flex', gap: 5 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-purple)',
                animation: `ach-dot 1.2s ease-in-out ${i*0.2}s infinite`,
              }} />
            ))}
          </div>
          <style>{`@keyframes ach-dot { 0%,80%,100%{opacity:.2;transform:scale(.8)} 40%{opacity:1;transform:scale(1)} }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--surface-bg)', minHeight: '100vh', paddingBottom: 80 }}>
      {/* Hero */}
      <div style={{
        background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(245,158,11,0.08) 0%, transparent 65%)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: 'clamp(32px,5vw,60px) clamp(16px,4vw,40px) clamp(24px,4vw,40px)',
        textAlign: 'center',
      }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🏅</div>
          <h1 style={{
            color: 'var(--text-primary)', fontSize: 'clamp(26px,4vw,36px)', fontWeight: 800,
            letterSpacing: '-0.02em', margin: '0 0 6px',
          }}>
            Achievements
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, margin: 0 }}>
            Every milestone you reach is permanently recorded.
          </p>
        </motion.div>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 clamp(16px,4vw,24px) 24px' }}>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, margin: 'clamp(20px,3vw,28px) 0' }}>
          {[
            { label: 'Level', value: level, icon: '⭐', color: 'var(--color-gold)' },
            { label: 'Points', value: totalPoints.toLocaleString(), icon: '💎', color: 'var(--brand-purple)' },
            { label: 'Earned', value: `${earnedCount}/${achievements.length}`, icon: '🏅', color: 'var(--color-success)' },
            { label: 'Streak', value: `${stats.currentStreak || user?.currentStreak || 0}d`, icon: '🔥', color: 'var(--color-warning)' },
          ].map(s => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                background: 'var(--surface-raised)', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)', padding: 'clamp(12px,2vw,16px)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ color: s.color, fontSize: 'clamp(16px,2vw,20px)', fontWeight: 800, letterSpacing: '-0.02em' }}>{s.value}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, marginTop: 2 }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Level progress */}
        <div style={{
          background: 'var(--surface-raised)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)', padding: 'clamp(16px,2.5vw,20px)', marginBottom: 20,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 14 }}>Level {level}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              {100 - levelPts} pts to Level {level + 1}
            </span>
          </div>
          <div style={{ height: 6, background: 'var(--surface-high)', borderRadius: 999, overflow: 'hidden' }}>
            <motion.div
              style={{ height: '100%', background: 'var(--brand-gradient)', borderRadius: 999 }}
              animate={{ width: `${levelPts}%` }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
          {categories.map(cat => {
            const meta = CATEGORIES[cat] || { label: cat, icon: '●' };
            return (
              <button key={cat} onClick={() => setFilter(cat)} style={{
                padding: '6px 14px', borderRadius: 999, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
                background: filter === cat ? 'var(--brand-gradient)' : 'var(--surface-overlay)',
                color: filter === cat ? '#fff' : 'var(--text-muted)',
                boxShadow: filter === cat ? 'var(--shadow-glow-purple)' : 'none',
              }}>
                {meta.icon} {meta.label}
              </button>
            );
          })}
          <button
            onClick={() => setEarnedOnly(!earnedOnly)}
            style={{
              marginLeft: 'auto', padding: '6px 14px', borderRadius: 999, cursor: 'pointer',
              fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
              background: 'transparent',
              border: `1px solid ${earnedOnly ? 'var(--border-accent)' : 'var(--border-default)'}`,
              color: earnedOnly ? 'var(--brand-purple)' : 'var(--text-muted)',
            }}
          >
            {earnedOnly ? '✓ Earned only' : 'Earned only'}
          </button>
        </div>

        {/* Grid */}
        {visible.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 20px' }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>🏅</div>
            <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, margin: '0 0 8px' }}>
              {earnedOnly ? 'No badges earned here yet' : 'No achievements in this category'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>
              {earnedOnly ? 'Keep training — you\'re closer than you think.' : 'Start training to earn your first badge.'}
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 12,
          }}>
            <AnimatePresence>
              {visible.map((ach, i) => {
                const tier = TIER[ach.tier] || TIER.bronze;
                return (
                  <motion.div
                    key={ach.key || ach._id}
                    layout
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.03, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      background: ach.earned ? 'var(--surface-raised)' : 'var(--surface-bg)',
                      border: `1px solid ${ach.earned ? tier.border : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-xl)',
                      padding: 'clamp(14px,2vw,18px)',
                      position: 'relative', overflow: 'hidden',
                      opacity: ach.earned ? 1 : 0.5,
                    }}
                  >
                    {/* Earned glow */}
                    {ach.earned && (
                      <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                        background: `linear-gradient(90deg, transparent, ${tier.color}, transparent)`,
                      }} />
                    )}

                    {/* Earned dot */}
                    {ach.earned && (
                      <div style={{
                        position: 'absolute', top: 10, right: 10,
                        width: 8, height: 8, borderRadius: '50%',
                        background: 'var(--color-success)',
                        boxShadow: '0 0 6px rgba(16,185,129,0.5)',
                      }} />
                    )}

                    <div style={{ fontSize: 36, marginBottom: 10 }}>{ach.icon}</div>

                    <div style={{
                      display: 'inline-flex', alignItems: 'center',
                      background: tier.bg, border: `1px solid ${tier.border}`,
                      borderRadius: 999, padding: '2px 8px',
                      marginBottom: 8,
                    }}>
                      <span style={{ color: tier.color, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {tier.label}
                      </span>
                    </div>

                    <h3 style={{
                      color: ach.earned ? 'var(--text-primary)' : 'var(--text-muted)',
                      fontSize: 14, fontWeight: 700, margin: '0 0 5px', lineHeight: 1.2,
                    }}>
                      {ach.name}
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: '0 0 10px', lineHeight: 1.5 }}>
                      {ach.description}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-gold)', fontSize: 12, fontWeight: 700 }}>
                        +{ach.points} pts
                      </span>
                      {ach.earned && ach.earnedAt && (
                        <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                          {new Date(ach.earnedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {!ach.earned && (
                      <div style={{
                        marginTop: 10, padding: '5px 10px',
                        background: 'var(--surface-overlay)', borderRadius: 8,
                        textAlign: 'center', color: 'var(--text-disabled)', fontSize: 12,
                      }}>
                        Locked
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

