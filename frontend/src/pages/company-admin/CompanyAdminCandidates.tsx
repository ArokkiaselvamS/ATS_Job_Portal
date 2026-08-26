import { Users, Search, Filter, Mail, Phone, Loader2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../../api/client';

interface Candidate {
  id: number;
  name: string;
  email: string;
  phone: string;
  profileImage: string | null;
  headline: string;
  skills: string[];
  location: string;
  appliedFor: string;
  status: string;
  appliedAt: string;
}

export default function CompanyAdminCandidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '12' });
      if (search) params.set('search', search);
      const res = await api.get(`/company-admin/candidates?${params}`);
      if (res.data.success) { setCandidates(res.data.data.candidates); setTotalPages(res.data.data.totalPages); }
      else { setError('Failed to load candidates'); }
    } catch { setError('Unable to connect to server'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchCandidates(); }, [page]);
  const handleSearch = () => { setPage(1); fetchCandidates(); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-slate-900">Candidates</h1><p className="text-slate-600 mt-1">Browse and discover talent who applied to your jobs</p></div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3 text-red-700">
          <AlertCircle size={20} /><p className="text-sm">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} type="text" placeholder="Search candidates by name, skills..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <button onClick={handleSearch} className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 flex items-center gap-2"><Filter size={18} />Search</button>
        </div>

        {loading ? (
          <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-slate-400" size={32} /><p className="text-slate-500 mt-2">Loading...</p></div>
        ) : candidates.length === 0 ? (
          <div className="p-12 text-center text-slate-500"><Users size={48} className="mx-auto mb-3 text-slate-300" /><p>No candidates found</p></div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 p-4">
            {candidates.map((c) => (
              <div key={c.id} className="p-4 rounded-lg border border-slate-200 hover:border-blue-200 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    {c.profileImage ? <img src={c.profileImage} alt="" className="w-full h-full rounded-full object-cover" /> : <span className="text-blue-600 font-bold text-lg">{c.name.split(' ').map(n => n[0]).join('')}</span>}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{c.name}</p>
                    <p className="text-sm text-slate-500">{c.headline || c.appliedFor}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                  {c.location && <span>{c.location}</span>}
                </div>
                {c.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {c.skills.slice(0, 4).map((skill) => (<span key={skill} className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700">{skill}</span>))}
                  </div>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${c.status === 'APPLIED' ? 'bg-green-100 text-green-700' : c.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{c.status}</span>
                  <span className="text-xs text-slate-400">Applied {new Date(c.appliedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <a href={`mailto:${c.email}`} className="flex-1 px-2 py-1.5 text-sm rounded-lg border border-slate-300 hover:bg-slate-50 flex items-center justify-center gap-1"><Mail size={14} />Email</a>
                </div>
              </div>
            ))}
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
    </div>
  );
}