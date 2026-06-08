import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  LuQrCode, LuBrain, LuSalad, LuCalendar, LuUsers,
  LuTrophy, LuFlame, LuDownload, LuChevronRight, LuAward,
  LuBarChart2, LuTarget, LuTrendingUp, LuCheck, LuActivity,
} from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';
import AnnouncementBanner from '../announcements/AnnouncementBanner';
import ActivityFeed from './ActivityFeed';
import WeekProgress from './WeekProgress';
import MembershipStatus from './MembershipStatus';
import FirstWeekGuide from './FirstWeekGuide';
import MilestoneCelebration from './MilestoneCelebration';
import InactivityAlert from './InactivityAlert';
import GoalTracker from './GoalTracker';
import ConsistencyCard from './ConsistencyCard';
import toast from 'react-hot-toast';

const ease = [0.16, 1, 0.3, 1];

function useCountUp(target, duration = 800, trigger = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!trigger || !target) return;
    const start = performance.now();
    const tick  = (now) => {
      const p = Math.min((now - start) / duration, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, trigger, duration]);
  return val;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getDaysSinceJoined(user) {
  if (!user?.createdAt) return 999;
  return Math.floor((Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24));
}

// The 4 most important primary actions — reduced from 8 for clarity
const QUICK_ACTIONS = [
  { label: 'Training Plan', icon: LuBrain,       path: '/features',          color: 'var(--accent)' },
  { label: 'Book a Class',  icon: LuCalendar,    path: '/classes',           color: 'var(--amber)' },
  { label: 'My Records',    icon: LuTrendingUp,  path: '/progress/records',  color: 'var(--green)' },
  { label: 'Leaderboard',   icon: LuTrophy,      path: '/leaderboard',       color: 'var(--cyan-color)' },
];

const card = { background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 'var(--r-xl)' };

export default function MemberDashboard() {
  const { user, apiClient }             = useAuth();
  const [stats, setStats]               = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [insight, setInsight]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [checkedIn, setCheckedIn]       = useState(false);
  const [downloading, setDownloading]   = useState(false);

  const level           = Math.floor((user?.points || 0) / 100) + 1;
  const levelPct        = (user?.points || 0) % 100;
  const daysSinceJoined = getDaysSinceJoined(user);
  const isNewMember     = daysSinceJoined <= 7;
  const trainingDays    = user?.trainingDaysPerWeek || 3;

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
        const attData = attRes.data.data;
        setStats(attData);
        setAchievements((achRes.data.data || []).filter(a => a.earned).slice(0, 4));
        setInsight(insRes.data.data);
        if (attData?.checkedInToday) setCheckedIn(true);
      } catch {}
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [apiClient]);

  const handleCheckIn = async () => {
    if (checkedIn) return;
    const isFirst = (stats?.total ?? 0) === 0;
    try {
      const res = await apiClient.post('/attendance/self-checkin');
      setCheckedIn(true);
      setStats(s => s ? {
        ...s,
        thisWeek:  (s.thisWeek  || 0) + 1,
        thisMonth: (s.thisMonth || 0) + 1,
        total:     (s.total     || 0) + 1,
        checkedInToday: true,
      } : s);
      if (isFirst) toast.success('First check-in. Streak started.');
      else         toast.success(`Checked in. +${res.data.pointsEarned} points.`);
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
      const a   = document.createElement('a');
      a.href = url; a.download = `aurafit-${new Date().toISOString().slice(0, 10)}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('Report unavailable.'); }
    setDownloading(false);
  };

  // Guide completed steps (based on real behavior signals)
  const completedGuideSteps = [];
  if (stats?.total > 0)         completedGuideSteps.push('checkin');
  if (achievements.length > 0)  completedGuideSteps.push('metrics');

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 96 }}>

      {/* ── Header ──────────────────────────────────────── */}
      <div style={{ borderBottom: '1px solid var(--border-1)', padding: 'var(--sp-6) 0 var(--sp-5)' }}>
        <div style={{ maxWidth: 'var(--max-wide)', margin: '0 auto', padding: '0 clamp(16px, 4vw, 32px)' }}>
          <AnnouncementBanner gymId={user?.gymId} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--sp-4)', flexWrap: 'wrap', marginTop: 'var(--sp-4)' }}>
            <div>
              <p style={{ color: 'var(--text-3)', fontSize: 12, margin: '0 0 4px', fontWeight: 500 }}>{greeting()}</p>
              <h1 style={{ fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-1)', margin: '0 0 var(--sp-2)' }}>
                {user?.name?.split(' ')[0]}
              </h1>
              <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
                <span className="pill pill--accent">Level {level}</span>
                {(user?.currentStreak || 0) > 0 && (
                  <span className="pill pill--amber" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <LuFlame size={10} strokeWidth={1.5} />
                    {user.currentStreak} day streak
                  </span>
                )}
                {isNewMember && <span className="pill pill--green">Week 1</span>}
              </div>
            </div>

            {/* Level progress */}
            <div style={{ minWidth: 160 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: 'var(--text-3)', fontSize: 11 }}>Level {level}</span>
                <span style={{ color: 'var(--text-3)', fontSize: 11 }}>{100 - levelPct} pts to Lv {level + 1}</span>
              </div>
              <div className="progress-track">
                <motion.div
                  className="progress-fill"
                  animate={{ width: `${levelPct}%` }}
                  transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <p style={{ color: 'var(--text-3)', fontSize: 11, marginTop: 4, textAlign: 'right' }}>
                {user?.points || 0} pts total
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────── */}
      <div style={{ maxWidth: 'var(--max-wide)', margin: '0 auto', padding: 'var(--sp-6) clamp(16px, 4vw, 32px)' }}>

        {/* ── Milestone celebration (top priority if just hit) ── */}
        {!loading && <MilestoneCelebration stats={stats} />}

        {/* ── Membership expiry alert ──────────────────── */}
        <MembershipStatus />

        {/* ── Inactivity alert (shows when 4+ days inactive) ── */}
        {!loading && (
          <InactivityAlert stats={stats} checkedInToday={checkedIn} />
        )}

        {/* ── First week guide (disappears after 7 days) ── */}
        {isNewMember && (
          <FirstWeekGuide completedSteps={completedGuideSteps} />
        )}

        {/* ── Week progress ─────────────────────────── */}
        <WeekProgress stats={stats} trainingDaysPerWeek={trainingDays} />

        {/* ── Today's actions ─────────────────────────── */}
        <div style={{ marginBottom: 'var(--sp-5)' }}>
          <p style={{ color: 'var(--text-3)', fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', margin: '0 0 var(--sp-3)' }}>Today</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--sp-3)' }} className="today-grid">

            {/* Check-in */}
            <motion.button
              onClick={handleCheckIn}
              disabled={checkedIn}
              whileTap={checkedIn ? {} : { scale: 0.97 }}
              style={{
                ...card,
                padding: 'var(--sp-5)',
                border: `1px solid ${checkedIn ? 'rgba(34,197,94,0.3)' : 'var(--border-1)'}`,
                background: checkedIn ? 'rgba(34,197,94,0.05)' : 'var(--surface-2)',
                cursor: checkedIn ? 'default' : 'pointer',
                textAlign: 'left',
                display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)',
                transition: 'border-color 0.2s, background 0.2s',
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: checkedIn ? 'rgba(34,197,94,0.12)' : 'var(--surface-3)', border: `1px solid ${checkedIn ? 'rgba(34,197,94,0.2)' : 'var(--border-1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {checkedIn ? <LuCheck size={16} color="var(--green)" strokeWidth={2.5} /> : <LuQrCode size={16} color="var(--text-2)" strokeWidth={1.5} />}
              </div>
              <div>
                <p style={{ color: checkedIn ? 'var(--green)' : 'var(--text-1)', fontWeight: 700, fontSize: 14, margin: '0 0 3px' }}>
                  {checkedIn ? 'Attendance logged' : 'Check in'}
                </p>
                <p style={{ color: 'var(--text-3)', fontSize: 12, margin: 0 }}>
                  {checkedIn ? "Visit recorded for today" : "Record today's gym visit"}
                </p>
              </div>
            </motion.button>

            {/* Training */}
            <Link to="/features" style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                style={{ ...card, padding: 'var(--sp-5)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', height: '100%' }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LuBrain size={16} color="var(--accent)" strokeWidth={1.5} />
                </div>
                <div>
                  <p style={{ color: 'var(--text-1)', fontWeight: 700, fontSize: 14, margin: '0 0 3px' }}>Training Plan</p>
                  <p style={{ color: 'var(--text-3)', fontSize: 12, margin: 0 }}>View or generate today's programme</p>
                </div>
              </motion.div>
            </Link>

            {/* Nutrition */}
            <Link to="/features" style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                style={{ ...card, padding: 'var(--sp-5)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', height: '100%' }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LuSalad size={16} color="var(--green)" strokeWidth={1.5} />
                </div>
                <div>
                  <p style={{ color: 'var(--text-1)', fontWeight: 700, fontSize: 14, margin: '0 0 3px' }}>Nutrition</p>
                  <p style={{ color: 'var(--text-3)', fontSize: 12, margin: 0 }}>Check your daily targets</p>
                </div>
              </motion.div>
            </Link>
          </div>
        </div>

        {/* ── Stats ─────────────────────────────────────── */}
        <AnimatedStats stats={stats} loading={loading} />

        {/* ── Main two-column content ───────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }} className="dash-cols">

          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>

            {/* Goal tracker — always visible */}
            <GoalTracker user={user} stats={stats} trainingDaysPerWeek={trainingDays} />

            {/* Consistency score */}
            {!loading && <ConsistencyCard stats={stats} trainingDaysPerWeek={trainingDays} />}

            {/* AI weekly insight */}
            {insight ? (
              <div style={{ ...card, padding: 'var(--sp-5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <LuTrendingUp size={14} color="var(--accent)" strokeWidth={2} />
                    <p style={{ color: 'var(--text-3)', fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', margin: 0 }}>
                      Weekly review
                    </p>
                  </div>
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: '1px solid var(--border-2)', borderRadius: 'var(--r-md)', padding: '4px 10px', color: 'var(--text-2)', cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-sans)' }}
                  >
                    <LuActivity size={11} strokeWidth={1.5} />
                    PDF
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                  {[insight.workoutTip, insight.nutritionTip].filter(Boolean).map((t, i) => (
                    <p key={i} style={{ color: 'var(--text-2)', fontSize: 13, lineHeight: 1.6, margin: 0, paddingLeft: 'var(--sp-3)', borderLeft: '2px solid var(--border-2)' }}>
                      {t}
                    </p>
                  ))}
                  {insight.weeklyGoal && (
                    <p style={{ color: 'var(--text-1)', fontSize: 13, fontWeight: 600, margin: 0, paddingLeft: 'var(--sp-3)', borderLeft: '2px solid var(--accent)' }}>
                      Goal: {insight.weeklyGoal}
                    </p>
                  )}
                </div>
              </div>
            ) : isNewMember ? (
              <div style={{ ...card, padding: 'var(--sp-5)', background: 'var(--accent-dim)', border: '1px solid var(--accent-border)' }}>
                <p style={{ color: 'var(--accent)', fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', margin: '0 0 8px' }}>
                  Your first week
                </p>
                <p style={{ color: 'var(--text-1)', fontWeight: 700, fontSize: 14, margin: '0 0 8px' }}>
                  Build the habit before building the body.
                </p>
                <p style={{ color: 'var(--text-2)', fontSize: 13, lineHeight: 1.6, margin: '0 0 14px' }}>
                  Your weekly review appears here after your first full week of training. For now, focus on showing up.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {['Check in every time you train', 'Log your first PR in the records tracker', 'Generate your training plan today'].map(tip => (
                    <div key={tip} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <LuCheck size={12} color="var(--accent)" strokeWidth={2.5} style={{ flexShrink: 0 }} />
                      <span style={{ color: 'var(--text-2)', fontSize: 12 }}>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Activity feed */}
            <div style={{ ...card, padding: 'var(--sp-5)' }}>
              <ActivityFeed />
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>

            {/* Quick actions — 4 primary actions in a 2×2 grid */}
            <div style={{ ...card, overflow: 'hidden' }}>
              <div style={{ padding: 'var(--sp-4) var(--sp-5) 0' }}>
                <p style={{ color: 'var(--text-3)', fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', margin: 0 }}>Quick access</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, background: 'var(--border-1)', marginTop: 'var(--sp-3)' }}>
                {QUICK_ACTIONS.map(a => (
                  <Link key={a.label} to={a.path} style={{ textDecoration: 'none' }}>
                    <motion.div
                      whileHover={{ background: 'var(--surface-3)' }}
                      whileTap={{ scale: 0.96 }}
                      style={{ background: 'var(--surface-2)', padding: 'var(--sp-5) var(--sp-4)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transition: 'background 0.12s', textAlign: 'center' }}
                    >
                      <a.icon size={18} color={a.color} strokeWidth={1.5} />
                      <span style={{ color: 'var(--text-2)', fontSize: 11, fontWeight: 500 }}>{a.label}</span>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Progress links */}
            <div style={{ ...card, padding: 'var(--sp-5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 'var(--sp-4)' }}>
                <LuBarChart2 size={13} color="var(--text-3)" strokeWidth={1.8} />
                <p style={{ color: 'var(--text-3)', fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', margin: 0 }}>Progress tools</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Personal Records', desc: 'Track your best lifts', to: '/progress/records', icon: LuTrendingUp },
                  { label: 'Monthly Summary', desc: 'This month\'s overview', to: '/progress/monthly', icon: LuTarget },
                  { label: 'Achievements', desc: 'Earned milestones', to: '/achievements', icon: LuAward },
                  { label: 'Leaderboard', desc: 'Rankings by points', to: '/leaderboard', icon: LuTrophy },
                ].map(l => (
                  <Link key={l.to} to={l.to} style={{ textDecoration: 'none' }}>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 12px', background: 'var(--surface-3)', border: '1px solid var(--border-1)', borderRadius: 10, cursor: 'pointer', transition: 'border-color 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-2)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-1)'}
                    >
                      <l.icon size={14} color="var(--accent)" strokeWidth={1.8} style={{ flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: 'var(--text-1)', fontSize: 13, fontWeight: 600, margin: '0 0 1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.label}</p>
                        <p style={{ color: 'var(--text-3)', fontSize: 11, margin: 0 }}>{l.desc}</p>
                      </div>
                      <LuChevronRight size={13} color="var(--text-3)" strokeWidth={1.5} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Achievements */}
            {achievements.length > 0 && (
              <div style={{ ...card, padding: 'var(--sp-5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <LuAward size={13} color="var(--amber)" strokeWidth={1.8} />
                    <p style={{ color: 'var(--text-3)', fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', margin: 0 }}>Recent achievements</p>
                  </div>
                  <Link to="/achievements" style={{ color: 'var(--text-3)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 3, textDecoration: 'none' }}>
                    All <LuChevronRight size={12} />
                  </Link>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {achievements.map(a => (
                    <div key={a.key} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: 'var(--amber-dim)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <LuAward size={14} color="var(--amber)" strokeWidth={1.5} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: 'var(--text-1)', fontSize: 13, fontWeight: 600, margin: '0 0 1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</p>
                        <p style={{ color: 'var(--amber)', fontSize: 11, margin: 0 }}>+{a.points} pts</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements empty → PR prompt for new members */}
            {achievements.length === 0 && isNewMember && (
              <div style={{ ...card, padding: 'var(--sp-5)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                  <LuAward size={13} color="var(--amber)" strokeWidth={1.8} />
                  <p style={{ color: 'var(--text-3)', fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', margin: 0 }}>Achievements</p>
                </div>
                <p style={{ color: 'var(--text-2)', fontSize: 13, lineHeight: 1.6, margin: '0 0 12px' }}>
                  Your first badge unlocks with your first gym check-in.
                </p>
                <Link to="/checkin" style={{ textDecoration: 'none' }}>
                  <button className="btn btn-secondary btn-sm">Complete first check-in</button>
                </Link>
              </div>
            )}

            {/* Referral */}
            {user?.referralCode && (
              <div style={{ ...card, padding: 'var(--sp-5)' }}>
                <p style={{ color: 'var(--text-3)', fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', margin: '0 0 var(--sp-2)' }}>Invite a member</p>
                <p style={{ color: 'var(--text-3)', fontSize: 12, margin: '0 0 var(--sp-3)', lineHeight: 1.5 }}>Share your code. Both of you earn 100 points when they join.</p>
                <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                  <div style={{ flex: 1, background: 'var(--surface-3)', border: '1px solid var(--border-2)', borderRadius: 'var(--r-md)', padding: 'var(--sp-2) var(--sp-4)', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '0.08em' }}>
                    {user.referralCode}
                  </div>
                  <button
                    onClick={() => { navigator.clipboard?.writeText(user.referralCode); toast.success('Copied.'); }}
                    className="btn btn-secondary"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .today-grid { }
        .dash-cols  { }
        @media (max-width: 900px) {
          .today-grid { grid-template-columns: 1fr 1fr !important; }
          .today-grid > :first-child { grid-column: 1 / -1; }
          .dash-cols { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .today-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

/* ── Animated check-in stats ───────────────────────────────── */
function AnimatedStats({ stats, loading }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  const m = useCountUp(stats?.thisMonth ?? 0, 800,  inView && !!stats);
  const w = useCountUp(stats?.thisWeek  ?? 0, 600,  inView && !!stats);
  const t = useCountUp(stats?.total     ?? 0, 1000, inView && !!stats);

  const rows = [
    { label: 'This month', val: m },
    { label: 'This week',  val: w },
    { label: 'All time',   val: t },
  ];

  if (!loading && m === 0 && w === 0 && t === 0) {
    return (
      <div style={{ ...{ background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 'var(--r-xl)' }, padding: 'var(--sp-5)', marginBottom: 'var(--sp-5)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <p style={{ color: 'var(--text-1)', fontSize: 14, fontWeight: 600, margin: '0 0 4px' }}>No check-ins recorded yet</p>
          <p style={{ color: 'var(--text-3)', fontSize: 12, margin: 0 }}>Visit the gym and check in to start your attendance record.</p>
        </div>
        <Link to="/checkin" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <button className="btn btn-secondary btn-sm" style={{ gap: 6 }}>
            <LuQrCode size={12} strokeWidth={1.8} />
            Go to check-in
          </button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 8 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--border-1)', borderRadius: 'var(--r-xl)', overflow: 'hidden', marginBottom: 'var(--sp-5)' }}
    >
      {loading
        ? ['a', 'b', 'c'].map(k => (
            <div key={k} style={{ background: 'var(--surface-2)', padding: 'var(--sp-5)', textAlign: 'center' }}>
              <div style={{ height: 24, width: 32, background: 'var(--surface-3)', borderRadius: 4, margin: '0 auto 8px' }} className="skeleton" />
              <div style={{ height: 10, width: 64, background: 'var(--surface-3)', borderRadius: 4, margin: '0 auto' }} className="skeleton" />
            </div>
          ))
        : rows.map(r => (
            <div key={r.label} style={{ background: 'var(--surface-2)', padding: 'var(--sp-5)', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-1)', fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 4px', fontVariantNumeric: 'tabular-nums' }}>
                {r.val}
              </p>
              <p style={{ color: 'var(--text-3)', fontSize: 11, margin: 0 }}>{r.label}</p>
            </div>
          ))
      }
    </motion.div>
  );
}
