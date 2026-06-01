import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const FEATURES = [
  'AI-generated workouts', 'Smart nutrition plans', 'QR gym check-ins',
  'Trainer booking', 'Body composition tracking', 'Streak rewards',
  'Community feed', 'Achievement badges', 'Leaderboard rankings',
];

export default function LandingCTA() {
  return (
    <section style={{
      padding: 'clamp(80px,10vw,120px) clamp(20px,4vw,60px)',
      background: 'var(--surface-bg)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div aria-hidden style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(157,0,255,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div style={{
            display: 'inline-flex', background: 'var(--brand-purple-dim)',
            border: '1px solid var(--border-accent)', borderRadius: 999,
            padding: '6px 16px', marginBottom: 'clamp(16px,3vw,24px)',
          }}>
            <span style={{ color: 'var(--brand-purple)', fontSize: 13, fontWeight: 700 }}>
              🎁 Free to start — no card required
            </span>
          </div>

          <h2 style={{
            color: 'var(--text-primary)',
            fontSize: 'clamp(32px,5.5vw,64px)',
            fontWeight: 800, lineHeight: 1.08,
            letterSpacing: '-0.03em',
            margin: '0 0 clamp(14px,2.5vw,20px)',
          }}>
            The fitness platform<br />
            <span style={{
              background: 'linear-gradient(135deg,#9d00ff 0%,#00d4ff 60%,#9d00ff 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'gradientMove 4s linear infinite',
            }}>
              built for real results.
            </span>
          </h2>

          <p style={{
            color: 'var(--text-secondary)', fontSize: 'clamp(15px,1.7vw,19px)',
            lineHeight: 1.65, maxWidth: 540, margin: '0 auto clamp(28px,4vw,40px)',
          }}>
            Join 5,000+ members who chose a smarter way to train. Your transformation starts in the next 2 minutes.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 'clamp(40px,6vw,60px)' }}>
            <Link to="/signup" style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ scale: 1.04, boxShadow: '0 16px 56px rgba(157,0,255,0.5)' }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  background: 'linear-gradient(135deg,#9d00ff,#00d4ff)',
                  padding: 'clamp(14px,2vw,18px) clamp(24px,3vw,36px)',
                  borderRadius: 16, color: '#fff', fontWeight: 700,
                  fontSize: 'clamp(15px,1.7vw,18px)',
                  boxShadow: '0 8px 32px rgba(157,0,255,0.35)',
                  cursor: 'pointer', letterSpacing: '0.01em',
                }}
              >
                Create free account →
              </motion.div>
            </Link>
            <Link to="/pricing" style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ scale: 1.02, borderColor: 'rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)' }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  border: '1px solid rgba(255,255,255,0.12)',
                  padding: 'clamp(14px,2vw,18px) clamp(24px,3vw,36px)',
                  borderRadius: 16, color: 'var(--text-secondary)',
                  fontWeight: 600, fontSize: 'clamp(15px,1.7vw,18px)',
                  cursor: 'pointer',
                }}
              >
                View plans & pricing
              </motion.div>
            </Link>
          </div>

          {/* Feature pill list */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {FEATURES.map(f => (
              <span key={f} style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: 'var(--surface-raised)', border: '1px solid var(--border-subtle)',
                borderRadius: 999, padding: '5px 14px',
                color: 'var(--text-muted)', fontSize: 12, fontWeight: 500,
              }}>
                <span style={{ color: 'var(--brand-purple)', fontSize: 10 }}>✓</span> {f}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes gradientMove {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </section>
  );
}
