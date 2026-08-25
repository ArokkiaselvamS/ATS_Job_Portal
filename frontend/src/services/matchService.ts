/* ────────────────────────────────────────────
   Extended job data + ATS Profile matching engine.
   Calculates granular match scores between a
   candidate's ATS Profile and every job listing.
   ──────────────────────────────────────────── */

// ── Extended Job Interface ──
export interface MatchJob {
  id: number;
  title: string;
  company: string;
  location: string;
  workMode: "Remote" | "Hybrid" | "On-site";
  jobType: "Full Time" | "Part Time" | "Internship" | "Contract";
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  skills: string[];
  experienceRequired: string;
  experienceYears: number;
  educationRequired: string;
  industry: string;
  department: string;
  description: string;
  responsibilities: string[];
  postedAt: string;
  applicationsCount: number;
  isFeatured: boolean;
}

// ── Match Breakdown ──
export interface MatchBreakdown {
  skills: number;
  experience: number;
  education: number;
  projects: number;
  certifications: number;
  location: number;
  jobTitle: number;
  overall: number;
}

// ── Job Match Result ──
export interface JobMatchResult {
  job: MatchJob;
  match: MatchBreakdown;
  matchingSkills: string[];
  missingSkills: string[];
  whyThisJob: string[];
  missingGaps: string[];
}

// ── Profile shape (subset used for matching) ──
interface MatchProfile {
  targetJobTitles?: string[];
  professionalHeadline?: string;
  professionalSummary?: string;
  preferredIndustry?: string;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  preferredLocations?: string[];
  willingToRelocate?: boolean;
  workModePreference?: string[];
  candidateType?: string;
  careerLevel?: string;
  skills: { skillName: string; category?: string; skillLevel?: string }[];
  education: { degree?: string; fieldOfStudy?: string; collegeUniversity?: string; cgpaPercentage?: number }[];
  experience: { jobTitle?: string; company?: string; technologies?: string[]; responsibilities?: string; location?: string }[];
  projects: { projectName?: string; description?: string; technologies?: string[] }[];
  certifications: { certificationName?: string; issuingOrganization?: string }[];
}

// ── Extended Jobs Dataset ──
// Jobs are loaded dynamically from the backend / job-feed API.
// This array is populated at runtime — no hardcoded job data.
export const matchJobs: MatchJob[] = [];

// ── Matching Algorithm ──

/** Normalise a string for fuzzy comparison */
function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}

/** Simple Levenshtein-based similarity (0-1) */
function similarity(a: string, b: string): number {
  const na = norm(a);
  const nb = norm(b);
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.85;

  const la = na.length;
  const lb = nb.length;
  if (la === 0 || lb === 0) return 0;

  const matrix: number[][] = Array.from({ length: la + 1 }, () => Array(lb + 1).fill(0));
  for (let i = 0; i <= la; i++) matrix[i][0] = i;
  for (let j = 0; j <= lb; j++) matrix[0][j] = j;

  for (let i = 1; i <= la; i++) {
    for (let j = 1; j <= lb; j++) {
      const cost = na[i - 1] === nb[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }
  const maxLen = Math.max(la, lb);
  return 1 - matrix[la][lb] / maxLen;
}

/** Check if two strings match (exact or high similarity) */
function stringsMatch(a: string, b: string, threshold = 0.7): boolean {
  return similarity(a, b) >= threshold;
}

/** Match skills: returns [matchedSkills, score] */
function matchSkills(
  profileSkills: { skillName: string; skillLevel?: string }[],
  jobSkills: string[],
): { matched: string[]; missing: string[]; score: number } {
  if (jobSkills.length === 0) return { matched: [], missing: [], score: 100 };
  if (profileSkills.length === 0) return { matched: [], missing: [...jobSkills], score: 0 };

  const profileSkillNames = profileSkills.map((s) => s.skillName);
  const matched: string[] = [];
  const missing: string[] = [];

  for (const js of jobSkills) {
    let bestMatch = false;
    for (const ps of profileSkillNames) {
      if (stringsMatch(ps, js)) {
        bestMatch = true;
        break;
      }
    }
    if (bestMatch) matched.push(js);
    else missing.push(js);
  }

  const score = Math.round((matched.length / jobSkills.length) * 100);
  return { matched, missing, score };
}

/** Match experience */
function matchExperience(
  profileExperience: { jobTitle?: string; technologies?: string[] }[],
  profileCandidateType?: string,
  jobExperienceYears = 0,
  jobTitle = "",
): number {
  if (profileCandidateType === "STUDENT_FRESHER") {
    if (jobExperienceYears <= 1) return 100;
    if (jobExperienceYears <= 2) return 60;
    if (jobExperienceYears <= 3) return 30;
    return 10;
  }

  const years = profileExperience.length;
  if (years === 0) return jobExperienceYears <= 1 ? 80 : 20;

  let score = 50;

  // Base experience years match
  if (years >= jobExperienceYears) score = 90;
  else if (years >= jobExperienceYears - 1) score = 75;
  else if (years >= jobExperienceYears - 2) score = 55;
  else score = 30;

  // Bonus: relevant job title match
  if (profileExperience.length > 0 && jobTitle) {
    const hasRelevantTitle = profileExperience.some((e) =>
      e.jobTitle && stringsMatch(e.jobTitle, jobTitle, 0.5)
    );
    if (hasRelevantTitle) score = Math.min(100, score + 15);
  }

  return Math.min(100, score);
}

/** Match education */
function matchEducation(
  profileEducation: { degree?: string; fieldOfStudy?: string }[],
  jobEducationRequired: string,
): number {
  if (!jobEducationRequired || profileEducation.length === 0) return 70;

  const reqLower = jobEducationRequired.toLowerCase();

  // Check if any profile education matches
  for (const edu of profileEducation) {
    const degree = (edu.degree || "").toLowerCase();
    const field = (edu.fieldOfStudy || "").toLowerCase();

    // Master's or higher match
    if (reqLower.includes("master") && (degree.includes("master") || degree.includes("m.tech") || degree.includes("mca"))) return 100;
    // Bachelor's match
    if (reqLower.includes("bachelor") && (degree.includes("bachelor") || degree.includes("b.tech") || degree.includes("b.e.") || degree.includes("b.sc") || degree.includes("bca"))) {
      // Field match bonus
      if (field && reqLower.includes(field)) return 100;
      return 85;
    }
    // CS/IT field match
    if (field && (field.includes("computer") || field.includes("information") || field.includes("software"))) return 80;
    // Any degree
    if (degree) return 65;
  }

  return 50;
}

/** Match projects */
function matchProjects(
  profileProjects: { technologies?: string[]; description?: string }[],
  jobSkills: string[],
): number {
  if (profileProjects.length === 0) return 40;
  if (jobSkills.length === 0) return 100;

  const projectTechs = profileProjects.flatMap((p) => p.technologies || []);
  if (projectTechs.length === 0) return 40;

  let matched = 0;
  for (const skill of jobSkills) {
    if (projectTechs.some((t) => stringsMatch(t, skill))) matched++;
  }

  return Math.min(100, Math.round((matched / jobSkills.length) * 100) + 20);
}

/** Match certifications */
function matchCertifications(
  profileCerts: { certificationName?: string }[],
  jobSkills: string[],
): number {
  if (profileCerts.length === 0) return 50;

  const certNames = profileCerts.map((c) => (c.certificationName || "").toLowerCase());
  const allText = certNames.join(" ");

  let relevant = 0;
  for (const skill of jobSkills) {
    if (allText.includes(norm(skill))) relevant++;
  }

  return Math.min(100, 50 + relevant * 10);
}

/** Match location */
function matchLocation(
  profileLocation?: string,
  profilePreferredLocations?: string[],
  profileWillingToRelocate?: boolean,
  jobLocation?: string,
  jobWorkMode?: string,
): number {
  if (jobWorkMode === "Remote") return 100;

  if (!profileLocation || !jobLocation) return 70;

  const pLoc = norm(profileLocation);
  const jLoc = norm(jobLocation);

  if (pLoc === jLoc || pLoc.includes(jLoc) || jLoc.includes(pLoc)) return 100;

  // Check preferred locations
  if (profilePreferredLocations?.length) {
    for (const pl of profilePreferredLocations) {
      if (stringsMatch(pl, jobLocation)) return 95;
    }
  }

  if (profileWillingToRelocate) return 75;

  // Same country check (rough)
  const pCountry = profileLocation.split(",").pop()?.trim().toLowerCase() || "";
  const jCountry = jobLocation.split(",").pop()?.trim().toLowerCase() || "";
  if (pCountry && jCountry && pCountry === jCountry) return 60;

  return 35;
}

/** Match job title / role alignment */
function matchJobTitle(
  profileTargetTitles: string[],
  profileHeadline?: string,
  jobTitle?: string,
): number {
  if (!jobTitle) return 60;

  const jTitle = norm(jobTitle);

  // Check target job titles
  for (const t of profileTargetTitles) {
    if (stringsMatch(t, jobTitle, 0.5)) return 100;
  }

  // Check professional headline
  if (profileHeadline && stringsMatch(profileHeadline, jobTitle, 0.4)) return 85;

  // Fuzzy partial match
  const keywords = jTitle.split(/\s+/);
  let matched = 0;
  const headline = norm(profileHeadline || "");
  for (const kw of keywords) {
    if (kw.length > 2 && headline.includes(kw)) matched++;
  }
  if (matched > 0) return Math.min(90, 50 + matched * 15);

  return 40;
}

// ── Main Match Function ──

export function calculateMatch(
  profile: MatchProfile,
  job: MatchJob,
): JobMatchResult {
  const skillsResult = matchSkills(profile.skills, job.skills);
  const experienceScore = matchExperience(
    profile.experience,
    profile.candidateType,
    job.experienceYears,
    job.title,
  );
  const educationScore = matchEducation(profile.education, job.educationRequired);
  const projectsScore = matchProjects(profile.projects, job.skills);
  const certificationsScore = matchCertifications(profile.certifications, job.skills);
  const locationScore = matchLocation(
    profile.location,
    profile.preferredLocations,
    profile.willingToRelocate,
    job.location,
    job.workMode,
  );
  const jobTitleScore = matchJobTitle(
    profile.targetJobTitles || [],
    profile.professionalHeadline,
    job.title,
  );

  // Weighted overall score
  const overall = Math.round(
    skillsResult.score * 0.30 +
    experienceScore * 0.20 +
    educationScore * 0.12 +
    projectsScore * 0.12 +
    certificationsScore * 0.08 +
    locationScore * 0.08 +
    jobTitleScore * 0.10
  );

  const match: MatchBreakdown = {
    skills: skillsResult.score,
    experience: experienceScore,
    education: educationScore,
    projects: projectsScore,
    certifications: certificationsScore,
    location: locationScore,
    jobTitle: jobTitleScore,
    overall,
  };

  // Why this job matches
  const whyThisJob: string[] = [];
  if (skillsResult.matched.length > 0) {
    whyThisJob.push(`Strong skill alignment: ${skillsResult.matched.slice(0, 4).join(", ")}${skillsResult.matched.length > 4 ? ` and ${skillsResult.matched.length - 4} more` : ""}`);
  }
  if (experienceScore >= 80) {
    whyThisJob.push("Your experience level closely matches the requirements");
  }
  if (educationScore >= 80) {
    whyThisJob.push("Your educational background aligns well with this role");
  }
  if (projectsScore >= 70 && profile.projects.length > 0) {
    whyThisJob.push("Your project experience demonstrates relevant technical capabilities");
  }
  if (locationScore >= 90) {
    whyThisJob.push("Location matches your preferences");
  }
  if (jobTitleScore >= 70) {
    whyThisJob.push("This role aligns with your career objectives");
  }
  if (whyThisJob.length === 0) {
    whyThisJob.push("Overall profile compatibility meets the threshold");
  }

  // Missing / Gap skills
  const missingGaps: string[] = [];
  if (skillsResult.missing.length > 0) {
    missingGaps.push(...skillsResult.missing);
  }
  if (experienceScore < 60) {
    missingGaps.push("Additional experience may strengthen your application");
  }
  if (educationScore < 60) {
    missingGaps.push("Consider relevant certifications to bridge education gaps");
  }

  return {
    job,
    match,
    matchingSkills: skillsResult.matched,
    missingSkills: skillsResult.missing,
    whyThisJob,
    missingGaps,
  };
}

/** Calculate matches for all jobs, filter by 75-99% overall */
export function calculateAllMatches(profile: MatchProfile): JobMatchResult[] {
  return matchJobs
    .map((job) => calculateMatch(profile, job))
    .filter((r) => r.match.overall >= 75 && r.match.overall <= 99)
    .sort((a, b) => b.match.overall - a.match.overall);
}
