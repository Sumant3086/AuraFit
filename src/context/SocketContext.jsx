import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const socketURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const newSocket = io(socketURL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('🔌 WebSocket connected');
      setConnected(true);
      
      // Authenticate user if logged in
      const user = localStorage.getItem('user');
      if (user) {
        try {
          const userData = JSON.parse(user);
          newSocket.emit('authenticate', {
            userId: userData.id,
            role: userData.role || 'user',
          });
        } catch (error) {
          console.error('Error authenticating socket:', error);
        }
      }
    });

    newSocket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      setConnected(false);
    });

    newSocket.on('authenticated', (data) => {
      console.log('✅ Socket authenticated:', data);
    });

    // Listen for notifications
    newSocket.on('notification', (data) => {
      setNotifications(prev => [data, ...prev].slice(0, 50)); // Keep last 50
    });

    // Listen for admin notifications
    newSocket.on('admin-notification', (data) => {
      setNotifications(prev => [data, ...prev].slice(0, 50));
    });

    // Listen for class booking updates
    newSocket.on('class-booking-update', (data) => {
      console.log('📅 Class booking update:', data);
    });

    // Listen for membership updates
    newSocket.on('membership-update', (data) => {
      console.log('💳 Membership update:', data);
    });

    // Listen for order updates
    newSocket.on('order-update', (data) => {
      console.log('🛍️ Order update:', data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const sendMessage = (event, data) => {
    if (socket && connected) {
      socket.emit(event, data);
    }
  };

  const joinRoom = (roomId) => {
    if (socket && connected) {
      socket.emit('join-room', roomId);
    }
  };

  const leaveRoom = (roomId) => {
    if (socket && connected) {
      socket.emit('leave-room', roomId);
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const value = {
    socket,
    connected,
    notifications,
    sendMessage,
    joinRoom,
    leaveRoom,
    clearNotifications,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
