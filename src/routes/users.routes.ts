import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { listUsers, getUser, updateUser, deleteUser } from '../controllers/users.controller';

const router = Router();

router.use(authenticate, authorize('admin'));
router.get('/', listUsers);
router.get('/:id', getUser);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
