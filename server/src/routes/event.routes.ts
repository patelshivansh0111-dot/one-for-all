import { Router } from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/helpers';
import * as eventController from '../controllers/event.controller';

const router = Router();

router.get('/', asyncHandler(eventController.getEvents));
router.get('/upcoming', asyncHandler(eventController.getUpcoming));
router.get('/type/:type', asyncHandler(eventController.getEventsByType));
router.get('/:id', asyncHandler(eventController.getEventById));

router.use(protect);

router.post(
  '/',
  validate([
    body('title').notEmpty(),
    body('description').notEmpty(),
    body('type').isIn(['meetup', 'hackathon', 'gaming', 'study', 'sports', 'workshop', 'online']),
    body('startDate').isISO8601(),
    body('endDate').isISO8601(),
  ]),
  asyncHandler(eventController.createEvent)
);

router.put('/:id', asyncHandler(eventController.updateEvent));
router.delete('/:id', asyncHandler(eventController.deleteEvent));
router.post('/:id/rsvp', validate([body('status').isIn(['going', 'interested', 'not_going'])]), asyncHandler(eventController.rsvp));

export default router;
