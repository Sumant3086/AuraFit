import React from "react";
import "./hero.css";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaDumbbell, FaUserTie, FaUsers, FaFemale, FaFistRaised, FaClock } from "react-icons/fa";
import { GiMuscleUp, GiBoxingGlove, GiBiceps } from "react-icons/gi";
import { MdSelfImprovement } from "react-icons/md";

const Hero = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  const titleVariants = {
    hidden: { y: -30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <section id="hero">
      <div className="hero-container">
      <motion.h1 
        className="h1-cards"
        variants={titleVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        Why choose <span className="cyan">us?</span>
      </motion.h1>
      
      <motion.div 
        className="hero-cards"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.div className="hero-card" variants={cardVariants} whileHover={{ scale: 1.05, y: -10 }}>
          <div className="hero-icon"><FaDumbbell /></div>
          <h2>Premium Equipment</h2>
          <p>
            State-of-the-art machines from leading brands including Technogym, Life Fitness, and Hammer Strength for optimal performance.
          </p>
        </motion.div>

        <motion.div className="hero-card" variants={cardVariants} whileHover={{ scale: 1.05, y: -10 }}>
          <div className="hero-icon"><FaUserTie /></div>
          <h2>Certified Trainers</h2>
          <p>
            NASM and ACE certified professionals with 10+ years experience, dedicated to transforming your fitness journey.
          </p>
        </motion.div>

        <motion.div className="hero-card" variants={cardVariants} whileHover={{ scale: 1.05, y: -10 }}>
          <div className="hero-icon"><FaUsers /></div>
          <h2>Group Classes</h2>
          <p>
            50+ weekly classes including HIIT, Yoga, Zumba, CrossFit, and Boxing led by expert instructors.
          </p>
        </motion.div>
        
        <motion.div className="hero-card" variants={cardVariants} whileHover={{ scale: 1.05, y: -10 }}>
          <div className="hero-icon"><FaFemale /></div>
          <h2>Ladies Exclusive Zone</h2>
          <p>
            Private 2,000 sq ft women-only area with dedicated equipment, changing rooms, and female trainers.
          </p>
        </motion.div>

        <motion.div className="hero-card" variants={cardVariants} whileHover={{ scale: 1.05, y: -10 }}>
          <div className="hero-icon"><FaFistRaised /></div>
          <h2>Professional Boxing Arena</h2>
          <p>
            Olympic-standard boxing ring, heavy bags, speed bags, and professional coaching for all skill levels.
          </p>
        </motion.div>

        <motion.div className="hero-card" variants={cardVariants} whileHover={{ scale: 1.05, y: -10 }}>
          <div className="hero-icon"><FaClock /></div>
          <h2>24/7 Access</h2>
          <p>Train on your schedule with round-the-clock access, secure entry, and CCTV monitoring for your safety.</p>
        </motion.div>
      </motion.div>
      </div>

      <div className="hero-classes-container">
      <motion.h1 
        className="h1-classes"
        variants={titleVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        Together we <span className="pink">achieve!</span>
      </motion.h1>
      <motion.h2 
        className="h2-classes"
        variants={titleVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        Group classes
      </motion.h2>

      <motion.div 
        className="hero-classes"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.div className="class-grid-item" variants={cardVariants} whileHover={{ scale: 1.05 }}>
          <div className="class-icon-large"><GiMuscleUp /></div>
          <div className="class-content">
            <h2>STRENGTH</h2>
            <p>Build muscle and power</p>
            <Link to="/classes">
              <motion.button className="class-btn" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                View Details
              </motion.button>
            </Link>
          </div>
        </motion.div>

        <motion.div className="class-grid-item" variants={cardVariants} whileHover={{ scale: 1.05 }}>
          <div className="class-icon-large"><GiBoxingGlove /></div>
          <div className="class-content">
            <h2>BOXING</h2>
            <p>Combat fitness training</p>
            <Link to="/classes">
              <motion.button className="class-btn" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                View Details
              </motion.button>
            </Link>
          </div>
        </motion.div>

        <motion.div className="class-grid-item" variants={cardVariants} whileHover={{ scale: 1.05 }}>
          <div className="class-icon-large"><GiBiceps /></div>
          <div className="class-content">
            <h2>CARDIO</h2>
            <p>High-intensity workouts</p>
            <Link to="/classes">
              <motion.button className="class-btn" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                View Details
              </motion.button>
            </Link>
          </div>
        </motion.div>

        <motion.div className="class-grid-item" variants={cardVariants} whileHover={{ scale: 1.05 }}>
          <div className="class-icon-large"><MdSelfImprovement /></div>
          <div className="class-content">
            <h2>YOGA</h2>
            <p>Mind and body balance</p>
            <Link to="/classes">
              <motion.button className="class-btn" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                View Details
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </motion.div>
      </div>
    </section>
  );
};

export default Hero;
