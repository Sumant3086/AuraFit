import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AnnouncementBanner from '../announcements/AnnouncementBanner';
import ActivityFeed from './ActivityFeed';
import toast from 'react-hot-toast';

const QUICK_ACTIONS = [
  { label: 'Check-In', icon: '📍', path: '/checkin', desc: 'QR scan' },
  { label: 'Workout', icon: '🏋️', path: '/features', desc: 'AI plan' },
  { label: 'Nutrition', icon: '🥗', path: '/features', desc: 'Meal plan' },
  { label: 'Community', icon: '🤝', path: '/community', desc: 'Social feed' },
  { label: 'Book Trainer', icon: '📅', path: '/book-trainer', desc: 'Schedule' },
  { label: 'Rankings', icon: '🏆', path: '/leaderboard', desc: 'Leaderboard' },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Up late?';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getMembershipColor(plan) {
  if (!plan || plan === 'None') return '#5a5a70';
  if (plan === 'Premium') return '#f59e0b';
  if (plan === 'Pro') return '#9d00ff';
  return '#00d4ff';
}

export default function MemberDashboard() {
  const { user, apiClient } = useAuth();
  const [stats, setStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [weeklyInsight, setWeeklyInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [attRes, achRes, insightRes] = await Promise.all([
          apiClient.get('/attendance/stats/me').catch(() => ({ data: { data: null } })),
          apiClient.get('/achievements/my').catch(() => ({ data: { data: [] } })),
          apiClient.get('/ai-chat/weekly-insight').catch(() => ({ data: { data: null } })),
        ]);
        if (cancelled) return;
        setStats(attRes.data.data);
        const earned = (achRes.data.data || []).filter(a => a.earned);
        setAchievements(earned.slice(0, 4));
        setWeeklyInsight(insightRes.data.data);
      } catch {}
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [apiClient]);

  const handleCheckIn = async () => {
    if (checkedInToday) return;
    try {
      const res = await apiClient.post('/attendance/self-checkin');
      setCheckedInToday(true);
      toast.success(`+${res.data.pointsEarned} pts — Checked in! 🎯`);
      if (res.data.streak > 1) toast(`🔥 ${res.data.streak}-day streak!`, { icon: '🔥' });
    } catch (err) {
      if (err.response?.data?.message?.includes('Already')) {
        setCheckedInToday(true);
        toast('Already checked in today! 👍');
      } else {
        toast.error('Check-in failed. Try again.');
      }
    }
  };

  const downloadReport = async () => {
    setDownloadingReport(true);
    try {
      const res = await apiClient.get('/reports/progress', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url; a.download = `aurafit-${new Date().toISOString().slice(0,10)}.pdf`; a.click();
      URL.revokeObjectURL(url);
      toast.success('Report downloaded! 📊');
    } catch {
      toast.error('Failed to generate report.');
    }
    setDownloadingReport(false);
  };

  const level = Math.floor((user?.points || 0) / 100) + 1;
  const levelPts = (user?.points || 0) % 100;
  const membershipColor = getMembershipColor(user?.membership);

  return (
    <div style={{ background: 'var(--surface-bg)', minHeight: '100vh', paddingBottom: 80 }}>

      {/* Header band */}
      <div style={{
        background: 'linear-gradient(160deg, rgba(157,0,255,0.07) 0%, rgba(0,212,255,0.04) 100%)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: 'var(--space-8) var(--space-4) var(--space-10)',
      }}>
        <div style={{ maxWidth: 'var(--container-md)', margin: '0 auto' }}>

          {/* Greeting row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', margin: '0 0 4px', fontWeight: 500 }}>
                {getGreeting()},
              </p>
              <h1 style={{ color: 'var(--text-primary)', fontSize: 'var(--text-4xl)', fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                {user?.name?.split(' ')[0]} 👋
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <span style={{
                  background: 'var(--brand-purple-dim)', border: '1px solid var(--border-accent)',
                  borderRadius: 'var(--radius-pill)', padding: '3px 10px',
                  color: 'var(--brand-purple)', fontSize: 'var(--text-xs)', fontWeight: 700,
                }}>
                  Level {level}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                  {user?.points || 0} pts
                </span>
                {(user?.membership && user.membership !== 'None') && (
                  <span style={{
                    background: `${membershipColor}18`,
                    border: `1px solid ${membershipColor}44`,
                    borderRadius: 'var(--radius-pill)', padding: '3px 10px',
                    color: membershipColor, fontSize: 'var(--text-xs)', fontWeight: 700,
                  }}>
                    {user.membership}
                  </span>
                )}
              </div>
            </div>

            {/* Streak */}
            <div style={{
              background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: 'var(--radius-lg)', padding: 'var(--space-4) var(--space-5)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 28, lineHeight: 1, marginBottom: 4 }}>🔥</div>
              <div style={{ color: 'var(--color-warning)', fontSize: 'var(--text-2xl)', fontWeight: 800, lineHeight: 1 }}>
                {user?.currentStreak || 0}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginTop: 2, fontWeight: 500 }}>
                day streak
              </div>
            </div>
          </div>

          {/* Level progress */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>Lv {level}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>Lv {level + 1} — {100 - levelPts} pts away</span>
            </div>
            <div style={{ height: 4, background: 'var(--surface-high)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
              <motion.div
                style={{ height: '100%', background: 'var(--brand-gradient)', borderRadius: 'var(--radius-pill)' }}
                animate={{ width: `${levelPts}%` }}
                transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 'var(--container-md)', margin: '-var(--space-6) auto 0', padding: '0 var(--space-4)' }}>
        <div style={{ marginTop: -24 }}>

          {/* Announcement */}
          <div style={{ marginBottom: 'var(--space-3)' }}>
            <AnnouncementBanner gymId={user?.gymId} />
          </div>

          {/* Stats */}
          {stats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
              {[
                { label: 'This month', value: stats.thisMonth ?? 0, icon: '📅' },
                { label: 'This week', value: stats.thisWeek ?? 0, icon: '🗓️' },
                { label: 'All time', value: stats.total ?? 0, icon: '💯' },
              ].map(s => (
                <div key={s.label} style={{
                  background: 'var(--surface-raised)', border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)',
                  textAlign: 'center', boxShadow: 'var(--shadow-card)',
                }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ color: 'var(--brand-purple)', fontSize: 'var(--text-2xl)', fontWeight: 800, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginTop: 3, fontWeight: 500 }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Check-in CTA */}
          <motion.button
            whileTap={checkedInToday ? {} : { scale: 0.98 }}
            onClick={handleCheckIn}
            style={{
              width: '100%', padding: 'var(--space-5)', marginBottom: 'var(--space-6)',
              borderRadius: 'var(--radius-xl)', border: 'none',
              background: checkedInToday
                ? 'var(--surface-raised)'
                : 'var(--brand-gradient)',
              color: checkedInToday ? 'var(--text-muted)' : '#fff',
              fontSize: 'var(--text-base)', fontWeight: 700, cursor: checkedInToday ? 'default' : 'pointer',
              boxShadow: checkedInToday ? 'none' : 'var(--shadow-glow-purple)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              letterSpacing: '0.01em',
            }}
          >
            {checkedInToday ? (
              <><span style={{ fontSize: 20 }}>✅</span> Checked in today — great work!</>
            ) : (
              <><span style={{ fontSize: 20 }}>📍</span> Check In & Earn Points</>
            )}
          </motion.button>

          {/* Quick actions */}
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h2 style={{ color: 'var(--text-primary)', fontSize: 'var(--text-base)', fontWeight: 700, margin: '0 0 var(--space-3)', letterSpacing: '-0.01em' }}>
              Quick access
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-2)' }}>
              {QUICK_ACTIONS.map(action => (
                <Link key={action.label} to={action.path} style={{ textDecoration: 'none' }}>
                  <motion.div
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    style={{
                      background: 'var(--surface-raised)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)',
                      textAlign: 'center', cursor: 'pointer',
                      boxShadow: 'var(--shadow-card)',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                    }}
                    onHoverStart={e => {}}
                  >
                    <div style={{ fontSize: 26, marginBottom: 'var(--space-2)', lineHeight: 1 }}>{action.icon}</div>
                    <p style={{ color: 'var(--text-primary)', fontWeight: 700, margin: '0 0 2px', fontSize: 'var(--text-sm)' }}>{action.label}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', margin: 0 }}>{action.desc}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>

          {/* Weekly AI insight */}
          {weeklyInsight && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.07) 0%, var(--surface-raised) 60%)',
              border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: 'var(--radius-xl)', padding: 'var(--space-5)',
              marginBottom: 'var(--space-6)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <div>
                  <p style={{ color: 'var(--color-success)', fontSize: 'var(--text-xs)', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    This week's AI insight
                  </p>
                </div>
                <button
                  onClick={downloadReport} disabled={downloadingReport}
                  style={{
                    padding: '5px 12px', background: 'rgba(0,212,255,0.1)',
                    border: '1px solid rgba(0,212,255,0.2)', borderRadius: 'var(--radius-pill)',
                    color: 'var(--brand-cyan)', cursor: 'pointer', fontSize: 'var(--text-xs)', fontWeight: 700,
                  }}
                >
                  {downloadingReport ? '...' : '📊 PDF'}
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {[
                  { icon: '💪', text: weeklyInsight.workoutTip },
                  { icon: '🥗', text: weeklyInsight.nutritionTip },
                ].map((tip, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{tip.icon}</span>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', margin: 0, lineHeight: 'var(--leading-snug)' }}>{tip.text}</p>
                  </div>
                ))}
                <div style={{
                  background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)',
                  borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span style={{ fontSize: 16 }}>🎯</span>
                  <p style={{ color: 'var(--color-success)', fontSize: 'var(--text-sm)', margin: 0, fontWeight: 600 }}>
                    {weeklyInsight.weeklyGoal}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Achievements */}
          {achievements.length > 0 && (
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                <h2 style={{ color: 'var(--text-primary)', fontSize: 'var(--text-base)', fontWeight: 700, margin: 0 }}>Recent achievements</h2>
                <Link to="/achievements" style={{ color: 'var(--brand-purple)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>View all →</Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-2)' }}>
                {achievements.map(a => (
                  <div key={a.key} style={{
                    background: 'var(--surface-raised)', border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)', padding: 'var(--space-3) var(--space-4)',
                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 'var(--radius-md)', flexShrink: 0,
                      background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                    }}>
                      {a.icon}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ color: 'var(--text-primary)', fontSize: 'var(--text-sm)', fontWeight: 600, margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</p>
                      <p style={{ color: 'var(--color-gold)', fontSize: 'var(--text-xs)', margin: 0, fontWeight: 700 }}>+{a.points} pts</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Referral */}
          {user?.referralCode && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(157,0,255,0.07) 0%, rgba(0,212,255,0.04) 100%)',
              border: '1px solid var(--border-accent)',
              borderRadius: 'var(--radius-xl)', padding: 'var(--space-5)',
              marginBottom: 'var(--space-6)',
            }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', fontWeight: 700, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Refer & earn
              </p>
              <p style={{ color: 'var(--text-primary)', fontSize: 'var(--text-base)', fontWeight: 700, margin: '0 0 var(--space-4)' }}>
                Invite friends • Earn 100 pts each
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <div style={{
                  flex: 1, background: 'var(--surface-overlay)', border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)', padding: '10px var(--space-4)',
                  color: 'var(--brand-purple)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xl)',
                  fontWeight: 800, letterSpacing: '0.15em',
                }}>
                  {user.referralCode}
                </div>
                <button
                  onClick={() => { navigator.clipboard?.writeText(user.referralCode); toast.success('Copied! 📋'); }}
                  style={{
                    padding: '10px var(--space-5)', background: 'var(--brand-gradient)',
                    border: 'none', borderRadius: 'var(--radius-md)',
                    color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 'var(--text-sm)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          {/* Membership status */}
          {(!user?.membership || user.membership === 'None') && (
            <div style={{
              background: 'var(--surface-raised)', border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-xl)', padding: 'var(--space-5)',
              marginBottom: 'var(--space-6)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-4)',
            }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', margin: '0 0 4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Membership</p>
                <p style={{ color: 'var(--text-primary)', fontSize: 'var(--text-xl)', fontWeight: 800, margin: '0 0 4px' }}>Free Plan</p>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', margin: 0 }}>Upgrade to unlock all features</p>
              </div>
              <Link to="/pricing" style={{ textDecoration: 'none', flexShrink: 0 }}>
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  style={{
                    padding: '10px 20px', background: 'var(--brand-gradient)',
                    border: 'none', borderRadius: 'var(--radius-md)',
                    color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 'var(--text-sm)',
                    boxShadow: 'var(--shadow-glow-purple)',
                  }}
                >
                  Upgrade
                </motion.button>
              </Link>
            </div>
          )}

          {/* Activity feed */}
          <div style={{
            background: 'var(--surface-raised)', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)', padding: 'var(--space-5)',
            marginBottom: 'var(--space-6)', boxShadow: 'var(--shadow-card)',
          }}>
            <ActivityFeed />
          </div>

          {/* Quick links row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-2)' }}>
            {[
              { label: 'Settings', icon: '⚙️', path: '/settings' },
              { label: 'Community', icon: '🤝', path: '/community' },
              { label: 'Badges', icon: '🏅', path: '/achievements' },
              { label: 'Orders', icon: '📦', path: '/my-orders' },
            ].map(l => (
              <Link key={l.label} to={l.path} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'var(--surface-raised)', border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)', padding: 'var(--space-3)',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{l.icon}</div>
                  <p style={{ color: 'var(--text-muted)', fontSize: 10, margin: 0, fontWeight: 600 }}>{l.label}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
