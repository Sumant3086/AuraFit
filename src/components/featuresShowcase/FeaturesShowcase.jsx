import React from 'react';
import './featuresShowcase.css';
import { FaRobot, FaAppleAlt, FaChartLine, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { Fade } from 'react-awesome-reveal';

const FeaturesShowcase = () => {
  return (
    <section className="features-showcase">
      <Fade triggerOnce>
        <div className="showcase-header">
          <h2>AI-Powered Fitness <span className="gradient-text">Technology</span></h2>
          <p>Cutting-edge tools backed by sports science to accelerate your transformation</p>
        </div>
      </Fade>

      <div className="showcase-grid">
        <Fade triggerOnce delay={100}>
          <div className="showcase-card">
            <div className="card-icon">
              <FaRobot />
            </div>
            <h3>AI Workout Generator</h3>
            <p>Get science-backed, personalized workout plans tailored to your fitness level, goals, and schedule. Our advanced AI analyzes your profile and creates progressive training routines optimized for maximum results.</p>
            <Link to="/features" className="card-link">
              Generate your plan <FaArrowRight />
            </Link>
          </div>
        </Fade>

        <Fade triggerOnce delay={200}>
          <div className="showcase-card">
            <div className="card-icon">
              <FaAppleAlt />
            </div>
            <h3>Smart Nutrition Calculator</h3>
            <p>Precision nutrition planning with macro calculations based on your body composition, activity level, and goals. Get customized meal plans with Indian and international cuisine options tailored to your lifestyle.</p>
            <Link to="/features" className="card-link">
              Calculate your macros <FaArrowRight />
            </Link>
          </div>
        </Fade>

        <Fade triggerOnce delay={300}>
          <div className="showcase-card">
            <div className="card-icon">
              <FaChartLine />
            </div>
            <h3>Advanced Progress Tracker</h3>
            <p>Comprehensive body composition tracking with visual analytics. Monitor weight, measurements, body fat percentage, and strength gains. See your transformation journey with detailed charts and milestone celebrations.</p>
            <Link to="/features" className="card-link">
              Track your progress <FaArrowRight />
            </Link>
          </div>
        </Fade>
      </div>

      <Fade triggerOnce delay={400}>
        <div className="showcase-cta">
          <Link to="/features" className="cta-button">
            Explore All Features
          </Link>
        </div>
      </Fade>
    </section>
  );
};

export default FeaturesShowcase;
