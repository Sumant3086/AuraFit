import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import Footer from '../footer/Footer';
import apiService, { getRazorpayKey } from '../../services/api';
import { LuCheck, LuMinus, LuArrowRight, LuShieldCheck, LuZap, LuRefreshCw, LuHeadphones } from 'react-icons/lu';

const ease = [0.16, 1, 0.3, 1];

const PLANS = [
  {
    id: 'Basic',
    name: 'Starter',
    price: { monthly: 999, annual: 799 },
    tagline: 'Full platform access. Enough gym visits to build a real habit.',
    popular: false,
    features: [
      '10 gym visits per month',
      'Personalised training plan',
      'Nutrition calculator + macro targets',
      'QR attendance check-in',
      'Weekly progress tracking',
      'Ladies zone and boxing arena access',
      'Community feed access',
    ],
    cta: 'Start with Starter',
    color: '#06B6D4',
  },
  {
    id: 'Pro',
    name: 'Member',
    price: { monthly: 1699, annual: 1359 },
    tagline: 'For members who train consistently and want professional support.',
    popular: false,
    features: [
      'Unlimited gym visits',
      'All training and nutrition tools',
      '2 personal trainer sessions per month',
      'Unlimited class bookings',
      'Daily protein shake',
      'Dedicated locker',
      'Priority class booking window',
    ],
    cta: 'Choose Member',
    color: '#8B5CF6',
  },
  {
    id: 'Premium',
    name: 'Elite',
    price: { monthly: 2499, annual: 1999 },
    tagline: 'Everything in Member, plus the resources to train without compromise.',
    popular: true,
    features: [
      'Everything in Member',
      '4 personal trainer sessions per month',
      'Quarterly body composition analysis',
      'One nutrition consultation per month',
      'AuraFit exclusive merchandise kit',
      '2 guest passes per month',
      'First access to class bookings',
    ],
    cta: 'Go Elite',
    color: '#F59E0B',
  },
];

const COMPARISON = [
  { feature: 'Gym access', starter: '10 visits/mo', member: 'Unlimited', elite: 'Unlimited 24/7' },
  { feature: 'AI workout plans', starter: true, member: true, elite: true },
  { feature: 'Nutrition calculator', starter: true, member: true, elite: true },
  { feature: 'QR check-in', starter: true, member: true, elite: true },
  { feature: 'Progress tracking', starter: true, member: true, elite: true },
  { feature: 'Group classes', starter: false, member: true, elite: true },
  { feature: 'Trainer sessions', starter: false, member: '2/month', elite: '4/month' },
  { feature: 'Protein shakes', starter: false, member: true, elite: true },
  { feature: 'Body composition analysis', starter: false, member: false, elite: true },
  { feature: 'Guest passes', starter: false, member: false, elite: '2/month' },
  { feature: 'Exclusive merchandise', starter: false, member: false, elite: true },
];

const TRUST = [
  { icon: LuShieldCheck, label: 'Secure payments', desc: 'Powered by Razorpay' },
  { icon: LuZap,         label: 'Instant activation', desc: 'Access from today' },
  { icon: LuRefreshCw,   label: 'Cancel anytime', desc: 'No lock-in period' },
  { icon: LuHeadphones,  label: '24/7 support', desc: 'Always available' },
];

export default function Pricing() {
  const navigate            = useNavigate();
  const { isAuthenticated } = useAuth();
  const [billing, setBilling]       = useState('monthly');
  const [loadingPlan, setLoading]   = useState(null);
  const [showComparison, setShowComparison] = useState(false);

  const handleSelect = async (plan) => {
    if (!isAuthenticated) {
      localStorage.setItem('redirectAfterLogin', '/pricing');
      localStorage.setItem('selectedPlan', plan.id);
      toast.error('Please sign in to purchase a membership');
      navigate('/login');
      return;
    }

    setLoading(plan.id);
    const toastId = toast.loading(`Setting up ${plan.name} membership…`);

    try {
      let retries = 0;
      while (!window.Razorpay && retries < 10) {
        await new Promise(r => setTimeout(r, 500));
        retries++;
      }
      if (!window.Razorpay) {
        toast.error('Payment system failed to load. Please refresh.', { id: toastId });
        return;
      }

      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const price = billing === 'annual' ? plan.price.annual : plan.price.monthly;

      const data = await apiService.membership.purchase({
        userId: userData.id, name: userData.name, email: userData.email,
        plan: plan.id, price, duration: billing === 'annual' ? '12-month' : '1-month',
        paymentStatus: 'pending',
      });

      if (!data.success) {
        toast.error(data.message || 'Failed to initiate purchase', { id: toastId });
        return;
      }

      const orderResponse = await apiService.orders.createRazorpayOrder({ amount: price, orderId: data.data.order._id });
      if (!orderResponse.success) {
        toast.error('Failed to initialize payment.', { id: toastId });
        return;
      }

      toast.dismiss(toastId);
      const razorpayKey = await getRazorpayKey();

      const rzp = new window.Razorpay({
        key: razorpayKey,
        amount: orderResponse.data.amount,
        currency: orderResponse.data.currency || 'INR',
        name: 'AuraFit',
        description: `${plan.name} Membership`,
        order_id: orderResponse.data.orderId,
        prefill: { name: userData.name || '', email: userData.email || '' },
        theme: { color: plan.color },
        handler: async (response) => {
          const vt = toast.loading('Verifying payment…');
          try {
            const verify = await apiService.orders.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (verify.success) {
              toast.success(`${plan.name} membership activated!`, { id: vt, duration: 5000 });
              setTimeout(() => navigate('/dashboard'), 1500);
            } else {
              toast.error('Payment verification failed. Contact support.', { id: vt });
            }
          } catch {
            toast.error('Verification error. Contact support.', { id: vt });
          }
        },
        modal: { ondismiss: () => toast('Payment cancelled') },
      });
      rzp.on('payment.failed', e => toast.error(`Payment failed: ${e.error?.description || 'Unknown error'}`));
      rzp.open();
    } catch {
      toast.error('Something went wrong. Please try again.', { id: toastId });
    } finally {
      setLoading(null);
    }
  };

  const handleFreeTrial = async () => {
    if (!isAuthenticated) { toast.error('Please sign in first'); navigate('/login'); return; }
    const id = toast.loading('Claiming your free day pass…');
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const data = await apiService.membership.freeTrial({ userId: userData.id, name: userData.name, email: userData.email });
      if (data.success) toast.success('Free day pass claimed! Check your email.', { id, duration: 5000 });
      else toast.error(data.message || 'Failed to claim', { id });
    } catch {
      toast.success('Day pass voucher sent to your email.', { id });
    }
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* ── Page hero ──────────────────────────────────────────── */}
      <div style={{
        borderBottom: '1px solid var(--border-1)',
        padding: 'clamp(56px, 9vw, 96px) clamp(20px, 5vw, 60px) clamp(40px, 6vw, 64px)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 100% 50% at 50% 0%, rgba(139,92,246,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          style={{ position: 'relative' }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', borderRadius: 999, padding: '5px 14px', marginBottom: 22 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
            <span style={{ color: 'var(--accent)', fontSize: 12, fontWeight: 600, letterSpacing: '0.02em' }}>Simple, transparent pricing</span>
          </div>

          <h1 style={{ color: 'var(--text-1)', fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, margin: '0 0 16px', lineHeight: 1.1, letterSpacing: '-0.03em' }}>
            Pick the plan that fits<br />
            <span style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              how seriously you train
            </span>
          </h1>

          <p style={{ color: 'var(--text-2)', fontSize: 'clamp(15px, 1.6vw, 17px)', maxWidth: 500, margin: '0 auto 32px', lineHeight: 1.65 }}>
            Every plan includes the full platform — training tools, nutrition calculator, progress tracking, and community. The tier determines how much gym access and trainer support you get.
          </p>

          {/* Billing toggle */}
          <div style={{ display: 'inline-flex', background: 'var(--surface-2)', border: '1px solid var(--border-2)', borderRadius: 999, padding: 4, gap: 2 }}>
            {['monthly', 'annual'].map(b => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                style={{
                  padding: '7px 20px',
                  borderRadius: 999,
                  border: 'none',
                  background: billing === b ? 'var(--text-1)' : 'transparent',
                  color: billing === b ? 'var(--bg)' : 'var(--text-3)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.18s, color 0.18s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {b === 'annual' ? 'Annual' : 'Monthly'}
                {b === 'annual' && (
                  <span style={{ fontSize: 10, background: 'var(--green-dim)', color: 'var(--green)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 999, padding: '1px 6px', fontWeight: 700 }}>
                    Save 20%
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Plan cards ──────────────────────────────────────────── */}
      <div className="container" style={{ paddingTop: 'var(--sp-12)', paddingBottom: 'var(--sp-6)' }}>
        <div className="pricing-cards">
          {PLANS.map((plan, i) => {
            const price = billing === 'annual' ? plan.price.annual : plan.price.monthly;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5, ease }}
                style={{
                  position: 'relative',
                  background: plan.popular
                    ? 'linear-gradient(160deg, rgba(245,158,11,0.07) 0%, var(--surface-2) 35%)'
                    : 'var(--surface-2)',
                  border: `1px solid ${plan.popular ? 'rgba(245,158,11,0.35)' : 'var(--border-1)'}`,
                  borderRadius: 20,
                  padding: 28,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0,
                  boxShadow: plan.popular ? '0 0 0 1px rgba(245,158,11,0.2), var(--shadow-xl)' : 'none',
                }}
              >
                {plan.popular && (
                  <div style={{
                    position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                    borderRadius: 999, padding: '4px 18px',
                    fontSize: 10, fontWeight: 800, color: '#fff',
                    letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap',
                  }}>
                    Most Popular
                  </div>
                )}

                {/* Plan header */}
                <div style={{ marginBottom: 20 }}>
                  <p style={{ color: plan.color, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>
                    {plan.name}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                    <span style={{ color: 'var(--text-1)', fontSize: 44, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em' }}>
                      ₹{price.toLocaleString()}
                    </span>
                    <span style={{ color: 'var(--text-3)', fontSize: 13 }}>/month</span>
                  </div>
                  {billing === 'annual' && (
                    <p style={{ color: 'var(--green)', fontSize: 12, fontWeight: 600, margin: '0 0 6px' }}>
                      Billed ₹{(price * 12).toLocaleString()}/year · Save ₹{((plan.price.monthly - price) * 12).toLocaleString()}
                    </p>
                  )}
                  <p style={{ color: 'var(--text-3)', fontSize: 13, margin: 0, lineHeight: 1.5 }}>{plan.tagline}</p>
                </div>

                {/* CTA */}
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => handleSelect(plan)}
                  disabled={loadingPlan === plan.id}
                  style={{
                    width: '100%', padding: '12px',
                    marginBottom: 24,
                    background: plan.popular ? 'linear-gradient(135deg, #F59E0B, #D97706)' : 'transparent',
                    border: `1px solid ${plan.popular ? 'transparent' : 'var(--border-2)'}`,
                    borderRadius: 10,
                    color: plan.popular ? '#fff' : 'var(--text-1)',
                    fontSize: 14, fontWeight: 700, cursor: loadingPlan === plan.id ? 'wait' : 'pointer',
                    opacity: loadingPlan === plan.id ? 0.7 : 1,
                    transition: 'opacity 0.15s, transform 0.12s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  }}
                >
                  {loadingPlan === plan.id ? 'Processing…' : <>{plan.cta} <LuArrowRight size={14} /></>}
                </motion.button>

                {/* Feature list */}
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 13, color: 'var(--text-2)' }}>
                      <div style={{ width: 16, height: 16, borderRadius: '50%', flexShrink: 0, marginTop: 1, background: `${plan.color}18`, border: `1px solid ${plan.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <LuCheck size={9} color={plan.color} strokeWidth={3} />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Free trial ──────────────────────────────────────────── */}
      <div className="container" style={{ paddingBottom: 'var(--sp-6)' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.5, ease }}
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 20, padding: 'clamp(28px, 4vw, 40px)', textAlign: 'center' }}
        >
          <p style={{ color: 'var(--text-3)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 8px' }}>
            Want to see it first?
          </p>
          <h3 style={{ color: 'var(--text-1)', fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Train for a day, on us
          </h3>
          <p style={{ color: 'var(--text-3)', fontSize: 14, margin: '0 auto 24px', maxWidth: 380, lineHeight: 1.6 }}>
            Claim a complimentary day pass. Use the gym, attend a class, meet a trainer. No card required, no obligation.
          </p>
          <button
            onClick={handleFreeTrial}
            className="btn btn-secondary btn-lg"
          >
            Claim free day pass
          </button>
        </motion.div>
      </div>

      {/* ── Feature comparison table ────────────────────────────── */}
      <div className="container" style={{ paddingBottom: 'var(--sp-8)' }}>
        <button
          onClick={() => setShowComparison(v => !v)}
          style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, margin: '0 auto', padding: '12px 0' }}
        >
          {showComparison ? 'Hide' : 'View'} full feature comparison
          <span style={{ transition: 'transform 0.2s', display: 'inline-block', transform: showComparison ? 'rotate(180deg)' : 'none' }}>↓</span>
        </button>

        {showComparison && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease }}
            style={{ overflowX: 'auto', marginTop: 16 }}
          >
            <table className="comparison-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', paddingLeft: 0 }}>Feature</th>
                  <th>Starter</th>
                  <th>Member</th>
                  <th style={{ color: 'var(--amber)' }}>Elite</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map(row => (
                  <tr key={row.feature}>
                    <td style={{ textAlign: 'left', paddingLeft: 0, color: 'var(--text-2)', fontSize: 13 }}>{row.feature}</td>
                    {['starter', 'member', 'elite'].map(tier => (
                      <td key={tier} style={{ textAlign: 'center' }}>
                        {row[tier] === true  && <LuCheck size={15} color="var(--green)" strokeWidth={2.5} />}
                        {row[tier] === false && <LuMinus size={14} color="var(--text-4)" strokeWidth={2} />}
                        {typeof row[tier] === 'string' && (
                          <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>{row[tier]}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </div>

      {/* ── Trust signals ───────────────────────────────────────── */}
      <div className="container" style={{ paddingBottom: 'var(--sp-20)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--sp-4)' }} className="trust-grid">
          {TRUST.map((t, i) => (
            <motion.div
              key={t.label}
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.4, ease }}
              style={{ textAlign: 'center', padding: 'var(--sp-5)' }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <t.icon size={16} color="var(--accent)" strokeWidth={1.8} />
              </div>
              <p style={{ color: 'var(--text-1)', fontSize: 13, fontWeight: 600, margin: '0 0 4px' }}>{t.label}</p>
              <p style={{ color: 'var(--text-3)', fontSize: 12, margin: 0 }}>{t.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <Footer />

      <style>{`
        .pricing-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: clamp(16px, 2.5vw, 24px);
          align-items: start;
        }
        .comparison-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 520px;
        }
        .comparison-table th {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-3);
          text-transform: uppercase;
          letter-spacing: 0.07em;
          padding: 10px 16px;
          border-bottom: 1px solid var(--border-1);
        }
        .comparison-table td {
          padding: 11px 16px;
          border-bottom: 1px solid var(--border-1);
          vertical-align: middle;
        }
        .comparison-table tr:last-child td { border-bottom: none; }
        .comparison-table tr:hover td { background: var(--surface-2); }
        @media (max-width: 860px) {
          .pricing-cards { grid-template-columns: 1fr; }
          .trust-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .trust-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
