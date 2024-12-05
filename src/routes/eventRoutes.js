import { Router } from 'express';
import { getEvents, getEventById, addEvent, updateEvent, deleteEvent, participateEvent, getParticipants, uploadEventPhoto, deleteEventPhoto, leaveEvent } from '../controllers/eventController.js';
import { authenticateToken } from '../middlewares/authenticateToken.js';
import { eventValidator } from '../validations/event.Validation.js';
import { idValidator } from '../validations/generic.Validation.js';
import { uploadMiddleware } from '../middlewares/uploadMiddleware.js';

const router = Router();

router.get('/', getEvents);
router.get('/:id', idValidator, getEventById);
router.post('/', authenticateToken(['admin']), uploadMiddleware, eventValidator, addEvent);
router.patch('/:id', authenticateToken(['admin']), idValidator, uploadMiddleware, eventValidator, updateEvent);
router.delete('/:id', authenticateToken(['admin']), idValidator, deleteEvent);

router.patch('/:id/upload-photo', authenticateToken(['admin']), uploadMiddleware, uploadEventPhoto);
router.delete('/:id/delete-photo', authenticateToken(['admin']), deleteEventPhoto);

router.post('/:id/participate', authenticateToken(['user', 'admin']), participateEvent);
router.get('/:id/participants', authenticateToken(['user', 'admin']), getParticipants);
router.delete('/:id/leave', authenticateToken(['user', 'admin']), leaveEvent);

export default router;
