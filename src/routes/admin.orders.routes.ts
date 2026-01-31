import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { adminListOrders, adminUpdateStatus } from '../controllers/orders.controller';

const router = Router();

router.use(authenticate, authorize('admin'));
router.get('/', adminListOrders);
router.patch('/:id/status', adminUpdateStatus);

export default router;
