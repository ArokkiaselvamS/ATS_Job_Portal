import { Request, Response, NextFunction } from 'express';
import prisma from '../../utils/prisma';

async function getCompanyId(userId: number): Promise<number | null> {
  const companyAdmin = await prisma.companyAdmin.findFirst({ where: { userId } });
  return companyAdmin?.companyId ?? null;
}

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const companyId = await getCompanyId(req.user!.userId);
    if (!companyId) { res.status(404).json({ success: false, message: 'Company not found' }); return; }

    const [totalJobs, activeJobs, totalApplications, pendingApplications, teamCount, hiredCount] = await Promise.all([
      prisma.job.count({ where: { companyId } }),
      prisma.job.count({ where: { companyId, status: 'ACTIVE' } }),
      prisma.application.count({ where: { job: { companyId } } }),
      prisma.application.count({ where: { job: { companyId }, status: 'APPLIED' } }),
      prisma.companyAdmin.count({ where: { companyId } }),
      prisma.application.count({ where: { job: { companyId }, status: 'ACCEPTED' } }),
    ]);

    const recentApplications = await prisma.application.findMany({
      where: { job: { companyId } },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        job: { select: { title: true } },
      },
      orderBy: { appliedAt: 'desc' },
      take: 5,
    });

    res.json({
      success: true,
      data: {
        totalJobs,
        activeJobs,
        totalApplications,
        pendingApplications,
        teamMembers: teamCount,
        hired: hiredCount,
        recentApplications,
      },
    });
  } catch (error) { next(error); }
};

export const getCompanyProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const companyId = await getCompanyId(req.user!.userId);
    if (!companyId) { res.status(404).json({ success: false, message: 'Company not found' }); return; }

    const company = await prisma.company.findUnique({ where: { id: companyId } });
    res.json({ success: true, data: company });
  } catch (error) { next(error); }
};

export const updateCompanyProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const companyId = await getCompanyId(req.user!.userId);
    if (!companyId) { res.status(404).json({ success: false, message: 'Company not found' }); return; }

    const { name, industry, companySize, website, description, country, state, city, address, logo } = req.body;
    const company = await prisma.company.update({
      where: { id: companyId },
      data: {
        ...(name !== undefined && { name }),
        ...(industry !== undefined && { industry }),
        ...(companySize !== undefined && { companySize }),
        ...(website !== undefined && { website }),
        ...(description !== undefined && { description }),
        ...(country !== undefined && { country }),
        ...(state !== undefined && { state }),
        ...(city !== undefined && { city }),
        ...(address !== undefined && { address }),
        ...(logo !== undefined && { logo }),
      },
    });
    res.json({ success: true, data: company });
  } catch (error) { next(error); }
};

export const getJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const companyId = await getCompanyId(req.user!.userId);
    if (!companyId) { res.status(404).json({ success: false, message: 'Company not found' }); return; }

    const { search, status, page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(String(limit), 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where: any = { companyId };
    if (search) where.OR = [{ title: { contains: String(search), mode: 'insensitive' } }];
    if (status) where.status = String(status);

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: { _count: { select: { applications: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.job.count({ where }),
    ]);

    res.json({ success: true, data: { jobs, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
  } catch (error) { next(error); }
};

export const createJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const companyId = await getCompanyId(req.user!.userId);
    if (!companyId) { res.status(404).json({ success: false, message: 'Company not found' }); return; }

    const { title, description, location, city, country, jobType, workMode, experienceLevel, salaryMin, salaryMax, salaryCurrency, skills } = req.body;
    const company = await prisma.company.findUnique({ where: { id: companyId }, select: { name: true } });

    const job = await prisma.job.create({
      data: {
        title,
        description,
        companyId,
        companyName: company?.name || '',
        location,
        city,
        country,
        jobType: jobType || 'FULL_TIME',
        workMode: workMode || 'ONSITE',
        experienceLevel,
        salaryMin,
        salaryMax,
        salaryCurrency,
        skills: skills || [],
        status: 'PENDING_REVIEW',
        source: 'INTERNAL',
      },
    });
    res.status(201).json({ success: true, data: job });
  } catch (error) { next(error); }
};

export const updateJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const companyId = await getCompanyId(req.user!.userId);
    if (!companyId) { res.status(404).json({ success: false, message: 'Company not found' }); return; }

    const jobId = parseInt(String(req.params.id));
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.companyId !== companyId) { res.status(404).json({ success: false, message: 'Job not found' }); return; }

    const { title, description, location, city, country, jobType, workMode, experienceLevel, salaryMin, salaryMax, salaryCurrency, skills, status } = req.body;
    const updated = await prisma.job.update({
      where: { id: jobId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(location !== undefined && { location }),
        ...(city !== undefined && { city }),
        ...(country !== undefined && { country }),
        ...(jobType !== undefined && { jobType }),
        ...(workMode !== undefined && { workMode }),
        ...(experienceLevel !== undefined && { experienceLevel }),
        ...(salaryMin !== undefined && { salaryMin }),
        ...(salaryMax !== undefined && { salaryMax }),
        ...(salaryCurrency !== undefined && { salaryCurrency }),
        ...(skills !== undefined && { skills }),
        ...(status !== undefined && { status }),
      },
    });
    res.json({ success: true, data: updated });
  } catch (error) { next(error); }
};

export const deleteJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const companyId = await getCompanyId(req.user!.userId);
    if (!companyId) { res.status(404).json({ success: false, message: 'Company not found' }); return; }

    const jobId = parseInt(String(req.params.id));
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.companyId !== companyId) { res.status(404).json({ success: false, message: 'Job not found' }); return; }

    await prisma.job.delete({ where: { id: jobId } });
    res.json({ success: true, message: 'Job deleted' });
  } catch (error) { next(error); }
};

export const getApplications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const companyId = await getCompanyId(req.user!.userId);
    if (!companyId) { res.status(404).json({ success: false, message: 'Company not found' }); return; }

    const { search, status, jobId, page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(String(limit), 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where: any = { job: { companyId } };
    if (status) where.status = String(status);
    if (jobId) where.jobId = parseInt(String(jobId));
    if (search) {
      where.OR = [
        { user: { firstName: { contains: String(search), mode: 'insensitive' } } },
        { user: { lastName: { contains: String(search), mode: 'insensitive' } } },
        { user: { email: { contains: String(search), mode: 'insensitive' } } },
      ];
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, profileImage: true, phone: true } },
          job: { select: { id: true, title: true } },
        },
        orderBy: { appliedAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.application.count({ where }),
    ]);

    res.json({ success: true, data: { applications, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
  } catch (error) { next(error); }
};

export const updateApplicationStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const companyId = await getCompanyId(req.user!.userId);
    if (!companyId) { res.status(404).json({ success: false, message: 'Company not found' }); return; }

    const appId = parseInt(String(req.params.id));
    const app = await prisma.application.findUnique({ where: { id: appId }, include: { job: true } });
    if (!app || app.job.companyId !== companyId) { res.status(404).json({ success: false, message: 'Application not found' }); return; }

    const { status } = req.body;
    const updated = await prisma.application.update({ where: { id: appId }, data: { status } });
    res.json({ success: true, data: updated });
  } catch (error) { next(error); }
};

export const getCandidates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const companyId = await getCompanyId(req.user!.userId);
    if (!companyId) { res.status(404).json({ success: false, message: 'Company not found' }); return; }

    const { search, page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(String(limit), 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const jobIds = (await prisma.job.findMany({ where: { companyId }, select: { id: true } })).map(j => j.id);

    const where: any = { jobId: { in: jobIds } };
    if (search) {
      where.OR = [
        { user: { firstName: { contains: String(search), mode: 'insensitive' } } },
        { user: { lastName: { contains: String(search), mode: 'insensitive' } } },
        { user: { email: { contains: String(search), mode: 'insensitive' } } },
      ];
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, profileImage: true, phone: true, profile: { select: { headline: true, skills: { select: { skillName: true } }, location: true } } } },
          job: { select: { id: true, title: true } },
        },
        orderBy: { appliedAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.application.count({ where }),
    ]);

    const candidates = applications.map(a => ({
      id: a.user.id,
      name: `${a.user.firstName} ${a.user.lastName}`,
      email: a.user.email,
      phone: a.user.phone,
      profileImage: a.user.profileImage,
      headline: a.user.profile?.headline,
      skills: a.user.profile?.skills?.map(s => s.skillName) || [],
      location: a.user.profile?.location,
      appliedFor: a.job.title,
      applicationId: a.id,
      status: a.status,
      appliedAt: a.appliedAt,
    }));

    res.json({ success: true, data: { candidates, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
  } catch (error) { next(error); }
};

export const getInterviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const companyId = await getCompanyId(req.user!.userId);
    if (!companyId) { res.status(404).json({ success: false, message: 'Company not found' }); return; }

    const applications = await prisma.application.findMany({
      where: { job: { companyId }, status: { in: ['INTERVIEW', 'SCREENING'] } },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, profileImage: true } },
        job: { select: { id: true, title: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const interviews = applications.map((a, i) => ({
      id: a.id,
      candidateId: a.user.id,
      candidateName: `${a.user.firstName} ${a.user.lastName}`,
      candidateEmail: a.user.email,
      candidateImage: a.user.profileImage,
      jobTitle: a.job.title,
      jobId: a.job.id,
      type: a.status === 'INTERVIEW' ? 'Technical' : 'Screening',
      status: a.status,
      date: a.updatedAt,
    }));

    res.json({ success: true, data: interviews });
  } catch (error) { next(error); }
};

export const getTeamMembers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const companyId = await getCompanyId(req.user!.userId);
    if (!companyId) { res.status(404).json({ success: false, message: 'Company not found' }); return; }

    const members = await prisma.companyAdmin.findMany({
      where: { companyId },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true, profileImage: true, createdAt: true, lastLoginAt: true, isActive: true } } },
    });

    const teamMembers = members.map(m => ({
      id: m.id,
      userId: m.user.id,
      name: `${m.user.firstName} ${m.user.lastName}`,
      email: m.user.email,
      profileImage: m.user.profileImage,
      role: m.role,
      isActive: m.user.isActive,
      joined: m.createdAt,
      lastLogin: m.user.lastLoginAt,
    }));

    res.json({ success: true, data: teamMembers });
  } catch (error) { next(error); }
};

export const inviteTeamMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const companyId = await getCompanyId(req.user!.userId);
    if (!companyId) { res.status(404).json({ success: false, message: 'Company not found' }); return; }

    const { email, firstName, lastName, role } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      const existingAdmin = await prisma.companyAdmin.findFirst({ where: { userId: existing.id, companyId } });
      if (existingAdmin) { res.status(400).json({ success: false, message: 'User is already a team member' }); return; }
      await prisma.companyAdmin.create({ data: { userId: existing.id, companyId, role: role || 'recruiter' } });
      res.status(201).json({ success: true, message: 'Member added' });
      return;
    }

    const { hashPassword } = await import('../../utils/password');
    const tempPassword = Math.random().toString(36).slice(-12) + 'A1!';
    const passwordHash = await hashPassword(tempPassword);
    const tempReferralCode = 'TM' + Date.now().toString().slice(-6) + Math.random().toString(36).substring(2, 6).toUpperCase();

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash,
        role: 'COMPANY_ADMIN',
        isEmailVerified: false,
        isActive: true,
        referralCode: tempReferralCode,
      },
    });

    await prisma.companyAdmin.create({ data: { userId: user.id, companyId, role: role || 'recruiter' } });
    res.status(201).json({ success: true, message: 'Invitation sent' });
  } catch (error) { next(error); }
};

export const updateTeamMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const companyId = await getCompanyId(req.user!.userId);
    if (!companyId) { res.status(404).json({ success: false, message: 'Company not found' }); return; }

    const memberId = parseInt(String(req.params.id));
    const member = await prisma.companyAdmin.findUnique({ where: { id: memberId } });
    if (!member || member.companyId !== companyId) { res.status(404).json({ success: false, message: 'Member not found' }); return; }

    const { role } = req.body;
    const updated = await prisma.companyAdmin.update({ where: { id: memberId }, data: { role } });
    res.json({ success: true, data: updated });
  } catch (error) { next(error); }
};

export const removeTeamMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const companyId = await getCompanyId(req.user!.userId);
    if (!companyId) { res.status(404).json({ success: false, message: 'Company not found' }); return; }

    const memberId = parseInt(String(req.params.id));
    const member = await prisma.companyAdmin.findUnique({ where: { id: memberId } });
    if (!member || member.companyId !== companyId) { res.status(404).json({ success: false, message: 'Member not found' }); return; }

    await prisma.companyAdmin.delete({ where: { id: memberId } });
    res.json({ success: true, message: 'Member removed' });
  } catch (error) { next(error); }
};

export const getAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const companyId = await getCompanyId(req.user!.userId);
    if (!companyId) { res.status(404).json({ success: false, message: 'Company not found' }); return; }

    const [totalJobs, totalApplications, hiredCount, jobs, applicationsByStatus] = await Promise.all([
      prisma.job.count({ where: { companyId } }),
      prisma.application.count({ where: { job: { companyId } } }),
      prisma.application.count({ where: { job: { companyId }, status: 'ACCEPTED' } }),
      prisma.job.findMany({ where: { companyId }, select: { id: true, title: true, views: true, status: true } }),
      prisma.application.groupBy({ by: ['status'], where: { job: { companyId } }, _count: { status: true } }),
    ]);

    const totalViews = jobs.reduce((sum, j) => sum + j.views, 0);
    const jobsWithApps = await Promise.all(
      jobs.slice(0, 5).map(async (j) => ({
        title: j.title,
        views: j.views,
        applications: await prisma.application.count({ where: { jobId: j.id } }),
        rate: j.views > 0 ? ((await prisma.application.count({ where: { jobId: j.id } })) / j.views * 100).toFixed(1) : '0',
      }))
    );

    res.json({
      success: true,
      data: {
        totalViews,
        totalApplications,
        totalHires: hiredCount,
        totalJobs: jobs.length,
        activeJobs: jobs.filter(j => j.status === 'ACTIVE').length,
        applicationsByStatus: applicationsByStatus.map(s => ({ status: s.status, count: s._count.status })),
        jobsPerformance: jobsWithApps,
      },
    });
  } catch (error) { next(error); }
};

export const getNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ success: true, data: notifications });
  } catch (error) { next(error); }
};

export const markNotificationRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id));
    await prisma.notification.update({ where: { id }, data: { isRead: true } });
    res.json({ success: true });
  } catch (error) { next(error); }
};

export const markAllNotificationsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await prisma.notification.updateMany({ where: { userId: req.user!.userId, isRead: false }, data: { isRead: true } });
    res.json({ success: true });
  } catch (error) { next(error); }
};