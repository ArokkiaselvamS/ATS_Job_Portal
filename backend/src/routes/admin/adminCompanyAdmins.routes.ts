import { Router } from 'express';
import { requireAuth, requireSuperAdmin } from '../../middleware/adminAuth';
import { getCompanyAdmins, getCompanyAdminById, suspendCompanyAdmin, activateCompanyAdmin, blockCompanyAdmin } from '../../controllers/admin/adminCompanyAdmins.controller';

const router = Router();
router.use(requireAuth, requireSuperAdmin);

router.get('/', getCompanyAdmins);
router.get('/:id', getCompanyAdminById);
router.patch('/:id/suspend', suspendCompanyAdmin);
router.patch('/:id/activate', activateCompanyAdmin);
router.patch('/:id/block', blockCompanyAdmin);

export default router;
