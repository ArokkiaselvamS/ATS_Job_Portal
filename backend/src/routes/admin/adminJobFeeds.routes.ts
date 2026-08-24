import { Router } from 'express';
import { requireAuth, requireSuperAdmin } from '../../middleware/adminAuth';
import {
  getFeedSources, getFeedSourceById, createFeedSource, updateFeedSource, deleteFeedSource,
  testFeedConnection, syncFeedNow, pauseFeedSource, getSyncHistory, getFailedJobs, retryFailedJob,
} from '../../controllers/admin/adminJobFeeds.controller';

const router = Router();
router.use(requireAuth, requireSuperAdmin);

router.get('/', getFeedSources);
router.get('/sync-history', getSyncHistory);
router.get('/failed-jobs', getFailedJobs);
router.post('/failed-jobs/:id/retry', retryFailedJob);
router.get('/:id', getFeedSourceById);
router.post('/', createFeedSource);
router.patch('/:id', updateFeedSource);
router.delete('/:id', deleteFeedSource);
router.post('/:id/test', testFeedConnection);
router.post('/:id/sync', syncFeedNow);
router.patch('/:id/pause', pauseFeedSource);

export default router;
