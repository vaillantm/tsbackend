import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getMyCart, addToCart, updateQuantity, removeFromCart, clearCart } from '../controllers/cart.controller';

const router = Router();

router.use(authenticate);
router.get('/', getMyCart);
router.post('/add', addToCart);
router.patch('/quantity', updateQuantity);
router.delete('/remove', removeFromCart);
router.delete('/clear', clearCart);

export default router;
