import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { createOrder, getMyOrders, getOrder, cancelOrder, adminListOrders, adminUpdateStatus } from '../controllers/orders.controller';

const router = Router();

router.use(authenticate);
router.post('/', createOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrder);
router.patch('/:id/cancel', cancelOrder);
router.get('/admin/all', authorize('admin'), adminListOrders);
router.patch('/admin/:id/status', authorize('admin'), adminUpdateStatus);

export default router;
