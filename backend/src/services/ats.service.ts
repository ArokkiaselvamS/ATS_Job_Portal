import prisma from '../utils/prisma';

interface ATSScoreBreakdown {
  keywordMatch: number;
  skillsMatch: number;
  experienceMatch: number;
  educationMatch: number;
  jobTitleMatch: number;
  resumeStructure: number;
  overall: number;
  missingKeywords: string[];
  missingSkills: string[];
  weakSections: string[];
  suggestions: string[];
}

export async function calculateATSScore(profileId: number): Promise<ATSScoreBreakdown> {
  const profile = await prisma.profile.findUnique({
    where: { id: profileId },
    include: {
      education: true,
      experience: true,
      skills: true,
      projects: true,
      certifications: true,
      achievements: true,
      languages: true,
      resume: true,
    },
  });

  if (!profile) {
    return getDefaultScore();
  }

  const scores = {
    keywordMatch: 0,
    skillsMatch: 0,
    experienceMatch: 0,
    educationMatch: 0,
    jobTitleMatch: 0,
    resumeStructure: 0,
  };

  const missingKeywords: string[] = [];
  const missingSkills: string[] = [];
  const weakSections: string[] = [];
  const suggestions: string[] = [];

  // 1. Keyword Match (based on professional summary, headline, target titles)
  if (profile.professionalSummary && profile.professionalSummary.length > 50) {
    scores.keywordMatch = 80;
    if (profile.professionalSummary.length > 150) scores.keywordMatch = 95;
    else if (profile.professionalSummary.length > 100) scores.keywordMatch = 90;
  } else if (profile.professionalSummary) {
    scores.keywordMatch = 50;
    suggestions.push('Expand your professional summary to at least 100 characters for better ATS keyword matching');
  } else {
    weakSections.push('Professional Summary');
    suggestions.push('Add a professional summary to improve keyword matching');
  }

  if (!profile.professionalHeadline) {
    missingKeywords.push('Professional Headline');
    suggestions.push('Add a professional headline');
  }

  if (!profile.targetJobTitles || profile.targetJobTitles.length === 0) {
    missingKeywords.push('Target Job Titles');
    suggestions.push('Add target job titles to improve job title matching');
  }

  // 2. Skills Match
  const skills = profile.skills || [];
  if (skills.length >= 10) {
    scores.skillsMatch = 95;
  } else if (skills.length >= 7) {
    scores.skillsMatch = 85;
  } else if (skills.length >= 5) {
    scores.skillsMatch = 70;
  } else if (skills.length >= 3) {
    scores.skillsMatch = 50;
  } else if (skills.length > 0) {
    scores.skillsMatch = 30;
    suggestions.push('Add more skills (aim for 7-10+) to improve ATS scoring');
  } else {
    weakSections.push('Skills');
    suggestions.push('Add technical and soft skills to your profile');
  }

  if (skills.length < 5) {
    missingSkills.push('Add at least 5 relevant skills');
  }

  // 3. Experience Match
  const experiences = profile.experience || [];
  if (profile.candidateType === 'EXPERIENCED') {
    if (experiences.length >= 3) {
      scores.experienceMatch = 95;
    } else if (experiences.length >= 2) {
      scores.experienceMatch = 85;
    } else if (experiences.length >= 1) {
      scores.experienceMatch = 70;
    } else {
      scores.experienceMatch = 30;
      weakSections.push('Work Experience');
      suggestions.push('Add your work experience');
    }

    // Check for detailed experience
    const detailedExp = experiences.filter(e => 
      e.responsibilities && e.responsibilities.length > 50 &&
      e.technologies && e.technologies.length > 0
    );
    if (detailedExp.length === 0 && experiences.length > 0) {
      suggestions.push('Add detailed responsibilities and technologies used for each experience');
    }
  } else {
    // Student/Fresher
    const internships = experiences.filter(e => e.isInternship);
    const projects = profile.projects || [];
    
    if (internships.length > 0 || projects.length >= 2) {
      scores.experienceMatch = 85;
    } else if (projects.length >= 1) {
      scores.experienceMatch = 65;
    } else {
      scores.experienceMatch = 40;
      suggestions.push('Add projects or internships to strengthen your profile');
    }
  }

  // 4. Education Match
  const education = profile.education || [];
  if (education.length >= 2) {
    scores.educationMatch = 95;
  } else if (education.length === 1) {
    const edu = education[0];
    scores.educationMatch = 70;
    if (edu.cgpaPercentage) scores.educationMatch = 85;
    if (edu.degree && edu.collegeUniversity) scores.educationMatch = 90;
  } else {
    scores.educationMatch = 30;
    weakSections.push('Education');
    suggestions.push('Add your educational background');
  }

  // 5. Job Title Match
  if (profile.targetJobTitles && profile.targetJobTitles.length > 0) {
    scores.jobTitleMatch = 90;
    if (profile.professionalHeadline) {
      // Check if headline aligns with target titles
      const headlineLower = profile.professionalHeadline.toLowerCase();
      const matchesTarget = profile.targetJobTitles.some(title => 
        headlineLower.includes(title.toLowerCase().split(' ')[0])
      );
      if (matchesTarget) scores.jobTitleMatch = 95;
    }
  } else {
    scores.jobTitleMatch = 30;
    weakSections.push('Job Target');
  }

  // 6. Resume Structure
  if (profile.resume) {
    scores.resumeStructure = 80;
    if (profile.resume.atsScore) {
      scores.resumeStructure = Math.min(95, profile.resume.atsScore);
    }
  } else {
    scores.resumeStructure = 20;
    weakSections.push('Resume');
    suggestions.push('Upload a resume for better ATS scoring');
  }

  // Calculate overall score
  const weights = {
    keywordMatch: 0.20,
    skillsMatch: 0.25,
    experienceMatch: 0.20,
    educationMatch: 0.15,
    jobTitleMatch: 0.10,
    resumeStructure: 0.10,
  };

  const overall = Math.round(
    scores.keywordMatch * weights.keywordMatch +
    scores.skillsMatch * weights.skillsMatch +
    scores.experienceMatch * weights.experienceMatch +
    scores.educationMatch * weights.educationMatch +
    scores.jobTitleMatch * weights.jobTitleMatch +
    scores.resumeStructure * weights.resumeStructure
  );

  // Additional suggestions
  if (!profile.linkedinUrl) {
    suggestions.push('Add your LinkedIn profile URL');
  }
  if (!profile.githubUrl && skills.some(s => 
    ['TECHNICAL', 'PROGRAMMING_LANGUAGE', 'FRAMEWORK'].includes(s.category)
  )) {
    suggestions.push('Add your GitHub profile URL to showcase technical work');
  }
  if (!profile.location) {
    suggestions.push('Add your location for location-based job matching');
  }

  return {
    keywordMatch: Math.min(100, scores.keywordMatch),
    skillsMatch: Math.min(100, scores.skillsMatch),
    experienceMatch: Math.min(100, scores.experienceMatch),
    educationMatch: Math.min(100, scores.educationMatch),
    jobTitleMatch: Math.min(100, scores.jobTitleMatch),
    resumeStructure: Math.min(100, scores.resumeStructure),
    overall: Math.min(100, overall),
    missingKeywords,
    missingSkills,
    weakSections,
    suggestions,
  };
}

export async function calculateProfileCompletion(profileId: number): Promise<{
  percentage: number;
  completed: string[];
  needsAttention: string[];
}> {
  const profile = await prisma.profile.findUnique({
    where: { id: profileId },
    include: {
      education: true,
      experience: true,
      skills: true,
      projects: true,
      certifications: true,
      achievements: true,
      languages: true,
      resume: true,
    },
  });

  if (!profile) {
    return { percentage: 0, completed: [], needsAttention: [] };
  }

  const completed: string[] = [];
  const needsAttention: string[] = [];
  let totalFields = 0;
  let filledFields = 0;

  // Personal Information (weight: 20%)
  const personalFields = [
    { check: !!profile.phone, label: 'Phone Number' },
    { check: !!profile.location, label: 'Location' },
    { check: !!profile.linkedinUrl, label: 'LinkedIn' },
  ];
  personalFields.forEach(f => {
    totalFields++;
    if (f.check) filledFields++;
  });
  if (personalFields.every(f => f.check)) {
    completed.push('Personal Information');
  } else {
    personalFields.filter(f => !f.check).forEach(f => needsAttention.push(`Add ${f.label}`));
  }

  // Career Information (weight: 15%)
  const careerFields = [
    { check: !!profile.candidateType, label: 'Candidate Type' },
    { check: !!profile.professionalHeadline, label: 'Professional Headline' },
    { check: !!profile.professionalSummary, label: 'Professional Summary' },
    { check: !!(profile.targetJobTitles && profile.targetJobTitles.length > 0), label: 'Target Job Titles' },
  ];
  careerFields.forEach(f => {
    totalFields++;
    if (f.check) filledFields++;
  });
  if (careerFields.every(f => f.check)) {
    completed.push('Career Information');
  } else {
    careerFields.filter(f => !f.check).forEach(f => needsAttention.push(f.label));
  }

  // Education (weight: 15%)
  totalFields++;
  if (profile.education.length > 0) {
    filledFields++;
    completed.push('Education');
  } else {
    needsAttention.push('Add Education');
  }

  // Experience/Skills (weight: 20%)
  totalFields++;
  if (profile.skills.length > 0) {
    filledFields++;
    completed.push('Skills');
  } else {
    needsAttention.push('Add Skills');
  }

  // Projects (weight: 10%)
  totalFields++;
  if (profile.projects.length > 0) {
    filledFields++;
    completed.push('Projects');
  } else {
    if (profile.candidateType === 'STUDENT_FRESHER') {
      needsAttention.push('Add Projects');
    }
  }

  // Resume (weight: 10%)
  totalFields++;
  if (profile.resume) {
    filledFields++;
    completed.push('Resume');
  } else {
    needsAttention.push('Upload Resume');
  }

  // Job Preferences (weight: 10%)
  const prefFields = [
    { check: !!(profile.workModePreference && profile.workModePreference.length > 0), label: 'Work Mode Preference' },
    { check: !!(profile.employmentTypePref && profile.employmentTypePref.length > 0), label: 'Employment Type' },
  ];
  totalFields++;
  if (prefFields.every(f => f.check)) {
    filledFields++;
    completed.push('Job Preferences');
  } else {
    needsAttention.push('Complete Job Preferences');
  }

  const percentage = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;

  return { percentage, completed, needsAttention };
}

function getDefaultScore(): ATSScoreBreakdown {
  return {
    keywordMatch: 0,
    skillsMatch: 0,
    experienceMatch: 0,
    educationMatch: 0,
    jobTitleMatch: 0,
    resumeStructure: 0,
    overall: 0,
    missingKeywords: [],
    missingSkills: [],
    weakSections: [],
    suggestions: ['Complete your profile to get an ATS score'],
  };
}
