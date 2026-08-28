import { Bell, Check, Mail, MessageSquare, Clock, FileText, Calendar, Briefcase, Users, Loader2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../../api/client';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function CompanyAdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/company-admin/notifications');
      if (res.data.success) { setNotifications(res.data.data); }
      else { setError('Failed to load notifications'); }
    } catch { setError('Unable to connect to server'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markRead = async (id: number) => {
    try {
      const res = await api.patch(`/company-admin/notifications/${id}/read`);
      if (res.data.success) { setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n)); }
    } catch {}
  };

  const markAllRead = async () => {
    try {
      const res = await api.patch('/company-admin/notifications/read-all');
      if (res.data.success) { setNotifications(prev => prev.map(n => ({ ...n, isRead: true }))); }
    } catch {}
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'COMPANY_APPROVED': return <Briefcase className="w-5 h-5 text-green-600" />;
      case 'COMPANY_REJECTED': return <Briefcase className="w-5 h-5 text-red-600" />;
      case 'JOB_APPROVED': return <Briefcase className="w-5 h-5 text-blue-600" />;
      case 'JOB_REJECTED': return <Briefcase className="w-5 h-5 text-red-600" />;
      case 'REPORT_RECEIVED': return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case 'ACCOUNT_SUSPENDED': return <Bell className="w-5 h-5 text-red-600" />;
      default: return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-slate-900">Notifications</h1><p className="text-slate-600 mt-1">Stay updated with your company activity{unreadCount > 0 ? ` (${unreadCount} unread)` : ''}</p></div>
        {unreadCount > 0 && <button onClick={markAllRead} className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm font-medium">Mark all as read</button>}
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3 text-red-700"><AlertCircle size={20} /><p className="text-sm">{error}</p></div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center"><Loader2 className="animate-spin mx-auto text-slate-400" size={32} /></div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500"><Bell size={48} className="mx-auto mb-3 text-slate-300" /><p>No notifications yet</p></div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-200">
          {notifications.map((n) => (
            <div key={n.id} className={`p-4 flex items-start gap-4 transition-colors ${!n.isRead ? 'bg-blue-50' : ''}`}>
              <div className="p-2 rounded-lg bg-slate-100 flex-shrink-0">{getIcon(n.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className={`font-medium text-slate-900 ${!n.isRead ? 'font-semibold' : ''}`}>{n.title}</p>
                    <p className="text-sm text-slate-600 mt-1">{n.message}</p>
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap">{timeAgo(n.createdAt)}</span>
                </div>
              </div>
              {!n.isRead && (
                <button onClick={() => markRead(n.id)} className="p-1 rounded-lg hover:bg-slate-200 text-slate-400" title="Mark as read">
                  <Check size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}