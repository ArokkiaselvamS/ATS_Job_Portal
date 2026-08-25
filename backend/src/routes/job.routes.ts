import { Router } from 'express';
import {
  getJobs,
  getJobById,
  saveJob,
  unsaveJob,
  getSavedJobs,
  applyToJob,
  getApplications,
  getApplicationById,
} from '../controllers/job.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/jobs', getJobs);
router.get('/jobs/saved', requireAuth, getSavedJobs);
router.get('/jobs/applications', requireAuth, getApplications);
router.get('/jobs/applications/:id', requireAuth, getApplicationById);
router.get('/jobs/:id', getJobById);
router.post('/jobs/:id/save', requireAuth, saveJob);
router.delete('/jobs/:id/save', requireAuth, unsaveJob);
router.post('/jobs/:id/apply', requireAuth, applyToJob);

export default router;
