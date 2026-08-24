import { Router } from 'express';
import adminAuthRoutes from './adminAuth.routes';
import adminDashboardRoutes from './adminDashboard.routes';
import adminJobSeekersRoutes from './adminJobSeekers.routes';
import adminCompanyAdminsRoutes from './adminCompanyAdmins.routes';
import adminCompaniesRoutes from './adminCompanies.routes';
import adminJobsRoutes from './adminJobs.routes';
import adminApplicationsRoutes from './adminApplications.routes';
import adminJobFeedsRoutes from './adminJobFeeds.routes';
import adminCategoriesRoutes from './adminCategories.routes';
import adminSkillsRoutes from './adminSkills.routes';
import adminReportsRoutes from './adminReports.routes';
import adminAnalyticsRoutes from './adminAnalytics.routes';
import adminSecurityRoutes from './adminSecurity.routes';
import adminAuditLogsRoutes from './adminAuditLogs.routes';
import adminNotificationsRoutes from './adminNotifications.routes';
import adminSettingsRoutes from './adminSettings.routes';

const router = Router();

router.use('/auth', adminAuthRoutes);
router.use('/dashboard', adminDashboardRoutes);
router.use('/job-seekers', adminJobSeekersRoutes);
router.use('/company-admins', adminCompanyAdminsRoutes);
router.use('/companies', adminCompaniesRoutes);
router.use('/jobs', adminJobsRoutes);
router.use('/applications', adminApplicationsRoutes);
router.use('/job-feeds', adminJobFeedsRoutes);
router.use('/categories', adminCategoriesRoutes);
router.use('/skills', adminSkillsRoutes);
router.use('/reports', adminReportsRoutes);
router.use('/analytics', adminAnalyticsRoutes);
router.use('/security', adminSecurityRoutes);
router.use('/audit-logs', adminAuditLogsRoutes);
router.use('/notifications', adminNotificationsRoutes);
router.use('/settings', adminSettingsRoutes);

export default router;
