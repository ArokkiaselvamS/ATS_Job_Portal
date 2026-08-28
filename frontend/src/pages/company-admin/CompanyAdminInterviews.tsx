import { Calendar, Clock, Plus, Search, Filter, Video, MapPin, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../../api/client';

interface Interview {
  id: number;
  candidateName: string;
  candidateEmail: string;
  candidateImage: string | null;
  jobTitle: string;
  jobId: number;
  type: string;
  status: string;
  date: string;
}

export default function CompanyAdminInterviews() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchInterviews = async () => {
    try {
      const res = await api.get('/company-admin/interviews');
      if (res.data.success) { setInterviews(res.data.data); }
      else { setError('Failed to load interviews'); }
    } catch { setError('Unable to connect to server'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchInterviews(); }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await api.patch(`/company-admin/applications/${id}/status`, { status });
      if (res.data.success) { fetchInterviews(); }
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-slate-900">Interviews</h1><p className="text-slate-600 mt-1">Manage interview schedule</p></div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3 text-red-700">
          <AlertCircle size={20} /><p className="text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center"><Loader2 className="animate-spin mx-auto text-slate-400" size={32} /><p className="text-slate-500 mt-2">Loading interviews...</p></div>
      ) : interviews.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500"><Calendar size={48} className="mx-auto mb-3 text-slate-300" /><p>No interviews scheduled</p><p className="text-sm text-slate-400 mt-1">Interviews appear here when applications move to interview stage</p></div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {interviews.map((interview) => (
            <div key={interview.id} className="border-b border-slate-200 last:border-0">
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-100 text-blue-600"><Calendar size={24} /></div>
                    <div>
                      <p className="font-semibold text-slate-900">{interview.candidateName}</p>
                      <p className="text-sm text-slate-500">{interview.jobTitle} • {interview.type} Interview</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:ml-auto">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${interview.status === 'INTERVIEW' ? 'bg-blue-100 text-blue-700' : interview.status === 'SCREENING' ? 'bg-amber-100 text-amber-700' : interview.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>{interview.status}</span>
                    <span className="text-sm text-slate-500">{new Date(interview.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                  {interview.status !== 'ACCEPTED' && interview.status !== 'REJECTED' && (
                    <>
                      <button onClick={() => updateStatus(interview.id, 'ACCEPTED')} className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 flex items-center gap-1"><CheckCircle size={14} />Accept</button>
                      <button onClick={() => updateStatus(interview.id, 'REJECTED')} className="px-3 py-1.5 rounded-lg border border-red-300 text-red-600 text-sm hover:bg-red-50 flex items-center gap-1"><XCircle size={14} />Reject</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}