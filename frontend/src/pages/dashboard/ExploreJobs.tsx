import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  MapPin,
  ChevronDown,
  Briefcase,
  Bookmark,
  X,
  Loader2,
  CheckCircle2,
  FileText,
  Clock,
  Building2,
  IndianRupee,
  DollarSign,
  SlidersHorizontal,
  Filter,
  XCircle,
  Send,
  ExternalLink,
} from "lucide-react";
import { jobApi } from "../../services/jobApi";

// ── Types ─────────────────────────────────────────────────

interface Job {
  id: number;
  title: string;
  description: string;
  companyId: number;
  companyName?: string | null;
  location?: string | null;
  city?: string | null;
  country?: string | null;
  jobType: string;
  workMode: string;
  experienceLevel?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  skills: string[];
  status: string;
  postedAt: string;
  closingDate?: string | null;
  views?: number;
  company?: {
    id: number;
    name: string;
    logo?: string | null;
    description?: string | null;
    website?: string | null;
    industry?: string | null;
    companySize?: string | null;
    location?: string | null;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Filters {
  jobType: string[];
  workMode: string[];
  experienceLevel: string[];
}

const JOB_TYPE_OPTIONS = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"];
const WORK_MODE_OPTIONS = ["REMOTE", "HYBRID", "ONSITE"];
const EXPERIENCE_OPTIONS = ["FRESHER", "1_3_YEARS", "3_5_YEARS", "5_PLUS_YEARS"];

const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
};

const WORK_MODE_LABELS: Record<string, string> = {
  REMOTE: "Remote",
  HYBRID: "Hybrid",
  ONSITE: "On-site",
};

const EXPERIENCE_LABELS: Record<string, string> = {
  FRESHER: "Fresher",
  "1_3_YEARS": "1-3 Years",
  "3_5_YEARS": "3-5 Years",
  "5_PLUS_YEARS": "5+ Years",
};

const EXPERIENCE_DISPLAY: Record<string, string> = {
  FRESHER: "Fresher",
  "1-3 Years": "1-3 Years",
  "1_3_YEARS": "1-3 Years",
  "3-5 Years": "3-5 Years",
  "3_5_YEARS": "3-5 Years",
  "5+ Years": "5+ Years",
  "5_PLUS_YEARS": "5+ Years",
};

const LOGO_COLORS = [
  "bg-blue-600",
  "bg-emerald-600",
  "bg-violet-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-cyan-600",
  "bg-indigo-600",
  "bg-teal-600",
];

function getLogoColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return LOGO_COLORS[Math.abs(hash) % LOGO_COLORS.length];
}

function timeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

function formatSalary(job: Job) {
  if (job.salaryMin == null && job.salaryMax == null) return null;
  const currency = job.salaryCurrency === "INR" || job.salaryCurrency === "₹" ? "₹" : "$";
  if (job.salaryMin != null && job.salaryMax != null) {
    if (job.salaryMin >= 100000) {
      return `${currency}${(job.salaryMin / 100000).toFixed(1)}-${(job.salaryMax / 100000).toFixed(1)} LPA`;
    }
    return `${currency}${(job.salaryMin / 1000).toFixed(0)}k-${(job.salaryMax / 1000).toFixed(0)}k`;
  }
  if (job.salaryMin != null) {
    return `${currency}${job.salaryMin >= 100000 ? (job.salaryMin / 100000).toFixed(1) + " LPA" : (job.salaryMin / 1000).toFixed(0) + "k+"}`;
  }
  if (job.salaryMax != null) {
    return `Up to ${currency}${job.salaryMax >= 100000 ? (job.salaryMax / 100000).toFixed(1) + " LPA" : (job.salaryMax / 1000).toFixed(0) + "k"}`;
  }
  return null;
}

// ── Main Component ────────────────────────────────────────

export default function ExploreJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search
  const [keyword, setKeyword] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [sortBy, setSortBy] = useState("postedAt");

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    jobType: [],
    workMode: [],
    experienceLevel: [],
  });

  // Saved jobs
  const [savedJobIds, setSavedJobIds] = useState<Set<number>>(new Set());
  const [savingJobId, setSavingJobId] = useState<number | null>(null);

  // Job Detail Modal
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Quick Apply Modal
  const [applyJob, setApplyJob] = useState<Job | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [applyNotes, setApplyNotes] = useState("");
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  const currentPage = useRef(1);
  const abortRef = useRef<AbortController | null>(null);

  // ── Fetch Jobs ──────────────────────────────────────────

  const fetchJobs = useCallback(
    async (page: number, append = false) => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);

      const params: Record<string, string> = {
        page: String(page),
        limit: "12",
        sortBy,
      };

      if (keyword.trim()) params.search = keyword.trim();
      if (locationSearch.trim()) params.location = locationSearch.trim();
      if (filters.jobType.length === 1) params.jobType = filters.jobType[0];
      if (filters.workMode.length === 1) params.workMode = filters.workMode[0];
      if (filters.experienceLevel.length === 1) params.experienceLevel = filters.experienceLevel[0];

      try {
        const res = await jobApi.search(params);
        if (controller.signal.aborted) return;

        if (res.success && res.data) {
          const { jobs: fetched, pagination: pag } = res.data;
          setJobs((prev) => (append ? [...prev, ...fetched] : fetched));
          setPagination(pag);
        } else {
          setError(res.message || "Failed to fetch jobs");
          if (!append) setJobs([]);
        }
      } catch {
        if (!controller.signal.aborted) {
          setError("Unable to connect to the server.");
          if (!append) setJobs([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [keyword, locationSearch, filters, sortBy]
  );

  // Initial fetch
  useEffect(() => {
    currentPage.current = 1;
    fetchJobs(1);
    return () => abortRef.current?.abort();
  }, [fetchJobs]);

  // ── Search Handler ──────────────────────────────────────

  const handleSearch = () => {
    currentPage.current = 1;
    fetchJobs(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  // ── Filter Toggle ───────────────────────────────────────

  const toggleFilter = (category: keyof Filters, value: string) => {
    setFilters((prev) => {
      const current = prev[category];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [category]: next };
    });
  };

  const clearFilters = () => {
    setFilters({ jobType: [], workMode: [], experienceLevel: [] });
  };

  const hasActiveFilters =
    filters.jobType.length > 0 ||
    filters.workMode.length > 0 ||
    filters.experienceLevel.length > 0;

  // ── Load More ───────────────────────────────────────────

  const loadMore = () => {
    if (!pagination || currentPage.current >= pagination.totalPages) return;
    currentPage.current += 1;
    fetchJobs(currentPage.current, true);
  };

  // ── Save / Unsave ──────────────────────────────────────

  const toggleSave = async (jobId: number) => {
    if (savingJobId !== null) return;
    setSavingJobId(jobId);

    const isSaved = savedJobIds.has(jobId);
    setSavedJobIds((prev) => {
      const next = new Set(prev);
      if (isSaved) next.delete(jobId);
      else next.add(jobId);
      return next;
    });

    try {
      const res = isSaved ? await jobApi.unsave(jobId) : await jobApi.save(jobId);
      if (!res.success) {
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          if (isSaved) next.add(jobId);
          else next.delete(jobId);
          return next;
        });
      }
    } catch {
      setSavedJobIds((prev) => {
        const next = new Set(prev);
        if (isSaved) next.add(jobId);
        else next.delete(jobId);
        return next;
      });
    } finally {
      setSavingJobId(null);
    }
  };

  // ── View Job Detail ────────────────────────────────────

  const openDetail = async (job: Job) => {
    setSelectedJob(job);
    setDetailLoading(true);
    try {
      const res = await jobApi.getById(job.id);
      if (res.success && res.data) {
        setSelectedJob(res.data);
      }
    } catch {
      // keep the basic job data
    } finally {
      setDetailLoading(false);
    }
  };

  // ── Quick Apply ────────────────────────────────────────

  const openApply = (job: Job) => {
    setApplyJob(job);
    setCoverLetter("");
    setApplyNotes("");
    setApplySuccess(false);
    setApplyError(null);
    setAlreadyApplied(false);
  };

  const submitApplication = async () => {
    if (!applyJob) return;
    setApplySubmitting(true);
    setApplyError(null);

    try {
      const res = await jobApi.apply(applyJob.id, {
        coverLetterUrl: coverLetter || undefined,
        notes: applyNotes || undefined,
      });

      if (res.success) {
        setApplySuccess(true);
      } else {
        if (res.message?.toLowerCase().includes("already applied")) {
          setAlreadyApplied(true);
        } else {
          setApplyError(res.message || "Failed to submit application");
        }
      }
    } catch {
      setApplyError("Unable to connect to the server.");
    } finally {
      setApplySubmitting(false);
    }
  };

  // ── Active filter count for mobile badge ────────────────

  const activeFilterCount =
    filters.jobType.length + filters.workMode.length + filters.experienceLevel.length;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Explore Jobs</h1>
        <p className="mt-1 text-[15px] text-slate-500">
          Find the perfect job that matches your skills and career goals.
        </p>
      </div>

      {/* ── Search Bar ── */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Job title, skills or keywords..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div className="relative sm:w-44">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Location"
            value={locationSearch}
            onChange={(e) => setLocationSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 sm:w-40"
        >
          <option value="postedAt">Most Recent</option>
          <option value="salary">Salary: High to Low</option>
          <option value="title">Title: A-Z</option>
          <option value="company">Company: A-Z</option>
        </select>
        <button
          onClick={handleSearch}
          className="flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Search className="h-4 w-4" />
          Search
        </button>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="relative flex h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 lg:hidden"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
          {activeFilterCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Main Layout ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* ── Filter Sidebar ── */}
        <div
          className={`space-y-4 ${
            showFilters ? "block" : "hidden lg:block"
          } lg:col-span-1`}
        >
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-slate-900">Filters</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Job Type */}
            <div className="mb-5">
              <h4 className="mb-2.5 text-sm font-medium text-slate-700">Job Type</h4>
              <div className="space-y-2">
                {JOB_TYPE_OPTIONS.map((f) => (
                  <label
                    key={f}
                    className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 hover:text-slate-800"
                  >
                    <input
                      type="checkbox"
                      checked={filters.jobType.includes(f)}
                      onChange={() => toggleFilter("jobType", f)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    {JOB_TYPE_LABELS[f]}
                  </label>
                ))}
              </div>
            </div>

            {/* Work Mode */}
            <div className="mb-5">
              <h4 className="mb-2.5 text-sm font-medium text-slate-700">Work Mode</h4>
              <div className="space-y-2">
                {WORK_MODE_OPTIONS.map((f) => (
                  <label
                    key={f}
                    className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 hover:text-slate-800"
                  >
                    <input
                      type="checkbox"
                      checked={filters.workMode.includes(f)}
                      onChange={() => toggleFilter("workMode", f)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    {WORK_MODE_LABELS[f]}
                  </label>
                ))}
              </div>
            </div>

            {/* Experience Level */}
            <div>
              <h4 className="mb-2.5 text-sm font-medium text-slate-700">
                Experience Level
              </h4>
              <div className="space-y-2">
                {EXPERIENCE_OPTIONS.map((f) => (
                  <label
                    key={f}
                    className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 hover:text-slate-800"
                  >
                    <input
                      type="checkbox"
                      checked={filters.experienceLevel.includes(f)}
                      onChange={() => toggleFilter("experienceLevel", f)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    {EXPERIENCE_LABELS[f]}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Job Match Card */}
          <div className="sticky top-[84px] hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:block">
            <h3 className="mb-3 text-[15px] font-semibold text-slate-900">Job Match</h3>
            <div className="mb-4 flex items-center justify-center">
              <div className="relative flex h-24 w-24 items-center justify-center">
                <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                </svg>
                <span className="absolute text-xl font-bold text-slate-400">--</span>
              </div>
            </div>
            <p className="text-center text-xs text-slate-400">
              Complete your profile to see job matches.
            </p>
          </div>
        </div>

        {/* ── Job Results ── */}
        <div className="space-y-4 lg:col-span-3">
          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {pagination ? (
                <>
                  <span className="font-medium text-slate-700">{pagination.total}</span>{" "}
                  {pagination.total === 1 ? "job" : "jobs"} found
                </>
              ) : (
                "Loading..."
              )}
            </p>
            {hasActiveFilters && (
              <div className="hidden items-center gap-2 sm:flex">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-xs text-slate-500">
                  {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""} active
                </span>
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex h-64 items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-sm text-slate-500">Searching for jobs...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                Something went wrong
              </h3>
              <p className="mt-2 text-sm text-slate-500">{error}</p>
              <button
                onClick={handleSearch}
                className="mt-4 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && jobs.length === 0 && (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <Briefcase className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">No Jobs Found</h3>
              <p className="mt-2 max-w-md text-sm text-slate-500">
                We couldn't find any jobs matching your criteria. Try adjusting your
                search or filters.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 rounded-lg border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}

          {/* Job Cards */}
          {!loading && !error && jobs.length > 0 && (
            <div className="space-y-4">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isSaved={savedJobIds.has(job.id)}
                  isSaving={savingJobId === job.id}
                  onToggleSave={() => toggleSave(job.id)}
                  onViewDetail={() => openDetail(job)}
                  onQuickApply={() => openApply(job)}
                />
              ))}
            </div>
          )}

          {/* Load More */}
          {!loading && !error && pagination && currentPage.current < pagination.totalPages && (
            <div className="flex justify-center pt-4">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Load More
                    <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Page Info */}
          {!loading && !error && pagination && pagination.totalPages > 1 && (
            <p className="text-center text-xs text-slate-400">
              Page {pagination.page} of {pagination.totalPages}
            </p>
          )}
        </div>
      </div>

      {/* ── Job Detail Modal ── */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          loading={detailLoading}
          isSaved={savedJobIds.has(selectedJob.id)}
          onClose={() => setSelectedJob(null)}
          onToggleSave={() => toggleSave(selectedJob.id)}
          onQuickApply={() => {
            setApplyJob(selectedJob);
            setCoverLetter("");
            setApplyNotes("");
            setApplySuccess(false);
            setApplyError(null);
            setAlreadyApplied(false);
          }}
        />
      )}

      {/* ── Quick Apply Modal ── */}
      {applyJob && (
        <QuickApplyModal
          job={applyJob}
          coverLetter={coverLetter}
          setCoverLetter={setCoverLetter}
          notes={applyNotes}
          setNotes={setApplyNotes}
          submitting={applySubmitting}
          success={applySuccess}
          error={applyError}
          alreadyApplied={alreadyApplied}
          onClose={() => setApplyJob(null)}
          onSubmit={submitApplication}
        />
      )}
    </div>
  );
}

// ── Job Card Component ────────────────────────────────────

function JobCard({
  job,
  isSaved,
  isSaving,
  onToggleSave,
  onViewDetail,
  onQuickApply,
}: {
  job: Job;
  isSaved: boolean;
  isSaving: boolean;
  onToggleSave: () => void;
  onViewDetail: () => void;
  onQuickApply: () => void;
}) {
  const companyName = job.companyName || job.company?.name || "Unknown Company";
  const initials = companyName.slice(0, 3).toUpperCase();
  const logoColor = getLogoColor(companyName);
  const salary = formatSalary(job);
  const workModeLabel = WORK_MODE_LABELS[job.workMode] || job.workMode;
  const jobTypeLabel = JOB_TYPE_LABELS[job.jobType] || job.jobType;

  return (
    <div
      className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-200 hover:shadow-md"
      onClick={onViewDetail}
    >
      <div className="flex gap-4">
        {/* Company Logo Placeholder */}
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white ${logoColor}`}
        >
          {job.company?.logo ? (
            <img
              src={job.company.logo}
              alt={companyName}
              className="h-12 w-12 rounded-xl object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            initials
          )}
        </div>

        <div className="min-w-0 flex-1">
          {/* Title & Company */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-[15px] font-semibold text-slate-900 group-hover:text-blue-600">
                {job.title}
              </h3>
              <p className="mt-0.5 text-sm text-slate-500">{companyName}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave();
              }}
              disabled={isSaving}
              className="shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-600 disabled:opacity-50"
              title={isSaved ? "Unsave job" : "Save job"}
            >
              <Bookmark
                className={`h-4 w-4 ${isSaved ? "fill-blue-500 text-blue-500" : ""}`}
              />
            </button>
          </div>

          {/* Location · Work Mode · Job Type */}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {job.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              {workModeLabel}
            </span>
            <span>{jobTypeLabel}</span>
            {job.experienceLevel && (
              <span>
                {EXPERIENCE_DISPLAY[job.experienceLevel] || job.experienceLevel}
              </span>
            )}
          </div>

          {/* Salary */}
          {salary && (
            <div className="mt-2 flex items-center gap-1 text-sm font-medium text-emerald-600">
              {job.salaryCurrency === "INR" || job.salaryCurrency === "₹" ? (
                <IndianRupee className="h-3.5 w-3.5" />
              ) : (
                <DollarSign className="h-3.5 w-3.5" />
              )}
              {salary}
            </div>
          )}

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {job.skills.slice(0, 5).map((skill) => (
                <span
                  key={skill}
                  className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                >
                  {skill}
                </span>
              ))}
              {job.skills.length > 5 && (
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-400">
                  +{job.skills.length - 5} more
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Clock className="h-3 w-3" />
              {timeAgo(job.postedAt)}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickApply();
              }}
              className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700"
            >
              Quick Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Job Detail Modal ──────────────────────────────────────

function JobDetailModal({
  job,
  loading,
  isSaved,
  onClose,
  onToggleSave,
  onQuickApply,
}: {
  job: Job;
  loading: boolean;
  isSaved: boolean;
  onClose: () => void;
  onToggleSave: () => void;
  onQuickApply: () => void;
}) {
  const companyName = job.companyName || job.company?.name || "Unknown Company";
  const initials = companyName.slice(0, 3).toUpperCase();
  const logoColor = getLogoColor(companyName);
  const salary = formatSalary(job);
  const workModeLabel = WORK_MODE_LABELS[job.workMode] || job.workMode;
  const jobTypeLabel = JOB_TYPE_LABELS[job.jobType] || job.jobType;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Job Details</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="p-6">
            {/* Company Header */}
            <div className="flex items-start gap-4">
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white ${logoColor}`}
              >
                {job.company?.logo ? (
                  <img
                    src={job.company.logo}
                    alt={companyName}
                    className="h-14 w-14 rounded-xl object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold text-slate-900">{job.title}</h1>
                <p className="mt-0.5 text-sm font-medium text-slate-500">
                  {companyName}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                  {job.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {job.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" />
                    {workModeLabel}
                  </span>
                  <span>{jobTypeLabel}</span>
                </div>
              </div>
            </div>

            {/* Salary & Experience */}
            <div className="mt-5 flex flex-wrap gap-3">
              {salary && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                  {job.salaryCurrency === "INR" || job.salaryCurrency === "₹" ? (
                    <IndianRupee className="h-4 w-4" />
                  ) : (
                    <DollarSign className="h-4 w-4" />
                  )}
                  {salary}
                </div>
              )}
              {job.experienceLevel && (
                <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
                  <Briefcase className="h-4 w-4" />
                  {EXPERIENCE_DISPLAY[job.experienceLevel] || job.experienceLevel}
                </div>
              )}
              <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                <Clock className="h-4 w-4" />
                Posted {timeAgo(job.postedAt)}
              </div>
            </div>

            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <div className="mt-5">
                <h3 className="mb-2 text-sm font-semibold text-slate-700">Skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {job.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mt-5">
              <h3 className="mb-2 text-sm font-semibold text-slate-700">
                Job Description
              </h3>
              <div className="prose prose-sm max-w-none text-slate-600">
                {job.description.split("\n").map((paragraph, i) => (
                  <p key={i} className="mb-2 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Company Info */}
            {job.company && (
              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Building2 className="h-4 w-4" />
                  About {companyName}
                </h3>
                {job.company.description && (
                  <p className="text-sm leading-relaxed text-slate-600">
                    {job.company.description}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                  {job.company.industry && <span>Industry: {job.company.industry}</span>}
                  {job.company.companySize && <span>Size: {job.company.companySize}</span>}
                  {job.company.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {job.company.location}
                    </span>
                  )}
                  {job.company.website && (
                    <a
                      href={job.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3 w-3" />
                      Website
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
              <button
                onClick={onQuickApply}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                <Send className="h-4 w-4" />
                Quick Apply
              </button>
              <button
                onClick={onToggleSave}
                className={`flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors ${
                  isSaved
                    ? "border-blue-200 bg-blue-50 text-blue-600"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Bookmark
                  className={`h-4 w-4 ${isSaved ? "fill-blue-500" : ""}`}
                />
                {isSaved ? "Saved" : "Save"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Quick Apply Modal ─────────────────────────────────────

function QuickApplyModal({
  job,
  coverLetter,
  setCoverLetter,
  notes,
  setNotes,
  submitting,
  success,
  error,
  alreadyApplied,
  onClose,
  onSubmit,
}: {
  job: Job;
  coverLetter: string;
  setCoverLetter: (v: string) => void;
  notes: string;
  setNotes: (v: string) => void;
  submitting: boolean;
  success: boolean;
  error: string | null;
  alreadyApplied: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const companyName = job.companyName || job.company?.name || "Unknown Company";
  const initials = companyName.slice(0, 3).toUpperCase();
  const logoColor = getLogoColor(companyName);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Quick Apply</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Job Info */}
          <div className="mb-5 flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white ${logoColor}`}
            >
              {initials}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">{job.title}</h3>
              <p className="text-xs text-slate-500">{companyName}</p>
            </div>
          </div>

          {/* Already Applied */}
          {alreadyApplied && (
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-amber-500" />
              <div>
                <p className="text-sm font-medium text-amber-800">Already Applied</p>
                <p className="text-xs text-amber-600">
                  You have already applied to this position.
                </p>
              </div>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
              <div>
                <p className="text-sm font-medium text-emerald-800">
                  Application Submitted!
                </p>
                <p className="text-xs text-emerald-600">
                  Your application has been sent successfully.
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <XCircle className="h-5 w-5 shrink-0 text-red-500" />
              <div>
                <p className="text-sm font-medium text-red-800">Application Failed</p>
                <p className="text-xs text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          {!success && !alreadyApplied && (
            <>
              {/* Resume */}
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Resume
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <FileText className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-500">
                    Using your profile resume
                  </span>
                </div>
              </div>

              {/* Cover Letter */}
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Cover Letter{" "}
                  <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Write a brief cover letter..."
                  rows={4}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Notes */}
              <div className="mb-5">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Additional Notes{" "}
                  <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional information..."
                  rows={2}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            {!success && !alreadyApplied && (
              <button
                onClick={onSubmit}
                disabled={submitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Application
                  </>
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              {success || alreadyApplied ? "Close" : "Cancel"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
