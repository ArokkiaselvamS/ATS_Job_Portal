import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { calculateATSScore, calculateProfileCompletion } from '../services/ats.service';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// ─── Multer Config ──────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), 'uploads', 'resumes');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `resume-${req.user!.userId}-${Date.now()}${ext}`);
  },
});

export const uploadResume = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, and TXT files are allowed'));
    }
  },
}).single('resume');

// ─── Schemas ────────────────────────────────────────────
const updateProfileSchema = z.object({
  phone: z.string().optional(),
  location: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
  preferredLocations: z.array(z.string()).optional(),
  candidateType: z.enum(['STUDENT_FRESHER', 'EXPERIENCED']).optional(),
  careerLevel: z.string().optional(),
  professionalHeadline: z.string().optional(),
  professionalSummary: z.string().optional(),
  targetJobTitles: z.array(z.string()).optional(),
  preferredIndustry: z.string().optional(),
  expectedSalary: z.number().optional(),
  currentSalary: z.number().optional(),
  noticePeriod: z.string().optional(),
  availableFrom: z.string().optional(),
  willingToRelocate: z.boolean().optional(),
  workModePreference: z.array(z.enum(['ONSITE', 'HYBRID', 'REMOTE'])).optional(),
  employmentTypePref: z.array(z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'])).optional(),
  openToWork: z.boolean().optional(),
});

const educationSchema = z.object({
  id: z.number().optional(),
  degree: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  collegeUniversity: z.string().optional(),
  startYear: z.number().optional(),
  graduationYear: z.number().optional(),
  cgpaPercentage: z.number().optional(),
  isCurrentlyStudying: z.boolean().optional(),
  description: z.string().optional(),
  sortOrder: z.number().optional(),
});

const experienceSchema = z.object({
  id: z.number().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  employmentType: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isCurrentlyWorking: z.boolean().optional(),
  responsibilities: z.string().optional(),
  achievements: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  isInternship: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

const skillEntrySchema = z.object({
  id: z.number().optional(),
  skillName: z.string(),
  category: z.enum(['TECHNICAL', 'PROGRAMMING_LANGUAGE', 'FRAMEWORK', 'LIBRARY', 'DATABASE', 'CLOUD', 'TOOL', 'SOFT_SKILL', 'OTHER']),
  skillLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional(),
  yearsOfExperience: z.number().optional(),
  isAutoFilled: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

const projectSchema = z.object({
  id: z.number().optional(),
  projectName: z.string(),
  description: z.string().optional(),
  role: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  responsibilities: z.string().optional(),
  achievements: z.string().optional(),
  githubUrl: z.string().url().optional().or(z.literal('')),
  liveDemoUrl: z.string().url().optional().or(z.literal('')),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isOngoing: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

const certificationSchema = z.object({
  id: z.number().optional(),
  certificationName: z.string(),
  issuingOrganization: z.string().optional(),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  credentialId: z.string().optional(),
  credentialUrl: z.string().url().optional().or(z.literal('')),
  certificateUrl: z.string().url().optional().or(z.literal('')),
  sortOrder: z.number().optional(),
});

const achievementSchema = z.object({
  id: z.number().optional(),
  title: z.string(),
  description: z.string().optional(),
  organization: z.string().optional(),
  date: z.string().optional(),
  achievementType: z.string().optional(),
  proofUrl: z.string().url().optional().or(z.literal('')),
  sortOrder: z.number().optional(),
});

const languageSchema = z.object({
  id: z.number().optional(),
  language: z.string(),
  proficiency: z.enum(['BASIC', 'CONVERSATIONAL', 'PROFESSIONAL', 'NATIVE', 'FLUENT']),
  sortOrder: z.number().optional(),
});

// ─── GET Profile ────────────────────────────────────────
export const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        education: { orderBy: { sortOrder: 'asc' } },
        experience: { orderBy: { sortOrder: 'asc' } },
        skills: { orderBy: { sortOrder: 'asc' } },
        projects: { orderBy: { sortOrder: 'asc' } },
        certifications: { orderBy: { sortOrder: 'asc' } },
        achievements: { orderBy: { sortOrder: 'asc' } },
        languages: { orderBy: { sortOrder: 'asc' } },
        resume: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            profileImage: true,
          },
        },
      },
    });

    if (!profile) {
      res.status(404).json({ success: false, message: 'Profile not found' });
      return;
    }

    // Calculate ATS score and completion (non-critical, handle errors separately)
    let atsScoreValue = 0;
    let completionPercentage = 0;
    try {
      const [atsScore, completion] = await Promise.all([
        calculateATSScore(profile.id),
        calculateProfileCompletion(profile.id),
      ]);
      atsScoreValue = atsScore.overall;
      completionPercentage = completion.percentage;

      await prisma.profile.update({
        where: { id: profile.id },
        data: {
          atsScore: atsScore.overall,
          atsScoreBreakdown: atsScore as any,
          profileCompletion: completion.percentage,
        },
      });
    } catch (atsError) {
      // ATS calculation failed, use stored values or defaults
      atsScoreValue = profile.atsScore ?? 0;
      completionPercentage = profile.profileCompletion ?? 0;
    }

    res.json({
      success: true,
      data: {
        ...profile,
        atsScore: atsScoreValue,
        profileCompletion: completionPercentage,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE Profile ─────────────────────────────────────
export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const data = updateProfileSchema.parse(req.body);

    // Clean empty strings to null for URL fields
    const urlFields = ['website', 'linkedinUrl', 'githubUrl', 'portfolioUrl'];
    const cleanedData: any = { ...data };
    for (const field of urlFields) {
      if (cleanedData[field] === '') cleanedData[field] = null;
    }

    // Handle date conversion
    if (cleanedData.dateOfBirth) {
      cleanedData.dateOfBirth = new Date(cleanedData.dateOfBirth);
    }
    if (cleanedData.availableFrom) {
      cleanedData.availableFrom = new Date(cleanedData.availableFrom);
    }

    const profile = await prisma.profile.update({
      where: { userId },
      data: cleanedData,
    });

    // Recalculate ATS score and completion
    const [atsScore, completion] = await Promise.all([
      calculateATSScore(profile.id),
      calculateProfileCompletion(profile.id),
    ]);

    await prisma.profile.update({
      where: { id: profile.id },
      data: {
        atsScore: atsScore.overall,
        atsScoreBreakdown: atsScore as any,
        profileCompletion: completion.percentage,
      },
    });

    res.json({
      success: true,
      data: { ...profile, atsScore, profileCompletion: completion },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Education CRUD ─────────────────────────────────────
export const getEducation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) { res.status(404).json({ success: false, message: 'Profile not found' }); return; }

    const education = await prisma.education.findMany({
      where: { profileId: profile.id },
      orderBy: { sortOrder: 'asc' },
    });

    res.json({ success: true, data: education });
  } catch (error) { next(error); }
};

export const upsertEducation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) { res.status(404).json({ success: false, message: 'Profile not found' }); return; }

    const data = educationSchema.parse(req.body);
    const { id, ...eduData } = data;

    let education;
    if (id) {
      education = await prisma.education.update({
        where: { id },
        data: {
          ...eduData,
          startYear: eduData.startYear || undefined,
          graduationYear: eduData.graduationYear || undefined,
        },
      });
    } else {
      const maxOrder = await prisma.education.aggregate({
        where: { profileId: profile.id },
        _max: { sortOrder: true },
      });
      education = await prisma.education.create({
        data: {
          profileId: profile.id,
          ...eduData,
          sortOrder: (maxOrder._max.sortOrder || 0) + 1,
        },
      });
    }

    res.json({ success: true, data: education });
  } catch (error) { next(error); }
};

export const deleteEducation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) { res.status(404).json({ success: false, message: 'Profile not found' }); return; }

    const id = parseInt(String(req.params.id));
    await prisma.education.deleteMany({ where: { id, profileId: profile.id } });

    res.json({ success: true, message: 'Education deleted' });
  } catch (error) { next(error); }
};

// ─── Experience CRUD ────────────────────────────────────
export const getExperience = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) { res.status(404).json({ success: false, message: 'Profile not found' }); return; }

    const experience = await prisma.experience.findMany({
      where: { profileId: profile.id },
      orderBy: { sortOrder: 'asc' },
    });

    res.json({ success: true, data: experience });
  } catch (error) { next(error); }
};

export const upsertExperience = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) { res.status(404).json({ success: false, message: 'Profile not found' }); return; }

    const data = experienceSchema.parse(req.body);
    const { id, ...expData } = data;

    const processedData: any = { ...expData };
    if (processedData.startDate) processedData.startDate = new Date(processedData.startDate);
    if (processedData.endDate) processedData.endDate = new Date(processedData.endDate);

    let experience;
    if (id) {
      experience = await prisma.experience.update({
        where: { id },
        data: processedData,
      });
    } else {
      const maxOrder = await prisma.experience.aggregate({
        where: { profileId: profile.id },
        _max: { sortOrder: true },
      });
      experience = await prisma.experience.create({
        data: {
          profileId: profile.id,
          ...processedData,
          sortOrder: (maxOrder._max.sortOrder || 0) + 1,
        },
      });
    }

    res.json({ success: true, data: experience });
  } catch (error) { next(error); }
};

export const deleteExperience = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) { res.status(404).json({ success: false, message: 'Profile not found' }); return; }

    const id = parseInt(String(req.params.id));
    await prisma.experience.deleteMany({ where: { id, profileId: profile.id } });

    res.json({ success: true, message: 'Experience deleted' });
  } catch (error) { next(error); }
};

// ─── Skills CRUD ────────────────────────────────────────
export const getSkills = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) { res.status(404).json({ success: false, message: 'Profile not found' }); return; }

    const skills = await prisma.skillEntry.findMany({
      where: { profileId: profile.id },
      orderBy: { sortOrder: 'asc' },
    });

    res.json({ success: true, data: skills });
  } catch (error) { next(error); }
};

export const upsertSkill = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) { res.status(404).json({ success: false, message: 'Profile not found' }); return; }

    const data = skillEntrySchema.parse(req.body);
    const { id, ...skillData } = data;

    let skill;
    if (id) {
      skill = await prisma.skillEntry.update({
        where: { id },
        data: skillData,
      });
    } else {
      const maxOrder = await prisma.skillEntry.aggregate({
        where: { profileId: profile.id },
        _max: { sortOrder: true },
      });
      skill = await prisma.skillEntry.create({
        data: {
          profileId: profile.id,
          ...skillData,
          sortOrder: (maxOrder._max.sortOrder || 0) + 1,
        },
      });
    }

    res.json({ success: true, data: skill });
  } catch (error) { next(error); }
};

export const deleteSkill = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) { res.status(404).json({ success: false, message: 'Profile not found' }); return; }

    const id = parseInt(String(req.params.id));
    await prisma.skillEntry.deleteMany({ where: { id, profileId: profile.id } });

    res.json({ success: true, message: 'Skill deleted' });
  } catch (error) { next(error); }
};

// ─── Projects CRUD ──────────────────────────────────────
export const getProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) { res.status(404).json({ success: false, message: 'Profile not found' }); return; }

    const projects = await prisma.project.findMany({
      where: { profileId: profile.id },
      orderBy: { sortOrder: 'asc' },
    });

    res.json({ success: true, data: projects });
  } catch (error) { next(error); }
};

export const upsertProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) { res.status(404).json({ success: false, message: 'Profile not found' }); return; }

    const data = projectSchema.parse(req.body);
    const { id, ...projectData } = data;

    const processedData: any = { ...projectData };
    if (processedData.githubUrl === '') processedData.githubUrl = null;
    if (processedData.liveDemoUrl === '') processedData.liveDemoUrl = null;
    if (processedData.startDate) processedData.startDate = new Date(processedData.startDate);
    if (processedData.endDate) processedData.endDate = new Date(processedData.endDate);

    let project;
    if (id) {
      project = await prisma.project.update({
        where: { id },
        data: processedData,
      });
    } else {
      const maxOrder = await prisma.project.aggregate({
        where: { profileId: profile.id },
        _max: { sortOrder: true },
      });
      project = await prisma.project.create({
        data: {
          profileId: profile.id,
          ...processedData,
          sortOrder: (maxOrder._max.sortOrder || 0) + 1,
        },
      });
    }

    res.json({ success: true, data: project });
  } catch (error) { next(error); }
};

export const deleteProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) { res.status(404).json({ success: false, message: 'Profile not found' }); return; }

    const id = parseInt(String(req.params.id));
    await prisma.project.deleteMany({ where: { id, profileId: profile.id } });

    res.json({ success: true, message: 'Project deleted' });
  } catch (error) { next(error); }
};

// ─── Certifications CRUD ────────────────────────────────
export const getCertifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) { res.status(404).json({ success: false, message: 'Profile not found' }); return; }

    const certifications = await prisma.certification.findMany({
      where: { profileId: profile.id },
      orderBy: { sortOrder: 'asc' },
    });

    res.json({ success: true, data: certifications });
  } catch (error) { next(error); }
};

export const upsertCertification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) { res.status(404).json({ success: false, message: 'Profile not found' }); return; }

    const data = certificationSchema.parse(req.body);
    const { id, ...certData } = data;

    const processedData: any = { ...certData };
    if (processedData.credentialUrl === '') processedData.credentialUrl = null;
    if (processedData.certificateUrl === '') processedData.certificateUrl = null;
    if (processedData.issueDate) processedData.issueDate = new Date(processedData.issueDate);
    if (processedData.expiryDate) processedData.expiryDate = new Date(processedData.expiryDate);

    let cert;
    if (id) {
      cert = await prisma.certification.update({
        where: { id },
        data: processedData,
      });
    } else {
      const maxOrder = await prisma.certification.aggregate({
        where: { profileId: profile.id },
        _max: { sortOrder: true },
      });
      cert = await prisma.certification.create({
        data: {
          profileId: profile.id,
          ...processedData,
          sortOrder: (maxOrder._max.sortOrder || 0) + 1,
        },
      });
    }

    res.json({ success: true, data: cert });
  } catch (error) { next(error); }
};

export const deleteCertification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) { res.status(404).json({ success: false, message: 'Profile not found' }); return; }

    const id = parseInt(String(req.params.id));
    await prisma.certification.deleteMany({ where: { id, profileId: profile.id } });

    res.json({ success: true, message: 'Certification deleted' });
  } catch (error) { next(error); }
};

// ─── Achievements CRUD ──────────────────────────────────
export const getAchievements = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) { res.status(404).json({ success: false, message: 'Profile not found' }); return; }

    const achievements = await prisma.achievement.findMany({
      where: { profileId: profile.id },
      orderBy: { sortOrder: 'asc' },
    });

    res.json({ success: true, data: achievements });
  } catch (error) { next(error); }
};

export const upsertAchievement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) { res.status(404).json({ success: false, message: 'Profile not found' }); return; }

    const data = achievementSchema.parse(req.body);
    const { id, ...achData } = data;

    const processedData: any = { ...achData };
    if (processedData.proofUrl === '') processedData.proofUrl = null;
    if (processedData.date) processedData.date = new Date(processedData.date);

    let achievement;
    if (id) {
      achievement = await prisma.achievement.update({
        where: { id },
        data: processedData,
      });
    } else {
      const maxOrder = await prisma.achievement.aggregate({
        where: { profileId: profile.id },
        _max: { sortOrder: true },
      });
      achievement = await prisma.achievement.create({
        data: {
          profileId: profile.id,
          ...processedData,
          sortOrder: (maxOrder._max.sortOrder || 0) + 1,
        },
      });
    }

    res.json({ success: true, data: achievement });
  } catch (error) { next(error); }
};

export const deleteAchievement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) { res.status(404).json({ success: false, message: 'Profile not found' }); return; }

    const id = parseInt(String(req.params.id));
    await prisma.achievement.deleteMany({ where: { id, profileId: profile.id } });

    res.json({ success: true, message: 'Achievement deleted' });
  } catch (error) { next(error); }
};

// ─── Languages CRUD ─────────────────────────────────────
export const getLanguages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) { res.status(404).json({ success: false, message: 'Profile not found' }); return; }

    const languages = await prisma.language.findMany({
      where: { profileId: profile.id },
      orderBy: { sortOrder: 'asc' },
    });

    res.json({ success: true, data: languages });
  } catch (error) { next(error); }
};

export const upsertLanguage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) { res.status(404).json({ success: false, message: 'Profile not found' }); return; }

    const data = languageSchema.parse(req.body);
    const { id, ...langData } = data;

    let language;
    if (id) {
      language = await prisma.language.update({
        where: { id },
        data: langData,
      });
    } else {
      const maxOrder = await prisma.language.aggregate({
        where: { profileId: profile.id },
        _max: { sortOrder: true },
      });
      language = await prisma.language.create({
        data: {
          profileId: profile.id,
          ...langData,
          sortOrder: (maxOrder._max.sortOrder || 0) + 1,
        },
      });
    }

    res.json({ success: true, data: language });
  } catch (error) { next(error); }
};

export const deleteLanguage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) { res.status(404).json({ success: false, message: 'Profile not found' }); return; }

    const id = parseInt(String(req.params.id));
    await prisma.language.deleteMany({ where: { id, profileId: profile.id } });

    res.json({ success: true, message: 'Language deleted' });
  } catch (error) { next(error); }
};

// ─── Resume Upload ──────────────────────────────────────
export const uploadResumeFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) { res.status(404).json({ success: false, message: 'Profile not found' }); return; }

    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    // Delete existing resume if any
    const existingResume = await prisma.resume.findUnique({ where: { profileId: profile.id } });
    if (existingResume) {
      const oldPath = path.join(process.cwd(), 'uploads', 'resumes', path.basename(existingResume.fileUrl));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      await prisma.resume.delete({ where: { profileId: profile.id } });
    }

    // Read and parse text content if it's a .txt file
    let parsedData: any = null;
    if (req.file.originalname.endsWith('.txt')) {
      const text = fs.readFileSync(req.file.path, 'utf-8');
      const { parseResumeText } = await import('../services/resumeParser');
      parsedData = parseResumeText(text);
    }

    const resume = await prisma.resume.create({
      data: {
        profileId: profile.id,
        fileName: req.file.originalname,
        fileUrl: `/uploads/resumes/${req.file.filename}`,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        parsedData: parsedData as any,
        version: (existingResume?.version || 0) + 1,
      },
    });

    // Update profile resume fields
    await prisma.profile.update({
      where: { id: profile.id },
      data: {
        resumeUrl: resume.fileUrl,
        resumeName: resume.fileName,
        resumeUploadedAt: new Date(),
        resumeVersion: resume.version,
      },
    });

    // Auto-fill profile from parsed data if available
    let autoFilled: string[] = [];
    if (parsedData) {
      const profileUpdates: any = {};

      if (parsedData.personal?.linkedin && !profile.linkedinUrl) {
        profileUpdates.linkedinUrl = parsedData.personal.linkedin;
        autoFilled.push('LinkedIn');
      }
      if (parsedData.personal?.github && !profile.githubUrl) {
        profileUpdates.githubUrl = parsedData.personal.github;
        autoFilled.push('GitHub');
      }
      if (parsedData.personal?.phone && !profile.phone) {
        profileUpdates.phone = parsedData.personal.phone;
        autoFilled.push('Phone');
      }
      if (parsedData.personal?.location && !profile.location) {
        profileUpdates.location = parsedData.personal.location;
        autoFilled.push('Location');
      }
      if (parsedData.summary && !profile.professionalSummary) {
        profileUpdates.professionalSummary = parsedData.summary;
        autoFilled.push('Summary');
      }

      if (Object.keys(profileUpdates).length > 0) {
        await prisma.profile.update({ where: { id: profile.id }, data: profileUpdates });
      }

      // Auto-fill skills
      if (parsedData.skills && parsedData.skills.length > 0) {
        const existingSkills = await prisma.skillEntry.findMany({ where: { profileId: profile.id } });
        if (existingSkills.length === 0) {
          const maxOrder = await prisma.skillEntry.aggregate({
            where: { profileId: profile.id },
            _max: { sortOrder: true },
          });
          let order = (maxOrder._max.sortOrder || 0) + 1;
          
          await prisma.skillEntry.createMany({
            data: parsedData.skills.map((skill: string) => ({
              profileId: profile.id,
              skillName: skill,
              category: 'TECHNICAL' as const,
              isAutoFilled: true,
              sortOrder: order++,
            })),
          });
          autoFilled.push('Skills');
        }
      }

      // Auto-fill education
      if (parsedData.education && parsedData.education.length > 0) {
        const existingEdu = await prisma.education.findMany({ where: { profileId: profile.id } });
        if (existingEdu.length === 0) {
          const maxOrder = await prisma.education.aggregate({
            where: { profileId: profile.id },
            _max: { sortOrder: true },
          });
          let order = (maxOrder._max.sortOrder || 0) + 1;

          for (const edu of parsedData.education) {
            await prisma.education.create({
              data: {
                profileId: profile.id,
                collegeUniversity: edu.institution,
                degree: edu.degree,
                fieldOfStudy: edu.field,
                startYear: edu.startYear,
                graduationYear: edu.endYear,
                cgpaPercentage: edu.cgpa,
                sortOrder: order++,
              },
            });
          }
          autoFilled.push('Education');
        }
      }

      // Auto-fill experience
      if (parsedData.experience && parsedData.experience.length > 0) {
        const existingExp = await prisma.experience.findMany({ where: { profileId: profile.id } });
        if (existingExp.length === 0) {
          const maxOrder = await prisma.experience.aggregate({
            where: { profileId: profile.id },
            _max: { sortOrder: true },
          });
          let order = (maxOrder._max.sortOrder || 0) + 1;

          for (const exp of parsedData.experience) {
            await prisma.experience.create({
              data: {
                profileId: profile.id,
                company: exp.company,
                jobTitle: exp.title,
                responsibilities: exp.responsibilities,
                technologies: exp.technologies || [],
                sortOrder: order++,
              },
            });
          }
          autoFilled.push('Experience');
        }
      }

      // Auto-fill projects
      if (parsedData.projects && parsedData.projects.length > 0) {
        const existingProjects = await prisma.project.findMany({ where: { profileId: profile.id } });
        if (existingProjects.length === 0) {
          const maxOrder = await prisma.project.aggregate({
            where: { profileId: profile.id },
            _max: { sortOrder: true },
          });
          let order = (maxOrder._max.sortOrder || 0) + 1;

          for (const proj of parsedData.projects) {
            await prisma.project.create({
              data: {
                profileId: profile.id,
                projectName: proj.name,
                description: proj.description,
                technologies: proj.technologies || [],
                sortOrder: order++,
              },
            });
          }
          autoFilled.push('Projects');
        }
      }
    }

    // Recalculate scores
    const [atsScore, completion] = await Promise.all([
      calculateATSScore(profile.id),
      calculateProfileCompletion(profile.id),
    ]);

    await prisma.profile.update({
      where: { id: profile.id },
      data: {
        atsScore: atsScore.overall,
        atsScoreBreakdown: atsScore as any,
        profileCompletion: completion.percentage,
      },
    });

    res.json({
      success: true,
      data: {
        resume,
        autoFilled,
        atsScore,
        profileCompletion: completion,
        parsedData,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── ATS Score ──────────────────────────────────────────
export const getATSScore = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) { res.status(404).json({ success: false, message: 'Profile not found' }); return; }

    const atsScore = await calculateATSScore(profile.id);

    await prisma.profile.update({
      where: { id: profile.id },
      data: {
        atsScore: atsScore.overall,
        atsScoreBreakdown: atsScore as any,
      },
    });

    res.json({ success: true, data: atsScore });
  } catch (error) { next(error); }
};

// ─── Profile Completion ─────────────────────────────────
export const getProfileCompletion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) { res.status(404).json({ success: false, message: 'Profile not found' }); return; }

    const completion = await calculateProfileCompletion(profile.id);

    await prisma.profile.update({
      where: { id: profile.id },
      data: { profileCompletion: completion.percentage },
    });

    res.json({ success: true, data: completion });
  } catch (error) { next(error); }
};
