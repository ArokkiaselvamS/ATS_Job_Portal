import { Router } from 'express';
import { requireAuth, requireSuperAdmin } from '../../middleware/adminAuth';
import { getApplications } from '../../controllers/admin/adminApplications.controller';

const router = Router();
router.use(requireAuth, requireSuperAdmin);

router.get('/', getApplications);

export default router;
