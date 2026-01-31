import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { getMyCart, addToCart, updateQuantity, removeFromCart, clearCart } from '../controllers/cart.controller';

const router = Router();

router.use(authenticate, authorize('customer'));
router.get('/', getMyCart);
router.post('/add', addToCart);
router.patch('/quantity', updateQuantity);
router.delete('/remove', removeFromCart);
router.delete('/clear', clearCart);

export default router;
