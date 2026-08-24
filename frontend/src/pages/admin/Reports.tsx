import { useEffect, useState } from 'react';
import { adminApi } from '../../services/adminApi';
import { Search, ChevronLeft, ChevronRight, CheckCircle, XCircle, Eye } from 'lucide-react';

interface Report { id: number; targetType: string; targetId: number; reason: string; description?: string; status: string; createdAt: string; resolution?: string }

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-red-100 text-red-700',
  UNDER_REVIEW: 'bg-amber-100 text-amber-700',
  RESOLVED: 'bg-green-100 text-green-700',
  DISMISSED: 'bg-gray-100 text-gray-600',
};

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const params: Record<string, string> = { page: String(page), limit: '20' };
    if (status) params.status = status;
    const res: any = await adminApi.reports.list(params);
    if (res.success) { setReports(res.data.reports); setTotal(res.data.total); setTotalPages(res.data.totalPages); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [page, status]);

  const handleUpdate = async (id: number, newStatus: string) => {
    const resolution = prompt('Resolution notes:');
    if (resolution === null) return;
    await adminApi.reports.update(id, { status: newStatus, resolution });
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a]">Reports</h1>
        <p className="text-sm text-[#64748b] mt-1">{total} reports</p>
      </div>

      <div className="bg-white rounded-xl border border-[#e2e8f0] p-4">
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-[#e2e8f0] text-sm focus:outline-none focus:border-[#5b4fe8]">
          <option value="">All Status</option>
          <option value="OPEN">Open</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="RESOLVED">Resolved</option>
          <option value="DISMISSED">Dismissed</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
              <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Target</th>
              <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Reason</th>
              <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Description</th>
              <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Date</th>
              <th className="text-right px-4 py-3 font-semibold text-[#64748b]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? [...Array(5)].map((_, i) => (
              <tr key={i} className="border-b border-[#e2e8f0] animate-pulse">
                {[...Array(6)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-[#e2e8f0] rounded w-20" /></td>)}
              </tr>
            )) : reports.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-[#94a3b8]">No reports found</td></tr>
            ) : reports.map(r => (
              <tr key={r.id} className="border-b border-[#e2e8f0] hover:bg-[#f8fafc]">
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#f1f5f9] text-[#64748b]">{r.targetType} #{r.targetId}</span>
                </td>
                <td className="px-4 py-3 text-[#0f172a] font-medium">{r.reason.replace(/_/g, ' ')}</td>
                <td className="px-4 py-3 text-[#64748b] max-w-xs truncate">{r.description || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[r.status]}`}>{r.status.replace(/_/g, ' ')}</span>
                </td>
                <td className="px-4 py-3 text-[#64748b]">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {r.status === 'OPEN' && (
                      <button onClick={() => handleUpdate(r.id, 'UNDER_REVIEW')}
                        className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600" title="Review"><Eye className="w-4 h-4" /></button>
                    )}
                    {(r.status === 'OPEN' || r.status === 'UNDER_REVIEW') && (
                      <>
                        <button onClick={() => handleUpdate(r.id, 'RESOLVED')}
                          className="p-1.5 rounded-lg hover:bg-green-50 text-green-600" title="Resolve"><CheckCircle className="w-4 h-4" /></button>
                        <button onClick={() => handleUpdate(r.id, 'DISMISSED')}
                          className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-600" title="Dismiss"><XCircle className="w-4 h-4" /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
