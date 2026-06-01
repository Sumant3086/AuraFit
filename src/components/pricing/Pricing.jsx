import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import Footer from '../footer/Footer';
import apiService, { getRazorpayKey } from '../../services/api';

const PLANS = [
  {
    id: 'Basic',
    price: 999,
    period: '/month',
    label: 'Basic',
    tagline: 'Perfect for getting started',
    color: '#00d4ff',
    features: [
      '10 gym entries per month',
      'Ladies exclusive zone',
      'Boxing arena access',
      'Personal locker facility',
      'AI workout & nutrition tools',
      'Progress tracking dashboard',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    id: 'Premium',
    price: 2499,
    period: '/month',
    label: 'Premium',
    tagline: 'Everything you need to transform',
    color: '#9d00ff',
    features: [
      'Unlimited 24/7 gym access',
      'All group classes included',
      'Ladies exclusive zone',
      'Boxing arena & equipment',
      '4 personal training sessions',
      'Free protein shakes daily',
      'Body composition analysis',
      'Nutrition consultation',
      'AuraFit premium merchandise',
      'Guest passes (2/month)',
    ],
    cta: 'Join Premium',
    popular: true,
  },
  {
    id: 'Pro',
    price: 1699,
    period: '/month',
    label: 'Pro',
    tagline: 'More access, more results',
    color: '#f59e0b',
    features: [
      '20 gym entries per month',
      'All group classes included',
      'Ladies exclusive zone',
      'Boxing arena access',
      '2 personal training sessions',
      'Free protein shakes',
      'Personal locker',
      'AI fitness tools access',
    ],
    cta: 'Choose Pro',
    popular: false,
  },
];

const TRUST_ITEMS = [
  { icon: '🔒', label: 'Secure Payments', desc: 'Powered by Razorpay' },
  { icon: '⚡', label: 'Instant Activation', desc: 'Start today' },
  { icon: '🔄', label: 'Cancel Anytime', desc: 'No lock-in contracts' },
  { icon: '💬', label: '24/7 Support', desc: 'Always here to help' },
];

export default function Pricing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState(null);

  const handleMembershipClick = async (plan) => {
    if (!isAuthenticated) {
      localStorage.setItem('redirectAfterLogin', '/pricing');
      localStorage.setItem('selectedPlan', plan.id);
      toast.error('Please sign in to purchase a membership');
      navigate('/login');
      return;
    }

    setLoadingPlan(plan.id);
    const toastId = toast.loading(`Setting up ${plan.label} membership...`);

    try {
      // Wait for Razorpay SDK (max 5s)
      let retries = 0;
      while (!window.Razorpay && retries < 10) {
        await new Promise(r => setTimeout(r, 500));
        retries++;
      }
      if (!window.Razorpay) {
        toast.error('Payment system failed to load. Please refresh and try again.', { id: toastId });
        return;
      }

      const userData = JSON.parse(localStorage.getItem('user') || '{}');

      const data = await apiService.membership.purchase({
        userId: userData.id,
        name: userData.name,
        email: userData.email,
        plan: plan.id,
        price: plan.price,
        duration: '1-month',
        paymentStatus: 'pending',
      });

      if (!data.success) {
        toast.error(data.message || 'Failed to initiate purchase', { id: toastId });
        return;
      }

      const orderResponse = await apiService.orders.createRazorpayOrder({
        amount: plan.price,
        orderId: data.data.order._id,
      });

      if (!orderResponse.success) {
        toast.error('Failed to initialize payment. Please try again.', { id: toastId });
        return;
      }

      toast.dismiss(toastId);
      const razorpayKey = await getRazorpayKey();

      const rzp = new window.Razorpay({
        key: razorpayKey,
        amount: orderResponse.data.amount,
        currency: orderResponse.data.currency || 'INR',
        name: 'AuraFit',
        description: `${plan.label} Membership`,
        order_id: orderResponse.data.orderId,
        prefill: { name: userData.name || '', email: userData.email || '' },
        theme: { color: plan.color },
        handler: async (response) => {
          const verifyToast = toast.loading('Verifying payment...');
          try {
            const verify = await apiService.orders.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (verify.success) {
              toast.success(`🎉 ${plan.label} membership activated!`, { id: verifyToast, duration: 5000 });
              setTimeout(() => navigate('/dashboard'), 1500);
            } else {
              toast.error('Payment verification failed. Contact support with your payment ID.', { id: verifyToast });
            }
          } catch {
            toast.error('Verification error. Contact support@aurafit.com', { id: verifyToast });
          }
        },
        modal: { ondismiss: () => toast('Payment cancelled', { icon: '↩️' }) },
      });

      rzp.on('payment.failed', (e) => {
        toast.error(`Payment failed: ${e.error?.description || 'Unknown error'}`);
      });

      rzp.open();
    } catch (err) {
      toast.error('Something went wrong. Please try again.', { id: toastId });
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleFreeEntry = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to claim your free day pass');
      navigate('/login');
      return;
    }
    const id = toast.loading('Claiming your free day pass...');
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const data = await apiService.membership.freeTrial({
        userId: userData.id, name: userData.name, email: userData.email,
      });
      if (data.success) {
        toast.success('🎉 Free day pass claimed! Check your email.', { id, duration: 5000 });
      } else {
        toast.error(data.message || 'Failed to claim free trial', { id });
      }
    } catch {
      toast.success('🎉 Free day pass voucher sent to your email!', { id });
    }
  };

  return (
    <div style={{ background: 'var(--surface-base)', minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{
        background: 'radial-gradient(ellipse 120% 60% at 50% 0%, rgba(157,0,255,0.12) 0%, transparent 70%)',
        padding: 'var(--space-20) var(--space-4) var(--space-16)',
        textAlign: 'center',
      }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--brand-purple-dim)', border: '1px solid var(--border-accent)',
            borderRadius: 'var(--radius-pill)', padding: '6px 16px', marginBottom: 'var(--space-5)',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-purple)' }} />
            <span style={{ color: 'var(--brand-purple)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
              Simple, transparent pricing
            </span>
          </div>

          <h1 style={{
            color: 'var(--text-primary)', fontSize: 'clamp(32px, 5vw, 52px)',
            fontWeight: 800, margin: '0 0 var(--space-4)', lineHeight: 1.1, letterSpacing: '-0.02em',
          }}>
            Invest in your<br />
            <span style={{ background: 'var(--brand-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              strongest self
            </span>
          </h1>

          <p style={{
            color: 'var(--text-secondary)', fontSize: 'var(--text-lg)',
            maxWidth: 480, margin: '0 auto var(--space-8)', lineHeight: 'var(--leading-normal)',
          }}>
            No hidden fees. Cancel anytime. Start your transformation with AI-powered fitness.
          </p>
        </motion.div>
      </div>

      {/* Pricing cards */}
      <div style={{ maxWidth: 'var(--container-xl)', margin: '0 auto', padding: '0 var(--space-4) var(--space-16)' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--space-5)', alignItems: 'start',
        }}>
          {PLANS.map((plan, i) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              index={i}
              loading={loadingPlan === plan.id}
              onSelect={() => handleMembershipClick(plan)}
            />
          ))}
        </div>

        {/* Free day pass */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: 0.3 }}
          style={{
            marginTop: 'var(--space-10)',
            background: 'linear-gradient(135deg, var(--surface-raised), var(--surface-overlay))',
            border: '1px solid var(--border-default)', borderRadius: 'var(--radius-2xl)',
            padding: 'var(--space-8)', textAlign: 'center',
          }}
        >
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', margin: '0 0 var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            Not ready to commit?
          </p>
          <h3 style={{ color: 'var(--text-primary)', fontSize: 'var(--text-2xl)', fontWeight: 700, margin: '0 0 var(--space-2)' }}>
            Try us for free
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-base)', margin: '0 0 var(--space-6)' }}>
            Claim a complimentary day pass. No card required.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleFreeEntry}
            style={{
              padding: '14px 36px', background: 'transparent',
              border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-pill)',
              color: 'var(--text-primary)', fontSize: 'var(--text-base)',
              fontWeight: 600, cursor: 'pointer', letterSpacing: '0.02em',
              transition: 'border-color var(--duration-base) var(--ease-out), background var(--duration-base)',
            }}
            onMouseEnter={e => { e.target.style.borderColor = 'var(--brand-purple)'; e.target.style.background = 'var(--brand-purple-dim)'; }}
            onMouseLeave={e => { e.target.style.borderColor = 'var(--border-strong)'; e.target.style.background = 'transparent'; }}
          >
            Claim Free Day Pass →
          </motion.button>
        </motion.div>

        {/* Trust signals */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 'var(--space-4)', marginTop: 'var(--space-10)',
        }}>
          {TRUST_ITEMS.map(t => (
            <div key={t.label} style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
              <div style={{ fontSize: 24, marginBottom: 'var(--space-2)' }}>{t.icon}</div>
              <p style={{ color: 'var(--text-primary)', fontSize: 'var(--text-sm)', fontWeight: 600, margin: '0 0 4px' }}>{t.label}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', margin: 0 }}>{t.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}

function PricingCard({ plan, index, loading, onSelect }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'relative',
        background: plan.popular
          ? 'linear-gradient(160deg, rgba(157,0,255,0.08) 0%, var(--surface-raised) 30%)'
          : 'var(--surface-raised)',
        border: `1px solid ${plan.popular ? 'var(--border-accent)' : 'var(--border-default)'}`,
        borderRadius: 'var(--radius-2xl)',
        padding: 'var(--space-8)',
        boxShadow: plan.popular ? 'var(--shadow-glow-purple)' : 'var(--shadow-card)',
        marginTop: plan.popular ? 0 : 'var(--space-5)',
      }}
    >
      {plan.popular && (
        <div style={{
          position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--brand-gradient)', borderRadius: 'var(--radius-pill)',
          padding: '4px 18px', fontSize: 'var(--text-xs)', fontWeight: 700,
          color: '#fff', letterSpacing: '0.05em', textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}>
          Most Popular
        </div>
      )}

      <div style={{ marginBottom: 'var(--space-5)' }}>
        <p style={{ color: plan.color, fontSize: 'var(--text-sm)', fontWeight: 700, margin: '0 0 var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {plan.label}
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
          <span style={{ color: 'var(--text-primary)', fontSize: 44, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em' }}>
            ₹{plan.price.toLocaleString()}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>{plan.period}</span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', margin: 0 }}>{plan.tagline}</p>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
        onClick={onSelect}
        disabled={loading}
        style={{
          width: '100%', padding: '13px', marginBottom: 'var(--space-6)',
          background: plan.popular ? 'var(--brand-gradient)' : 'transparent',
          border: `1px solid ${plan.popular ? 'transparent' : 'var(--border-strong)'}`,
          borderRadius: 'var(--radius-md)', color: '#fff',
          fontSize: 'var(--text-base)', fontWeight: 700, cursor: loading ? 'wait' : 'pointer',
          boxShadow: plan.popular ? 'var(--shadow-glow-purple)' : 'none',
          opacity: loading ? 0.7 : 1,
          letterSpacing: '0.01em',
        }}
      >
        {loading ? 'Processing...' : plan.cta}
      </motion.button>

      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {plan.features.map(f => (
          <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            <span style={{
              width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 1,
              background: `${plan.color}22`, border: `1px solid ${plan.color}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, color: plan.color,
            }}>✓</span>
            {f}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
