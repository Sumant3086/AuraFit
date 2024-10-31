import React, { useState, useEffect } from "react";
import "./navbar.css";
import LOGO from "../../assets/logos/strike.svg";
import { Link } from "react-router-dom";
import { HiMenu } from "react-icons/hi";

const Navbar = ({ toggle }) => {
  const [navbar, setNavbarColor] = useState(false);

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
  });

  return (
    <nav className={navbar ? "navbar-active-color" : "navbar"}>
      <HiMenu className="menu-bars" onClick={toggle} />
      <Link to="/classes">
        <a href="/" className="menu-items">Classes</a>
      </Link>
      <Link to="/pricing">
        <a href="/" className="menu-items">Pricing</a>
      </Link>
      <a href="/">
        <img src={LOGO} alt="strike" className="strike" />
      </a>
      <Link to="/shop">
        <a href="/" className="menu-items">Shop</a>
      </Link>
      <Link to="/contact">
        <a href="/" className="menu-items">Contact</a>
      </Link>
    </nav>
  );
};

export default Navbar;
