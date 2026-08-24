import { Request, Response, NextFunction } from 'express';
import { getAuditLogs } from '../../services/audit.service';

export const listAuditLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, adminId, action, entityType, startDate, endDate } = req.query;
    const result = await getAuditLogs({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      adminId: adminId ? parseInt(adminId as string) : undefined,
      action: action as string,
      entityType: entityType as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};
