import { Users, Plus, Search, Edit, Trash2, Mail, Loader2, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../../api/client';

interface TeamMember {
  id: number;
  userId: number;
  name: string;
  email: string;
  profileImage: string | null;
  role: string;
  isActive: boolean;
  joined: string;
  lastLogin: string | null;
}

export default function CompanyAdminTeam() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ firstName: '', lastName: '', email: '', role: 'recruiter' });
  const [saving, setSaving] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const fetchMembers = async () => {
    try {
      const res = await api.get('/company-admin/team');
      if (res.data.success) { setMembers(res.data.data); }
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchMembers(); }, []);

  const handleInvite = async () => {
    setSaving(true);
    try {
      const res = await api.post('/company-admin/team', inviteForm);
      if (res.data.success) { setMessage({ type: 'success', text: 'Member invited successfully' }); setShowInvite(false); setInviteForm({ firstName: '', lastName: '', email: '', role: 'recruiter' }); fetchMembers(); }
      else { setMessage({ type: 'error', text: res.data.message || 'Failed to invite member' }); }
    } catch { setMessage({ type: 'error', text: 'Failed to invite member' }); }
    finally { setSaving(false); setTimeout(() => setMessage(null), 3000); }
  };

  const handleUpdateRole = async (member: TeamMember, newRole: string) => {
    try {
      const res = await api.put(`/company-admin/team/${member.id}`, { role: newRole });
      if (res.data.success) { setMessage({ type: 'success', text: 'Role updated' }); setEditingMember(null); fetchMembers(); }
    } catch { setMessage({ type: 'error', text: 'Failed to update role' }); }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleRemove = async (member: TeamMember) => {
    if (!confirm(`Remove ${member.name} from the team?`)) return;
    try {
      const res = await api.delete(`/company-admin/team/${member.id}`);
      if (res.data.success) { setMessage({ type: 'success', text: 'Member removed' }); fetchMembers(); }
    } catch { setMessage({ type: 'error', text: 'Failed to remove member' }); }
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-slate-900">Team</h1><p className="text-slate-600 mt-1">Manage team members and permissions</p></div>
        <button onClick={() => setShowInvite(true)} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"><Plus size={18} />Invite Member</button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}<p className="text-sm">{message.text}</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200">
        {loading ? (
          <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-slate-400" size={32} /><p className="text-slate-500 mt-2">Loading...</p></div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center text-slate-500"><Users size={48} className="mx-auto mb-3 text-slate-300" /><p>No team members</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Member</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Role</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Joined</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
              </tr></thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          {m.profileImage ? <img src={m.profileImage} alt="" className="w-full h-full rounded-full object-cover" /> : <span className="text-blue-600 font-bold">{m.name.split(' ').map(n => n[0]).join('')}</span>}
                        </div>
                        <div><p className="font-medium text-slate-900">{m.name}</p><p className="text-sm text-slate-500">{m.email}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 capitalize">{m.role}</span></td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${m.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{m.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td className="px-4 py-3 text-slate-500">{new Date(m.joined).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setEditingMember(m)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500" title="Edit Role"><Edit size={16} /></button>
                        <button onClick={() => handleRemove(m)} className="p-2 rounded-lg hover:bg-red-50 text-red-500" title="Remove"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowInvite(false)}>
          <div className="bg-white rounded-xl border border-slate-200 w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Invite Team Member</h3>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">First Name *</label><input value={inviteForm.firstName} onChange={e => setInviteForm(p => ({ ...p, firstName: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Last Name *</label><input value={inviteForm.lastName} onChange={e => setInviteForm(p => ({ ...p, lastName: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Email *</label><input type="email" value={inviteForm.email} onChange={e => setInviteForm(p => ({ ...p, email: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label><select value={inviteForm.role} onChange={e => setInviteForm(p => ({ ...p, role: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-slate-300"><option value="admin">Admin</option><option value="recruiter">Recruiter</option><option value="hiring_manager">Hiring Manager</option></select></div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowInvite(false)} className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm">Cancel</button>
              <button onClick={handleInvite} disabled={saving || !inviteForm.firstName || !inviteForm.email} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 text-sm">{saving && <Loader2 size={16} className="animate-spin" />}Send Invite</button>
            </div>
          </div>
        </div>
      )}

      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setEditingMember(null)}>
          <div className="bg-white rounded-xl border border-slate-200 w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Edit Role - {editingMember.name}</h3>
            <select defaultValue={editingMember.role} onChange={e => handleUpdateRole(editingMember, e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300">
              <option value="admin">Admin</option>
              <option value="recruiter">Recruiter</option>
              <option value="hiring_manager">Hiring Manager</option>
            </select>
            <div className="flex justify-end mt-4"><button onClick={() => setEditingMember(null)} className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm">Cancel</button></div>
          </div>
        </div>
      )}
    </div>
  );
}