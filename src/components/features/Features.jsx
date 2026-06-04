import React from 'react';
import { motion } from 'framer-motion';
import WorkoutGenerator from './WorkoutGenerator';
import BodyTracker from './BodyTracker';
import NutritionCalculator from './NutritionCalculator';
import Footer from '../footer/Footer';
import Reveal from '../common/Reveal';
import { ease, dur } from '../../lib/motion';

export default function Features() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{
        borderBottom: '1px solid var(--border-1)',
        padding: 'clamp(48px,8vw,80px) clamp(20px,5vw,60px) clamp(32px,5vw,48px)',
      }}>
        <div style={{ maxWidth: 'var(--max-wide)', margin: '0 auto' }}>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur.base, ease: ease.out }}
            style={{ color: 'var(--text-3)', fontSize: 'var(--text-xs)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 var(--sp-4)' }}
          >
            AI Tools
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur.slow, delay: 0.06, ease: ease.out }}
            style={{ fontSize: 'clamp(28px,5vw,52px)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-1)', margin: '0 0 var(--sp-3)', lineHeight: 1.1 }}
          >
            Your fitness tools
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur.base, delay: 0.15, ease: ease.out }}
            style={{ color: 'var(--text-2)', fontSize: 'clamp(15px,1.6vw,17px)', maxWidth: 420, margin: 0, lineHeight: 1.65 }}
          >
            Generate workout plans, track your body, and plan nutrition — all in one place.
          </motion.p>
        </div>
      </div>

      {/* Feature sections */}
      <div style={{ paddingBottom: 'var(--sp-20)' }}>
        <Reveal delay={0.1}>
          <WorkoutGenerator />
        </Reveal>
        <Reveal delay={0.1}>
          <NutritionCalculator />
        </Reveal>
        <Reveal delay={0.1}>
          <BodyTracker />
        </Reveal>
      </div>

      <Footer />
    </div>
  );
}
