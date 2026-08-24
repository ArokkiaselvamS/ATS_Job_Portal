import { useEffect, useState } from 'react';
import { adminApi } from '../../services/adminApi';
import { Search, ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react';

export default function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const params: Record<string, string> = { page: String(page), limit: '20' };
    if (action) params.action = action;
    if (entityType) params.entityType = entityType;
    const res: any = await adminApi.auditLogs.list(params);
    if (res.success) { setLogs(res.data.logs); setTotal(res.data.total); setTotalPages(res.data.totalPages); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a]">Audit Logs</h1>
        <p className="text-sm text-[#64748b] mt-1">{total} audit entries</p>
      </div>

      <div className="bg-white rounded-xl border border-[#e2e8f0] p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input value={action} onChange={e => setAction(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()}
            placeholder="Filter by action..." className="flex-1 px-3 py-2 rounded-lg border border-[#e2e8f0] text-sm focus:outline-none focus:border-[#5b4fe8]" />
          <select value={entityType} onChange={e => { setEntityType(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-[#e2e8f0] text-sm focus:outline-none focus:border-[#5b4fe8]">
            <option value="">All Entities</option>
            <option value="User">User</option>
            <option value="Company">Company</option>
            <option value="Job">Job</option>
            <option value="Category">Category</option>
            <option value="Skill">Skill</option>
            <option value="JobFeedSource">Feed Source</option>
            <option value="PlatformSetting">Setting</option>
          </select>
          <button onClick={load} className="px-4 py-2 rounded-lg bg-[#5b4fe8] text-white text-sm font-medium hover:bg-[#4636c9]">Filter</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Admin</th>
                <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Action</th>
                <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Entity</th>
                <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Details</th>
                <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-[#e2e8f0] animate-pulse">
                  {[...Array(5)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-[#e2e8f0] rounded w-20" /></td>)}
                </tr>
              )) : logs.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-[#94a3b8]">No audit logs found</td></tr>
              ) : logs.map(l => (
                <tr key={l.id} className="border-b border-[#e2e8f0] hover:bg-[#f8fafc]">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#0f172a]">{l.admin.firstName} {l.admin.lastName}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#f1f5f9] text-[#64748b]">{l.action.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="px-4 py-3 text-[#64748b]">{l.entityType} {l.entityId ? `#${l.entityId}` : ''}</td>
                  <td className="px-4 py-3 text-[#94a3b8] text-xs max-w-xs truncate">
                    {l.newValue ? JSON.stringify(l.newValue).substring(0, 60) : '—'}
                  </td>
                  <td className="px-4 py-3 text-[#64748b] text-xs">{new Date(l.createdAt).toLocaleString()}</td>
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
