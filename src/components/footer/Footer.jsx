import React from 'react';
import './footer.css';
import Logo from '../logo/Logo';
import { Link } from 'react-router-dom';
import { FaEnvelope } from 'react-icons/fa';

const LINKS = {
  product: [
    { to: '/features', label: 'Features' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/classes', label: 'Classes' },
    { to: '/shop', label: 'Shop' },
    { to: '/trainers', label: 'Trainers' },
  ],
  company: [
    { to: '/contact', label: 'Contact' },
    { to: '/community', label: 'Community' },
    { to: '/leaderboard', label: 'Leaderboard' },
  ],
};

const CONTACT_EMAIL = 'sumantyadav3086@gmail.com';

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--surface-raised)',
      borderTop: '1px solid var(--border-subtle)',
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        padding: 'clamp(48px,6vw,80px) clamp(20px,4vw,60px) clamp(24px,3vw,32px)',
      }}>
        {/* Top row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(200px,1fr) repeat(2,minmax(120px,auto))',
          gap: 'clamp(32px,5vw,64px)',
          marginBottom: 'clamp(32px,4vw,48px)',
          flexWrap: 'wrap',
        }} className="footer-grid">

          {/* Brand column */}
          <div>
            <Logo size="medium" style={{ marginBottom: 16 }} />
            <p style={{
              color: 'var(--text-muted)', fontSize: 14,
              lineHeight: 1.65, maxWidth: 260, margin: '0 0 20px',
            }}>
              The AI-powered fitness platform for people who train seriously.
            </p>

            {/* Contact — email only */}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none',
                padding: '8px 14px',
                background: 'var(--surface-overlay)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                transition: 'border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--border-strong)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              <FaEnvelope style={{ fontSize: 13, flexShrink: 0 }} />
              {CONTACT_EMAIL}
            </a>
          </div>

          {/* Product links */}
          <div>
            <p style={{
              color: 'var(--text-secondary)', fontSize: 12, fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 16px',
            }}>
              Product
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {LINKS.product.map(l => (
                <li key={l.to}>
                  <Link to={l.to} style={{
                    color: 'var(--text-muted)', fontSize: 14, textDecoration: 'none',
                    transition: 'color 0.15s',
                  }}
                    onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
                    onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <p style={{
              color: 'var(--text-secondary)', fontSize: 12, fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 16px',
            }}>
              Company
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {LINKS.company.map(l => (
                <li key={l.to}>
                  <Link to={l.to} style={{
                    color: 'var(--text-muted)', fontSize: 14, textDecoration: 'none',
                    transition: 'color 0.15s',
                  }}
                    onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
                    onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: 'clamp(16px,2.5vw,24px)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 12,
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>
            © {new Date().getFullYear()} AuraFit. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0 }}>
              Powered by Gemini AI
            </p>
            <Link to="/admin/login" style={{ color: 'var(--text-muted)', fontSize: 11, opacity: 0.35 }}>
              ·
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
          .footer-grid > :first-child { grid-column: 1 / -1; }
        }
        @media (max-width: 400px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
