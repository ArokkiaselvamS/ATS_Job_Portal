import { useEffect, useState } from 'react';
import { adminApi } from '../../services/adminApi';
import { Search, ChevronLeft, ChevronRight, Ban, CheckCircle, Shield } from 'lucide-react';

interface AdminUser {
  id: number; firstName: string; lastName: string; email: string; role: string;
  isActive: boolean; isSuspended: boolean; isBlocked: boolean;
  createdAt: string; lastLoginAt?: string;
  companies: { company: { id: number; name: string; verificationStatus: string } }[];
}

export default function CompanyAdmins() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '15' };
      if (search) params.search = search;
      if (status) params.status = status;
      const res: any = await adminApi.companyAdmins.list(params);
      if (res.success) { setUsers(res.data.users); setTotal(res.data.total); setTotalPages(res.data.totalPages); }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, status]);

  const handleAction = async (id: number, action: 'suspend' | 'activate' | 'block') => {
    if (!confirm(`Are you sure you want to ${action} this admin?`)) return;
    setActionLoading(id);
    try {
      if (action === 'suspend') await adminApi.companyAdmins.suspend(id, 'Suspended by admin');
      else if (action === 'activate') await adminApi.companyAdmins.activate(id);
      else if (action === 'block') await adminApi.companyAdmins.block(id, 'Blocked by admin');
      await load();
    } finally { setActionLoading(null); }
  };

  const statusBadge = (u: AdminUser) => {
    if (u.isBlocked) return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Blocked</span>;
    if (u.isSuspended) return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Suspended</span>;
    if (u.isActive) return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Active</span>;
    return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">Inactive</span>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a]">Company Admins</h1>
        <p className="text-sm text-[#64748b] mt-1">{total} total admins</p>
      </div>

      <div className="bg-white rounded-xl border border-[#e2e8f0] p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
            <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#e2e8f0] text-sm focus:outline-none focus:border-[#5b4fe8]" />
          </div>
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-[#e2e8f0] text-sm focus:outline-none focus:border-[#5b4fe8]">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="blocked">Blocked</option>
          </select>
          <button onClick={load} className="px-4 py-2 rounded-lg bg-[#5b4fe8] text-white text-sm font-medium hover:bg-[#4636c9]">Search</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Admin</th>
                <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Company</th>
                <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Last Login</th>
                <th className="text-right px-4 py-3 font-semibold text-[#64748b]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-[#e2e8f0] animate-pulse">
                  <td className="px-4 py-3"><div className="h-4 bg-[#e2e8f0] rounded w-32" /></td>
                  <td className="px-4 py-3"><div className="h-4 bg-[#e2e8f0] rounded w-24" /></td>
                  <td className="px-4 py-3"><div className="h-5 bg-[#e2e8f0] rounded-full w-16" /></td>
                  <td className="px-4 py-3"><div className="h-4 bg-[#e2e8f0] rounded w-20" /></td>
                  <td className="px-4 py-3"><div className="h-4 bg-[#e2e8f0] rounded w-20" /></td>
                </tr>
              )) : users.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-[#94a3b8]">No admins found</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="border-b border-[#e2e8f0] hover:bg-[#f8fafc]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#e2e8f0] flex items-center justify-center text-xs font-bold text-[#64748b]">
                        {u.firstName[0]}{u.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-[#0f172a]">{u.firstName} {u.lastName}</p>
                        <p className="text-xs text-[#94a3b8]">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#64748b]">{u.companies?.[0]?.company?.name || '—'}</td>
                  <td className="px-4 py-3">{statusBadge(u)}</td>
                  <td className="px-4 py-3 text-[#64748b]">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {!u.isSuspended && !u.isBlocked && (
                        <button onClick={() => handleAction(u.id, 'suspend')} disabled={actionLoading === u.id}
                          className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600" title="Suspend"><Ban className="w-4 h-4" /></button>
                      )}
                      {(u.isSuspended || u.isBlocked) && (
                        <button onClick={() => handleAction(u.id, 'activate')} disabled={actionLoading === u.id}
                          className="p-1.5 rounded-lg hover:bg-green-50 text-green-600" title="Activate"><CheckCircle className="w-4 h-4" /></button>
                      )}
                      {!u.isBlocked && (
                        <button onClick={() => handleAction(u.id, 'block')} disabled={actionLoading === u.id}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-600" title="Block"><Shield className="w-4 h-4" /></button>
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
