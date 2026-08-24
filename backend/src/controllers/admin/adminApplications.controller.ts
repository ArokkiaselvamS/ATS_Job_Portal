import { Request, Response, NextFunction } from 'express';
import prisma from '../../utils/prisma';

export const getApplications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = '1', limit = '20', search, status, jobId } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;
    if (jobId) where.jobId = parseInt(jobId as string);
    if (search) {
      where.OR = [
        { user: { firstName: { contains: search as string, mode: 'insensitive' } } },
        { user: { lastName: { contains: search as string, mode: 'insensitive' } } },
        { user: { email: { contains: search as string, mode: 'insensitive' } } },
        { job: { title: { contains: search as string, mode: 'insensitive' } } },
      ];
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          job: { select: { id: true, title: true, company: { select: { name: true } } } },
        },
        orderBy: { appliedAt: 'desc' },
        skip, take: limitNum,
      }),
      prisma.application.count({ where }),
    ]);

    res.json({ success: true, data: { applications, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
  } catch (error) { next(error); }
};
