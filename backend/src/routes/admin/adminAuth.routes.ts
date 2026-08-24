import { Router } from 'express';
import { requireAuth } from '../../middleware/adminAuth';
import { requireSuperAdmin } from '../../middleware/adminAuth';
import { adminLogin, adminLogout, adminGetMe } from '../../controllers/admin/adminAuth.controller';

const router = Router();

router.post('/login', adminLogin);
router.post('/logout', adminLogout);
router.get('/me', requireAuth, requireSuperAdmin, adminGetMe);

export default router;
