const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

async function adminRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const { headers: customHeaders, ...restOptions } = options;
  const res = await fetch(`${API_BASE}/admin${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...customHeaders as any },
    ...restOptions,
    credentials: 'include',
  });

  const data = await res.json();

  if (!res.ok) {
    throw { status: res.status, message: data.message || 'Request failed', data };
  }

  return data;
}

export const adminApi = {
  auth: {
    login: (email: string, password: string) =>
      adminRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    logout: () => adminRequest('/auth/logout', { method: 'POST' }),
    me: () => adminRequest('/auth/me'),
  },

  dashboard: {
    get: () => adminRequest('/dashboard'),
  },

  jobSeekers: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return adminRequest(`/job-seekers${qs}`);
    },
    get: (id: number) => adminRequest(`/job-seekers/${id}`),
    suspend: (id: number, reason?: string) =>
      adminRequest(`/job-seekers/${id}/suspend`, { method: 'PATCH', body: JSON.stringify({ reason }) }),
    activate: (id: number) =>
      adminRequest(`/job-seekers/${id}/activate`, { method: 'PATCH' }),
    block: (id: number, reason?: string) =>
      adminRequest(`/job-seekers/${id}/block`, { method: 'PATCH', body: JSON.stringify({ reason }) }),
  },

  companyAdmins: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return adminRequest(`/company-admins${qs}`);
    },
    get: (id: number) => adminRequest(`/company-admins/${id}`),
    suspend: (id: number, reason?: string) =>
      adminRequest(`/company-admins/${id}/suspend`, { method: 'PATCH', body: JSON.stringify({ reason }) }),
    activate: (id: number) =>
      adminRequest(`/company-admins/${id}/activate`, { method: 'PATCH' }),
    block: (id: number, reason?: string) =>
      adminRequest(`/company-admins/${id}/block`, { method: 'PATCH', body: JSON.stringify({ reason }) }),
  },

  companies: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return adminRequest(`/companies${qs}`);
    },
    get: (id: number) => adminRequest(`/companies/${id}`),
    verify: (id: number) =>
      adminRequest(`/companies/${id}/verify`, { method: 'PATCH' }),
    reject: (id: number, reason: string) =>
      adminRequest(`/companies/${id}/reject`, { method: 'PATCH', body: JSON.stringify({ reason }) }),
    suspend: (id: number, reason?: string) =>
      adminRequest(`/companies/${id}/suspend`, { method: 'PATCH', body: JSON.stringify({ reason }) }),
    activate: (id: number) =>
      adminRequest(`/companies/${id}/activate`, { method: 'PATCH' }),
  },

  jobs: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return adminRequest(`/jobs${qs}`);
    },
    get: (id: number) => adminRequest(`/jobs/${id}`),
    approve: (id: number) =>
      adminRequest(`/jobs/${id}/approve`, { method: 'PATCH' }),
    reject: (id: number, reason: string) =>
      adminRequest(`/jobs/${id}/reject`, { method: 'PATCH', body: JSON.stringify({ reason }) }),
    suspend: (id: number, reason?: string) =>
      adminRequest(`/jobs/${id}/suspend`, { method: 'PATCH', body: JSON.stringify({ reason }) }),
    pause: (id: number) =>
      adminRequest(`/jobs/${id}/pause`, { method: 'PATCH' }),
    resume: (id: number) =>
      adminRequest(`/jobs/${id}/resume`, { method: 'PATCH' }),
    close: (id: number) =>
      adminRequest(`/jobs/${id}/close`, { method: 'PATCH' }),
  },

  applications: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return adminRequest(`/applications${qs}`);
    },
  },

  jobFeeds: {
    list: () => adminRequest('/job-feeds'),
    get: (id: number) => adminRequest(`/job-feeds/${id}`),
    create: (data: any) =>
      adminRequest('/job-feeds', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) =>
      adminRequest(`/job-feeds/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: number) =>
      adminRequest(`/job-feeds/${id}`, { method: 'DELETE' }),
    test: (id: number) =>
      adminRequest(`/job-feeds/${id}/test`, { method: 'POST' }),
    sync: (id: number) =>
      adminRequest(`/job-feeds/${id}/sync`, { method: 'POST' }),
    pause: (id: number) =>
      adminRequest(`/job-feeds/${id}/pause`, { method: 'PATCH' }),
    syncHistory: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return adminRequest(`/job-feeds/sync-history${qs}`);
    },
    failedJobs: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return adminRequest(`/job-feeds/failed-jobs${qs}`);
    },
    retryFailed: (id: number) =>
      adminRequest(`/job-feeds/failed-jobs/${id}/retry`, { method: 'POST' }),
  },

  categories: {
    list: () => adminRequest('/categories'),
    create: (data: any) =>
      adminRequest('/categories', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) =>
      adminRequest(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  },

  skills: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return adminRequest(`/skills${qs}`);
    },
    create: (data: any) =>
      adminRequest('/skills', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) =>
      adminRequest(`/skills/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    merge: (targetSkillId: number, sourceSkillIds: number[]) =>
      adminRequest('/skills/merge', { method: 'POST', body: JSON.stringify({ targetSkillId, sourceSkillIds }) }),
  },

  reports: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return adminRequest(`/reports${qs}`);
    },
    update: (id: number, data: any) =>
      adminRequest(`/reports/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  },

  analytics: {
    get: (period?: string) => {
      const qs = period ? `?period=${period}` : '';
      return adminRequest(`/analytics${qs}`);
    },
  },

  security: {
    get: () => adminRequest('/security'),
  },

  auditLogs: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return adminRequest(`/audit-logs${qs}`);
    },
  },

  notifications: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return adminRequest(`/notifications${qs}`);
    },
    markRead: (id: number) =>
      adminRequest(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () =>
      adminRequest('/notifications/read-all', { method: 'PATCH' }),
    send: (data: any) =>
      adminRequest('/notifications/send', { method: 'POST', body: JSON.stringify(data) }),
  },

  settings: {
    get: () => adminRequest('/settings'),
    update: (settings: any[]) =>
      adminRequest('/settings', { method: 'PATCH', body: JSON.stringify({ settings }) }),
  },
};
