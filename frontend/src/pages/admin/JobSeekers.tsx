import { useEffect, useState } from 'react';
import { adminApi } from '../../services/adminApi';
import { Search, ChevronLeft, ChevronRight, Ban, CheckCircle, Shield, Eye } from 'lucide-react';

interface User {
  id: number; firstName: string; lastName: string; email: string; phone?: string;
  isActive: boolean; isSuspended: boolean; isBlocked: boolean;
  createdAt: string; lastLoginAt?: string; profileImage?: string;
  profile?: { location?: string; headline?: string };
  _count: { applications: number };
}

export default function JobSeekers() {
  const [users, setUsers] = useState<User[]>([]);
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
      const res: any = await adminApi.jobSeekers.list(params);
      if (res.success) { setUsers(res.data.users); setTotal(res.data.total); setTotalPages(res.data.totalPages); }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, status]);

  const handleSearch = () => { setPage(1); load(); };

  const handleAction = async (id: number, action: 'suspend' | 'activate' | 'block') => {
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;
    setActionLoading(id);
    try {
      if (action === 'suspend') await adminApi.jobSeekers.suspend(id, 'Suspended by admin');
      else if (action === 'activate') await adminApi.jobSeekers.activate(id);
      else if (action === 'block') await adminApi.jobSeekers.block(id, 'Blocked by admin');
      await load();
    } finally { setActionLoading(null); }
  };

  const statusBadge = (u: User) => {
    if (u.isBlocked) return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Blocked</span>;
    if (u.isSuspended) return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Suspended</span>;
    if (u.isActive) return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Active</span>;
    return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">Inactive</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Job Seekers</h1>
          <p className="text-sm text-[#64748b] mt-1">{total} total users</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#e2e8f0] p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
            <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#e2e8f0] text-sm focus:outline-none focus:border-[#5b4fe8]" />
          </div>
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-[#e2e8f0] text-sm text-[#334155] focus:outline-none focus:border-[#5b4fe8]">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="blocked">Blocked</option>
          </select>
          <button onClick={handleSearch} className="px-4 py-2 rounded-lg bg-[#5b4fe8] text-white text-sm font-medium hover:bg-[#4636c9] transition-colors">
            Search
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                <th className="text-left px-4 py-3 font-semibold text-[#64748b]">User</th>
                <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Location</th>
                <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Applications</th>
                <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Joined</th>
                <th className="text-right px-4 py-3 font-semibold text-[#64748b]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-[#e2e8f0] animate-pulse">
                    <td className="px-4 py-3"><div className="h-4 bg-[#e2e8f0] rounded w-32" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-[#e2e8f0] rounded w-24" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-[#e2e8f0] rounded w-8" /></td>
                    <td className="px-4 py-3"><div className="h-5 bg-[#e2e8f0] rounded-full w-16" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-[#e2e8f0] rounded w-20" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-[#e2e8f0] rounded w-20" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-[#94a3b8]">No users found</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="border-b border-[#e2e8f0] hover:bg-[#f8fafc] transition-colors">
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
                  <td className="px-4 py-3 text-[#64748b]">{u.profile?.location || '—'}</td>
                  <td className="px-4 py-3 text-[#0f172a] font-medium">{u._count.applications}</td>
                  <td className="px-4 py-3">{statusBadge(u)}</td>
                  <td className="px-4 py-3 text-[#64748b]">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {!u.isSuspended && !u.isBlocked && (
                        <button onClick={() => handleAction(u.id, 'suspend')} disabled={actionLoading === u.id}
                          className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors" title="Suspend">
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                      {(u.isSuspended || u.isBlocked) && (
                        <button onClick={() => handleAction(u.id, 'activate')} disabled={actionLoading === u.id}
                          className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors" title="Activate">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {!u.isBlocked && (
                        <button onClick={() => handleAction(u.id, 'block')} disabled={actionLoading === u.id}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors" title="Block">
                          <Shield className="w-4 h-4" />
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
