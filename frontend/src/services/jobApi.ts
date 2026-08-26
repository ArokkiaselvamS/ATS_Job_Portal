const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

async function jobRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; errors?: any }> {
  const url = `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    const data = await res.json();
    return data;
  } catch (error) {
    return {
      success: false,
      message: 'Unable to connect to the server.',
    };
  }
}

// ─── Types ──────────────────────────────────────────────────

export type ApplicationStatus = 
  | 'SAVED' 
  | 'APPLIED' 
  | 'SCREENING' 
  | 'INTERVIEW' 
  | 'OFFER' 
  | 'REJECTED' 
  | 'ACCEPTED' 
  | 'WITHDRAWN';

export interface Application {
  id: number;
  userId: number;
  jobId: number;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  notes?: string;
  resumeUrl?: string;
  coverLetterUrl?: string;
  applicationMethod?: string;
  atsMatchScore?: number;
  job?: BackendJob;
  createdAt: string;
}

// ─── Jobs ─────────────────────────────────────────────────

export interface BackendJob {
  id: number;
  title: string;
  description: string;
  companyId: number;
  companyName?: string;
  location?: string;
  city?: string;
  country?: string;
  jobType: string;
  workMode: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  skills: string[];
  status: string;
  source?: string;
  externalApplyUrl?: string;
  postedAt: string;
  closingDate?: string;
  views?: number;
  company?: {
    id: number;
    name: string;
    logo?: string;
  };
}

export const jobApi = {
  search: (params: Record<string, string>) =>
    jobRequest(`/jobs?${new URLSearchParams(params)}`),

  getById: (id: number) =>
    jobRequest<BackendJob>(`/jobs/${id}`),

  save: (id: number) =>
    jobRequest(`/jobs/${id}/save`, { method: 'POST' }),

  unsave: (id: number) =>
    jobRequest(`/jobs/${id}/save`, { method: 'DELETE' }),

  getSaved: (params?: Record<string, string>) =>
    jobRequest(`/jobs/saved${params ? '?' + new URLSearchParams(params) : ''}`),

  apply: (id: number, data?: { resumeUrl?: string; coverLetterUrl?: string; notes?: string }) =>
    jobRequest(`/jobs/${id}/apply`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    }),

  getApplications: (params?: Record<string, string>) =>
    jobRequest(`/jobs/applications${params ? '?' + new URLSearchParams(params) : ''}`),

  getApplication: (id: number) =>
    jobRequest(`/jobs/applications/${id}`),

  addApplication: (data: { 
    companyName: string; 
    position: string; 
    location?: string; 
    jobType?: string; 
    status?: ApplicationStatus;
    notes?: string; 
    resumeUrl?: string; 
    appliedDate?: string;
  }) =>
    jobRequest(`/jobs/applications`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateApplicationStatus: (id: number, status: ApplicationStatus) =>
    jobRequest(`/jobs/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

// ─── Matches ──────────────────────────────────────────────

export interface BackendMatchBreakdown {
  skills: number;
  experience: number;
  jobTitle: number;
  education: number;
  location: number;
  workMode: number;
  jobType: number;
  overall: number;
}

export interface BackendMatchResult {
  jobId: number;
  matchScore: number;
  breakdown: BackendMatchBreakdown;
  matchingSkills: string[];
  missingSkills: string[];
  reasons: string[];
}

export const matchApi = {
  getMatches: (params?: Record<string, string>) =>
    jobRequest<{ matches: BackendMatchResult[]; count: number }>(
      `/matches${params ? '?' + new URLSearchParams(params) : ''}`
    ),

  getMatchForJob: (jobId: number) =>
    jobRequest<BackendMatchResult>(`/matches/${jobId}`),
};
