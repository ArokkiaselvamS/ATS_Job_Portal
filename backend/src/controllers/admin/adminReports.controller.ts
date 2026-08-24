import { Request, Response, NextFunction } from 'express';
import prisma from '../../utils/prisma';
import { createAuditLog } from '../../services/audit.service';

export const getReports = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = '1', limit = '20', status, targetType } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;
    if (targetType) where.targetType = targetType;

    const [reports, total] = await Promise.all([
      prisma.platformReport.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip, take: limitNum,
      }),
      prisma.platformReport.count({ where }),
    ]);

    res.json({ success: true, data: { reports, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
  } catch (error) { next(error); }
};

export const updateReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, resolution } = req.body;
    const report = await prisma.platformReport.update({
      where: { id: parseInt(String(req.params.id)) },
      data: { status, resolution, reviewedById: req.user!.userId, reviewedAt: new Date() },
    });
    await createAuditLog({ adminId: req.user!.userId, action: 'REPORT_UPDATED', entityType: 'Report', entityId: report.id, newValue: { status, resolution } });
    res.json({ success: true, data: report });
  } catch (error) { next(error); }
};
