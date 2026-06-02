import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const FEATURES = [
  { icon: '🤖', label: 'AI workout generator', desc: 'Plans built around your schedule and goals' },
  { icon: '📍', label: 'QR gym check-ins',     desc: 'Tap in, track your attendance, keep your streak' },
  { icon: '📊', label: 'Progress tracking',    desc: 'Body measurements, weight, and strength over time' },
  { icon: '🏆', label: 'Gamification',         desc: 'Streaks, badges, and a leaderboard to stay motivated' },
];

export default function LandingHero() {
  return (
    <section style={{
      background: 'var(--surface-bg)',
      padding: 'clamp(72px,10vw,120px) clamp(20px,4vw,60px) clamp(56px,8vw,80px)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Subtle background tint — one gradient, not layered glows */}
      <div aria-hidden style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '60%',
        background: 'radial-gradient(ellipse 80% 40% at 60% 0%, rgba(157,0,255,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: 1100, margin: '0 auto', position: 'relative',
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
        gap: 'clamp(40px,6vw,80px)',
        alignItems: 'center',
      }} className="hero-grid">

        {/* Copy */}
        <div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{
              color: 'var(--brand-purple)', fontSize: 13,
              fontWeight: 700, letterSpacing: '0.06em',
              textTransform: 'uppercase', margin: '0 0 20px',
            }}
          >
            AI-powered fitness platform
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            style={{
              color: 'var(--text-primary)',
              fontSize: 'clamp(34px,5vw,58px)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.025em',
              margin: '0 0 clamp(16px,2.5vw,22px)',
            }}
          >
            Train smarter.<br />
            <span style={{
              background: 'linear-gradient(135deg, #9d00ff, #00d4ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              See real results.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{
              color: 'var(--text-secondary)',
              fontSize: 'clamp(16px,1.8vw,19px)',
              lineHeight: 1.65,
              margin: '0 0 clamp(28px,4vw,36px)',
              maxWidth: 480,
            }}
          >
            AuraFit combines AI-generated workouts, nutrition tracking, gym check-ins,
            and gamified progress — so you actually stick to your routine.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.22 }}
            style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 'clamp(36px,5vw,52px)' }}
          >
            <Link to="/signup" style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'linear-gradient(135deg, #9d00ff, #00d4ff)',
                  padding: '13px 26px', borderRadius: 12,
                  color: '#fff', fontWeight: 700, fontSize: 15,
                  boxShadow: '0 4px 20px rgba(157,0,255,0.25)',
                  cursor: 'pointer', letterSpacing: '0.01em',
                }}
              >
                Get started free
              </motion.div>
            </Link>
            <Link to="/features" style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'inline-flex', alignItems: 'center',
                  border: '1px solid var(--border-default)',
                  padding: '13px 26px', borderRadius: 12,
                  color: 'var(--text-secondary)', fontWeight: 600, fontSize: 15,
                  cursor: 'pointer',
                }}
              >
                See features
              </motion.div>
            </Link>
          </motion.div>

          {/* Feature list — honest product description, not fake social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: '10px 16px',
            }}
          >
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}
              >
                <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{f.icon}</span>
                <div>
                  <p style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 600, margin: '0 0 2px' }}>{f.label}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0, lineHeight: 1.4 }}>{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Right side — clean product preview, not a fake 3D mockup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="hero-visual"
          style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
        >
          {/* Dashboard preview card */}
          <div style={{
            background: 'var(--surface-raised)',
            border: '1px solid var(--border-default)',
            borderRadius: 16, padding: 20,
            boxShadow: 'var(--shadow-lg)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: 11, margin: 0 }}>Welcome back</p>
                <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 16, margin: '2px 0 0' }}>Your Dashboard</p>
              </div>
              <div style={{
                background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
                borderRadius: 8, padding: '5px 10px', fontSize: 12, fontWeight: 700, color: '#f59e0b',
              }}>
                🔥 Active streak
              </div>
            </div>

            {/* Level progress */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600 }}>Level progress</span>
                <span style={{ color: 'var(--brand-purple)', fontSize: 12, fontWeight: 700 }}>72%</span>
              </div>
              <div style={{ height: 4, background: 'var(--surface-high)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ width: '72%', height: '100%', background: 'linear-gradient(90deg, #9d00ff, #00d4ff)', borderRadius: 99 }} />
              </div>
            </div>

            {/* Stat row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {[
                { label: 'This month', val: '18' },
                { label: 'This week', val: '4' },
                { label: 'Total visits', val: '62' },
              ].map(s => (
                <div key={s.label} style={{
                  background: 'var(--surface-overlay)', borderRadius: 8,
                  padding: '8px 6px', textAlign: 'center',
                }}>
                  <p style={{ color: 'var(--brand-purple)', fontWeight: 800, fontSize: 18, margin: 0 }}>{s.val}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: 10, margin: 0 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI workout preview */}
          <div style={{
            background: 'var(--surface-raised)',
            border: '1px solid var(--border-default)',
            borderRadius: 16, padding: 18,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 14, margin: 0 }}>Today's AI plan</p>
              <span style={{
                background: 'rgba(157,0,255,0.1)', color: 'var(--brand-purple)',
                fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
              }}>
                Push Day
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {['Bench Press  4×8', 'Overhead Press  3×10', 'Tricep Pushdown  3×12'].map((ex, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '7px 10px', background: 'var(--surface-overlay)', borderRadius: 8,
                }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                    background: i === 0 ? '#10b981' : 'var(--border-default)',
                  }} />
                  <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{ex}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-visual { display: none !important; }
        }
      `}</style>
    </section>
  );
}
