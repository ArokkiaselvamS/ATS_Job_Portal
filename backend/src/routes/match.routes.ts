import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { getMatchesForUser, getMatchForJob } from '../services/jobMatching.service';

const router = Router();

router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const matches = await getMatchesForUser(req.user!.userId);
    res.json({ success: true, data: { matches, count: matches.length } });
  } catch (error) {
    next(error);
  }
});

router.get('/:jobId', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const match = await getMatchForJob(req.user!.userId, parseInt(req.params.jobId as string));
    res.json({ success: true, data: match });
  } catch (error) {
    next(error);
  }
});

export default router;
