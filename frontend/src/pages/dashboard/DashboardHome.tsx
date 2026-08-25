import {
  Search,
  MapPin,
  FileText,
  Briefcase,
  Bookmark,
  Users,
  TrendingUp,
  ArrowRight,
  Clock,
  Eye,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function DashboardHome() {
  const { user } = useAuth();
  const userName = user?.firstName || "there";

  return (
    <div className="space-y-8 pb-10">
      
      {/* ── 1. WELCOME HERO SECTION WITH 3D DASHBOARD VISUAL ── */}
      <div className="relative overflow-hidden rounded-3xl bg-white p-6 md:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-200/70">
        {/* Background ambient gradient blur */}
        <div className="pointer-events-none absolute -top-12 -left-12 h-64 w-64 rounded-full bg-blue-100/50 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-purple-100/50 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Left Text */}
          <div className="max-w-2xl space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Welcome back, {userName}!
            </h1>
            <p className="text-sm font-normal leading-relaxed text-slate-500 md:text-[15px]">
              Let's build your future. Find the right opportunities and take the next step in your career.
            </p>
          </div>

          {/* Right Visual Representation (3D Character & Dashboard Card) */}
          <div className="relative flex shrink-0 justify-center lg:justify-end">
            <div className="relative w-full max-w-[340px] rounded-2xl bg-gradient-to-br from-indigo-50/80 to-purple-50/80 p-4 border border-indigo-100/50 shadow-inner">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 rounded-full bg-indigo-600/10 flex items-center justify-center text-indigo-600 font-bold text-xs">
                  AI
                </div>
                <div>
                  <div className="h-2 w-24 rounded-full bg-slate-300" />
                  <div className="mt-1 h-1.5 w-16 rounded-full bg-slate-200" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg bg-white p-2.5 shadow-sm border border-slate-100">
                  <span className="text-xs font-medium text-slate-600">Career Growth</span>
                  <span className="text-xs font-bold text-slate-400">--</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white p-2.5 shadow-sm border border-slate-100">
                  <span className="text-xs font-medium text-slate-600">Profile Strength</span>
                  <span className="text-xs font-bold text-slate-400">--</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. JOB SEARCH SECTION ── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-3 md:p-4 shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          
          {/* Search jobs input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search jobs by title, skills, company..."
              className="h-11 w-full rounded-xl border border-slate-200/80 bg-slate-50/60 pl-10 pr-4 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100/50"
            />
          </div>

          {/* Location input */}
          <div className="relative md:w-56">
            <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Location"
              className="h-11 w-full rounded-xl border border-slate-200/80 bg-slate-50/60 pl-10 pr-4 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100/50"
            />
          </div>

          {/* Search button with Gradient Treatment */}
          <button className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-orange-500 px-8 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all hover:opacity-95 active:scale-[0.99]">
            <Search className="h-4 w-4" />
            Search
          </button>
        </div>
      </div>

      {/* ── 3. ANALYTICS / METRIC CARDS ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* CARD 1: Resume ATS Score */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FileText className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">RESUME ATS SCORE</span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">--</span>
          </div>
          <p className="mt-1 text-xs font-semibold text-slate-400">
            Upload your resume to see your score
          </p>
          {/* Subtle Sparkline Curve */}
          <svg className="absolute bottom-2 right-2 h-10 w-24 text-blue-400/30" viewBox="0 0 100 30" fill="none">
            <path d="M0 25 Q25 5, 50 18 T100 5" stroke="currentColor" strokeWidth="2.5" fill="none" />
          </svg>
        </div>

        {/* CARD 2: Applications */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Briefcase className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">APPLICATIONS</span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-slate-900">0</span>
          </div>
          <p className="mt-1 text-xs font-semibold text-slate-400">
            No applications yet
          </p>
          {/* Subtle Bar Chart */}
          <div className="absolute bottom-3 right-3 flex items-end gap-1">
            <div className="h-2 w-1.5 rounded-t bg-slate-200/60" />
            <div className="h-2 w-1.5 rounded-t bg-slate-200/60" />
            <div className="h-2 w-1.5 rounded-t bg-slate-200/60" />
            <div className="h-2 w-1.5 rounded-t bg-slate-200/60" />
          </div>
        </div>

        {/* CARD 3: Saved Jobs */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Bookmark className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">SAVED JOBS</span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-slate-900">0</span>
          </div>
          <a href="/explore-jobs" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700">
            View saved jobs →
          </a>
          {/* Subtle Wavy Graph Line */}
          <svg className="absolute bottom-2 right-2 h-10 w-24 text-amber-400/30" viewBox="0 0 100 30" fill="none">
            <path d="M0 20 Q30 28, 60 10 T100 15" stroke="currentColor" strokeWidth="2.5" fill="none" />
          </svg>
        </div>

        {/* CARD 4: Connections */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">CONNECTIONS</span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-slate-900">0</span>
          </div>
          <p className="mt-1 text-xs font-semibold text-purple-400">
            Grow your network
          </p>
          {/* Subtle Purple Wavy Line */}
          <svg className="absolute bottom-2 right-2 h-10 w-24 text-purple-400/30" viewBox="0 0 100 30" fill="none">
            <path d="M0 15 Q25 25, 50 10 T100 20" stroke="currentColor" strokeWidth="2.5" fill="none" />
          </svg>
        </div>

      </div>

      {/* ── 4. MAIN TWO-COLUMN CONTENT LAYOUT ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* LEFT COLUMN: Recommended Jobs (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Recommended Jobs</h2>
            <a href="/explore-jobs" className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Empty State */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-10 text-center shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <Briefcase className="h-7 w-7 text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              No Recommended Jobs Yet
            </h3>
            <p className="mt-1.5 text-sm text-slate-500">
              Complete your profile to get personalized job recommendations.
            </p>
            <a
              href="/explore-jobs"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-700"
            >
              <Search className="h-3.5 w-3.5" />
              Browse Jobs
            </a>
          </div>
        </div>

        {/* RIGHT COLUMN: Recent Updates (1 col) */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Recent Updates</h2>

          {/* Empty State */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-10 text-center shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <Clock className="h-7 w-7 text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              No Recent Updates
            </h3>
            <p className="mt-1.5 text-sm text-slate-500">
              Activity from your applications will appear here.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
