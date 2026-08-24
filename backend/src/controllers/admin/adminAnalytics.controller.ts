import { Request, Response, NextFunction } from 'express';
import prisma from '../../utils/prisma';

export const getAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [
      totalUsers, newUsers, totalJobs, newJobs, totalApplications, newApplications,
      totalCompanies, newCompanies, hiredCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: startDate } } }),
      prisma.job.count(),
      prisma.job.count({ where: { createdAt: { gte: startDate } } }),
      prisma.application.count(),
      prisma.application.count({ where: { appliedAt: { gte: startDate } } }),
      prisma.company.count(),
      prisma.company.count({ where: { createdAt: { gte: startDate } } }),
      prisma.application.count({ where: { status: { in: ['ACCEPTED', 'OFFER'] } } }),
    ]);

    const jobsByType = await prisma.job.groupBy({ by: ['jobType'], _count: true });
    const jobsByWorkMode = await prisma.job.groupBy({ by: ['workMode'], _count: true });
    const jobsBySource = await prisma.job.groupBy({ by: ['source'], _count: true });
    const applicationsByStatus = await prisma.application.groupBy({ by: ['status'], _count: true });

    const topCompanies = await prisma.company.findMany({
      take: 10,
      include: { _count: { select: { jobs: true } } },
      orderBy: { jobs: { _count: 'desc' } },
    });

    const topJobs = await prisma.job.findMany({
      take: 10,
      include: { company: { select: { name: true } }, _count: { select: { applications: true } } },
      orderBy: { applications: { _count: 'desc' } },
    });

    const mostViewedJobs = await prisma.job.findMany({
      take: 10,
      where: { views: { gt: 0 } },
      include: { company: { select: { name: true } } },
      orderBy: { views: 'desc' },
    });

    const dailyApplications = await prisma.$queryRaw`
      SELECT TO_CHAR("appliedAt", 'YYYY-MM-DD') as date, COUNT(*)::int as count
      FROM "Application"
      WHERE "appliedAt" >= ${startDate}
      GROUP BY TO_CHAR("appliedAt", 'YYYY-MM-DD')
      ORDER BY date ASC
    `;

    const dailyUsers = await prisma.$queryRaw`
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
  } catch (error) { next(error); }
};
