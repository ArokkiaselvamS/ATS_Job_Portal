import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Home,
  FileText,
  Users,
  Compass,
  ClipboardList,
  Briefcase,
  UserPlus,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/resume-builder", label: "Resume Builder", icon: FileText },
  { to: "/connections", label: "Connections", icon: Users },
  { to: "/explore-jobs", label: "Explore Jobs", icon: Compass },
  { to: "/applications", label: "Application Tracker", icon: ClipboardList },
  { to: "/services", label: "Services", icon: Briefcase },
  { to: "/invite", label: "Invite", icon: UserPlus },
];

export default function AuthenticatedLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9fb]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-[60px] max-w-[1400px] items-center justify-between px-4 lg:px-8">
          {/* Logo */}
          <NavLink to="/home" className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AESCION
            </span>
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                    isActive
                      ? "text-blue-600"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-blue-600" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 sm:flex">
              <span className="text-[13px] font-medium text-slate-600">
                {user?.firstName}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden xl:inline">Log Out</span>
              </button>
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="border-t border-slate-100 bg-white px-4 pb-4 pt-2 lg:hidden">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
              <button
                onClick={handleLogout}
                className="mt-2 flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Page Content */}
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 lg:px-8 lg:py-8">
        <Outlet />
      </main>
    </div>
  );
}
