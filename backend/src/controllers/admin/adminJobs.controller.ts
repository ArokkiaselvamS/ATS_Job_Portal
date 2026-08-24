import { Request, Response, NextFunction } from 'express';
import prisma from '../../utils/prisma';
import { createAuditLog } from '../../services/audit.service';
import { createNotification } from '../../services/notification.service';

export const getJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = '1', limit = '20', search, status, source } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;
    if (source) where.source = source;

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          company: { select: { id: true, name: true, logo: true } },
          _count: { select: { applications: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip, take: limitNum,
      }),
      prisma.job.count({ where }),
    ]);

    res.json({ success: true, data: { jobs, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
  } catch (error) { next(error); }
};

export const getJobById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: parseInt(String(req.params.id)) },
      include: {
        company: true,
        _count: { select: { applications: true, savedJobs: true } },
        applications: { take: 10, orderBy: { appliedAt: 'desc' }, include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } } },
      },
    });
    if (!job) { res.status(404).json({ success: false, message: 'Job not found' }); return; }
    res.json({ success: true, data: job });
  } catch (error) { next(error); }
};

export const approveJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const job = await prisma.job.update({
      where: { id: parseInt(String(req.params.id)) },
      data: { status: 'ACTIVE', approvedAt: new Date(), approvedById: req.user!.userId, rejectionReason: null },
    });
    await createAuditLog({ adminId: req.user!.userId, action: 'JOB_APPROVED', entityType: 'Job', entityId: job.id, newValue: { status: 'ACTIVE' } });
    res.json({ success: true, message: 'Job approved' });
  } catch (error) { next(error); }
};

export const rejectJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { reason } = req.body;
    const job = await prisma.job.update({
      where: { id: parseInt(String(req.params.id)) },
      data: { status: 'REJECTED', rejectionReason: reason },
    });
    await createAuditLog({ adminId: req.user!.userId, action: 'JOB_REJECTED', entityType: 'Job', entityId: job.id, newValue: { reason } });
    res.json({ success: true, message: 'Job rejected' });
  } catch (error) { next(error); }
};

export const suspendJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { reason } = req.body;
    const job = await prisma.job.update({
      where: { id: parseInt(String(req.params.id)) },
      data: { status: 'SUSPENDED', rejectionReason: reason },
    });
    await createAuditLog({ adminId: req.user!.userId, action: 'JOB_SUSPENDED', entityType: 'Job', entityId: job.id, newValue: { reason } });

    const companyAdmins = await prisma.companyAdmin.findMany({ where: { companyId: job.companyId }, select: { userId: true } });
    for (const admin of companyAdmins) {
      await createNotification({
        userId: admin.userId, type: 'JOB_SUSPENDED',
        title: 'Job Suspended', message: `Your job "${job.title}" has been suspended. Reason: ${reason}`,
        entityType: 'Job', entityId: job.id,
      });
    }

    res.json({ success: true, message: 'Job suspended' });
  } catch (error) { next(error); }
};

export const pauseJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const job = await prisma.job.update({ where: { id: parseInt(String(req.params.id)) }, data: { status: 'PAUSED' } });
    await createAuditLog({ adminId: req.user!.userId, action: 'JOB_PAUSED', entityType: 'Job', entityId: job.id });
    res.json({ success: true, message: 'Job paused' });
  } catch (error) { next(error); }
};

export const resumeJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const job = await prisma.job.update({ where: { id: parseInt(String(req.params.id)) }, data: { status: 'ACTIVE' } });
    await createAuditLog({ adminId: req.user!.userId, action: 'JOB_RESUMED', entityType: 'Job', entityId: job.id });
    res.json({ success: true, message: 'Job resumed' });
  } catch (error) { next(error); }
};

export const closeJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const job = await prisma.job.update({ where: { id: parseInt(String(req.params.id)) }, data: { status: 'CLOSED' } });
    await createAuditLog({ adminId: req.user!.userId, action: 'JOB_CLOSED', entityType: 'Job', entityId: job.id });
    res.json({ success: true, message: 'Job closed' });
  } catch (error) { next(error); }
};
