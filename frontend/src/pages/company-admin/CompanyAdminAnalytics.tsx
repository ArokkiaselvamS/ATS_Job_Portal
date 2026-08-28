import { BarChart3, TrendingUp, TrendingDown, Users, Briefcase, FileText, Clock, UserCheck, Loader2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../../api/client';

interface AnalyticsData {
  totalViews: number;
  totalApplications: number;
  totalHires: number;
  totalJobs: number;
  activeJobs: number;
  applicationsByStatus: { status: string; count: number }[];
  jobsPerformance: { title: string; views: number; applications: number; rate: string }[];
}

export default function CompanyAdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/company-admin/analytics');
        if (res.data.success) { setData(res.data.data); }
        else { setError('Failed to load analytics'); }
      } catch { setError('Unable to connect to server'); } finally { setLoading(false); }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-slate-900">Analytics</h1><p className="text-slate-600 mt-1">Loading...</p></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[1,2,3,4].map(i => <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse"><div className="h-4 bg-slate-200 rounded w-24 mb-2"></div><div className="h-8 bg-slate-200 rounded w-16"></div></div>)}</div>
      </div>
    );
  }

  const metrics = data ? [
    { label: 'Total Views', value: data.totalViews.toLocaleString(), icon: BarChart3, color: 'bg-blue-500' },
    { label: 'Applications', value: data.totalApplications.toLocaleString(), icon: FileText, color: 'bg-indigo-500' },
    { label: 'Hires', value: String(data.totalHires), icon: UserCheck, color: 'bg-green-500' },
    { label: 'Active Jobs', value: String(data.activeJobs), icon: Briefcase, color: 'bg-amber-500' },
  ] : [];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">Analytics</h1><p className="text-slate-600 mt-1">Track your hiring performance</p></div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3 text-red-700"><AlertCircle size={20} /><p className="text-sm">{error}</p></div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium text-slate-500">{m.label}</p><p className="mt-1 text-3xl font-bold text-slate-900">{m.value}</p></div>
              <div className={`p-3 rounded-xl ${m.color} text-white`}><m.icon size={24} /></div>
            </div>
          </div>
        ))}
      </div>

      {data && data.applicationsByStatus.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Applications by Status</h2>
          <div className="space-y-3">
            {data.applicationsByStatus.map((s) => {
              const pct = data.totalApplications > 0 ? Math.round((s.count / data.totalApplications) * 100) : 0;
              const colors: Record<string, string> = { APPLIED: 'bg-blue-600', SCREENING: 'bg-amber-500', INTERVIEW: 'bg-purple-500', OFFER: 'bg-green-500', ACCEPTED: 'bg-green-600', REJECTED: 'bg-red-500', WITHDRAWN: 'bg-slate-400' };
              return (
                <div key={s.status} className="flex items-center gap-4">
                  <div className="w-40 text-sm text-slate-600">{s.status.replace('_', ' ')}</div>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${colors[s.status] || 'bg-blue-600'}`} style={{ width: `${pct}%` }} /></div>
                  <div className="w-16 text-right text-sm font-medium text-slate-900">{s.count}</div>
                  <div className="w-16 text-right text-sm text-slate-500">{pct}%</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {data && data.jobsPerformance.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Jobs Performance</h2>
          <div className="space-y-3">
            {data.jobsPerformance.map((j) => (
              <div key={j.title} className="p-3 rounded-lg bg-slate-50">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-900">{j.title}</p>
                  <span className="text-sm font-semibold text-blue-600">{j.rate}% conversion</span>
                </div>
                <div className="flex gap-4 mt-2 text-sm text-slate-500">
                  <span className="flex items-center gap-1"><BarChart3 size={14} />{j.views} views</span>
                  <span className="flex items-center gap-1"><FileText size={14} />{j.applications} applications</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}