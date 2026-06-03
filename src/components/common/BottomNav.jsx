import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  LuHome, LuQrCode, LuUsers, LuTrophy, LuSettings,
  LuLayoutDashboard, LuTag, LuDumbbell, LuUser,
} from 'react-icons/lu';

const AUTH_ITEMS = [
  { path: '/dashboard',    Icon: LuLayoutDashboard, label: 'Home' },
  { path: '/checkin',      Icon: LuQrCode,          label: 'Check-in' },
  { path: '/community',    Icon: LuUsers,            label: 'Community' },
  { path: '/leaderboard',  Icon: LuTrophy,           label: 'Rankings' },
  { path: '/settings',     Icon: LuSettings,         label: 'Settings' },
];

const PUBLIC_ITEMS = [
  { path: '/',         Icon: LuHome,     label: 'Home' },
  { path: '/classes',  Icon: LuDumbbell, label: 'Classes' },
  { path: '/pricing',  Icon: LuTag,      label: 'Pricing' },
  { path: '/trainers', Icon: LuUsers,    label: 'Trainers' },
  { path: '/login',    Icon: LuUser,     label: 'Sign in' },
];

export default function BottomNav() {
  const { isAuthenticated } = useAuth();
  const { pathname } = useLocation();

  const HIDE = ['/login', '/signup', '/forgot-password', '/onboarding'];
  if (HIDE.some(p => pathname.startsWith(p))) return null;
  if (pathname.startsWith('/admin')) return null;

  const items = isAuthenticated ? AUTH_ITEMS : PUBLIC_ITEMS;

  return (
    <>
      <nav
        style={{
          display: 'none',
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
          background: 'rgba(8,8,8,0.92)',
          backdropFilter: 'blur(20px) saturate(160%)',
          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
          borderTop: '1px solid var(--border-1)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
        className="bottom-nav"
      >
        {items.map(({ path, Icon, label }) => {
          const active = path === '/'
            ? pathname === '/'
            : pathname.startsWith(path);

          return (
            <Link
              key={path}
              to={path}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 4, padding: '10px 4px 8px',
                color: active ? 'var(--text-1)' : 'var(--text-3)',
                minWidth: 52, flex: 1, maxWidth: 80,
                position: 'relative',
                transition: 'color 120ms ease',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {/* Sliding active dot */}
              <AnimatePresence>
                {active && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                      width: 20, height: 2, borderRadius: '0 0 2px 2px',
                      background: 'var(--accent)',
                    }}
                  />
                )}
              </AnimatePresence>

              <motion.div
                animate={{ scale: active ? 1 : 0.9, opacity: active ? 1 : 0.65 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              >
                <Icon size={20} strokeWidth={active ? 2 : 1.5} />
              </motion.div>

              <span style={{
                fontSize: 10,
                fontWeight: active ? 600 : 400,
                transition: 'font-weight 120ms',
              }}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .bottom-nav { display: flex !important; justify-content: space-around; }
          body { padding-bottom: calc(64px + env(safe-area-inset-bottom, 0px)); }
        }
      `}</style>
    </>
  );
}
