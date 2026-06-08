import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { LuFlame, LuCheck, LuRefreshCw, LuQrCode, LuAlertCircle } from 'react-icons/lu';

const ease = [0.16, 1, 0.3, 1];

export default function QRCheckIn() {
  const { apiClient, user } = useAuth();
  const [qrData, setQrData]         = useState(null);
  const [loading, setLoading]       = useState(true);
  const [checkInResult, setResult]  = useState(null);
  const [stats, setStats]           = useState(null);
  const [timeLeft, setTimeLeft]     = useState(60);
  const [checkedInToday, setDone]   = useState(false);

  const fetchQR = useCallback(async () => {
    try {
      const res = await apiClient.get('/attendance/qr');
      setQrData(res.data.data);
      setTimeLeft(60);
    } catch {
      toast.error('Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await apiClient.get('/attendance/stats/me');
      setStats(res.data.data);
      if (res.data.data?.checkedInToday) setDone(true);
    } catch {}
  }, [apiClient]);

  useEffect(() => { fetchQR(); fetchStats(); }, [fetchQR, fetchStats]);

  // Auto-refresh QR every 60 seconds
  useEffect(() => {
    if (!qrData) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { fetchQR(); return 60; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [qrData, fetchQR]);

  const handleCheckIn = async () => {
    if (checkedInToday) return;
    const wasFirstCheckIn = (stats?.total ?? 0) === 0;
    try {
      const res = await apiClient.post('/attendance/self-checkin');
      setResult({
        success: true,
        streak: res.data.streak,
        pointsEarned: res.data.pointsEarned,
        achievements: res.data.achievements || [],
        isFirst: wasFirstCheckIn,
      });
      setDone(true);
      setStats(s => s ? {
        ...s,
        thisWeek:  (s.thisWeek  || 0) + 1,
        thisMonth: (s.thisMonth || 0) + 1,
        total:     (s.total     || 0) + 1,
      } : s);
      res.data.achievements?.forEach(a => toast.success(`Badge unlocked: ${a.name}`));
      if (wasFirstCheckIn) {
        toast.success('First check-in complete. Streak started.');
      } else {
        toast.success(`Checked in. +${res.data.pointsEarned} points.`);
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg?.includes('Already')) {
        setDone(true);
        toast('Already checked in today.');
      } else {
        toast.error(msg || 'Check-in failed. Please try again.');
      }
    }
  };

  // 30-day heatmap
  const heatmap = useMemo(() => {
    const historySet = new Set(stats?.history?.map(h => h.date || h) || []);
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date(Date.now() - (29 - i) * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const isToday = dateStr === new Date().toISOString().split('T')[0];
      return { date: dateStr, day: d.getDate(), checked: historySet.has(dateStr), isToday };
    });
  }, [stats?.history]);

  const streak = user?.currentStreak || stats?.currentStreak || 0;
  const isFirstEver = (stats?.total ?? 0) === 0;

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 80 }}>

      {/* ── Header ───────────────────────────────────────── */}
      <div style={{ borderBottom: '1px solid var(--border-1)', padding: 'clamp(48px, 8vw, 72px) 0 clamp(28px, 4vw, 40px)' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 clamp(16px, 4vw, 24px)', textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <p style={{ color: 'var(--accent)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 10px' }}>Attendance</p>
            <h1 style={{ color: 'var(--text-1)', fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.025em' }}>
              {checkedInToday ? 'Attendance logged' : 'Check in'}
            </h1>
            <p style={{ color: 'var(--text-3)', fontSize: 14, margin: 0 }}>
              {checkedInToday
                ? "Today's visit is recorded. See you tomorrow."
                : 'Show this QR at the front desk, or use the button below.'}
            </p>
          </motion.div>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 clamp(16px, 4vw, 24px)' }}>

        {/* ── Streak ───────────────────────────────────── */}
        <AnimatePresence>
          {streak > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: 20, marginBottom: 12,
                background: 'var(--amber-dim)', border: '1px solid rgba(245,158,11,0.2)',
                borderRadius: 'var(--r-xl)', padding: '14px 18px',
                display: 'flex', alignItems: 'center', gap: 12,
              }}
            >
              <LuFlame size={20} color="var(--amber)" fill="var(--amber)" />
              <div>
                <p style={{ color: 'var(--amber)', fontWeight: 800, fontSize: 18, margin: 0, letterSpacing: '-0.02em' }}>
                  {streak}-day streak
                </p>
                <p style={{ color: 'var(--text-3)', fontSize: 12, margin: 0 }}>
                  Check in every training day to keep it going
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* First check-in guidance (before any check-ins) */}
        {isFirstEver && !checkedInToday && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: 16, marginBottom: 4,
              background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
              borderRadius: 'var(--r-xl)', padding: '14px 18px',
            }}
          >
            <p style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 13, margin: '0 0 4px' }}>First check-in</p>
            <p style={{ color: 'var(--text-2)', fontSize: 13, margin: 0, lineHeight: 1.55 }}>
              Checking in today starts your attendance streak — the single most reliable indicator of long-term progress.
            </p>
          </motion.div>
        )}

        {/* ── Stats ─────────────────────────────────────── */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, margin: '16px 0' }}>
            {[
              { label: 'This month', value: stats.thisMonth ?? 0 },
              { label: 'This week',  value: stats.thisWeek  ?? 0 },
              { label: 'All time',   value: stats.total     ?? 0 },
            ].map(s => (
              <div key={s.label} style={{
                background: 'var(--surface-2)', border: '1px solid var(--border-1)',
                borderRadius: 'var(--r-lg)', padding: '12px 10px', textAlign: 'center',
              }}>
                <p style={{ color: 'var(--text-1)', fontSize: 20, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.03em' }}>{s.value}</p>
                <p style={{ color: 'var(--text-3)', fontSize: 11, margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── QR Code card ───────────────────────────────── */}
        <div style={{
          background: 'var(--surface-2)', border: '1px solid var(--border-1)',
          borderRadius: 'var(--r-xl)', padding: 'clamp(20px, 4vw, 28px)',
          textAlign: 'center', marginBottom: 12,
          boxShadow: 'var(--shadow-card)',
        }}>
          {loading ? (
            <div style={{ height: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <LuQrCode size={36} color="var(--text-3)" strokeWidth={1.2} style={{ opacity: 0.4 }} />
              <p style={{ color: 'var(--text-3)', fontSize: 13, margin: 0 }}>Generating QR code…</p>
            </div>
          ) : qrData?.qrDataURL ? (
            <>
              <p style={{ color: 'var(--text-3)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 14px' }}>
                Show at reception
              </p>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <div style={{ padding: 10, background: '#ffffff', borderRadius: 14, boxShadow: 'var(--shadow-md)' }}>
                  <img
                    src={qrData.qrDataURL}
                    alt="Your check-in QR"
                    style={{ width: 'clamp(180px, 48vw, 210px)', height: 'auto', display: 'block', borderRadius: 6 }}
                  />
                </div>
                {/* Timer — minimal, not anxiety-inducing */}
                <div style={{
                  position: 'absolute', bottom: -10, right: -10,
                  background: timeLeft <= 10 ? 'var(--amber)' : 'var(--surface-3)',
                  border: `2px solid var(--surface-2)`,
                  color: timeLeft <= 10 ? '#fff' : 'var(--text-3)',
                  borderRadius: 'var(--r-pill)',
                  padding: '3px 8px',
                  fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <LuRefreshCw size={9} strokeWidth={2} />
                  {timeLeft}s
                </div>
              </div>
              <p style={{ color: 'var(--text-4)', fontSize: 11, margin: '14px 0 0' }}>
                Refreshes automatically
              </p>
            </>
          ) : (
            <div style={{ padding: 32 }}>
              <LuAlertCircle size={32} color="var(--text-3)" strokeWidth={1.2} style={{ opacity: 0.4, marginBottom: 12 }} />
              <p style={{ color: 'var(--text-3)', fontSize: 13, margin: '0 0 14px' }}>QR code unavailable.</p>
              <button onClick={fetchQR} className="btn btn-secondary">Retry</button>
            </div>
          )}
        </div>

        {/* ── Check-in button ───────────────────────────── */}
        <motion.button
          whileTap={checkedInToday ? {} : { scale: 0.97 }}
          onClick={handleCheckIn}
          disabled={checkedInToday}
          style={{
            width: '100%', padding: 'clamp(13px, 2.5vw, 16px)', borderRadius: 'var(--r-xl)',
            border: `1px solid ${checkedInToday ? 'rgba(34,197,94,0.3)' : 'var(--border-1)'}`,
            cursor: checkedInToday ? 'default' : 'pointer',
            background: checkedInToday ? 'rgba(34,197,94,0.05)' : 'var(--text-1)',
            color: checkedInToday ? 'var(--green)' : 'var(--bg)',
            fontSize: 15, fontWeight: 700, marginBottom: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
            fontFamily: 'var(--font-sans)',
            transition: 'background 0.2s, border-color 0.2s, color 0.2s',
          }}
        >
          {checkedInToday ? (
            <><LuCheck size={16} strokeWidth={2.5} /> Attendance logged for today</>
          ) : (
            <><LuQrCode size={16} strokeWidth={1.8} /> Check in from app</>
          )}
        </motion.button>

        {/* ── Check-in success ─────────────────────────── */}
        <AnimatePresence>
          {checkInResult?.success && (
            <motion.div
              initial={{ opacity: 0, y: 14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring', bounce: 0.35, duration: 0.5 }}
              style={{
                background: checkInResult.isFirst ? 'var(--accent-dim)' : 'var(--green-dim)',
                border: `1px solid ${checkInResult.isFirst ? 'var(--accent-border)' : 'rgba(34,197,94,0.25)'}`,
                borderRadius: 'var(--r-xl)', padding: '18px 20px', marginBottom: 16,
                textAlign: 'center',
              }}
            >
              {checkInResult.isFirst ? (
                <>
                  <p style={{ color: 'var(--accent)', fontWeight: 800, fontSize: 17, margin: '0 0 6px', letterSpacing: '-0.01em' }}>
                    First check-in complete.
                  </p>
                  <p style={{ color: 'var(--text-2)', fontSize: 13, margin: '0 0 8px', lineHeight: 1.55 }}>
                    Your attendance streak has started. Consistency from here is what drives results.
                  </p>
                  <p style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 600, margin: 0 }}>
                    +{checkInResult.pointsEarned} points
                  </p>
                </>
              ) : (
                <>
                  <p style={{ color: 'var(--green)', fontWeight: 800, fontSize: 17, margin: '0 0 4px' }}>
                    Checked in.
                  </p>
                  {checkInResult.streak > 1 && (
                    <p style={{ color: 'var(--amber)', fontWeight: 600, margin: '4px 0 0', fontSize: 14 }}>
                      <LuFlame size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} fill="var(--amber)" />
                      {checkInResult.streak}-day streak
                    </p>
                  )}
                  {checkInResult.achievements?.map(a => (
                    <p key={a.key} style={{ color: 'var(--amber)', margin: '6px 0 0', fontSize: 13, fontWeight: 600 }}>
                      Badge unlocked: {a.name}
                    </p>
                  ))}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 30-day heatmap ─────────────────────────── */}
        <div style={{
          background: 'var(--surface-2)', border: '1px solid var(--border-1)',
          borderRadius: 'var(--r-xl)', padding: 'clamp(14px, 2.5vw, 20px)',
        }}>
          <p style={{ color: 'var(--text-3)', fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', margin: '0 0 12px' }}>
            Last 30 days
          </p>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {heatmap.map(({ date, day, checked, isToday }) => (
              <div
                key={date}
                title={`${date}${checked ? ' — checked in' : ''}`}
                style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: checked ? 'var(--accent)' : isToday ? 'var(--surface-3)' : 'var(--surface-3)',
                  border: `1px solid ${checked ? 'var(--accent-border)' : isToday ? 'var(--border-2)' : 'var(--border-1)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10,
                  color: checked ? '#fff' : isToday ? 'var(--text-1)' : 'var(--text-4)',
                  fontWeight: checked || isToday ? 700 : 400,
                  opacity: isToday && !checked ? 0.7 : 1,
                }}
              >
                {day}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 14, marginTop: 10, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--accent)' }} />
              <span style={{ color: 'var(--text-3)', fontSize: 11 }}>Checked in</span>
            </div>
            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--surface-3)', border: '1px solid var(--border-1)' }} />
              <span style={{ color: 'var(--text-3)', fontSize: 11 }}>Not recorded</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
