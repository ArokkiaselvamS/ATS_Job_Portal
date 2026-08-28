import { useCompanyAdminAuth } from '../../hooks/useCompanyAdminAuth';
import { Building2, Save, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../../api/client';

export default function CompanyAdminCompanyPage() {
  const { admin } = useCompanyAdminAuth();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    companySize: '',
    website: '',
    description: '',
    country: '',
    state: '',
    city: '',
    address: '',
  });

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await api.get('/company-admin/company');
        if (res.data.success && res.data.data) {
          const c = res.data.data;
          setCompany(c);
          setFormData({
            name: c.name || '',
            industry: c.industry || '',
            companySize: c.companySize || '',
            website: c.website || '',
            description: c.description || '',
            country: c.country || '',
            state: c.state || '',
            city: c.city || '',
            address: c.address || '',
          });
        }
      } catch {
        setMessage({ type: 'error', text: 'Failed to load company data' });
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await api.put('/company-admin/company', formData);
      if (res.data.success) {
        setCompany(res.data.data);
        setMessage({ type: 'success', text: 'Company profile updated successfully' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: 'Failed to update company profile' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to update company profile' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-slate-900">Company Page</h1><p className="text-slate-600 mt-1">Loading...</p></div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse"><div className="h-8 bg-slate-200 rounded w-48 mb-4"></div><div className="grid gap-4 sm:grid-cols-2">{[1,2,3,4].map(i=><div key={i} className="h-20 bg-slate-200 rounded"></div>)}</div></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Company Page</h1>
        <p className="text-slate-600 mt-1">Manage your company profile and public page</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center">
            {company?.logo ? (
              <img src={company.logo} alt="Company logo" className="w-full h-full object-cover rounded-xl" />
            ) : (
              <Building2 size={32} className="text-slate-400" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{admin?.companyName}</h2>
            <p className="text-slate-500">Company ID: {admin?.companyId}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Company Name</label>
            <input type="text" value={formData.name} onChange={e => handleChange('name', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Industry</label>
            <input type="text" value={formData.industry} onChange={e => handleChange('industry', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Company Size</label>
            <input type="text" value={formData.companySize} onChange={e => handleChange('companySize', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Website</label>
            <input type="url" value={formData.website} onChange={e => handleChange('website', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Country</label>
            <input type="text" value={formData.country} onChange={e => handleChange('country', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">State</label>
            <input type="text" value={formData.state} onChange={e => handleChange('state', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">City</label>
            <input type="text" value={formData.city} onChange={e => handleChange('city', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
            <input type="text" value={formData.address} onChange={e => handleChange('address', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
          <textarea rows={4} value={formData.description} onChange={e => handleChange('description', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none" />
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}