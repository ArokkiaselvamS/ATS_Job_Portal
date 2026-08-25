import { Outlet, useNavigate, NavLink, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useRef, useEffect } from "react";
import { Bell, User, ChevronDown, Briefcase, Settings, LogOut, Menu, X, Sparkles } from "lucide-react";

import aescionSymbol from "../assets/branding/aescion-symbol.png";
import aescionWordmark from "../assets/branding/aescion-wordmark.png";

const topNavItems = [
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const userName = user ? `${user.firstName} ${user.lastName}` : "surya surya";

  // Strict role scope check — Job Seeker only
  if (user?.role && user.role !== "JOB_SEEKER") {
    return <Navigate to="/" replace />;
  }

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50 flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 lg:px-8">
          {/* Left: Brand + Mobile Menu Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <NavLink to="/home" className="flex items-center gap-2.5 shrink-0 transition-opacity hover:opacity-95">
              <img
                src={aescionSymbol}
                alt="AESCION Symbol"
                className="h-8 max-h-8 w-auto object-contain shrink-0"
                style={{ height: "32px", width: "auto" }}
              />
              <span className="text-xl font-extrabold tracking-tight select-none leading-none flex items-center" style={{ fontFamily: "'Inter', sans-serif" }}>
                <span className="text-[#F96302]">AE</span>
                <span className="text-[#2B26D9]">SCI</span>
                <span className="text-[#363636]">ON</span>
              </span>
            </NavLink>
          </div>

          {/* Center: Top Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 flex-1 justify-center h-full mx-2">
            {topNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `relative flex items-center gap-1.5 px-2.5 xl:px-3 py-5 text-xs xl:text-[13px] font-semibold whitespace-nowrap transition-colors border-b-2 ${
                    isActive
                      ? "border-blue-600 text-blue-600 font-bold"
                      : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                  }`
                }
              >
                {item.icon && <item.icon className="h-3.5 w-3.5 text-blue-500 shrink-0" />}
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <Bell className="h-4.5 w-4.5" />
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  3
                </span>
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
                  <div className="border-b border-slate-100 px-4 py-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                    <button className="text-xs text-blue-600 font-medium hover:underline">Mark all read</button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {[
                      { title: "Application Update", desc: "Your application for UI/UX Designer at TechCorp is now in screening", time: "2h ago", unread: true },
                      { title: "New Job Match", desc: "Product Designer at Google - 95% match", time: "5h ago", unread: true },
                      { title: "Profile Viewed", desc: "Your profile was viewed by Amazon Recruiters", time: "1d ago", unread: false },
                      { title: "Connection Request", desc: "Sarah Chen wants to connect with you", time: "2d ago", unread: false },
                    ].map((notif, i) => (
                      <button
                        key={i}
                        className={`w-full px-4 py-3 text-left border-b border-slate-100/50 transition-colors hover:bg-slate-50 ${
                          notif.unread ? "bg-blue-50/30" : ""
                        }`}
                      >
                        <p className={`text-sm font-medium ${notif.unread ? "text-slate-900" : "text-slate-700"}`}>
                          {notif.title}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">{notif.desc}</p>
                        <p className="mt-1 text-[11px] text-slate-400">{notif.time}</p>
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-slate-100 px-4 py-2">
                    <button className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700">
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-1.5 transition-colors hover:bg-slate-100"
              >
                <div className="relative">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-sm">
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt="" className="h-9 w-9 rounded-full object-cover" />
                    ) : (
                      <span>SS</span>
                    )}
                  </div>
                </div>
                <div className="hidden flex-col items-start sm:flex">
                  <span className="text-[13px] font-semibold leading-tight text-slate-900">{userName}</span>
                  <span className="text-[11px] font-medium leading-tight text-slate-400">Job Seeker</span>
                </div>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
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
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{userName}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
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
                      <Briefcase className="h-4 w-4 text-slate-400" />
                      ATS Score
                    </button>
                    <button
                      onClick={() => { navigate('/resume-builder'); setProfileOpen(false); }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Settings className="h-4 w-4 text-slate-400" />
                      Documents
                    </button>
                    <button
                      onClick={() => { navigate('/profile?tab=settings'); setProfileOpen(false); }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Settings className="h-4 w-4 text-slate-400" />
                      Settings
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-slate-100" />

                  {/* Bottom Actions */}
                  <div className="py-2">
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
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-100 bg-white px-4 pb-4 pt-2 lg:hidden">
            <nav className="flex flex-col gap-1">
              {topNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
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

      {/* Main Page Content */}
      <main className="mx-auto w-full max-w-[1360px] flex-1 px-4 py-6 md:px-8 md:py-8">
        <Outlet />
      </main>
    </div>
  );
}