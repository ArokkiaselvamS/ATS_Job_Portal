import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useRef, useEffect } from "react";
import { Menu, X, ChevronDown, User, Settings, LogOut, Trophy, BarChart3, FileText, Sparkles } from "lucide-react";

import aescionSymbol from "../assets/branding/aescion-symbol.png";
import aescionWordmark from "../assets/branding/aescion-wordmark.png";

const navItems = [
  { to: "/home", label: "Dashboard" },
  { to: "/connections", label: "Network" },
  { to: "/matches", label: "Matches", icon: Sparkles },
  { to: "/explore-jobs", label: "Jobs" },
  { to: "/applications", label: "Job Tracker" },
  { to: "/resume-builder", label: "Documents" },
  { to: "/services", label: "Services" },
  { to: "/invite", label: "Invite" },
];

export default function AuthenticatedLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const userName = user ? `${user.firstName} ${user.lastName}` : "User";
  const isJobSeeker = user?.role === "JOB_SEEKER";

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f9fc]">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
        <div className="mx-auto flex h-[68px] max-w-[1400px] items-center justify-between px-4 lg:px-8">
          
          {/* LEFT: Branding */}
          <NavLink to="/home" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
            <img src={aescionSymbol} alt="AESCION Symbol" className="h-9 w-auto object-contain" />
            <img src={aescionWordmark} alt="AESCION" className="h-5 w-auto object-contain mt-0.5" />
          </NavLink>

          {/* CENTER: Navigation */}
          <nav className="hidden items-center gap-6 lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `relative flex items-center gap-1.5 py-5 text-[14px] font-medium transition-colors ${
                    isActive
                      ? "text-blue-600 font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {item.icon && <item.icon className="h-3.5 w-3.5" />}
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-t-full bg-blue-600" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* RIGHT: Profile & Actions */}
          <div className="flex items-center gap-3">
            {isJobSeeker ? (
              /* Job Seeker Profile Dropdown */
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 transition-colors hover:bg-slate-50"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-xs font-semibold text-white shadow-sm">
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt="" className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <span>{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                    )}
                  </div>
                  <div className="hidden flex-col items-start sm:flex">
                    <span className="text-[13px] font-medium leading-tight text-slate-800">{userName}</span>
                    <span className="text-[11px] leading-tight text-slate-400">Job Seeker</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown */}
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-slate-200 bg-white shadow-xl">
                    {/* Profile Header */}
                    <div className="border-b border-slate-100 px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-semibold text-white shadow-sm">
                          {user?.profileImage ? (
                            <img src={user.profileImage} alt="" className="h-11 w-11 rounded-full object-cover" />
                          ) : (
                            <span>{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{userName}</p>
                          <p className="text-xs text-slate-500">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={() => { navigate('/profile'); setProfileOpen(false); }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <User className="h-4 w-4 text-slate-400" />
                        View Profile
                      </button>
                      <button
                        onClick={() => { navigate('/profile?tab=ats'); setProfileOpen(false); }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <BarChart3 className="h-4 w-4 text-slate-400" />
                        ATS Score
                      </button>
                      <button
                        onClick={() => { navigate('/profile?tab=resume'); setProfileOpen(false); }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <FileText className="h-4 w-4 text-slate-400" />
                        Resume
                      </button>
                      <button
                        onClick={() => { navigate('/resume-builder'); setProfileOpen(false); }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Trophy className="h-4 w-4 text-slate-400" />
                        Build ATS Resume
                      </button>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-slate-100" />

                    {/* Bottom Actions */}
                    <div className="py-2">
                      <button
                        onClick={() => { navigate('/profile?tab=settings'); setProfileOpen(false); }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Settings className="h-4 w-4 text-slate-400" />
                        Settings
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Non-Job-Seeker (Admin/Company): Keep original layout */
              <div className="hidden items-center gap-5 sm:flex">
                <div className="flex items-center gap-1.5 cursor-pointer text-slate-700 hover:text-slate-900">
                  <span className="text-[14px] font-medium">{user?.firstName || "Admin"}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <button
                  onClick={handleLogout}
                  className="text-[14px] font-medium text-slate-600 transition-colors hover:text-red-600"
                >
                  Log Out
                </button>
              </div>
            )}

            {/* Mobile hamburger toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="border-t border-slate-100 bg-white px-4 pb-4 pt-2 lg:hidden">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              {isJobSeeker && (
                <NavLink
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`
                  }
                >
                  Profile
                </NavLink>
              )}
              <div className="mt-2 border-t border-slate-100 pt-2 flex items-center justify-between px-3">
                <span className="text-sm font-medium text-slate-700">{userName}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Log Out
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Page Layout Container */}
      <main className="mx-auto w-full max-w-[1360px] flex-1 px-4 py-6 md:px-8 md:py-8">
        <Outlet />
      </main>
    </div>
  );
}
