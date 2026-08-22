import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { z } from 'zod';

export const getJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const jobs = await prisma.job.findMany({
      include: { company: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: jobs });
  } catch (error) {
    next(error);
  }
};

export const getJobById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: parseInt(String(req.params.id)) },
      include: { company: true }
    });
    
    if (!job) {
      res.status(404).json({ success: false, message: 'Job not found' });
      return;
    }
    
    res.json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};
