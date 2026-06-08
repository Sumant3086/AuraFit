import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LuArrowRight, LuUserCheck, LuBrain, LuQrCode, LuTrendingUp } from 'react-icons/lu';
import SectionHeading from '../common/SectionHeading';

const ease = [0.16, 1, 0.3, 1];

const STEPS = [
  {
    n: '01',
    icon: LuUserCheck,
    title: 'Tell us where you are',
    desc: 'A short intake — your goal, training history, how many days a week you can commit, and what equipment is available. Takes two minutes. No marketing survey.',
    detail: 'Goal · History · Schedule · Equipment',
  },
  {
    n: '02',
    icon: LuBrain,
    title: 'Receive your programme',
    desc: 'AuraFit generates a structured weekly training plan and your daily calorie and macro targets. Specific to you — not a template adjusted for your age range.',
    detail: 'Weekly plan · Calorie target · Macro split',
  },
  {
    n: '03',
    icon: LuQrCode,
    title: 'Train with structure',
    desc: 'Check in at the gym. Book the classes that fit your programme. Schedule a session with a trainer when you want professional eyes on your form. Every visit recorded.',
    detail: 'Check-in · Classes · Trainer sessions',
  },
  {
    n: '04',
    icon: LuTrendingUp,
    title: 'Measure what changed',
    desc: 'Log your body metrics weekly. AuraFit shows you the trend over time and delivers a performance review every Monday — specific feedback, not generic motivation.',
    detail: 'Body metrics · Weekly trend · Monday review',
  },
];

export default function HowItWorks() {
  return (
    <section className="section" style={{ background: 'var(--surface-1)', borderTop: '1px solid var(--border-1)' }}>
      <div className="container">
        <SectionHeading
          label="How it works"
          title="A clear path from day one."
          desc="Most fitness apps give you tools without direction. AuraFit gives you a plan, a structure, and weekly feedback — so you never have to guess what to do next."
        />

        <div className="how-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'clamp(16px, 2.5vw, 28px)', marginBottom: 56 }}>
          {STEPS.map((step, i) => (
            <motion.div key={step.n}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, ease, delay: i * 0.08 }}
              style={{ position: 'relative' }}>
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div style={{ position: 'absolute', top: 20, left: 'calc(100% - 14px)', width: 'calc(100% - 12px)', height: 1, background: 'linear-gradient(90deg, var(--border-2) 0%, transparent 100%)', zIndex: 0 }} />
              )}
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <step.icon size={18} color="var(--accent)" strokeWidth={1.8} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-4)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>{step.n}</span>
                </div>
                <p style={{ color: 'var(--text-1)', fontWeight: 700, fontSize: 15, margin: '0 0 8px', lineHeight: 1.3 }}>{step.title}</p>
                <p style={{ color: 'var(--text-3)', fontSize: 13, lineHeight: 1.65, margin: '0 0 12px' }}>{step.desc}</p>
                <p style={{ color: 'var(--text-4)', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em' }}>{step.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA row */}
        <motion.div
          style={{ display: 'flex', justifyContent: 'center', gap: 14 }}
          initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.45, ease }}>
          <Link to="/signup" className="btn btn-primary btn-lg">
            Get your programme <LuArrowRight size={15} />
          </Link>
          <Link to="/classes" className="btn btn-secondary btn-lg">
            See the class schedule
          </Link>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 820px) {
          .how-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 500px) {
          .how-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
