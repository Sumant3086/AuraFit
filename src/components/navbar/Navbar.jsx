import React, { useState, useEffect } from "react";
import "./navbar.css";
import Logo from "../logo/Logo";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  LuMenu, LuX, LuSun, LuMoon, LuLayoutDashboard, LuUser, LuQrCode,
  LuAward, LuTrophy, LuUsers, LuCalendar, LuPackage, LuSettings,
  LuShield, LuDumbbell, LuLogOut, LuArrowRight, LuChevronDown,
} from "react-icons/lu";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import NotificationCenter from "../notifications/NotificationCenter";

const NAV_LINKS = [
  { to: "/features",  label: "Features" },
  { to: "/classes",   label: "Classes" },
  { to: "/pricing",   label: "Pricing" },
  { to: "/trainers",  label: "Trainers" },
  { to: "/shop",      label: "Shop" },
];

const Navbar = ({ toggle }) => {
  const [scrolled, setScrolled]   = useState(false);
  const [userMenu, setUserMenu]   = useState(false);
  const [mobileOpen, setMobile]   = useState(false);
  const { user, isAuthenticated, logout, isAdmin, isTrainer } = useAuth();
  const { theme, toggleTheme }    = useTheme();
  const navigate                  = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY >= 20);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else            document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    setUserMenu(false);
    setMobile(false);
    navigate("/");
  };

  return (
    <>
      <nav className={`af-nav${scrolled ? " af-nav--scrolled" : ""}`}>
        <div className="af-nav__inner">

          {/* ── Left: Logo ─────────────────────────────────── */}
          <Link to="/" className="af-nav__logo" onClick={() => setMobile(false)}>
            <Logo size="sm" />
          </Link>

          {/* ── Center: Nav links ───────────────────────────── */}
          <div className="af-nav__links">
            {NAV_LINKS.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) => `af-nav__link${isActive ? " active" : ""}`}
              >
                {l.label}
              </NavLink>
            ))}
          </div>

          {/* ── Right: Actions ──────────────────────────────── */}
          <div className="af-nav__actions">

            {/* Theme toggle */}
            <button
              className="af-nav__icon-btn"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === "dark"
                ? <LuSun size={14} strokeWidth={1.5} />
                : <LuMoon size={14} strokeWidth={1.5} />}
            </button>

            {isAuthenticated && <NotificationCenter />}

            {isAuthenticated && user ? (
              <div style={{ position: "relative" }}>
                <button
                  className="af-nav__user-btn"
                  onClick={() => setUserMenu(o => !o)}
                  aria-haspopup="true"
                  aria-expanded={userMenu}
                >
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name}
                      style={{ width: 22, height: 22, borderRadius: 5, objectFit: "cover", flexShrink: 0 }}
                    />
                  ) : (
                    <div className="af-nav__avatar">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="af-nav__user-name">{user.name?.split(" ")[0]}</span>
                  <LuChevronDown
                    size={12}
                    style={{ transition: "transform 0.18s", transform: userMenu ? "rotate(180deg)" : "none", flexShrink: 0 }}
                  />
                </button>

                <AnimatePresence>
                  {userMenu && (
                    <>
                      <div
                        style={{ position: "fixed", inset: 0, zIndex: 299 }}
                        onClick={() => setUserMenu(false)}
                      />
                      <motion.div
                        className="af-nav__dropdown"
                        initial={{ opacity: 0, scale: 0.96, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -4 }}
                        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                      >
                        {/* User info */}
                        <div className="af-nav__dropdown-header">
                          <p className="af-nav__dropdown-name">{user.name}</p>
                          <p className="af-nav__dropdown-sub">{user.points || 0} points · Level {Math.floor((user.points || 0) / 100) + 1}</p>
                        </div>
                        <div className="af-nav__dropdown-divider" />

                        <DropItem to="/dashboard"       icon={LuLayoutDashboard} label="Dashboard"       close={() => setUserMenu(false)} />
                        <DropItem to="/profile"         icon={LuUser}            label="Profile"          close={() => setUserMenu(false)} />
                        <DropItem to="/checkin"         icon={LuQrCode}          label="Check-In"         close={() => setUserMenu(false)} />
                        <DropItem to="/achievements"    icon={LuAward}           label="Achievements"     close={() => setUserMenu(false)} />
                        <DropItem to="/leaderboard"     icon={LuTrophy}          label="Leaderboard"      close={() => setUserMenu(false)} />
                        <DropItem to="/community"       icon={LuUsers}           label="Community"        close={() => setUserMenu(false)} />
                        <DropItem to="/book-trainer"    icon={LuCalendar}        label="Book Trainer"     close={() => setUserMenu(false)} />
                        <DropItem to="/my-orders"       icon={LuPackage}         label="Orders"           close={() => setUserMenu(false)} />
                        <DropItem to="/settings"        icon={LuSettings}        label="Settings"         close={() => setUserMenu(false)} />
                        {isTrainer && <DropItem to="/trainer/dashboard" icon={LuDumbbell} label="Trainer Dashboard" close={() => setUserMenu(false)} />}
                        {isAdmin   && <DropItem to="/admin/dashboard"   icon={LuShield}   label="Admin"             close={() => setUserMenu(false)} />}

                        <div className="af-nav__dropdown-divider" />
                        <button className="af-nav__sign-out" onClick={handleLogout}>
                          <LuLogOut size={13} strokeWidth={1.5} />
                          Sign out
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="af-nav__auth">
                <Link to="/login" className="af-nav__sign-in">Sign in</Link>
                <Link to="/signup" className="af-nav__cta">
                  Get started <LuArrowRight size={13} strokeWidth={2} />
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="af-nav__hamburger"
              onClick={() => setMobile(o => !o)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <LuX size={18} /> : <LuMenu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile overlay ──────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="af-mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <nav className="af-mobile-menu__nav">
              {NAV_LINKS.map(l => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="af-mobile-menu__link"
                  onClick={() => setMobile(false)}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="af-mobile-menu__footer">
              {isAuthenticated ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <Link to="/dashboard" className="btn btn-secondary btn-lg" style={{ width: "100%", justifyContent: "center" }} onClick={() => setMobile(false)}>
                    Dashboard
                  </Link>
                  <button className="btn btn-ghost btn-lg" style={{ width: "100%", color: "var(--red)" }} onClick={handleLogout}>
                    Sign out
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <Link to="/signup" className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center" }} onClick={() => setMobile(false)}>
                    Get started free
                  </Link>
                  <Link to="/login" className="btn btn-ghost btn-lg" style={{ width: "100%", justifyContent: "center" }} onClick={() => setMobile(false)}>
                    Sign in
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const DropItem = ({ to, icon: Icon, label, close }) => (
  <Link to={to} onClick={close} className="af-nav__dropdown-item">
    <Icon size={13} strokeWidth={1.5} />
    {label}
  </Link>
);

export default Navbar;
