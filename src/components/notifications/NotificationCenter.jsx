import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiX, FiCheck, FiInfo, FiAlertCircle } from 'react-icons/fi';
import { useSocket } from '../../context/SocketContext';
import './notifications.css';

const NotificationCenter = () => {
  const { notifications, clearNotifications } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <FiCheck />;
      case 'error': return <FiAlertCircle />;
      case 'info': return <FiInfo />;
      default: return <FiBell />;
    }
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === filter);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="notification-center">
      <motion.button
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <FiBell />
        {unreadCount > 0 && (
          <motion.span
            className="notification-badge"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            {unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="notification-dropdown"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
          >
            <div className="notification-header">
              <h3>Notifications</h3>
              <button onClick={() => setIsOpen(false)}>
                <FiX />
              </button>
            </div>

            <div className="notification-filters">
              <button
                className={filter === 'all' ? 'active' : ''}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button
                className={filter === 'success' ? 'active' : ''}
                onClick={() => setFilter('success')}
              >
                Success
              </button>
              <button
                className={filter === 'info' ? 'active' : ''}
                onClick={() => setFilter('info')}
              >
                Info
              </button>
              <button
                className={filter === 'error' ? 'active' : ''}
                onClick={() => setFilter('error')}
              >
                Alerts
              </button>
            </div>

            <div className="notification-list">
              {filteredNotifications.length === 0 ? (
                <div className="no-notifications">
                  <FiBell />
                  <p>No notifications</p>
                </div>
              ) : (
                filteredNotifications.map((notification, index) => (
                  <motion.div
                    key={index}
                    className={`notification-item ${notification.type}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="notification-icon">
                      {getIcon(notification.type)}
                    </div>
                    <div className="notification-content">
                      <h4>{notification.title}</h4>
                      <p>{notification.message}</p>
                      <span className="notification-time">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="notification-footer">
                <button onClick={clearNotifications}>
                  Clear All
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;
