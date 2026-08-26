import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Sparkles,
  Briefcase,
  FileText,
  Bookmark,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  ArrowUpRight,
  Award,
} from "lucide-react";

import aescionSymbol from "../assets/branding/aescion-symbol.png";
import aescionWordmark from "../assets/branding/aescion-wordmark.png";

const mainNavItems = [
  { to: "/home", label: "Dashboard", icon: LayoutDashboard },
  { to: "/connections", label: "Network", icon: Users },
  { to: "/matches", label: "Matches", icon: Sparkles },
  { to: "/explore-jobs", label: "Jobs", icon: Briefcase },
  { to: "/applications", label: "Job Tracker", icon: FileText },
  { to: "/resume-builder", label: "Documents", icon: Bookmark },
  { to: "/services", label: "Services", icon: Award },
  { to: "/invite", label: "Invite", icon: ChevronRight },
];

const quickLinks = [
  { to: "/profile", label: "Profile", icon: Users },
  { to: "/profile?tab=settings", label: "Settings", icon: Settings },
  { to: "/help", label: "Help & Support", icon: HelpCircle },
  { to: "#", label: "Logout", icon: LogOut, onClick: true },
];

export default function ApplicantSidebar({ onLogout }: { onLogout: () => void }) {
  const location = useLocation();

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-slate-950 text-white z-40 flex flex-col border-r border-slate-800">
      {/* Top: Brand */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-slate-800/50">
        <div className="flex items-center gap-2.5 min-w-0">
          <img src={aescionSymbol} alt="AESCION Symbol" className="h-8 max-h-8 w-auto object-contain" style={{ height: "32px" }} />
          <img src={aescionWordmark} alt="AESCION" className="h-5 max-h-5 w-auto object-contain mt-0.5" style={{ height: "20px" }} />
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to || (item.to !== "/home" && location.pathname.startsWith(item.to));
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white shadow-[0_4px_20px_rgba(59,130,246,0.15)]"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="px-3 border-t border-slate-800/30 my-2" />

      {/* Quick Links */}
      <div className="px-3 pb-3">
        <p className="px-3 mb-2 text-[10px] font-bold tracking-widest uppercase text-slate-500">
          Quick Links
        </p>
        <nav className="space-y-0.5">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            const isLogout = item.onClick;
            return (
              <button
                key={item.to}
                onClick={isLogout ? onLogout : undefined}
                className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium transition-all text-slate-400 hover:bg-slate-800/50 hover:text-white ${
                  isLogout ? "text-red-400 hover:text-red-300 hover:bg-red-500/10" : ""
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Upgrade Section */}
      <div className="mx-3 mb-4 p-4 rounded-2xl bg-gradient-to-br from-blue-600/15 to-purple-600/15 border border-slate-800/50">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25">
              <ArrowUpRight className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Upgrade to Pro</p>
              <p className="text-[12px] text-slate-400 leading-tight">
                Unlock premium career features and get noticed by top recruiters.
              </p>
            </div>
          </div>
          <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-500/20 transition-all hover:shadow-md hover:shadow-blue-500/30 active:scale-[0.99]">
            Upgrade Now
          </button>
        </div>
      </div>
    </aside>
  );
}