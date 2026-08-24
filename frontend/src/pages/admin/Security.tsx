import { useEffect, useState } from 'react';
import { adminApi } from '../../services/adminApi';
import { Shield, AlertTriangle, Ban, Eye } from 'lucide-react';

export default function Security() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.security.get().then((res: any) => { if (res.success) setData(res.data); setLoading(false); });
  }, []);

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-xl border border-[#e2e8f0] p-6 h-40 animate-pulse" />)}</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a]">Security Center</h1>
        <p className="text-sm text-[#64748b] mt-1">Monitor platform security</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600"><Eye className="w-5 h-5" /></div>
            <div>
              <p className="text-sm text-[#64748b]">Recent Logins</p>
              <p className="text-2xl font-bold text-[#0f172a]">{data.recentLogins.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600"><Ban className="w-5 h-5" /></div>
            <div>
              <p className="text-sm text-[#64748b]">Suspended Users</p>
              <p className="text-2xl font-bold text-[#0f172a]">{data.suspendedUsers.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center text-red-600"><Shield className="w-5 h-5" /></div>
            <div>
              <p className="text-sm text-[#64748b]">Blocked Users</p>
              <p className="text-2xl font-bold text-[#0f172a]">{data.blockedUsers.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
          <h3 className="text-sm font-bold text-[#0f172a] uppercase tracking-wider mb-4">Suspended Users</h3>
          {data.suspendedUsers.length === 0 ? (
            <p className="text-sm text-[#94a3b8]">No suspended users</p>
          ) : (
            <div className="space-y-3">
              {data.suspendedUsers.map((u: any) => (
                <div key={u.id} className="flex items-center justify-between py-2 border-b border-[#e2e8f0] last:border-0">
                  <div>
                    <p className="text-sm font-medium text-[#0f172a]">{u.firstName} {u.lastName}</p>
                    <p className="text-xs text-[#94a3b8]">{u.suspensionReason || 'No reason'}</p>
                  </div>
                  <span className="text-xs text-[#94a3b8]">{u.suspendedAt ? new Date(u.suspendedAt).toLocaleDateString() : '—'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
          <h3 className="text-sm font-bold text-[#0f172a] uppercase tracking-wider mb-4">Blocked Users</h3>
          {data.blockedUsers.length === 0 ? (
            <p className="text-sm text-[#94a3b8]">No blocked users</p>
          ) : (
            <div className="space-y-3">
              {data.blockedUsers.map((u: any) => (
                <div key={u.id} className="flex items-center justify-between py-2 border-b border-[#e2e8f0] last:border-0">
                  <div>
                    <p className="text-sm font-medium text-[#0f172a]">{u.firstName} {u.lastName}</p>
                    <p className="text-xs text-[#94a3b8]">{u.email}</p>
                  </div>
                  <span className="text-xs text-[#94a3b8]">{u.blockedAt ? new Date(u.blockedAt).toLocaleDateString() : '—'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 lg:col-span-2">
          <h3 className="text-sm font-bold text-[#0f172a] uppercase tracking-wider mb-4">Recent Audit Activity</h3>
          {data.recentAuditLogs.length === 0 ? (
            <p className="text-sm text-[#94a3b8]">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {data.recentAuditLogs.slice(0, 10).map((a: any) => (
                <div key={a.id} className="flex items-center gap-3 py-2 border-b border-[#e2e8f0] last:border-0">
                  <div className="w-2 h-2 rounded-full bg-[#5b4fe8] flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-[#0f172a]">
                      <span className="font-semibold">{a.admin.firstName} {a.admin.lastName}</span>
                      {' '}{a.action.replace(/_/g, ' ').toLowerCase()} on {a.entityType} #{a.entityId || '—'}
                    </p>
                    <p className="text-xs text-[#94a3b8]">{new Date(a.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
