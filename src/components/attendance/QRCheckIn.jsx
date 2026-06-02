import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function QRCheckIn() {
  const { apiClient, user } = useAuth();
  const [qrData, setQrData]           = useState(null);
  const [loading, setLoading]         = useState(true);
  const [checkInStatus, setStatus]    = useState(null);
  const [stats, setStats]             = useState(null);
  const [timeLeft, setTimeLeft]       = useState(60);
  const [checkedInToday, setDone]     = useState(false);

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
    try {
      const res = await apiClient.post('/attendance/self-checkin');
      setStatus({ success: true, streak: res.data.streak, achievements: res.data.achievements });
      setDone(true);
      await fetchStats();
      res.data.achievements?.forEach(a => toast.success(`🏆 ${a.name} unlocked!`));
      toast.success(`Checked in! +${res.data.pointsEarned} points`);
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg?.includes('Already checked')) {
        setDone(true);
        toast('Already checked in today 👍');
      } else {
        toast.error(msg || 'Check-in failed. Please try again.');
      }
    }
  };

  // Build attendance heatmap: last 30 days cross-referenced with real history
  const heatmap = useMemo(() => {
    const historySet = new Set(stats?.history?.map(h => h.date || h) || []);
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date(Date.now() - (29 - i) * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      return { date: dateStr, day: d.getDate(), checked: historySet.has(dateStr) };
    });
  }, [stats?.history]);

  const streak = user?.currentStreak || stats?.currentStreak || 0;

  return (
    <div style={{ background: 'var(--surface-bg)', minHeight: '100vh', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(160deg, rgba(157,0,255,0.06) 0%, transparent 60%)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: 'clamp(28px,5vw,48px) clamp(16px,4vw,40px)',
        textAlign: 'center',
      }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{
            color: 'var(--text-primary)', fontSize: 'clamp(22px,3.5vw,30px)',
            fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.02em',
          }}>
            Gym Check-In
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>
            Show QR at the front desk or tap to check in from the app
          </p>
        </motion.div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 clamp(16px,4vw,24px)' }}>

        {/* Streak badge */}
        <AnimatePresence>
          {streak > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: 20,
                background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
                borderRadius: 'var(--radius-xl)', padding: '14px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              }}
            >
              <span style={{ fontSize: 28 }}>🔥</span>
              <div>
                <p style={{ color: 'var(--color-warning)', fontWeight: 800, fontSize: 20, margin: 0, letterSpacing: '-0.02em' }}>
                  {streak}-day streak
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0 }}>
                  Don't break it — check in daily to keep it going
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, margin: '16px 0' }}>
            {[
              { label: 'This month', value: stats.thisMonth ?? 0, icon: '📅' },
              { label: 'This week',  value: stats.thisWeek ?? 0,  icon: '🗓️' },
              { label: 'All time',   value: stats.total ?? 0,     icon: '💯' },
            ].map(s => (
              <div key={s.label} style={{
                background: 'var(--surface-raised)', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)', padding: '12px 10px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ color: 'var(--brand-purple)', fontSize: 20, fontWeight: 800 }}>{s.value}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* QR Card */}
        <div style={{
          background: 'var(--surface-raised)', border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-2xl)', padding: 'clamp(20px,4vw,32px)',
          textAlign: 'center', marginBottom: 16,
          boxShadow: 'var(--shadow-card)',
        }}>
          {loading ? (
            <div style={{
              height: 240, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 14,
            }}>
              <div style={{ fontSize: 32 }}>📱</div>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>Generating your QR code…</p>
            </div>
          ) : qrData?.qrDataURL ? (
            <>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 16px' }}>
                Scan at reception
              </p>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                {/* QR frame */}
                <div style={{
                  padding: 12, background: '#ffffff', borderRadius: 16,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                }}>
                  <img
                    src={qrData.qrDataURL}
                    alt="Your check-in QR code"
                    style={{ width: 'clamp(180px,50vw,220px)', height: 'auto', display: 'block', borderRadius: 8 }}
                  />
                </div>
                {/* Timer badge */}
                <div style={{
                  position: 'absolute', bottom: -8, right: -8,
                  width: 36, height: 36, borderRadius: '50%', border: '2px solid var(--surface-raised)',
                  background: timeLeft <= 10 ? 'var(--color-error)' : 'var(--brand-purple)',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800, boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}>
                  {timeLeft}
                </div>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: '16px 0 0' }}>
                Refreshes every 60 seconds
              </p>
            </>
          ) : (
            <div style={{ padding: 40, color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
              <p>QR code unavailable. Please try again.</p>
              <button onClick={fetchQR} style={{
                padding: '10px 20px', background: 'var(--brand-gradient)',
                border: 'none', borderRadius: 10, color: '#fff',
                cursor: 'pointer', fontWeight: 700, marginTop: 8,
              }}>
                Retry
              </button>
            </div>
          )}
        </div>

        {/* Self check-in button */}
        <motion.button
          whileTap={checkedInToday ? {} : { scale: 0.97 }}
          onClick={handleCheckIn}
          disabled={checkedInToday}
          style={{
            width: '100%', padding: 'clamp(14px,2.5vw,17px)', borderRadius: 'var(--radius-xl)',
            border: 'none', cursor: checkedInToday ? 'default' : 'pointer',
            background: checkedInToday ? 'var(--surface-raised)' : 'var(--brand-gradient)',
            color: checkedInToday ? 'var(--text-muted)' : '#fff',
            fontSize: 16, fontWeight: 700, marginBottom: 20,
            boxShadow: checkedInToday ? 'none' : 'var(--shadow-glow-purple)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}
        >
          {checkedInToday ? (
            <><span style={{ fontSize: 20 }}>✅</span> Checked in today — great work!</>
          ) : (
            <><span style={{ fontSize: 20 }}>📍</span> Check in from app</>
          )}
        </motion.button>

        {/* Success celebration */}
        <AnimatePresence>
          {checkInStatus?.success && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring', bounce: 0.4 }}
              style={{
                background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
                borderRadius: 'var(--radius-xl)', padding: '18px 20px', marginBottom: 20,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 6 }}>🎉</div>
              <p style={{ color: 'var(--color-success)', fontWeight: 700, fontSize: 17, margin: '0 0 4px' }}>
                You're in. Let's go.
              </p>
              {checkInStatus.streak > 1 && (
                <p style={{ color: 'var(--color-warning)', fontWeight: 600, margin: '4px 0 0', fontSize: 14 }}>
                  🔥 {checkInStatus.streak}-day streak!
                </p>
              )}
              {checkInStatus.achievements?.map(a => (
                <p key={a.key} style={{ color: 'var(--color-gold)', margin: '6px 0 0', fontSize: 13, fontWeight: 600 }}>
                  🏅 {a.name} unlocked
                </p>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 30-day heatmap */}
        {heatmap.length > 0 && (
          <div style={{
            background: 'var(--surface-raised)', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)', padding: 'clamp(14px,2.5vw,20px)',
          }}>
            <p style={{
              color: 'var(--text-secondary)', fontSize: 13, fontWeight: 700,
              margin: '0 0 12px', letterSpacing: '0.04em',
            }}>
              Last 30 days
            </p>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {heatmap.map(({ date, day, checked }) => (
                <div
                  key={date}
                  title={`${date}${checked ? ' — ✓ checked in' : ''}`}
                  style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: checked ? 'var(--brand-purple)' : 'var(--surface-overlay)',
                    border: `1px solid ${checked ? 'rgba(157,0,255,0.5)' : 'var(--border-subtle)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, color: checked ? '#fff' : 'var(--text-muted)',
                    fontWeight: checked ? 700 : 400,
                    boxShadow: checked ? '0 0 8px rgba(157,0,255,0.3)' : 'none',
                  }}
                >
                  {day}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 10, alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--brand-purple)' }} />
                <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Checked in</span>
              </div>
              <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--surface-overlay)', border: '1px solid var(--border-subtle)' }} />
                <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Missed</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
