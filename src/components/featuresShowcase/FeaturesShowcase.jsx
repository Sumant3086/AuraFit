import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LuArrowRight, LuCheck } from 'react-icons/lu';
import SectionHeading from '../common/SectionHeading';

const ease = [0.16, 1, 0.3, 1];

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 999,
    desc: 'Full platform access and enough gym visits to build a real training habit.',
    highlight: false,
    features: [
      '10 gym visits per month',
      'Personalised training plan',
      'Nutrition calculator',
      'Attendance check-in',
      'Weekly progress tracking',
    ],
    cta: 'Start with Starter',
    ctaTo: '/pricing',
  },
  {
    id: 'member',
    name: 'Member',
    price: 1699,
    desc: 'Unlimited access, professional trainer support, and every class included.',
    highlight: true,
    features: [
      'Unlimited gym visits',
      'All training and nutrition tools',
      '2 trainer sessions per month',
      'All group classes included',
      'Priority booking window',
    ],
    cta: 'Choose Member',
    ctaTo: '/pricing',
    badge: 'Most Popular',
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 2499,
    desc: 'Everything in Member, with deeper coaching and quarterly body analysis.',
    highlight: false,
    features: [
      'Everything in Member',
      '4 trainer sessions per month',
      'Quarterly body composition analysis',
      'Monthly nutrition consultation',
      'AuraFit merchandise kit',
    ],
    cta: 'Go Elite',
    ctaTo: '/pricing',
  },
];

export default function FeaturesShowcase() {
  return (
    <section className="section" style={{ background: 'var(--surface-1)', borderTop: '1px solid var(--border-1)' }}>
      <div className="container">
        <SectionHeading
          label="Membership"
          title="Pick a plan. Build a routine."
          desc="Every plan includes the full platform — training tools, nutrition targets, and progress tracking. Your tier determines how much gym access and trainer time you get."
        />

        <div className="grid-3" style={{ marginBottom: 36 }}>
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease, delay: i * 0.07 }}
              style={{
                background: plan.highlight
                  ? 'linear-gradient(160deg, rgba(139,92,246,0.10) 0%, rgba(99,102,241,0.05) 100%)'
                  : 'var(--surface-2)',
                border: plan.highlight ? '1px solid var(--accent-border)' : '1px solid var(--border-1)',
                borderRadius: 18,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: plan.highlight ? '0 8px 32px rgba(139,92,246,0.12)' : 'none',
              }}
            >
              {plan.badge && (
                <div style={{ position: 'absolute', top: 16, right: 16, padding: '3px 10px', background: 'var(--accent)', borderRadius: 999, fontSize: 10, fontWeight: 700, color: '#fff', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {plan.badge}
                </div>
              )}

              <div>
                <p style={{ color: 'var(--text-2)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 8px' }}>
                  {plan.name}
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                  <span style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-1)', lineHeight: 1 }}>
                    ₹{plan.price.toLocaleString()}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-3)' }}>/month</span>
                </div>
                <p style={{ color: 'var(--text-3)', fontSize: 13, lineHeight: 1.55, margin: 0 }}>{plan.desc}</p>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-2)' }}>
                    <LuCheck size={12} color="var(--green)" strokeWidth={2.5} style={{ flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to={plan.ctaTo}
                className={`btn ${plan.highlight ? 'btn-primary' : 'btn-secondary'}`}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link
            to="/pricing"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--accent)', textDecoration: 'none' }}
          >
            View full plan comparison <LuArrowRight size={13} />
          </Link>
        </div>
      </div>
    </section>
  );
}
