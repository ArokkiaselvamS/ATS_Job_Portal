import { useState, useEffect, useMemo } from "react";
import {
  Sparkles,
  MapPin,
  Building2,
  Clock,
  Briefcase,
  IndianRupee,
  Bookmark,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Filter,
  Search,
  SlidersHorizontal,
  TrendingUp,
  GraduationCap,
  FolderOpen,
  Award,
  Target,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import { profileApi } from "../../services/profileApi";
import {
  calculateAllMatches,
  JobMatchResult,
  MatchJob,
} from "../../services/matchService";

// ── Types ──
interface ProfileData {
  targetJobTitles?: string[];
  professionalHeadline?: string;
  professionalSummary?: string;
  preferredIndustry?: string;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  preferredLocations?: string[];
  willingToRelocate?: boolean;
  workModePreference?: string[];
  candidateType?: string;
  careerLevel?: string;
  skills: { skillName: string; category?: string; skillLevel?: string }[];
  education: {
    id?: number;
    degree?: string;
    fieldOfStudy?: string;
    collegeUniversity?: string;
    cgpaPercentage?: number;
  }[];
  experience: {
    id?: number;
    jobTitle?: string;
    company?: string;
    technologies?: string[];
    responsibilities?: string;
    location?: string;
  }[];
  projects: {
    id?: number;
    projectName?: string;
    description?: string;
    technologies?: string[];
  }[];
  certifications: {
    id?: number;
    certificationName?: string;
    issuingOrganization?: string;
  }[];
}

const SCORE_TABS = [
  { id: "all", label: "All Matches" },
  { id: "95-99", label: "95-99%" },
  { id: "90-94", label: "90-94%" },
  { id: "80-89", label: "80-89%" },
  { id: "75-79", label: "75-79%" },
];

const CATEGORY_FILTERS = [
  { id: "skills", label: "Skills", icon: Target },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "projects", label: "Projects", icon: FolderOpen },
  { id: "location", label: "Location", icon: MapPin },
  { id: "certifications", label: "Certifications", icon: Award },
];

const SORT_OPTIONS = [
  { id: "match", label: "Best Match" },
  { id: "recent", label: "Most Recent" },
  { id: "salary-high", label: "Salary: High to Low" },
  { id: "salary-low", label: "Salary: Low to High" },
];

export default function Matches() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<JobMatchResult[]>([]);
  const [activeScoreTab, setActiveScoreTab] = useState("all");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("match");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedJobs, setSavedJobs] = useState<Set<number>>(new Set());
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  // Fetch profile and calculate matches
  useEffect(() => {
    const fetchAndMatch = async () => {
      try {
        setLoading(true);
        const res = await profileApi.get();
        if (res.success && res.data) {
          const p = res.data as ProfileData;
          setProfile(p);
          const results = calculateAllMatches(p);
          setMatches(results);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchAndMatch();
  }, []);

  // Filter and sort matches
  const filteredMatches = useMemo(() => {
    let result = [...matches];

    // Score range filter
    if (activeScoreTab !== "all") {
      const [min, max] = activeScoreTab.split("-").map(Number);
      result = result.filter(
        (r) => r.match.overall >= min && r.match.overall <= max,
      );
    }

    // Category highlight filter (sort by specific dimension)
    if (activeCategory) {
      result = result.filter((r) => {
        const score =
          r.match[activeCategory as keyof typeof r.match] ?? 0;
        return score >= 60;
      });
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.job.title.toLowerCase().includes(q) ||
          r.job.company.toLowerCase().includes(q) ||
          r.job.location.toLowerCase().includes(q) ||
          r.job.skills.some((s) => s.toLowerCase().includes(q)),
      );
    }

    // Sort
    switch (sortBy) {
      case "recent":
        // Keep original order (already sorted by match %)
        break;
      case "salary-high":
        result.sort((a, b) => b.job.salaryMax - a.job.salaryMax);
        break;
      case "salary-low":
        result.sort((a, b) => a.job.salaryMin - b.job.salaryMin);
        break;
      default:
        result.sort((a, b) => b.match.overall - a.match.overall);
    }

    return result;
  }, [matches, activeScoreTab, activeCategory, sortBy, searchQuery]);

  const toggleSave = (jobId: number) => {
    setSavedJobs((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId);
      else next.add(jobId);
      return next;
    });
  };

  const toggleExpand = (jobId: number) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId);
      else next.add(jobId);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-slate-200 border-t-blue-600" />
          <p className="text-sm text-slate-500">
            Analyzing your profile against available jobs...
          </p>
        </div>
      </div>
    );
  }

  const profileCompletionPct = (() => {
    let filled = 0;
    let total = 8;
    if (profile?.skills?.length) filled++;
    if (profile?.education?.length) filled++;
    if (profile?.experience?.length) filled++;
    if (profile?.projects?.length) filled++;
    if (profile?.certifications?.length) filled++;
    if (profile?.targetJobTitles?.length) filled++;
    if (profile?.professionalHeadline) filled++;
    if (profile?.location) filled++;
    return Math.round((filled / total) * 100);
  })();

  return (
    <div className="space-y-6 pb-10">
      {/* ── Header ── */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
        <div className="pointer-events-none absolute -top-12 -left-12 h-64 w-64 rounded-full bg-blue-100/50 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-purple-100/50 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                AI Job Matches
              </h1>
            </div>
            <p className="text-[15px] text-slate-500">
              Jobs that match your ATS profile scored 75% or higher.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Profile completeness indicator */}
            <div className="hidden items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-2.5 sm:flex">
              <BarChart3 className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-[11px] font-medium text-slate-400">
                  Profile Strength
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {profileCompletionPct}%
                </p>
              </div>
            </div>
            <div className="hidden items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-2.5 sm:flex">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <div>
                <p className="text-[11px] font-medium text-slate-400">
                  Matches Found
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {matches.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Search & Sort Bar ── */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, company, skill, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Score Range Tabs ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {SCORE_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveScoreTab(tab.id)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeScoreTab === tab.id
                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Category Filters ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter className="h-4 w-4 shrink-0 text-slate-400" />
        <button
          onClick={() => setActiveCategory(null)}
          className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
            activeCategory === null
              ? "bg-slate-900 text-white"
              : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          All
        </button>
        {CATEGORY_FILTERS.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() =>
                setActiveCategory(activeCategory === cat.id ? null : cat.id)
              }
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                activeCategory === cat.id
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon className="h-3 w-3" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* ── Results Count ── */}
      <p className="text-sm text-slate-500">
        Showing{" "}
        <span className="font-medium text-slate-700">
          {filteredMatches.length}
        </span>{" "}
        matching {filteredMatches.length === 1 ? "job" : "jobs"}
      </p>

      {/* ── Match Cards ── */}
      {filteredMatches.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <Search className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            No matches found
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Try adjusting your filters or search query. Complete your{" "}
            <a href="/profile" className="text-blue-600 hover:underline">
              ATS Profile
            </a>{" "}
            to get better matches.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMatches.map((result) => (
            <MatchCard
              key={result.job.id}
              result={result}
              isSaved={savedJobs.has(result.job.id)}
              isExpanded={expandedCards.has(result.job.id)}
              onToggleSave={() => toggleSave(result.job.id)}
              onToggleExpand={() => toggleExpand(result.job.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Match Card Component ──

function MatchCard({
  result,
  isSaved,
  isExpanded,
  onToggleSave,
  onToggleExpand,
}: {
  result: JobMatchResult;
  isSaved: boolean;
  isExpanded: boolean;
  onToggleSave: () => void;
  onToggleExpand: () => void;
}) {
  const { job, match, matchingSkills, missingSkills, whyThisJob, missingGaps } =
    result;

  const overallColor =
    match.overall >= 95
      ? "text-emerald-600"
      : match.overall >= 90
        ? "text-blue-600"
        : match.overall >= 80
          ? "text-indigo-600"
          : "text-amber-600";

  const overallBg =
    match.overall >= 95
      ? "from-emerald-500 to-emerald-600"
      : match.overall >= 90
        ? "from-blue-500 to-blue-600"
        : match.overall >= 80
          ? "from-indigo-500 to-indigo-600"
          : "from-amber-500 to-amber-600";

  const overallRing =
    match.overall >= 95
      ? "stroke-emerald-500"
      : match.overall >= 90
        ? "stroke-blue-500"
        : match.overall >= 80
          ? "stroke-indigo-500"
          : "stroke-amber-500";

  return (
    <div className="group rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_25px_rgba(0,0,0,0.03)] transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
      <div className="p-5 md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
          {/* ── Left: Job Info ── */}
          <div className="flex-1 space-y-4">
            {/* Title row */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {job.title}
                  </h3>
                  {job.isFeatured && (
                    <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600 ring-1 ring-amber-200">
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-slate-500">
                  {job.company}
                </p>
              </div>

              {/* Overall Match Score - SVG circle */}
              <div className="relative flex shrink-0 flex-col items-center">
                <div className="relative flex h-[72px] w-[72px] items-center justify-center">
                  <svg
                    className="h-[72px] w-[72px] -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="6"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      className={overallRing}
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${match.overall * 2.64} 264`}
                    />
                  </svg>
                  <span
                    className={`absolute text-lg font-bold ${overallColor}`}
                  >
                    {match.overall}%
                  </span>
                </div>
                <span className="mt-1 text-[11px] font-medium text-slate-400">
                  Match
                </span>
              </div>
            </div>

            {/* Job details */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                {job.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {job.workMode}
              </span>
              <span className="flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5" />
                {job.jobType}
              </span>
              <span className="flex items-center gap-1.5">
                <IndianRupee className="h-3.5 w-3.5" />₹
                {(job.salaryMin / 100000).toFixed(0)}–
                {(job.salaryMax / 100000).toFixed(0)} LPA
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                Posted {job.postedAt}
              </span>
            </div>

            {/* Skills tags */}
            <div className="flex flex-wrap gap-1.5">
              {matchingSkills.slice(0, 6).map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200/60"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  {s}
                </span>
              ))}
              {missingSkills.slice(0, 3).map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200/60"
                >
                  <AlertCircle className="h-3 w-3" />
                  {s}
                </span>
              ))}
              {missingSkills.length > 3 && (
                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-500">
                  +{missingSkills.length - 3} more
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-blue-500/20 transition-all hover:bg-blue-700 hover:shadow-md">
                <ExternalLink className="h-4 w-4" />
                Apply Now
              </button>
              <button
                onClick={onToggleSave}
                className={`flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                  isSaved
                    ? "border-blue-200 bg-blue-50 text-blue-600"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <Bookmark
                  className={`h-4 w-4 ${isSaved ? "fill-blue-500" : ""}`}
                />
                {isSaved ? "Saved" : "Save"}
              </button>
              <button
                onClick={onToggleExpand}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
              >
                {isExpanded ? "Hide Details" : "View Details"}
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* ── Right: Match Breakdown ── */}
          <div className="w-full shrink-0 space-y-3 lg:w-[260px]">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Match Breakdown
            </h4>
            <div className="space-y-2.5">
              <BreakdownRow label="Skills" score={match.skills} />
              <BreakdownRow label="Experience" score={match.experience} />
              <BreakdownRow label="Education" score={match.education} />
              <BreakdownRow label="Projects" score={match.projects} />
              <BreakdownRow
                label="Certifications"
                score={match.certifications}
              />
              <BreakdownRow label="Location" score={match.location} />
            </div>
          </div>
        </div>

        {/* ── Expanded Details ── */}
        {isExpanded && (
          <div className="mt-5 space-y-4 border-t border-slate-100 pt-5">
            {/* Why This Job Matches */}
            <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/40 p-4">
              <h4 className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-emerald-800">
                <CheckCircle2 className="h-4 w-4" />
                Why This Job Matches
              </h4>
              <ul className="space-y-1.5">
                {whyThisJob.map((reason, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-emerald-700"
                  >
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    {reason}
                  </li>
                ))}
              </ul>
            </div>

            {/* Missing / Gap Skills */}
            {missingGaps.length > 0 && (
              <div className="rounded-xl border border-amber-200/60 bg-amber-50/40 p-4">
                <h4 className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-amber-800">
                  <AlertCircle className="h-4 w-4" />
                  Missing / Gap Skills
                </h4>
                <ul className="space-y-1.5">
                  {missingGaps.map((gap, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-amber-700"
                    >
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                      {gap}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Job Description */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <h4 className="mb-2 text-sm font-semibold text-slate-800">
                About This Role
              </h4>
              <p className="text-sm leading-relaxed text-slate-600">
                {job.description}
              </p>
              {job.responsibilities.length > 0 && (
                <div className="mt-3">
                  <h5 className="mb-1.5 text-xs font-semibold text-slate-500">
                    Key Responsibilities
                  </h5>
                  <ul className="space-y-1">
                    {job.responsibilities.map((r, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-slate-600"
                      >
                        <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Breakdown Row ──

function BreakdownRow({ label, score }: { label: string; score: number }) {
  const barColor =
    score >= 90
      ? "from-emerald-500 to-emerald-600"
      : score >= 75
        ? "from-blue-500 to-blue-600"
        : score >= 60
          ? "from-indigo-500 to-indigo-600"
          : "from-amber-400 to-amber-500";

  const textColor =
    score >= 90
      ? "text-emerald-600"
      : score >= 75
        ? "text-blue-600"
        : score >= 60
          ? "text-indigo-600"
          : "text-amber-600";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-600">{label}</span>
        <span className={`text-xs font-bold ${textColor}`}>{score}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100">
        <div
          className={`h-1.5 rounded-full bg-gradient-to-r ${barColor} transition-all`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
