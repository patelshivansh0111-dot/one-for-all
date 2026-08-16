import { Request, Response } from 'express';
import Notification from '../models/Notification';
import { AuthRequest } from '../types/express';
import { sendSuccess, paginateQuery } from '../utils/helpers';
import { notFound } from '../utils/apiError';

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { skip, limit } = paginateQuery(req.query.page as string, req.query.limit as string);

  const filter: Record<string, unknown> = { recipient: authReq.user!._id };
  if (req.query.unread === 'true') filter.isRead = false;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'name username avatar'),
    Notification.countDocuments(filter),
    Notification.countDocuments({ recipient: authReq.user!._id, isRead: false }),
  ]);

  sendSuccess(res, { notifications, unreadCount, total });
};

export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: authReq.user!._id },
    { isRead: true },
    { new: true }
  );

  if (!notification) throw notFound('Notification not found');
  sendSuccess(res, { notification });
};

export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;

  await Notification.updateMany(
    { recipient: authReq.user!._id, isRead: false },
    { isRead: true }
  );

  sendSuccess(res, undefined, 'All notifications marked as read');
};

export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  await Notification.findOneAndDelete({
    _id: req.params.id,
    recipient: authReq.user!._id,
  });
  sendSuccess(res, undefined, 'Notification deleted');
};
