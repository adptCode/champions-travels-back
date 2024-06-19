// src/routes/userRoutes.js
import { Router } from 'express';
import { getUser, updateUser, uploadPhoto, deletePhoto } from '../controllers/userController.js';
import { authenticateToken } from '../middlewares/authenticateToken.js';
import { uploadFileMiddleware } from '../middlewares/upload.js';

const router = Router();

router.get('/', authenticateToken(['user', 'admin']), getUser);
router.patch('/', authenticateToken(['user', 'admin']), updateUser);
router.post('/upload-photo', authenticateToken(['user', 'admin']), uploadFileMiddleware, uploadPhoto);
router.delete('/delete-photo', authenticateToken(['user', 'admin']), deletePhoto);

export default router;