import React from "react";
import "./hero.css";
import { Link } from "react-router-dom";
import { Fade } from "react-awesome-reveal";
import { FaDumbbell, FaUserTie, FaUsers, FaFemale, FaFistRaised, FaClock } from "react-icons/fa";
import { GiMuscleUp, GiBoxingGlove, GiBiceps } from "react-icons/gi";
import { MdSelfImprovement } from "react-icons/md";

const Hero = () => {
  return (
    <section id="hero">
      <div className="hero-container">
      <Fade bottom triggerOnce="true">
        <h1 className="h1-cards">
          Why choose <span className="cyan">us?</span>
        </h1>
      </Fade>
      <Fade bottom triggerOnce="true">
        <div className="hero-cards">
          <div className="hero-card">
            <div className="hero-icon"><FaDumbbell /></div>
            <h2>Premium Equipment</h2>
            <p>
              State-of-the-art machines from leading brands including Technogym, Life Fitness, and Hammer Strength for optimal performance.
            </p>
          </div>

          <div className="hero-card">
            <div className="hero-icon"><FaUserTie /></div>
            <h2>Certified Trainers</h2>
            <p>
              NASM and ACE certified professionals with 10+ years experience, dedicated to transforming your fitness journey.
            </p>
          </div>

          <div className="hero-card">
            <div className="hero-icon"><FaUsers /></div>
            <h2>Group Classes</h2>
            <p>
              50+ weekly classes including HIIT, Yoga, Zumba, CrossFit, and Boxing led by expert instructors.
            </p>
          </div>
          
          <div className="hero-card">
            <div className="hero-icon"><FaFemale /></div>
            <h2>Ladies Exclusive Zone</h2>
            <p>
              Private 2,000 sq ft women-only area with dedicated equipment, changing rooms, and female trainers.
            </p>
          </div>

          <div className="hero-card">
            <div className="hero-icon"><FaFistRaised /></div>
            <h2>Professional Boxing Arena</h2>
            <p>
              Olympic-standard boxing ring, heavy bags, speed bags, and professional coaching for all skill levels.
            </p>
          </div>

          <div className="hero-card">
            <div className="hero-icon"><FaClock /></div>
            <h2>24/7 Access</h2>
            <p>Train on your schedule with round-the-clock access, secure entry, and CCTV monitoring for your safety.</p>
          </div>
        </div>
      </Fade>
      </div>

      <div className="hero-classes-container">
      <Fade bottom triggerOnce="true">
        <h1 className="h1-classes">
          Together we <span className="pink">achieve!</span>
        </h1>
        <h2 className="h2-classes">
          Group classes
        </h2>
        </Fade>

        <Fade bottom triggerOnce="true">
        <div className="hero-classes">
          <div className="class-grid-item">
            <div className="class-icon-large"><GiMuscleUp /></div>
            <div className="class-content">
              <h2>STRENGTH</h2>
              <p>Build muscle and power</p>
              <Link to="/classes">
                <button className="class-btn">View Details</button>
              </Link>
            </div>
          </div>

          <div className="class-grid-item">
            <div className="class-icon-large"><GiBoxingGlove /></div>
            <div className="class-content">
              <h2>BOXING</h2>
              <p>Combat fitness training</p>
              <Link to="/classes">
                <button className="class-btn">View Details</button>
              </Link>
            </div>
          </div>

          <div className="class-grid-item">
            <div className="class-icon-large"><GiBiceps /></div>
            <div className="class-content">
              <h2>CARDIO</h2>
              <p>High-intensity workouts</p>
              <Link to="/classes">
                <button className="class-btn">View Details</button>
              </Link>
            </div>
          </div>

          <div className="class-grid-item">
            <div className="class-icon-large"><MdSelfImprovement /></div>
            <div className="class-content">
              <h2>YOGA</h2>
              <p>Mind and body balance</p>
              <Link to="/classes">
                <button className="class-btn">View Details</button>
              </Link>
            </div>
          </div>
        </div>
        </Fade>
      </div>
    </section>
  );
};

export default Hero;
