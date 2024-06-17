import { Router } from 'express';
import { getEvents, getEventById, addEvent, updateEvent, deleteEvent, participateEvent, getParticipants } from '../controllers/eventController.js';
import { authenticateToken } from '../middlewares/authenticateToken.js';
import { eventValidator } from '../validations/event.validation.js';
import { idValidator } from '../validations/generic.validation.js';
import { uploadFileMiddleware } from '../middlewares/upload.js';

const router = Router();

router.get('/', getEvents);
router.get('/:id', idValidator, getEventById);
router.post('/', authenticateToken(['admin']), uploadFileMiddleware, eventValidator, addEvent);
router.patch('/:id', authenticateToken(['admin']), idValidator, uploadFileMiddleware, eventValidator, updateEvent);
router.delete('/:id', authenticateToken(['admin']), idValidator, deleteEvent);

router.post('/:id/participate', authenticateToken(['user', 'admin']), participateEvent);
router.get('/:id/participants', authenticateToken(['user', 'admin']), getParticipants);

export default router;
