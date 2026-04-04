const socketIO = require('socket.io');

let io;
const userSockets = new Map(); // userId -> socketId mapping
const adminSockets = new Set(); // Set of admin socket IDs

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);

    // User authentication
    socket.on('authenticate', (data) => {
      const { userId, role } = data;
      
      if (userId) {
        userSockets.set(userId, socket.id);
        socket.userId = userId;
        socket.role = role;
        
        if (role === 'admin') {
          adminSockets.add(socket.id);
        }
        
        console.log(`✅ User authenticated: ${userId} (${role})`);
        socket.emit('authenticated', { success: true });
      }
    });

    // Join specific rooms
    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      console.log(`📍 Socket ${socket.id} joined room: ${roomId}`);
    });

    // Leave room
    socket.on('leave-room', (roomId) => {
      socket.leave(roomId);
      console.log(`🚪 Socket ${socket.id} left room: ${roomId}`);
    });

    // Chat message
    socket.on('chat-message', (data) => {
      const { to, message, from } = data;
      const recipientSocketId = userSockets.get(to);
      
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('chat-message', {
          from,
          message,
          timestamp: new Date(),
        });
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      const { to, isTyping } = data;
      const recipientSocketId = userSockets.get(to);
      
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('typing', {
          from: socket.userId,
          isTyping,
        });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
      
      if (socket.userId) {
        userSockets.delete(socket.userId);
      }
      
      if (socket.role === 'admin') {
        adminSockets.delete(socket.id);
      }
    });
  });

  return io;
};

// Emit to specific user
const emitToUser = (userId, event, data) => {
  const socketId = userSockets.get(userId);
  if (socketId && io) {
    io.to(socketId).emit(event, data);
    return true;
  }
  return false;
};

// Emit to all admins
const emitToAdmins = (event, data) => {
  if (io) {
    adminSockets.forEach(socketId => {
      io.to(socketId).emit(event, data);
    });
    return true;
  }
  return false;
};

// Emit to all connected clients
const emitToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
    return true;
  }
  return false;
};

// Emit to specific room
const emitToRoom = (roomId, event, data) => {
  if (io) {
    io.to(roomId).emit(event, data);
    return true;
  }
  return false;
};

// Get online users count
const getOnlineUsersCount = () => {
  return userSockets.size;
};

// Check if user is online
const isUserOnline = (userId) => {
  return userSockets.has(userId);
};

module.exports = {
  initializeSocket,
  emitToUser,
  emitToAdmins,
  emitToAll,
  emitToRoom,
  getOnlineUsersCount,
  isUserOnline,
};
