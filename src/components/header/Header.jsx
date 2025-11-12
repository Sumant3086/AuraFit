import React from "react";
import HeaderQuotes from "./HeaderQuotes";
import HeaderSocials from "./HeaderSocials";
import { Link } from "react-router-dom";
import "./header.css";

const Header = () => {
  return (
    <header>
      <div className="header-container">
        <HeaderQuotes />
        <div className="header-cta">
          <h1>Transform Your Body</h1>
          <p className="header-subtitle">AI-Powered Fitness • Smart Nutrition • Real Results</p>
          <div className="header-buttons">
            <a href="#membership">
              <div className="btn btn-primary">Start Your Journey</div>
            </a>
            <Link to="/features">
              <div className="btn btn-secondary">Explore Features</div>
            </Link>
          </div>
        </div>
        <HeaderSocials />
      </div>
    </header>
  );
};

export default Header;
