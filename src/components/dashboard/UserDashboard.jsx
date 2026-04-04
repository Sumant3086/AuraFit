import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import { format, subDays } from 'date-fns';
import { FiTrendingUp, FiTrendingDown, FiCalendar, FiActivity, FiTarget } from 'react-icons/fi';
import './dashboard.css';

const UserDashboard = () => {
  const [measurements, setMeasurements] = useState([]);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [goals, setGoals] = useState({
    targetWeight: 70,
    currentWeight: 75,
    targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    // Simulate loading data
    const mockMeasurements = Array.from({ length: 30 }, (_, i) => ({
      date: subDays(new Date(), 29 - i),
      weight: 75 - (i * 0.1),
      bodyFat: 20 - (i * 0.05),
      muscle: 35 + (i * 0.03),
    }));
    setMeasurements(mockMeasurements);

    const mockWorkouts = Array.from({ length: 10 }, (_, i) => ({
      date: subDays(new Date(), i),
      type: ['Strength', 'Cardio', 'Yoga'][i % 3],
      duration: 45 + Math.floor(Math.random() * 30),
      calories: 300 + Math.floor(Math.random() * 200),
    }));
    setWorkoutHistory(mockWorkouts);
  };

  const weightChartData = {
    labels: measurements.map(m => format(m.date, 'MMM dd')),
    datasets: [
      {
        label: 'Weight (kg)',
        data: measurements.map(m => m.weight),
        borderColor: '#00f5ff',
        backgroundColor: 'rgba(0, 245, 255, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Target',
        data: Array(measurements.length).fill(goals.targetWeight),
        borderColor: '#00ff88',
        borderDash: [5, 5],
        fill: false,
      },
    ],
  };

  const bodyCompositionData = {
    labels: measurements.slice(-7).map(m => format(m.date, 'MMM dd')),
    datasets: [
      {
        label: 'Body Fat %',
        data: measurements.slice(-7).map(m => m.bodyFat),
        borderColor: '#ff00ff',
        backgroundColor: 'rgba(255, 0, 255, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Muscle Mass %',
        data: measurements.slice(-7).map(m => m.muscle),
        borderColor: '#00ff88',
        backgroundColor: 'rgba(0, 255, 136, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#fff', font: { size: 12 } },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#00f5ff',
        bodyColor: '#fff',
      },
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(0, 245, 255, 0.1)' },
      },
      y: {
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(0, 245, 255, 0.1)' },
      },
    },
  };

  const progress = ((goals.currentWeight - measurements[measurements.length - 1]?.weight) / (goals.currentWeight - goals.targetWeight)) * 100;

  return (
    <div className="user-dashboard">
      <motion.div
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>My Fitness Dashboard</h1>
        <p>Track your progress and achieve your goals</p>
      </motion.div>

      <div className="dashboard-stats">
        <motion.div
          className="stat-card-dash"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="stat-icon cyan">
            <FiActivity />
          </div>
          <div className="stat-info-dash">
            <h3>{workoutHistory.length}</h3>
            <p>Workouts This Month</p>
          </div>
        </motion.div>

        <motion.div
          className="stat-card-dash"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="stat-icon green">
            <FiTarget />
          </div>
          <div className="stat-info-dash">
            <h3>{progress.toFixed(1)}%</h3>
            <p>Goal Progress</p>
          </div>
        </motion.div>

        <motion.div
          className="stat-card-dash"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="stat-icon purple">
            {measurements[measurements.length - 1]?.weight < measurements[0]?.weight ? (
              <FiTrendingDown />
            ) : (
              <FiTrendingUp />
            )}
          </div>
          <div className="stat-info-dash">
            <h3>{measurements[measurements.length - 1]?.weight.toFixed(1)} kg</h3>
            <p>Current Weight</p>
          </div>
        </motion.div>
      </div>

      <div className="dashboard-charts">
        <motion.div
          className="chart-card-dash"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3>Weight Progress</h3>
          <div className="chart-wrapper-dash">
            <Line data={weightChartData} options={chartOptions} />
          </div>
        </motion.div>

        <motion.div
          className="chart-card-dash"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3>Body Composition</h3>
          <div className="chart-wrapper-dash">
            <Line data={bodyCompositionData} options={chartOptions} />
          </div>
        </motion.div>
      </div>

      <motion.div
        className="workout-history"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h3>Recent Workouts</h3>
        <div className="workout-list">
          {workoutHistory.slice(0, 5).map((workout, index) => (
            <motion.div
              key={index}
              className="workout-item"
              whileHover={{ scale: 1.02, x: 5 }}
            >
              <div className="workout-icon">
                <FiCalendar />
              </div>
              <div className="workout-details">
                <h4>{workout.type}</h4>
                <p>{format(workout.date, 'MMM dd, yyyy')}</p>
              </div>
              <div className="workout-stats">
                <span>{workout.duration} min</span>
                <span>{workout.calories} cal</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default UserDashboard;
