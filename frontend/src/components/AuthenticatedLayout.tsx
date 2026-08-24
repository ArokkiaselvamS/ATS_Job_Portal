import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";

import aescionSymbol from "../assets/branding/aescion-symbol.png";
import aescionWordmark from "../assets/branding/aescion-wordmark.png";

const navItems = [
  { to: "/home", label: "Dashboard" },
  { to: "/connections", label: "Matches" },
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

  const userName = user?.firstName || "surya";

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f9fc]">
      {/* Premium Header (h-16 / 64px) */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
        <div className="mx-auto flex h-[68px] max-w-[1400px] items-center justify-between px-4 lg:px-8">
          
          {/* LEFT: Branding with uploaded Symbol + Wordmark */}
          <NavLink to="/home" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
            <img src={aescionSymbol} alt="AESCION Symbol" className="h-9 w-auto object-contain" />
            <img src={aescionWordmark} alt="AESCION" className="h-5 w-auto object-contain mt-0.5" />
          </NavLink>

          {/* CENTER: Navigation (TEXT ONLY — NO ICONS) */}
          <nav className="hidden items-center gap-6 lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `relative py-5 text-[14px] font-medium transition-colors ${
                    isActive
                      ? "text-blue-600 font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-t-full bg-blue-600" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* RIGHT: User Profile & Log Out */}
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-5 sm:flex">
              <div className="flex items-center gap-1.5 cursor-pointer text-slate-700 hover:text-slate-900">
                <span className="text-[14px] font-medium">{userName}</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </div>

              <button
                onClick={handleLogout}
                className="text-[14px] font-medium text-slate-600 transition-colors hover:text-red-600"
              >
                Log Out
              </button>
            </div>

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
