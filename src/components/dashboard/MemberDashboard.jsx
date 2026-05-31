import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AnnouncementBanner from '../announcements/AnnouncementBanner';
import toast from 'react-hot-toast';

const QUICK_ACTIONS = [
  { label: 'Check-In', icon: '📱', path: '/checkin', color: '#9d00ff', desc: 'QR Check-In' },
  { label: 'Workout', icon: '💪', path: '/features', color: '#00d4ff', desc: 'AI Generate' },
  { label: 'Nutrition', icon: '🥗', path: '/features', color: '#00c853', desc: 'Meal Plan' },
  { label: 'Book Trainer', icon: '👨‍💼', path: '/book-trainer', color: '#ffd700', desc: 'Schedule' },
  { label: 'Progress', icon: '📊', path: '/features', color: '#ff6b35', desc: 'Track Body' },
  { label: 'Leaderboard', icon: '🏆', path: '/leaderboard', color: '#ff1493', desc: 'Rankings' },
];

export default function MemberDashboard() {
  const { user, apiClient } = useAuth();
  const [stats, setStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkedInToday, setCheckedInToday] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [attRes, achRes] = await Promise.all([
          apiClient.get('/attendance/stats/me').catch(() => ({ data: { data: null } })),
          apiClient.get('/achievements/my').catch(() => ({ data: { data: [] } })),
        ]);
        setStats(attRes.data.data);
        const earned = achRes.data.data?.filter(a => a.earned) || [];
        setAchievements(earned.slice(0, 6));
      } catch {}
      setLoading(false);
    };
    loadDashboard();
  }, []);

  const handleQuickCheckIn = async () => {
    if (checkedInToday) return;
    try {
      const res = await apiClient.post('/attendance/self-checkin');
      setCheckedInToday(true);
      toast.success(`✅ Checked in! +${res.data.pointsEarned} pts`);
      if (res.data.streak > 1) toast(`🔥 ${res.data.streak} day streak!`, { icon: '🔥' });
    } catch (err) {
      if (err.response?.data?.message?.includes('Already')) {
        setCheckedInToday(true);
        toast('Already checked in today! 👍');
      } else {
        toast.error('Check-in failed');
      }
    }
  };

  const level = Math.floor((user?.points || 0) / 100) + 1;
  const levelProgress = ((user?.points || 0) % 100);
  const greeting = getGreeting();

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', fontFamily: 'Arial, sans-serif', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #0a1a2e 100%)', padding: '32px 20px 60px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{ color: '#666', fontSize: 14, margin: '0 0 4px' }}>{greeting}</p>
              <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 800, margin: '0 0 4px' }}>{user?.name?.split(' ')[0]} 👋</h1>
              <p style={{ color: '#9d00ff', margin: 0, fontSize: 15 }}>Level {level} • {user?.points || 0} points</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: '#ff6b35', fontSize: 22, fontWeight: 800, margin: '0 0 4px' }}>🔥 {user?.currentStreak || 0}</p>
              <p style={{ color: '#666', fontSize: 12, margin: 0 }}>Day Streak</p>
            </div>
          </div>

          {/* Level progress bar */}
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: '#555', fontSize: 12 }}>Level {level}</span>
              <span style={{ color: '#555', fontSize: 12 }}>Level {level + 1}</span>
            </div>
            <div style={{ height: 6, background: '#1a1a2e', borderRadius: 3, overflow: 'hidden' }}>
              <motion.div
                style={{ height: '100%', background: 'linear-gradient(90deg, #9d00ff, #00d4ff)', borderRadius: 3 }}
                animate={{ width: `${levelProgress}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            </div>
            <p style={{ color: '#555', fontSize: 11, margin: '4px 0 0', textAlign: 'center' }}>
              {100 - levelProgress} points to next level
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: '-32px auto 0', padding: '0 16px' }}>
        {/* Announcements */}
        <div style={{ marginBottom: 8 }}>
          <AnnouncementBanner gymId={user?.gymId} />
        </div>

        {/* Stats Cards */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
            <StatCard label="This Month" value={stats.thisMonth} icon="📅" />
            <StatCard label="This Week" value={stats.thisWeek} icon="🗓️" />
            <StatCard label="Total Visits" value={stats.total} icon="💯" />
          </div>
        )}

        {/* Check-in CTA */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleQuickCheckIn}
          style={{
            width: '100%', padding: '16px', borderRadius: 14, border: 'none', cursor: checkedInToday ? 'default' : 'pointer',
            background: checkedInToday ? '#111' : 'linear-gradient(135deg, #9d00ff, #00d4ff)',
            color: checkedInToday ? '#555' : '#fff', fontSize: 16, fontWeight: 700, marginBottom: 24,
            boxShadow: checkedInToday ? 'none' : '0 8px 32px rgba(157, 0, 255, 0.3)',
          }}
        >
          {checkedInToday ? '✅ Checked in today • Great job!' : '📍 Check In Now & Earn Points'}
        </motion.button>

        {/* Quick Actions Grid */}
        <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: '0 0 14px' }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 28 }}>
          {QUICK_ACTIONS.map(action => (
            <Link key={action.label} to={action.path} style={{ textDecoration: 'none' }}>
              <motion.div whileTap={{ scale: 0.95 }} style={{
                background: '#111', border: '1px solid #1a1a1a', borderRadius: 14, padding: '16px 12px',
                textAlign: 'center', cursor: 'pointer', transition: 'border 0.2s',
              }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{action.icon}</div>
                <p style={{ color: '#fff', fontWeight: 700, margin: '0 0 2px', fontSize: 13 }}>{action.label}</p>
                <p style={{ color: '#555', fontSize: 11, margin: 0 }}>{action.desc}</p>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Recent Achievements */}
        {achievements.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: 0 }}>Recent Achievements</h2>
              <Link to="/achievements" style={{ color: '#9d00ff', fontSize: 13, textDecoration: 'none' }}>View all →</Link>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {achievements.map(a => (
                <div key={a.key} style={{
                  background: '#111', border: '1px solid #222', borderRadius: 12, padding: '10px 14px',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span style={{ fontSize: 24 }}>{a.icon}</span>
                  <div>
                    <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: 0 }}>{a.name}</p>
                    <p style={{ color: '#ffd700', fontSize: 12, margin: 0 }}>+{a.points} pts</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Referral Card */}
        {user?.referralCode && (
          <div style={{
            background: 'linear-gradient(135deg, #1a0a2e, #0a1a2e)', border: '1px solid #333',
            borderRadius: 16, padding: 20, marginBottom: 28,
          }}>
            <h3 style={{ color: '#fff', margin: '0 0 8px' }}>🎁 Refer & Earn</h3>
            <p style={{ color: '#666', fontSize: 14, margin: '0 0 16px' }}>Invite friends and earn 100 points each!</p>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ flex: 1, background: '#111', border: '1px solid #333', borderRadius: 8, padding: '10px 14px', color: '#9d00ff', fontFamily: 'monospace', fontSize: 18, fontWeight: 800, letterSpacing: '3px' }}>
                {user.referralCode}
              </div>
              <button onClick={() => { navigator.clipboard?.writeText(user.referralCode); toast.success('Referral code copied!'); }}
                style={{ padding: '10px 16px', background: 'linear-gradient(135deg, #9d00ff, #00d4ff)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontWeight: 700, whiteSpace: 'nowrap' }}>
                Copy
              </button>
            </div>
          </div>
        )}

        {/* Membership status */}
        <div style={{ background: '#111', border: '1px solid #222', borderRadius: 16, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: '#888', fontSize: 13, margin: '0 0 4px' }}>Membership</p>
              <p style={{ color: '#fff', fontSize: 20, fontWeight: 800, margin: 0 }}>{user?.membership || 'None'}</p>
              {user?.membershipEndDate && (
                <p style={{ color: '#555', fontSize: 13, margin: '4px 0 0' }}>
                  Expires: {new Date(user.membershipEndDate).toLocaleDateString()}
                </p>
              )}
            </div>
            {user?.membership === 'None' && (
              <Link to="/pricing" style={{ textDecoration: 'none' }}>
                <button style={{ padding: '10px 18px', background: 'linear-gradient(135deg, #9d00ff, #00d4ff)', border: 'none', borderRadius: 10, color: '#fff', cursor: 'pointer', fontWeight: 700 }}>
                  Upgrade
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ label, value, icon }) => (
  <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 12, padding: 14, textAlign: 'center' }}>
    <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
    <div style={{ color: '#9d00ff', fontSize: 22, fontWeight: 800 }}>{value || 0}</div>
    <div style={{ color: '#555', fontSize: 11 }}>{label}</div>
  </div>
);

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning,';
  if (h < 17) return 'Good afternoon,';
  return 'Good evening,';
};
