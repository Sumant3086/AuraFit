import React from 'react';
import './logo.css';

const Logo = ({ size = 'medium', color = 'gradient' }) => {
  return (
    <div className={`gym-logo ${size} ${color}`}>
      <div className="logo-icon">
        <div className="dumbbell-left"></div>
        <div className="dumbbell-bar"></div>
        <div className="dumbbell-right"></div>
      </div>
      <div className="logo-text">
        <span className="logo-main">AURA</span>
        <span className="logo-sub">FIT</span>
      </div>
    </div>
  );
};

export default Logo;
