import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

/* ── Animated counter hook ─────────────────────────────────── */
function useCounter(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    const step = Math.ceil(target / (duration / 16));
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setCount(current);
      if (current >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, start]);
  return count;
}

/* ── Dashboard Mockup — CSS-only product visual ────────────── */
function DashboardMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
    >
      <div style={{
        background: 'rgba(17,17,26,0.95)',
        border: '1px solid rgba(157,0,255,0.25)',
        borderRadius: 20,
        padding: 0,
        overflow: 'hidden',
        boxShadow: '0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06) inset, 0 0 80px rgba(157,0,255,0.12)',
        width: '100%',
        maxWidth: 420,
      }}>
        {/* Window chrome */}
        <div style={{
          height: 36, background: 'rgba(255,255,255,0.04)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px',
        }}>
          {['#ff5f57','#febc2e','#28c840'].map((c,i) => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.8 }} />
          ))}
          <div style={{
            flex: 1, height: 18,
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 4, marginLeft: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>app.aurafit.com/dashboard</span>
          </div>
        </div>

        {/* App content */}
        <div style={{ padding: 20 }}>
          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: 0 }}>Good morning,</p>
              <p style={{ color: '#fff', fontWeight: 800, fontSize: 18, margin: '2px 0 0', letterSpacing: '-0.02em' }}>Priya 👋</p>
            </div>
            <div style={{
              background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: 10, padding: '6px 10px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 18, lineHeight: 1 }}>🔥</div>
              <div style={{ color: '#f59e0b', fontSize: 16, fontWeight: 800, lineHeight: 1.2 }}>14</div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 8 }}>streak</div>
            </div>
          </div>

          {/* Level bar */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>Level 8 · 780 pts</span>
              <span style={{ color: '#9d00ff', fontSize: 10 }}>78%</span>
            </div>
            <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 99 }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '78%' }}
                transition={{ duration: 1.2, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                style={{ height: '100%', background: 'linear-gradient(90deg,#9d00ff,#00d4ff)', borderRadius: 99 }}
              />
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 14 }}>
            {[
              { n: '24', label: 'This month' },
              { n: '6', label: 'This week' },
              { n: '124', label: 'All visits' },
            ].map(s => (
              <div key={s.label} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 10, padding: '8px 6px', textAlign: 'center',
              }}>
                <div style={{ color: '#9d00ff', fontSize: 16, fontWeight: 800 }}>{s.n}</div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Check-in button */}
          <div style={{
            background: 'linear-gradient(135deg,#9d00ff,#00d4ff)',
            borderRadius: 12, padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
            boxShadow: '0 8px 24px rgba(157,0,255,0.4)',
          }}>
            <span style={{ fontSize: 18 }}>📍</span>
            <div>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: 13, margin: 0 }}>Check In & Earn Points</p>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, margin: 0 }}>+10 pts · Maintains your streak</p>
            </div>
          </div>

          {/* Quick actions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {[
              { icon: '🏋️', label: 'Workout' },
              { icon: '🥗', label: 'Nutrition' },
              { icon: '🏆', label: 'Leaderboard' },
            ].map(a => (
              <div key={a.label} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 10, padding: '10px 8px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{a.icon}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 9, fontWeight: 600 }}>{a.label}</div>
              </div>
            ))}
          </div>

          {/* AI insight strip */}
          <div style={{
            marginTop: 14,
            background: 'linear-gradient(135deg,rgba(16,185,129,0.08),rgba(0,212,255,0.05))',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: 10, padding: '10px 12px',
            display: 'flex', gap: 8, alignItems: 'center',
          }}>
            <span style={{ fontSize: 14 }}>🤖</span>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, margin: 0, lineHeight: 1.4 }}>
              <strong style={{ color: '#10b981' }}>AI Tip:</strong> Today's optimal recovery window is 7–9 PM
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main Hero ──────────────────────────────────────────────── */
export default function LandingHero() {
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);

  const members    = useCounter(5000, 1800, statsVisible);
  const transforms = useCounter(10000, 2000, statsVisible);
  const trainers   = useCounter(35, 1200, statsVisible);
  const rating     = 4.9;

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true); }, { threshold: 0.3 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section style={{
      minHeight: '100vh',
      background: 'var(--surface-bg)',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      padding: 'clamp(80px,10vw,120px) clamp(20px,4vw,60px) clamp(60px,8vw,80px)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Ambient backgrounds */}
      <div aria-hidden style={{
        position: 'absolute', top: '-15%', right: '-10%',
        width: 'clamp(400px,60vw,900px)', height: 'clamp(400px,60vw,900px)',
        background: 'radial-gradient(circle, rgba(157,0,255,0.10) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div aria-hidden style={{
        position: 'absolute', bottom: '-10%', left: '-5%',
        width: 'clamp(300px,40vw,600px)', height: 'clamp(300px,40vw,600px)',
        background: 'radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* Grid layout */}
      <div style={{
        maxWidth: 1280, margin: '0 auto', width: '100%',
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
        gap: 'clamp(40px,6vw,80px)',
        alignItems: 'center',
      }}
        className="hero-grid"
      >
        {/* Left — copy */}
        <div>
          {/* Label */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 'clamp(16px,3vw,24px)' }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(157,0,255,0.1)',
              border: '1px solid rgba(157,0,255,0.3)',
              borderRadius: 999, padding: '7px 16px',
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#9d00ff', boxShadow: '0 0 8px #9d00ff' }} />
              <span style={{ color: '#9d00ff', fontSize: 13, fontWeight: 700, letterSpacing: '0.04em' }}>
                AI-Powered Fitness Platform
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              color: 'var(--text-primary)',
              fontSize: 'clamp(38px,5.5vw,72px)',
              fontWeight: 800,
              lineHeight: 1.06,
              letterSpacing: '-0.03em',
              margin: '0 0 clamp(16px,2.5vw,24px)',
            }}
          >
            Your strongest self<br />
            <span style={{
              background: 'linear-gradient(135deg,#9d00ff 0%,#00d4ff 60%,#9d00ff 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'gradientMove 4s linear infinite',
            }}>
              is waiting.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{
              color: 'var(--text-secondary)',
              fontSize: 'clamp(16px,1.8vw,20px)',
              lineHeight: 1.65,
              margin: '0 0 clamp(28px,4vw,40px)',
              maxWidth: 520,
            }}
          >
            AuraFit combines AI-generated workouts, smart nutrition, real-time coaching,
            and gamified habits to build a fitness life you'll actually stick to.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 'clamp(36px,5vw,56px)' }}
          >
            <Link to="/signup" style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ scale: 1.03, boxShadow: '0 12px 40px rgba(157,0,255,0.45)' }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  background: 'linear-gradient(135deg,#9d00ff,#00d4ff)',
                  padding: '15px 28px', borderRadius: 14,
                  color: '#fff', fontWeight: 700, fontSize: 16,
                  boxShadow: '0 8px 32px rgba(157,0,255,0.35)',
                  cursor: 'pointer', letterSpacing: '0.01em',
                }}
              >
                Start for free
                <span style={{ fontSize: 18 }}>→</span>
              </motion.div>
            </Link>
            <Link to="/features" style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ scale: 1.02, borderColor: 'rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.06)' }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
                  padding: '15px 28px', borderRadius: 14,
                  color: 'var(--text-secondary)', fontWeight: 600, fontSize: 16,
                  cursor: 'pointer', letterSpacing: '0.01em',
                }}
              >
                Explore features
              </motion.div>
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            ref={statsRef}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              display: 'flex', gap: 0, flexWrap: 'wrap',
              borderTop: '1px solid rgba(255,255,255,0.07)',
              paddingTop: 'clamp(20px,3vw,28px)',
            }}
          >
            {[
              { value: `${(members/1000).toFixed(1)}k+`, label: 'Active members' },
              { value: `${(transforms/1000).toFixed(0)}k+`, label: 'Transformations' },
              { value: `${trainers}+`, label: 'Expert trainers' },
              { value: `${rating}★`, label: 'Average rating' },
            ].map((s, i) => (
              <div key={s.label} style={{
                flex: '1 1 100px', paddingRight: 24, marginBottom: 8,
                borderRight: i < 3 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                paddingLeft: i > 0 ? 24 : 0,
              }}>
                <div style={{
                  color: 'var(--text-primary)', fontSize: 'clamp(20px,2.2vw,26px)',
                  fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1,
                }}>
                  {s.value}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4, fontWeight: 500 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right — product mockup */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} className="hero-mockup">
          <DashboardMockup />
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        style={{
          position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          cursor: 'pointer',
        }}
        onClick={() => window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' })}
      >
        <span style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: 1, height: 32, background: 'linear-gradient(180deg,rgba(157,0,255,0.5),transparent)', borderRadius: 1 }}
        />
      </motion.div>

      <style>{`
        @keyframes gradientMove {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-mockup { display: none !important; }
        }
      `}</style>
    </section>
  );
}
