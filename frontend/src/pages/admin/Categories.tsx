import { useEffect, useState } from 'react';
import { adminApi } from '../../services/adminApi';
import { Plus, Edit2, CheckCircle, XCircle } from 'lucide-react';

interface Category { id: number; name: string; slug: string; description?: string; isActive: boolean; _count: { jobs: number; skills: number } }

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });

  const load = async () => {
    setLoading(true);
    const res: any = await adminApi.categories.list();
    if (res.success) setCategories(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (editId) await adminApi.categories.update(editId, form);
    else await adminApi.categories.create(form);
    setForm({ name: '', description: '' }); setEditId(null); setShowForm(false); load();
  };

  const handleEdit = (c: Category) => { setForm({ name: c.name, description: c.description || '' }); setEditId(c.id); setShowForm(true); };

  const handleToggle = async (c: Category) => {
    await adminApi.categories.update(c.id, { isActive: !c.isActive });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Categories</h1>
          <p className="text-sm text-[#64748b] mt-1">{categories.length} categories</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ name: '', description: '' }); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#5b4fe8] text-white text-sm font-medium hover:bg-[#4636c9]">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
          <h3 className="font-bold text-[#0f172a] mb-4">{editId ? 'Edit Category' : 'New Category'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#334155] mb-1">Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#e2e8f0] text-sm focus:outline-none focus:border-[#5b4fe8]" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#334155] mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#e2e8f0] text-sm focus:outline-none focus:border-[#5b4fe8]" rows={2} />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 rounded-lg bg-[#5b4fe8] text-white text-sm font-medium hover:bg-[#4636c9]">{editId ? 'Update' : 'Create'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="px-4 py-2 rounded-lg border border-[#e2e8f0] text-sm text-[#64748b] hover:bg-[#f8fafc]">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
              <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Name</th>
              <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Jobs</th>
              <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Skills</th>
              <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Status</th>
              <th className="text-right px-4 py-3 font-semibold text-[#64748b]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? [...Array(5)].map((_, i) => (
              <tr key={i} className="border-b border-[#e2e8f0] animate-pulse">
                {[...Array(5)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-[#e2e8f0] rounded w-20" /></td>)}
              </tr>
            )) : categories.map(c => (
              <tr key={c.id} className="border-b border-[#e2e8f0] hover:bg-[#f8fafc]">
                <td className="px-4 py-3">
                  <p className="font-medium text-[#0f172a]">{c.name}</p>
                  {c.description && <p className="text-xs text-[#94a3b8] mt-0.5">{c.description}</p>}
                </td>
                <td className="px-4 py-3 text-[#64748b]">{c._count.jobs}</td>
                <td className="px-4 py-3 text-[#64748b]">{c._count.skills}</td>
                <td className="px-4 py-3">
                  {c.isActive
                    ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Active</span>
                    : <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">Inactive</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => handleEdit(c)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleToggle(c)} className={`p-1.5 rounded-lg ${c.isActive ? 'hover:bg-amber-50 text-amber-600' : 'hover:bg-green-50 text-green-600'}`}>
                      {c.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
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
