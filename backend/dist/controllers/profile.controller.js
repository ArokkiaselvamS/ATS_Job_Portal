"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfileCompletion = exports.getATSScore = exports.uploadResumeFile = exports.deleteLanguage = exports.upsertLanguage = exports.getLanguages = exports.deleteAchievement = exports.upsertAchievement = exports.getAchievements = exports.deleteCertification = exports.upsertCertification = exports.getCertifications = exports.deleteProject = exports.upsertProject = exports.getProjects = exports.deleteSkill = exports.upsertSkill = exports.getSkills = exports.deleteExperience = exports.upsertExperience = exports.getExperience = exports.deleteEducation = exports.upsertEducation = exports.getEducation = exports.updateProfile = exports.getProfile = exports.uploadResume = void 0;
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../utils/prisma"));
const ats_service_1 = require("../services/ats.service");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// ─── Multer Config ──────────────────────────────────────
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const dir = path_1.default.join(process.cwd(), 'uploads', 'resumes');
        if (!fs_1.default.existsSync(dir))
            fs_1.default.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        cb(null, `resume-${req.user.userId}-${Date.now()}${ext}`);
    },
});
exports.uploadResume = (0, multer_1.default)({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ['.pdf', '.doc', '.docx', '.txt'];
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
            cb(null, true);
        }
        else {
            cb(new Error('Only PDF, DOC, DOCX, and TXT files are allowed'));
        }
    },
}).single('resume');
// ─── Schemas ────────────────────────────────────────────
const updateProfileSchema = zod_1.z.object({
    phone: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    state: zod_1.z.string().optional(),
    country: zod_1.z.string().optional(),
    dateOfBirth: zod_1.z.string().optional(),
    gender: zod_1.z.string().optional(),
    website: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    linkedinUrl: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    githubUrl: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    portfolioUrl: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    preferredLocations: zod_1.z.array(zod_1.z.string()).optional(),
    candidateType: zod_1.z.enum(['STUDENT_FRESHER', 'EXPERIENCED']).optional(),
    careerLevel: zod_1.z.string().optional(),
    professionalHeadline: zod_1.z.string().optional(),
    professionalSummary: zod_1.z.string().optional(),
    targetJobTitles: zod_1.z.array(zod_1.z.string()).optional(),
    preferredIndustry: zod_1.z.string().optional(),
    expectedSalary: zod_1.z.number().optional(),
    currentSalary: zod_1.z.number().optional(),
    noticePeriod: zod_1.z.string().optional(),
    availableFrom: zod_1.z.string().optional(),
    willingToRelocate: zod_1.z.boolean().optional(),
    workModePreference: zod_1.z.array(zod_1.z.enum(['ONSITE', 'HYBRID', 'REMOTE'])).optional(),
    employmentTypePref: zod_1.z.array(zod_1.z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'])).optional(),
    openToWork: zod_1.z.boolean().optional(),
});
const educationSchema = zod_1.z.object({
    id: zod_1.z.number().optional(),
    degree: zod_1.z.string().optional(),
    fieldOfStudy: zod_1.z.string().optional(),
    collegeUniversity: zod_1.z.string().optional(),
    startYear: zod_1.z.number().optional(),
    graduationYear: zod_1.z.number().optional(),
    cgpaPercentage: zod_1.z.number().optional(),
    isCurrentlyStudying: zod_1.z.boolean().optional(),
    description: zod_1.z.string().optional(),
    sortOrder: zod_1.z.number().optional(),
});
const experienceSchema = zod_1.z.object({
    id: zod_1.z.number().optional(),
    company: zod_1.z.string().optional(),
    jobTitle: zod_1.z.string().optional(),
    employmentType: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
    isCurrentlyWorking: zod_1.z.boolean().optional(),
    responsibilities: zod_1.z.string().optional(),
    achievements: zod_1.z.string().optional(),
    technologies: zod_1.z.array(zod_1.z.string()).optional(),
    isInternship: zod_1.z.boolean().optional(),
    sortOrder: zod_1.z.number().optional(),
});
const skillEntrySchema = zod_1.z.object({
    id: zod_1.z.number().optional(),
    skillName: zod_1.z.string(),
    category: zod_1.z.enum(['TECHNICAL', 'PROGRAMMING_LANGUAGE', 'FRAMEWORK', 'LIBRARY', 'DATABASE', 'CLOUD', 'TOOL', 'SOFT_SKILL', 'OTHER']),
    skillLevel: zod_1.z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional(),
    yearsOfExperience: zod_1.z.number().optional(),
    isAutoFilled: zod_1.z.boolean().optional(),
    sortOrder: zod_1.z.number().optional(),
});
const projectSchema = zod_1.z.object({
    id: zod_1.z.number().optional(),
    projectName: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    role: zod_1.z.string().optional(),
    technologies: zod_1.z.array(zod_1.z.string()).optional(),
    responsibilities: zod_1.z.string().optional(),
    achievements: zod_1.z.string().optional(),
    githubUrl: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    liveDemoUrl: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
    isOngoing: zod_1.z.boolean().optional(),
    sortOrder: zod_1.z.number().optional(),
});
const certificationSchema = zod_1.z.object({
    id: zod_1.z.number().optional(),
    certificationName: zod_1.z.string(),
    issuingOrganization: zod_1.z.string().optional(),
    issueDate: zod_1.z.string().optional(),
    expiryDate: zod_1.z.string().optional(),
    credentialId: zod_1.z.string().optional(),
    credentialUrl: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    certificateUrl: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    sortOrder: zod_1.z.number().optional(),
});
const achievementSchema = zod_1.z.object({
    id: zod_1.z.number().optional(),
    title: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    organization: zod_1.z.string().optional(),
    date: zod_1.z.string().optional(),
    achievementType: zod_1.z.string().optional(),
    proofUrl: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    sortOrder: zod_1.z.number().optional(),
});
const languageSchema = zod_1.z.object({
    id: zod_1.z.number().optional(),
    language: zod_1.z.string(),
    proficiency: zod_1.z.enum(['BASIC', 'CONVERSATIONAL', 'PROFESSIONAL', 'NATIVE', 'FLUENT']),
    sortOrder: zod_1.z.number().optional(),
});
// ─── GET Profile ────────────────────────────────────────
const getProfile = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const profile = await prisma_1.default.profile.findUnique({
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
                (0, ats_service_1.calculateATSScore)(profile.id),
                (0, ats_service_1.calculateProfileCompletion)(profile.id),
            ]);
            atsScoreValue = atsScore.overall;
            completionPercentage = completion.percentage;
            await prisma_1.default.profile.update({
                where: { id: profile.id },
                data: {
                    atsScore: atsScore.overall,
                    atsScoreBreakdown: atsScore,
                    profileCompletion: completion.percentage,
                },
            });
        }
        catch (atsError) {
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
    }
    catch (error) {
        next(error);
    }
};
exports.getProfile = getProfile;
// ─── UPDATE Profile ─────────────────────────────────────
const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const data = updateProfileSchema.parse(req.body);
        // Clean empty strings to null for URL fields
        const urlFields = ['website', 'linkedinUrl', 'githubUrl', 'portfolioUrl'];
        const cleanedData = { ...data };
        for (const field of urlFields) {
            if (cleanedData[field] === '')
                cleanedData[field] = null;
        }
        // Handle date conversion
        if (cleanedData.dateOfBirth) {
            cleanedData.dateOfBirth = new Date(cleanedData.dateOfBirth);
        }
        if (cleanedData.availableFrom) {
            cleanedData.availableFrom = new Date(cleanedData.availableFrom);
        }
        const profile = await prisma_1.default.profile.update({
            where: { userId },
            data: cleanedData,
        });
        // Recalculate ATS score and completion
        const [atsScore, completion] = await Promise.all([
            (0, ats_service_1.calculateATSScore)(profile.id),
            (0, ats_service_1.calculateProfileCompletion)(profile.id),
        ]);
        await prisma_1.default.profile.update({
            where: { id: profile.id },
            data: {
                atsScore: atsScore.overall,
                atsScoreBreakdown: atsScore,
                profileCompletion: completion.percentage,
            },
        });
        res.json({
            success: true,
            data: { ...profile, atsScore, profileCompletion: completion },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProfile = updateProfile;
// ─── Education CRUD ─────────────────────────────────────
const getEducation = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const profile = await prisma_1.default.profile.findUnique({ where: { userId } });
        if (!profile) {
            res.status(404).json({ success: false, message: 'Profile not found' });
            return;
        }
        const education = await prisma_1.default.education.findMany({
            where: { profileId: profile.id },
            orderBy: { sortOrder: 'asc' },
        });
        res.json({ success: true, data: education });
    }
    catch (error) {
        next(error);
    }
};
exports.getEducation = getEducation;
const upsertEducation = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const profile = await prisma_1.default.profile.findUnique({ where: { userId } });
        if (!profile) {
            res.status(404).json({ success: false, message: 'Profile not found' });
            return;
        }
        const data = educationSchema.parse(req.body);
        const { id, ...eduData } = data;
        let education;
        if (id) {
            education = await prisma_1.default.education.update({
                where: { id },
                data: {
                    ...eduData,
                    startYear: eduData.startYear || undefined,
                    graduationYear: eduData.graduationYear || undefined,
                },
            });
        }
        else {
            const maxOrder = await prisma_1.default.education.aggregate({
                where: { profileId: profile.id },
                _max: { sortOrder: true },
            });
            education = await prisma_1.default.education.create({
                data: {
                    profileId: profile.id,
                    ...eduData,
                    sortOrder: (maxOrder._max.sortOrder || 0) + 1,
                },
            });
        }
        res.json({ success: true, data: education });
    }
    catch (error) {
        next(error);
    }
};
exports.upsertEducation = upsertEducation;
const deleteEducation = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const profile = await prisma_1.default.profile.findUnique({ where: { userId } });
        if (!profile) {
            res.status(404).json({ success: false, message: 'Profile not found' });
            return;
        }
        const id = parseInt(String(req.params.id));
        await prisma_1.default.education.deleteMany({ where: { id, profileId: profile.id } });
        res.json({ success: true, message: 'Education deleted' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteEducation = deleteEducation;
// ─── Experience CRUD ────────────────────────────────────
const getExperience = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const profile = await prisma_1.default.profile.findUnique({ where: { userId } });
        if (!profile) {
            res.status(404).json({ success: false, message: 'Profile not found' });
            return;
        }
        const experience = await prisma_1.default.experience.findMany({
            where: { profileId: profile.id },
            orderBy: { sortOrder: 'asc' },
        });
        res.json({ success: true, data: experience });
    }
    catch (error) {
        next(error);
    }
};
exports.getExperience = getExperience;
const upsertExperience = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const profile = await prisma_1.default.profile.findUnique({ where: { userId } });
        if (!profile) {
            res.status(404).json({ success: false, message: 'Profile not found' });
            return;
        }
        const data = experienceSchema.parse(req.body);
        const { id, ...expData } = data;
        const processedData = { ...expData };
        if (processedData.startDate)
            processedData.startDate = new Date(processedData.startDate);
        if (processedData.endDate)
            processedData.endDate = new Date(processedData.endDate);
        let experience;
        if (id) {
            experience = await prisma_1.default.experience.update({
                where: { id },
                data: processedData,
            });
        }
        else {
            const maxOrder = await prisma_1.default.experience.aggregate({
                where: { profileId: profile.id },
                _max: { sortOrder: true },
            });
            experience = await prisma_1.default.experience.create({
                data: {
                    profileId: profile.id,
                    ...processedData,
                    sortOrder: (maxOrder._max.sortOrder || 0) + 1,
                },
            });
        }
        res.json({ success: true, data: experience });
    }
    catch (error) {
        next(error);
    }
};
exports.upsertExperience = upsertExperience;
const deleteExperience = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const profile = await prisma_1.default.profile.findUnique({ where: { userId } });
        if (!profile) {
            res.status(404).json({ success: false, message: 'Profile not found' });
            return;
        }
        const id = parseInt(String(req.params.id));
        await prisma_1.default.experience.deleteMany({ where: { id, profileId: profile.id } });
        res.json({ success: true, message: 'Experience deleted' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteExperience = deleteExperience;
// ─── Skills CRUD ────────────────────────────────────────
const getSkills = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const profile = await prisma_1.default.profile.findUnique({ where: { userId } });
        if (!profile) {
            res.status(404).json({ success: false, message: 'Profile not found' });
            return;
        }
        const skills = await prisma_1.default.skillEntry.findMany({
            where: { profileId: profile.id },
            orderBy: { sortOrder: 'asc' },
        });
        res.json({ success: true, data: skills });
    }
    catch (error) {
        next(error);
    }
};
exports.getSkills = getSkills;
const upsertSkill = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const profile = await prisma_1.default.profile.findUnique({ where: { userId } });
        if (!profile) {
            res.status(404).json({ success: false, message: 'Profile not found' });
            return;
        }
        const data = skillEntrySchema.parse(req.body);
        const { id, ...skillData } = data;
        let skill;
        if (id) {
            skill = await prisma_1.default.skillEntry.update({
                where: { id },
                data: skillData,
            });
        }
        else {
            const maxOrder = await prisma_1.default.skillEntry.aggregate({
                where: { profileId: profile.id },
                _max: { sortOrder: true },
            });
            skill = await prisma_1.default.skillEntry.create({
                data: {
                    profileId: profile.id,
                    ...skillData,
                    sortOrder: (maxOrder._max.sortOrder || 0) + 1,
                },
            });
        }
        res.json({ success: true, data: skill });
    }
    catch (error) {
        next(error);
    }
};
exports.upsertSkill = upsertSkill;
const deleteSkill = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const profile = await prisma_1.default.profile.findUnique({ where: { userId } });
        if (!profile) {
            res.status(404).json({ success: false, message: 'Profile not found' });
            return;
        }
        const id = parseInt(String(req.params.id));
        await prisma_1.default.skillEntry.deleteMany({ where: { id, profileId: profile.id } });
        res.json({ success: true, message: 'Skill deleted' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteSkill = deleteSkill;
// ─── Projects CRUD ──────────────────────────────────────
const getProjects = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const profile = await prisma_1.default.profile.findUnique({ where: { userId } });
        if (!profile) {
            res.status(404).json({ success: false, message: 'Profile not found' });
            return;
        }
        const projects = await prisma_1.default.project.findMany({
            where: { profileId: profile.id },
            orderBy: { sortOrder: 'asc' },
        });
        res.json({ success: true, data: projects });
    }
    catch (error) {
        next(error);
    }
};
exports.getProjects = getProjects;
const upsertProject = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const profile = await prisma_1.default.profile.findUnique({ where: { userId } });
        if (!profile) {
            res.status(404).json({ success: false, message: 'Profile not found' });
            return;
        }
        const data = projectSchema.parse(req.body);
        const { id, ...projectData } = data;
        const processedData = { ...projectData };
        if (processedData.githubUrl === '')
            processedData.githubUrl = null;
        if (processedData.liveDemoUrl === '')
            processedData.liveDemoUrl = null;
        if (processedData.startDate)
            processedData.startDate = new Date(processedData.startDate);
        if (processedData.endDate)
            processedData.endDate = new Date(processedData.endDate);
        let project;
        if (id) {
            project = await prisma_1.default.project.update({
                where: { id },
                data: processedData,
            });
        }
        else {
            const maxOrder = await prisma_1.default.project.aggregate({
                where: { profileId: profile.id },
                _max: { sortOrder: true },
            });
            project = await prisma_1.default.project.create({
                data: {
                    profileId: profile.id,
                    ...processedData,
                    sortOrder: (maxOrder._max.sortOrder || 0) + 1,
                },
            });
        }
        res.json({ success: true, data: project });
    }
    catch (error) {
        next(error);
    }
};
exports.upsertProject = upsertProject;
const deleteProject = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const profile = await prisma_1.default.profile.findUnique({ where: { userId } });
        if (!profile) {
            res.status(404).json({ success: false, message: 'Profile not found' });
            return;
        }
        const id = parseInt(String(req.params.id));
        await prisma_1.default.project.deleteMany({ where: { id, profileId: profile.id } });
        res.json({ success: true, message: 'Project deleted' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteProject = deleteProject;
// ─── Certifications CRUD ────────────────────────────────
const getCertifications = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const profile = await prisma_1.default.profile.findUnique({ where: { userId } });
        if (!profile) {
            res.status(404).json({ success: false, message: 'Profile not found' });
            return;
        }
        const certifications = await prisma_1.default.certification.findMany({
            where: { profileId: profile.id },
            orderBy: { sortOrder: 'asc' },
        });
        res.json({ success: true, data: certifications });
    }
    catch (error) {
        next(error);
    }
};
exports.getCertifications = getCertifications;
const upsertCertification = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const profile = await prisma_1.default.profile.findUnique({ where: { userId } });
        if (!profile) {
            res.status(404).json({ success: false, message: 'Profile not found' });
            return;
        }
        const data = certificationSchema.parse(req.body);
        const { id, ...certData } = data;
        const processedData = { ...certData };
        if (processedData.credentialUrl === '')
            processedData.credentialUrl = null;
        if (processedData.certificateUrl === '')
            processedData.certificateUrl = null;
        if (processedData.issueDate)
            processedData.issueDate = new Date(processedData.issueDate);
        if (processedData.expiryDate)
            processedData.expiryDate = new Date(processedData.expiryDate);
        let cert;
        if (id) {
            cert = await prisma_1.default.certification.update({
                where: { id },
                data: processedData,
            });
        }
        else {
            const maxOrder = await prisma_1.default.certification.aggregate({
                where: { profileId: profile.id },
                _max: { sortOrder: true },
            });
            cert = await prisma_1.default.certification.create({
                data: {
                    profileId: profile.id,
                    ...processedData,
                    sortOrder: (maxOrder._max.sortOrder || 0) + 1,
                },
            });
        }
        res.json({ success: true, data: cert });
    }
    catch (error) {
        next(error);
    }
};
exports.upsertCertification = upsertCertification;
const deleteCertification = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const profile = await prisma_1.default.profile.findUnique({ where: { userId } });
        if (!profile) {
            res.status(404).json({ success: false, message: 'Profile not found' });
            return;
        }
        const id = parseInt(String(req.params.id));
        await prisma_1.default.certification.deleteMany({ where: { id, profileId: profile.id } });
        res.json({ success: true, message: 'Certification deleted' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCertification = deleteCertification;
// ─── Achievements CRUD ──────────────────────────────────
const getAchievements = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const profile = await prisma_1.default.profile.findUnique({ where: { userId } });
        if (!profile) {
            res.status(404).json({ success: false, message: 'Profile not found' });
            return;
        }
        const achievements = await prisma_1.default.achievement.findMany({
            where: { profileId: profile.id },
            orderBy: { sortOrder: 'asc' },
        });
        res.json({ success: true, data: achievements });
    }
    catch (error) {
        next(error);
    }
};
exports.getAchievements = getAchievements;
const upsertAchievement = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const profile = await prisma_1.default.profile.findUnique({ where: { userId } });
        if (!profile) {
            res.status(404).json({ success: false, message: 'Profile not found' });
            return;
        }
        const data = achievementSchema.parse(req.body);
        const { id, ...achData } = data;
        const processedData = { ...achData };
        if (processedData.proofUrl === '')
            processedData.proofUrl = null;
        if (processedData.date)
            processedData.date = new Date(processedData.date);
        let achievement;
        if (id) {
            achievement = await prisma_1.default.achievement.update({
                where: { id },
                data: processedData,
            });
        }
        else {
            const maxOrder = await prisma_1.default.achievement.aggregate({
                where: { profileId: profile.id },
                _max: { sortOrder: true },
            });
            achievement = await prisma_1.default.achievement.create({
                data: {
                    profileId: profile.id,
                    ...processedData,
                    sortOrder: (maxOrder._max.sortOrder || 0) + 1,
                },
            });
        }
        res.json({ success: true, data: achievement });
    }
    catch (error) {
        next(error);
    }
};
exports.upsertAchievement = upsertAchievement;
const deleteAchievement = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const profile = await prisma_1.default.profile.findUnique({ where: { userId } });
        if (!profile) {
            res.status(404).json({ success: false, message: 'Profile not found' });
            return;
        }
        const id = parseInt(String(req.params.id));
        await prisma_1.default.achievement.deleteMany({ where: { id, profileId: profile.id } });
        res.json({ success: true, message: 'Achievement deleted' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteAchievement = deleteAchievement;
// ─── Languages CRUD ─────────────────────────────────────
const getLanguages = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const profile = await prisma_1.default.profile.findUnique({ where: { userId } });
        if (!profile) {
            res.status(404).json({ success: false, message: 'Profile not found' });
            return;
        }
        const languages = await prisma_1.default.language.findMany({
            where: { profileId: profile.id },
            orderBy: { sortOrder: 'asc' },
        });
        res.json({ success: true, data: languages });
    }
    catch (error) {
        next(error);
    }
};
exports.getLanguages = getLanguages;
const upsertLanguage = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const profile = await prisma_1.default.profile.findUnique({ where: { userId } });
        if (!profile) {
            res.status(404).json({ success: false, message: 'Profile not found' });
            return;
        }
        const data = languageSchema.parse(req.body);
        const { id, ...langData } = data;
        let language;
        if (id) {
            language = await prisma_1.default.language.update({
                where: { id },
                data: langData,
            });
        }
        else {
            const maxOrder = await prisma_1.default.language.aggregate({
                where: { profileId: profile.id },
                _max: { sortOrder: true },
            });
            language = await prisma_1.default.language.create({
                data: {
                    profileId: profile.id,
                    ...langData,
                    sortOrder: (maxOrder._max.sortOrder || 0) + 1,
                },
            });
        }
        res.json({ success: true, data: language });
    }
    catch (error) {
        next(error);
    }
};
exports.upsertLanguage = upsertLanguage;
const deleteLanguage = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const profile = await prisma_1.default.profile.findUnique({ where: { userId } });
        if (!profile) {
            res.status(404).json({ success: false, message: 'Profile not found' });
            return;
        }
        const id = parseInt(String(req.params.id));
        await prisma_1.default.language.deleteMany({ where: { id, profileId: profile.id } });
        res.json({ success: true, message: 'Language deleted' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteLanguage = deleteLanguage;
// ─── Resume Upload ──────────────────────────────────────
const uploadResumeFile = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const profile = await prisma_1.default.profile.findUnique({ where: { userId } });
        if (!profile) {
            res.status(404).json({ success: false, message: 'Profile not found' });
            return;
        }
        if (!req.file) {
            res.status(400).json({ success: false, message: 'No file uploaded' });
            return;
        }
        // Delete existing resume if any
        const existingResume = await prisma_1.default.resume.findUnique({ where: { profileId: profile.id } });
        if (existingResume) {
            const oldPath = path_1.default.join(process.cwd(), 'uploads', 'resumes', path_1.default.basename(existingResume.fileUrl));
            if (fs_1.default.existsSync(oldPath))
                fs_1.default.unlinkSync(oldPath);
            await prisma_1.default.resume.delete({ where: { profileId: profile.id } });
        }
        // Read and parse text content if it's a .txt file
        let parsedData = null;
        if (req.file.originalname.endsWith('.txt')) {
            const text = fs_1.default.readFileSync(req.file.path, 'utf-8');
            const { parseResumeText } = await Promise.resolve().then(() => __importStar(require('../services/resumeParser')));
            parsedData = parseResumeText(text);
        }
        const resume = await prisma_1.default.resume.create({
            data: {
                profileId: profile.id,
                fileName: req.file.originalname,
                fileUrl: `/uploads/resumes/${req.file.filename}`,
                fileSize: req.file.size,
                mimeType: req.file.mimetype,
                parsedData: parsedData,
                version: (existingResume?.version || 0) + 1,
            },
        });
        // Update profile resume fields
        await prisma_1.default.profile.update({
            where: { id: profile.id },
            data: {
                resumeUrl: resume.fileUrl,
                resumeName: resume.fileName,
                resumeUploadedAt: new Date(),
                resumeVersion: resume.version,
            },
        });
        // Auto-fill profile from parsed data if available
        let autoFilled = [];
        if (parsedData) {
            const profileUpdates = {};
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
                await prisma_1.default.profile.update({ where: { id: profile.id }, data: profileUpdates });
            }
            // Auto-fill skills
            if (parsedData.skills && parsedData.skills.length > 0) {
                const existingSkills = await prisma_1.default.skillEntry.findMany({ where: { profileId: profile.id } });
                if (existingSkills.length === 0) {
                    const maxOrder = await prisma_1.default.skillEntry.aggregate({
                        where: { profileId: profile.id },
                        _max: { sortOrder: true },
                    });
                    let order = (maxOrder._max.sortOrder || 0) + 1;
                    await prisma_1.default.skillEntry.createMany({
                        data: parsedData.skills.map((skill) => ({
                            profileId: profile.id,
                            skillName: skill,
                            category: 'TECHNICAL',
                            isAutoFilled: true,
                            sortOrder: order++,
                        })),
                    });
                    autoFilled.push('Skills');
                }
            }
            // Auto-fill education
            if (parsedData.education && parsedData.education.length > 0) {
                const existingEdu = await prisma_1.default.education.findMany({ where: { profileId: profile.id } });
                if (existingEdu.length === 0) {
                    const maxOrder = await prisma_1.default.education.aggregate({
                        where: { profileId: profile.id },
                        _max: { sortOrder: true },
                    });
                    let order = (maxOrder._max.sortOrder || 0) + 1;
                    for (const edu of parsedData.education) {
                        await prisma_1.default.education.create({
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
                const existingExp = await prisma_1.default.experience.findMany({ where: { profileId: profile.id } });
                if (existingExp.length === 0) {
                    const maxOrder = await prisma_1.default.experience.aggregate({
                        where: { profileId: profile.id },
                        _max: { sortOrder: true },
                    });
                    let order = (maxOrder._max.sortOrder || 0) + 1;
                    for (const exp of parsedData.experience) {
                        await prisma_1.default.experience.create({
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
                const existingProjects = await prisma_1.default.project.findMany({ where: { profileId: profile.id } });
                if (existingProjects.length === 0) {
                    const maxOrder = await prisma_1.default.project.aggregate({
                        where: { profileId: profile.id },
                        _max: { sortOrder: true },
                    });
                    let order = (maxOrder._max.sortOrder || 0) + 1;
                    for (const proj of parsedData.projects) {
                        await prisma_1.default.project.create({
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
            (0, ats_service_1.calculateATSScore)(profile.id),
            (0, ats_service_1.calculateProfileCompletion)(profile.id),
        ]);
        await prisma_1.default.profile.update({
            where: { id: profile.id },
            data: {
                atsScore: atsScore.overall,
                atsScoreBreakdown: atsScore,
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
    }
    catch (error) {
        next(error);
    }
};
exports.uploadResumeFile = uploadResumeFile;
// ─── ATS Score ──────────────────────────────────────────
const getATSScore = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const profile = await prisma_1.default.profile.findUnique({ where: { userId } });
        if (!profile) {
            res.status(404).json({ success: false, message: 'Profile not found' });
            return;
        }
        const atsScore = await (0, ats_service_1.calculateATSScore)(profile.id);
        await prisma_1.default.profile.update({
            where: { id: profile.id },
            data: {
                atsScore: atsScore.overall,
                atsScoreBreakdown: atsScore,
            },
        });
        res.json({ success: true, data: atsScore });
    }
    catch (error) {
        next(error);
    }
};
exports.getATSScore = getATSScore;
// ─── Profile Completion ─────────────────────────────────
const getProfileCompletion = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const profile = await prisma_1.default.profile.findUnique({ where: { userId } });
        if (!profile) {
            res.status(404).json({ success: false, message: 'Profile not found' });
            return;
        }
        const completion = await (0, ats_service_1.calculateProfileCompletion)(profile.id);
        await prisma_1.default.profile.update({
            where: { id: profile.id },
            data: { profileCompletion: completion.percentage },
        });
        res.json({ success: true, data: completion });
    }
    catch (error) {
        next(error);
    }
};
exports.getProfileCompletion = getProfileCompletion;
