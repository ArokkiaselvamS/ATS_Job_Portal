import { useEffect, useState } from 'react';
import { adminApi } from '../../services/adminApi';
import { Settings, Save } from 'lucide-react';

interface SettingGroup { key: string; value: any; updatedAt: string }

export default function PlatformSettings() {
  const [settings, setSettings] = useState<Record<string, SettingGroup[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [edits, setEdits] = useState<Record<string, any>>({});

  const load = async () => {
    const res: any = await adminApi.settings.get();
    if (res.success) { setSettings(res.data); setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true);
    const settingsArray = Object.entries(edits).map(([key, value]) => ({
      key, value, category: 'general',
    }));
    if (settingsArray.length > 0) {
      await adminApi.settings.update(settingsArray);
      setEdits({});
      await load();
    }
    setSaving(false);
  };

  const updateEdit = (key: string, value: any) => setEdits(prev => ({ ...prev, [key]: value }));

  if (loading) return <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 h-64 animate-pulse" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Platform Settings</h1>
          <p className="text-sm text-[#64748b] mt-1">Configure platform behavior</p>
        </div>
        {Object.keys(edits).length > 0 && (
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#5b4fe8] text-white text-sm font-medium hover:bg-[#4636c9] disabled:opacity-60">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      {Object.entries(settings).length === 0 ? (
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-12 text-center">
          <Settings className="w-12 h-12 text-[#e2e8f0] mx-auto mb-3" />
          <p className="text-[#94a3b8]">No settings configured yet. Settings will appear here when added to the database.</p>
        </div>
      ) : (
        Object.entries(settings).map(([category, items]) => (
          <div key={category} className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
              <h3 className="font-bold text-[#0f172a] capitalize">{category.replace(/_/g, ' ')}</h3>
            </div>
            <div className="divide-y divide-[#e2e8f0]">
              {items.map((item: SettingGroup) => (
                <div key={item.key} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#0f172a]">{item.key.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-[#94a3b8] mt-0.5">Updated {new Date(item.updatedAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    {typeof item.value === 'boolean' ? (
                      <button onClick={() => updateEdit(item.key, !(edits[item.key] ?? item.value))}
                        className={`w-12 h-6 rounded-full transition-colors ${((edits[item.key] ?? item.value) ? 'bg-[#5b4fe8]' : 'bg-gray-300')}`}>
                        <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${((edits[item.key] ?? item.value) ? 'translate-x-6' : 'translate-x-0.5')}`} />
                      </button>
                    ) : (
                      <input
                        value={edits[item.key] ?? JSON.stringify(item.value)}
                        onChange={e => { try { updateEdit(item.key, JSON.parse(e.target.value)); } catch { updateEdit(item.key, e.target.value); } }}
                        className="px-3 py-1.5 rounded-lg border border-[#e2e8f0] text-sm text-right w-40 focus:outline-none focus:border-[#5b4fe8]"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
