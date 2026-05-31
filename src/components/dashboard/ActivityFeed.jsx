import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const ACTIVITY_ICONS = {
  checkin: '📍',
  achievement: '🏅',
  workout: '💪',
  community_post: '💬',
  level_up: '⬆️',
  referral: '🎁',
  streak: '🔥',
  membership: '💎',
};

function generateMockFeed(user) {
  const names = ['Priya S.', 'Rahul M.', 'Ananya K.', 'Vikram J.', 'Meera P.', 'Arjun D.'];
  const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const minsAgo = (n) => new Date(Date.now() - n * 60000);

  return [
    { id: 1, type: 'checkin', user: user?.name?.split(' ')[0] || 'You', message: 'checked in to the gym', time: minsAgo(3), isMe: true },
    { id: 2, type: 'achievement', user: rand(names), message: 'earned the "Consistency King" badge 🏅', time: minsAgo(12) },
    { id: 3, type: 'streak', user: rand(names), message: 'hit a 15-day streak! 🔥', time: minsAgo(25) },
    { id: 4, type: 'community_post', user: rand(names), message: 'posted in the community: "New PR on bench press!"', time: minsAgo(41) },
    { id: 5, type: 'level_up', user: rand(names), message: 'reached Level 8! ⬆️', time: minsAgo(58) },
    { id: 6, type: 'workout', user: rand(names), message: 'completed an AI workout plan 💪', time: minsAgo(73) },
    { id: 7, type: 'checkin', user: rand(names), message: 'checked in to the gym', time: minsAgo(92) },
    { id: 8, type: 'referral', user: rand(names), message: 'referred a friend and earned 100 points 🎁', time: minsAgo(110) },
  ];
}

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function ActivityFeed() {
  const { user, apiClient } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to fetch real activity from social feed, fall back to mock data
    const load = async () => {
      try {
        const res = await apiClient.get('/social/feed?limit=5');
        const posts = (res.data.data || []).map(p => ({
          id: p._id,
          type: p.type === 'achievement' ? 'achievement' : 'community_post',
          user: p.userName,
          message: p.content.slice(0, 60) + (p.content.length > 60 ? '...' : ''),
          time: p.createdAt,
          isMe: String(p.userId) === String(user?._id),
        }));

        const combined = [...generateMockFeed(user).slice(0, 3), ...posts].sort(
          (a, b) => new Date(b.time) - new Date(a.time)
        ).slice(0, 8);
        setActivities(combined);
      } catch {
        setActivities(generateMockFeed(user));
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[1,2,3].map(i => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1a1a1a', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ width: '70%', height: 10, background: '#1a1a1a', borderRadius: 4, marginBottom: 4 }} />
              <div style={{ width: '40%', height: 8, background: '#1a1a1a', borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: 0 }}>Live Activity 🌐</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00c853', animation: 'pulse 2s infinite' }} />
          <span style={{ color: '#00c853', fontSize: 11 }}>LIVE</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <AnimatePresence>
          {activities.map((activity, i) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              style={{
                display: 'flex', gap: 10, alignItems: 'center',
                padding: '10px 12px', borderRadius: 10,
                background: activity.isMe ? '#1a0a2e' : 'transparent',
                border: activity.isMe ? '1px solid #9d00ff22' : '1px solid transparent',
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: activity.isMe ? 'linear-gradient(135deg, #9d00ff, #00d4ff)' : '#1a1a1a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16,
              }}>
                {ACTIVITY_ICONS[activity.type] || '⚡'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: '#ccc', fontSize: 13, margin: 0, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <span style={{ color: activity.isMe ? '#9d00ff' : '#fff', fontWeight: 700 }}>{activity.user}</span>
                  {' '}{activity.message}
                </p>
                <p style={{ color: '#444', fontSize: 11, margin: '2px 0 0' }}>{timeAgo(activity.time)}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </div>
  );
}
