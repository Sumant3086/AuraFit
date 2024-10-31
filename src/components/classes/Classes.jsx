import React, { useState, useEffect } from 'react';
import './classes.css';
import Footer from '../footer/Footer';
import classesByDay from './classesData';
import CLOCK from '../../assets/logos/clock.png'
import COACH from '../../assets/logos/coach2.png'


const Classes = () => {
  const [selectedDay, setSelectedDay] = useState('');

  useEffect(() => {
    // Set the default active day to be the current day of the week on page load
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDate = new Date();
    const currentDayOfWeek = daysOfWeek[currentDate.getDay()];
    setSelectedDay(currentDayOfWeek);
  }, []);

  const handleDayClick = (day) => {
    setSelectedDay(day);
  };

  return (
    <section className="classes">
      <h1 className="classes-title">Classes schedule</h1>
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
          {classesByDay[selectedDay]?.map((classItem, index) => (
            <li
              key={index}
              className="class-info"
              style={{ backgroundImage: `url(${classItem.img})` }}
            >
              <p className="class-name">{classItem.name}</p>
              <img src={CLOCK} alt='clock' className='class-logo'/><p>{classItem.time}</p>
              <img src={COACH} alt='coach' className='class-logo'/><p>{classItem.trainer}</p>
              <button className="reserve-btn">Reserve</button>
            </li>
          ))}
        </ul>
      </div>
      <Footer />
    </section>
  );
};

export default Classes;