import { useEffect, useState } from 'react';
import { adminApi } from '../../services/adminApi';
import { Users, Building2, Briefcase, FileText, TrendingUp, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

interface DashboardData {
  stats: {
    totalJobSeekers: number;
    totalCompanies: number;
    verifiedCompanies: number;
    pendingCompanies: number;
    suspendedCompanies: number;
    activeJobs: number;
    pendingJobs: number;
    totalApplications: number;
    interviewApplications: number;
    hiredApplications: number;
    reportedJobs: number;
    openReports: number;
    totalAdmins: number;
    externalFeedJobs: number;
  };
  recentActivity: any[];
  jobByStatus: any[];
  applicationsByStatus: any[];
  monthlyApplications: any[];
  monthlyUsers: any[];
  topCompanies: any[];
  feedSources: any[];
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[#64748b] font-medium">{label}</p>
          <p className="text-2xl font-bold text-[#0f172a] mt-1">{value.toLocaleString()}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.dashboard.get()
      .then((res: any) => { if (res.success) setData(res.data); })
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#e2e8f0] p-5 animate-pulse">
            <div className="h-4 bg-[#e2e8f0] rounded w-24 mb-3" />
            <div className="h-8 bg-[#e2e8f0] rounded w-16" />
          </div>
        ))}
      </div>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
      <p className="text-red-700 font-medium">{error}</p>
    </div>
  );

  if (!data) return null;
  const s = data.stats;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a]">Dashboard</h1>
        <p className="text-sm text-[#64748b] mt-1">Platform overview and key metrics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Job Seekers" value={s.totalJobSeekers} color="bg-blue-50 text-blue-600" />
        <StatCard icon={Building2} label="Total Companies" value={s.totalCompanies} color="bg-purple-50 text-purple-600" />
        <StatCard icon={Briefcase} label="Active Jobs" value={s.activeJobs} color="bg-green-50 text-green-600" />
        <StatCard icon={FileText} label="Total Applications" value={s.totalApplications} color="bg-amber-50 text-amber-600" />
        <StatCard icon={CheckCircle} label="Hired Candidates" value={s.hiredApplications} color="bg-emerald-50 text-emerald-600" />
        <StatCard icon={Clock} label="Pending Jobs" value={s.pendingJobs} color="bg-orange-50 text-orange-600" />
        <StatCard icon={AlertTriangle} label="Reported Jobs" value={s.reportedJobs} color="bg-red-50 text-red-600" />
        <StatCard icon={TrendingUp} label="External Feed Jobs" value={s.externalFeedJobs} color="bg-cyan-50 text-cyan-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
          <h3 className="text-sm font-bold text-[#0f172a] uppercase tracking-wider mb-4">Job Status Distribution</h3>
          <div className="space-y-3">
            {data.jobByStatus.map((item: any) => (
              <div key={item.status} className="flex items-center justify-between">
                <span className="text-sm text-[#64748b]">{item.status}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#5b4fe8] rounded-full" style={{ width: `${Math.min((item._count / Math.max(s.activeJobs, 1)) * 100, 100)}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-[#0f172a] w-8 text-right">{item._count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
          <h3 className="text-sm font-bold text-[#0f172a] uppercase tracking-wider mb-4">Top Companies</h3>
          <div className="space-y-3">
            {data.topCompanies.slice(0, 5).map((c: any) => (
              <div key={c.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#f1f5f9] flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-[#64748b]" />
                  </div>
                  <span className="text-sm font-medium text-[#0f172a]">{c.name}</span>
                </div>
                <span className="text-sm text-[#64748b]">{c._count.jobs} jobs</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
          <h3 className="text-sm font-bold text-[#0f172a] uppercase tracking-wider mb-4">Feed Sources</h3>
          <div className="space-y-3">
            {data.feedSources.length === 0 && <p className="text-sm text-[#94a3b8]">No feed sources configured</p>}
            {data.feedSources.map((f: any) => (
              <div key={f.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${f.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <span className="text-sm font-medium text-[#0f172a]">{f.name}</span>
                </div>
                <span className="text-sm text-[#64748b]">{f.totalJobs} jobs</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
          <h3 className="text-sm font-bold text-[#0f172a] uppercase tracking-wider mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {data.recentActivity.length === 0 && <p className="text-sm text-[#94a3b8]">No recent activity</p>}
            {data.recentActivity.slice(0, 5).map((a: any) => (
              <div key={a.id} className="flex items-start gap-3 py-2">
                <div className="w-2 h-2 rounded-full bg-[#5b4fe8] mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm text-[#0f172a]">
                    <span className="font-semibold">{a.admin.firstName} {a.admin.lastName}</span>
                    {' '}{a.action.replace(/_/g, ' ').toLowerCase()}
                  </p>
                  <p className="text-xs text-[#94a3b8] mt-0.5">{new Date(a.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
