import { Router } from 'express';
import { requireAuth, requireSuperAdmin } from '../../middleware/adminAuth';
import { getSecurity } from '../../controllers/admin/adminSecurity.controller';

const router = Router();
router.use(requireAuth, requireSuperAdmin);

router.get('/', getSecurity);

export default router;
