import { Router } from 'express';
import { requireAuth, requireSuperAdmin } from '../../middleware/adminAuth';
import { getAnalytics } from '../../controllers/admin/adminAnalytics.controller';

const router = Router();
router.use(requireAuth, requireSuperAdmin);

router.get('/', getAnalytics);

export default router;
