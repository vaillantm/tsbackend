import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { uploadImage } from '../middleware/upload';
import { createCategory, getCategories, getCategory, updateCategory, deleteCategory } from '../controllers/categories.controller';

const router = Router();

router.get('/', getCategories);
router.get('/:id', getCategory);
router.post('/', authenticate, authorize('admin'), uploadImage.single('image'), createCategory);
router.patch('/:id', authenticate, authorize('admin'), uploadImage.single('image'), updateCategory);
router.delete('/:id', authenticate, authorize('admin'), deleteCategory);

export default router;
