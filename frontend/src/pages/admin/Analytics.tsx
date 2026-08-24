import { useEffect, useState } from 'react';
import { adminApi } from '../../services/adminApi';
import { BarChart3, TrendingUp, Users, Briefcase, Building2, FileText } from 'lucide-react';

export default function Analytics() {
  const [data, setData] = useState<any>(null);
  const [period, setPeriod] = useState('30');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res: any = await adminApi.analytics.get(period);
    if (res.success) setData(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [period]);

  if (loading) return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-xl border border-[#e2e8f0] p-6 h-32 animate-pulse" />)}</div>;
  if (!data) return null;

  const s = data.summary;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Analytics</h1>
          <p className="text-sm text-[#64748b] mt-1">Platform performance insights</p>
        </div>
        <select value={period} onChange={e => setPeriod(e.target.value)}
          className="px-3 py-2 rounded-lg border border-[#e2e8f0] text-sm focus:outline-none focus:border-[#5b4fe8]">
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 3 Months</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: s.totalUsers, icon: Users, color: 'bg-blue-50 text-blue-600' },
          { label: 'New Users', value: s.newUsers, icon: Users, color: 'bg-blue-50 text-blue-500' },
          { label: 'Total Jobs', value: s.totalJobs, icon: Briefcase, color: 'bg-green-50 text-green-600' },
          { label: 'New Jobs', value: s.newJobs, icon: Briefcase, color: 'bg-green-50 text-green-500' },
          { label: 'Applications', value: s.totalApplications, icon: FileText, color: 'bg-purple-50 text-purple-600' },
          { label: 'New Applications', value: s.newApplications, icon: FileText, color: 'bg-purple-50 text-purple-500' },
          { label: 'Companies', value: s.totalCompanies, icon: Building2, color: 'bg-amber-50 text-amber-600' },
          { label: 'Hired', value: s.hiredCount, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600' },
        ].map((item, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#e2e8f0] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748b] font-medium">{item.label}</p>
                <p className="text-2xl font-bold text-[#0f172a] mt-1">{item.value}</p>
              </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${item.color}`}>
                <item.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
          <h3 className="text-sm font-bold text-[#0f172a] uppercase tracking-wider mb-4">Jobs by Type</h3>
          <div className="space-y-3">
            {data.jobsByType.map((item: any) => (
              <div key={item.jobType} className="flex items-center justify-between">
                <span className="text-sm text-[#64748b]">{item.jobType.replace(/_/g, ' ')}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#5b4fe8] rounded-full" style={{ width: `${Math.min((item._count / Math.max(s.totalJobs, 1)) * 100, 100)}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-[#0f172a] w-8 text-right">{item._count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
          <h3 className="text-sm font-bold text-[#0f172a] uppercase tracking-wider mb-4">Applications by Status</h3>
          <div className="space-y-3">
            {data.applicationsByStatus.map((item: any) => (
              <div key={item.status} className="flex items-center justify-between">
                <span className="text-sm text-[#64748b]">{item.status}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#f9791e] rounded-full" style={{ width: `${Math.min((item._count / Math.max(s.totalApplications, 1)) * 100, 100)}%` }} />
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
                <span className="text-sm font-medium text-[#0f172a]">{c.name}</span>
                <span className="text-sm text-[#64748b]">{c._count.jobs} jobs</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
          <h3 className="text-sm font-bold text-[#0f172a] uppercase tracking-wider mb-4">Top Jobs by Applications</h3>
          <div className="space-y-3">
            {data.topJobs.slice(0, 5).map((j: any) => (
              <div key={j.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-[#0f172a]">{j.title}</p>
                  <p className="text-xs text-[#94a3b8]">{j.company.name}</p>
                </div>
                <span className="text-sm text-[#64748b]">{j._count.applications} apps</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
