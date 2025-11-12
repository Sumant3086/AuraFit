import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
      <h1 className="classes-title">Classes <span>Schedule</span></h1>
      <p className="classes-subtitle">Join our expert-led fitness classes designed for all levels</p>
      <div className="classes-container">
        <div className='classes-days'>
          {Object.keys(classesByDay).map((day) => (
            <button
              className={selectedDay === day ? 'active' : ''}
              key={day}
              onClick={() => handleDayClick(day)}
            >
              {day}
            </button>
          ))}
        </div>
        <ul className="classes-list">
          {classesByDay[selectedDay]?.map((classItem, index) => {
            const IconComponent = iconMap[classItem.icon];
            return (
              <li key={index} className="class-card">
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
                  <button 
                    className="reserve-btn"
                    onClick={() => handleReserveSpot(classItem)}
                  >
                    Reserve Spot
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <Footer />
    </section>
  );
};

export default Classes;