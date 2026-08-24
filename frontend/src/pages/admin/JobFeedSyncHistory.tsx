import { useEffect, useState } from 'react';
import { adminApi } from '../../services/adminApi';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function JobFeedSyncHistory() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res: any = await adminApi.jobFeeds.syncHistory({ page: String(page), limit: '20' });
    if (res.success) { setLogs(res.data.logs); setTotal(res.data.total); setTotalPages(res.data.totalPages); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [page]);

  const STATUS_COLORS: Record<string, string> = {
    RUNNING: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700',
    PARTIAL: 'bg-amber-100 text-amber-700',
    FAILED: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a]">Sync History</h1>
        <p className="text-sm text-[#64748b] mt-1">{total} sync logs</p>
      </div>

      <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Source</th>
                <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Fetched</th>
                <th className="text-left px-4 py-3 font-semibold text-[#64748b]">New</th>
                <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Updated</th>
                <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Expired</th>
                <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Errors</th>
                <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Started</th>
                <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Duration</th>
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-[#e2e8f0] animate-pulse">
                  {[...Array(9)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-[#e2e8f0] rounded w-16" /></td>)}
                </tr>
              )) : logs.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-[#94a3b8]">No sync history</td></tr>
              ) : logs.map(l => (
                <tr key={l.id} className="border-b border-[#e2e8f0] hover:bg-[#f8fafc]">
                  <td className="px-4 py-3 font-medium text-[#0f172a]">{l.source.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[l.status] || 'bg-gray-100 text-gray-600'}`}>{l.status}</span>
                  </td>
                  <td className="px-4 py-3 text-[#0f172a]">{l.fetchedCount}</td>
                  <td className="px-4 py-3 text-green-600 font-medium">+{l.newCount}</td>
                  <td className="px-4 py-3 text-blue-600 font-medium">{l.updatedCount}</td>
                  <td className="px-4 py-3 text-amber-600 font-medium">{l.expiredCount}</td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${l.errorCount > 0 ? 'text-red-600' : 'text-[#0f172a]'}`}>{l.errorCount}</span>
                  </td>
                  <td className="px-4 py-3 text-[#64748b] text-xs">{new Date(l.startedAt).toLocaleString()}</td>
                  <td className="px-4 py-3 text-[#64748b] text-xs">
                    {l.completedAt ? `${Math.round((new Date(l.completedAt).getTime() - new Date(l.startedAt).getTime()) / 1000)}s` : '—'}
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
