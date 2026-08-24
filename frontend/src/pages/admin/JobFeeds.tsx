import { useEffect, useState } from 'react';
import { adminApi } from '../../services/adminApi';
import { Plus, Play, Pause, Trash2, RefreshCw, Wifi, Edit2 } from 'lucide-react';

interface FeedSource { id: number; name: string; sourceType: string; isActive: boolean; totalJobs: number; lastSyncAt?: string; syncErrorCount: number; endpoint?: string; syncFrequency: string; _count: { syncLogs: number; errors: number } }

export default function JobFeeds() {
  const [sources, setSources] = useState<FeedSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', sourceType: 'GREENHOUSE', endpoint: '', authType: 'NONE', credentialsRef: '', syncFrequency: 'HOURLY' });
  const [syncing, setSyncing] = useState<number | null>(null);

  const load = async () => {
    const res: any = await adminApi.jobFeeds.list();
    if (res.success) setSources(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) await adminApi.jobFeeds.update(editId, form);
    else await adminApi.jobFeeds.create(form);
    setForm({ name: '', sourceType: 'GREENHOUSE', endpoint: '', authType: 'NONE', credentialsRef: '', syncFrequency: 'HOURLY' });
    setEditId(null); setShowForm(false); load();
  };

  const handleEdit = (s: FeedSource) => {
    setForm({ name: s.name, sourceType: s.sourceType, endpoint: s.endpoint || '', authType: 'NONE', credentialsRef: '', syncFrequency: s.syncFrequency });
    setEditId(s.id); setShowForm(true);
  };

  const handleSync = async (id: number) => {
    setSyncing(id);
    await adminApi.jobFeeds.sync(id);
    setSyncing(null); load();
  };

  const handlePause = async (id: number) => {
    await adminApi.jobFeeds.pause(id);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this feed source?')) return;
    await adminApi.jobFeeds.delete(id);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Job Feed Sources</h1>
          <p className="text-sm text-[#64748b] mt-1">{sources.length} configured sources</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ name: '', sourceType: 'GREENHOUSE', endpoint: '', authType: 'NONE', credentialsRef: '', syncFrequency: 'HOURLY' }); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#5b4fe8] text-white text-sm font-medium hover:bg-[#4636c9]">
          <Plus className="w-4 h-4" /> Add Source
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
          <h3 className="font-bold text-[#0f172a] mb-4">{editId ? 'Edit Feed Source' : 'New Feed Source'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#334155] mb-1">Source Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#e2e8f0] text-sm focus:outline-none focus:border-[#5b4fe8]" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#334155] mb-1">Source Type</label>
              <select value={form.sourceType} onChange={e => setForm({ ...form, sourceType: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#e2e8f0] text-sm focus:outline-none focus:border-[#5b4fe8]">
                <option value="GREENHOUSE">Greenhouse</option>
                <option value="LEVER">Lever</option>
                <option value="CUSTOM_API">Custom API</option>
                <option value="RSS">RSS</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#334155] mb-1">API Endpoint</label>
              <input value={form.endpoint} onChange={e => setForm({ ...form, endpoint: e.target.value })}
                placeholder="https://api.example.com/jobs"
                className="w-full px-3 py-2 rounded-lg border border-[#e2e8f0] text-sm focus:outline-none focus:border-[#5b4fe8]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#334155] mb-1">Sync Frequency</label>
              <select value={form.syncFrequency} onChange={e => setForm({ ...form, syncFrequency: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#e2e8f0] text-sm focus:outline-none focus:border-[#5b4fe8]">
                <option value="EVERY_15_MIN">Every 15 minutes</option>
                <option value="EVERY_30_MIN">Every 30 minutes</option>
                <option value="HOURLY">Hourly</option>
                <option value="EVERY_6_HOURS">Every 6 hours</option>
                <option value="EVERY_12_HOURS">Every 12 hours</option>
                <option value="DAILY">Daily</option>
              </select>
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" className="px-4 py-2 rounded-lg bg-[#5b4fe8] text-white text-sm font-medium hover:bg-[#4636c9]">{editId ? 'Update' : 'Create'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="px-4 py-2 rounded-lg border border-[#e2e8f0] text-sm text-[#64748b]">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? [...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#e2e8f0] p-5 h-48 animate-pulse" />
        )) : sources.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border border-[#e2e8f0] p-12 text-center text-[#94a3b8]">
            No feed sources configured. Click "Add Source" to create one.
          </div>
        ) : sources.map(s => (
          <div key={s.id} className="bg-white rounded-xl border border-[#e2e8f0] p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${s.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                <h3 className="font-bold text-[#0f172a]">{s.name}</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#f1f5f9] text-[#64748b]">{s.sourceType}</span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-[#94a3b8]">Total Jobs</span>
                <span className="font-semibold text-[#0f172a]">{s.totalJobs}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#94a3b8]">Last Sync</span>
                <span className="text-[#64748b]">{s.lastSyncAt ? new Date(s.lastSyncAt).toLocaleString() : 'Never'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#94a3b8]">Errors</span>
                <span className={`font-semibold ${s.syncErrorCount > 0 ? 'text-red-600' : 'text-[#0f172a]'}`}>{s.syncErrorCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#94a3b8]">Frequency</span>
                <span className="text-[#64748b]">{s.syncFrequency.replace(/_/g, ' ')}</span>
              </div>
            </div>

            <div className="flex items-center gap-1 pt-3 border-t border-[#e2e8f0]">
              <button onClick={() => handleSync(s.id)} disabled={syncing === s.id}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#5b4fe8]/10 text-[#5b4fe8] text-xs font-medium hover:bg-[#5b4fe8]/20 disabled:opacity-50">
                {syncing === s.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                Sync Now
              </button>
              <button onClick={() => handleEdit(s)} className="p-1.5 rounded-lg hover:bg-[#f1f5f9] text-[#64748b]"><Edit2 className="w-3.5 h-3.5" /></button>
              {s.isActive && (
                <button onClick={() => handlePause(s.id)} className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600"><Pause className="w-3.5 h-3.5" /></button>
              )}
              <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 ml-auto"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
