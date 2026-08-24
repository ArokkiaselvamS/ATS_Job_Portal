import { useEffect, useState } from 'react';
import { adminApi } from '../../services/adminApi';
import { ChevronLeft, ChevronRight, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

export default function JobFeedFailedJobs() {
  const [errors, setErrors] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    const res: any = await adminApi.jobFeeds.failedJobs({ page: String(page), limit: '20' });
    if (res.success) { setErrors(res.data.errors); setTotal(res.data.total); setTotalPages(res.data.totalPages); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [page]);

  const handleRetry = async (id: number) => {
    setRetrying(id);
    await adminApi.jobFeeds.retryFailed(id);
    setRetrying(null); load();
  };

  const STATUS_COLORS: Record<string, string> = {
    OPEN: 'bg-red-100 text-red-700',
    RETRYING: 'bg-amber-100 text-amber-700',
    RESOLVED: 'bg-green-100 text-green-700',
    IGNORED: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a]">Failed Jobs</h1>
        <p className="text-sm text-[#64748b] mt-1">{total} failed imports</p>
      </div>

      <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Source</th>
                <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Job Title</th>
                <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Error</th>
                <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Retries</th>
                <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Date</th>
                <th className="text-right px-4 py-3 font-semibold text-[#64748b]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-[#e2e8f0] animate-pulse">
                  {[...Array(7)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-[#e2e8f0] rounded w-20" /></td>)}
                </tr>
              )) : errors.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-[#94a3b8]">No failed jobs</td></tr>
              ) : errors.map(e => (
                <tr key={e.id} className="border-b border-[#e2e8f0] hover:bg-[#f8fafc]">
                  <td className="px-4 py-3 font-medium text-[#0f172a]">{e.source.name}</td>
                  <td className="px-4 py-3 text-[#64748b]">{e.jobTitle || '—'}</td>
                  <td className="px-4 py-3 text-red-600 text-xs max-w-xs truncate">{e.errorMessage}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[e.status]}`}>{e.status}</span>
                  </td>
                  <td className="px-4 py-3 text-[#64748b]">{e.retryCount}</td>
                  <td className="px-4 py-3 text-[#64748b] text-xs">{new Date(e.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {e.status !== 'RESOLVED' && e.status !== 'IGNORED' && (
                        <button onClick={() => handleRetry(e.id)} disabled={retrying === e.id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#5b4fe8]/10 text-[#5b4fe8] text-xs font-medium hover:bg-[#5b4fe8]/20 disabled:opacity-50">
                          {retrying === e.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                          Retry
                        </button>
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
