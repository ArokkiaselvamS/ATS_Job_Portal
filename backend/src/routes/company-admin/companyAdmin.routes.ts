import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import {
  getDashboardStats,
  getCompanyProfile,
  updateCompanyProfile,
  getJobs,
  createJob,
  updateJob,
  deleteJob,
  getApplications,
  updateApplicationStatus,
  getCandidates,
  getInterviews,
  getTeamMembers,
  inviteTeamMember,
  updateTeamMember,
  removeTeamMember,
  getAnalytics,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../../controllers/company-admin/companyAdmin.controller';

const router = Router();
router.use(requireAuth);

router.get('/dashboard/stats', getDashboardStats);
router.get('/company', getCompanyProfile);
router.put('/company', updateCompanyProfile);
router.get('/jobs', getJobs);
router.post('/jobs', createJob);
router.put('/jobs/:id', updateJob);
router.delete('/jobs/:id', deleteJob);
router.get('/applications', getApplications);
router.patch('/applications/:id/status', updateApplicationStatus);
router.get('/candidates', getCandidates);
router.get('/interviews', getInterviews);
router.get('/team', getTeamMembers);
router.post('/team', inviteTeamMember);
router.put('/team/:id', updateTeamMember);
router.delete('/team/:id', removeTeamMember);
router.get('/analytics', getAnalytics);
router.get('/notifications', getNotifications);
router.patch('/notifications/:id/read', markNotificationRead);
router.patch('/notifications/read-all', markAllNotificationsRead);

export default router;