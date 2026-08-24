const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; errors?: any }> {
  const url = `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

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
      message: 'Unable to connect to the server. Please ensure the backend is running.',
    };
  }
}

export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  register: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  logout: () =>
    apiRequest('/auth/logout', {
      method: 'POST',
    }),
  me: () => apiRequest('/auth/me'),
};

export const healthApi = {
  check: () => apiRequest('/health'),
};

export interface ReferralStats {
  invitesSent: number;
  joined: number;
  activeUsers: number;
  rewardsEarned: number;
}

export interface ReferralInvitation {
  id: number;
  name: string;
  email: string;
  status: string;
  channel?: string;
  date: string;
}

export const referralApi = {
  sendInvitations: (emails: string[]) =>
    apiRequest<{ sent: number; skipped: number; joined: number; failed: number }>('/invitations/send', {
      method: 'POST',
      body: JSON.stringify({ emails }),
    }),
  getInvitations: () =>
    apiRequest<ReferralInvitation[]>('/invitations'),
  getStats: () =>
    apiRequest<ReferralStats>('/referrals/stats'),
  recordShare: (channel: string) =>
    apiRequest('/referrals/share', {
      method: 'POST',
      body: JSON.stringify({ channel }),
    }),
};
