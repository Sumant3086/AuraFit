import React from 'react';
import Logo from '../logo/Logo';
import { Link } from 'react-router-dom';
import { LuMail, LuArrowUpRight } from 'react-icons/lu';

const COLUMNS = [
  {
    heading: 'Platform',
    links: [
      { to: '/features',  label: 'AI Tools' },
      { to: '/classes',   label: 'Classes' },
      { to: '/trainers',  label: 'Trainers' },
      { to: '/shop',      label: 'Shop' },
      { to: '/pricing',   label: 'Pricing' },
    ],
  },
  {
    heading: 'Members',
    links: [
      { to: '/dashboard',    label: 'Dashboard' },
      { to: '/community',    label: 'Community' },
      { to: '/leaderboard',  label: 'Leaderboard' },
      { to: '/achievements', label: 'Achievements' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { to: '/contact', label: 'Contact' },
      { to: '/signup',  label: 'Get started free' },
    ],
  },
];

const EMAIL = 'sumantyadav3086@gmail.com';

export default function Footer() {
  return (
    <footer className="af-footer">
      <div className="af-footer__inner">

        {/* Top grid */}
        <div className="af-footer__grid">

          {/* Brand column */}
          <div className="af-footer__brand">
            <Logo size="medium" />
            <p className="af-footer__tagline">
              The AI-powered fitness platform for people who train seriously.
            </p>
            <a href={`mailto:${EMAIL}`} className="af-footer__email">
              <LuMail size={13} strokeWidth={1.5} />
              {EMAIL}
            </a>
          </div>

          {/* Link columns */}
          {COLUMNS.map(col => (
            <div key={col.heading}>
              <p className="af-footer__col-heading">{col.heading}</p>
              <ul className="af-footer__list">
                {col.links.map(l => (
                  <li key={l.to}>
                    <Link to={l.to} className="af-footer__link">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="af-footer__bottom">
          <p className="af-footer__copy">
            © {new Date().getFullYear()} AuraFit. All rights reserved.
          </p>
          <div className="af-footer__bottom-right">
            <span className="af-footer__powered">Powered by Gemini AI</span>
            <Link to="/admin/login" style={{ opacity: 0, pointerEvents: 'none' }}>·</Link>
          </div>
        </div>
      </div>

      <style>{`
        .af-footer {
          background: var(--surface-1);
          border-top: 1px solid var(--border-1);
        }
        .af-footer__inner {
          max-width: var(--max-full);
          margin-inline: auto;
          padding: clamp(48px,6vw,80px) clamp(20px,4vw,60px) clamp(24px,3vw,32px);
        }
        .af-footer__grid {
          display: grid;
          grid-template-columns: minmax(220px, 1.4fr) repeat(3, minmax(100px, 1fr));
          gap: clamp(32px, 5vw, 64px);
          margin-bottom: clamp(32px, 4vw, 48px);
        }
        .af-footer__brand { display: flex; flex-direction: column; gap: 14px; }
        .af-footer__tagline {
          color: var(--text-3);
          font-size: 13px;
          line-height: 1.65;
          max-width: 240px;
          margin: 0;
        }
        .af-footer__email {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: var(--text-3);
          font-size: 12.5px;
          text-decoration: none;
          padding: 7px 12px;
          background: var(--surface-2);
          border: 1px solid var(--border-1);
          border-radius: var(--r-md);
          transition: color var(--duration-fast), border-color var(--duration-fast);
          width: fit-content;
        }
        .af-footer__email:hover {
          color: var(--text-1);
          border-color: var(--border-2);
        }
        .af-footer__col-heading {
          color: var(--text-2);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          margin: 0 0 14px;
        }
        .af-footer__list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .af-footer__link {
          color: var(--text-3);
          font-size: var(--text-sm);
          text-decoration: none;
          transition: color var(--duration-fast);
          display: block;
        }
        .af-footer__link:hover { color: var(--text-1); }
        .af-footer__bottom {
          border-top: 1px solid var(--border-1);
          padding-top: clamp(16px, 2.5vw, 24px);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }
        .af-footer__copy {
          color: var(--text-3);
          font-size: var(--text-xs);
          margin: 0;
        }
        .af-footer__bottom-right {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .af-footer__powered {
          color: var(--text-4);
          font-size: 11.5px;
        }
        @media (max-width: 820px) {
          .af-footer__grid {
            grid-template-columns: 1fr 1fr;
          }
          .af-footer__brand {
            grid-column: 1 / -1;
          }
        }
        @media (max-width: 480px) {
          .af-footer__grid { grid-template-columns: 1fr; }
          .af-footer__brand { grid-column: unset; }
        }
      `}</style>
    </footer>
  );
}
