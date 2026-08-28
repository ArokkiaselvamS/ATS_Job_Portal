import { useCompanyAdminAuth } from '../../hooks/useCompanyAdminAuth';
import { Briefcase, Plus, Search, Filter, Edit, Trash2, Eye, X, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../../api/client';

interface Job {
  id: number;
  title: string;
  description: string;
  location: string;
  city: string;
  country: string;
  jobType: string;
  workMode: string;
  experienceLevel: string;
  salaryMin: number;
  salaryMax: number;
  skills: string[];
  status: string;
  _count?: { applications: number };
  createdAt: string;
}

export default function CompanyAdminJobs() {
  const { admin } = useCompanyAdminAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [form, setForm] = useState({ title: '', description: '', location: '', city: '', country: '', jobType: 'FULL_TIME', workMode: 'ONSITE', experienceLevel: '', salaryMin: '', salaryMax: '', skills: '' });
  const [saving, setSaving] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const res = await api.get(`/company-admin/jobs?${params}`);
      if (res.data.success) {
        setJobs(res.data.data.jobs);
        setTotalPages(res.data.data.totalPages);
      }
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchJobs(); }, [page, statusFilter]);

  const handleSearch = () => { setPage(1); fetchJobs(); };

  const openCreate = () => {
    setEditingJob(null);
    setForm({ title: '', description: '', location: '', city: '', country: '', jobType: 'FULL_TIME', workMode: 'ONSITE', experienceLevel: '', salaryMin: '', salaryMax: '', skills: '' });
    setShowModal(true);
  };

  const openEdit = (job: Job) => {
    setEditingJob(job);
    setForm({
      title: job.title, description: job.description, location: job.location || '', city: job.city || '', country: job.country || '',
      jobType: job.jobType, workMode: job.workMode, experienceLevel: job.experienceLevel || '',
      salaryMin: job.salaryMin ? String(job.salaryMin) : '', salaryMax: job.salaryMax ? String(job.salaryMax) : '',
      skills: job.skills?.join(', ') || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = { ...form, salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined, salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined, skills: form.skills ? form.skills.split(',').map(s => s.trim()) : [] };
      if (editingJob) {
        const res = await api.put(`/company-admin/jobs/${editingJob.id}`, body);
        if (res.data.success) { setMessage({ type: 'success', text: 'Job updated' }); setShowModal(false); fetchJobs(); }
        else { setMessage({ type: 'error', text: 'Failed to update job' }); }
      } else {
        const res = await api.post('/company-admin/jobs', body);
        if (res.data.success) { setMessage({ type: 'success', text: 'Job created' }); setShowModal(false); fetchJobs(); }
        else { setMessage({ type: 'error', text: 'Failed to create job' }); }
      }
    } catch { setMessage({ type: 'error', text: 'Failed to save job' }); }
    finally { setSaving(false); setTimeout(() => setMessage(null), 3000); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    try {
      const res = await api.delete(`/company-admin/jobs/${id}`);
      if (res.data.success) { setMessage({ type: 'success', text: 'Job deleted' }); fetchJobs(); }
      else { setMessage({ type: 'error', text: 'Failed to delete job' }); }
    } catch { setMessage({ type: 'error', text: 'Failed to delete job' }); }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleStatusChange = async (job: Job, newStatus: string) => {
    try {
      const res = await api.put(`/company-admin/jobs/${job.id}`, { status: newStatus });
      if (res.data.success) { setMessage({ type: 'success', text: `Job ${newStatus.toLowerCase()}` }); fetchJobs(); }
    } catch { setMessage({ type: 'error', text: 'Failed to update status' }); }
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Jobs</h1>
          <p className="text-slate-600 mt-1">Manage your job postings</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Plus size={18} /> Post New Job
        </button>
      </div>

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
            <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} type="text" placeholder="Search jobs..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500">
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="INACTIVE">Inactive</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        {loading ? (
          <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-slate-400" size={32} /><p className="text-slate-500 mt-2">Loading jobs...</p></div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center text-slate-500"><Briefcase size={48} className="mx-auto mb-3 text-slate-300" /><p>No jobs found</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Job Title</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Type</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Location</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Applications</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-4 py-3"><p className="font-medium text-slate-900">{job.title}</p></td>
                    <td className="px-4 py-3 text-slate-600">{job.jobType?.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-slate-600">{job.location || job.city || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${job.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : job.status === 'DRAFT' ? 'bg-slate-100 text-slate-700' : job.status === 'PENDING_REVIEW' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{job.status?.replace('_', ' ')}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-900 font-medium">{job._count?.applications ?? 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {job.status === 'ACTIVE' ? (
                          <button onClick={() => handleStatusChange(job, 'INACTIVE')} className="p-2 rounded-lg hover:bg-amber-50 text-amber-500 text-xs" title="Deactivate">Deactivate</button>
                        ) : job.status === 'INACTIVE' ? (
                          <button onClick={() => handleStatusChange(job, 'ACTIVE')} className="p-2 rounded-lg hover:bg-green-50 text-green-500 text-xs" title="Activate">Activate</button>
                        ) : job.status === 'DRAFT' ? (
                          <button onClick={() => handleStatusChange(job, 'ACTIVE')} className="p-2 rounded-lg hover:bg-green-50 text-green-500 text-xs" title="Publish">Publish</button>
                        ) : null}
                        <button onClick={() => openEdit(job)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500" title="Edit"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(job.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500" title="Delete"><Trash2 size={16} /></button>
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">{editingJob ? 'Edit Job' : 'Post New Job'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-slate-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Job Title *</label><input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Description *</label><textarea rows={4} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Location</label><input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">City</label><input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Country</label><input value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Job Type</label><select value={form.jobType} onChange={e => setForm(p => ({ ...p, jobType: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-slate-300"><option value="FULL_TIME">Full-time</option><option value="PART_TIME">Part-time</option><option value="CONTRACT">Contract</option><option value="INTERNSHIP">Internship</option></select></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Work Mode</label><select value={form.workMode} onChange={e => setForm(p => ({ ...p, workMode: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-slate-300"><option value="ONSITE">On-site</option><option value="REMOTE">Remote</option><option value="HYBRID">Hybrid</option></select></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Experience Level</label><input value={form.experienceLevel} onChange={e => setForm(p => ({ ...p, experienceLevel: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" placeholder="e.g. Mid-Senior" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Salary Min</label><input type="number" value={form.salaryMin} onChange={e => setForm(p => ({ ...p, salaryMin: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Salary Max</label><input type="number" value={form.salaryMax} onChange={e => setForm(p => ({ ...p, salaryMax: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /></div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Skills (comma separated)</label><input value={form.skills} onChange={e => setForm(p => ({ ...p, skills: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" placeholder="React, TypeScript, Node.js" /></div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.title || !form.description} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 text-sm">
                {saving && <Loader2 size={16} className="animate-spin" />}
                {editingJob ? 'Save Changes' : 'Post Job'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}