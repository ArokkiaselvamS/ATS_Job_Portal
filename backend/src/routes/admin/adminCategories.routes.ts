import { Router } from 'express';
import { requireAuth, requireSuperAdmin } from '../../middleware/adminAuth';
import { getCategories, createCategory, updateCategory } from '../../controllers/admin/adminCategories.controller';

const router = Router();
router.use(requireAuth, requireSuperAdmin);

router.get('/', getCategories);
router.post('/', createCategory);
router.patch('/:id', updateCategory);

export default router;
