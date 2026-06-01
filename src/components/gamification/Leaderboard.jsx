import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const PERIODS = [
  { key: 'all', label: 'All Time' },
  { key: 'monthly', label: 'This Month' },
  { key: 'weekly', label: 'This Week' },
];

const RANK_COLORS = {
  1: { bg: 'linear-gradient(135deg, #f59e0b, #d97706)', glow: 'rgba(245,158,11,0.3)', medal: '🥇', label: 'Gold' },
  2: { bg: 'linear-gradient(135deg, #94a3b8, #64748b)', glow: 'rgba(148,163,184,0.2)', medal: '🥈', label: 'Silver' },
  3: { bg: 'linear-gradient(135deg, #cd7c54, #9a6040)', glow: 'rgba(205,124,84,0.2)', medal: '🥉', label: 'Bronze' },
};

function Avatar({ name, size = 40, ring }) {
  const palette = ['#7c3aed', '#0891b2', '#d97706', '#059669', '#db2777'];
  const bg = palette[(name?.charCodeAt(0) || 0) % palette.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(135deg, ${bg}, ${bg}88)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 800, fontSize: Math.round(size * 0.38),
      boxShadow: ring ? `0 0 0 3px ${ring}, 0 0 0 4px var(--surface-raised)` : 'none',
    }}>
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  );
}

export default function Leaderboard() {
  const { apiClient, user } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [lbRes, rankRes] = await Promise.all([
        apiClient.get(`/achievements/leaderboard?limit=20&period=${period}`),
        apiClient.get('/achievements/leaderboard/my-rank'),
      ]);
      setLeaders(lbRes.data.data || []);
      setMyRank(rankRes.data.data);
    } catch {
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }, [apiClient, period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const top3 = leaders.slice(0, 3);
  // Podium order: 2nd | 1st | 3rd
  const podiumOrder = top3.length >= 3
    ? [{ ...top3[1], rank: 2 }, { ...top3[0], rank: 1 }, { ...top3[2], rank: 3 }]
    : [];

  return (
    <div style={{ background: 'var(--surface-bg)', minHeight: '100vh', paddingBottom: 80 }}>

      {/* Hero */}
      <div style={{
        background: 'radial-gradient(ellipse 100% 60% at 50% 0%, rgba(245,158,11,0.08) 0%, transparent 70%)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: 'var(--space-10) var(--space-4) var(--space-8)',
        textAlign: 'center',
      }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ fontSize: 48, marginBottom: 'var(--space-3)', lineHeight: 1 }}>🏆</div>
          <h1 style={{
            color: 'var(--text-primary)', fontSize: 'var(--text-4xl)', fontWeight: 800,
            margin: '0 0 var(--space-2)', letterSpacing: '-0.02em', lineHeight: 1.1,
          }}>
            Leaderboard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-base)', margin: '0 0 var(--space-6)' }}>
            Compete, earn points, and claim your rank
          </p>

          {/* Period filter */}
          <div style={{ display: 'inline-flex', background: 'var(--surface-raised)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-pill)', padding: 3, gap: 2 }}>
            {PERIODS.map(p => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                style={{
                  padding: '7px 18px', borderRadius: 'var(--radius-pill)', border: 'none',
                  background: period === p.key ? 'var(--brand-gradient)' : 'transparent',
                  color: period === p.key ? '#fff' : 'var(--text-muted)',
                  fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer',
                  transition: 'all var(--duration-fast)',
                  boxShadow: period === p.key ? 'var(--shadow-glow-purple)' : 'none',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 var(--space-4) var(--space-6)' }}>

        {/* My rank card */}
        <AnimatePresence>
          {myRank && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'linear-gradient(135deg, rgba(157,0,255,0.1) 0%, rgba(0,212,255,0.06) 100%)',
                border: '1px solid var(--border-accent)',
                borderRadius: 'var(--radius-xl)', padding: 'var(--space-5)',
                marginBottom: 'var(--space-5)', marginTop: 'var(--space-5)',
                display: 'flex', gap: 'var(--space-5)', alignItems: 'center', flexWrap: 'wrap',
              }}
            >
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700 }}>Your rank</p>
                <p style={{ color: 'var(--text-primary)', fontSize: 44, fontWeight: 800, margin: 0, lineHeight: 1, letterSpacing: '-0.03em' }}>
                  #{myRank.rank}
                </p>
              </div>
              <div style={{ width: 1, height: 40, background: 'var(--border-default)' }} />
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', margin: '0 0 4px' }}>Points</p>
                <p style={{ color: 'var(--color-gold)', fontSize: 'var(--text-2xl)', fontWeight: 800, margin: 0 }}>{(myRank.points || 0).toLocaleString()}</p>
              </div>
              <div style={{ width: 1, height: 40, background: 'var(--border-default)' }} />
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', margin: '0 0 4px' }}>Top</p>
                <p style={{ color: 'var(--brand-cyan)', fontSize: 'var(--text-2xl)', fontWeight: 800, margin: 0 }}>{myRank.percentile}%</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Podium */}
        {!loading && podiumOrder.length === 3 && (
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 'var(--space-3)' }}>
              {podiumOrder.map((l, i) => {
                const rc = RANK_COLORS[l.rank];
                const isFirst = l.rank === 1;
                return (
                  <motion.div
                    key={l.rank}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.12, type: 'spring', bounce: 0.3 }}
                    style={{ textAlign: 'center', flex: isFirst ? '0 0 160px' : '0 0 130px' }}
                  >
                    <div style={{ marginBottom: 'var(--space-2)' }}>
                      <Avatar name={l.name} size={isFirst ? 56 : 44} ring={isFirst ? 'rgba(245,158,11,0.6)' : undefined} />
                    </div>
                    <p style={{
                      color: 'var(--text-primary)', fontSize: isFirst ? 'var(--text-sm)' : 'var(--text-xs)',
                      fontWeight: 700, margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {l.name?.split(' ')[0]}
                    </p>
                    <p style={{ color: 'var(--color-gold)', fontSize: 'var(--text-xs)', fontWeight: 700, margin: '0 0 var(--space-2)' }}>
                      {(l.points || 0).toLocaleString()} pts
                    </p>

                    {/* Podium bar */}
                    <div style={{
                      height: isFirst ? 100 : l.rank === 2 ? 72 : 56,
                      background: rc.bg,
                      borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                      boxShadow: `0 -4px 20px ${rc.glow}`,
                      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                      paddingTop: 10,
                    }}>
                      <span style={{ fontSize: isFirst ? 28 : 22 }}>{rc.medal}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Full list */}
        <div style={{
          background: 'var(--surface-raised)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-card)',
        }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[1,2,3,4,5].map(i => (
                <div key={i} style={{ display: 'flex', gap: 'var(--space-3)', padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--surface-high)', animation: 'pulse 1.5s infinite', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ width: '55%', height: 12, background: 'var(--surface-high)', borderRadius: 4, marginBottom: 6, animation: 'pulse 1.5s infinite' }} />
                    <div style={{ width: '35%', height: 10, background: 'var(--surface-high)', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : leaders.length === 0 ? (
            <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 'var(--space-3)' }}>🏆</div>
              <p style={{ color: 'var(--text-secondary)', fontWeight: 600, margin: '0 0 4px' }}>No rankings yet</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', margin: 0 }}>Check in and earn points to appear here!</p>
            </div>
          ) : (
            leaders.map((l, idx) => {
              const isMe = l.name === user?.name;
              const rankColor = RANK_COLORS[l.rank];
              return (
                <motion.div
                  key={`${l.name}-${idx}`}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    display: 'flex', alignItems: 'center',
                    padding: 'var(--space-4) var(--space-5)',
                    gap: 'var(--space-3)',
                    borderBottom: idx < leaders.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    background: isMe ? 'var(--brand-purple-dim)' : 'transparent',
                  }}
                >
                  {/* Rank */}
                  <div style={{
                    width: 32, textAlign: 'center', flexShrink: 0,
                    fontSize: rankColor ? 20 : 'var(--text-sm)',
                    color: rankColor ? 'var(--color-gold)' : 'var(--text-muted)',
                    fontWeight: 700,
                  }}>
                    {rankColor ? rankColor.medal : `#${l.rank}`}
                  </div>

                  <Avatar name={l.name} size={38} ring={isMe ? 'var(--brand-purple)' : undefined} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      color: isMe ? 'var(--brand-purple)' : 'var(--text-primary)',
                      fontWeight: isMe ? 700 : 600,
                      margin: '0 0 3px', fontSize: 'var(--text-sm)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {l.name}{isMe && <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}> (you)</span>}
                    </p>
                    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                      {l.streak > 0 && <span style={{ color: 'var(--color-warning)', fontSize: 'var(--text-xs)' }}>🔥 {l.streak}</span>}
                      {l.badges > 0 && <span style={{ color: 'var(--brand-purple)', fontSize: 'var(--text-xs)' }}>🏅 {l.badges}</span>}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ color: 'var(--color-gold)', fontWeight: 700, margin: 0, fontSize: 'var(--text-base)' }}>
                      {(l.points || 0).toLocaleString()}
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', margin: 0 }}>pts</p>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* How to earn points */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(157,0,255,0.06) 0%, rgba(0,212,255,0.03) 100%)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-xl)', padding: 'var(--space-5)',
          marginTop: 'var(--space-5)', textAlign: 'center',
        }}>
          <h3 style={{ color: 'var(--text-primary)', fontSize: 'var(--text-base)', fontWeight: 700, margin: '0 0 var(--space-4)' }}>
            Earn more points
          </h3>
          <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { icon: '📍', text: 'Check-in', pts: '+10' },
              { icon: '👥', text: 'Referral', pts: '+100' },
              { icon: '🏅', text: 'Achievement', pts: '+50–500' },
              { icon: '✅', text: 'Onboarding', pts: '+100' },
            ].map(item => (
              <div key={item.text} style={{
                background: 'var(--surface-overlay)', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                minWidth: 70,
              }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', fontWeight: 500 }}>{item.text}</span>
                <span style={{ color: 'var(--color-gold)', fontSize: 'var(--text-xs)', fontWeight: 700 }}>{item.pts}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
