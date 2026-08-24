import { useEffect, useState } from 'react';
import { adminApi } from '../../services/adminApi';
import { Plus, Edit2, CheckCircle, XCircle, Merge } from 'lucide-react';

interface Skill { id: number; name: string; slug: string; isActive: boolean; canonicalId?: number; category?: { id: number; name: string }; _count: { aliases: number } }

export default function Skills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', categoryId: '' });

  const load = async () => {
    setLoading(true);
    const params: Record<string, string> = { page: String(page), limit: '30' };
    if (search) params.search = search;
    const res: any = await adminApi.skills.list(params);
    if (res.success) { setSkills(res.data.skills); setTotal(res.data.total); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (editId) await adminApi.skills.update(editId, { name: form.name, categoryId: form.categoryId || undefined });
    else await adminApi.skills.create({ name: form.name, categoryId: form.categoryId || undefined });
    setForm({ name: '', categoryId: '' }); setEditId(null); setShowForm(false); load();
  };

  const handleEdit = (s: Skill) => { setForm({ name: s.name, categoryId: s.category?.id?.toString() || '' }); setEditId(s.id); setShowForm(true); };

  const handleToggle = async (s: Skill) => {
    await adminApi.skills.update(s.id, { isActive: !s.isActive });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Skills</h1>
          <p className="text-sm text-[#64748b] mt-1">{total} skills</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ name: '', categoryId: '' }); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#5b4fe8] text-white text-sm font-medium hover:bg-[#4636c9]">
          <Plus className="w-4 h-4" /> Add Skill
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#e2e8f0] p-4">
        <div className="flex gap-3">
          <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()}
            placeholder="Search skills..." className="flex-1 px-3 py-2 rounded-lg border border-[#e2e8f0] text-sm focus:outline-none focus:border-[#5b4fe8]" />
          <button onClick={load} className="px-4 py-2 rounded-lg bg-[#5b4fe8] text-white text-sm font-medium hover:bg-[#4636c9]">Search</button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
          <h3 className="font-bold text-[#0f172a] mb-4">{editId ? 'Edit Skill' : 'New Skill'}</h3>
          <form onSubmit={handleSubmit} className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#334155] mb-1">Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#e2e8f0] text-sm focus:outline-none focus:border-[#5b4fe8]" required />
            </div>
            <button type="submit" className="px-4 py-2 rounded-lg bg-[#5b4fe8] text-white text-sm font-medium hover:bg-[#4636c9]">{editId ? 'Update' : 'Create'}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="px-4 py-2 rounded-lg border border-[#e2e8f0] text-sm text-[#64748b]">Cancel</button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
              <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Name</th>
              <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Category</th>
              <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Aliases</th>
              <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Status</th>
              <th className="text-right px-4 py-3 font-semibold text-[#64748b]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? [...Array(5)].map((_, i) => (
              <tr key={i} className="border-b border-[#e2e8f0] animate-pulse">
                {[...Array(5)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-[#e2e8f0] rounded w-20" /></td>)}
              </tr>
            )) : skills.map(s => (
              <tr key={s.id} className="border-b border-[#e2e8f0] hover:bg-[#f8fafc]">
                <td className="px-4 py-3 font-medium text-[#0f172a]">{s.name}</td>
                <td className="px-4 py-3 text-[#64748b]">{s.category?.name || '—'}</td>
                <td className="px-4 py-3 text-[#64748b]">{s._count.aliases}</td>
                <td className="px-4 py-3">
                  {s.isActive
                    ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Active</span>
                    : <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">Inactive</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => handleEdit(s)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleToggle(s)} className={`p-1.5 rounded-lg ${s.isActive ? 'hover:bg-amber-50 text-amber-600' : 'hover:bg-green-50 text-green-600'}`}>
                      {s.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
