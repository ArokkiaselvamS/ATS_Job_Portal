import { useEffect, useState } from 'react';
import { adminApi } from '../../services/adminApi';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import {
  Users, Building2, Briefcase, FileText, TrendingUp, AlertTriangle, Clock, CheckCircle,
  ShieldCheck, Hourglass, PlusSquare, UserCheck, UserPlus, Calendar
} from 'lucide-react';

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
    newCompanies: number;
    jobsPostedByCompanies: number;
    shortlistedCandidates: number;
    newUsers: number;
    applicationsToday: number;
    applicationsThisWeek: number;
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

function SuperAdminStatCard({
  icon: Icon,
  label,
  value,
  iconColor,
  bgColor
}: {
  icon: any;
  label: string;
  value: number;
  iconColor: string;
  bgColor: string;
}) {
  return (
    <div className="bg-white rounded-none border border-[#e2e8f0] p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow duration-200">
      <div>
        <p className="text-xs uppercase tracking-wider text-[#64748b] font-semibold">{label}</p>
        <p className="text-3xl font-extrabold text-[#0f172a] mt-2 tracking-tight">{value.toLocaleString()}</p>
      </div>
      <div className={`w-12 h-12 rounded-none flex items-center justify-center ${bgColor} ${iconColor} border border-current border-opacity-10`}>
        <Icon className="w-6 h-6 stroke-[1.75]" />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { admin } = useAdminAuth();

  useEffect(() => {
    adminApi.dashboard.get()
      .then((res: any) => { if (res.success) setData(res.data); })
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const isSuperAdmin = admin?.role === 'SUPER_ADMIN';

  if (loading) {
    return (
      <div className="space-y-6">
        {isSuperAdmin && (
          <div>
            <div className="h-8 bg-[#e2e8f0] rounded w-48 mb-2 animate-pulse" />
            <div className="h-4 bg-[#e2e8f0] rounded w-64 mb-6 animate-pulse" />
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(isSuperAdmin ? 16 : 8)].map((_, i) => (
            <div
              key={i}
              className={`bg-white border border-[#e2e8f0] p-6 animate-pulse ${
                isSuperAdmin ? 'rounded-none shadow-sm h-[116px]' : 'rounded-xl h-[94px]'
              }`}
            >
              <div className="h-4 bg-[#e2e8f0] rounded w-28 mb-4" />
              <div className="h-8 bg-[#e2e8f0] rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-700 font-medium">{error}</p>
      </div>
    );
  }

  if (!data) return null;
  const s = data.stats;

  if (isSuperAdmin) {
    return (
      <div className="space-y-8 bg-[#f8fafc] -m-6 p-6 min-h-screen">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Dashboard</h1>
          <p className="text-sm text-[#64748b] mt-1">Platform overview and key metrics</p>
        </div>

        {/* 16 Metric Cards in 4-column x 4-row grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Row 1 */}
          <SuperAdminStatCard icon={Users} label="Total Job Seekers" value={s.totalJobSeekers} iconColor="text-blue-600" bgColor="bg-blue-50" />
          <SuperAdminStatCard icon={Building2} label="Total Companies" value={s.totalCompanies} iconColor="text-purple-600" bgColor="bg-purple-50" />
          <SuperAdminStatCard icon={Briefcase} label="Active Jobs" value={s.activeJobs} iconColor="text-green-600" bgColor="bg-green-50" />
          <SuperAdminStatCard icon={FileText} label="Total Applications" value={s.totalApplications} iconColor="text-teal-600" bgColor="bg-teal-50" />

          {/* Row 2 */}
          <SuperAdminStatCard icon={CheckCircle} label="Hired Candidates" value={s.hiredApplications} iconColor="text-emerald-600" bgColor="bg-emerald-50" />
          <SuperAdminStatCard icon={Clock} label="Pending Jobs" value={s.pendingJobs} iconColor="text-orange-600" bgColor="bg-orange-50" />
          <SuperAdminStatCard icon={AlertTriangle} label="Reported Jobs" value={s.reportedJobs} iconColor="text-red-600" bgColor="bg-red-50" />
          <SuperAdminStatCard icon={TrendingUp} label="External Feed Jobs" value={s.externalFeedJobs} iconColor="text-cyan-600" bgColor="bg-cyan-50" />

          {/* Row 3 */}
          <SuperAdminStatCard icon={ShieldCheck} label="Verified Companies" value={s.verifiedCompanies} iconColor="text-indigo-600" bgColor="bg-indigo-50" />
          <SuperAdminStatCard icon={Hourglass} label="Pending Companies" value={s.pendingCompanies} iconColor="text-amber-600" bgColor="bg-amber-50" />
          <SuperAdminStatCard icon={PlusSquare} label="New Companies" value={s.newCompanies || 0} iconColor="text-fuchsia-600" bgColor="bg-fuchsia-50" />
          <SuperAdminStatCard icon={Building2} label="Jobs Posted by Companies" value={s.jobsPostedByCompanies || 0} iconColor="text-pink-600" bgColor="bg-pink-50" />

          {/* Row 4 */}
          <SuperAdminStatCard icon={UserCheck} label="Shortlisted Candidates" value={s.shortlistedCandidates || 0} iconColor="text-violet-600" bgColor="bg-violet-50" />
          <SuperAdminStatCard icon={UserPlus} label="New Users" value={s.newUsers || 0} iconColor="text-rose-600" bgColor="bg-rose-50" />
          <SuperAdminStatCard icon={Calendar} label="Applications Today" value={s.applicationsToday || 0} iconColor="text-sky-600" bgColor="bg-sky-50" />
          <SuperAdminStatCard icon={Calendar} label="Applications This Week" value={s.applicationsThisWeek || 0} iconColor="text-emerald-600" bgColor="bg-emerald-50" />
        </div>

        {/* Lower Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Job Status Distribution */}
          <div className="bg-white rounded-none border border-[#e2e8f0] p-6 shadow-sm">
            <h3 className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-6 border-b border-[#f1f5f9] pb-3">Job Status Distribution</h3>
            <div className="space-y-4">
              {data.jobByStatus.map((item: any) => (
                <div key={item.status} className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#334155]">{item.status}</span>
                  <div className="flex items-center gap-4">
                    <div className="w-40 h-2 bg-[#f1f5f9] rounded-none overflow-hidden">
                      <div className="h-full bg-[#5b4fe8] rounded-none" style={{ width: `${Math.min((item._count / Math.max(s.activeJobs, 1)) * 100, 100)}%` }} />
                    </div>
                    <span className="text-sm font-bold text-[#0f172a] w-10 text-right">{item._count.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Companies */}
          <div className="bg-white rounded-none border border-[#e2e8f0] p-6 shadow-sm">
            <h3 className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-6 border-b border-[#f1f5f9] pb-3">Top Companies</h3>
            <div className="divide-y divide-[#f1f5f9]">
              {data.topCompanies.slice(0, 5).map((c: any) => (
                <div key={c.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-none bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center text-[#64748b]">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-[#0f172a]">{c.name}</span>
                  </div>
                  <span className="text-xs font-bold bg-[#f1f5f9] text-[#475569] px-2.5 py-1 rounded-none border border-[#e2e8f0]">{c._count.jobs} jobs</span>
                </div>
              ))}
            </div>
          </div>

          {/* Feed Sources */}
          <div className="bg-white rounded-none border border-[#e2e8f0] p-6 shadow-sm">
            <h3 className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-6 border-b border-[#f1f5f9] pb-3">Feed Sources</h3>
            <div className="divide-y divide-[#f1f5f9]">
              {data.feedSources.length === 0 && <p className="text-sm text-[#94a3b8] py-4">No feed sources configured</p>}
              {data.feedSources.map((f: any) => (
                <div key={f.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-none ${f.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    <span className="text-sm font-semibold text-[#0f172a]">{f.name}</span>
                  </div>
                  <span className="text-xs font-bold bg-[#f1f5f9] text-[#475569] px-2.5 py-1 rounded-none border border-[#e2e8f0]">{f.totalJobs} jobs</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-none border border-[#e2e8f0] p-6 shadow-sm">
            <h3 className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-6 border-b border-[#f1f5f9] pb-3">Recent Activity</h3>
            <div className="space-y-4">
              {data.recentActivity.length === 0 && <p className="text-sm text-[#94a3b8] py-4">No recent activity</p>}
              {data.recentActivity.slice(0, 5).map((a: any) => (
                <div key={a.id} className="flex items-start gap-4 py-1">
                  <div className="w-2.5 h-2.5 rounded-none bg-[#5b4fe8] mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#334155] leading-relaxed">
                      <span className="font-semibold text-[#0f172a]">{a.admin.firstName} {a.admin.lastName}</span>
                      {' '}{a.action.replace(/_/g, ' ').toLowerCase()}
                    </p>
                    <p className="text-[11px] text-[#94a3b8] mt-0.5 font-medium">{new Date(a.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Original UI for non-Super Admin roles (if any)
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
