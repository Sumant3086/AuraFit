import './stats.css';
import { FaUsers, FaDumbbell, FaTrophy, FaHeart } from 'react-icons/fa';
import { Fade } from 'react-awesome-reveal';

const Stats = () => {
  const stats = [
    {
      icon: <FaUsers />,
      number: '5,000+',
      label: 'Active Members',
      color: '#00f5ff'
    },
    {
      icon: <FaDumbbell />,
      number: '35+',
      label: 'Certified Trainers',
      color: '#ff00ff'
    },
    {
      icon: <FaTrophy />,
      number: '10,000+',
      label: 'Transformations',
      color: '#00f5ff'
    },
    {
      icon: <FaHeart />,
      number: '98%',
      label: 'Satisfaction Rate',
      color: '#ff00ff'
    }
  ];

  return (
    <section className="stats-section">
      <div className="stats-container">
        <Fade triggerOnce cascade damping={0.1}>
          {stats.map((stat, index) => (
            <div key={index} className="stat-card" style={{ '--accent-color': stat.color }}>
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </Fade>
      </div>
    </section>
  );
};

export default Stats;
