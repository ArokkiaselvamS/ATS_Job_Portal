import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Briefcase, Users, FileText, MessageSquare,
  Calendar, BarChart3, Settings, ChevronLeft, ChevronRight, Building
} from 'lucide-react';

function AescionSymbol({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 260" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <polygon points="0,0 150,0 75,130" fill="#4338CA" />
      <polygon points="150,0 300,0 225,130" fill="#F97316" />
      <polygon points="75,130 225,130 150,260" fill="#374151" />
      <path d="M52,42 L75,32 L98,42 L98,68 Q75,82 52,68 Z" fill="none" stroke="white" strokeWidth="4" />
      <rect x="67" y="52" width="16" height="14" rx="2" fill="white" />
      <path d="M70,52 L70,46 Q75,40 80,46 L80,52" fill="none" stroke="white" strokeWidth="3" />
      <rect x="195" y="38" width="40" height="40" rx="5" fill="none" stroke="white" strokeWidth="3.5" />
      <text x="215" y="64" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold" fontFamily="Arial,sans-serif">AI</text>
      <line x1="215" y1="32" x2="215" y2="38" stroke="white" strokeWidth="2.5" />
      <line x1="200" y1="34" x2="200" y2="38" stroke="white" strokeWidth="2.5" />
      <line x1="230" y1="34" x2="230" y2="38" stroke="white" strokeWidth="2.5" />
      <line x1="215" y1="78" x2="215" y2="84" stroke="white" strokeWidth="2.5" />
      <line x1="200" y1="76" x2="200" y2="84" stroke="white" strokeWidth="2.5" />
      <line x1="230" y1="76" x2="230" y2="84" stroke="white" strokeWidth="2.5" />
      <line x1="189" y1="58" x2="195" y2="58" stroke="white" strokeWidth="2.5" />
      <line x1="189" y1="50" x2="195" y2="50" stroke="white" strokeWidth="2.5" />
      <line x1="235" y1="58" x2="241" y2="58" stroke="white" strokeWidth="2.5" />
      <line x1="235" y1="50" x2="241" y2="50" stroke="white" strokeWidth="2.5" />
      <polygon points="150,98 118,114 150,130 182,114" fill="white" />
      <rect x="138" y="114" width="24" height="3" fill="white" />
      <rect x="146" y="117" width="8" height="16" fill="white" />
      <rect x="125" y="170" width="50" height="34" rx="3" fill="none" stroke="white" strokeWidth="3.5" />
      <rect x="143" y="204" width="14" height="5" fill="white" />
      <rect x="136" y="209" width="28" height="3" rx="1" fill="white" />
      <path d="M144,182 Q150,176 156,182" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M147,187 Q150,183 153,187" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="150" cy="191" r="1.5" fill="white" />
    </svg>
  );
}

function AescionWordmark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <text x="0" y="16" fill="white" fontSize="17" fontWeight="700" fontFamily="'Inter','Segoe UI',Arial,sans-serif" letterSpacing="0.5">
        AESCION
      </text>
    </svg>
  );
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  companyName?: string;
}

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/company-admin/dashboard', icon: LayoutDashboard },
  { divider: 'COMPANY' },
  { label: 'Company Page', path: '/company-admin/company-page', icon: Building },
  { divider: 'JOBS' },
  { label: 'Jobs', path: '/company-admin/jobs', icon: Briefcase },
  { label: 'Applications', path: '/company-admin/applications', icon: FileText },
  { label: 'Candidates', path: '/company-admin/candidates', icon: Users },
  { label: 'Interviews', path: '/company-admin/interviews', icon: Calendar },
  { divider: 'TEAM' },
  { label: 'Team', path: '/company-admin/team', icon: Users },
  { divider: 'ANALYTICS' },
  { label: 'Analytics', path: '/company-admin/analytics', icon: BarChart3 },
  { divider: 'SETTINGS' },
  { label: 'Notifications', path: '/company-admin/notifications', icon: MessageSquare },
  { label: 'Settings', path: '/company-admin/settings', icon: Settings },
];

export default function CompanyAdminSidebar({ isOpen, onToggle, companyName }: SidebarProps) {
  const location = useLocation();

  return (
    <aside className={`fixed top-0 left-0 h-full bg-slate-900 text-white z-40 transition-all duration-300 flex flex-col ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="flex items-center justify-between px-3 h-16 border-b border-white/10">
        {isOpen && (
          <div className="flex items-center gap-2.5 min-w-0">
            <AescionSymbol className="h-8 w-8 shrink-0" />
            <div className="flex flex-col min-w-0">
              <AescionWordmark className="h-4 w-auto" />
              <span className="text-[9px] font-bold tracking-widest uppercase text-slate-300 mt-0.5">COMPANY ADMIN</span>
            </div>
          </div>
        )}
        {!isOpen && (
          <div className="flex items-center justify-center mx-auto">
            <AescionSymbol className="h-8 w-8" />
          </div>
        )}
        <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors shrink-0">
          {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="px-3 py-2 border-b border-white/10">
          <p className="text-xs font-medium text-slate-400 truncate">{companyName || 'Company'}</p>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {NAV_ITEMS.map((item, i) => {
          if ('divider' in item) {
            return (
              <div key={i} className="pt-4 pb-1.5 px-2">
                <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">{item.divider}</span>
              </div>
            );
          }
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/company-admin/dashboard' && location.pathname.startsWith(item.path));
          return (
            <NavLink key={item.path} to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600/20 text-blue-300'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}