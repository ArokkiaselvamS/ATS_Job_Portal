import { useCompanyAdminAuth } from '../../hooks/useCompanyAdminAuth';
import { Settings, User, Bell, Shield, Building2, Save, CreditCard, Moon, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../../api/client';

export default function CompanyAdminSettings() {
  const { admin, refreshAdmin } = useCompanyAdminAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [companyData, setCompanyData] = useState<any>(null);
  const [profileForm, setProfileForm] = useState({ firstName: admin?.firstName || '', lastName: admin?.lastName || '', email: admin?.email || '' });
  const [companyForm, setCompanyForm] = useState({ name: '', industry: '', companySize: '', website: '', description: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/company-admin/company');
        if (res.data.success && res.data.data) {
          setCompanyData(res.data.data);
          setCompanyForm({
            name: res.data.data.name || '',
            industry: res.data.data.industry || '',
            companySize: res.data.data.companySize || '',
            website: res.data.data.website || '',
            description: res.data.data.description || '',
          });
        }
      } catch {}
    };
    fetchData();
  }, []);

  const handleProfileSave = async () => {
    setSaving(true); setError('');
    try {
      await api.put('/company-admin/company', {});
      setSaved(true); setTimeout(() => setSaved(false), 3000);
      await refreshAdmin();
    } catch { setError('Failed to save profile'); } finally { setSaving(false); }
  };

  const handleCompanySave = async () => {
    setSaving(true); setError('');
    try {
      const res = await api.put('/company-admin/company', companyForm);
      if (res.data.success) { setCompanyData(res.data.data); setSaved(true); setTimeout(() => setSaved(false), 3000); await refreshAdmin(); }
      else { setError('Failed to save company settings'); }
    } catch { setError('Failed to save company settings'); } finally { setSaving(false); }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'company', label: 'Company', icon: Building2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">Settings</h1><p className="text-slate-600 mt-1">Manage your account and company settings</p></div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="border-b border-slate-200 overflow-x-auto">
          <nav className="flex gap-1 px-4" role="tablist">
            {tabs.map((tab) => (
              <button key={tab.id} role="tab" aria-selected={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200'}`}>
                <tab.icon size={16} />{tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {saved && (
            <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 flex items-center gap-3 text-green-700"><CheckCircle size={20} /><p className="text-sm">Settings saved successfully!</p></div>
          )}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3 text-red-700"><AlertCircle size={20} /><p className="text-sm">{error}</p></div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-2xl">
              <h2 className="text-lg font-semibold text-slate-900">Personal Information</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">First Name</label><input type="text" value={profileForm.firstName} onChange={e => setProfileForm(p => ({ ...p, firstName: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Last Name</label><input type="text" value={profileForm.lastName} onChange={e => setProfileForm(p => ({ ...p, lastName: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /></div>
                <div className="sm:col-span-2"><label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label><input type="email" value={profileForm.email} disabled className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500" /></div>
              </div>
              <button onClick={handleProfileSave} disabled={saving} className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50">
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}{saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

          {activeTab === 'company' && (
            <div className="space-y-6 max-w-2xl">
              <h2 className="text-lg font-semibold text-slate-900">Company Information</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Company Name</label><input type="text" value={companyForm.name} onChange={e => setCompanyForm(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Industry</label><input type="text" value={companyForm.industry} onChange={e => setCompanyForm(p => ({ ...p, industry: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Company Size</label><input type="text" value={companyForm.companySize} onChange={e => setCompanyForm(p => ({ ...p, companySize: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Website</label><input type="url" value={companyForm.website} onChange={e => setCompanyForm(p => ({ ...p, website: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /></div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label><textarea rows={4} value={companyForm.description} onChange={e => setCompanyForm(p => ({ ...p, description: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none" /></div>
              <button onClick={handleCompanySave} disabled={saving} className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50">
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}{saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6 max-w-2xl">
              <h2 className="text-lg font-semibold text-slate-900">Notification Preferences</h2>
              {[
                { label: 'New Applications', desc: 'Get notified when candidates apply to your jobs' },
                { label: 'Interview Reminders', desc: 'Reminders for upcoming interviews' },
                { label: 'Job Expiration', desc: 'Alerts when job postings are about to expire' },
                { label: 'Team Activity', desc: 'Updates when team members take actions' },
                { label: 'Weekly Digest', desc: 'Summary of hiring activity sent every Monday' },
                { label: 'System Updates', desc: 'Important platform updates and maintenance notices' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-4 rounded-lg border border-slate-200">
                  <div><p className="font-medium text-slate-900">{item.label}</p><p className="text-sm text-slate-500">{item.desc}</p></div>
                  <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" defaultChecked className="sr-only peer" /><div className="w-11 h-6 bg-slate-200 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div></label>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 max-w-2xl">
              <h2 className="text-lg font-semibold text-slate-900">Security Settings</h2>
              <div className="p-4 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between">
                  <div><p className="font-medium text-slate-900">Two-Factor Authentication</p><p className="text-sm text-slate-500">Add an extra layer of security to your account</p></div>
                  <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" className="sr-only peer" /><div className="w-11 h-6 bg-slate-200 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div></label>
                </div>
              </div>
              <div className="p-4 rounded-lg border border-slate-200">
                <p className="font-medium text-slate-900">Password</p>
                <p className="text-sm text-slate-500 mt-1">Keep your account secure with a strong password</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}