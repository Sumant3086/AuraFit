import React, { useState, useEffect } from "react";
import "./navbar.css";
import Logo from "../logo/Logo";
import { Link, useNavigate } from "react-router-dom";
import { HiMenu } from "react-icons/hi";
import { FaUser, FaTrophy, FaQrcode, FaDumbbell } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import NotificationCenter from "../notifications/NotificationCenter";

const Navbar = ({ toggle }) => {
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, isAuthenticated, logout, isAdmin, isTrainer } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY >= 50);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <nav className={scrolled ? "navbar-active-color" : "navbar"}>
      <div className="nav-left">
        <HiMenu className="menu-bars" onClick={toggle} />
        <Link to="/classes" className="menu-items">Classes</Link>
        <Link to="/pricing" className="menu-items">Pricing</Link>
      </div>

      <div className="nav-center">
        <Link to="/" className="logo-link">
          <Logo size="medium" theme={scrolled ? "gradient" : "dark"} />
        </Link>
      </div>

      <div className="nav-right">
        <Link to="/shop" className="menu-items">Shop</Link>
        <Link to="/features" className="menu-items">Features</Link>
        <Link to="/contact" className="menu-items">Contact</Link>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          style={{
            background: 'none', border: '1px solid #333', borderRadius: 20,
            padding: '5px 10px', cursor: 'pointer', fontSize: 16,
            color: theme === 'dark' ? '#ffd700' : '#333',
            transition: 'all 0.2s', lineHeight: 1,
          }}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {isAuthenticated && <NotificationCenter />}

        {isAuthenticated && user ? (
          <div className="user-menu" style={{ position: 'relative' }}>
            {/* Points display */}
            {user.currentStreak > 0 && (
              <span style={{ color: '#ff6b35', fontSize: 13, fontWeight: 700, marginRight: 8 }}>
                🔥{user.currentStreak}
              </span>
            )}
            <div
              className="profile-link"
              onClick={() => setDropdownOpen(d => !d)}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {user.profilePicture ? (
                <img src={user.profilePicture} alt={user.name} style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #9d00ff, #00d4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13 }}>
                  {user.name?.[0]?.toUpperCase()}
                </div>
              )}
              <span className="user-name">{user.name?.split(' ')[0]}</span>
            </div>

            {dropdownOpen && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 8,
                background: '#111', border: '1px solid #222', borderRadius: 12,
                minWidth: 200, zIndex: 1000, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                padding: '8px 0', animation: 'fadeIn 0.15s ease',
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #1a1a1a' }}>
                  <p style={{ color: '#fff', fontWeight: 700, margin: 0, fontSize: 14 }}>{user.name}</p>
                  <p style={{ color: '#9d00ff', fontSize: 12, margin: '2px 0 0' }}>✨ {user.points || 0} points</p>
                </div>
                <NavDropItem to="/dashboard" icon="🏠" label="Dashboard" onClick={() => setDropdownOpen(false)} />
                <NavDropItem to="/profile" icon="👤" label="Profile" onClick={() => setDropdownOpen(false)} />
                <NavDropItem to="/checkin" icon="📱" label="QR Check-In" onClick={() => setDropdownOpen(false)} />
                <NavDropItem to="/achievements" icon="🏅" label="Achievements" onClick={() => setDropdownOpen(false)} />
                <NavDropItem to="/leaderboard" icon="🏆" label="Leaderboard" onClick={() => setDropdownOpen(false)} />
                <NavDropItem to="/trainers" icon="💪" label="Find Trainers" onClick={() => setDropdownOpen(false)} />
                <NavDropItem to="/book-trainer" icon="👨‍💼" label="Book Trainer" onClick={() => setDropdownOpen(false)} />
                <NavDropItem to="/community" icon="🤝" label="Community" onClick={() => setDropdownOpen(false)} />
                <NavDropItem to="/my-orders" icon="📦" label="My Orders" onClick={() => setDropdownOpen(false)} />
                <NavDropItem to="/settings" icon="⚙️" label="Settings" onClick={() => setDropdownOpen(false)} />
                {isTrainer && <NavDropItem to="/trainer/dashboard" icon="🏋️" label="Trainer Dashboard" onClick={() => setDropdownOpen(false)} />}
                {isAdmin && <NavDropItem to="/admin/dashboard" icon="🔐" label="Admin Panel" onClick={() => setDropdownOpen(false)} />}
                <div style={{ borderTop: '1px solid #1a1a1a', marginTop: 4, paddingTop: 4 }}>
                  <button onClick={handleLogout} style={{
                    width: '100%', padding: '10px 16px', background: 'none', border: 'none', color: '#ff4444',
                    textAlign: 'left', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    🚪 Logout
                  </button>
                </div>
              </div>
            )}

            {/* Overlay to close dropdown */}
            {dropdownOpen && (
              <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={() => setDropdownOpen(false)} />
            )}
          </div>
        ) : (
          <Link to="/login" className="login-btn">Login</Link>
        )}
      </div>
    </nav>
  );
};

const NavDropItem = ({ to, icon, label, onClick }) => (
  <Link to={to} onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
    color: '#ccc', textDecoration: 'none', fontSize: 14,
    transition: 'background 0.15s',
  }}
    onMouseEnter={e => e.currentTarget.style.background = '#1a1a1a'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
  >
    <span style={{ fontSize: 16 }}>{icon}</span> {label}
  </Link>
);

export default Navbar;
