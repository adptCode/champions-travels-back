// src/routes/userRoutes.js
import { Router } from 'express';
import { getUser, getUserById, updateUser, uploadPhoto, deletePhoto, addPreference, removePreference, getUserEvents, removeUserFromEvent } from '../controllers/userController.js';
import { authenticateToken } from '../middlewares/authenticateToken.js';
// import { uploadMiddleware } from '../middlewares/uploadMiddleware.js';
import { uploadMiddleware } from '../middlewares/firebaseAdminUpload.js';

const router = Router();

router.get('/', authenticateToken(['user', 'admin']), getUser);
router.get('/:id', authenticateToken(['user', 'admin']), getUserById);
router.get('/:id/events', authenticateToken(['user', 'admin']), getUserEvents);
router.patch('/', authenticateToken(['user', 'admin']), updateUser);
router.post('/upload-photo', authenticateToken(['user', 'admin']), uploadMiddleware, uploadPhoto);
router.delete('/delete-photo', authenticateToken(['user', 'admin']), deletePhoto);
router.post('/preferences', authenticateToken(['user', 'admin']), addPreference);
router.delete('/preferences', authenticateToken(['user', 'admin']), removePreference);
router.delete('/:userId/events/:eventId', authenticateToken(['admin']), removeUserFromEvent);

export default router;