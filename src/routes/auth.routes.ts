import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { uploadImage } from '../middleware/upload';
import { register, login, me, updateProfile, deleteAccount, changePassword, forgotPassword, resetPassword, logout } from '../controllers/auth.controller';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, me);
router.patch('/me', authenticate, uploadImage.single('avatar'), updateProfile);
router.delete('/me', authenticate, deleteAccount);
router.post('/change-password', authenticate, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/logout', authenticate, logout);

export default router;
