import { Request, Response } from 'express';
import Event from '../models/Event';
import Notification from '../models/Notification';
import { AuthRequest } from '../types/express';
import { sendSuccess, paginateQuery } from '../utils/helpers';
import { notFound, badRequest, forbidden } from '../utils/apiError';

export const createEvent = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;

  const event = await Event.create({
    ...req.body,
    host: authReq.user!._id,
    attendees: [{ user: authReq.user!._id, status: 'going' }],
  });

  sendSuccess(res, { event }, 'Event created', 201);
};

export const getEvents = async (req: Request, res: Response): Promise<void> => {
  const { skip, limit, page } = paginateQuery(req.query.page as string, req.query.limit as string);
  const filter: Record<string, unknown> = {};

  if (req.query.type) filter.type = req.query.type;
  if (req.query.community) filter.community = req.query.community;

  const [events, total] = await Promise.all([
    Event.find(filter)
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(limit)
      .populate('host', 'name username avatar'),
    Event.countDocuments(filter),
  ]);

  sendSuccess(res, { events, pagination: { page, limit, total } });
};

export const getUpcoming = async (req: Request, res: Response): Promise<void> => {
  const { limit } = paginateQuery(1, req.query.limit as string);

  const events = await Event.find({ startDate: { $gte: new Date() } })
    .sort({ startDate: 1 })
    .limit(limit)
    .populate('host', 'name username avatar');

  sendSuccess(res, { events });
};

export const getEventById = async (req: Request, res: Response): Promise<void> => {
  const event = await Event.findById(req.params.id)
    .populate('host', 'name username avatar')
    .populate('attendees.user', 'name username avatar');

  if (!event) throw notFound('Event not found');
  sendSuccess(res, { event });
};

export const updateEvent = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const event = await Event.findById(req.params.id);
  if (!event) throw notFound('Event not found');
  if (event.host.toString() !== authReq.user!._id.toString()) throw forbidden('Not authorized');

  const allowed = [
    'title', 'description', 'type', 'startDate', 'endDate', 'location',
    'coordinates', 'isOnline', 'meetingLink', 'coverImage', 'maxAttendees', 'tags',
  ];
  for (const key of allowed) {
    if (req.body[key] !== undefined) (event as unknown as Record<string, unknown>)[key] = req.body[key];
  }

  await event.save();
  sendSuccess(res, { event }, 'Event updated');
};

export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const event = await Event.findById(req.params.id);
  if (!event) throw notFound('Event not found');

  const isHost = event.host.toString() === authReq.user!._id.toString();
  const isAdmin = authReq.user!.role === 'admin';
  if (!isHost && !isAdmin) throw forbidden('Not authorized');

  await event.deleteOne();
  sendSuccess(res, undefined, 'Event deleted');
};

export const rsvp = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { status } = req.body;
  const event = await Event.findById(req.params.id);
  if (!event) throw notFound('Event not found');

  if (!['going', 'interested', 'not_going'].includes(status)) {
    throw badRequest('Invalid RSVP status');
  }

  if (status === 'going' && event.maxAttendees) {
    const goingCount = event.attendees.filter((a) => a.status === 'going').length;
    if (goingCount >= event.maxAttendees) throw badRequest('Event is full');
  }

  const existing = event.attendees.find(
    (a) => a.user.toString() === authReq.user!._id.toString()
  );

  if (existing) {
    existing.status = status;
  } else {
    event.attendees.push({ user: authReq.user!._id, status });
  }

  await event.save();

  if (status === 'going' && event.host.toString() !== authReq.user!._id.toString()) {
    await Notification.create({
      recipient: event.host,
      sender: authReq.user!._id,
      type: 'event',
      title: 'New RSVP',
      body: `${authReq.user!.name} is going to ${event.title}`,
      link: `/events/${event._id}`,
    });
  }

  sendSuccess(res, { attendees: event.attendees }, 'RSVP updated');
};

export const getEventsByType = async (req: Request, res: Response): Promise<void> => {
  const { skip, limit } = paginateQuery(req.query.page as string, req.query.limit as string);
  const type = String(req.params.type);

  const events = await Event.find({ type: type as import('../models/Event').EventType })
    .sort({ startDate: 1 })
    .skip(skip)
    .limit(limit)
    .populate('host', 'name username avatar');

  sendSuccess(res, { events });
};
