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
      const days = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 90;
      const dates = Array.from({ length: days }, (_, i) => 
        format(subDays(new Date(), days - 1 - i), 'MMM dd')
      );

      // Fetch actual data from API
      const statsResponse = await adminAPI.getStats();
      const ordersResponse = await adminAPI.getOrders();
      const usersResponse = await adminAPI.getUsers();
      const membershipsResponse = await adminAPI.getMemberships();

      const stats = statsResponse?.data || {};
      const orders = ordersResponse?.data || [];
      const users = usersResponse?.data || [];
      const memberships = membershipsResponse?.data || [];

      // Calculate revenue data from actual orders
      const revenueByDate = {};
      orders.forEach(order => {
        const date = format(new Date(order.orderDate || order.createdAt), 'MMM dd');
        revenueByDate[date] = (revenueByDate[date] || 0) + (order.totalAmount || 0);
      });

      setRevenueData({
        labels: dates,
        datasets: [
          {
            label: 'Revenue (₹)',
            data: dates.map(date => revenueByDate[date] || 0),
            borderColor: '#00f5ff',
            backgroundColor: 'rgba(0, 245, 255, 0.1)',
            fill: true,
            tension: 0.4,
          },
        ],
      });

      // Calculate user growth from actual users
      const usersByDate = {};
      users.forEach(user => {
        const date = format(new Date(user.createdAt), 'MMM dd');
        usersByDate[date] = (usersByDate[date] || 0) + 1;
      });

      setUserGrowthData({
        labels: dates,
        datasets: [
          {
            label: 'New Users',
            data: dates.map(date => usersByDate[date] || 0),
            backgroundColor: '#00f5ff',
          },
          {
            label: 'Active Users',
            data: dates.map(date => {
              const newUsers = usersByDate[date] || 0;
              return Math.floor(newUsers * 1.5); // Active users estimation
            }),
            backgroundColor: '#ff00ff',
          },
        ],
      });

      // Calculate membership distribution from actual data
      const membershipCounts = {
        Basic: 0,
        Pro: 0,
        Premium: 0,
      };

      memberships.forEach(membership => {
        if (membership.status === 'approved' && membershipCounts.hasOwnProperty(membership.plan)) {
          membershipCounts[membership.plan]++;
        }
      });

      const totalMemberships = Object.values(membershipCounts).reduce((a, b) => a + b, 0);

      setMembershipDistribution({
        labels: ['Basic', 'Pro', 'Premium'],
        datasets: [
          {
            data: totalMemberships > 0 
              ? [membershipCounts.Basic, membershipCounts.Pro, membershipCounts.Premium]
              : [0, 0, 0],
            backgroundColor: ['#9d00ff', '#00f5ff', '#ffd700'],
            borderWidth: 0,
          },
        ],
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Set empty data on error
      const days = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 90;
      const dates = Array.from({ length: days }, (_, i) => 
        format(subDays(new Date(), days - 1 - i), 'MMM dd')
      );

      setRevenueData({
        labels: dates,
        datasets: [{
          label: 'Revenue (₹)',
          data: Array(days).fill(0),
          borderColor: '#00f5ff',
          backgroundColor: 'rgba(0, 245, 255, 0.1)',
          fill: true,
          tension: 0.4,
        }],
      });

      setUserGrowthData({
        labels: dates,
        datasets: [
          { label: 'New Users', data: Array(days).fill(0), backgroundColor: '#00f5ff' },
          { label: 'Active Users', data: Array(days).fill(0), backgroundColor: '#ff00ff' },
        ],
      });

      setMembershipDistribution({
        labels: ['Basic', 'Pro', 'Premium'],
        datasets: [{ data: [0, 0, 0], backgroundColor: ['#9d00ff', '#00f5ff', '#ffd700'], borderWidth: 0 }],
      });
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
