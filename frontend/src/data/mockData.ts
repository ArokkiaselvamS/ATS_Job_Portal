/* ────────────────────────────────────────────
   Realistic mock data for the dashboard pages.
   Structured to mirror the Prisma schema so 
   swapping to real API calls is trivial.
   ──────────────────────────────────────────── */

// ── Jobs ──
export interface MockJob {
  id: number;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  workMode: "Remote" | "Hybrid" | "On-site";
  jobType: "Full Time" | "Part Time" | "Internship" | "Contract";
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  skills: string[];
  postedAt: string;
  matchPercent?: number;
}

export const mockJobs: MockJob[] = [
  {
    id: 1,
    title: "Software Engineer",
    company: "ABC Technologies",
    location: "Chennai",
    workMode: "Hybrid",
    jobType: "Full Time",
    salaryMin: 500000,
    salaryMax: 800000,
    salaryCurrency: "INR",
    skills: ["React", "TypeScript", "Node.js", "PostgreSQL"],
    postedAt: "2 days ago",
    matchPercent: 91,
  },
  {
    id: 2,
    title: "Frontend Developer",
    company: "XYZ Solutions",
    location: "Bangalore",
    workMode: "Remote",
    jobType: "Full Time",
    salaryMin: 400000,
    salaryMax: 700000,
    salaryCurrency: "INR",
    skills: ["React", "JavaScript", "HTML", "CSS"],
    postedAt: "3 days ago",
    matchPercent: 85,
  },
  {
    id: 3,
    title: "Full Stack Developer",
    company: "Tech Corp India",
    location: "Hyderabad",
    workMode: "On-site",
    jobType: "Full Time",
    salaryMin: 600000,
    salaryMax: 1000000,
    salaryCurrency: "INR",
    skills: ["React", "Node.js", "MongoDB", "AWS"],
    postedAt: "5 days ago",
    matchPercent: 78,
  },
  {
    id: 4,
    title: "Backend Engineer",
    company: "CloudNet Systems",
    location: "Pune",
    workMode: "Hybrid",
    jobType: "Full Time",
    salaryMin: 700000,
    salaryMax: 1200000,
    salaryCurrency: "INR",
    skills: ["Java", "Spring Boot", "PostgreSQL", "Docker"],
    postedAt: "1 day ago",
    matchPercent: 72,
  },
  {
    id: 5,
    title: "DevOps Engineer",
    company: "InfraLabs",
    location: "Mumbai",
    workMode: "Remote",
    jobType: "Contract",
    salaryMin: 800000,
    salaryMax: 1500000,
    salaryCurrency: "INR",
    skills: ["AWS", "Docker", "Kubernetes", "Terraform"],
    postedAt: "4 days ago",
    matchPercent: 65,
  },
  {
    id: 6,
    title: "UI/UX Designer",
    company: "DesignHub",
    location: "Delhi",
    workMode: "Hybrid",
    jobType: "Full Time",
    salaryMin: 400000,
    salaryMax: 800000,
    salaryCurrency: "INR",
    skills: ["Figma", "Adobe XD", "Prototyping", "Design Systems"],
    postedAt: "6 days ago",
    matchPercent: 60,
  },
];

// ── Applications ──
export type AppStatus = "Applied" | "Screening" | "Interview" | "Offer" | "Rejected";

export interface MockApplication {
  id: number;
  company: string;
  position: string;
  appliedDate: string;
  status: AppStatus;
  atsScore: number;
  resumeUsed: string;
}

export const mockApplications: MockApplication[] = [
  { id: 1, company: "ABC Technologies", position: "Software Engineer", appliedDate: "Aug 20, 2026", status: "Applied", atsScore: 82, resumeUsed: "Software Engineer Resume" },
  { id: 2, company: "TCS", position: "Software Developer", appliedDate: "Aug 19, 2026", status: "Applied", atsScore: 78, resumeUsed: "Full Stack Resume" },
  { id: 3, company: "XYZ Solutions", position: "Frontend Developer", appliedDate: "Aug 18, 2026", status: "Screening", atsScore: 85, resumeUsed: "Frontend Developer Resume" },
  { id: 4, company: "Infosys", position: "React Developer", appliedDate: "Aug 17, 2026", status: "Screening", atsScore: 80, resumeUsed: "Software Engineer Resume" },
  { id: 5, company: "Microsoft", position: "Software Engineer", appliedDate: "Aug 15, 2026", status: "Interview", atsScore: 92, resumeUsed: "Software Engineer Resume" },
  { id: 6, company: "Google", position: "Full Stack Engineer", appliedDate: "Aug 14, 2026", status: "Interview", atsScore: 88, resumeUsed: "Full Stack Resume" },
  { id: 7, company: "ABC Corp", position: "Full Stack Developer", appliedDate: "Aug 10, 2026", status: "Offer", atsScore: 90, resumeUsed: "Full Stack Resume" },
  { id: 8, company: "Wipro", position: "Backend Developer", appliedDate: "Aug 8, 2026", status: "Rejected", atsScore: 70, resumeUsed: "Software Engineer Resume" },
  { id: 9, company: "HCL", position: "Software Engineer", appliedDate: "Aug 6, 2026", status: "Rejected", atsScore: 65, resumeUsed: "Software Engineer Resume" },
];

// ── Connections ──
export interface MockConnection {
  id: number;
  name: string;
  title: string;
  company: string;
  skills: string[];
  mutualConnections: number;
}

export const mockConnections: MockConnection[] = [
  { id: 1, name: "Rahul Kumar", title: "Software Engineer", company: "Microsoft", skills: ["React", "Node.js", "Azure"], mutualConnections: 12 },
  { id: 2, name: "Priya Sharma", title: "HR Manager", company: "ABC Technologies", skills: ["Talent Acquisition", "HR", "Recruiting"], mutualConnections: 8 },
  { id: 3, name: "Arjun Mehta", title: "Product Manager", company: "Google", skills: ["Product", "Strategy", "AI"], mutualConnections: 5 },
  { id: 4, name: "Sneha Patel", title: "Data Scientist", company: "Amazon", skills: ["Python", "ML", "TensorFlow"], mutualConnections: 3 },
  { id: 5, name: "Vikram Singh", title: "DevOps Engineer", company: "Netflix", skills: ["AWS", "Docker", "CI/CD"], mutualConnections: 7 },
];

export interface MockConnectionRequest {
  id: number;
  name: string;
  title: string;
  company: string;
}

export const mockConnectionRequests: MockConnectionRequest[] = [
  { id: 10, name: "Neha Verma", title: "Senior Recruiter", company: "TCS" },
  { id: 11, name: "Priya Kumar", title: "Hiring Manager", company: "Infosys" },
  { id: 12, name: "Arun Reddy", title: "Tech Lead", company: "Zoho" },
];

export const mockPeopleYouMayKnow: MockConnection[] = [
  { id: 20, name: "Karthik Iyer", title: "Senior Frontend Engineer", company: "Flipkart", skills: ["React", "Vue.js"], mutualConnections: 4 },
  { id: 21, name: "Ananya Das", title: "UX Researcher", company: "Adobe", skills: ["Research", "Figma"], mutualConnections: 2 },
  { id: 22, name: "Ravi Shankar", title: "Engineering Manager", company: "Swiggy", skills: ["Leadership", "Architecture"], mutualConnections: 6 },
];

// ── Resumes ──
export interface MockResume {
  id: number;
  name: string;
  updatedAt: string;
  atsScore: number;
}

export const mockResumes: MockResume[] = [
  { id: 1, name: "Software Engineer Resume", updatedAt: "Aug 22, 2026", atsScore: 82 },
  { id: 2, name: "Frontend Developer Resume", updatedAt: "Aug 18, 2026", atsScore: 78 },
  { id: 3, name: "Full Stack Resume", updatedAt: "Aug 15, 2026", atsScore: 85 },
];

// ── Services ──
export interface MockService {
  id: number;
  title: string;
  description: string;
  cta: string;
  icon: string;
}

export const mockServices: MockService[] = [
  { id: 1, title: "Resume Optimization", description: "Improve your resume for ATS systems and increase your chances.", icon: "file-check", cta: "Explore" },
  { id: 2, title: "ATS Resume Analysis", description: "Check your resume compatibility with job descriptions.", icon: "scan-search", cta: "Analyze Resume" },
  { id: 3, title: "Career Consultation", description: "Get career guidance from industry professionals.", icon: "message-circle", cta: "Book Session" },
  { id: 4, title: "Resume Review", description: "Get expert feedback and actionable suggestions.", icon: "eye", cta: "Get Review" },
  { id: 5, title: "Interview Preparation", description: "Prepare for your next interview with mock sessions.", icon: "video", cta: "Start Learning" },
  { id: 6, title: "Cover Letter Builder", description: "Create compelling, tailored cover letters.", icon: "file-pen", cta: "Build Now" },
  { id: 7, title: "LinkedIn Optimization", description: "Improve your professional LinkedIn profile.", icon: "linkedin", cta: "Optimize" },
  { id: 8, title: "Skill Assessment", description: "Identify skill gaps and get improvement plans.", icon: "bar-chart-3", cta: "Take Assessment" },
  { id: 9, title: "Job Search Assistance", description: "Get personalized job-search support and strategy.", icon: "search", cta: "Get Support" },
];

// ── Referrals ──
export interface MockReferral {
  id: number;
  name: string;
  email: string;
  status: "Joined" | "Pending" | "Active";
  date: string;
}

export const mockReferrals: MockReferral[] = [
  { id: 1, name: "John Doe", email: "john@example.com", status: "Joined", date: "Aug 10, 2026" },
  { id: 2, name: "Priya", email: "priya@example.com", status: "Pending", date: "Aug 12, 2026" },
  { id: 3, name: "Rahul", email: "rahul@example.com", status: "Joined", date: "Aug 14, 2026" },
  { id: 4, name: "Anu", email: "anu@example.com", status: "Pending", date: "Aug 16, 2026" },
  { id: 5, name: "Karthik", email: "karthik@example.com", status: "Active", date: "Aug 18, 2026" },
];
