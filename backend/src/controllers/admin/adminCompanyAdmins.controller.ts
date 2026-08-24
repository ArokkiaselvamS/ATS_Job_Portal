import { Request, Response, NextFunction } from 'express';
import prisma from '../../utils/prisma';
import { createAuditLog } from '../../services/audit.service';

export const getCompanyAdmins = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = '1', limit = '20', search, status } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { role: { in: ['COMPANY_ADMIN', 'EMPLOYER'] } };
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
          id: true, firstName: true, lastName: true, email: true, role: true,
          isActive: true, isSuspended: true, isBlocked: true,
          createdAt: true, lastLoginAt: true,
          companies: { select: { company: { select: { id: true, name: true, verificationStatus: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip, take: limitNum,
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ success: true, data: { users, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
  } catch (error) { next(error); }
};

export const getCompanyAdminById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(String(req.params.id)) },
      select: {
        id: true, firstName: true, lastName: true, email: true, phone: true, role: true,
        isActive: true, isSuspended: true, isBlocked: true, suspensionReason: true,
        createdAt: true, lastLoginAt: true,
        companies: { select: { company: true } },
      },
    });
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
};

export const suspendCompanyAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { reason } = req.body;
    const user = await prisma.user.update({
      where: { id: parseInt(String(req.params.id)) },
      data: { isSuspended: true, suspendedAt: new Date(), suspensionReason: reason, isActive: false },
    });
    await createAuditLog({ adminId: req.user!.userId, action: 'COMPANY_ADMIN_SUSPENDED', entityType: 'User', entityId: user.id, newValue: { reason } });
    res.json({ success: true, message: 'Company admin suspended' });
  } catch (error) { next(error); }
};

export const activateCompanyAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await prisma.user.update({
      where: { id: parseInt(String(req.params.id)) },
      data: { isActive: true, isSuspended: false, suspendedAt: null, suspensionReason: null },
    });
    await createAuditLog({ adminId: req.user!.userId, action: 'COMPANY_ADMIN_ACTIVATED', entityType: 'User', entityId: user.id });
    res.json({ success: true, message: 'Company admin activated' });
  } catch (error) { next(error); }
};

export const blockCompanyAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await prisma.user.update({
      where: { id: parseInt(String(req.params.id)) },
      data: { isBlocked: true, blockedAt: new Date(), isActive: false },
    });
    await createAuditLog({ adminId: req.user!.userId, action: 'COMPANY_ADMIN_BLOCKED', entityType: 'User', entityId: user.id });
    res.json({ success: true, message: 'Company admin blocked' });
  } catch (error) { next(error); }
};
