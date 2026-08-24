import { Router } from 'express';
import { requireAuth, requireSuperAdmin } from '../../middleware/adminAuth';
import { getReports, updateReport } from '../../controllers/admin/adminReports.controller';

const router = Router();
router.use(requireAuth, requireSuperAdmin);

router.get('/', getReports);
router.patch('/:id', updateReport);

export default router;
