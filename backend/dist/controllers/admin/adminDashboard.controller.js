"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboard = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const getDashboard = async (req, res, next) => {
    try {
        const [totalJobSeekers, totalCompanies, verifiedCompanies, pendingCompanies, suspendedCompanies, activeJobs, pendingJobs, totalApplications, interviewApplications, hiredApplications, reportedJobs, totalAdmins, externalFeedJobs,] = await Promise.all([
            prisma_1.default.user.count({ where: { role: 'JOB_SEEKER' } }),
            prisma_1.default.company.count(),
            prisma_1.default.company.count({ where: { verificationStatus: 'VERIFIED' } }),
            prisma_1.default.company.count({ where: { verificationStatus: 'PENDING' } }),
            prisma_1.default.company.count({ where: { isSuspended: true } }),
            prisma_1.default.job.count({ where: { status: { in: ['ACTIVE', 'PUBLISHED'] } } }),
            prisma_1.default.job.count({ where: { status: 'PENDING_REVIEW' } }),
            prisma_1.default.application.count(),
            prisma_1.default.application.count({ where: { status: 'INTERVIEW' } }),
            prisma_1.default.application.count({ where: { status: { in: ['ACCEPTED', 'OFFER'] } } }),
            prisma_1.default.job.count({ where: { isReported: true } }),
            prisma_1.default.user.count({ where: { role: { in: ['SUPER_ADMIN', 'ADMIN'] } } }),
            prisma_1.default.job.count({ where: { source: { not: 'INTERNAL' } } }),
        ]);
        const openReports = await prisma_1.default.platformReport.count({ where: { status: 'OPEN' } });
        const recentActivity = await prisma_1.default.auditLog.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: { admin: { select: { firstName: true, lastName: true } } },
        });
        const userGrowth = await prisma_1.default.user.groupBy({
            by: ['role'],
            _count: true,
        });
        const jobByStatus = await prisma_1.default.job.groupBy({
            by: ['status'],
            _count: true,
        });
        const applicationsByStatus = await prisma_1.default.application.groupBy({
            by: ['status'],
            _count: true,
        });
        const monthlyApplications = await prisma_1.default.$queryRaw `
      SELECT
        TO_CHAR("appliedAt", 'YYYY-MM') as month,
        COUNT(*)::int as count
      FROM "Application"
      WHERE "appliedAt" >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR("appliedAt", 'YYYY-MM')
      ORDER BY month ASC
    `;
        const monthlyUsers = await prisma_1.default.$queryRaw `
      SELECT
        TO_CHAR("createdAt", 'YYYY-MM') as month,
        COUNT(*)::int as count
      FROM "User"
      WHERE "createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
      ORDER BY month ASC
    `;
        const topCompanies = await prisma_1.default.company.findMany({
            take: 5,
            include: { _count: { select: { jobs: true } } },
            orderBy: { jobs: { _count: 'desc' } },
        });
        const feedSources = await prisma_1.default.jobFeedSource.findMany({
            select: {
                id: true,
                name: true,
                sourceType: true,
                isActive: true,
                totalJobs: true,
                lastSyncAt: true,
                syncErrorCount: true,
            },
        });
        res.json({
            success: true,
            data: {
                stats: {
                    totalJobSeekers,
                    totalCompanies,
                    verifiedCompanies,
                    pendingCompanies,
                    suspendedCompanies,
                    activeJobs,
                    pendingJobs,
                    totalApplications,
                    interviewApplications,
                    hiredApplications,
                    reportedJobs,
                    openReports,
                    totalAdmins,
                    externalFeedJobs,
                },
                recentActivity,
                userGrowth,
                jobByStatus,
                applicationsByStatus,
                monthlyApplications,
                monthlyUsers,
                topCompanies,
                feedSources,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDashboard = getDashboard;
