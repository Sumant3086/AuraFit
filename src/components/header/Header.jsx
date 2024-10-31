import React from "react";
import HeaderQuotes from "./HeaderQuotes";
import HeaderSocials from "./HeaderSocials";
import "./header.css";

const Header = () => {
  return (
    <header>
      <div className="header-container">
        <HeaderQuotes />
        <div className="header-cta">
          <h1>End of excuses</h1>
          <a href="#membership">
            <div className="btn">Start now</div>
          </a>
        </div>
        <HeaderSocials />
      </div>
    </header>
  );
};

export default Header;
