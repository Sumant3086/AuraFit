import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS_AUTH = [
  { path: '/dashboard', icon: '⚡', label: 'Home' },
  { path: '/checkin', icon: '📱', label: 'Check-In' },
  { path: '/community', icon: '🤝', label: 'Community' },
  { path: '/leaderboard', icon: '🏆', label: 'Rank' },
  { path: '/settings', icon: '⚙️', label: 'Settings' },
];

const NAV_ITEMS_PUBLIC = [
  { path: '/', icon: '🏠', label: 'Home' },
  { path: '/classes', icon: '🏋️', label: 'Classes' },
  { path: '/pricing', icon: '💎', label: 'Pricing' },
  { path: '/shop', icon: '🛍️', label: 'Shop' },
  { path: '/login', icon: '👤', label: 'Login' },
];

export default function BottomNav() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Don't show on auth pages or admin
  const hideOn = ['/login', '/signup', '/forgot-password', '/admin', '/onboarding'];
  if (hideOn.some(p => location.pathname.startsWith(p))) return null;

  const items = isAuthenticated ? NAV_ITEMS_AUTH : NAV_ITEMS_PUBLIC;

  return (
    <nav style={{
      display: 'none', // shown by CSS on mobile
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: '#111', borderTop: '1px solid #1a1a1a',
      padding: '8px 0 calc(8px + env(safe-area-inset-bottom, 0px))',
      zIndex: 100, justifyContent: 'space-around',
    }} className="bottom-nav">
      {items.map(item => {
        const isActive = location.pathname === item.path;
        return (
          <Link key={item.path} to={item.path} className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none',
              color: isActive ? '#9d00ff' : '#555', minWidth: 56, padding: '4px 8px',
              transition: 'color 0.2s',
            }}>
            <span style={{ fontSize: 22, lineHeight: 1 }}>{item.icon}</span>
            <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 400 }}>{item.label}</span>
            {isActive && (
              <div style={{ position: 'absolute', top: 0, width: 32, height: 2, background: '#9d00ff', borderRadius: '0 0 2px 2px' }} />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
