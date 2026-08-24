import { useEffect, useState } from 'react';
import { adminApi } from '../../services/adminApi';
import { Search, ChevronLeft, ChevronRight, CheckCircle, XCircle, Ban, Eye } from 'lucide-react';

interface Company {
  id: number; name: string; logo?: string; industry?: string; location?: string;
  verificationStatus: string; isSuspended: boolean; createdAt: string;
  _count: { jobs: number; admins: number };
  admins: { user: { id: number; firstName: string; lastName: string; email: string } }[];
}

export default function Companies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [verification, setVerification] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '15' };
      if (search) params.search = search;
      if (verification) params.verification = verification;
      const res: any = await adminApi.companies.list(params);
      if (res.success) { setCompanies(res.data.companies); setTotal(res.data.total); setTotalPages(res.data.totalPages); }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, verification]);

  const handleAction = async (id: number, action: 'verify' | 'reject' | 'suspend' | 'activate') => {
    if (action === 'reject') {
      const reason = prompt('Rejection reason:');
      if (!reason) return;
      setActionLoading(id);
      await adminApi.companies.reject(id, reason);
    } else if (action === 'suspend') {
      const reason = prompt('Suspension reason:');
      if (!reason) return;
      setActionLoading(id);
      await adminApi.companies.suspend(id, reason);
    } else {
      if (!confirm(`Are you sure you want to ${action} this company?`)) return;
      setActionLoading(id);
      if (action === 'verify') await adminApi.companies.verify(id);
      else if (action === 'activate') await adminApi.companies.activate(id);
    }
    await load();
    setActionLoading(null);
  };

  const verificationBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-amber-100 text-amber-700',
      VERIFIED: 'bg-green-100 text-green-700',
      APPROVED: 'bg-blue-100 text-blue-700',
      REJECTED: 'bg-red-100 text-red-700',
    };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a]">Companies</h1>
        <p className="text-sm text-[#64748b] mt-1">{total} total companies</p>
      </div>

      <div className="bg-white rounded-xl border border-[#e2e8f0] p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
            <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()}
              placeholder="Search companies..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#e2e8f0] text-sm focus:outline-none focus:border-[#5b4fe8]" />
          </div>
          <select value={verification} onChange={e => { setVerification(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-[#e2e8f0] text-sm focus:outline-none focus:border-[#5b4fe8]">
            <option value="">All Verification</option>
            <option value="PENDING">Pending</option>
            <option value="VERIFIED">Verified</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <button onClick={load} className="px-4 py-2 rounded-lg bg-[#5b4fe8] text-white text-sm font-medium hover:bg-[#4636c9]">Search</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Company</th>
                <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Industry</th>
                <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Admin</th>
                <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Jobs</th>
                <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Verification</th>
                <th className="text-right px-4 py-3 font-semibold text-[#64748b]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-[#e2e8f0] animate-pulse">
                  {[...Array(6)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-[#e2e8f0] rounded w-20" /></td>)}
                </tr>
              )) : companies.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-[#94a3b8]">No companies found</td></tr>
              ) : companies.map(c => (
                <tr key={c.id} className="border-b border-[#e2e8f0] hover:bg-[#f8fafc]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#e2e8f0] flex items-center justify-center text-xs font-bold text-[#64748b]">{c.name[0]}</div>
                      <div>
                        <p className="font-medium text-[#0f172a]">{c.name}</p>
                        <p className="text-xs text-[#94a3b8]">{c.location || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#64748b]">{c.industry || '—'}</td>
                  <td className="px-4 py-3 text-[#64748b]">{c.admins?.[0]?.user ? `${c.admins[0].user.firstName} ${c.admins[0].user.lastName}` : '—'}</td>
                  <td className="px-4 py-3 text-[#0f172a] font-medium">{c._count.jobs}</td>
                  <td className="px-4 py-3">{verificationBadge(c.verificationStatus)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {c.verificationStatus === 'PENDING' && (
                        <>
                          <button onClick={() => handleAction(c.id, 'verify')} disabled={actionLoading === c.id}
                            className="p-1.5 rounded-lg hover:bg-green-50 text-green-600" title="Verify"><CheckCircle className="w-4 h-4" /></button>
                          <button onClick={() => handleAction(c.id, 'reject')} disabled={actionLoading === c.id}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-600" title="Reject"><XCircle className="w-4 h-4" /></button>
                        </>
                      )}
                      {!c.isSuspended && c.verificationStatus === 'VERIFIED' && (
                        <button onClick={() => handleAction(c.id, 'suspend')} disabled={actionLoading === c.id}
                          className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600" title="Suspend"><Ban className="w-4 h-4" /></button>
                      )}
                      {c.isSuspended && (
                        <button onClick={() => handleAction(c.id, 'activate')} disabled={actionLoading === c.id}
                          className="p-1.5 rounded-lg hover:bg-green-50 text-green-600" title="Activate"><CheckCircle className="w-4 h-4" /></button>
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
