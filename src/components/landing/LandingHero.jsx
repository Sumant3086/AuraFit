import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LuArrowRight, LuDumbbell, LuBarChart2, LuTarget, LuUsers } from 'react-icons/lu';

const FEATURES = [
  { icon: LuDumbbell,  label: 'AI workout plans',     desc: 'Built around your goals and schedule' },
  { icon: LuBarChart2, label: 'Progress tracking',    desc: 'Measurements and strength over time' },
  { icon: LuTarget,    label: 'Habit consistency',    desc: 'Streaks, check-ins, and accountability' },
  { icon: LuUsers,     label: 'Community',            desc: 'Train alongside people who show up' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

export default function LandingHero() {
  return (
    <section style={{
      background: 'var(--bg)',
      borderBottom: '1px solid var(--border-1)',
      padding: 'clamp(80px,12vw,140px) clamp(20px,5vw,60px) clamp(64px,10vw,100px)',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Very subtle radial — almost invisible */}
      <div aria-hidden style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: 800, height: 400,
        background: 'radial-gradient(ellipse at top, rgba(139,92,246,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 'var(--max-wide)', margin: '0 auto', position: 'relative' }}>

        {/* Label */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            color: 'var(--text-3)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--weight-medium)',
            letterSpacing: 'var(--tracking-wider)',
            textTransform: 'uppercase',
            marginBottom: 'var(--sp-6)',
          }}
        >
          AuraFit
        </motion.p>

        {/* Hero headline — large, editorial, no gradient */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontSize: 'var(--text-hero)',
            fontWeight: 'var(--weight-black)',
            letterSpacing: 'var(--tracking-tight)',
            lineHeight: 'var(--leading-tight)',
            color: 'var(--text-1)',
            maxWidth: 720,
            marginBottom: 'var(--sp-6)',
          }}
        >
          Build the habit
          <br />
          of showing up.
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
          style={{
            color: 'var(--text-2)',
            fontSize: 'clamp(16px, 1.8vw, 19px)',
            lineHeight: 'var(--leading-normal)',
            maxWidth: 480,
            marginBottom: 'var(--sp-10)',
          }}
        >
          AuraFit tracks your training, plans your nutrition, and keeps you
          consistent — one focused app for the long game.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.22 }}
          style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap', marginBottom: 'clamp(60px,10vw,96px)' }}
        >
          <Link to="/signup">
            <motion.button
              whileHover={{ opacity: 0.9 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'var(--text-1)',
                color: 'var(--bg)',
                border: 'none',
                padding: '12px 22px',
                borderRadius: 'var(--r-md)',
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--weight-semibold)',
                cursor: 'pointer',
                letterSpacing: '-0.01em',
              }}
            >
              Get started
              <LuArrowRight size={15} />
            </motion.button>
          </Link>

          <Link to="/features">
            <motion.button
              whileHover={{ background: 'var(--surface-3)' }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'inline-flex', alignItems: 'center',
                background: 'transparent',
                color: 'var(--text-2)',
                border: '1px solid var(--border-2)',
                padding: '12px 22px',
                borderRadius: 'var(--r-md)',
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--weight-medium)',
                cursor: 'pointer',
              }}
            >
              See features
            </motion.button>
          </Link>
        </motion.div>

        {/* Feature strip — clean, no decoration */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 1, /* 1px gap creates visible separators */
            background: 'var(--border-1)',
            border: '1px solid var(--border-1)',
            borderRadius: 'var(--r-lg)',
            overflow: 'hidden',
          }}
        >
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <motion.div
              key={label}
              variants={fadeUp}
              style={{
                background: 'var(--surface-1)',
                padding: 'var(--sp-5) var(--sp-6)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--sp-2)',
              }}
            >
              <Icon size={18} color="var(--text-3)" strokeWidth={1.5} />
              <p style={{ color: 'var(--text-1)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', margin: 0 }}>
                {label}
              </p>
              <p style={{ color: 'var(--text-3)', fontSize: 'var(--text-xs)', margin: 0, lineHeight: 1.5 }}>
                {desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
