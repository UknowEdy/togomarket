import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

let socket: Socket | null = null;

export const initSocket = (token: string) => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: {
      token
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
  });

  socket.on('connect', () => {
    console.log('✅ Socket.io connecté');
    socket?.emit('user:online');
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket.io déconnecté');
  });

  socket.on('connect_error', (error) => {
    console.error('Erreur Socket.io:', error.message);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    throw new Error('Socket non initialisé. Appelez initSocket() d\'abord.');
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Événements de conversation
export const joinConversation = (conversationId: string) => {
  socket?.emit('conversation:join', conversationId);
};

export const leaveConversation = (conversationId: string) => {
  socket?.emit('conversation:leave', conversationId);
};

// Événements de message
export const emitTyping = (conversationId: string) => {
  socket?.emit('message:typing', { conversationId });
};

export const emitStopTyping = (conversationId: string) => {
  socket?.emit('message:stop-typing', { conversationId });
};

// Listeners
export const onNewMessage = (callback: (message: any) => void) => {
  socket?.on('message:new', callback);
};

export const onTyping = (callback: (data: any) => void) => {
  socket?.on('message:typing', callback);
};

export const onStopTyping = (callback: (data: any) => void) => {
  socket?.on('message:stop-typing', callback);
};

export const onUserStatus = (callback: (data: any) => void) => {
  socket?.on('user:status', callback);
};

// Cleanup
export const removeAllListeners = () => {
  socket?.removeAllListeners();
};
