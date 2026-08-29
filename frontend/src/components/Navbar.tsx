import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ArrowUpRight } from "lucide-react";
import Logo from "./Logo";

const navItems = [
  { label: "Find Jobs", to: "/explore-jobs" },
  { label: "Companies", to: "/explore-jobs?tab=companies" },
  { label: "Resume ATS Scanner", to: "/resume-builder" },
  { label: "Application Tracker", to: "/applications" },
  { label: "For Employers", to: "/company/register", isEmployer: true },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Scroll listener for Apple dynamic curvy navbar transformation
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 24) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile drawer on route change
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
    <>
      {/* APPLE CURVY DYNAMIC FLOATING NAVBAR */}
      <div className="fixed top-0 inset-x-0 z-50 flex justify-center pointer-events-none px-3 sm:px-6 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
        <header
          className={`pointer-events-auto w-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isScrolled
              ? "mt-2.5 sm:mt-3.5 max-w-[1080px] rounded-full bg-white/85 backdrop-blur-2xl border border-slate-200/90 shadow-xl shadow-slate-900/6 ring-1 ring-black/[0.04] py-2 px-4 sm:px-6 h-[54px]"
              : "mt-0 max-w-full rounded-none bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-none py-0 px-4 sm:px-6 lg:px-8 h-16"
          }`}
        >
          <div className="mx-auto flex h-full max-w-[1240px] items-center justify-between">

            {/* Left: Brand Logo */}
            <div className="flex items-center gap-3">
              <Logo
                iconSize={isScrolled ? 26 : 30}
                textSize={isScrolled ? "text-lg" : "text-xl"}
              />
            </div>

            {/* Center: Desktop Navigation Links */}
            <nav className="hidden items-center gap-6 lg:flex h-full">
              {navItems.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    className={`text-[13px] tracking-tight py-1 font-medium transition-colors ${
                      isActive
                        ? "text-[#0067b8] font-semibold"
                        : item.isEmployer
                        ? "text-[#F96302] font-semibold hover:text-[#D85300] flex items-center gap-1"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.isEmployer && <ArrowUpRight size={12} className="text-[#F96302]" />}
                  </Link>
                );
              })}
            </nav>

            {/* Right: User Actions (Apple / Microsoft Curvy Style) */}
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                to="/login"
                className={`text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-all ${
                  isScrolled
                    ? "rounded-full px-3.5 py-1.5 hover:bg-slate-100"
                    : "rounded-[4px] border border-slate-300 bg-white px-3.5 py-1.5 hover:bg-slate-50 shadow-2xs"
                }`}
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className={`bg-[#0067b8] text-xs font-semibold text-white hover:bg-[#005a9e] transition-all shadow-2xs ${
                  isScrolled
                    ? "rounded-full px-4 py-1.5"
                    : "rounded-[4px] px-4 py-1.5"
                }`}
              >
                Create account
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`inline-flex h-8 w-8 items-center justify-center border text-slate-700 hover:bg-slate-50 transition-colors ${
                  isScrolled
                    ? "rounded-full border-slate-300/80 bg-white/90"
                    : "rounded-md border-slate-200 bg-white"
                }`}
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
              </button>
            </div>

          </div>
        </header>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-50 lg:hidden">
          <div
            className="fixed inset-0 top-16 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative ml-auto flex h-[calc(100vh-64px)] w-full max-w-xs flex-col justify-between overflow-y-auto bg-white p-5 shadow-xl border-l border-slate-200">
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Navigation Menu
                </span>
              </div>
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.to;
                  return (
                    <Link
                      key={item.label}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-[#EEF0FE] text-[#0067b8] font-semibold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="border-t border-slate-200 pt-4 space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center rounded-full border border-slate-300 bg-white py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center rounded-full bg-[#0067b8] py-2 text-xs font-semibold text-white hover:bg-[#005a9e] transition-colors"
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Spacer so page content starts cleanly below header */}
      <div className="h-16 w-full shrink-0"></div>
    </>
  );
}