import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LuArrowRight, LuZap, LuShieldCheck, LuTrendingUp, LuCheck } from 'react-icons/lu';

const ease = [0.16, 1, 0.3, 1];

/* ── Product UI mockup cards ──────────────────────────────── */
function WorkoutCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55, duration: 0.6, ease }}
      style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border-2)',
        borderRadius: 16,
        padding: '18px 20px',
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)' }} />
        <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Today's Plan — AI Generated
        </span>
      </div>
      <p style={{ color: 'var(--text-1)', fontWeight: 700, fontSize: 15, margin: '0 0 3px' }}>Push Day A</p>
      <p style={{ color: 'var(--text-3)', fontSize: 12, margin: '0 0 14px' }}>Upper body · 5 exercises · 55 min</p>
      {[
        { name: 'Bench Press',      sets: '4 × 8',  done: true  },
        { name: 'Overhead Press',   sets: '3 × 10', done: true  },
        { name: 'Incline DB Press', sets: '3 × 12', done: false },
        { name: 'Lateral Raises',   sets: '3 × 15', done: false },
      ].map((ex, i, arr) => (
        <div key={i} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '7px 0',
          borderBottom: i < arr.length - 1 ? '1px solid var(--border-1)' : 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{
              width: 14, height: 14, borderRadius: 4, flexShrink: 0,
              background: ex.done ? 'var(--accent)' : 'transparent',
              border: ex.done ? 'none' : '1px solid var(--border-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {ex.done && <LuCheck size={9} color="#fff" strokeWidth={3} />}
            </div>
            <span style={{ fontSize: 13, color: ex.done ? 'var(--text-3)' : 'var(--text-1)', textDecoration: ex.done ? 'line-through' : 'none' }}>
              {ex.name}
            </span>
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{ex.sets}</span>
        </div>
      ))}
    </motion.div>
  );
}

function StatsRow() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.55, ease }}
      style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}
    >
      {/* Streak */}
      <div style={{
        background: 'var(--surface-2)', border: '1px solid var(--border-2)',
        borderRadius: 13, padding: '14px 16px', boxShadow: 'var(--shadow-md)',
      }}>
        <p style={{ color: 'var(--text-3)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 6px' }}>Active streak</p>
        <p style={{ color: 'var(--text-1)', fontWeight: 800, fontSize: 24, margin: 0, lineHeight: 1 }}>
          14 <span style={{ fontSize: 13, color: 'var(--amber)', fontWeight: 600 }}>days</span>
        </p>
        <div style={{ display: 'flex', gap: 3, marginTop: 8 }}>
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i < 6 ? 'var(--accent)' : 'var(--surface-3)', opacity: i < 6 ? 0.5 + i * 0.09 : 0.25 }} />
          ))}
        </div>
      </div>

      {/* Points */}
      <div style={{
        background: 'var(--surface-2)', border: '1px solid var(--border-2)',
        borderRadius: 13, padding: '14px 16px', boxShadow: 'var(--shadow-md)',
      }}>
        <p style={{ color: 'var(--text-3)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 6px' }}>Points earned</p>
        <p style={{ color: 'var(--text-1)', fontWeight: 800, fontSize: 24, margin: '0 0 6px', lineHeight: 1 }}>4,820</p>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: 'var(--green)', fontWeight: 600 }}>+120 today</span>
          <span style={{ fontSize: 9, color: 'var(--text-4)' }}>·</span>
          <span style={{ fontSize: 9, color: 'var(--text-3)' }}>Level 49</span>
        </div>
      </div>

      {/* Nutrition */}
      <div style={{
        gridColumn: '1 / -1',
        background: 'var(--surface-2)', border: '1px solid var(--border-2)',
        borderRadius: 13, padding: '13px 16px', boxShadow: 'var(--shadow-md)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 }}>
          <span style={{ color: 'var(--text-3)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Nutrition today</span>
          <span style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 600 }}>1,840 / 2,200 kcal</span>
        </div>
        {[
          { label: 'Protein', pct: 86, color: 'var(--green)' },
          { label: 'Carbs',   pct: 75, color: 'var(--amber)' },
          { label: 'Fat',     pct: 62, color: 'var(--accent)' },
        ].map(m => (
          <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
            <span style={{ fontSize: 10, color: 'var(--text-3)', width: 42, flexShrink: 0 }}>{m.label}</span>
            <div style={{ flex: 1, height: 3, background: 'var(--surface-3)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${m.pct}%`, background: m.color, borderRadius: 99 }} />
            </div>
            <span style={{ fontSize: 9, color: 'var(--text-3)', width: 26, textAlign: 'right' }}>{m.pct}%</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function LandingHero() {
  return (
    <section style={{ position: 'relative', overflow: 'hidden', padding: 'clamp(100px, 13vw, 156px) 0 clamp(72px, 9vw, 120px)' }}>
      {/* Ambient glows */}
      <div style={{ position: 'absolute', top: '5%', left: '8%', width: 700, height: 500, borderRadius: '50%', background: '#8B5CF6', filter: 'blur(150px)', opacity: 0.08, pointerEvents: 'none', animation: 'glow-pulse 7s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 500, height: 350, borderRadius: '50%', background: '#6366F1', filter: 'blur(130px)', opacity: 0.06, pointerEvents: 'none' }} />

      <div className="container">
        <div className="hero-grid">

          {/* ── Left: Copy ───────────────────────────────────── */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px 4px 5px', background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', borderRadius: 999, marginBottom: 28 }}
            >
              <span style={{ width: 18, height: 18, borderRadius: 4, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LuZap size={10} color="#fff" strokeWidth={2.5} />
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.02em' }}>Structured fitness. Powered by Gemini AI.</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              style={{ fontSize: 'clamp(36px, 5vw, 68px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.06, color: 'var(--text-1)', margin: '0 0 22px' }}
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease, delay: 0.08 }}
            >
              The gym that works<br />as hard as{' '}
              <span style={{ background: 'linear-gradient(135deg, #8B5CF6 20%, #6366F1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                you do.
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              style={{ fontSize: 'clamp(15px, 1.5vw, 17px)', color: 'var(--text-2)', lineHeight: 1.68, maxWidth: '44ch', margin: '0 0 34px' }}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease, delay: 0.17 }}
            >
              AuraFit gives you a structured training plan, live classes, qualified trainers, and weekly progress data — all in one place. For members who want to actually improve, not just show up.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 36 }}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease, delay: 0.26 }}
            >
              <Link to="/signup" className="btn btn-primary btn-lg">
                Start for free <LuArrowRight size={15} strokeWidth={2.2} />
              </Link>
              <Link to="/pricing" className="btn btn-secondary btn-lg">
                View plans
              </Link>
            </motion.div>

            {/* Trust signals */}
            <motion.div
              style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.38 }}
            >
              {[
                [LuZap,         'Personalised workout plan from day one'],
                [LuShieldCheck, 'Payments secured by Razorpay'],
                [LuTrendingUp,  'Your progress tracked, every week'],
              ].map(([Icon, text]) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icon size={13} color="var(--accent)" strokeWidth={2} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'var(--text-3)' }}>{text}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Right: Product mockups ────────────────────────── */}
          <motion.div
            className="hero-mockups"
            style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.3 }}
          >
            <WorkoutCard />
            <StatsRow />
          </motion.div>
        </div>
      </div>

      <style>{`
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(40px, 7vw, 96px);
          align-items: center;
        }
        @media (max-width: 820px) {
          .hero-grid { grid-template-columns: 1fr; }
          .hero-mockups { display: none !important; }
        }
      `}</style>
    </section>
  );
}
