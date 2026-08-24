import { Request, Response, NextFunction } from 'express';
import prisma from '../../utils/prisma';
import { createAuditLog } from '../../services/audit.service';

export const getJobSeekers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = '1', limit = '20', search, status } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { role: 'JOB_SEEKER' };
    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    if (status === 'suspended') where.isSuspended = true;
    else if (status === 'blocked') where.isBlocked = true;
    else if (status === 'active') { where.isActive = true; where.isSuspended = false; where.isBlocked = false; }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, firstName: true, lastName: true, email: true, phone: true,
          isActive: true, isSuspended: true, isBlocked: true,
          createdAt: true, lastLoginAt: true, profileImage: true,
          profile: { select: { location: true, headline: true } },
          _count: { select: { applications: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip, take: limitNum,
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ success: true, data: { users, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
  } catch (error) { next(error); }
};

export const getJobSeekerById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(String(req.params.id)) },
      select: {
        id: true, firstName: true, lastName: true, email: true, phone: true, role: true,
        isActive: true, isSuspended: true, isBlocked: true, suspensionReason: true,
        createdAt: true, lastLoginAt: true, profileImage: true,
        profile: true,
        _count: { select: { applications: true, savedJobs: true } },
      },
    });
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
};

export const suspendJobSeeker = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { reason } = req.body;
    const user = await prisma.user.update({
      where: { id: parseInt(String(req.params.id)) },
      data: { isSuspended: true, suspendedAt: new Date(), suspensionReason: reason, isActive: false },
    });
    await createAuditLog({ adminId: req.user!.userId, action: 'USER_SUSPENDED', entityType: 'User', entityId: user.id, newValue: { reason } });
    res.json({ success: true, message: 'User suspended' });
  } catch (error) { next(error); }
};

export const activateJobSeeker = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await prisma.user.update({
      where: { id: parseInt(String(req.params.id)) },
      data: { isActive: true, isSuspended: false, suspendedAt: null, suspensionReason: null },
    });
    await createAuditLog({ adminId: req.user!.userId, action: 'USER_ACTIVATED', entityType: 'User', entityId: user.id });
    res.json({ success: true, message: 'User activated' });
  } catch (error) { next(error); }
};

export const blockJobSeeker = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { reason } = req.body;
    const user = await prisma.user.update({
      where: { id: parseInt(String(req.params.id)) },
      data: { isBlocked: true, blockedAt: new Date(), isActive: false },
    });
    await createAuditLog({ adminId: req.user!.userId, action: 'USER_BLOCKED', entityType: 'User', entityId: user.id, newValue: { reason } });
    res.json({ success: true, message: 'User blocked' });
  } catch (error) { next(error); }
};
