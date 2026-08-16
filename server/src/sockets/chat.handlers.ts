import { Server, Socket } from 'socket.io';
import User from '../models/User';
import Message from '../models/Message';
import Conversation from '../models/Conversation';
import { verifyAccessToken } from '../utils/jwt';

const onlineUsers = new Map<string, string>();

export const getOnlineUsers = (): Map<string, string> => onlineUsers;

export const registerChatHandlers = (io: Server, socket: Socket): void => {
  const userId = socket.data.userId as string;

  socket.on('conversation:join', async (conversationId: string) => {
    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) return;
      if (!conversation.participants.some((p) => p.toString() === userId)) return;

      socket.join(`conversation:${conversationId}`);
      socket.emit('conversation:joined', { conversationId });
    } catch (error) {
      socket.emit('error', { message: 'Failed to join conversation' });
    }
  });

  socket.on('conversation:leave', (conversationId: string) => {
    socket.leave(`conversation:${conversationId}`);
  });

  socket.on('typing:start', (conversationId: string) => {
    socket.to(`conversation:${conversationId}`).emit('typing:start', {
      userId,
      conversationId,
    });
  });

  socket.on('typing:stop', (conversationId: string) => {
    socket.to(`conversation:${conversationId}`).emit('typing:stop', {
      userId,
      conversationId,
    });
  });

  socket.on('message:send', async (data: { conversationId: string; content: string; type?: string }) => {
    try {
      const conversation = await Conversation.findById(data.conversationId);
      if (!conversation) return;
      if (!conversation.participants.some((p) => p.toString() === userId)) return;

      const messageType = (data.type || 'text') as import('../models/Message').MessageType;
      const message = await Message.create({
        conversation: data.conversationId,
        sender: userId,
        content: data.content,
        type: messageType,
      });

      conversation.lastMessage = message._id;
      conversation.updatedAt = new Date();
      await conversation.save();

      const populated = await Message.findById(message._id).populate('sender', 'name username avatar');

      io.to(`conversation:${data.conversationId}`).emit('message:new', {
        message: populated,
        conversationId: data.conversationId,
      });
    } catch (error) {
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('message:seen', async (data: { conversationId: string; messageIds: string[] }) => {
    try {
      await Message.updateMany(
        { _id: { $in: data.messageIds }, seenBy: { $ne: userId } },
        { $addToSet: { seenBy: userId } }
      );

      socket.to(`conversation:${data.conversationId}`).emit('message:seen', {
        userId,
        messageIds: data.messageIds,
      });
    } catch (error) {
      socket.emit('error', { message: 'Failed to mark messages as seen' });
    }
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(userId);
    io.emit('user:offline', { userId });
  });
};

export const setUserOnline = (io: Server, userId: string, socketId: string): void => {
  onlineUsers.set(userId, socketId);
  io.emit('user:online', { userId });
};

export const authenticateSocket = async (
  socket: Socket,
  next: (err?: Error) => void
): Promise<void> => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers.authorization?.replace('Bearer ', '') ||
      socket.handshake.headers.cookie?.match(/accessToken=([^;]+)/)?.[1];

    if (!token) return next(new Error('Authentication required'));

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userId);
    if (!user || user.isBanned) return next(new Error('Invalid user'));

    socket.data.userId = user._id.toString();
    socket.data.user = user;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
};
