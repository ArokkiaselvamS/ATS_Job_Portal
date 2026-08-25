"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalytics = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const getAnalytics = async (req, res, next) => {
    try {
        const { period = '30' } = req.query;
        const days = parseInt(period);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const [totalUsers, newUsers, totalJobs, newJobs, totalApplications, newApplications, totalCompanies, newCompanies, hiredCount,] = await Promise.all([
            prisma_1.default.user.count(),
            prisma_1.default.user.count({ where: { createdAt: { gte: startDate } } }),
            prisma_1.default.job.count(),
            prisma_1.default.job.count({ where: { createdAt: { gte: startDate } } }),
            prisma_1.default.application.count(),
            prisma_1.default.application.count({ where: { appliedAt: { gte: startDate } } }),
            prisma_1.default.company.count(),
            prisma_1.default.company.count({ where: { createdAt: { gte: startDate } } }),
            prisma_1.default.application.count({ where: { status: { in: ['ACCEPTED', 'OFFER'] } } }),
        ]);
        const jobsByType = await prisma_1.default.job.groupBy({ by: ['jobType'], _count: true });
        const jobsByWorkMode = await prisma_1.default.job.groupBy({ by: ['workMode'], _count: true });
        const jobsBySource = await prisma_1.default.job.groupBy({ by: ['source'], _count: true });
        const applicationsByStatus = await prisma_1.default.application.groupBy({ by: ['status'], _count: true });
        const topCompanies = await prisma_1.default.company.findMany({
            take: 10,
            include: { _count: { select: { jobs: true } } },
            orderBy: { jobs: { _count: 'desc' } },
        });
        const topJobs = await prisma_1.default.job.findMany({
            take: 10,
            include: { company: { select: { name: true } }, _count: { select: { applications: true } } },
            orderBy: { applications: { _count: 'desc' } },
        });
        const mostViewedJobs = await prisma_1.default.job.findMany({
            take: 10,
            where: { views: { gt: 0 } },
            include: { company: { select: { name: true } } },
            orderBy: { views: 'desc' },
        });
        const dailyApplications = await prisma_1.default.$queryRaw `
      SELECT TO_CHAR("appliedAt", 'YYYY-MM-DD') as date, COUNT(*)::int as count
      FROM "Application"
      WHERE "appliedAt" >= ${startDate}
      GROUP BY TO_CHAR("appliedAt", 'YYYY-MM-DD')
      ORDER BY date ASC
    `;
        const dailyUsers = await prisma_1.default.$queryRaw `
      SELECT TO_CHAR("createdAt", 'YYYY-MM-DD') as date, COUNT(*)::int as count
      FROM "User"
      WHERE "createdAt" >= ${startDate}
      GROUP BY TO_CHAR("createdAt", 'YYYY-MM-DD')
      ORDER BY date ASC
    `;
        res.json({
            success: true,
            data: {
                summary: { totalUsers, newUsers, totalJobs, newJobs, totalApplications, newApplications, totalCompanies, newCompanies, hiredCount },
                jobsByType, jobsByWorkMode, jobsBySource, applicationsByStatus,
                topCompanies, topJobs, mostViewedJobs,
                dailyApplications, dailyUsers,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAnalytics = getAnalytics;
