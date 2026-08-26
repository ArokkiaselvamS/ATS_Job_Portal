import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { adminApi } from '../services/adminApi';

interface AdminUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  profileImage?: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshAdmin: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children?: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAdmin = async () => {
    try {
      const res: any = await adminApi.auth.me();
      if (res.success && res.data?.role === 'SUPER_ADMIN') {
        setAdmin(res.data);
      } else {
        setAdmin(null);
      }
    } catch {
      setAdmin(null);
    }
  };

  useEffect(() => {
    refreshAdmin().finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res: any = await adminApi.auth.login(email, password);
      if (res.success) {
        if (res.data?.role && res.data.role !== 'SUPER_ADMIN') {
          return { success: false, message: 'Access denied. Authorized Super Administrators only.' };
        }
        setAdmin(res.data);
        return { success: true };
      }
      return { success: false, message: res.message || 'Invalid admin credentials' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      await adminApi.auth.logout();
    } finally {
      setAdmin(null);
    }
  };

  return (
    <AdminAuthContext.Provider value={{ admin, isLoading, isAuthenticated: !!admin, login, logout, refreshAdmin }}>
      {children ?? <Outlet />}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
