import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ArrowRight, UserCheck } from "lucide-react";
import Logo from "./Logo";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Application Tracker", to: "/application-tracker" },
  { label: "Resume Builder", to: "/resume-builder" },
  { label: "Employers", to: "/employers" },
  { label: "Blog", to: "/blog" },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-[80px] sm:h-[88px] max-w-[1420px] items-center justify-between px-4 sm:px-6 lg:px-10">
        
        {/* Left side: Logo mark with company name right beside it */}
        <Logo iconSize={42} textSize="text-2xl sm:text-[28px]" />

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden items-center gap-7 xl:gap-9 lg:flex">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.label}
                to={item.to}
                className={`relative text-[15px] font-semibold transition-colors duration-150 py-2 ${
                  isActive
                    ? "text-[#2B26D9]"
                    : "text-slate-700 hover:text-[#2B26D9]"
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full bg-[#2B26D9]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right side: Auth Action Buttons (Desktop & Tablet) */}
        <div className="hidden items-center gap-3 sm:flex">
          <Link
            to="/login"
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-[15px] font-bold text-slate-800 transition duration-150 hover:border-[#2B26D9] hover:bg-slate-50 hover:text-[#2B26D9]"
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#2B26D9] to-[#4334ee] px-6 py-2.5 text-[15px] font-bold text-white shadow-md shadow-indigo-200 transition duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-300 active:translate-y-0"
          >
            Join Now
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Mobile / Tablet Hamburger Toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            to="/register"
            className="hidden sm:none rounded-lg bg-[#2B26D9] px-3.5 py-1.5 text-xs font-bold text-white sm:hidden"
          >
            Join
          </Link>
          
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-over Drawer & Backdrop */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[80px] sm:top-[88px] z-50 lg:hidden">
          {/* Dark transparent backdrop */}
          <div
            className="fixed inset-0 top-[80px] sm:top-[88px] bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Menu Panel */}
          <div className="relative ml-auto flex h-[calc(100vh-80px)] sm:h-[calc(100vh-88px)] w-full max-w-sm flex-col justify-between overflow-y-auto bg-white p-6 shadow-2xl">
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Navigation
                </p>
              </div>
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.to;
                  return (
                    <Link
                      key={item.label}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between rounded-xl px-4 py-3 text-base font-semibold transition ${
                        isActive
                          ? "bg-indigo-50 text-[#2B26D9]"
                          : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {item.label}
                      {isActive && <span className="h-2 w-2 rounded-full bg-[#2B26D9]" />}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Auth Actions */}
            <div className="mt-8 border-t border-slate-100 pt-6 space-y-3">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3.5 text-center text-base font-bold text-slate-800 transition hover:bg-slate-50"
              >
                <UserCheck size={18} />
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2B26D9] to-[#F96302] py-3.5 text-center text-base font-bold text-white shadow-lg shadow-indigo-200 transition hover:opacity-95"
              >
                Join Now
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}