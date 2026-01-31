import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { createOrder, getMyOrders, getOrder, cancelOrder, adminListOrders, adminUpdateStatus } from '../controllers/orders.controller';

const router = Router();

router.use(authenticate);

router.get('/admin/all', authorize('admin'), adminListOrders);
router.patch('/admin/:id/status', authorize('admin'), adminUpdateStatus);

router.post('/', authorize('customer'), createOrder);
router.get('/', authorize('customer'), getMyOrders);
router.get('/:id', authorize('customer'), getOrder);
router.patch('/:id/cancel', authorize('customer'), cancelOrder);

export default router;
