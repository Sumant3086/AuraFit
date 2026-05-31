import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const TIER_COLORS = { bronze: '#cd7f32', silver: '#c0c0c0', gold: '#ffd700', platinum: '#b9f2ff' };
const CATEGORY_LABELS = {
  attendance: '📅 Attendance', workout: '💪 Workout', nutrition: '🥗 Nutrition',
  social: '👥 Social', milestone: '🎯 Milestone', streak: '🔥 Streak', referral: '🤝 Referral',
};

export default function Achievements() {
  const { apiClient, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showEarned, setShowEarned] = useState(false);

  useEffect(() => {
    apiClient.get('/achievements/my')
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to load achievements'))
      .finally(() => setLoading(false));
  }, []);

  const achievements = data?.data || [];
  const stats = data?.stats || {};

  const categories = ['all', ...new Set(achievements.map(a => a.category))];
  const filtered = achievements
    .filter(a => filter === 'all' || a.category === filter)
    .filter(a => !showEarned || a.earned)
    .sort((a, b) => (b.earned ? 1 : 0) - (a.earned ? 1 : 0));

  const earnedCount = achievements.filter(a => a.earned).length;
  const totalPoints = stats.points || 0;
  const level = Math.floor(totalPoints / 100) + 1;
  const pointsToNextLevel = (level * 100) - totalPoints;

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', padding: '20px 16px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 800, margin: 0 }}>🏅 Achievements</h1>
          <p style={{ color: '#666', marginTop: 8 }}>Track your milestones and unlock rewards</p>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 24 }}>
          <StatCard label="Level" value={level} icon="⭐" color="#ffd700" />
          <StatCard label="Points" value={totalPoints} icon="💎" color="#9d00ff" />
          <StatCard label="Earned" value={`${earnedCount}/${achievements.length}`} icon="🏅" color="#00c853" />
          <StatCard label="Streak" value={`${stats.currentStreak || 0}d`} icon="🔥" color="#ff6b35" />
        </div>

        {/* Level progress */}
        <div style={{ background: '#111', border: '1px solid #222', borderRadius: 16, padding: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ color: '#fff', fontWeight: 600 }}>Level {level}</span>
            <span style={{ color: '#666', fontSize: 13 }}>{pointsToNextLevel} pts to Level {level + 1}</span>
          </div>
          <div style={{ height: 8, background: '#222', borderRadius: 4, overflow: 'hidden' }}>
            <motion.div
              style={{ height: '100%', background: 'linear-gradient(90deg, #9d00ff, #00d4ff)', borderRadius: 4 }}
              animate={{ width: `${((totalPoints % 100) / 100) * 100}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} style={{
              padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              background: filter === cat ? 'linear-gradient(135deg, #9d00ff, #00d4ff)' : '#1a1a1a',
              color: filter === cat ? '#fff' : '#888',
              transition: 'all 0.2s',
            }}>
              {cat === 'all' ? 'All' : CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
          <button onClick={() => setShowEarned(!showEarned)} style={{
            marginLeft: 'auto', padding: '6px 14px', borderRadius: 20, border: `1px solid ${showEarned ? '#9d00ff' : '#333'}`,
            background: 'transparent', color: showEarned ? '#9d00ff' : '#666', cursor: 'pointer', fontSize: 13,
          }}>
            {showEarned ? '✓ Earned only' : 'Show earned only'}
          </button>
        </div>

        {/* Achievement Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {filtered.map((ach, i) => (
            <motion.div
              key={ach.key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              style={{
                background: ach.earned ? '#111' : '#0d0d0d',
                border: `1px solid ${ach.earned ? TIER_COLORS[ach.tier] + '60' : '#1a1a1a'}`,
                borderRadius: 14, padding: 16, position: 'relative', overflow: 'hidden',
                opacity: ach.earned ? 1 : 0.5,
              }}
            >
              {ach.earned && (
                <div style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: '50%', background: '#00c853' }} />
              )}
              <div style={{ fontSize: 36, marginBottom: 10 }}>{ach.icon}</div>
              <div style={{
                display: 'inline-block', marginBottom: 8, padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700,
                background: `${TIER_COLORS[ach.tier]}22`, color: TIER_COLORS[ach.tier],
              }}>
                {ach.tier?.toUpperCase()}
              </div>
              <h3 style={{ color: ach.earned ? '#fff' : '#555', fontSize: 15, fontWeight: 700, margin: '0 0 6px' }}>{ach.name}</h3>
              <p style={{ color: '#555', fontSize: 13, margin: '0 0 10px', lineHeight: 1.4 }}>{ach.description}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: '#ffd700', fontSize: 13, fontWeight: 600 }}>+{ach.points} pts</span>
                {ach.earned && ach.earnedAt && (
                  <span style={{ color: '#555', fontSize: 11 }}>
                    {new Date(ach.earnedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              {!ach.earned && (
                <div style={{ marginTop: 10, padding: '4px 10px', background: '#1a1a1a', borderRadius: 8, textAlign: 'center', color: '#444', fontSize: 12 }}>
                  🔒 Locked
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#444' }}>
            <p style={{ fontSize: 48, marginBottom: 12 }}>🏅</p>
            <p style={{ fontSize: 16 }}>No achievements in this category yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

const StatCard = ({ label, value, icon, color }) => (
  <div style={{ background: '#111', border: '1px solid #222', borderRadius: 12, padding: '16px 12px', textAlign: 'center' }}>
    <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
    <div style={{ color, fontSize: 22, fontWeight: 800 }}>{value}</div>
    <div style={{ color: '#555', fontSize: 12, marginTop: 2 }}>{label}</div>
  </div>
);

const LoadingScreen = () => (
  <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ color: '#9d00ff', fontSize: 18 }}>Loading achievements...</div>
  </div>
);
