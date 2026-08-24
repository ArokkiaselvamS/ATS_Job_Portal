import { Router } from 'express';
import { requireAuth, requireSuperAdmin } from '../../middleware/adminAuth';
import { listAuditLogs } from '../../controllers/admin/adminAuditLogs.controller';

const router = Router();
router.use(requireAuth, requireSuperAdmin);

router.get('/', listAuditLogs);

export default router;
