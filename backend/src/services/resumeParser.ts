import fs from 'fs';
import path from 'path';

interface ParsedResumeData {
  personal: {
    fullName?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  summary?: string;
  experience: Array<{
    company: string;
    title: string;
    startDate?: string;
    endDate?: string;
    responsibilities?: string;
    technologies?: string[];
  }>;
  education: Array<{
    institution: string;
    degree?: string;
    field?: string;
    startYear?: number;
    endYear?: number;
    cgpa?: number;
  }>;
  skills: string[];
  projects: Array<{
    name: string;
    description?: string;
    technologies?: string[];
  }>;
  certifications: Array<{
    name: string;
    issuer?: string;
    date?: string;
  }>;
  languages: Array<{
    name: string;
    proficiency?: string;
  }>;
}

/**
 * Basic text-based resume parser.
 * Extracts structured data from plain text resume content.
 * For production, integrate with a dedicated resume parsing API.
 */
export function parseResumeText(text: string): ParsedResumeData {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  const result: ParsedResumeData = {
    personal: {},
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
  };

  // Extract email
  const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
  if (emailMatch) result.personal.email = emailMatch[0];

  // Extract phone
  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) result.personal.phone = phoneMatch[0].trim();

  // Extract LinkedIn
  const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
  if (linkedinMatch) result.personal.linkedin = 'https://' + linkedinMatch[0];

  // Extract GitHub
  const githubMatch = text.match(/github\.com\/[\w-]+/i);
  if (githubMatch) result.personal.github = 'https://' + githubMatch[0];

  // Extract name (first non-empty line that doesn't look like a section header)
  for (const line of lines.slice(0, 5)) {
    if (line.length > 2 && line.length < 50 && !line.match(/^(email|phone|linkedin|github|http|@|phone|tel)/i)) {
      result.personal.fullName = line;
      break;
    }
  }

  // Extract sections
  const sectionHeaders = [
    'experience', 'work history', 'employment',
    'education', 'academic',
    'skills', 'technical skills', 'competencies',
    'projects', 'portfolio',
    'certifications', 'certificates',
    'languages', 'language',
    'summary', 'objective', 'profile', 'about',
    'achievements', 'awards', 'accomplishments',
  ];

  let currentSection = '';
  let sectionContent: string[] = [];

  const processSection = (section: string, content: string[]) => {
    const text = content.join('\n');
    
    switch (section) {
      case 'summary':
      case 'objective':
      case 'profile':
      case 'about':
        result.summary = text;
        break;
      
      case 'experience':
      case 'work history':
      case 'employment':
        parseExperienceSection(text, result);
        break;
      
      case 'education':
      case 'academic':
        parseEducationSection(text, result);
        break;
      
      case 'skills':
      case 'technical skills':
      case 'competencies':
        parseSkillsSection(text, result);
        break;
      
      case 'projects':
      case 'portfolio':
        parseProjectsSection(text, result);
        break;
      
      case 'certifications':
      case 'certificates':
        parseCertificationsSection(text, result);
        break;
      
      case 'languages':
      case 'language':
        parseLanguagesSection(text, result);
        break;
    }
  };

  for (const line of lines) {
    const lowerLine = line.toLowerCase().replace(/[^a-z\s]/g, '').trim();
    
    const matchedHeader = sectionHeaders.find(h => 
      lowerLine === h || lowerLine.startsWith(h + ':') || lowerLine.startsWith(h + 's:')
    );

    if (matchedHeader) {
      if (currentSection) processSection(currentSection, sectionContent);
      currentSection = matchedHeader;
      sectionContent = [];
    } else if (currentSection) {
      sectionContent.push(line);
    }
  }

  if (currentSection) processSection(currentSection, sectionContent);

  return result;
}

function parseExperienceSection(text: string, result: ParsedResumeData) {
  const blocks = text.split(/\n(?=[A-Z])/);
  
  for (const block of blocks) {
    const lines = block.split('\n').filter(l => l.trim());
    if (lines.length === 0) continue;

    const firstLine = lines[0];
    const parts = firstLine.split(/[-–|]/).map(s => s.trim());
    
    result.experience.push({
      company: parts[1] || parts[0],
      title: parts[0],
      responsibilities: lines.slice(1).join('\n'),
      technologies: extractTechnologies(block),
    });
  }
}

function parseEducationSection(text: string, result: ParsedResumeData) {
  const lines = text.split('\n').filter(l => l.trim());
  
  for (const line of lines) {
    const yearMatch = line.match(/\b(19|20)\d{2}\b/g);
    result.education.push({
      institution: line.replace(/\b(19|20)\d{2}\b/g, '').replace(/[-–|]/g, '').trim(),
      startYear: yearMatch ? parseInt(yearMatch[0]) : undefined,
      endYear: yearMatch && yearMatch.length > 1 ? parseInt(yearMatch[1]) : undefined,
    });
  }
}

function parseSkillsSection(text: string, result: ParsedResumeData) {
  const skillSeparators = /[,•\n|;]+/;
  const skills = text.split(skillSeparators)
    .map(s => s.trim())
    .filter(s => s.length > 1 && s.length < 50);
  
  result.skills.push(...skills);
}

function parseProjectsSection(text: string, result: ParsedResumeData) {
  const blocks = text.split(/\n(?=[A-Z])/);
  
  for (const block of blocks) {
    const lines = block.split('\n').filter(l => l.trim());
    if (lines.length === 0) continue;

    result.projects.push({
      name: lines[0].split(/[-–|]/)[0].trim(),
      description: lines.slice(1).join(' '),
      technologies: extractTechnologies(block),
    });
  }
}

function parseCertificationsSection(text: string, result: ParsedResumeData) {
  const lines = text.split('\n').filter(l => l.trim());
  
  for (const line of lines) {
    result.certifications.push({
      name: line.split(/[-–|]/)[0].trim(),
      issuer: line.split(/[-–|]/)[1]?.trim(),
    });
  }
}

function parseLanguagesSection(text: string, result: ParsedResumeData) {
  const lines = text.split('\n').filter(l => l.trim());
  
  for (const line of lines) {
    const parts = line.split(/[-–|:]+/).map(s => s.trim());
    result.languages.push({
      name: parts[0],
      proficiency: parts[1],
    });
  }
}

function extractTechnologies(text: string): string[] {
  const techKeywords = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'Go', 'Rust', 'PHP', 'Swift', 'Kotlin',
    'React', 'Vue', 'Angular', 'Next.js', 'Nuxt', 'Svelte',
    'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel', 'Ruby on Rails',
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'DynamoDB',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform',
    'Git', 'GitHub', 'GitLab', 'Jenkins', 'CI/CD',
    'HTML', 'CSS', 'SASS', 'Tailwind', 'Bootstrap',
    'REST', 'GraphQL', 'gRPC', 'WebSocket',
    'Figma', 'Sketch', 'Adobe XD',
    'Jest', 'Mocha', 'Cypress', 'Selenium',
    'TensorFlow', 'PyTorch', 'Scikit-learn',
    'Docker', 'Kubernetes', 'Nginx', 'Apache',
  ];

  return techKeywords.filter(tech => 
    text.toLowerCase().includes(tech.toLowerCase())
  );
}
