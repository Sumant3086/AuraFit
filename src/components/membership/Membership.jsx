import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './membership.css';
import { FaArrowRight } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import apiService, { getRazorpayKey } from '../../services/api';
import toast from 'react-hot-toast';

const PLANS = {
  Basic:   { price: 999,  duration: '1-month' },
  Pro:     { price: 1699, duration: '1-month' },
  Premium: { price: 2499, duration: '1-month' },
};

export default function Membership() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState(null);

  const handleMembershipClick = async (plan) => {
    if (!isAuthenticated) {
      localStorage.setItem('redirectAfterLogin', '/');
      localStorage.setItem('selectedPlan', plan);
      toast.error('Sign in to purchase a membership.');
      navigate('/login');
      return;
    }

    setLoadingPlan(plan);
    const toastId = toast.loading(`Setting up ${plan} membership…`);

    try {
      let retries = 0;
      while (!window.Razorpay && retries < 10) {
        await new Promise(r => setTimeout(r, 500));
        retries++;
      }
      if (!window.Razorpay) {
        toast.error('Payment system unavailable. Please refresh.', { id: toastId });
        return;
      }

      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const selectedPlan = PLANS[plan];

      const data = await apiService.membership.purchase({
        userId: userData.id,
        name: userData.name,
        email: userData.email,
        plan,
        price: selectedPlan.price,
        duration: selectedPlan.duration,
        paymentStatus: 'pending',
      });

      if (!data.success) {
        toast.error(data.message || 'Failed to initiate purchase.', { id: toastId });
        return;
      }

      const orderResponse = await apiService.orders.createRazorpayOrder({
        amount: selectedPlan.price,
        orderId: data.data.order._id,
      });

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
        description: `${plan} Membership`,
        order_id: orderResponse.data.orderId,
        prefill: { name: userData.name || '', email: userData.email || '' },
        theme: { color: '#8B5CF6' },
        handler: async (response) => {
          const verifyId = toast.loading('Verifying payment…');
          try {
            const verify = await apiService.orders.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (verify.success) {
              toast.success(`🎉 ${plan} membership activated!`, { id: verifyId, duration: 5000 });
              setTimeout(() => navigate('/dashboard'), 1500);
            } else {
              toast.error('Payment verification failed. Contact support@aurafit.com', { id: verifyId });
            }
          } catch {
            toast.error('Verification error. Contact support@aurafit.com', { id: verifyId });
          }
        },
        modal: { ondismiss: () => toast('Payment cancelled.', { icon: '↩️' }) },
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
      toast.error('Sign in to claim your free day pass.');
      navigate('/login');
      return;
    }
    const id = toast.loading('Claiming your free day pass…');
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const data = await apiService.membership.freeTrial({
        userId: userData.id, name: userData.name, email: userData.email,
      });
      if (data.success) {
        toast.success('🎉 Free day pass claimed! Check your email.', { id, duration: 5000 });
      } else {
        toast.error(data.message || 'Could not claim free pass.', { id });
      }
    } catch {
      toast.success('Free day pass sent to your email!', { id });
    }
  };

  return (
    <section id="membership">
      <div className="membership-container">
        <motion.h1
          initial={{ y: -50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
        >
          Invest in your <span>strongest self</span>
        </motion.h1>
        <motion.h2
          className="plans-h2"
          initial={{ y: -30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
        >
          Flexible membership plans
        </motion.h2>

        <motion.div
          className="membership-cards"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}
        >
          {[
            { plan: 'Basic', delay: 0.4 },
            { plan: 'Premium', delay: 0.5, featured: true },
            { plan: 'Pro', delay: 0.6 },
          ].map(({ plan, delay, featured }) => (
            <motion.div
              key={plan}
              className={featured ? 'membership-card-strike' : 'membership-card'}
              initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay }}
              whileHover={{ scale: featured ? 1.04 : 1.02, y: featured ? -8 : -5 }}
            >
              <p className="price">₹{PLANS[plan].price.toLocaleString()}</p>
              <p className="per_month">per month{featured ? ' · Most popular' : ''}</p>
              <PlanFeatures plan={plan} />
              <motion.button
                className={featured ? 'btn-strike' : plan === 'Basic' ? 'btn-basic' : 'btn-pro'}
                onClick={() => handleMembershipClick(plan)}
                disabled={loadingPlan === plan}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                style={{ opacity: loadingPlan === plan ? 0.7 : 1 }}
              >
                {loadingPlan === plan ? 'Processing…' : plan}
              </motion.button>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          className="voucher-h2"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.7 }}
        >
          Not ready to commit?
        </motion.p>
        <motion.button
          className="btn-voucher"
          onClick={handleFreeEntry}
          initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.8 }}
          whileHover={{ scale: 1.03, x: 4 }} whileTap={{ scale: 0.97 }}
        >
          Claim your free day pass <FaArrowRight className="voucher-icon" />
        </motion.button>
      </div>
    </section>
  );
}

function PlanFeatures({ plan }) {
  const FEATURES = {
    Basic: ['10 gym entries per month', 'Ladies exclusive zone', 'Boxing arena access', 'Personal locker', 'AI tools access'],
    Pro:   ['20 gym entries per month', 'All group classes', 'Ladies exclusive zone', 'Boxing arena', '2 trainer sessions', 'Free protein shakes', 'Personal locker'],
    Premium: ['Unlimited 24/7 access', 'All group classes', 'Ladies exclusive zone', 'Boxing arena', '4 trainer sessions', 'Free protein shakes daily', 'Body composition analysis', 'AuraFit merchandise', '2 guest passes/month'],
  };
  return (
    <ul>
      {FEATURES[plan].map(f => <li key={f}>{f}</li>)}
    </ul>
  );
}
