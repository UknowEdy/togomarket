const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;

/**
 * Initialise Socket.io
 */
const initSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true
    }
  });

  // Middleware d'authentification Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  // Gestion des connexions
  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.userId}`);

    // Rejoindre sa room personnelle
    socket.join(socket.userId);

    // Marquer l'utilisateur comme en ligne
    socket.on('user:online', () => {
      socket.broadcast.emit('user:status', {
        userId: socket.userId,
        status: 'online'
      });
    });

    // Rejoindre une conversation
    socket.on('conversation:join', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`User ${socket.userId} joined conversation ${conversationId}`);
    });

    // Quitter une conversation
    socket.on('conversation:leave', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Événement : utilisateur en train d'écrire
    socket.on('message:typing', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('message:typing', {
        userId: socket.userId,
        userName: socket.user.fullName
      });
    });

    // Événement : utilisateur arrête d'écrire
    socket.on('message:stop-typing', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('message:stop-typing', {
        userId: socket.userId
      });
    });

    // Déconnexion
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.userId}`);
      socket.broadcast.emit('user:status', {
        userId: socket.userId,
        status: 'offline'
      });
    });
  });

  return io;
};

/**
 * Obtenir l'instance Socket.io
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

/**
 * Émettre un nouveau message à une conversation
 */
const emitNewMessage = (conversationId, message) => {
  if (io) {
    io.to(`conversation:${conversationId}`).emit('message:new', message);
  }
};

/**
 * Notifier un utilisateur
 */
const notifyUser = (userId, event, data) => {
  if (io) {
    io.to(userId.toString()).emit(event, data);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitNewMessage,
  notifyUser
};
