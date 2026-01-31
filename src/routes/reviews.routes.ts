import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { createReview, getProductReviews, getMyReviews } from '../controllers/reviews.controller';

const router = Router();

router.post('/reviews', authenticate, authorize('customer'), createReview);
router.get('/products/:productId/reviews', getProductReviews);
router.get('/users/me/reviews', authenticate, getMyReviews);

export default router;
