import { Request, Response, NextFunction } from 'express';
import prisma from '../../utils/prisma';

export const getSecurity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const failedLogins = await prisma.user.findMany({
      where: { lastLoginAt: { not: null } },
      select: { id: true, firstName: true, lastName: true, email: true, lastLoginAt: true, role: true },
      orderBy: { lastLoginAt: 'desc' },
      take: 50,
    });

    const suspendedUsers = await prisma.user.findMany({
      where: { isSuspended: true },
      select: { id: true, firstName: true, lastName: true, email: true, suspendedAt: true, suspensionReason: true, role: true },
      orderBy: { suspendedAt: 'desc' },
    });

    const blockedUsers = await prisma.user.findMany({
      where: { isBlocked: true },
      select: { id: true, firstName: true, lastName: true, email: true, blockedAt: true, role: true },
      orderBy: { blockedAt: 'desc' },
    });

    const recentAuditLogs = await prisma.auditLog.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: { admin: { select: { firstName: true, lastName: true } } },
    });

    const suspiciousCompanies = await prisma.company.findMany({
      where: { verificationStatus: 'PENDING', createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      select: { id: true, name: true, createdAt: true, verificationStatus: true },
    });

    res.json({
      success: true,
      data: {
        failedLogins: failedLogins.length,
        recentLogins: failedLogins,
        suspendedUsers,
        blockedUsers,
        recentAuditLogs,
        suspiciousCompanies,
      },
    });
  } catch (error) { next(error); }
};
