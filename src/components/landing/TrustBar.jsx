import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LuDumbbell, LuSalad, LuCalendar, LuUsers, LuBarChart2, LuBrain } from 'react-icons/lu';
import SectionHeading from '../common/SectionHeading';

const ease = [0.16, 1, 0.3, 1];

const STATS = [
  { value: '2,000+', label: 'Active members' },
  { value: '27+',    label: 'Weekly classes' },
  { value: '98%',    label: 'Member retention' },
  { value: '4.9★',   label: 'Average rating' },
];

const PILLARS = [
  {
    icon: LuBrain,
    title: 'Structured Training Plans',
    desc: 'Your plan is generated around your goals, experience level, and schedule — not copied from a template. Adjusts weekly based on what you log.',
    link: '/features',
    color: 'var(--accent)',
    colorRaw: '#8B5CF6',
  },
  {
    icon: LuSalad,
    title: 'Nutrition That Makes Sense',
    desc: 'Calculate your daily calorie and macro targets based on your actual body and goal. No diet plans, no restrictions — just clear numbers to hit.',
    link: '/features',
    color: 'var(--green)',
    colorRaw: '#22C55E',
  },
  {
    icon: LuCalendar,
    title: 'Classes That Fit Your Schedule',
    desc: '27+ weekly instructor-led sessions — strength, HIIT, yoga, boxing, cycling. Book your spot from your phone before you leave the house.',
    link: '/classes',
    color: 'var(--amber)',
    colorRaw: '#F59E0B',
  },
  {
    icon: LuUsers,
    title: 'Trainers Worth Booking',
    desc: 'Certified coaches with real specialisations. One session to assess where you are and build a plan that makes sense for your body and your goal.',
    link: '/trainers',
    color: 'var(--accent)',
    colorRaw: '#6366F1',
  },
  {
    icon: LuBarChart2,
    title: 'Progress You Can See',
    desc: 'Log your check-ins, body metrics, and weekly effort. A performance insight lands every Monday morning so you know exactly what to work on.',
    link: '/features',
    color: 'var(--cyan-color)',
    colorRaw: '#06B6D4',
  },
  {
    icon: LuDumbbell,
    title: 'A Community That Trains',
    desc: 'Leaderboards based on consistency, not just effort. Share progress, ask questions, stay accountable — with members who are genuinely working.',
    link: '/community',
    color: 'var(--accent)',
    colorRaw: '#EC4899',
  },
];

export default function TrustBar() {
  return (
    <>
      {/* Stats bar */}
      <div style={{ background: 'var(--surface-1)', borderTop: '1px solid var(--border-1)', borderBottom: '1px solid var(--border-1)' }}>
        <div className="container">
          <div className="stats-bar">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                className="stats-bar__item"
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, ease, delay: i * 0.06 }}
              >
                <span className="stats-bar__value">{s.value}</span>
                <span className="stats-bar__label">{s.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Platform pillars */}
      <section className="section section--surface section--border">
        <div className="container">
          <SectionHeading
            label="The Platform"
            title="Six pillars. One consistent programme."
            desc="Most gyms give you access. AuraFit gives you structure. Every part of the platform is connected to your plan and your progress."
          />
          <div className="grid-3">
            {PILLARS.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, ease, delay: i * 0.06 }}
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border-1)',
                  borderRadius: 16,
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = `${p.colorRaw}35`;
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: `${p.colorRaw}15`, border: `1px solid ${p.colorRaw}28`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <p.icon size={18} color={p.color} strokeWidth={1.8} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: 'var(--text-1)', fontWeight: 700, fontSize: 15, margin: '0 0 7px' }}>{p.title}</p>
                  <p style={{ color: 'var(--text-3)', fontSize: 13, lineHeight: 1.65, margin: 0 }}>{p.desc}</p>
                </div>
                <Link to={p.link} style={{ fontSize: 12, fontWeight: 600, color: p.color, textDecoration: 'none' }}>
                  Learn more →
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .stats-bar {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          padding: clamp(20px, 3vw, 32px) 0;
        }
        .stats-bar__item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 12px;
          text-align: center;
        }
        .stats-bar__item + .stats-bar__item {
          border-left: 1px solid var(--border-1);
        }
        .stats-bar__value {
          font-size: clamp(22px, 3vw, 32px);
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--text-1);
          line-height: 1;
        }
        .stats-bar__label {
          font-size: 12px;
          color: var(--text-3);
          font-weight: 500;
        }
        @media (max-width: 640px) {
          .stats-bar { grid-template-columns: repeat(2, 1fr); }
          .stats-bar__item:nth-child(3) { border-left: none; }
          .stats-bar__item:nth-child(3), .stats-bar__item:nth-child(4) { border-top: 1px solid var(--border-1); }
        }
      `}</style>
    </>
  );
}
