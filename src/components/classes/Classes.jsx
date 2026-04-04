import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './classes.css';
import Footer from '../footer/Footer';
import classesByDay from './classesData';
import { FaClock, FaUserTie, FaDumbbell, FaSpa, FaRunning, FaBiking, FaHeart } from 'react-icons/fa';
import { GiBoxingGlove, GiMusicalNotes, GiWeightLiftingUp, GiMuscleUp } from 'react-icons/gi';
import { MdPeople, MdSignalCellularAlt } from 'react-icons/md';

const iconMap = {
  FaDumbbell: FaDumbbell,
  FaSpa: FaSpa,
  FaRunning: FaRunning,
  GiBoxingGlove: GiBoxingGlove,
  GiMusicalNotes: GiMusicalNotes,
  FaBiking: FaBiking,
  FaHeart: FaHeart,
  GiWeightLiftingUp: GiWeightLiftingUp,
  GiMuscleUp: GiMuscleUp,
};

const Classes = () => {
  const [selectedDay, setSelectedDay] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDate = new Date();
    const currentDayOfWeek = daysOfWeek[currentDate.getDay()];
    setSelectedDay(currentDayOfWeek);
  }, []);

  const handleDayClick = (day) => {
    setSelectedDay(day);
  };

  const handleReserveSpot = (classItem) => {
    const user = localStorage.getItem('user');
    
    if (!user) {
      // Store the intended action for after login
      localStorage.setItem('redirectAfterLogin', '/classes');
      localStorage.setItem('pendingReservation', JSON.stringify(classItem));
      alert('Please login to reserve a spot in this class');
      navigate('/login');
    } else {
      // User is logged in, proceed with reservation
      alert(`Spot reserved for ${classItem.name} class with ${classItem.trainer}!`);
      // Here you would typically make an API call to reserve the spot
    }
  };

  const getLevelColor = (level) => {
    switch(level) {
      case 'Beginner': return '#00ff88';
      case 'Intermediate': return '#00d4ff';
      case 'Advanced': return '#ff00ff';
      default: return '#ffffff';
    }
  };

  return (
    <section className="classes">
      <motion.h1 
        className="classes-title"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        Classes <span>Schedule</span>
      </motion.h1>
      <motion.p 
        className="classes-subtitle"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        Join our expert-led fitness classes designed for all levels
      </motion.p>
      <div className="classes-container">
        <motion.div 
          className='classes-days'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {Object.keys(classesByDay).map((day, index) => (
            <motion.button
              className={selectedDay === day ? 'active' : ''}
              key={day}
              onClick={() => handleDayClick(day)}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.05 }}
            >
              {day}
            </motion.button>
          ))}
        </motion.div>
        <AnimatePresence mode="wait">
          <motion.ul 
            className="classes-list"
            key={selectedDay}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {classesByDay[selectedDay]?.map((classItem, index) => {
              const IconComponent = iconMap[classItem.icon];
              return (
                <motion.li 
                  key={index} 
                  className="class-card"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <div className="class-icon-wrapper">
                    {IconComponent && <IconComponent className="class-main-icon" />}
                  </div>
                  <div className="class-content">
                    <div className="class-header">
                      <h3 className="class-name">{classItem.name}</h3>
                      <span 
                        className="class-level" 
                        style={{ color: getLevelColor(classItem.level) }}
                      >
                        <MdSignalCellularAlt /> {classItem.level}
                      </span>
                    </div>
                    <p className="class-description">{classItem.description}</p>
                    <div className="class-details">
                      <div className="class-detail-item">
                        <FaClock className="detail-icon" />
                        <span>{classItem.time}</span>
                      </div>
                      <div className="class-detail-item">
                        <FaUserTie className="detail-icon" />
                        <span>{classItem.trainer}</span>
                      </div>
                      <div className="class-detail-item">
                        <MdPeople className="detail-icon" />
                        <span>{classItem.spots} spots</span>
                      </div>
                    </div>
                    <motion.button 
                      className="reserve-btn"
                      onClick={() => handleReserveSpot(classItem)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Reserve Spot
                    </motion.button>
                  </div>
                </motion.li>
              );
            })}
          </motion.ul>
        </AnimatePresence>
      </div>
      <Footer />
    </section>
  );
};

export default Classes;