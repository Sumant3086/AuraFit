import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LuCreditCard, LuArrowRight, LuAlertTriangle } from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';

export default function MembershipStatus() {
  const { user, apiClient } = useAuth();
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiClient.get('/memberships/my').catch(() => null);
        if (!cancelled && res?.data?.data) setMembership(res.data.data);
      } catch {}
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [apiClient]);

  if (loading || !membership) return null;

  // Calculate days remaining
  const expiry = membership.expiryDate ? new Date(membership.expiryDate) : null;
  const today  = new Date();
  const daysLeft = expiry ? Math.ceil((expiry - today) / (1000 * 60 * 60 * 24)) : null;

  // Only show if:
  // - active membership expiring within 30 days, OR
  // - membership already expired
  const isExpired  = daysLeft !== null && daysLeft <= 0;
  const isExpiring = daysLeft !== null && daysLeft > 0 && daysLeft <= 30;

  if (!isExpired && !isExpiring) return null;

  const urgentColor = isExpired ? 'var(--red)' : daysLeft <= 7 ? 'var(--amber)' : 'var(--accent)';
  const urgentBg    = isExpired ? 'var(--red-dim)' : daysLeft <= 7 ? 'var(--amber-dim)' : 'var(--accent-dim)';
  const urgentBorder = isExpired ? 'rgba(239,68,68,0.2)' : daysLeft <= 7 ? 'rgba(245,158,11,0.2)' : 'var(--accent-border)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        background: urgentBg,
        border: `1px solid ${urgentBorder}`,
        borderRadius: 'var(--r-xl)',
        padding: 'var(--sp-4) var(--sp-5)',
        marginBottom: 'var(--sp-4)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {isExpired
          ? <LuAlertTriangle size={16} color={urgentColor} strokeWidth={1.8} />
          : <LuCreditCard size={16} color={urgentColor} strokeWidth={1.8} />
        }
        <div>
          <p style={{ color: 'var(--text-1)', fontWeight: 600, fontSize: 13, margin: '0 0 2px' }}>
            {isExpired
              ? 'Your membership has expired'
              : daysLeft === 1
                ? 'Membership expires tomorrow'
                : `Membership expires in ${daysLeft} days`
            }
          </p>
          <p style={{ color: 'var(--text-3)', fontSize: 12, margin: 0 }}>
            {isExpired
              ? 'Renew to continue using the gym and all platform tools'
              : `${membership.plan || 'Current'} plan · renews or expires ${expiry?.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
            }
          </p>
        </div>
      </div>
      <Link to="/pricing" style={{ textDecoration: 'none', flexShrink: 0 }}>
        <button
          className="btn btn-sm"
          style={{
            background: urgentColor,
            color: '#fff',
            border: 'none',
            display: 'flex', alignItems: 'center', gap: 5,
          }}
        >
          Renew <LuArrowRight size={12} strokeWidth={2} />
        </button>
      </Link>
    </motion.div>
  );
}
