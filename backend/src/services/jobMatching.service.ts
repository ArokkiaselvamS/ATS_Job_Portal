import prisma from '../utils/prisma';
import { JobType, WorkMode, CandidateType, JobStatus } from '@prisma/client';

// ─── INTERFACES ───────────────────────────────────────────

interface MatchBreakdown {
  skills: number;
  experience: number;
  jobTitle: number;
  education: number;
  location: number;
  workMode: number;
  jobType: number;
  overall: number;
}

interface JobMatchResult {
  jobId: number;
  matchScore: number;
  breakdown: MatchBreakdown;
  matchingSkills: string[];
  missingSkills: string[];
  reasons: string[];
}

interface CacheEntry {
  results: JobMatchResult[];
  timestamp: number;
}

// ─── CACHE ────────────────────────────────────────────────

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const cache = new Map<number, CacheEntry>();

// ─── CONSTANTS ────────────────────────────────────────────

const WEIGHTS = {
  skills: 0.40,
  experience: 0.20,
  jobTitle: 0.15,
  education: 0.10,
  location: 0.05,
  workMode: 0.05,
  jobType: 0.05,
} as const;

const MIN_MATCH_SCORE = 70;

const EXPERIENCE_LEVEL_ORDER: Record<string, number> = {
  'entry level': 1,
  'entry': 1,
  'fresher': 1,
  'junior': 1,
  'mid level': 2,
  'mid': 2,
  'intermediate': 2,
  'senior level': 3,
  'senior': 3,
  'lead': 4,
  'principal': 4,
  'staff': 4,
  'director': 5,
  'vp': 5,
  'executive': 5,
  'cto': 5,
  'ceo': 5,
};

const EDUCATION_LEVEL_ORDER: Record<string, number> = {
  'high school': 1,
  'diploma': 2,
  'associate': 3,
  'bachelor': 4,
  'bachelors': 4,
  'b.sc': 4,
  'btech': 4,
  'b.e.': 4,
  'master': 5,
  'masters': 5,
  'm.sc': 5,
  'mba': 5,
  'mtech': 5,
  'm.e.': 5,
  'phd': 6,
  'doctorate': 6,
  'doctoral': 6,
};

// ─── HELPERS ──────────────────────────────────────────────

function normalizeString(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s+#.]/g, '')
    .replace(/\s+/g, ' ');
}

function extractSkillNames(skills: { skillName: string }[]): string[] {
  return skills.map(s => normalizeString(s.skillName));
}

function computeExperienceYears(experiences: {
  startDate?: Date | null;
  endDate?: Date | null;
  isCurrentlyWorking?: boolean | null;
}[]): number {
  let totalMonths = 0;
  const now = new Date();

  for (const exp of experiences) {
    if (!exp.startDate) continue;
    const start = new Date(exp.startDate);
    const end = exp.isCurrentlyWorking ? now : exp.endDate ? new Date(exp.endDate) : now;
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    totalMonths += Math.max(0, months);
  }

  return totalMonths / 12;
}

function getExperienceLevelKey(level: string | null | undefined): string {
  if (!level) return '';
  return normalizeString(level);
}

function getHighestEducation(edu: { degree?: string | null | undefined }[]): number {
  let highest = 0;
  for (const e of edu) {
    if (!e.degree) continue;
    const normalized = normalizeString(e.degree);
    for (const [key, val] of Object.entries(EDUCATION_LEVEL_ORDER)) {
      if (normalized.includes(key) && val > highest) {
        highest = val;
      }
    }
  }
  return highest;
}

function getEducationLevelFromJob(jobRequirements: string | null | undefined): number {
  if (!jobRequirements) return 0;
  const normalized = normalizeString(jobRequirements);
  let highest = 0;
  for (const [key, val] of Object.entries(EDUCATION_LEVEL_ORDER)) {
    if (normalized.includes(key) && val > highest) {
      highest = val;
    }
  }
  return highest;
}

function matchesLocation(
  profileLocation: string | null | undefined,
  profileCity: string | null | undefined,
  profileCountry: string | null | undefined,
  profilePreferredLocations: string[],
  jobLocation: string | null | undefined,
  jobCity: string | null | undefined,
  jobCountry: string | null | undefined,
): boolean {
  if (!jobLocation && !jobCity && !jobCountry) return true;

  const normProfileLoc = normalizeString(profileLocation || '');
  const normProfileCity = normalizeString(profileCity || '');
  const normProfileCountry = normalizeString(profileCountry || '');
  const normJobLoc = normalizeString(jobLocation || '');
  const normJobCity = normalizeString(jobCity || '');
  const normJobCountry = normalizeString(jobCountry || '');

  if (normJobCity && normProfileCity === normJobCity) return true;
  if (normJobLoc && normProfileLoc.includes(normJobLoc)) return true;
  if (normJobCountry && normProfileCountry === normJobCountry) return true;

  for (const preferred of profilePreferredLocations) {
    const normPreferred = normalizeString(preferred);
    if (normJobCity && normPreferred.includes(normJobCity)) return true;
    if (normJobLoc && normPreferred.includes(normJobLoc)) return true;
    if (normJobCountry && normPreferred.includes(normJobCountry)) return true;
  }

  return false;
}

// ─── MATCH SCORE CALCULATION ─────────────────────────────

function calculateMatchForJob(
  profile: {
    skills: { skillName: string; skillLevel?: string | null; yearsOfExperience?: number | null }[];
    experience: {
      jobTitle?: string | null;
      startDate?: Date | null;
      endDate?: Date | null;
      isCurrentlyWorking?: boolean | null;
      technologies?: string[];
    }[];
    education: { degree?: string | null; fieldOfStudy?: string | null }[];
    projects: { technologies?: string[] }[];
    candidateType?: CandidateType | null;
    professionalHeadline?: string | null;
    targetJobTitles?: string[];
    location?: string | null;
    city?: string | null;
    country?: string | null;
    preferredLocations?: string[];
    workModePreference?: WorkMode[];
    employmentTypePref?: JobType[];
  },
  job: {
    id: number;
    title: string;
    skills: string[];
    experienceLevel?: string | null;
    description?: string;
    jobType: JobType;
    workMode: WorkMode;
    location?: string | null;
    city?: string | null;
    country?: string | null;
  },
): {
  breakdown: MatchBreakdown;
  matchingSkills: string[];
  missingSkills: string[];
  reasons: string[];
} {
  const reasons: string[] = [];

  // ── Skills (40%) ──────────────────────────────────────
  const profileSkillNames = extractSkillNames(profile.skills);
  const jobSkillNames = job.skills.map(s => normalizeString(s));

  const matchingSkills: string[] = [];
  const missingSkills: string[] = [];

  if (jobSkillNames.length > 0) {
    for (const jobSkill of jobSkillNames) {
      const matched = profileSkillNames.some(ps =>
        ps === jobSkill ||
        ps.includes(jobSkill) ||
        jobSkill.includes(ps)
      );
      if (matched) {
        matchingSkills.push(jobSkill);
      } else {
        missingSkills.push(jobSkill);
      }
    }

    // Also check technologies from experience and projects
    const expTechs: string[] = [];
    for (const exp of profile.experience) {
      if (exp.technologies) {
        expTechs.push(...exp.technologies.map(t => normalizeString(t)));
      }
    }
    const projTechs: string[] = [];
    for (const proj of profile.projects) {
      if (proj.technologies) {
        projTechs.push(...proj.technologies.map(t => normalizeString(t)));
      }
    }
    const allTechs = [...new Set([...expTechs, ...projTechs])];

    for (const missing of [...missingSkills]) {
      const matched = allTechs.some(tech =>
        tech === missing ||
        tech.includes(missing) ||
        missing.includes(tech)
      );
      if (matched) {
        matchingSkills.push(missing);
        missingSkills.splice(missingSkills.indexOf(missing), 1);
      }
    }
  }

  const skillsScore = jobSkillNames.length > 0
    ? (matchingSkills.length / jobSkillNames.length) * 100
    : 50; // neutral if no skills listed

  if (matchingSkills.length > 0) {
    reasons.push(`Matches ${matchingSkills.length}/${jobSkillNames.length} required skills`);
  }

  // ── Experience (20%) ──────────────────────────────────
  const profileExpYears = computeExperienceYears(profile.experience);
  const jobExpLevel = getExperienceLevelKey(job.experienceLevel);
  const jobExpLevelNum = EXPERIENCE_LEVEL_ORDER[jobExpLevel] || 2;

  let experienceScore = 50; // default neutral
  if (jobExpLevelNum === 1 && profile.candidateType === 'STUDENT_FRESHER') {
    experienceScore = 90;
    reasons.push('Candidate type matches entry-level requirement');
  } else if (profileExpYears === 0 && jobExpLevelNum <= 2) {
    experienceScore = 70;
  } else if (profileExpYears > 0) {
    // Map years to levels: 0-1yr=1, 1-3yr=2, 3-6yr=3, 6-10yr=4, 10+=5
    const yearsLevel = profileExpYears <= 1 ? 1 : profileExpYears <= 3 ? 2 : profileExpYears <= 6 ? 3 : profileExpYears <= 10 ? 4 : 5;
    const diff = Math.abs(yearsLevel - jobExpLevelNum);
    if (diff === 0) {
      experienceScore = 100;
      reasons.push(`Experience level (${profileExpYears.toFixed(1)} years) matches job requirement`);
    } else if (diff === 1) {
      experienceScore = 70;
    } else {
      experienceScore = Math.max(20, 100 - diff * 25);
    }
  } else {
    // No experience but not fresh entry-level
    experienceScore = jobExpLevelNum <= 2 ? 60 : 30;
  }

  // ── Job Title (15%) ───────────────────────────────────
  const normJobTitle = normalizeString(job.title);
  let jobTitleScore = 0;

  const headline = normalizeString(profile.professionalHeadline || '');
  const titles = (profile.targetJobTitles || []).map(t => normalizeString(t));

  // Check headline
  if (headline && (normJobTitle.includes(headline) || headline.includes(normJobTitle))) {
    jobTitleScore = 100;
  }

  // Check target job titles
  if (jobTitleScore < 100) {
    for (const title of titles) {
      if (title && (normJobTitle.includes(title) || title.includes(normJobTitle))) {
        jobTitleScore = Math.max(jobTitleScore, 90);
        break;
      }
      // Fuzzy: check word overlap
      const titleWords = title.split(' ').filter(w => w.length > 2);
      const jobWords = normJobTitle.split(' ').filter(w => w.length > 2);
      const overlap = titleWords.filter(w => jobWords.includes(w)).length;
      if (titleWords.length > 0 && overlap > 0) {
        const wordScore = (overlap / Math.max(titleWords.length, jobWords.length)) * 80;
        jobTitleScore = Math.max(jobTitleScore, wordScore);
      }
    }
  }

  // Check experience job titles
  if (jobTitleScore < 100) {
    for (const exp of profile.experience) {
      if (exp.jobTitle) {
        const normExpTitle = normalizeString(exp.jobTitle);
        if (normJobTitle.includes(normExpTitle) || normExpTitle.includes(normJobTitle)) {
          jobTitleScore = Math.max(jobTitleScore, 85);
          break;
        }
        const expWords = normExpTitle.split(' ').filter(w => w.length > 2);
        const jobWords = normJobTitle.split(' ').filter(w => w.length > 2);
        const overlap = expWords.filter(w => jobWords.includes(w)).length;
        if (expWords.length > 0 && overlap > 0) {
          const wordScore = (overlap / Math.max(expWords.length, jobWords.length)) * 70;
          jobTitleScore = Math.max(jobTitleScore, wordScore);
        }
      }
    }
  }

  if (jobTitleScore > 0) {
    reasons.push('Job title aligns with career profile');
  }

  // ── Education (10%) ───────────────────────────────────
  const profileEduLevel = getHighestEducation(profile.education);
  const jobEduLevel = getEducationLevelFromJob(job.description || job.experienceLevel);
  let educationScore = 50;

  if (jobEduLevel === 0) {
    educationScore = 80; // no requirement specified, neutral-positive
  } else if (profileEduLevel >= jobEduLevel) {
    educationScore = 100;
    reasons.push('Education level meets or exceeds job requirement');
  } else if (profileEduLevel === jobEduLevel - 1) {
    educationScore = 65;
  } else {
    educationScore = Math.max(20, 80 - (jobEduLevel - profileEduLevel) * 20);
  }

  // ── Location (5%) ─────────────────────────────────────
  const locationMatch = matchesLocation(
    profile.location,
    profile.city,
    profile.country,
    profile.preferredLocations || [],
    job.location,
    job.city,
    job.country,
  );
  const locationScore = locationMatch ? 100 : 20;

  if (locationMatch && (job.city || job.location)) {
    reasons.push('Location matches your preferences');
  }

  // ── Work Mode (5%) ────────────────────────────────────
  let workModeScore = 50;
  if (profile.workModePreference && profile.workModePreference.length > 0) {
    if (profile.workModePreference.includes(job.workMode)) {
      workModeScore = 100;
      reasons.push(`Work mode (${job.workMode.toLowerCase()}) matches your preference`);
    } else {
      workModeScore = 30;
    }
  } else {
    workModeScore = 80; // no preference, neutral
  }

  // ── Job Type (5%) ─────────────────────────────────────
  let jobTypeScore = 50;
  if (profile.employmentTypePref && profile.employmentTypePref.length > 0) {
    if (profile.employmentTypePref.includes(job.jobType)) {
      jobTypeScore = 100;
      reasons.push(`Employment type (${job.jobType.replace('_', ' ').toLowerCase()}) matches your preference`);
    } else {
      jobTypeScore = 30;
    }
  } else {
    jobTypeScore = 80; // no preference, neutral
  }

  // ── Overall ───────────────────────────────────────────
  const overall = Math.round(
    skillsScore * WEIGHTS.skills +
    experienceScore * WEIGHTS.experience +
    jobTitleScore * WEIGHTS.jobTitle +
    educationScore * WEIGHTS.education +
    locationScore * WEIGHTS.location +
    workModeScore * WEIGHTS.workMode +
    jobTypeScore * WEIGHTS.jobType
  );

  return {
    breakdown: {
      skills: Math.round(skillsScore),
      experience: Math.round(experienceScore),
      jobTitle: Math.round(jobTitleScore),
      education: Math.round(educationScore),
      location: Math.round(locationScore),
      workMode: Math.round(workModeScore),
      jobType: Math.round(jobTypeScore),
      overall,
    },
    matchingSkills,
    missingSkills,
    reasons,
  };
}

// ─── PUBLIC FUNCTIONS ────────────────────────────────────

export async function getMatchesForUser(userId: number): Promise<JobMatchResult[]> {
  // Check cache first
  const cached = cache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.results;
  }

  // Load user profile with related data
  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: {
      skills: true,
      experience: { orderBy: { sortOrder: 'asc' } },
      education: { orderBy: { sortOrder: 'asc' } },
      projects: { orderBy: { sortOrder: 'asc' } },
      certifications: true,
    },
  });

  if (!profile) {
    return [];
  }

  // Load all active jobs
  const activeJobs = await prisma.job.findMany({
    where: {
      status: { in: [JobStatus.ACTIVE, JobStatus.PUBLISHED] },
    },
    orderBy: { postedAt: 'desc' },
  });

  // Calculate matches for each job
  const results: JobMatchResult[] = [];

  for (const job of activeJobs) {
    const { breakdown, matchingSkills, missingSkills, reasons } = calculateMatchForJob(
      {
        skills: profile.skills,
        experience: profile.experience,
        education: profile.education,
        projects: profile.projects,
        candidateType: profile.candidateType,
        professionalHeadline: profile.professionalHeadline,
        targetJobTitles: profile.targetJobTitles,
        location: profile.location,
        city: profile.city,
        country: profile.country,
        preferredLocations: profile.preferredLocations,
        workModePreference: profile.workModePreference,
        employmentTypePref: profile.employmentTypePref,
      },
      {
        id: job.id,
        title: job.title,
        skills: job.skills,
        experienceLevel: job.experienceLevel,
        description: job.description,
        jobType: job.jobType,
        workMode: job.workMode,
        location: job.location,
        city: job.city,
        country: job.country,
      },
    );

    if (breakdown.overall >= MIN_MATCH_SCORE) {
      results.push({
        jobId: job.id,
        matchScore: breakdown.overall,
        breakdown,
        matchingSkills,
        missingSkills,
        reasons,
      });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.matchScore - a.matchScore);

  // Store in cache
  cache.set(userId, {
    results,
    timestamp: Date.now(),
  });

  return results;
}

export async function getMatchForJob(
  userId: number,
  jobId: number,
): Promise<JobMatchResult | null> {
  // Load user profile
  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: {
      skills: true,
      experience: { orderBy: { sortOrder: 'asc' } },
      education: { orderBy: { sortOrder: 'asc' } },
      projects: { orderBy: { sortOrder: 'asc' } },
      certifications: true,
    },
  });

  if (!profile) {
    return null;
  }

  // Load specific job
  const job = await prisma.job.findUnique({
    where: { id: jobId },
  });

  if (!job) {
    return null;
  }

  // Check if job is active
  if (job.status !== JobStatus.ACTIVE && job.status !== JobStatus.PUBLISHED) {
    return null;
  }

  const { breakdown, matchingSkills, missingSkills, reasons } = calculateMatchForJob(
    {
      skills: profile.skills,
      experience: profile.experience,
      education: profile.education,
      projects: profile.projects,
      candidateType: profile.candidateType,
      professionalHeadline: profile.professionalHeadline,
      targetJobTitles: profile.targetJobTitles,
      location: profile.location,
      city: profile.city,
      country: profile.country,
      preferredLocations: profile.preferredLocations,
      workModePreference: profile.workModePreference,
      employmentTypePref: profile.employmentTypePref,
    },
    {
      id: job.id,
      title: job.title,
      skills: job.skills,
      experienceLevel: job.experienceLevel,
      description: job.description,
      jobType: job.jobType,
      workMode: job.workMode,
      location: job.location,
      city: job.city,
      country: job.country,
    },
  );

  return {
    jobId: job.id,
    matchScore: breakdown.overall,
    breakdown,
    matchingSkills,
    missingSkills,
    reasons,
  };
}

export function invalidateCache(userId: number): void {
  cache.delete(userId);
}

export function clearCache(): void {
  cache.clear();
}

// Periodic cleanup of expired cache entries (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [userId, entry] of cache.entries()) {
    if (now - entry.timestamp >= CACHE_TTL_MS) {
      cache.delete(userId);
    }
  }
}, 5 * 60 * 1000);
