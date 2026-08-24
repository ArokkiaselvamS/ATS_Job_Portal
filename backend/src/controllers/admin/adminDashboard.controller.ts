import { Request, Response, NextFunction } from 'express';
import prisma from '../../utils/prisma';

export const getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [
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
      totalAdmins,
      externalFeedJobs,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'JOB_SEEKER' } }),
      prisma.company.count(),
      prisma.company.count({ where: { verificationStatus: 'VERIFIED' } }),
      prisma.company.count({ where: { verificationStatus: 'PENDING' } }),
      prisma.company.count({ where: { isSuspended: true } }),
      prisma.job.count({ where: { status: { in: ['ACTIVE', 'PUBLISHED'] } } }),
      prisma.job.count({ where: { status: 'PENDING_REVIEW' } }),
      prisma.application.count(),
      prisma.application.count({ where: { status: 'INTERVIEW' } }),
      prisma.application.count({ where: { status: { in: ['ACCEPTED', 'OFFER'] } } }),
      prisma.job.count({ where: { isReported: true } }),
      prisma.user.count({ where: { role: { in: ['SUPER_ADMIN', 'ADMIN'] } } }),
      prisma.job.count({ where: { source: { not: 'INTERNAL' } } }),
    ]);

    const openReports = await prisma.platformReport.count({ where: { status: 'OPEN' } });

    const recentActivity = await prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { admin: { select: { firstName: true, lastName: true } } },
    });

    const userGrowth = await prisma.user.groupBy({
      by: ['role'],
      _count: true,
    });

    const jobByStatus = await prisma.job.groupBy({
      by: ['status'],
      _count: true,
    });

    const applicationsByStatus = await prisma.application.groupBy({
      by: ['status'],
      _count: true,
    });

    const monthlyApplications = await prisma.$queryRaw`
      SELECT
        TO_CHAR("appliedAt", 'YYYY-MM') as month,
        COUNT(*)::int as count
      FROM "Application"
      WHERE "appliedAt" >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR("appliedAt", 'YYYY-MM')
      ORDER BY month ASC
    `;

    const monthlyUsers = await prisma.$queryRaw`
      SELECT
        TO_CHAR("createdAt", 'YYYY-MM') as month,
        COUNT(*)::int as count
      FROM "User"
      WHERE "createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
      ORDER BY month ASC
    `;

    const topCompanies = await prisma.company.findMany({
      take: 5,
      include: { _count: { select: { jobs: true } } },
      orderBy: { jobs: { _count: 'desc' } },
    });

    const feedSources = await prisma.jobFeedSource.findMany({
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
  } catch (error) {
    next(error);
  }
};
