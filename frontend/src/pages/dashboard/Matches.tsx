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
  Target,
  BarChart3,
  Send,
  X,
} from "lucide-react";
import {
  matchApi,
  jobApi,
  BackendMatchResult,
  BackendJob,
} from "../../services/jobApi";
import { profileApi } from "../../services/profileApi";

// ── Profile shape (for strength indicator) ──
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
  resumeUrl?: string;
}

// ── Enriched match (backend match + job data merged) ──
interface EnrichedMatch {
  jobId: number;
  matchScore: number;
  breakdown: BackendMatchResult["breakdown"];
  matchingSkills: string[];
  missingSkills: string[];
  reasons: string[];
  job: BackendJob;
}

// ── Display-ready match for MatchCard ──
interface DisplayMatch {
  job: {
    id: number;
    title: string;
    company: string;
    location: string;
    workMode: string;
    jobType: string;
    salaryMin: number;
    salaryMax: number;
    salaryCurrency: string;
    skills: string[];
    description: string;
    responsibilities: string[];
    postedAt: string;
    isFeatured: boolean;
    externalApplyUrl?: string;
  };
  match: {
    skills: number;
    experience: number;
    education: number;
    projects: number;
    certifications: number;
    location: number;
    overall: number;
  };
  matchingSkills: string[];
  missingSkills: string[];
  whyThisJob: string[];
  missingGaps: string[];
}

// ── Helpers ──

function formatWorkMode(mode: string): string {
  switch (mode) {
    case "ONSITE":
      return "On-site";
    case "HYBRID":
      return "Hybrid";
    case "REMOTE":
      return "Remote";
    default:
      return mode;
  }
}

function formatJobType(type: string): string {
  switch (type) {
    case "FULL_TIME":
      return "Full Time";
    case "PART_TIME":
      return "Part Time";
    case "CONTRACT":
      return "Contract";
    case "INTERNSHIP":
      return "Internship";
    default:
      return type;
  }
}

function formatTimeAgo(dateStr: string): string {
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
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function transformToDisplayMatch(
  enriched: EnrichedMatch,
): DisplayMatch {
  const { job, matchScore, breakdown, matchingSkills, missingSkills, reasons } =
    enriched;

  const companyName =
    job.companyName || job.company?.name || "Unknown Company";

  return {
    job: {
      id: job.id,
      title: job.title,
      company: companyName,
      location: job.location || job.city || "Remote",
      workMode: formatWorkMode(job.workMode),
      jobType: formatJobType(job.jobType),
      salaryMin: job.salaryMin ?? 0,
      salaryMax: job.salaryMax ?? 0,
      salaryCurrency: job.salaryCurrency || "INR",
      skills: job.skills || [],
      description: job.description || "",
      responsibilities: [],
      postedAt: formatTimeAgo(job.postedAt),
      isFeatured: false,
      externalApplyUrl: job.externalApplyUrl,
    },
    match: {
      skills: breakdown.skills,
      experience: breakdown.experience,
      education: breakdown.education,
      projects: 0,
      certifications: 0,
      location: breakdown.location,
      overall: matchScore,
    },
    matchingSkills,
    missingSkills,
    whyThisJob: reasons.length > 0
      ? reasons
      : ["Overall profile compatibility meets the threshold"],
    missingGaps:
      missingSkills.length > 0
        ? missingSkills
        : experienceBelowThreshold(breakdown.experience)
          ? ["Additional experience may strengthen your application"]
          : [],
  };
}

function experienceBelowThreshold(score: number): boolean {
  return score < 60;
}

// ── Constants ──

const SCORE_TABS = [
  { id: "all", label: "All Matches" },
  { id: "95-99", label: "95-99%" },
  { id: "90-94", label: "90-94%" },
  { id: "80-89", label: "80-89%" },
  { id: "70-79", label: "70-79%" },
];

const CATEGORY_FILTERS = [
  { id: "skills", label: "Skills", icon: Target },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "location", label: "Location", icon: MapPin },
];

const SORT_OPTIONS = [
  { id: "match", label: "Best Match" },
  { id: "recent", label: "Most Recent" },
  { id: "salary-high", label: "Salary: High to Low" },
  { id: "salary-low", label: "Salary: Low to High" },
];

// ── Main Component ──

export default function Matches() {
  const [loading, setLoading] = useState(true);
  const [enrichedMatches, setEnrichedMatches] = useState<EnrichedMatch[]>([]);
  const [hasProfile, setHasProfile] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [activeScoreTab, setActiveScoreTab] = useState("all");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("match");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedJobs, setSavedJobs] = useState<Set<number>>(new Set());
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  // Quick Apply state
  const [quickApplyJob, setQuickApplyJob] = useState<DisplayMatch["job"] | null>(null);
  const [quickApplyNotes, setQuickApplyNotes] = useState("");
  const [quickApplySubmitting, setQuickApplySubmitting] = useState(false);

  // ── Data fetching ──
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Fetch profile for strength indicator and empty-state check
      let profileData: ProfileData | null = null;
      try {
        const profileRes = await profileApi.get();
        if (profileRes.success && profileRes.data) {
          profileData = profileRes.data as ProfileData;
          setProfile(profileData);
        } else {
          setHasProfile(false);
        }
      } catch {
        setHasProfile(false);
      }

      // Fetch matches from backend
      try {
        const matchRes = await matchApi.getMatches();
        if (
          !matchRes.success ||
          !matchRes.data?.matches ||
          matchRes.data.matches.length === 0
        ) {
          setEnrichedMatches([]);
          setLoading(false);
          return;
        }

        const backendMatches = matchRes.data.matches;

        // Fetch job details for each matched job in parallel
        const results = await Promise.allSettled(
          backendMatches.map(async (m) => {
            const jobRes = await jobApi.getById(m.jobId);
            if (jobRes.success && jobRes.data) {
              return { ...m, job: jobRes.data } as EnrichedMatch;
            }
            return null;
          }),
        );

        const enriched = results
          .filter(
            (r): r is PromiseFulfilledResult<EnrichedMatch> =>
              r.status === "fulfilled" && r.value !== null,
          )
          .map((r) => r.value);

        setEnrichedMatches(enriched);
      } catch {
        setEnrichedMatches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ── Filter and sort ──
  const displayMatches = useMemo(() => {
    let results = enrichedMatches.map(transformToDisplayMatch);

    // Score range filter
    if (activeScoreTab !== "all") {
      const [min, max] = activeScoreTab.split("-").map(Number);
      results = results.filter(
        (r) => r.match.overall >= min && r.match.overall <= max,
      );
    }

    // Category filter
    if (activeCategory) {
      results = results.filter((r) => {
        const score =
          r.match[activeCategory as keyof typeof r.match] ?? 0;
        return score >= 60;
      });
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
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
        break;
      case "salary-high":
        results.sort((a, b) => b.job.salaryMax - a.job.salaryMax);
        break;
      case "salary-low":
        results.sort((a, b) => a.job.salaryMin - b.job.salaryMin);
        break;
      default:
        results.sort((a, b) => b.match.overall - a.match.overall);
    }

    return results;
  }, [enrichedMatches, activeScoreTab, activeCategory, sortBy, searchQuery]);

  // ── Quick Apply ──
  const handleQuickApply = async () => {
    if (!quickApplyJob) return;
    setQuickApplySubmitting(true);
    try {
      await jobApi.apply(quickApplyJob.id, {
        resumeUrl: profile?.resumeUrl || undefined,
        notes: quickApplyNotes || undefined,
      });
      setQuickApplyJob(null);
      setQuickApplyNotes("");
    } catch {
      // silent
    } finally {
      setQuickApplySubmitting(false);
    }
  };

  // ── Profile strength ──
  const profileCompletionPct = (() => {
    if (!profile) return 0;
    let filled = 0;
    let total = 8;
    if (profile.skills?.length) filled++;
    if (profile.education?.length) filled++;
    if (profile.experience?.length) filled++;
    if (profile.projects?.length) filled++;
    if (profile.certifications?.length) filled++;
    if (profile.targetJobTitles?.length) filled++;
    if (profile.professionalHeadline) filled++;
    if (profile.location) filled++;
    return Math.round((filled / total) * 100);
  })();

  // ── Toggle helpers ──
  const toggleSave = (jobId: number) => {
    setSavedJobs((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) {
        next.delete(jobId);
        jobApi.unsave(jobId);
      } else {
        next.add(jobId);
        jobApi.save(jobId);
      }
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

  // ── Loading state ──
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

  // ── No profile state ──
  if (!hasProfile) {
    return (
      <div className="space-y-6 pb-10">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
          <div className="pointer-events-none absolute -top-12 -left-12 h-64 w-64 rounded-full bg-blue-100/50 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-purple-100/50 blur-3xl" />
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              AI Job Matches
            </h1>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
            <Sparkles className="h-8 w-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            Complete your profile to get matches
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Complete your ATS profile to receive personalized job matches.
          </p>
          <a
            href="/profile"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm shadow-blue-500/20 transition-all hover:bg-blue-700 hover:shadow-md"
          >
            Go to Profile
          </a>
        </div>
      </div>
    );
  }

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
              Jobs that match your ATS profile scored 70% or higher.
            </p>
          </div>

          <div className="flex items-center gap-3">
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
                  {enrichedMatches.length}
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
          {displayMatches.length}
        </span>{" "}
        matching {displayMatches.length === 1 ? "job" : "jobs"}
      </p>

      {/* ── Match Cards ── */}
      {displayMatches.length === 0 && enrichedMatches.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <Search className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            No strong matches found yet
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Try updating your skills, expanding preferred locations, or{" "}
            <a href="/explore-jobs" className="text-blue-600 hover:underline">
              exploring all jobs
            </a>
            .
          </p>
        </div>
      ) : displayMatches.length === 0 ? (
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
          {displayMatches.map((result) => (
            <MatchCard
              key={result.job.id}
              result={result}
              isSaved={savedJobs.has(result.job.id)}
              isExpanded={expandedCards.has(result.job.id)}
              onToggleSave={() => toggleSave(result.job.id)}
              onToggleExpand={() => toggleExpand(result.job.id)}
              onQuickApply={() => setQuickApplyJob(result.job)}
            />
          ))}
        </div>
      )}

      {/* ── Quick Apply Modal ── */}
      {quickApplyJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Quick Apply
                </h3>
                <p className="text-sm text-slate-500">
                  {quickApplyJob.title} at {quickApplyJob.company}
                </p>
              </div>
              <button
                onClick={() => {
                  setQuickApplyJob(null);
                  setQuickApplyNotes("");
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-medium text-slate-400">
                  Resume
                </p>
                <p className="mt-0.5 text-sm text-slate-700">
                  {profile?.resumeUrl
                    ? "Your uploaded resume will be attached"
                    : "No resume uploaded"}
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Cover Letter (optional)
                </label>
                <textarea
                  rows={4}
                  value={quickApplyNotes}
                  onChange={(e) => setQuickApplyNotes(e.target.value)}
                  placeholder="Write a brief cover letter or note for this application..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setQuickApplyJob(null);
                  setQuickApplyNotes("");
                }}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleQuickApply}
                disabled={quickApplySubmitting}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-blue-500/20 transition-all hover:bg-blue-700 hover:shadow-md disabled:opacity-50"
              >
                {quickApplySubmitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {quickApplySubmitting ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </div>
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
  onQuickApply,
}: {
  result: DisplayMatch;
  isSaved: boolean;
  isExpanded: boolean;
  onToggleSave: () => void;
  onToggleExpand: () => void;
  onQuickApply: () => void;
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
              {job.salaryMin > 0 && job.salaryMax > 0 && (
                <span className="flex items-center gap-1.5">
                  <IndianRupee className="h-3.5 w-3.5" />₹
                  {(job.salaryMin / 100000).toFixed(0)}–
                  {(job.salaryMax / 100000).toFixed(0)} LPA
                </span>
              )}
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
              {job.externalApplyUrl ? (
                <a
                  href={job.externalApplyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-blue-500/20 transition-all hover:bg-blue-700 hover:shadow-md"
                >
                  <ExternalLink className="h-4 w-4" />
                  Apply Now
                </a>
              ) : (
                <button
                  onClick={onQuickApply}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-blue-500/20 transition-all hover:bg-blue-700 hover:shadow-md"
                >
                  <ExternalLink className="h-4 w-4" />
                  Quick Apply
                </button>
              )}
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
                Why This Matches
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

            {/* Potential Gaps */}
            {missingGaps.length > 0 && (
              <div className="rounded-xl border border-amber-200/60 bg-amber-50/40 p-4">
                <h4 className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-amber-800">
                  <AlertCircle className="h-4 w-4" />
                  Potential Gaps
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
