import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { uploadImage } from '../middleware/upload';
import { createProduct, getProducts, getProduct, updateProduct, deleteProduct, getProductStats, getTopProducts, getLowStockProducts, getPriceDistribution } from '../controllers/products.controller';

const router = Router();

router.get('/', getProducts);
router.get('/stats', getProductStats);
router.get('/top', getTopProducts);
router.get('/low-stock', getLowStockProducts);
router.get('/price-distribution', getPriceDistribution);
router.get('/:id', getProduct);
// images are optional; upload middleware allows zero files
router.post('/', authenticate, authorize('admin', 'vendor'), uploadImage.array('images', 5), createProduct);
router.patch('/:id', authenticate, authorize('admin', 'vendor'), uploadImage.array('images', 5), updateProduct);
router.delete('/:id', authenticate, authorize('admin', 'vendor'), deleteProduct);

export default router;
