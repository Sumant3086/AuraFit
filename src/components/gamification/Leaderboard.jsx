import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' };
const TIER_COLOR = { bronze: '#cd7f32', silver: '#c0c0c0', gold: '#ffd700', platinum: '#e5e4e2' };

export default function Leaderboard() {
  const { apiClient, user } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [lbRes, rankRes] = await Promise.all([
          apiClient.get(`/achievements/leaderboard?limit=20&period=${period}`),
          apiClient.get('/achievements/leaderboard/my-rank'),
        ]);
        setLeaders(lbRes.data.data);
        setMyRank(rankRes.data.data);
      } catch {
        toast.error('Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [period]);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', padding: '20px 16px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 800, margin: 0 }}>🏆 Leaderboard</h1>
          <p style={{ color: '#666', marginTop: 8 }}>Compete with fellow AuraFit members</p>
        </div>

        {/* My Rank Card */}
        {myRank && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{
            background: 'linear-gradient(135deg, rgba(157, 0, 255, 0.2), rgba(0, 212, 255, 0.1))',
            border: '1px solid #9d00ff', borderRadius: 16, padding: '20px 24px', marginBottom: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <p style={{ color: '#9d00ff', fontSize: 13, fontWeight: 700, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your Rank</p>
                <p style={{ color: '#fff', fontSize: 32, fontWeight: 800, margin: 0 }}>#{myRank.rank}</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#666', fontSize: 12, margin: '0 0 4px' }}>Points</p>
                <p style={{ color: '#ffd700', fontSize: 24, fontWeight: 700, margin: 0 }}>{myRank.points}</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#666', fontSize: 12, margin: '0 0 4px' }}>Top</p>
                <p style={{ color: '#00d4ff', fontSize: 24, fontWeight: 700, margin: 0 }}>{myRank.percentile}%</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Top 3 Podium */}
        {!loading && leaders.length >= 3 && (
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 12, marginBottom: 32 }}>
            {[leaders[1], leaders[0], leaders[2]].map((l, i) => {
              const rank = i === 0 ? 2 : i === 1 ? 1 : 3;
              const height = rank === 1 ? 140 : rank === 2 ? 110 : 90;
              return (
                <motion.div key={l.rank}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  style={{ textAlign: 'center', flex: rank === 1 ? '0 0 150px' : '0 0 120px' }}
                >
                  <div style={{ fontSize: rank === 1 ? 40 : 32, marginBottom: 8 }}>{MEDAL[rank]}</div>
                  <Avatar name={l.name} size={rank === 1 ? 52 : 40} />
                  <p style={{ color: '#fff', fontSize: 12, fontWeight: 600, margin: '8px 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.name}</p>
                  <p style={{ color: '#ffd700', fontSize: 13, fontWeight: 700, margin: 0 }}>{l.points} pts</p>
                  <div style={{
                    height, background: rank === 1 ? 'linear-gradient(180deg, #ffd700, #ff8c00)' : rank === 2 ? 'linear-gradient(180deg, #c0c0c0, #808080)' : 'linear-gradient(180deg, #cd7f32, #8b4513)',
                    borderRadius: '8px 8px 0 0', marginTop: 8,
                  }} />
                </motion.div>
              );
            })}
          </div>
        )}

        {/* List */}
        <div style={{ background: '#111', borderRadius: 16, border: '1px solid #222', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>Loading...</div>
          ) : leaders.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>No data yet. Start earning points!</div>
          ) : (
            leaders.map((l, idx) => (
              <motion.div key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                style={{
                  display: 'flex', alignItems: 'center', padding: '14px 20px', gap: 14,
                  borderBottom: idx < leaders.length - 1 ? '1px solid #1a1a1a' : 'none',
                  background: l.name === user?.name ? 'rgba(157, 0, 255, 0.08)' : 'transparent',
                }}
              >
                <div style={{ width: 32, textAlign: 'center', color: l.rank <= 3 ? '#ffd700' : '#666', fontWeight: 700, fontSize: l.rank <= 3 ? 20 : 15 }}>
                  {MEDAL[l.rank] || `#${l.rank}`}
                </div>
                <Avatar name={l.name} size={38} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: l.name === user?.name ? '#9d00ff' : '#fff', fontWeight: 600, margin: 0, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {l.name} {l.name === user?.name && '(You)'}
                  </p>
                  <div style={{ display: 'flex', gap: 12, marginTop: 2 }}>
                    <span style={{ color: '#ff6b35', fontSize: 12 }}>🔥 {l.streak} streak</span>
                    <span style={{ color: '#9d00ff', fontSize: 12 }}>🏅 {l.badges} badges</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: '#ffd700', fontWeight: 700, margin: 0 }}>{l.points}</p>
                  <p style={{ color: '#555', fontSize: 11, margin: 0 }}>points</p>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Referral prompt */}
        <div style={{ background: 'linear-gradient(135deg, #1a0a2e, #0a1a2e)', border: '1px solid #333', borderRadius: 16, padding: 24, marginTop: 24, textAlign: 'center' }}>
          <h3 style={{ color: '#fff', margin: '0 0 8px' }}>Climb Faster!</h3>
          <p style={{ color: '#666', fontSize: 14, marginBottom: 16 }}>Refer friends and earn 100 points per signup. Check-in daily for streak bonuses.</p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Chip>🎯 Check-in daily: +10 pts</Chip>
            <Chip>👥 Referral: +100 pts</Chip>
            <Chip>🏆 Achievement: +50-500 pts</Chip>
          </div>
        </div>
      </div>
    </div>
  );
}

const Avatar = ({ name, size = 40 }) => {
  const colors = ['#9d00ff', '#00d4ff', '#ff6b35', '#ffd700', '#00c853'];
  const color = colors[name?.charCodeAt(0) % colors.length] || '#9d00ff';
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, ${color}, ${color}88)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize: size * 0.4, flexShrink: 0,
    }}>
      {name?.[0]?.toUpperCase()}
    </div>
  );
};

const Chip = ({ children }) => (
  <span style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 20, padding: '4px 12px', color: '#ccc', fontSize: 12 }}>
    {children}
  </span>
);
