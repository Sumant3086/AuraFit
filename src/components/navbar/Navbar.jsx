import React, { useState, useEffect } from "react";
import "./navbar.css";
import Logo from "../logo/Logo";
import { Link, useNavigate } from "react-router-dom";
import {
  LuMenu, LuSun, LuMoon, LuLayoutDashboard, LuUser, LuQrCode,
  LuAward, LuTrophy, LuUsers, LuCalendar, LuPackage, LuSettings,
  LuShield, LuDumbbell, LuLogOut,
} from "react-icons/lu";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import NotificationCenter from "../notifications/NotificationCenter";

const Navbar = ({ toggle }) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, logout, isAdmin, isTrainer } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY >= 40);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  const iconBtn = {
    width: 34, height: 34, borderRadius: 'var(--r-md)',
    background: 'transparent',
    border: '1px solid var(--border-1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--text-2)', cursor: 'pointer',
    transition: 'background var(--duration-fast), color var(--duration-fast)',
  };

  return (
    <nav className={scrolled ? "navbar-active-color" : "navbar"}>
      {/* Left */}
      <div className="nav-left">
        <button className="menu-bars" onClick={toggle} aria-label="Menu">
          <LuMenu size={18} />
        </button>
        <Link to="/classes" className="menu-items">Classes</Link>
        <Link to="/pricing" className="menu-items">Pricing</Link>
      </div>

      {/* Center */}
      <div className="nav-center">
        <Link to="/">
          <Logo size="sm" />
        </Link>
      </div>

      {/* Right */}
      <div className="nav-right">
        <Link to="/features" className="menu-items">Features</Link>
        <Link to="/contact"  className="menu-items">Contact</Link>

        {/* Theme toggle — icon only, no emoji */}
        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          style={iconBtn}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-2)'; }}
        >
          {theme === 'dark' ? <LuSun size={14} strokeWidth={1.5} /> : <LuMoon size={14} strokeWidth={1.5} />}
        </button>

        {isAuthenticated && <NotificationCenter />}

        {isAuthenticated && user ? (
          <div style={{ position: 'relative' }}>
            {/* Avatar button */}
            <button
              onClick={() => setOpen(o => !o)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'transparent', border: '1px solid var(--border-1)',
                borderRadius: 'var(--r-md)', padding: '4px 10px 4px 4px',
                cursor: 'pointer',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-2)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-1)'}
            >
              {user.profilePicture ? (
                <img src={user.profilePicture} alt={user.name}
                  style={{ width: 24, height: 24, borderRadius: 6, objectFit: 'cover' }} />
              ) : (
                <div style={{
                  width: 24, height: 24, borderRadius: 6,
                  background: 'var(--accent)', opacity: 0.9,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: 11,
                }}>
                  {user.name?.[0]?.toUpperCase()}
                </div>
              )}
              <span style={{ color: 'var(--text-1)', fontSize: 13, fontWeight: 500 }}>
                {user.name?.split(' ')[0]}
              </span>
            </button>

            {/* Dropdown */}
            {open && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 998 }} onClick={() => setOpen(false)} />
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border-2)',
                  borderRadius: 'var(--r-lg)',
                  minWidth: 210, zIndex: 999,
                  boxShadow: 'var(--shadow-xl)',
                  padding: '6px',
                  animation: 'fadeIn 0.12s ease',
                }}>
                  {/* User info */}
                  <div style={{ padding: '10px 12px 8px', marginBottom: 2 }}>
                    <p style={{ color: 'var(--text-1)', fontWeight: 600, margin: 0, fontSize: 13 }}>{user.name}</p>
                    <p style={{ color: 'var(--text-3)', fontSize: 11, margin: '2px 0 0' }}>
                      {user.points || 0} points
                    </p>
                  </div>
                  <div style={{ height: 1, background: 'var(--border-1)', margin: '0 0 4px' }} />

                  <DropItem to="/dashboard"       icon={LuLayoutDashboard} label="Dashboard"        onClick={() => setOpen(false)} />
                  <DropItem to="/profile"         icon={LuUser}            label="Profile"           onClick={() => setOpen(false)} />
                  <DropItem to="/checkin"         icon={LuQrCode}          label="Check-In"          onClick={() => setOpen(false)} />
                  <DropItem to="/achievements"    icon={LuAward}           label="Achievements"      onClick={() => setOpen(false)} />
                  <DropItem to="/leaderboard"     icon={LuTrophy}          label="Leaderboard"       onClick={() => setOpen(false)} />
                  <DropItem to="/community"       icon={LuUsers}           label="Community"         onClick={() => setOpen(false)} />
                  <DropItem to="/book-trainer"    icon={LuCalendar}        label="Book Trainer"      onClick={() => setOpen(false)} />
                  <DropItem to="/my-orders"       icon={LuPackage}         label="Orders"            onClick={() => setOpen(false)} />
                  <DropItem to="/settings"        icon={LuSettings}        label="Settings"          onClick={() => setOpen(false)} />
                  {isTrainer && <DropItem to="/trainer/dashboard" icon={LuDumbbell} label="Trainer Dashboard" onClick={() => setOpen(false)} />}
                  {isAdmin && <DropItem to="/admin/dashboard" icon={LuShield} label="Admin" onClick={() => setOpen(false)} />}

                  <div style={{ height: 1, background: 'var(--border-1)', margin: '4px 0' }} />
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%', padding: '8px 12px',
                      background: 'none', border: 'none',
                      color: 'var(--red)', textAlign: 'left',
                      cursor: 'pointer', fontSize: 13,
                      display: 'flex', alignItems: 'center', gap: 8,
                      borderRadius: 'var(--r-md)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-3)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <LuLogOut size={14} strokeWidth={1.5} /> Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link to="/login" className="login-btn">Sign in</Link>
        )}
      </div>
    </nav>
  );
};

const DropItem = ({ to, icon: Icon, label, onClick }) => (
  <Link
    to={to} onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 12px', color: 'var(--text-2)',
      fontSize: 13, borderRadius: 'var(--r-md)',
      transition: 'background var(--duration-fast), color var(--duration-fast)',
    }}
    onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-3)'; e.currentTarget.style.color = 'var(--text-1)'; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-2)'; }}
  >
    <Icon size={14} strokeWidth={1.5} />
    {label}
  </Link>
);

export default Navbar;
