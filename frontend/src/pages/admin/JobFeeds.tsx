import { useEffect, useState } from 'react';
import { adminApi } from '../../services/adminApi';
import {
  Plus,
  Play,
  Pause,
  Trash2,
  RefreshCw,
  Edit2,
  Zap,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

interface FeedSource {
  id: number;
  name: string;
  sourceType: string;
  isActive: boolean;
  totalJobs: number;
  lastSyncAt?: string;
  syncErrorCount: number;
  endpoint?: string;
  syncFrequency: string;
  authType?: string;
  _count: { syncLogs: number; errors: number };
}

const AUTH_TYPES = ['NONE', 'API_KEY', 'OAUTH2', 'BASIC', 'BEARER'];

const SOURCE_TYPE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  GREENHOUSE: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Greenhouse' },
  LEVER: { bg: 'bg-violet-100', text: 'text-violet-700', label: 'Lever' },
  REMOTIVE: { bg: 'bg-teal-100', text: 'text-teal-700', label: 'Remotive' },
  ARBEITNOW: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Arbeitnow' },
  ASHBY: { bg: 'bg-sky-100', text: 'text-sky-700', label: 'Ashby' },
  RSS: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'RSS' },
  CSV: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'CSV' },
  CUSTOM_API: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Custom API' },
  OTHER: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Other' },
};

const DEFAULT_FORM = {
  name: '',
  sourceType: 'GREENHOUSE',
  endpoint: '',
  authType: 'NONE',
  credentialsRef: '',
  syncFrequency: 'EVERY_10_MIN',
  testConnection: true,
  initialSync: true,
};

export default function JobFeeds() {
  const [sources, setSources] = useState<FeedSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [syncing, setSyncing] = useState<number | null>(null);
  const [showCredentials, setShowCredentials] = useState(false);
  const [testResults, setTestResults] = useState<Record<number, { success: boolean; message: string }>>({});

  const load = async () => {
    const res: any = await adminApi.jobFeeds.list();
    if (res.success) setSources(res.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // Auto-set auth type to NONE for Greenhouse (public endpoint)
  useEffect(() => {
    if (form.sourceType === 'GREENHOUSE' && form.authType !== 'NONE') {
      setForm((prev) => ({ ...prev, authType: 'NONE', credentialsRef: '' }));
    }
  }, [form.sourceType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = editId ? form : { ...form, testConnection: form.testConnection, initialSync: form.initialSync };
    if (editId) await adminApi.jobFeeds.update(editId, form);
    else await adminApi.jobFeeds.create(submitData);
    setForm(DEFAULT_FORM);
    setEditId(null);
    setShowForm(false);
    load();
  };

  const handleEdit = (s: FeedSource) => {
    setForm({
      name: s.name,
      sourceType: s.sourceType,
      endpoint: s.endpoint || '',
      authType: s.sourceType === 'GREENHOUSE' ? 'NONE' : (s.authType || 'NONE'),
      credentialsRef: '',
      syncFrequency: s.syncFrequency,
      testConnection: false,
      initialSync: false,
    });
    setEditId(s.id);
    setShowForm(true);
  };

  const handleSync = async (id: number) => {
    setSyncing(id);
    await adminApi.jobFeeds.sync(id);
    setSyncing(null);
    load();
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

  const handleTest = async (id: number) => {
    setTestResults((prev) => ({ ...prev, [id]: { success: false, message: 'Testing...' } }));
    try {
      const res: any = await adminApi.jobFeeds.test(id);
      const success = res.success === true;
      const message = success ? 'Connection successful' : res.message || 'Connection failed';
      setTestResults((prev) => ({ ...prev, [id]: { success, message } }));
      setTimeout(() => {
        setTestResults((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }, 5000);
    } catch {
      setTestResults((prev) => ({
        ...prev,
        [id]: { success: false, message: 'Connection failed' },
      }));
      setTimeout(() => {
        setTestResults((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }, 5000);
    }
  };

  const activeCount = sources.filter((s) => s.isActive).length;

  const getSourceStyle = (type: string) =>
    SOURCE_TYPE_STYLES[type] || SOURCE_TYPE_STYLES.OTHER;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Job Feed Sources</h1>
          <p className="text-sm text-[#64748b] mt-1">
            {activeCount} active of {sources.length} configured sources
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditId(null);
            setForm(DEFAULT_FORM);
            setShowCredentials(false);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#5b4fe8] text-white text-sm font-medium hover:bg-[#4636c9]"
        >
          <Plus className="w-4 h-4" /> Add Source
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
          <h3 className="font-bold text-[#0f172a] mb-4">
            {editId ? 'Edit Feed Source' : 'New Feed Source'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#334155] mb-1">
                Source Name
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#e2e8f0] text-sm focus:outline-none focus:border-[#5b4fe8]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#334155] mb-1">
                Source Type
              </label>
              <select
                value={form.sourceType}
                onChange={(e) => setForm({ ...form, sourceType: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#e2e8f0] text-sm focus:outline-none focus:border-[#5b4fe8]"
              >
                <option value="GREENHOUSE">Greenhouse</option>
                <option value="LEVER">Lever</option>
                <option value="REMOTIVE">Remotive</option>
                <option value="ARBEITNOW">Arbeitnow</option>
                <option value="ASHBY">Ashby</option>
                <option value="CUSTOM_API">Custom API</option>
                <option value="RSS">RSS</option>
                <option value="CSV">CSV</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#334155] mb-1">
                {form.sourceType === 'GREENHOUSE' ? 'Greenhouse Board URL' : 'API Endpoint'}
              </label>
              <input
                value={form.endpoint}
                onChange={(e) => setForm({ ...form, endpoint: e.target.value })}
                placeholder={form.sourceType === 'GREENHOUSE' 
                  ? 'https://boards-api.greenhouse.io/v1/boards/company/jobs?content=true' 
                  : 'https://api.example.com/jobs'}
                className="w-full px-3 py-2 rounded-lg border border-[#e2e8f0] text-sm focus:outline-none focus:border-[#5b4fe8]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#334155] mb-1">
                Sync Frequency
              </label>
              <select
                value={form.syncFrequency}
                onChange={(e) => setForm({ ...form, syncFrequency: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#e2e8f0] text-sm focus:outline-none focus:border-[#5b4fe8]"
              >
                <option value="EVERY_10_MIN">Every 10 minutes</option>
                <option value="EVERY_15_MIN">Every 15 minutes</option>
                <option value="EVERY_30_MIN">Every 30 minutes</option>
                <option value="HOURLY">Hourly</option>
                <option value="EVERY_6_HOURS">Every 6 hours</option>
                <option value="EVERY_12_HOURS">Every 12 hours</option>
                <option value="DAILY">Daily</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#334155] mb-1">
                Auth Type
              </label>
              <select
                value={form.authType}
                onChange={(e) => setForm({ ...form, authType: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#e2e8f0] text-sm focus:outline-none focus:border-[#5b4fe8]"
              >
                {AUTH_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t === 'NONE' ? 'None' : t.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-[#94a3b8]">
              {form.sourceType === 'GREENHOUSE' 
                ? 'Greenhouse public job board does not require authentication.' 
                : 'Select authentication type for the feed source.'}
            </p>
            {form.authType !== 'NONE' && (
              <div>
                <label className="block text-sm font-medium text-[#334155] mb-1">
                  Credentials / API Key
                </label>
                <div className="relative">
                  <input
                    type={showCredentials ? 'text' : 'password'}
                    value={form.credentialsRef}
                    onChange={(e) => setForm({ ...form, credentialsRef: e.target.value })}
                    placeholder="Enter credentials"
                    className="w-full px-3 py-2 pr-10 rounded-lg border border-[#e2e8f0] text-sm focus:outline-none focus:border-[#5b4fe8]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCredentials(!showCredentials)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#334155]"
                  >
                    {showCredentials ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
            {!editId && (
              <div className="sm:col-span-2 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.testConnection}
                    onChange={(e) => setForm({ ...form, testConnection: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-[#5b4fe8] focus:ring-[#5b4fe8]"
                  />
                  <span className="text-sm text-[#334155]">Test connection after creation</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.initialSync}
                    onChange={(e) => setForm({ ...form, initialSync: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-[#5b4fe8] focus:ring-[#5b4fe8]"
                  />
                  <span className="text-sm text-[#334155]">Perform initial job synchronization</span>
                </label>
              </div>
            )}
            <div className="sm:col-span-2 flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#5b4fe8] text-white text-sm font-medium hover:bg-[#4636c9]"
              >
                {editId ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditId(null);
                  setForm(DEFAULT_FORM);
                  setShowCredentials(false);
                }}
                className="px-4 py-2 rounded-lg border border-[#e2e8f0] text-sm text-[#64748b]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? [...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-[#e2e8f0] p-5 h-48 animate-pulse"
              />
            ))
          : sources.length === 0
          ? (
            <div className="col-span-full bg-white rounded-xl border border-[#e2e8f0] p-12 text-center text-[#94a3b8]">
              No feed sources configured. Click "Add Source" to create one.
            </div>
          )
          : sources.map((s) => {
              const testResult = testResults[s.id];
              const sourceStyle = getSourceStyle(s.sourceType);

              return (
                <div key={s.id} className="bg-white rounded-xl border border-[#e2e8f0] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${s.isActive ? 'bg-green-500' : 'bg-gray-400'}`}
                      />
                      <h3 className="font-bold text-[#0f172a]">{s.name}</h3>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${sourceStyle.bg} ${sourceStyle.text}`}
                    >
                      {sourceStyle.label}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#94a3b8]">Total Jobs</span>
                      <span className="font-semibold text-[#0f172a]">{s.totalJobs}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#94a3b8]">Last Sync</span>
                      <span className="text-[#64748b]">
                        {s.lastSyncAt ? new Date(s.lastSyncAt).toLocaleString() : 'Never'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#94a3b8]">Errors</span>
                      <span
                        className={`font-semibold ${s.syncErrorCount > 0 ? 'text-red-600' : 'text-[#0f172a]'}`}
                      >
                        {s.syncErrorCount}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#94a3b8]">Frequency</span>
                      <span className="text-[#64748b]">
                        {s.syncFrequency.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {testResult && (
                    <div
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-3 text-xs font-medium ${
                        testResult.success
                          ? 'bg-emerald-50 text-emerald-700'
                          : testResult.message === 'Testing...'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {testResult.success ? (
                        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      ) : testResult.message === 'Testing...' ? (
                        <Zap className="w-3.5 h-3.5 flex-shrink-0 animate-pulse" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      )}
                      <span>{testResult.message}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 pt-3 border-t border-[#e2e8f0]">
                    <button
                      onClick={() => handleSync(s.id)}
                      disabled={syncing === s.id}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#5b4fe8]/10 text-[#5b4fe8] text-xs font-medium hover:bg-[#5b4fe8]/20 disabled:opacity-50"
                    >
                      {syncing === s.id ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <Play className="w-3 h-3" />
                      )}
                      Sync Now
                    </button>
                    <button
                      onClick={() => handleTest(s.id)}
                      disabled={testResult?.message === 'Testing...'}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-medium hover:bg-amber-100 disabled:opacity-50"
                    >
                      <Zap className="w-3 h-3" />
                      Test
                    </button>
                    <button
                      onClick={() => handleEdit(s)}
                      className="p-1.5 rounded-lg hover:bg-[#f1f5f9] text-[#64748b]"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {s.isActive && (
                      <button
                        onClick={() => handlePause(s.id)}
                        className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600"
                      >
                        <Pause className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}
