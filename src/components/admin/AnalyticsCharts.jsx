import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { FiDownload, FiCalendar } from 'react-icons/fi';
import { adminAPI } from '../../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AnalyticsCharts = () => {
  const [dateRange, setDateRange] = useState('7days');
  const [revenueData, setRevenueData] = useState([]);
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [membershipDistribution, setMembershipDistribution] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Simulate analytics data - replace with actual API calls
      const days = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 90;
      const dates = Array.from({ length: days }, (_, i) => 
        format(subDays(new Date(), days - 1 - i), 'MMM dd')
      );

      // Revenue data
      setRevenueData({
        labels: dates,
        datasets: [
          {
            label: 'Revenue (₹)',
            data: Array.from({ length: days }, () => Math.floor(Math.random() * 50000) + 10000),
            borderColor: '#00f5ff',
            backgroundColor: 'rgba(0, 245, 255, 0.1)',
            fill: true,
            tension: 0.4,
          },
        ],
      });

      // User growth data
      setUserGrowthData({
        labels: dates,
        datasets: [
          {
            label: 'New Users',
            data: Array.from({ length: days }, () => Math.floor(Math.random() * 20) + 5),
            backgroundColor: '#00f5ff',
          },
          {
            label: 'Active Users',
            data: Array.from({ length: days }, () => Math.floor(Math.random() * 50) + 20),
            backgroundColor: '#ff00ff',
          },
        ],
      });

      // Membership distribution
      setMembershipDistribution({
        labels: ['Basic', 'Pro', 'Premium'],
        datasets: [
          {
            data: [30, 45, 25],
            backgroundColor: ['#9d00ff', '#00f5ff', '#ffd700'],
            borderWidth: 0,
          },
        ],
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Date', 'Revenue', 'New Users', 'Active Users'],
      ...revenueData.labels.map((label, index) => [
        label,
        revenueData.datasets[0].data[index],
        userGrowthData.datasets[0].data[index],
        userGrowthData.datasets[1].data[index],
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#fff',
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#00f5ff',
        bodyColor: '#fff',
        borderColor: '#00f5ff',
        borderWidth: 1,
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

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#fff',
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#00f5ff',
        bodyColor: '#fff',
      },
    },
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <motion.div
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="analytics-charts">
      <div className="analytics-header">
        <div className="date-range-selector">
          <FiCalendar />
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>
        </div>
        <motion.button
          className="export-btn"
          onClick={exportToCSV}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiDownload /> Export CSV
        </motion.button>
      </div>

      <div className="charts-grid-analytics">
        <motion.div
          className="chart-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3>Revenue Trends</h3>
          <div className="chart-wrapper">
            <Line data={revenueData} options={chartOptions} />
          </div>
        </motion.div>

        <motion.div
          className="chart-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3>User Growth</h3>
          <div className="chart-wrapper">
            <Bar data={userGrowthData} options={chartOptions} />
          </div>
        </motion.div>

        <motion.div
          className="chart-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3>Membership Distribution</h3>
          <div className="chart-wrapper">
            <Doughnut data={membershipDistribution} options={doughnutOptions} />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
