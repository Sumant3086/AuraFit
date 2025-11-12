import React, { useState, useEffect } from "react";
import "./navbar.css";
import Logo from "../logo/Logo";
import { Link } from "react-router-dom";
import { HiMenu } from "react-icons/hi";
import { FaUser } from "react-icons/fa";

const Navbar = ({ toggle }) => {
  const [navbar, setNavbarColor] = useState(false);
  const [user, setUser] = useState(null);

  const changeBackground = () => {
    if (window.scrollY >= 50) {
      setNavbarColor(true);
    } else {
      setNavbarColor(false);
    }
  };

  useEffect(() => {
    changeBackground();
    window.addEventListener("scroll", changeBackground);
    
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener("scroll", changeBackground);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <nav className={navbar ? "navbar-active-color" : "navbar"}>
      <div className="nav-left">
        <HiMenu className="menu-bars" onClick={toggle} />
        <Link to="/classes" className="menu-items">
          Classes
        </Link>
        <Link to="/pricing" className="menu-items">
          Pricing
        </Link>
      </div>
      
      <div className="nav-center">
        <Link to="/" className="logo-link">
          <Logo size="medium" color={navbar ? "gradient" : "white"} />
        </Link>
      </div>
      
      <div className="nav-right">
        <Link to="/shop" className="menu-items">
          Shop
        </Link>
        <Link to="/features" className="menu-items">
          Features
        </Link>
        <Link to="/contact" className="menu-items">
          Contact
        </Link>
        {user ? (
          <div className="user-menu">
            <Link to="/profile" className="profile-link">
              <FaUser className="user-icon" />
              <span className="user-name">{user.name ? user.name.split(' ')[0] : user.email.split('@')[0]}</span>
            </Link>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        ) : (
          <Link to="/login" className="login-btn">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
