import { Router } from 'express';
import { requireAuth, requireSuperAdmin } from '../../middleware/adminAuth';
import { listNotifications, markNotificationRead, markAllNotificationsRead, sendNotification } from '../../controllers/admin/adminNotifications.controller';

const router = Router();
router.use(requireAuth, requireSuperAdmin);

router.get('/', listNotifications);
router.patch('/:id/read', markNotificationRead);
router.patch('/read-all', markAllNotificationsRead);
router.post('/send', sendNotification);

export default router;
