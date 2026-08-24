import { useEffect, useState } from 'react';
import { adminApi } from '../../services/adminApi';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface Application {
  id: number; status: string; appliedAt: string;
  user: { id: number; firstName: string; lastName: string; email: string };
  job: { id: number; title: string; company: { name: string } };
}

const STATUS_COLORS: Record<string, string> = {
  SAVED: 'bg-gray-100 text-gray-600',
  APPLIED: 'bg-blue-100 text-blue-700',
  SCREENING: 'bg-amber-100 text-amber-700',
  INTERVIEW: 'bg-purple-100 text-purple-700',
  OFFER: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  ACCEPTED: 'bg-emerald-100 text-emerald-700',
  WITHDRAWN: 'bg-gray-100 text-gray-600',
};

export default function Applications() {
  const [apps, setApps] = useState<Application[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '20' };
      if (search) params.search = search;
      if (status) params.status = status;
      const res: any = await adminApi.applications.list(params);
      if (res.success) { setApps(res.data.applications); setTotal(res.data.total); setTotalPages(res.data.totalPages); }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, status]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a]">Applications</h1>
        <p className="text-sm text-[#64748b] mt-1">{total} total applications</p>
      </div>

      <div className="bg-white rounded-xl border border-[#e2e8f0] p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
            <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()}
              placeholder="Search by candidate or job..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#e2e8f0] text-sm focus:outline-none focus:border-[#5b4fe8]" />
          </div>
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-[#e2e8f0] text-sm focus:outline-none focus:border-[#5b4fe8]">
            <option value="">All Status</option>
            {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={load} className="px-4 py-2 rounded-lg bg-[#5b4fe8] text-white text-sm font-medium hover:bg-[#4636c9]">Search</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Candidate</th>
                <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Job</th>
                <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Company</th>
                <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Applied</th>
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-[#e2e8f0] animate-pulse">
                  {[...Array(5)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-[#e2e8f0] rounded w-20" /></td>)}
                </tr>
              )) : apps.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-[#94a3b8]">No applications found</td></tr>
              ) : apps.map(a => (
                <tr key={a.id} className="border-b border-[#e2e8f0] hover:bg-[#f8fafc]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#e2e8f0] flex items-center justify-center text-xs font-bold text-[#64748b]">
                        {a.user.firstName[0]}{a.user.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-[#0f172a]">{a.user.firstName} {a.user.lastName}</p>
                        <p className="text-xs text-[#94a3b8]">{a.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#0f172a] font-medium">{a.job.title}</td>
                  <td className="px-4 py-3 text-[#64748b]">{a.job.company.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[a.status] || 'bg-gray-100 text-gray-600'}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#64748b]">{new Date(a.appliedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#e2e8f0]">
            <p className="text-sm text-[#64748b]">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-[#f1f5f9] disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg hover:bg-[#f1f5f9] disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
