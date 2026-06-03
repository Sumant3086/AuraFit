import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LuArrowRight, LuDumbbell, LuBarChart2, LuTarget, LuUsers } from 'react-icons/lu';
import { ease, dur } from '../../lib/motion';

const FEATURES = [
  { icon: LuDumbbell,  label: 'AI workout plans',  desc: 'Built around your goals and schedule' },
  { icon: LuBarChart2, label: 'Progress tracking',  desc: 'Measurements and strength over time'  },
  { icon: LuTarget,    label: 'Habit building',     desc: 'Streaks, check-ins, accountability'  },
  { icon: LuUsers,     label: 'Community',          desc: 'Train with people who show up'       },
];

// Headline split into lines for staggered reveal
const HEADLINE = ['Build the habit', 'of showing up.'];

export default function LandingHero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

  // Subtle parallax — label and headline move slightly on scroll
  const labelY  = useTransform(scrollYProgress, [0, 1], [0, -30]);
  const headY   = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const bodyY   = useTransform(scrollYProgress, [0, 1], [0, -20]);
  const opacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  return (
    <section
      ref={ref}
      style={{
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border-1)',
        padding: 'clamp(80px,12vw,140px) clamp(20px,5vw,60px) clamp(64px,10vw,100px)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Ambient glow — barely visible */}
      <div aria-hidden style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: 'clamp(400px,60vw,800px)', height: 'clamp(300px,40vw,500px)',
        background: 'radial-gradient(ellipse at top, rgba(139,92,246,0.05) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 'var(--max-wide)', margin: '0 auto', position: 'relative' }}>

        {/* Label */}
        <motion.p
          style={{ y: labelY, opacity }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: dur.base, ease: ease.out }}
          style2={{
            color: 'var(--text-3)',
            fontSize: 'var(--text-xs)',
            fontWeight: 500,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: 'var(--sp-6)',
          }}
        >
          <span style={{
            color: 'var(--text-3)',
            fontSize: 'var(--text-xs)',
            fontWeight: 500,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: 'var(--sp-6)',
          }}>
            AuraFit
          </span>
        </motion.p>

        {/* Headline — line by line stagger */}
        <motion.div
          style={{ y: headY, opacity }}
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.12, delayChildren: 0.06 } },
          }}
        >
          {HEADLINE.map((line, i) => (
            <div key={i} style={{ overflow: 'hidden', marginBottom: i === 0 ? 6 : 0 }}>
              <motion.h1
                variants={{
                  hidden: { opacity: 0, y: '60%' },
                  show: {
                    opacity: 1, y: '0%',
                    transition: { duration: dur.slow, ease: ease.out },
                  },
                }}
                style={{
                  fontSize: 'var(--text-hero)',
                  fontWeight: 'var(--weight-black)',
                  letterSpacing: '-0.04em',
                  lineHeight: 1.05,
                  color: 'var(--text-1)',
                  margin: 0,
                }}
              >
                {line}
              </motion.h1>
            </div>
          ))}
        </motion.div>

        {/* Body + CTAs */}
        <motion.div
          style={{ y: bodyY, opacity }}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: dur.slow, delay: 0.4, ease: ease.out }}
        >
          <p style={{
            color: 'var(--text-2)',
            fontSize: 'clamp(16px,1.8vw,19px)',
            lineHeight: 'var(--leading-normal)',
            maxWidth: 460,
            margin: 'clamp(20px,3vw,28px) 0 clamp(28px,4vw,40px)',
          }}>
            AuraFit tracks your training, plans your nutrition, and keeps you
            consistent — one focused app for the long game.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur.base, delay: 0.55, ease: ease.out }}
            style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap', marginBottom: 'clamp(56px,9vw,88px)' }}
          >
            <Link to="/signup">
              <motion.button
                whileHover={{ opacity: 0.88, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: dur.micro, ease: ease.sharp }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'var(--text-1)', color: 'var(--bg)',
                  border: 'none', padding: '12px 22px',
                  borderRadius: 'var(--r-md)',
                  fontSize: 'var(--text-base)', fontWeight: 600,
                  cursor: 'pointer', letterSpacing: '-0.01em',
                }}
              >
                Get started
                <motion.span
                  initial={{ x: 0 }}
                  whileHover={{ x: 3 }}
                  transition={{ duration: dur.fast, ease: ease.out }}
                >
                  <LuArrowRight size={15} />
                </motion.span>
              </motion.button>
            </Link>

            <Link to="/features">
              <motion.button
                whileHover={{ background: 'var(--surface-3)' }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: dur.fast, ease: ease.out }}
                style={{
                  display: 'inline-flex', alignItems: 'center',
                  background: 'transparent', color: 'var(--text-2)',
                  border: '1px solid var(--border-2)', padding: '12px 22px',
                  borderRadius: 'var(--r-md)',
                  fontSize: 'var(--text-base)', fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                See features
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Feature strip — staggered reveal */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.07, delayChildren: 0.65 } },
          }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 1,
            background: 'var(--border-1)',
            border: '1px solid var(--border-1)',
            borderRadius: 'var(--r-lg)',
            overflow: 'hidden',
          }}
        >
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <motion.div
              key={label}
              variants={{
                hidden: { opacity: 0, y: 8 },
                show: { opacity: 1, y: 0, transition: { duration: dur.base, ease: ease.out } },
              }}
              style={{ background: 'var(--surface-1)', padding: 'var(--sp-5) var(--sp-5)' }}
            >
              <Icon size={16} color="var(--text-3)" strokeWidth={1.5} style={{ marginBottom: 'var(--sp-3)' }} />
              <p style={{ color: 'var(--text-1)', fontSize: 'var(--text-sm)', fontWeight: 600, margin: '0 0 3px' }}>
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
