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
import { mockJobs, mockApplications } from "../../data/mockData";

export default function DashboardHome() {
  const { user } = useAuth();
  const firstName = user?.firstName || "User";

  const metrics = [
    { label: "Resume ATS", value: "82%", sub: "+5% from last week", icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Applications", value: "12", sub: "3 Interviews", icon: Briefcase, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Saved Jobs", value: "18", sub: "View saved jobs", icon: Bookmark, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Connections", value: "24", sub: "Grow your network", icon: Users, color: "text-violet-600", bg: "bg-violet-50" },
  ];

  const recentUpdates = [
    { icon: Calendar, color: "text-blue-600", bg: "bg-blue-50", title: "Interview scheduled", detail: "Frontend Developer – XYZ Ltd", time: "2 hours ago" },
    { icon: Eye, color: "text-emerald-600", bg: "bg-emerald-50", title: "Application viewed", detail: "Software Engineer – ABC Tech", time: "5 hours ago" },
    { icon: CheckCircle2, color: "text-slate-500", bg: "bg-slate-50", title: "Application submitted", detail: "Full Stack Developer – Tech Corp", time: "1 day ago" },
    { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", title: "Under screening", detail: "React Developer – Infosys", time: "2 days ago" },
  ];

  const progress = [
    { label: "Resume Completion", value: 85 },
    { label: "Profile Completion", value: 90 },
    { label: "ATS Score", value: 82 },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Welcome, {firstName} 👋
        </h1>
        <p className="mt-1 text-[15px] text-slate-500">
          Let's build your future. Find the right opportunities and take the next step in your career.
        </p>
      </div>

      {/* Search */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search jobs by title, skills, company..."
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div className="relative sm:w-48">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Location"
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <button className="flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white transition-colors hover:bg-blue-700">
          <Search className="h-4 w-4" />
          Search
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${m.bg}`}>
              <m.icon className={`h-5 w-5 ${m.color}`} />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{m.label}</p>
              <p className="mt-0.5 text-2xl font-bold text-slate-900">{m.value}</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                {m.sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 3-column dashboard */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recommended Jobs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recommended Jobs</h2>
            <a href="/explore-jobs" className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
          <div className="space-y-3">
            {mockJobs.slice(0, 3).map((job) => (
              <div
                key={job.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="flex-1 space-y-2">
                  <div>
                    <h3 className="text-[15px] font-semibold text-slate-900">{job.title}</h3>
                    <p className="text-sm text-slate-500">{job.company}</p>
                  </div>
                  <p className="text-xs text-slate-500">
                    {job.location} · {job.workMode} · ₹{(job.salaryMin / 100000).toFixed(0)}–{(job.salaryMax / 100000).toFixed(0)} LPA
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {job.skills.map((s) => (
                      <span
                        key={s}
                        className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
                  {job.matchPercent && (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                      {job.matchPercent}% Match
                    </span>
                  )}
                  <div className="flex gap-2">
                    <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50">
                      View
                    </button>
                    <button className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700">
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Recent Updates */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Recent Updates</h2>
            <div className="space-y-3">
              {recentUpdates.map((u, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${u.bg}`}>
                    <u.icon className={`h-4 w-4 ${u.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">{u.title}</p>
                    <p className="truncate text-xs text-slate-500">{u.detail}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{u.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Career Progress */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Continue Your Career</h2>
            <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              {progress.map((p) => (
                <div key={p.label}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">{p.label}</span>
                    <span className="text-sm font-semibold text-slate-900">{p.value}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all duration-700"
                      style={{ width: `${p.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
