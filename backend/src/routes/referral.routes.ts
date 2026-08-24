import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { sendInvitations, getInvitations, getReferralStats, recordReferralShare } from '../controllers/referral.controller';

const router = Router();

router.use(requireAuth);

router.post('/invitations/send', sendInvitations);
router.get('/invitations', getInvitations);
router.get('/referrals/stats', getReferralStats);
router.post('/referrals/share', recordReferralShare);

export default router;
