import { Server, Socket } from 'socket.io';

export const registerNotificationHandlers = (io: Server, socket: Socket): void => {
  const userId = socket.data.userId as string;

  socket.join(`user:${userId}`);

  socket.on('notification:read', (notificationId: string) => {
    socket.emit('notification:read:ack', { notificationId });
  });
};

export const emitNotification = (
  io: Server,
  userId: string,
  notification: Record<string, unknown>
): void => {
  io.to(`user:${userId}`).emit('notification:new', notification);
};

export const emitUnreadCount = (io: Server, userId: string, count: number): void => {
  io.to(`user:${userId}`).emit('notification:unread-count', { count });
};
