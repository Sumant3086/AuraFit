import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function QRCheckIn() {
  const { apiClient, user } = useAuth();
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkInStatus, setCheckInStatus] = useState(null);
  const [stats, setStats] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [checkedInToday, setCheckedInToday] = useState(false);

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

  useEffect(() => {
    fetchQR();
    fetchStats();
  }, [fetchQR, fetchStats]);

  // Auto-refresh QR every 60 seconds
  useEffect(() => {
    if (!qrData) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { fetchQR(); return 60; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [qrData, fetchQR]);

  const handleSelfCheckIn = async () => {
    try {
      const res = await apiClient.post('/attendance/self-checkin');
      setCheckInStatus({ success: true, streak: res.data.streak, achievements: res.data.achievements });
      setCheckedInToday(true);
      await fetchStats();
      if (res.data.achievements?.length > 0) {
        res.data.achievements.forEach(a => toast.success(`🏆 Achievement: ${a.name}!`));
      }
      toast.success(`✅ Checked in! +${res.data.pointsEarned} points`);
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg?.includes('Already checked')) {
        setCheckedInToday(true);
        toast('Already checked in today! 👍');
      } else {
        toast.error(msg || 'Check-in failed');
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', padding: '20px 16px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 800, margin: 0 }}>📱 Check-In</h1>
          <p style={{ color: '#666', marginTop: 8 }}>Show QR at the front desk or tap to check in</p>
        </div>

        {/* Stats strip */}
        {stats && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, justifyContent: 'center' }}>
            <StatPill label="This Month" value={stats.thisMonth} icon="📅" />
            <StatPill label="This Week" value={stats.thisWeek} icon="🗓️" />
            <StatPill label="Total" value={stats.total} icon="💯" />
          </div>
        )}

        {/* Streak display */}
        {user?.currentStreak > 0 && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.2), rgba(255, 107, 53, 0.05))',
              border: '1px solid #ff6b35', borderRadius: 16, padding: 16, marginBottom: 20, textAlign: 'center',
            }}
          >
            <span style={{ fontSize: 32 }}>🔥</span>
            <span style={{ color: '#ff6b35', fontSize: 24, fontWeight: 800, marginLeft: 8 }}>
              {user.currentStreak} Day Streak!
            </span>
          </motion.div>
        )}

        {/* QR Code Card */}
        <div style={{ background: '#111', border: '1px solid #222', borderRadius: 20, padding: 32, textAlign: 'center', marginBottom: 20 }}>
          {loading ? (
            <div style={{ height: 256, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
              Generating QR...
            </div>
          ) : qrData?.qrDataURL ? (
            <>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
                <img src={qrData.qrDataURL} alt="Check-in QR Code" style={{ width: 220, height: 220, borderRadius: 12 }} />
                {/* Timer ring */}
                <div style={{
                  position: 'absolute', bottom: -10, right: -10,
                  background: timeLeft <= 10 ? '#ff4444' : '#9d00ff',
                  color: '#fff', width: 36, height: 36, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700,
                }}>
                  {timeLeft}
                </div>
              </div>
              <p style={{ color: '#666', fontSize: 13, margin: '8px 0 0' }}>QR refreshes every 60 seconds for security</p>
            </>
          ) : (
            <div style={{ color: '#666', padding: 40 }}>Failed to generate QR code</div>
          )}
        </div>

        {/* Self Check-in Button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSelfCheckIn}
          disabled={checkedInToday}
          style={{
            width: '100%', padding: '16px', borderRadius: 14, border: 'none', cursor: checkedInToday ? 'not-allowed' : 'pointer',
            background: checkedInToday ? '#1a1a1a' : 'linear-gradient(135deg, #9d00ff, #00d4ff)',
            color: checkedInToday ? '#555' : '#fff', fontSize: 17, fontWeight: 700,
            marginBottom: 20, transition: 'all 0.2s',
          }}
        >
          {checkedInToday ? '✅ Already checked in today' : '📍 Tap to Check-In'}
        </motion.button>

        {/* Success state */}
        <AnimatePresence>
          {checkInStatus?.success && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                background: 'rgba(0, 200, 83, 0.1)', border: '1px solid #00c853',
                borderRadius: 16, padding: 20, textAlign: 'center',
              }}
            >
              <p style={{ color: '#00c853', fontWeight: 700, fontSize: 18, margin: '0 0 4px' }}>Welcome back! 💪</p>
              {checkInStatus.streak > 1 && (
                <p style={{ color: '#ff6b35', margin: 0 }}>🔥 {checkInStatus.streak} day streak!</p>
              )}
              {checkInStatus.achievements?.map(a => (
                <p key={a.key} style={{ color: '#ffd700', margin: '4px 0 0', fontSize: 14 }}>🏆 {a.name} unlocked!</p>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent history preview */}
        {stats?.history && stats.history.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <h3 style={{ color: '#fff', fontSize: 16, marginBottom: 12 }}>Recent Check-ins</h3>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {getLast30Days().map(({ date, checked }) => (
                <div key={date} style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: checked ? '#9d00ff' : '#1a1a1a',
                  border: `1px solid ${checked ? '#9d00ff' : '#222'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, color: checked ? '#fff' : '#333',
                }} title={date}>
                  {new Date(date).getDate()}
                </div>
              ))}
            </div>
            <p style={{ color: '#555', fontSize: 12, marginTop: 8 }}>Last 30 days attendance</p>
          </div>
        )}
      </div>
    </div>
  );
}

const StatPill = ({ label, value, icon }) => (
  <div style={{ background: '#111', border: '1px solid #222', borderRadius: 12, padding: '10px 16px', textAlign: 'center', minWidth: 80 }}>
    <div style={{ fontSize: 18 }}>{icon}</div>
    <div style={{ color: '#9d00ff', fontWeight: 800, fontSize: 20 }}>{value}</div>
    <div style={{ color: '#555', fontSize: 11 }}>{label}</div>
  </div>
);

const getLast30Days = () => {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    days.push({ date: d.toISOString().split('T')[0], checked: false });
  }
  return days;
};
