import { Request, Response, NextFunction } from 'express';
import prisma from '../../utils/prisma';
import { createAuditLog } from '../../services/audit.service';
import { createNotification } from '../../services/notification.service';

export const getCompanies = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = '1', limit = '20', search, verification, status } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { industry: { contains: search as string, mode: 'insensitive' } },
        { location: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    if (verification) where.verificationStatus = verification;
    if (status === 'suspended') where.isSuspended = true;
    else if (status === 'active') where.isSuspended = false;

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        include: {
          _count: { select: { jobs: true, admins: true } },
          admins: { select: { user: { select: { id: true, firstName: true, lastName: true, email: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip, take: limitNum,
      }),
      prisma.company.count({ where }),
    ]);

    res.json({ success: true, data: { companies, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
  } catch (error) { next(error); }
};

export const getCompanyById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: parseInt(String(req.params.id)) },
      include: {
        admins: { select: { user: { select: { id: true, firstName: true, lastName: true, email: true, lastLoginAt: true } } } },
        _count: { select: { jobs: true } },
        jobs: { select: { id: true, title: true, status: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    if (!company) { res.status(404).json({ success: false, message: 'Company not found' }); return; }
    res.json({ success: true, data: company });
  } catch (error) { next(error); }
};

export const verifyCompany = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const company = await prisma.company.update({
      where: { id: parseInt(String(req.params.id)) },
      data: { verificationStatus: 'VERIFIED', verifiedAt: new Date(), verifiedById: req.user!.userId, rejectionReason: null },
    });
    await createAuditLog({ adminId: req.user!.userId, action: 'COMPANY_VERIFIED', entityType: 'Company', entityId: company.id, newValue: { status: 'VERIFIED' } });

    const admins = await prisma.companyAdmin.findMany({ where: { companyId: company.id }, select: { userId: true } });
    for (const admin of admins) {
      await createNotification({
        userId: admin.userId, type: 'COMPANY_APPROVED',
        title: 'Company Verified', message: `Your company "${company.name}" has been verified.`,
        entityType: 'Company', entityId: company.id,
      });
    }

    res.json({ success: true, message: 'Company verified', data: company });
  } catch (error) { next(error); }
};

export const rejectCompany = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { reason } = req.body;
    const company = await prisma.company.update({
      where: { id: parseInt(String(req.params.id)) },
      data: { verificationStatus: 'REJECTED', rejectionReason: reason },
    });
    await createAuditLog({ adminId: req.user!.userId, action: 'COMPANY_REJECTED', entityType: 'Company', entityId: company.id, newValue: { reason } });

    const admins = await prisma.companyAdmin.findMany({ where: { companyId: company.id }, select: { userId: true } });
    for (const admin of admins) {
      await createNotification({
        userId: admin.userId, type: 'COMPANY_REJECTED',
        title: 'Company Rejected', message: `Your company "${company.name}" verification was rejected. Reason: ${reason}`,
        entityType: 'Company', entityId: company.id,
      });
    }

    res.json({ success: true, message: 'Company rejected', data: company });
  } catch (error) { next(error); }
};

export const suspendCompany = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { reason } = req.body;
    const company = await prisma.company.update({
      where: { id: parseInt(String(req.params.id)) },
      data: { isSuspended: true, suspendedAt: new Date(), suspensionReason: reason },
    });
    await prisma.job.updateMany({ where: { companyId: company.id }, data: { status: 'SUSPENDED' } });
    await createAuditLog({ adminId: req.user!.userId, action: 'COMPANY_SUSPENDED', entityType: 'Company', entityId: company.id, newValue: { reason } });
    res.json({ success: true, message: 'Company suspended' });
  } catch (error) { next(error); }
};

export const activateCompany = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const company = await prisma.company.update({
      where: { id: parseInt(String(req.params.id)) },
      data: { isSuspended: false, suspendedAt: null, suspensionReason: null },
    });
    await prisma.job.updateMany({ where: { companyId: company.id, status: 'SUSPENDED' }, data: { status: 'ACTIVE' } });
    await createAuditLog({ adminId: req.user!.userId, action: 'COMPANY_ACTIVATED', entityType: 'Company', entityId: company.id });
    res.json({ success: true, message: 'Company activated' });
  } catch (error) { next(error); }
};
