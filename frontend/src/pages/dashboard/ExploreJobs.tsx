import { useState } from "react";
import {
  Search,
  MapPin,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { mockJobs } from "../../data/mockData";

const jobTypeFilters = ["Full Time", "Part Time", "Internship", "Contract"];
const workModeFilters = ["Remote", "Hybrid", "On-site"];
const experienceFilters = ["Fresher", "1–3 Years", "3–5 Years", "5+ Years"];
const dateFilters = ["Today", "Last 3 Days", "Last 7 Days", "Last 30 Days"];

export default function ExploreJobs() {
  const [showFilters, setShowFilters] = useState(false);
  const highlightJob = mockJobs[0]; // for the match card

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Explore Jobs</h1>
        <p className="mt-1 text-[15px] text-slate-500">
          Find the perfect job that matches your skills and career goals.
        </p>
      </div>

      {/* Search */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Job title, skills or keywords..."
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div className="relative sm:w-40">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Location"
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <select className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 sm:w-32">
          <option>All Modes</option>
          <option>Remote</option>
          <option>Hybrid</option>
          <option>On-site</option>
        </select>
        <button className="flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white transition-colors hover:bg-blue-700">
          <Search className="h-4 w-4" />
          Search Jobs
        </button>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 lg:hidden"
        >
          Filters <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Filters Sidebar */}
        <div className={`space-y-6 ${showFilters ? "block" : "hidden lg:block"}`}>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-[15px] font-semibold text-slate-900">Filters</h3>

            {/* Job Type */}
            <div className="mb-5">
              <h4 className="mb-2.5 text-sm font-medium text-slate-700">Job Type</h4>
              <div className="space-y-2">
                {jobTypeFilters.map((f) => (
                  <label key={f} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-slate-800">
                    <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    {f}
                  </label>
                ))}
              </div>
            </div>

            {/* Work Mode */}
            <div className="mb-5">
              <h4 className="mb-2.5 text-sm font-medium text-slate-700">Work Mode</h4>
              <div className="space-y-2">
                {workModeFilters.map((f) => (
                  <label key={f} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-slate-800">
                    <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    {f}
                  </label>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div className="mb-5">
              <h4 className="mb-2.5 text-sm font-medium text-slate-700">Experience</h4>
              <div className="space-y-2">
                {experienceFilters.map((f) => (
                  <label key={f} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-slate-800">
                    <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    {f}
                  </label>
                ))}
              </div>
            </div>

            {/* Date Posted */}
            <div>
              <h4 className="mb-2.5 text-sm font-medium text-slate-700">Date Posted</h4>
              <div className="space-y-2">
                {dateFilters.map((f) => (
                  <label key={f} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-slate-800">
                    <input type="radio" name="datePosted" className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500" />
                    {f}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Job Results */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">{mockJobs.length} jobs found</p>
            <select className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 outline-none focus:ring-2 focus:ring-blue-100">
              <option>Most Relevant</option>
              <option>Newest</option>
              <option>Salary: High to Low</option>
            </select>
          </div>

          <div className="space-y-3">
            {mockJobs.map((job) => (
              <div
                key={job.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
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
                    <p className="text-[11px] text-slate-400">Posted {job.postedAt}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button className="rounded-lg border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-amber-500" title="Save">
                      <Bookmark className="h-4 w-4" />
                    </button>
                    <button className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-700">
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Job Match Card */}
        <div className="hidden lg:block">
          <div className="sticky top-[84px] rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-[15px] font-semibold text-slate-900">Job Match</h3>
            <div className="mb-4 flex items-center justify-center">
              <div className="relative flex h-24 w-24 items-center justify-center">
                <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(highlightJob.matchPercent || 91) * 2.64} 264`}
                  />
                </svg>
                <span className="absolute text-xl font-bold text-slate-900">
                  {highlightJob.matchPercent || 91}%
                </span>
              </div>
            </div>
            <div className="space-y-2">
              {highlightJob.skills.map((s) => (
                <div key={s} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-slate-600">{s}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-slate-500">AWS preferred</span>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-500">
              Your skills match {highlightJob.matchPercent || 91}% of the requirements for this role.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
