import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { Menu, LogOut, Bell, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface TopbarProps {
  onMenuToggle: () => void;
}

export default function AdminTopbar({ onMenuToggle }: TopbarProps) {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/admin');
  };

  return (
    <header className="h-16 bg-white border-b border-[#e2e8f0] flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button onClick={onMenuToggle} className="p-2 rounded-lg hover:bg-[#f1f5f9] text-[#64748b] lg:hidden">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg hover:bg-[#f1f5f9] text-[#64748b] relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[#f1f5f9] transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2B26D9] to-[#f97316] flex items-center justify-center shadow-sm">
              <span className="text-white text-xs font-bold">SA</span>
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-[#0f172a]">Super Admin</p>
              <p className="text-xs font-medium text-[#64748b]">Super Admin</p>
            </div>
            <ChevronDown className="w-4 h-4 text-[#94a3b8]" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-[#e2e8f0] rounded-xl shadow-lg py-1 z-50">
              <div className="px-4 py-2 border-b border-[#e2e8f0]">
                <p className="text-sm font-semibold text-[#0f172a]">Super Admin</p>
                <p className="text-xs text-[#94a3b8]">{admin?.email || 'superadmin@aescion.com'}</p>
              </div>
              <button onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
