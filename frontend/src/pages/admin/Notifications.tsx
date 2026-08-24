import { useEffect, useState } from 'react';
import { adminApi } from '../../services/adminApi';
import { Bell, Check, CheckCheck } from 'lucide-react';

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res: any = await adminApi.notifications.list();
    if (res.success) { setNotifications(res.data.notifications); setTotal(res.data.total); setUnreadCount(res.data.unreadCount); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleMarkRead = async (id: number) => {
    await adminApi.notifications.markRead(id);
    load();
  };

  const handleMarkAllRead = async () => {
    await adminApi.notifications.markAllRead();
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Notifications</h1>
          <p className="text-sm text-[#64748b] mt-1">{unreadCount} unread of {total} total</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#e2e8f0] text-sm text-[#64748b] hover:bg-[#f8fafc]">
            <CheckCheck className="w-4 h-4" /> Mark All Read
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
        {loading ? [...Array(5)].map((_, i) => (
          <div key={i} className="px-4 py-4 border-b border-[#e2e8f0] animate-pulse">
            <div className="h-4 bg-[#e2e8f0] rounded w-48 mb-2" />
            <div className="h-3 bg-[#e2e8f0] rounded w-64" />
          </div>
        )) : notifications.length === 0 ? (
          <div className="px-4 py-12 text-center text-[#94a3b8]">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p>No notifications</p>
          </div>
        ) : notifications.map(n => (
          <div key={n.id} className={`px-4 py-4 border-b border-[#e2e8f0] flex items-start gap-3 ${!n.isRead ? 'bg-blue-50/30' : ''}`}>
            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!n.isRead ? 'bg-[#5b4fe8]' : 'bg-transparent'}`} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#0f172a]">{n.title}</p>
              <p className="text-sm text-[#64748b] mt-0.5">{n.message}</p>
              <p className="text-xs text-[#94a3b8] mt-1">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
            {!n.isRead && (
              <button onClick={() => handleMarkRead(n.id)}
                className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 flex-shrink-0" title="Mark as read">
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
