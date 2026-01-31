import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { uploadImage } from '../middleware/upload';
import { uploadProfileImage } from '../controllers/uploads.controller';

const router = Router();

router.post('/profile', authenticate, uploadImage.single('file'), uploadProfileImage);

export default router;
