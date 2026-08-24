import { Router } from 'express';
import { requireAuth, requireSuperAdmin } from '../../middleware/adminAuth';
import { getDashboard } from '../../controllers/admin/adminDashboard.controller';

const router = Router();
router.use(requireAuth, requireSuperAdmin);

router.get('/', getDashboard);

export default router;
