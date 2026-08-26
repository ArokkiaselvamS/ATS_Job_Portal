import { useCompanyAdminAuth } from '../../hooks/useCompanyAdminAuth';
import { Menu, Bell, LogOut, User, ChevronDown, Settings } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { api } from '../../api/client';

interface TopbarProps {
  onMenuToggle: () => void;
}

export default function CompanyAdminTopbar({ onMenuToggle }: TopbarProps) {
  const { admin, logout } = useCompanyAdminAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setProfileOpen(false);
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) setNotificationsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/company-admin/notifications');
        if (res.data.success) {
          const data = res.data.data || [];
          setNotifications(data.slice(0, 5));
          setUnreadCount(data.filter((n: any) => !n.isRead).length);
        }
      } catch {}
    };
    fetchNotifications();
  }, [notificationsOpen]);

  const handleLogout = async () => { await logout(); };

  const markRead = async (id: number) => {
    try {
      await api.patch(`/company-admin/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button onClick={onMenuToggle} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors lg:hidden" aria-label="Toggle sidebar"><Menu className="w-5 h-5" /></button>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500">{admin?.companyName || 'Company'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative" ref={notificationsRef}>
            <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors" aria-label="Notifications">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </button>
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-slate-200 shadow-lg py-2">
                <div className="px-4 py-2 border-b border-slate-200 font-semibold text-slate-900">Notifications</div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-6 text-center text-sm text-slate-400">No notifications</p>
                  ) : notifications.map((n: any) => (
                    <div key={n.id} className={`px-4 py-3 text-sm hover:bg-slate-50 ${!n.isRead ? 'bg-blue-50' : ''}`}>
                      <p className="font-medium text-slate-900">{n.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{n.message}</p>
                      {!n.isRead && <button onClick={() => markRead(n.id)} className="text-xs text-blue-600 mt-1">Mark read</button>}
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-slate-200">
                  <a href="/company-admin/notifications" className="text-sm font-medium text-blue-600 hover:text-blue-700">View all notifications</a>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
            <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors" aria-label="Profile menu">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"><User className="w-4 h-4 text-blue-600" /></div>
              <span className="hidden sm:block text-sm font-medium text-slate-700">{admin?.firstName} {admin?.lastName}</span>
              <ChevronDown className="w-4 h-4 text-slate-500 hidden sm:block" />
            </button>
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-lg py-2">
                <div className="px-4 py-3 border-b border-slate-200">
                  <p className="font-medium text-slate-900">{admin?.firstName} {admin?.lastName}</p>
                  <p className="text-sm text-slate-500">{admin?.email}</p>
                  <p className="text-xs text-slate-400 mt-1">{admin?.companyName}</p>
                </div>
                <a href="/company-admin/settings" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Settings className="w-4 h-4" />Settings</a>
                <hr className="my-2 border-slate-200" />
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-50 flex items-center gap-2"><LogOut className="w-4 h-4" />Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}