import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LuArrowRight, LuActivity, LuCalendarCheck, LuTrendingUp } from 'react-icons/lu';
import SectionHeading from '../common/SectionHeading';

const ease = [0.16, 1, 0.3, 1];

function DayCard({ day, type, active }) {
  return (
    <div style={{
      padding: '10px 14px', borderRadius: 10,
      background: active ? 'var(--accent-dim)' : 'var(--surface-3)',
      border: `1px solid ${active ? 'var(--accent-border)' : 'var(--border-1)'}`,
      minWidth: 90,
    }}>
      <p style={{ color: active ? 'var(--accent)' : 'var(--text-3)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 4px' }}>{day}</p>
      <p style={{ color: active ? 'var(--text-1)' : 'var(--text-2)', fontSize: 12, fontWeight: 600, margin: 0 }}>{type}</p>
    </div>
  );
}

function WeeklyPlanMockup() {
  const days = [
    { day: 'MON', type: 'Push A',  active: false },
    { day: 'TUE', type: 'Pull A',  active: false },
    { day: 'WED', type: 'Rest',    active: false },
    { day: 'THU', type: 'Legs A',  active: true  },
    { day: 'FRI', type: 'Push B',  active: false },
    { day: 'SAT', type: 'Pull B',  active: false },
    { day: 'SUN', type: 'Rest',    active: false },
  ];
  return (
    <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)', borderRadius: 16, padding: 20, boxShadow: 'var(--shadow-lg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LuActivity size={12} color="var(--accent)" strokeWidth={2} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', letterSpacing: '0.04em' }}>Weekly Program — Push/Pull/Legs</span>
      </div>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
        {days.map(d => <DayCard key={d.day} {...d} />)}
      </div>
      <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--surface-3)', borderRadius: 10, border: '1px solid var(--border-1)' }}>
        <p style={{ color: 'var(--text-3)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 6px' }}>Today — Legs A</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {['Squat 4×6', 'Romanian DL 3×10', 'Leg Press 3×12', 'Calf Raise 4×15'].map(e => (
            <span key={e} style={{ padding: '3px 8px', background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', borderRadius: 6, fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>{e}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProgressMockup() {
  const weeks = [
    { week: 'W1', weight: 88, pct: 55 },
    { week: 'W2', weight: 87, pct: 52 },
    { week: 'W3', weight: 86.2, pct: 48 },
    { week: 'W4', weight: 85.5, pct: 45 },
    { week: 'W5', weight: 84.8, pct: 42 },
    { week: 'W6', weight: 84.0, pct: 40 },
  ];
  return (
    <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)', borderRadius: 16, padding: 20, boxShadow: 'var(--shadow-lg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LuTrendingUp size={12} color="var(--green)" strokeWidth={2} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', letterSpacing: '0.04em' }}>6-Week Progress Snapshot</span>
      </div>
      <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
        <div><p style={{ color: 'var(--text-3)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 4px' }}>Starting</p><p style={{ color: 'var(--text-1)', fontWeight: 800, fontSize: 22, margin: 0, lineHeight: 1 }}>88 kg</p></div>
        <div><p style={{ color: 'var(--text-3)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 4px' }}>Current</p><p style={{ color: 'var(--green)', fontWeight: 800, fontSize: 22, margin: 0, lineHeight: 1 }}>84 kg</p></div>
        <div><p style={{ color: 'var(--text-3)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 4px' }}>Change</p><p style={{ color: 'var(--green)', fontWeight: 800, fontSize: 22, margin: 0, lineHeight: 1 }}>−4 kg</p></div>
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 60 }}>
        {weeks.map(w => (
          <div key={w.week} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ width: '100%', background: 'var(--accent)', borderRadius: '4px 4px 0 0', height: `${w.pct}%`, minHeight: 8, opacity: 0.5 + (weeks.indexOf(w) * 0.08) }} />
            <span style={{ fontSize: 9, color: 'var(--text-3)', fontWeight: 600 }}>{w.week}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProductShowcase() {
  return (
    <section className="section">
      <div className="container">
        {/* AI Workout section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(40px, 6vw, 80px)', alignItems: 'center', marginBottom: 'clamp(80px, 10vw, 120px)' }}>
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, ease }}>
            <WeeklyPlanMockup />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, ease, delay: 0.1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', borderRadius: 999, marginBottom: 18 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Training Plans</span>
            </div>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.1, color: 'var(--text-1)', margin: '0 0 16px' }}>
              A real programme. Not a suggestion.
            </h2>
            <p style={{ color: 'var(--text-2)', fontSize: 15, lineHeight: 1.7, margin: '0 0 24px', maxWidth: '42ch' }}>
              Answer a short intake form about your goals, training history, and schedule. AuraFit generates a structured weekly programme built around progressive overload — not a list of exercises someone else did.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 9 }}>
              {['Programmed around your available days and equipment', 'Exercises with working sets, rep targets, and load progression', 'Recalibrates based on your logged performance each week'].map(f => (
                <li key={f} className="check-item">{f}</li>
              ))}
            </ul>
            <Link to="/features" className="btn btn-secondary">
              Build your programme <LuArrowRight size={14} />
            </Link>
          </motion.div>
        </div>

        {/* Progress tracking section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(40px, 6vw, 80px)', alignItems: 'center' }}>
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, ease, delay: 0.1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 999, marginBottom: 18 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Progress Tracking</span>
            </div>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.1, color: 'var(--text-1)', margin: '0 0 16px' }}>
              Know if what you're doing is working.
            </h2>
            <p style={{ color: 'var(--text-2)', fontSize: 15, lineHeight: 1.7, margin: '0 0 24px', maxWidth: '42ch' }}>
              Log your weight and measurements weekly. AuraFit shows you the direction of change — not just the latest number — and generates a structured performance review every Monday morning.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 9 }}>
              {['Body weight, body fat %, and circumference measurements', 'Six-week trend graph so you see the trajectory, not just today', 'Monday morning insight: what to adjust and why'].map(f => (
                <li key={f} className="check-item">{f}</li>
              ))}
            </ul>
            <Link to="/features" className="btn btn-secondary">
              See your first insight <LuArrowRight size={14} />
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, ease }}>
            <ProgressMockup />
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 820px) {
          .showcase-grid { grid-template-columns: 1fr !important; }
          .showcase-grid .mockup-col { order: -1; }
        }
      `}</style>
    </section>
  );
}
