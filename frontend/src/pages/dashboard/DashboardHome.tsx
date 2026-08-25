import {
  FileText,
  Briefcase,
  Bookmark,
  Users,
  TrendingUp,
  ArrowRight,
  Eye,
  CheckCircle2,
  ArrowUpRight,
  MapPin,
  Shield,
  Star,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function DashboardHome() {
  const { user } = useAuth();
  const userName = user?.firstName || "surya";

  const recentActivity = [
    {
      icon: Briefcase,
      iconBg: "bg-blue-50 text-blue-600 border border-blue-100",
      title: "You applied for UI/UX Designer at TechCorp",
      time: "2 hours ago",
    },
    {
      icon: Eye,
      iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100",
      title: "Profile viewed by Amazon",
      time: "5 hours ago",
    },
    {
      icon: Sparkles,
      iconBg: "bg-purple-50 text-purple-600 border border-purple-100",
      title: "New job match: Product Designer at Google",
      time: "1 day ago",
    },
    {
      icon: Bookmark,
      iconBg: "bg-amber-50 text-amber-600 border border-amber-100",
      title: "Saved: Senior Frontend Engineer at Microsoft",
      time: "2 days ago",
    },
    {
      icon: CheckCircle2,
      iconBg: "bg-indigo-50 text-indigo-600 border border-indigo-100",
      title: "Application updated: Screening at Meta",
      time: "3 days ago",
    },
  ];

  // EXACTLY 2 RECOMMENDED JOBS ONLY
  const recommendedJobs = [
    {
      id: 1,
      title: "Senior UI/UX Designer",
      company: "TechCorp Solutions",
      companyLogo: "TC",
      logoBg: "bg-slate-100 text-slate-700 font-bold",
      location: "Bangalore, India",
      type: "Full Time",
      matchPercent: 95,
      matchBadgeStyle: "text-emerald-700 bg-emerald-50 border-emerald-200/80",
      skills: ["Figma", "Design Systems", "Prototyping", "User Research"],
    },
    {
      id: 2,
      title: "Product Designer",
      company: "Google",
      companyLogo: "G",
      logoBg: "bg-blue-50 text-blue-600 font-bold",
      location: "Hyderabad, India",
      type: "Full Time",
      matchPercent: 92,
      matchBadgeStyle: "text-blue-700 bg-blue-50 border-blue-200/80",
      skills: ["Product Design", "Design Systems", "Figma", "User Testing"],
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* ── 1. WELCOME BANNER ── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 md:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: Welcome Message */}
          <div className="max-w-2xl space-y-1.5">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl flex items-center gap-2">
              Welcome back, {userName}! <span className="inline-block animate-bounce">👋</span>
            </h1>
            <p className="text-sm font-normal text-slate-500 leading-relaxed">
              Let&apos;s build your future. Find the right opportunities and take the next step in your career.
            </p>
          </div>

          {/* Right: Metric Cards (Profile Strength & Career Growth) */}
          <div className="flex flex-col sm:flex-row items-stretch gap-4 shrink-0">
            {/* Profile Strength */}
            <div className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 min-w-[220px] flex-1">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <Shield className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">PROFILE STRENGTH</p>
                <div className="flex items-center gap-2.5 mt-1">
                  <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all duration-1000"
                      style={{ width: "85%" }}
                    />
                  </div>
                  <span className="text-xs font-extrabold text-slate-900">85%</span>
                </div>
                <p className="mt-1 text-[11px] font-semibold text-emerald-600">Strong</p>
              </div>
            </div>

            {/* Career Growth */}
            <div className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 min-w-[220px] flex-1">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">CAREER GROWTH</p>
                <div className="flex items-center gap-2.5 mt-1">
                  <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-purple-600 transition-all duration-1000"
                      style={{ width: "72%" }}
                    />
                  </div>
                  <span className="text-xs font-extrabold text-slate-900">72%</span>
                </div>
                <p className="mt-1 text-[11px] font-semibold text-emerald-600">On Track</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. SUMMARY CARDS (4 EQUAL CARDS IN 1 ROW) ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Resume ATS Score */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all hover:shadow-md">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <FileText className="h-4.5 w-4.5" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">RESUME ATS SCORE</span>
            </div>

            <div className="mt-4 flex items-center gap-3">
              {/* Gauge */}
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
                <svg className="h-24 w-24 -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="7"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray="251"
                    strokeDashoffset={`${251 * (1 - 0.85)}`}
                  />
                </svg>
                <div className="absolute flex flex-col items-center leading-none">
                  <span className="text-2xl font-extrabold text-slate-900">85</span>
                  <span className="mt-1 text-[9px] font-bold text-emerald-600 whitespace-nowrap">Excellent Match</span>
                </div>
              </div>

              <div className="flex flex-col justify-center">
                <p className="text-xs font-medium text-slate-500">Improve your score</p>
                <button className="mt-1.5 flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  Optimize Resume
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Applications */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all hover:shadow-md">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <Briefcase className="h-4.5 w-4.5" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">APPLICATIONS</span>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-slate-900">12</span>
              <p className="mt-1 text-xs font-medium text-slate-400">2 in progress</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100/80">
            <button className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700">
              View Applications <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Card 3: Saved Jobs */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all hover:shadow-md">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                <Bookmark className="h-4.5 w-4.5" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">SAVED JOBS</span>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-slate-900">18</span>
              <p className="mt-1 text-xs font-medium text-slate-400">View all saved jobs</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100/80">
            <button className="flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700">
              View Saved Jobs <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Card 4: Connections */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all hover:shadow-md">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                <Users className="h-4.5 w-4.5" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">CONNECTIONS</span>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-slate-900">156</span>
              <p className="mt-1 text-xs font-medium text-slate-400">People in your network</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100/80">
            <button className="flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700">
              Grow your network <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. TWO-COLUMN LAYOUT (RECENT ACTIVITY & RECOMMENDED JOBS) ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* LEFT COLUMN: Recent Activity */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between h-7">
            <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
            <button className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all hover:shadow-md"
              >
                <div className={`flex shrink-0 h-10 w-10 items-center justify-center rounded-xl ${activity.iconBg}`}>
                  <activity.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{activity.title}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Recommended Jobs for You (EXACTLY 2 JOBS) ── */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between h-7">
            <h2 className="text-lg font-bold text-slate-900">Recommended Jobs for You</h2>
            <button className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recommendedJobs.map((job) => (
              <div
                key={job.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5 min-w-0">
                    {/* Logo */}
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${job.logoBg} border border-slate-200/60 text-sm`}>
                      {job.companyLogo}
                    </div>
                    {/* Info */}
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 truncate">{job.title}</h3>
                      <p className="text-xs font-medium text-slate-500 truncate">{job.company}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {job.location}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {job.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Match Badge */}
                  <span className={`shrink-0 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${job.matchBadgeStyle}`}>
                    <Star className="h-3 w-3 fill-current" />
                    {job.matchPercent}% Match
                  </span>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100/80">
                  {job.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center rounded-md bg-slate-100/70 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="mt-3.5 flex items-center justify-end gap-2">
                  <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                    <Bookmark className="h-3.5 w-3.5" />
                    Save
                  </button>
                  <button className="flex items-center gap-1 rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors">
                    View Details <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}