import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { api } from '../api/client';
import CompanyAdminSidebar from '../components/company-admin/CompanyAdminSidebar';
import CompanyAdminTopbar from '../components/company-admin/CompanyAdminTopbar';

interface CompanyAdminUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  profileImage?: string;
  companyId: number;
  companyName: string;
  companyVerificationStatus: string;
}

interface CompanyAdminAuthContextType {
  admin: CompanyAdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshAdmin: () => Promise<void>;
}

const CompanyAdminAuthContext = createContext<CompanyAdminAuthContextType | undefined>(undefined);

export function CompanyAdminAuthProvider({ children }: { children?: ReactNode }) {
  const [admin, setAdmin] = useState<CompanyAdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAdmin = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success && res.data.data?.role === 'COMPANY_ADMIN') {
        const userData = res.data.data;
        const companyRes = await api.get('/company/me');
        if (companyRes.data.success && companyRes.data.data) {
          setAdmin({
            ...userData,
            companyId: companyRes.data.data.id,
            companyName: companyRes.data.data.name,
            companyVerificationStatus: companyRes.data.data.verificationStatus,
          });
        } else {
          setAdmin(null);
        }
      } else {
        setAdmin(null);
      }
    } catch {
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAdmin();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        if (res.data.data?.role !== 'COMPANY_ADMIN') {
          await api.post('/auth/logout');
          return { success: false, message: 'Access denied. Company admin privileges required.' };
        }
        const userData = res.data.data;
        const companyRes = await api.get('/company/me');
        if (!companyRes.data.success || !companyRes.data.data) {
          await api.post('/auth/logout');
          return { success: false, message: 'Company not found.' };
        }
        const company = companyRes.data.data;
        if (company.verificationStatus !== 'VERIFIED') {
          await api.post('/auth/logout');
          return { success: false, message: `Company is ${company.verificationStatus.toLowerCase()}. Access denied.` };
        }
        setAdmin({
          ...userData,
          companyId: company.id,
          companyName: company.name,
          companyVerificationStatus: company.verificationStatus,
        });
        return { success: true };
      }
      return { success: false, message: res.data.message || 'Invalid credentials' };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setAdmin(null);
    }
  };

  return (
    <CompanyAdminAuthContext.Provider value={{ admin, isLoading, isAuthenticated: !!admin, login, logout, refreshAdmin }}>
      {children ?? <Outlet />}
    </CompanyAdminAuthContext.Provider>
  );
}

export function CompanyAdminLayout({ children }: { children?: ReactNode }) {
  const { isAuthenticated, isLoading, admin } = useCompanyAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-slate-200 border-t-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/company-admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <CompanyAdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} companyName={admin?.companyName} />
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <CompanyAdminTopbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function useCompanyAdminAuth() {
  const ctx = useContext(CompanyAdminAuthContext);
  if (!ctx) throw new Error('useCompanyAdminAuth must be used within CompanyAdminAuthProvider');
  return ctx;
}