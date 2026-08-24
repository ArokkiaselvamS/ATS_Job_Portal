import { Router } from 'express';
import { requireAuth, requireSuperAdmin } from '../../middleware/adminAuth';
import { getSettings, updateSettings } from '../../controllers/admin/adminSettings.controller';

const router = Router();
router.use(requireAuth, requireSuperAdmin);

router.get('/', getSettings);
router.patch('/', updateSettings);

export default router;
