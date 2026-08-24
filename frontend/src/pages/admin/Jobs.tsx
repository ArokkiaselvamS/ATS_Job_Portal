import { useEffect, useState } from 'react';
import { adminApi } from '../../services/adminApi';
import { Search, ChevronLeft, ChevronRight, CheckCircle, XCircle, Ban, Pause, Play, StopCircle } from 'lucide-react';

interface Job {
  id: number; title: string; location?: string; jobType: string; workMode: string;
  status: string; source: string; isReported: boolean; reportCount: number; views: number;
  createdAt: string; closingDate?: string;
  company: { id: number; name: string; logo?: string };
  _count: { applications: number };
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  PENDING_REVIEW: 'bg-amber-100 text-amber-700',
  ACTIVE: 'bg-green-100 text-green-700',
  PUBLISHED: 'bg-green-100 text-green-700',
  PAUSED: 'bg-gray-100 text-gray-600',
  INACTIVE: 'bg-gray-100 text-gray-600',
  CLOSED: 'bg-red-100 text-red-700',
  EXPIRED: 'bg-red-100 text-red-700',
  REJECTED: 'bg-red-100 text-red-700',
  SUSPENDED: 'bg-amber-100 text-amber-700',
};

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [source, setSource] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '15' };
      if (search) params.search = search;
      if (status) params.status = status;
      if (source) params.source = source;
      const res: any = await adminApi.jobs.list(params);
      if (res.success) { setJobs(res.data.jobs); setTotal(res.data.total); setTotalPages(res.data.totalPages); }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, status, source]);

  const handleAction = async (id: number, action: 'approve' | 'reject' | 'suspend' | 'pause' | 'resume' | 'close') => {
    if (action === 'reject') {
      const reason = prompt('Rejection reason:');
      if (!reason) return;
      setActionLoading(id);
      await adminApi.jobs.reject(id, reason);
    } else if (action === 'suspend') {
      const reason = prompt('Suspension reason:');
      if (!reason) return;
      setActionLoading(id);
      await adminApi.jobs.suspend(id, reason);
    } else {
      if (!confirm(`Are you sure you want to ${action} this job?`)) return;
      setActionLoading(id);
      if (action === 'approve') await adminApi.jobs.approve(id);
      else if (action === 'pause') await adminApi.jobs.pause(id);
      else if (action === 'resume') await adminApi.jobs.resume(id);
      else if (action === 'close') await adminApi.jobs.close(id);
    }
    await load();
    setActionLoading(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a]">Jobs</h1>
        <p className="text-sm text-[#64748b] mt-1">{total} total jobs</p>
      </div>

      <div className="bg-white rounded-xl border border-[#e2e8f0] p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
            <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()}
              placeholder="Search jobs..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#e2e8f0] text-sm focus:outline-none focus:border-[#5b4fe8]" />
          </div>
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-[#e2e8f0] text-sm focus:outline-none focus:border-[#5b4fe8]">
            <option value="">All Status</option>
            {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
          <select value={source} onChange={e => { setSource(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-[#e2e8f0] text-sm focus:outline-none focus:border-[#5b4fe8]">
            <option value="">All Sources</option>
            <option value="INTERNAL">Internal</option>
            <option value="GREENHOUSE">Greenhouse</option>
            <option value="LEVER">Lever</option>
            <option value="OTHER">Other</option>
          </select>
          <button onClick={load} className="px-4 py-2 rounded-lg bg-[#5b4fe8] text-white text-sm font-medium hover:bg-[#4636c9]">Search</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Job</th>
                <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Company</th>
                <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Source</th>
                <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Apps</th>
                <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-[#64748b]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-[#e2e8f0] animate-pulse">
                  {[...Array(6)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-[#e2e8f0] rounded w-20" /></td>)}
                </tr>
              )) : jobs.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-[#94a3b8]">No jobs found</td></tr>
              ) : jobs.map(j => (
                <tr key={j.id} className="border-b border-[#e2e8f0] hover:bg-[#f8fafc]">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-[#0f172a]">{j.title}</p>
                      <p className="text-xs text-[#94a3b8]">{j.location || 'Remote'}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#64748b]">{j.company.name}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#f1f5f9] text-[#64748b]">{j.source}</span>
                  </td>
                  <td className="px-4 py-3 text-[#0f172a] font-medium">{j._count.applications}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[j.status] || 'bg-gray-100 text-gray-600'}`}>
                      {j.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {j.status === 'PENDING_REVIEW' && (
                        <>
                          <button onClick={() => handleAction(j.id, 'approve')} disabled={actionLoading === j.id}
                            className="p-1.5 rounded-lg hover:bg-green-50 text-green-600" title="Approve"><CheckCircle className="w-4 h-4" /></button>
                          <button onClick={() => handleAction(j.id, 'reject')} disabled={actionLoading === j.id}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-600" title="Reject"><XCircle className="w-4 h-4" /></button>
                        </>
                      )}
                      {j.status === 'ACTIVE' && (
                        <>
                          <button onClick={() => handleAction(j.id, 'pause')} disabled={actionLoading === j.id}
                            className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600" title="Pause"><Pause className="w-4 h-4" /></button>
                          <button onClick={() => handleAction(j.id, 'suspend')} disabled={actionLoading === j.id}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-600" title="Suspend"><Ban className="w-4 h-4" /></button>
                        </>
                      )}
                      {j.status === 'PAUSED' && (
                        <button onClick={() => handleAction(j.id, 'resume')} disabled={actionLoading === j.id}
                          className="p-1.5 rounded-lg hover:bg-green-50 text-green-600" title="Resume"><Play className="w-4 h-4" /></button>
                      )}
                    </div>
                  </td>
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
