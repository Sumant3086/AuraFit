import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  LuQrCode, LuDumbbell, LuSalad, LuCalendar, LuUsers,
  LuTrophy, LuFlame, LuDownload, LuChevronRight, LuAward,
} from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';
import AnnouncementBanner from '../announcements/AnnouncementBanner';
import ActivityFeed from './ActivityFeed';
import toast from 'react-hot-toast';

const ACTIONS = [
  { label: 'Check-In',     icon: LuQrCode,    path: '/checkin' },
  { label: 'Workout',      icon: LuDumbbell,  path: '/features' },
  { label: 'Nutrition',    icon: LuSalad,     path: '/features' },
  { label: 'Book',         icon: LuCalendar,  path: '/book-trainer' },
  { label: 'Community',    icon: LuUsers,     path: '/community' },
  { label: 'Leaderboard',  icon: LuTrophy,    path: '/leaderboard' },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const card = {
  background: 'var(--surface-2)',
  border: '1px solid var(--border-1)',
  borderRadius: 'var(--r-xl)',
};

export default function MemberDashboard() {
  const { user, apiClient } = useAuth();
  const [stats, setStats]             = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [insight, setInsight]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [checkedIn, setCheckedIn]     = useState(false);
  const [downloading, setDownloading] = useState(false);

  const level    = Math.floor((user?.points || 0) / 100) + 1;
  const levelPct = (user?.points || 0) % 100;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [attRes, achRes, insRes] = await Promise.all([
          apiClient.get('/attendance/stats/me').catch(() => ({ data: { data: null } })),
          apiClient.get('/achievements/my').catch(() => ({ data: { data: [] } })),
          apiClient.get('/ai-chat/weekly-insight').catch(() => ({ data: { data: null } })),
        ]);
        if (cancelled) return;
        setStats(attRes.data.data);
        setAchievements((achRes.data.data || []).filter(a => a.earned).slice(0, 4));
        setInsight(insRes.data.data);
      } catch {}
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [apiClient]);

  const handleCheckIn = async () => {
    if (checkedIn) return;
    try {
      const res = await apiClient.post('/attendance/self-checkin');
      setCheckedIn(true);
      toast.success(`Checked in. +${res.data.pointsEarned} points.`);
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg?.includes('Already')) { setCheckedIn(true); toast('Already checked in today.'); }
      else toast.error('Check-in failed.');
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await apiClient.get('/reports/progress', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url; a.download = `aurafit-${new Date().toISOString().slice(0,10)}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('Report unavailable.'); }
    setDownloading(false);
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 80 }}>

      {/* Header */}
      <div style={{
        borderBottom: '1px solid var(--border-1)',
        padding: 'var(--sp-8) clamp(16px,4vw,32px) var(--sp-6)',
      }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto' }}>
          <AnnouncementBanner gymId={user?.gymId} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--sp-4)', flexWrap: 'wrap', marginTop: 'var(--sp-3)' }}>
            <div>
              <p style={{ color: 'var(--text-3)', fontSize: 'var(--text-sm)', margin: '0 0 4px' }}>
                {greeting()}
              </p>
              <h1 style={{
                fontSize: 'clamp(24px,4vw,32px)',
                fontWeight: 'var(--weight-bold)',
                letterSpacing: 'var(--tracking-snug)',
                color: 'var(--text-1)',
                margin: 0,
              }}>
                {user?.name?.split(' ')[0]}
              </h1>

              {/* Level + streak inline */}
              <div style={{ display: 'flex', gap: 'var(--sp-3)', marginTop: 'var(--sp-2)', flexWrap: 'wrap' }}>
                <span style={{
                  background: 'var(--accent-dim)', color: 'var(--accent)',
                  border: '1px solid var(--accent-border)',
                  borderRadius: 'var(--r-pill)', padding: '3px 10px',
                  fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)',
                }}>
                  Level {level}
                </span>
                {(user?.currentStreak || 0) > 0 && (
                  <span style={{
                    background: 'var(--amber-dim)', color: 'var(--amber)',
                    border: '1px solid rgba(245,158,11,0.2)',
                    borderRadius: 'var(--r-pill)', padding: '3px 10px',
                    fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <LuFlame size={11} strokeWidth={1.5} />
                    {user.currentStreak} day streak
                  </span>
                )}
              </div>
            </div>

            {/* Level progress */}
            <div style={{ minWidth: 140 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: 'var(--text-3)', fontSize: 'var(--text-xs)' }}>Lv {level}</span>
                <span style={{ color: 'var(--text-3)', fontSize: 'var(--text-xs)' }}>{100 - levelPct} to Lv {level + 1}</span>
              </div>
              <div style={{ height: 3, background: 'var(--surface-3)', borderRadius: 'var(--r-pill)', overflow: 'hidden' }}>
                <motion.div
                  style={{ height: '100%', background: 'var(--accent)', borderRadius: 'var(--r-pill)' }}
                  animate={{ width: `${levelPct}%` }}
                  transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <p style={{ color: 'var(--text-3)', fontSize: 'var(--text-xs)', marginTop: 4, textAlign: 'right' }}>
                {user?.points || 0} pts
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--sp-6) clamp(16px,4vw,32px)' }}>

        {/* Stats */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: 'var(--border-1)', ...card, overflow: 'hidden', marginBottom: 'var(--sp-4)' }}>
            {[
              { label: 'This month', value: stats.thisMonth ?? 0 },
              { label: 'This week',  value: stats.thisWeek  ?? 0 },
              { label: 'All time',   value: stats.total     ?? 0 },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--surface-2)', padding: 'var(--sp-4)', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-1)', fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-bold)', letterSpacing: 'var(--tracking-snug)', margin: 0 }}>
                  {s.value}
                </p>
                <p style={{ color: 'var(--text-3)', fontSize: 'var(--text-xs)', margin: '3px 0 0' }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Check-in button */}
        <motion.button
          whileTap={checkedIn ? {} : { scale: 0.98 }}
          onClick={handleCheckIn}
          disabled={checkedIn}
          style={{
            width: '100%', padding: 'var(--sp-4)',
            marginBottom: 'var(--sp-4)',
            borderRadius: 'var(--r-xl)', border: 'none',
            background: checkedIn ? 'var(--surface-2)' : 'var(--text-1)',
            color: checkedIn ? 'var(--text-3)' : 'var(--bg)',
            fontSize: 'var(--text-base)', fontWeight: 'var(--weight-semibold)',
            cursor: checkedIn ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <LuQrCode size={16} strokeWidth={1.5} />
          {checkedIn ? 'Checked in today' : 'Check in'}
        </motion.button>

        {/* Quick actions */}
        <div style={{ marginBottom: 'var(--sp-6)' }}>
          <p style={{
            color: 'var(--text-3)', fontSize: 'var(--text-xs)',
            fontWeight: 'var(--weight-medium)', letterSpacing: 'var(--tracking-wider)',
            textTransform: 'uppercase', margin: '0 0 var(--sp-3)',
          }}>
            Quick access
          </p>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
            gap: 1, background: 'var(--border-1)', ...card, overflow: 'hidden',
          }}>
            {ACTIONS.map(a => (
              <Link key={a.label} to={a.path} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ background: 'var(--surface-3)' }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    background: 'var(--surface-2)', padding: 'var(--sp-4) var(--sp-3)',
                    textAlign: 'center', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--sp-2)',
                    transition: 'background var(--duration-fast)',
                  }}
                >
                  <a.icon size={18} color="var(--text-2)" strokeWidth={1.5} />
                  <span style={{ color: 'var(--text-2)', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)' }}>
                    {a.label}
                  </span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

        {/* AI insight */}
        {insight && (
          <div style={{ ...card, padding: 'var(--sp-5)', marginBottom: 'var(--sp-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
              <p style={{ color: 'var(--text-3)', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', margin: 0 }}>
                This week
              </p>
              <button
                onClick={handleDownload}
                disabled={downloading}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'none', border: '1px solid var(--border-2)',
                  borderRadius: 'var(--r-md)', padding: '4px 10px',
                  color: 'var(--text-2)', cursor: 'pointer', fontSize: 'var(--text-xs)',
                }}
              >
                <LuDownload size={12} strokeWidth={1.5} />
                PDF
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              {[
                { text: insight.workoutTip },
                { text: insight.nutritionTip },
              ].map((t, i) => (
                <p key={i} style={{
                  color: 'var(--text-2)', fontSize: 'var(--text-sm)',
                  lineHeight: 'var(--leading-snug)', margin: 0,
                  paddingLeft: 'var(--sp-4)',
                  borderLeft: '2px solid var(--border-2)',
                }}>
                  {t.text}
                </p>
              ))}
              <p style={{
                color: 'var(--text-1)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)',
                margin: 0, paddingLeft: 'var(--sp-4)',
                borderLeft: '2px solid var(--accent)',
              }}>
                Goal: {insight.weeklyGoal}
              </p>
            </div>
          </div>
        )}

        {/* Achievements */}
        {achievements.length > 0 && (
          <div style={{ marginBottom: 'var(--sp-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-3)' }}>
              <p style={{ color: 'var(--text-3)', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', margin: 0 }}>
                Recent achievements
              </p>
              <Link to="/achievements" style={{ color: 'var(--text-3)', fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: 3 }}>
                All <LuChevronRight size={12} strokeWidth={1.5} />
              </Link>
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(2,1fr)',
              gap: 1, background: 'var(--border-1)', ...card, overflow: 'hidden',
            }}>
              {achievements.map(a => (
                <div key={a.key} style={{
                  background: 'var(--surface-2)', padding: 'var(--sp-4)',
                  display: 'flex', alignItems: 'center', gap: 'var(--sp-3)',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 'var(--r-md)', flexShrink: 0,
                    background: 'var(--amber-dim)', border: '1px solid rgba(245,158,11,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <LuAward size={16} color="var(--amber)" strokeWidth={1.5} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ color: 'var(--text-1)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {a.name}
                    </p>
                    <p style={{ color: 'var(--amber)', fontSize: 'var(--text-xs)', margin: 0 }}>+{a.points} pts</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Referral */}
        {user?.referralCode && (
          <div style={{ ...card, padding: 'var(--sp-5)', marginBottom: 'var(--sp-4)' }}>
            <p style={{ color: 'var(--text-3)', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', margin: '0 0 var(--sp-3)' }}>
              Refer a friend
            </p>
            <p style={{ color: 'var(--text-2)', fontSize: 'var(--text-sm)', margin: '0 0 var(--sp-3)' }}>
              Share your code. Both of you earn 100 points.
            </p>
            <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
              <div style={{
                flex: 1, background: 'var(--surface-3)', border: '1px solid var(--border-2)',
                borderRadius: 'var(--r-md)', padding: 'var(--sp-2) var(--sp-4)',
                fontFamily: 'var(--font-mono)', fontSize: 'var(--text-base)',
                fontWeight: 'var(--weight-bold)', color: 'var(--text-1)', letterSpacing: '0.12em',
              }}>
                {user.referralCode}
              </div>
              <button
                onClick={() => { navigator.clipboard?.writeText(user.referralCode); toast.success('Copied.'); }}
                style={{
                  padding: 'var(--sp-2) var(--sp-4)',
                  background: 'var(--text-1)', color: 'var(--bg)',
                  border: 'none', borderRadius: 'var(--r-md)',
                  fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-sm)',
                  cursor: 'pointer',
                }}
              >
                Copy
              </button>
            </div>
          </div>
        )}

        {/* Activity */}
        <div style={{ ...card, padding: 'var(--sp-5)' }}>
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}

