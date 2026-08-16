import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { env } from '../config/env';
import {
  authenticateSocket,
  registerChatHandlers,
  setUserOnline,
} from './chat.handlers';
import { registerNotificationHandlers } from './notification.handlers';

let io: Server | null = null;

export const initSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  io.use(authenticateSocket);

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId as string;
    console.log(`Socket connected: ${userId}`);

    setUserOnline(io!, userId, socket.id);
    registerChatHandlers(io!, socket);
    registerNotificationHandlers(io!, socket);

    socket.emit('connected', { userId });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

export default initSocket;
