import { useCompanyAdminAuth } from '../../hooks/useCompanyAdminAuth';
import { Building2, Briefcase, Users, FileText, Calendar, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '../../api/client';

interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  pendingApplications: number;
  teamMembers: number;
  hired: number;
  recentApplications: any[];
}

export default function CompanyAdminDashboard() {
  const { admin } = useCompanyAdminAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/company-admin/dashboard/stats');
        if (res.data.success) {
          setStats(res.data.data);
        } else {
          setError('Failed to load dashboard data');
        }
      } catch {
        setError('Unable to connect to server');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Active Jobs', value: stats?.activeJobs ?? 0, icon: Briefcase, color: 'bg-blue-500', path: '/company-admin/jobs' },
    { label: 'Total Applications', value: stats?.totalApplications ?? 0, icon: FileText, color: 'bg-indigo-500', path: '/company-admin/applications' },
    { label: 'Pending Reviews', value: stats?.pendingApplications ?? 0, icon: Clock, color: 'bg-amber-500', path: '/company-admin/applications' },
    { label: 'Team Members', value: stats?.teamMembers ?? 0, icon: Users, color: 'bg-green-500', path: '/company-admin/team' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600 mt-1">Loading dashboard...</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-slate-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">Welcome back, {admin?.firstName}! Here's your company overview.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/company-admin/jobs" className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors">
            Post a Job
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3 text-red-700">
          <AlertCircle size={20} />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link key={stat.label} to={stat.path} className="block">
            <div className="bg-white rounded-xl border border-slate-200 p-6 hover:border-blue-200 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="mt-1 text-3xl font-bold text-slate-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.color} text-white`}>
                  <stat.icon size={24} />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Applications</h2>
          {stats?.recentApplications && stats.recentApplications.length > 0 ? (
            <div className="space-y-3">
              {stats.recentApplications.map((app: any) => (
                <div key={app.id} className="flex items-center gap-4 p-3 rounded-lg bg-blue-50 border border-blue-100">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                    <FileText size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900">{app.user.firstName} {app.user.lastName}</p>
                    <p className="text-sm text-slate-500 truncate">Applied for {app.job.title}</p>
                    <p className="text-xs text-slate-400 mt-1">{new Date(app.appliedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <FileText size={40} className="mx-auto mb-2 text-slate-300" />
              <p>No recent applications</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link to="/company-admin/jobs" className="block p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <Briefcase size={20} />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Post New Job</p>
                  <p className="text-sm text-slate-500">Create a new job listing</p>
                </div>
              </div>
            </Link>
            <Link to="/company-admin/applications" className="block p-4 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Review Applications</p>
                  <p className="text-sm text-slate-500">{stats?.pendingApplications ?? 0} applications pending review</p>
                </div>
              </div>
            </Link>
            <Link to="/company-admin/candidates" className="block p-4 rounded-lg border border-slate-200 hover:border-green-300 hover:bg-green-50 transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 text-green-600">
                  <Users size={20} />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Browse Candidates</p>
                  <p className="text-sm text-slate-500">Search talent pool</p>
                </div>
              </div>
            </Link>
            <Link to="/company-admin/interviews" className="block p-4 rounded-lg border border-slate-200 hover:border-amber-300 hover:bg-amber-50 transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Schedule Interviews</p>
                  <p className="text-sm text-slate-500">Manage interview calendar</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Company Status</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 text-green-600">
                <CheckCircle size={20} />
              </div>
              <div>
                <p className="font-medium text-slate-900">Company Verified</p>
                <p className="text-sm text-slate-500">Approved by Super Admin</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <Building2 size={20} />
              </div>
              <div>
                <p className="font-medium text-slate-900">{admin?.companyName}</p>
                <p className="text-sm text-slate-500">{stats?.activeJobs ?? 0} active job posts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}