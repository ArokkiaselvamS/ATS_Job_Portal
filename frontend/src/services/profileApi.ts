const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

async function profileRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; errors?: any }> {
  const url = `${BASE_URL}/profile${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  // Don't set Content-Type for FormData
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

// ─── Profile ────────────────────────────────────────────
export const profileApi = {
  get: () => profileRequest('/'),

  update: (data: Record<string, any>) =>
    profileRequest('/', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getATSScore: () => profileRequest('/ats-score'),
  getCompletion: () => profileRequest('/completion'),
};

// ─── Education ──────────────────────────────────────────
export const educationApi = {
  getAll: () => profileRequest('/education'),

  upsert: (data: Record<string, any>) =>
    profileRequest('/education', {
      method: data.id ? 'PUT' : 'POST',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    profileRequest(`/education/${id}`, { method: 'DELETE' }),
};

// ─── Experience ─────────────────────────────────────────
export const experienceApi = {
  getAll: () => profileRequest('/experience'),

  upsert: (data: Record<string, any>) =>
    profileRequest('/experience', {
      method: data.id ? 'PUT' : 'POST',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    profileRequest(`/experience/${id}`, { method: 'DELETE' }),
};

// ─── Skills ─────────────────────────────────────────────
export const skillsApi = {
  getAll: () => profileRequest('/skills'),

  upsert: (data: Record<string, any>) =>
    profileRequest('/skills', {
      method: data.id ? 'PUT' : 'POST',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    profileRequest(`/skills/${id}`, { method: 'DELETE' }),
};

// ─── Projects ───────────────────────────────────────────
export const projectsApi = {
  getAll: () => profileRequest('/projects'),

  upsert: (data: Record<string, any>) =>
    profileRequest('/projects', {
      method: data.id ? 'PUT' : 'POST',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    profileRequest(`/projects/${id}`, { method: 'DELETE' }),
};

// ─── Certifications ─────────────────────────────────────
export const certificationsApi = {
  getAll: () => profileRequest('/certifications'),

  upsert: (data: Record<string, any>) =>
    profileRequest('/certifications', {
      method: data.id ? 'PUT' : 'POST',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    profileRequest(`/certifications/${id}`, { method: 'DELETE' }),
};

// ─── Achievements ───────────────────────────────────────
export const achievementsApi = {
  getAll: () => profileRequest('/achievements'),

  upsert: (data: Record<string, any>) =>
    profileRequest('/achievements', {
      method: data.id ? 'PUT' : 'POST',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    profileRequest(`/achievements/${id}`, { method: 'DELETE' }),
};

// ─── Languages ──────────────────────────────────────────
export const languagesApi = {
  getAll: () => profileRequest('/languages'),

  upsert: (data: Record<string, any>) =>
    profileRequest('/languages', {
      method: data.id ? 'PUT' : 'POST',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    profileRequest(`/languages/${id}`, { method: 'DELETE' }),
};

// ─── Resume ─────────────────────────────────────────────
export const resumeApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('resume', file);
    return profileRequest('/resume', {
      method: 'POST',
      body: formData,
    });
  },
};
