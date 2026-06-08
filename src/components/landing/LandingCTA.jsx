import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LuArrowRight } from 'react-icons/lu';

const ease = [0.16, 1, 0.3, 1];

export default function LandingCTA() {
  return (
    <section style={{ padding: 'clamp(80px, 10vw, 128px) 0', position: 'relative', overflow: 'hidden', borderTop: '1px solid var(--border-1)' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 80%, rgba(139,92,246,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="container-sm" style={{ textAlign: 'center', position: 'relative' }}>
        <motion.div
          initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.4, ease }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', borderRadius: 999, marginBottom: 24 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Free to start</span>
        </motion.div>

        <motion.h2
          style={{ fontSize: 'clamp(32px, 5vw, 60px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, color: 'var(--text-1)', margin: '0 0 20px' }}
          initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5, ease, delay: 0.06 }}>
          Stop guessing.<br />Start improving.
        </motion.h2>

        <motion.p
          style={{ color: 'var(--text-2)', fontSize: 'clamp(15px, 1.8vw, 18px)', lineHeight: 1.65, maxWidth: '44ch', margin: '0 auto 36px' }}
          initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.45, ease, delay: 0.13 }}>
          Join AuraFit, complete a two-minute intake, and receive a structured training plan built for your goal — before your first session.
        </motion.p>

        <motion.div
          style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}
          initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.4, ease, delay: 0.2 }}>
          <Link to="/signup" className="btn btn-primary btn-lg">
            Get started free <LuArrowRight size={15} />
          </Link>
          <Link to="/pricing" className="btn btn-secondary btn-lg">
            View plans
          </Link>
        </motion.div>

        <motion.p
          style={{ color: 'var(--text-4)', fontSize: 12, marginTop: 20 }}
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          viewport={{ once: true }} transition={{ delay: 0.3 }}>
          No credit card required. Cancel anytime.
        </motion.p>
      </div>
    </section>
  );
}
