import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext({
  socket: null,
  connected: false,
  notifications: [],
  sendMessage: () => {},
  joinRoom: () => {},
  leaveRoom: () => {},
  clearNotifications: () => {},
  authenticateSocket: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const socketURL = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace('/api', '')
      : 'http://localhost:5000';

    const socket = io(socketURL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 5,
      autoConnect: true,
    });

    socketRef.current = socket;
    setSocket(socket);

    socket.on('connect', () => {
      setConnected(true);
      // Re-authenticate on every (re)connect using current localStorage state
      try {
        const stored = localStorage.getItem('user');
        if (stored) {
          const userData = JSON.parse(stored);
          if (userData?.id) {
            socket.emit('authenticate', { userId: userData.id, role: userData.role || 'member' });
          }
        }
      } catch {
        // Unauthenticated connection — fine for public pages
      }
    });

    socket.on('disconnect', () => setConnected(false));

    // Re-authenticate when user logs in (same tab, cross-provider)
    const onAuth = (e) => {
      const { id, role } = e.detail;
      if (id) socket.emit('authenticate', { userId: id, role });
    };
    const onLogout = () => {
      // No server-side socket cleanup needed; server removes from userSockets on disconnect
    };
    window.addEventListener('aurafit:auth', onAuth);
    window.addEventListener('aurafit:logout', onLogout);

    socket.on('notification', (data) => {
      setNotifications(prev => [data, ...prev].slice(0, 50));
    });

    socket.on('admin-notification', (data) => {
      setNotifications(prev => [data, ...prev].slice(0, 50));
    });

    return () => {
      window.removeEventListener('aurafit:auth', onAuth);
      window.removeEventListener('aurafit:logout', onLogout);
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Called by AuthContext after login to authenticate with fresh user data
  const authenticateSocket = useCallback((userId, role) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('authenticate', { userId, role });
    }
  }, []);

  const sendMessage = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  const joinRoom = useCallback((roomId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join-room', roomId);
    }
  }, []);

  const leaveRoom = useCallback((roomId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave-room', roomId);
    }
  }, []);

  const clearNotifications = useCallback(() => setNotifications([]), []);

  return (
    <SocketContext.Provider value={{
      socket,
      connected,
      notifications,
      sendMessage,
      joinRoom,
      leaveRoom,
      clearNotifications,
      authenticateSocket,
    }}>
      {children}
    </SocketContext.Provider>
  );
};
