import { Request, Response } from 'express';
import Conversation from '../models/Conversation';
import Message from '../models/Message';
import User from '../models/User';
import Notification from '../models/Notification';
import { AuthRequest } from '../types/express';
import { sendSuccess, paginateQuery } from '../utils/helpers';
import { notFound, badRequest, forbidden } from '../utils/apiError';

export const getConversations = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { skip, limit } = paginateQuery(req.query.page as string, req.query.limit as string);

  const conversations = await Conversation.find({
    participants: authReq.user!._id,
  })
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('participants', 'name username avatar')
    .populate('lastMessage');

  sendSuccess(res, { conversations });
};

export const getMessages = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const conversation = await Conversation.findById(req.params.conversationId);
  if (!conversation) throw notFound('Conversation not found');

  if (!conversation.participants.some((p) => p.toString() === authReq.user!._id.toString())) {
    throw forbidden('Not a participant');
  }

  const { skip, limit } = paginateQuery(req.query.page as string, req.query.limit as string);
  const messages = await Message.find({ conversation: conversation._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('sender', 'name username avatar');

  sendSuccess(res, { messages: messages.reverse() });
};

export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const conversation = await Conversation.findById(req.params.conversationId);
  if (!conversation) throw notFound('Conversation not found');

  if (!conversation.participants.some((p) => p.toString() === authReq.user!._id.toString())) {
    throw forbidden('Not a participant');
  }

  const message = await Message.create({
    conversation: conversation._id,
    sender: authReq.user!._id,
    content: req.body.content,
    type: req.body.type || 'text',
    mediaUrl: req.body.mediaUrl,
  });

  conversation.lastMessage = message._id;
  conversation.updatedAt = new Date();
  await conversation.save();

  const otherParticipants = conversation.participants.filter(
    (p) => p.toString() !== authReq.user!._id.toString()
  );

  for (const participantId of otherParticipants) {
    await Notification.create({
      recipient: participantId,
      sender: authReq.user!._id,
      type: 'message',
      title: 'New Message',
      body: req.body.content.slice(0, 100),
      link: `/messages/${conversation._id}`,
    });
  }

  const populated = await message.populate('sender', 'name username avatar');
  sendSuccess(res, { message: populated }, 'Message sent', 201);
};

export const createDM = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { userId } = req.body;

  if (authReq.user!._id.toString() === userId) throw badRequest('Cannot message yourself');

  const target = await User.findById(userId);
  if (!target) throw notFound('User not found');

  let conversation = await Conversation.findOne({
    type: 'private',
    participants: { $all: [authReq.user!._id, userId], $size: 2 },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      type: 'private',
      participants: [authReq.user!._id, userId],
    });
  }

  sendSuccess(res, { conversation }, 'Conversation ready', 201);
};

export const createGroup = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { name, participantIds } = req.body;

  const participants = [...new Set([authReq.user!._id.toString(), ...participantIds])];

  const conversation = await Conversation.create({
    type: 'group',
    name,
    participants,
    avatar: req.body.avatar,
  });

  sendSuccess(res, { conversation }, 'Group created', 201);
};

export const markSeen = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const conversationId = req.params.conversationId;

  await Message.updateMany(
    {
      conversation: conversationId,
      sender: { $ne: authReq.user!._id },
      seenBy: { $ne: authReq.user!._id },
    },
    { $addToSet: { seenBy: authReq.user!._id } }
  );

  sendSuccess(res, undefined, 'Messages marked as seen');
};

export const addReaction = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { emoji } = req.body;
  const message = await Message.findById(req.params.messageId);
  if (!message) throw notFound('Message not found');

  message.reactions = message.reactions.filter(
    (r) => r.user.toString() !== authReq.user!._id.toString()
  );
  message.reactions.push({ user: authReq.user!._id, emoji });
  await message.save();

  sendSuccess(res, { reactions: message.reactions });
};
