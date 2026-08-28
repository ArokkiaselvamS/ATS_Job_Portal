import { FileText, Search, Filter, CheckCircle, XCircle, Eye, Loader2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../../api/client';

interface Application {
  id: number;
  status: string;
  appliedAt: string;
  user: { id: number; firstName: string; lastName: string; email: string; profileImage: string | null };
  job: { id: number; title: string };
}

export default function CompanyAdminApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [viewApp, setViewApp] = useState<Application | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const res = await api.get(`/company-admin/applications?${params}`);
      if (res.data.success) { setApplications(res.data.data.applications); setTotalPages(res.data.data.totalPages); }
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchApplications(); }, [page, statusFilter]);
  const handleSearch = () => { setPage(1); fetchApplications(); };

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await api.patch(`/company-admin/applications/${id}/status`, { status });
      if (res.data.success) { setMessage({ type: 'success', text: `Application ${status.toLowerCase()}` }); fetchApplications(); }
      else { setMessage({ type: 'error', text: 'Failed to update status' }); }
    } catch { setMessage({ type: 'error', text: 'Failed to update status' }); }
    setTimeout(() => setMessage(null), 3000);
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'APPLIED': return 'bg-blue-100 text-blue-700';
      case 'SCREENING': return 'bg-amber-100 text-amber-700';
      case 'INTERVIEW': return 'bg-purple-100 text-purple-700';
      case 'OFFER': case 'ACCEPTED': return 'bg-green-100 text-green-700';
      case 'REJECTED': case 'WITHDRAWN': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">Applications</h1><p className="text-slate-600 mt-1">Review and manage candidate applications</p></div>

      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} type="text" placeholder="Search by candidate name or email..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500">
            <option value="">All Status</option>
            <option value="APPLIED">Applied</option>
            <option value="SCREENING">Screening</option>
            <option value="INTERVIEW">Interview</option>
            <option value="OFFER">Offer</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {loading ? (
          <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-slate-400" size={32} /><p className="text-slate-500 mt-2">Loading...</p></div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center text-slate-500"><FileText size={48} className="mx-auto mb-3 text-slate-300" /><p>No applications found</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Candidate</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Job</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Applied</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
              </tr></thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{app.user.firstName} {app.user.lastName}</p>
                      <p className="text-sm text-slate-500">{app.user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{app.job.title}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor(app.status)}`}>{app.status}</span></td>
                    <td className="px-4 py-3 text-slate-500">{new Date(app.appliedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewApp(app)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500" title="View"><Eye size={16} /></button>
                        {app.status !== 'ACCEPTED' && app.status !== 'REJECTED' && (
                          <>
                            <button onClick={() => updateStatus(app.id, 'SCREENING')} className="p-2 rounded-lg hover:bg-amber-50 text-amber-500 text-xs" title="Screen">Screen</button>
                            <button onClick={() => updateStatus(app.id, 'INTERVIEW')} className="p-2 rounded-lg hover:bg-purple-50 text-purple-500 text-xs" title="Interview">Interview</button>
                            <button onClick={() => updateStatus(app.id, 'ACCEPTED')} className="p-2 rounded-lg hover:bg-green-50 text-green-500" title="Accept"><CheckCircle size={16} /></button>
                            <button onClick={() => updateStatus(app.id, 'REJECTED')} className="p-2 rounded-lg hover:bg-red-50 text-red-500" title="Reject"><XCircle size={16} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 text-sm">Previous</button>
            <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 text-sm">Next</button>
          </div>
        )}
      </div>

      {viewApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setViewApp(null)}>
          <div className="bg-white rounded-xl border border-slate-200 w-full max-w-lg mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Application Details</h3>
            <div className="space-y-3">
              <div><p className="text-sm text-slate-500">Candidate</p><p className="font-medium">{viewApp.user.firstName} {viewApp.user.lastName}</p></div>
              <div><p className="text-sm text-slate-500">Email</p><p className="font-medium">{viewApp.user.email}</p></div>
              <div><p className="text-sm text-slate-500">Applied For</p><p className="font-medium">{viewApp.job.title}</p></div>
              <div><p className="text-sm text-slate-500">Status</p><span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor(viewApp.status)}`}>{viewApp.status}</span></div>
              <div><p className="text-sm text-slate-500">Applied Date</p><p className="font-medium">{new Date(viewApp.appliedAt).toLocaleDateString()}</p></div>
            </div>
            <div className="flex justify-end mt-6"><button onClick={() => setViewApp(null)} className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm">Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
}