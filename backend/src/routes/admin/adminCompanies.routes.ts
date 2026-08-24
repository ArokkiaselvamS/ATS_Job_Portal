import { Router } from 'express';
import { requireAuth, requireSuperAdmin } from '../../middleware/adminAuth';
import { getCompanies, getCompanyById, verifyCompany, rejectCompany, suspendCompany, activateCompany } from '../../controllers/admin/adminCompanies.controller';

const router = Router();
router.use(requireAuth, requireSuperAdmin);

router.get('/', getCompanies);
router.get('/:id', getCompanyById);
router.patch('/:id/verify', verifyCompany);
router.patch('/:id/reject', rejectCompany);
router.patch('/:id/suspend', suspendCompany);
router.patch('/:id/activate', activateCompany);

export default router;
