import { Router } from 'express';
import { requireAuth, requireSuperAdmin } from '../../middleware/adminAuth';
import { getJobs, getJobById, approveJob, rejectJob, suspendJob, pauseJob, resumeJob, closeJob } from '../../controllers/admin/adminJobs.controller';

const router = Router();
router.use(requireAuth, requireSuperAdmin);

router.get('/', getJobs);
router.get('/:id', getJobById);
router.patch('/:id/approve', approveJob);
router.patch('/:id/reject', rejectJob);
router.patch('/:id/suspend', suspendJob);
router.patch('/:id/pause', pauseJob);
router.patch('/:id/resume', resumeJob);
router.patch('/:id/close', closeJob);

export default router;
