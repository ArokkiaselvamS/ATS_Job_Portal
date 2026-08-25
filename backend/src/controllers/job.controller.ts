import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';

export const getJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      search,
      location,
      workMode,
      jobType,
      experienceLevel,
      salaryMin,
      salaryMax,
      skills,
      source,
      status,
      page = '1',
      limit = '12',
      sortBy = 'postedAt',
    } = req.query;

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(String(limit), 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      status: (status as any) || 'ACTIVE',
    };

    if (search) {
      const searchTerm = String(search);
      where.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { companyName: { contains: searchTerm, mode: 'insensitive' } },
        { location: { contains: searchTerm, mode: 'insensitive' } },
        { skills: { hasSome: [searchTerm] } },
      ];
    }

    if (location) {
      where.location = { contains: String(location), mode: 'insensitive' };
    }

    if (workMode) {
      where.workMode = workMode;
    }

    if (jobType) {
      where.jobType = jobType;
    }

    if (experienceLevel) {
      where.experienceLevel = experienceLevel;
    }

    if (salaryMin) {
      where.salaryMax = { gte: parseFloat(String(salaryMin)) };
    }

    if (salaryMax) {
      where.salaryMin = { lte: parseFloat(String(salaryMax)) };
    }

    if (skills) {
      const skillsArray = String(skills).split(',').map((s) => s.trim());
      where.skills = { hasSome: skillsArray };
    }

    if (source) {
      where.source = source;
    }

    const orderBy: any = {};
    switch (sortBy) {
      case 'salary':
        orderBy.salaryMax = 'desc';
        break;
      case 'title':
        orderBy.title = 'asc';
        break;
      case 'company':
        orderBy.companyName = 'asc';
        break;
      default:
        orderBy.postedAt = 'desc';
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: { company: { select: { id: true, name: true, logo: true, location: true } } },
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.job.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getJobById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id), 10);

    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid job ID' });
      return;
    }

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            description: true,
            website: true,
            industry: true,
            companySize: true,
            location: true,
          },
        },
      },
    });

    if (!job) {
      res.status(404).json({ success: false, message: 'Job not found' });
      return;
    }

    await prisma.job.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    res.json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

export const saveJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const jobId = parseInt(String(req.params.id), 10);

    if (isNaN(jobId)) {
      res.status(400).json({ success: false, message: 'Invalid job ID' });
      return;
    }

    const job = await prisma.job.findUnique({ where: { id: jobId } });

    if (!job) {
      res.status(404).json({ success: false, message: 'Job not found' });
      return;
    }

    if (job.status !== 'ACTIVE') {
      res.status(400).json({ success: false, message: 'Job is not available' });
      return;
    }

    const existing = await prisma.savedJob.findUnique({
      where: { userId_jobId: { userId, jobId } },
    });

    if (existing) {
      res.json({ success: true, message: 'Job already saved' });
      return;
    }

    await prisma.savedJob.create({
      data: { userId, jobId },
    });

    res.status(201).json({ success: true, message: 'Job saved' });
  } catch (error) {
    next(error);
  }
};

export const unsaveJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const jobId = parseInt(String(req.params.id), 10);

    if (isNaN(jobId)) {
      res.status(400).json({ success: false, message: 'Invalid job ID' });
      return;
    }

    const deleted = await prisma.savedJob.deleteMany({
      where: { userId, jobId },
    });

    if (deleted.count === 0) {
      res.status(404).json({ success: false, message: 'Saved job not found' });
      return;
    }

    res.json({ success: true, message: 'Job unsaved' });
  } catch (error) {
    next(error);
  }
};

export const getSavedJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { page = '1', limit = '12' } = req.query;

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(String(limit), 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [savedJobs, total] = await Promise.all([
      prisma.savedJob.findMany({
        where: { userId },
        include: {
          job: {
            include: {
              company: { select: { id: true, name: true, logo: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.savedJob.count({ where: { userId } }),
    ]);

    res.json({
      success: true,
      data: {
        savedJobs,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const applyToJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const jobId = parseInt(String(req.params.id), 10);

    if (isNaN(jobId)) {
      res.status(400).json({ success: false, message: 'Invalid job ID' });
      return;
    }

    const job = await prisma.job.findUnique({ where: { id: jobId } });

    if (!job) {
      res.status(404).json({ success: false, message: 'Job not found' });
      return;
    }

    if (job.status !== 'ACTIVE') {
      res.status(400).json({ success: false, message: 'Job is not accepting applications' });
      return;
    }

    const existingApplication = await prisma.application.findUnique({
      where: { userId_jobId: { userId, jobId } },
    });

    if (existingApplication) {
      res.status(400).json({ success: false, message: 'You have already applied to this job' });
      return;
    }

    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { resumeUrl: true },
    });

    const application = await prisma.application.create({
      data: {
        userId,
        jobId,
        status: 'APPLIED',
        resumeUrl: profile?.resumeUrl || null,
        applicationMethod: job.externalApplyUrl ? 'external_redirect' : 'quick_apply',
      },
      include: {
        job: {
          include: {
            company: { select: { id: true, name: true, logo: true } },
          },
        },
      },
    });

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

export const getApplications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { page = '1', limit = '12' } = req.query;

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(String(limit), 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where: { userId },
        include: {
          job: {
            include: {
              company: { select: { id: true, name: true, logo: true } },
            },
          },
        },
        orderBy: { appliedAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.application.count({ where: { userId } }),
    ]);

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getApplicationById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const applicationId = parseInt(String(req.params.id), 10);

    if (isNaN(applicationId)) {
      res.status(400).json({ success: false, message: 'Invalid application ID' });
      return;
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                logo: true,
                description: true,
                website: true,
                industry: true,
              },
            },
          },
        },
      },
    });

    if (!application) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    if (application.userId !== userId) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    res.json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};
