import { Router } from 'express';
import { requireAuth, requireSuperAdmin } from '../../middleware/adminAuth';
import { getJobSeekers, getJobSeekerById, suspendJobSeeker, activateJobSeeker, blockJobSeeker } from '../../controllers/admin/adminJobSeekers.controller';

const router = Router();
router.use(requireAuth, requireSuperAdmin);

router.get('/', getJobSeekers);
router.get('/:id', getJobSeekerById);
router.patch('/:id/suspend', suspendJobSeeker);
router.patch('/:id/activate', activateJobSeeker);
router.patch('/:id/block', blockJobSeeker);

export default router;
