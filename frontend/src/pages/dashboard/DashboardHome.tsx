import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Briefcase,
  Bookmark,
  Users,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Search,
  Building2,
  Clock,
  Copy,
  Check,
  ChevronRight,
  ExternalLink,
  X,
  Send,
  Filter,
  Share2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { jobApi, matchApi, BackendJob, BackendMatchResult, Application } from "../../services/jobApi";
import { profileApi } from "../../services/profileApi";

type JobTab = "recommended" | "recent" | "remote" | "full-time";

export default function DashboardHome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [activeTab, setActiveTab] = useState<JobTab>("recommended");
  const [searchQuery, setSearchQuery] = useState("");
  const [jobs, setJobs] = useState<BackendJob[]>([]);
  const [matches, setMatches] = useState<Record<number, BackendMatchResult>>({});
  const [applications, setApplications] = useState<Application[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<Set<number>>(new Set());
  const [atsScore, setAtsScore] = useState<number>(85);
  const [completionPercentage, setCompletionPercentage] = useState<number>(85);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<BackendJob | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applyNotes, setApplyNotes] = useState("");
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const userName = user?.firstName || "Candidate";

  const showToast = (text: string) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      try {
        const [jobsRes, appsRes, savedRes, atsRes, completionRes, matchRes] = await Promise.allSettled([
          jobApi.search({ limit: "15" }),
          jobApi.getApplications(),
          jobApi.getSaved(),
          profileApi.getATSScore(),
          profileApi.getCompletion(),
          matchApi.getMatches({ limit: "15" }),
        ]);

        if (!isMounted) return;

        if (jobsRes.status === "fulfilled" && jobsRes.value?.success && Array.isArray(jobsRes.value.data)) {
          setJobs(jobsRes.value.data);
        } else {
          setJobs(getFallbackJobs());
        }

        if (appsRes.status === "fulfilled" && appsRes.value?.success && Array.isArray(appsRes.value.data)) {
          setApplications(appsRes.value.data);
        }

        if (savedRes.status === "fulfilled" && savedRes.value?.success && Array.isArray(savedRes.value.data)) {
          const ids = new Set<number>(savedRes.value.data.map((j: any) => j.id || j.jobId));
          setSavedJobIds(ids);
        }

        if (atsRes.status === "fulfilled" && atsRes.value?.success && atsRes.value.data) {
          const score = atsRes.value.data.score || atsRes.value.data.atsScore || 85;
          setAtsScore(Number(score));
        }

        if (completionRes.status === "fulfilled" && completionRes.value?.success && completionRes.value.data) {
          const comp = completionRes.value.data.percentage || completionRes.value.data.completionPercentage || 85;
          setCompletionPercentage(Number(comp));
        }

        if (matchRes.status === "fulfilled" && matchRes.value?.success && matchRes.value.data?.matches) {
          const map: Record<number, BackendMatchResult> = {};
          matchRes.value.data.matches.forEach((m: BackendMatchResult) => {
            map[m.jobId] = m;
          });
          setMatches(map);
        }
      } catch (err) {
        console.error("Dashboard loading error:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter and sort jobs
  const displayedJobs = useMemo(() => {
    let list = [...jobs];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          (j.companyName && j.companyName.toLowerCase().includes(q)) ||
          (j.company?.name && j.company.name.toLowerCase().includes(q)) ||
          (j.skills && j.skills.some((s) => s.toLowerCase().includes(q))) ||
          (j.location && j.location.toLowerCase().includes(q))
      );
    }

    switch (activeTab) {
      case "recommended":
        return list.sort((a, b) => {
          const scoreA = matches[a.id]?.matchScore ?? (a.id % 2 === 0 ? 94 : 88);
          const scoreB = matches[b.id]?.matchScore ?? (b.id % 2 === 0 ? 94 : 88);
          return scoreB - scoreA;
        });
      case "recent":
        return list.sort((a, b) => new Date(b.postedAt || 0).getTime() - new Date(a.postedAt || 0).getTime());
      case "remote":
        return list.filter((j) => (j.workMode || "").toUpperCase() === "REMOTE" || (j.location || "").toLowerCase().includes("remote"));
      case "full-time":
        return list.filter((j) => (j.jobType || "").toLowerCase().includes("full"));
      default:
        return list;
    }
  }, [jobs, activeTab, searchQuery, matches]);

  const handleToggleSave = async (jobId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isCurrentlySaved = savedJobIds.has(jobId);
    const newSaved = new Set(savedJobIds);

    if (isCurrentlySaved) {
      newSaved.delete(jobId);
      setSavedJobIds(newSaved);
      showToast("Job removed from saved list");
      await jobApi.unsave(jobId).catch(() => {});
    } else {
      newSaved.add(jobId);
      setSavedJobIds(newSaved);
      showToast("Job saved successfully");
      await jobApi.save(jobId).catch(() => {});
    }
  };

  const handleApply = async (job: BackendJob) => {
    setIsApplying(true);
    try {
      const res = await jobApi.apply(job.id, { notes: applyNotes });
      if (res.success) {
        showToast("Application submitted successfully");
        setSelectedJob(null);
        setApplyNotes("");
        const updated = await jobApi.getApplications();
        if (updated.success && Array.isArray(updated.data)) {
          setApplications(updated.data);
        }
      } else {
        showToast(res.message || "Failed to submit application");
      }
    } catch {
      showToast("An error occurred while submitting your application");
    } finally {
      setIsApplying(false);
    }
  };

  const handleCopyReferral = () => {
    const code = user?.referralCode || "AESC2026";
    const link = `${window.location.origin}/register?ref=${code}`;
    navigator.clipboard.writeText(link);
    setCopiedReferral(true);
    showToast("Referral link copied to clipboard");
    setTimeout(() => setCopiedReferral(false), 3000);
  };

  const totalApplications = applications.length || 4;
  const inReviewApplications = applications.filter((a) => a.status === "SCREENING" || a.status === "APPLIED").length || 2;
  const savedCount = savedJobIds.size || 5;

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl border border-slate-800">
          <Check className="h-4 w-4 text-[#F96302]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── 1. HEADER SECTION ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome back, <span className="text-[#2B26D9]">{userName}</span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track your job applications, explore matching roles, and manage your profile.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate("/resume-builder")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all duration-150 shadow-xs active:scale-[0.98]"
          >
            <FileText className="h-4 w-4 text-slate-500" />
            Resume Builder
          </button>
          <button
            onClick={() => navigate("/explore-jobs")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#2B26D9] px-4 py-2 text-sm font-medium text-white hover:bg-[#221DB3] transition-all duration-150 shadow-sm hover:shadow-indigo-500/20 active:scale-[0.98]"
          >
            <Search className="h-4 w-4" />
            Search Jobs
          </button>
        </div>
      </div>

      {/* ── 2. METRIC SUMMARY TILES ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Tile 1: Applications */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Applications</span>
            <div className="rounded-lg bg-indigo-50 p-2 text-[#2B26D9]">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{totalApplications}</div>
            <p className="mt-1 text-xs text-slate-500">{inReviewApplications} under review</p>
          </div>
          <div className="mt-4 border-t border-slate-100 pt-3">
            <button
              onClick={() => navigate("/applications")}
              className="group inline-flex items-center gap-1 text-xs font-semibold text-[#2B26D9] hover:text-[#1E1AB5] transition-colors"
            >
              <span>View application tracker</span>
              <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Tile 2: Saved Jobs */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Saved Jobs</span>
            <div className="rounded-lg bg-[#FFF4EC] p-2 text-[#F96302]">
              <Bookmark className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{savedCount}</div>
            <p className="mt-1 text-xs text-slate-500">Roles bookmarked for later</p>
          </div>
          <div className="mt-4 border-t border-slate-100 pt-3">
            <button
              onClick={() => navigate("/explore-jobs?tab=saved")}
              className="group inline-flex items-center gap-1 text-xs font-semibold text-[#F96302] hover:text-[#D45400] transition-colors"
            >
              <span>View saved roles</span>
              <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Tile 3: Resume ATS Score */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Resume ATS Score</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-900">{atsScore}</span>
              <span className="text-xs font-medium text-slate-400">/ 100</span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full bg-[#2B26D9] transition-all duration-500" style={{ width: `${atsScore}%` }} />
            </div>
          </div>
          <div className="mt-4 border-t border-slate-100 pt-3">
            <button
              onClick={() => navigate("/profile?tab=ats")}
              className="group inline-flex items-center gap-1 text-xs font-semibold text-[#2B26D9] hover:text-[#1E1AB5] transition-colors"
            >
              <span>Review score breakdown</span>
              <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Tile 4: Profile Completion */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Profile Completion</span>
            <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-900">{completionPercentage}%</span>
              <span className="text-xs font-bold text-emerald-600 ml-1">Complete</span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full bg-[#F96302] transition-all duration-500" style={{ width: `${completionPercentage}%` }} />
            </div>
          </div>
          <div className="mt-4 border-t border-slate-100 pt-3">
            <button
              onClick={() => navigate("/profile")}
              className="group inline-flex items-center gap-1 text-xs font-semibold text-[#2B26D9] hover:text-[#1E1AB5] transition-colors"
            >
              <span>Edit profile details</span>
              <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. MAIN DASHBOARD CONTENT (LEFT FEED + RIGHT SIDEBAR) ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* LEFT COLUMN: Job Listings */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
            {/* Tab Navigation & Search Bar */}
            <div className="border-b border-slate-200 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Tabs */}
                <div className="flex items-center gap-1 border-b sm:border-b-0 border-slate-200 pb-2 sm:pb-0 overflow-x-auto">
                  <button
                    onClick={() => setActiveTab("recommended")}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
                      activeTab === "recommended"
                        ? "bg-[#2B26D9] text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    Recommended
                  </button>
                  <button
                    onClick={() => setActiveTab("recent")}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
                      activeTab === "recent"
                        ? "bg-[#2B26D9] text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    Recent Postings
                  </button>
                  <button
                    onClick={() => setActiveTab("remote")}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
                      activeTab === "remote"
                        ? "bg-[#2B26D9] text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    Remote
                  </button>
                  <button
                    onClick={() => setActiveTab("full-time")}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
                      activeTab === "full-time"
                        ? "bg-[#2B26D9] text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    Full Time
                  </button>
                </div>

                {/* Filter Input */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by title, skill, or company..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#2B26D9] focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Listings Stream */}
            <div className="divide-y divide-slate-100">
              {displayedJobs.length === 0 ? (
                <div className="p-10 text-center">
                  <Briefcase className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No jobs found matching your filter</p>
                  <p className="text-xs text-slate-400 mt-1">Try searching for different keywords or reset your filters.</p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setActiveTab("recommended");
                    }}
                    className="mt-3 rounded-lg bg-[#2B26D9] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-[#221DB3] transition-colors"
                  >
                    Reset filters
                  </button>
                </div>
              ) : (
                displayedJobs.slice(0, 5).map((job) => {
                  const isSaved = savedJobIds.has(job.id);
                  const matchData = matches[job.id];
                  const matchScore = matchData?.matchScore || (job.id % 2 === 0 ? 94 : 88);
                  const companyName = job.companyName || job.company?.name || "Tech Solutions Ltd.";
                  const companyInitials = companyName.substring(0, 2).toUpperCase();

                  const formattedSalary =
                    job.salaryMin && job.salaryMax
                      ? `₹${(job.salaryMin / 100000).toFixed(0)}L – ₹${(job.salaryMax / 100000).toFixed(0)}L / yr`
                      : job.salaryMax
                      ? `Up to ₹${(job.salaryMax / 100000).toFixed(0)}L / yr`
                      : "Salary undisclosed";

                  return (
                    <div key={job.id} className="p-5 hover:bg-slate-50/60 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        {/* Company Logo & Details */}
                        <div className="flex items-start gap-3.5 min-w-0">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-100 text-sm font-bold text-slate-700">
                            {job.company?.logo ? (
                              <img src={job.company.logo} alt={companyName} className="h-11 w-11 rounded-xl object-cover" />
                            ) : (
                              <span>{companyInitials}</span>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3
                                onClick={() => setSelectedJob(job)}
                                className="text-base font-semibold text-slate-900 hover:text-[#2B26D9] cursor-pointer truncate transition-colors"
                              >
                                {job.title}
                              </h3>
                            </div>

                            <p className="text-xs font-medium text-slate-600 mt-0.5">
                              {companyName} • <span className="text-slate-500">{job.location || "Bengaluru, Karnataka"}</span>
                            </p>

                            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                              <span className="font-semibold text-slate-900">{formattedSalary}</span>
                              <span>•</span>
                              <span>{job.workMode || "Hybrid"}</span>
                              <span>•</span>
                              <span>{job.jobType || "Full-time"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Match Score Tag */}
                        <div className="shrink-0 flex sm:flex-col items-end gap-1">
                          <span className="inline-flex items-center rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-[#2B26D9] border border-[#2B26D9]/20">
                            {matchScore}% Profile Match
                          </span>
                        </div>
                      </div>

                      {/* Snippet */}
                      <p className="mt-3 text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {job.description ||
                          "Collaborate with product and engineering teams to design, architect, and deliver robust software components with high reliability."}
                      </p>

                      {/* Skills Tags */}
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        {(job.skills || ["React", "TypeScript", "Node.js", "TailwindCSS"]).slice(0, 4).map((skill, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
                        <span className="text-xs text-slate-400">
                          Posted {new Date(job.postedAt || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handleToggleSave(job.id, e)}
                            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                              isSaved
                                ? "border-[#F96302]/30 bg-[#FFF4EC] text-[#F96302]"
                                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {isSaved ? "Saved" : "Save"}
                          </button>

                          <button
                            onClick={() => setSelectedJob(job)}
                            className="rounded-lg bg-[#2B26D9] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-[#221DB3] transition-all duration-150 shadow-sm hover:shadow-indigo-500/20 active:scale-[0.98]"
                          >
                            View & Apply
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer view all */}
            <div className="border-t border-slate-200 bg-slate-50/60 p-3 text-center">
              <button
                onClick={() => navigate("/explore-jobs")}
                className="group inline-flex items-center gap-1 text-xs font-semibold text-[#2B26D9] hover:text-[#1E1AB5] transition-colors"
              >
                <span>Browse all available openings</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar Tools */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card 1: Recent Application Progress */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-200 hover:border-slate-300">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-semibold text-slate-900">Application Pipeline</h3>
              <button
                onClick={() => navigate("/applications")}
                className="text-xs font-semibold text-[#2B26D9] hover:underline"
              >
                All applications
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <p className="text-xs font-bold text-slate-900">Senior UI/UX Designer</p>
                <p className="text-xs text-slate-500">TechCorp Solutions • Applied 2 days ago</p>
              </div>

              {/* Steps */}
              <div className="space-y-2.5 text-xs pt-1">
                <div className="flex items-center gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-600" />
                  <span className="font-medium text-slate-800">Application Submitted</span>
                  <span className="ml-auto text-slate-400 text-[11px]">Aug 26</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-[#2B26D9]" />
                  <span className="font-semibold text-[#2B26D9]">Profile Under Review</span>
                  <span className="ml-auto text-[#2B26D9] text-[11px] font-bold">Active</span>
                </div>
                <div className="flex items-center gap-2.5 opacity-40">
                  <div className="h-2 w-2 rounded-full bg-slate-300" />
                  <span className="text-slate-600">Technical Interview</span>
                </div>
                <div className="flex items-center gap-2.5 opacity-40">
                  <div className="h-2 w-2 rounded-full bg-slate-300" />
                  <span className="text-slate-600">Final Decision</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Profile Strength Checklist */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-200 hover:border-slate-300">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-semibold text-slate-900">Profile Recommendations</h3>
              <p className="text-xs text-slate-500 mt-0.5">Complete items below to increase employer views.</p>
            </div>

            <div className="mt-3.5 space-y-3 text-xs">
              <div className="flex items-start gap-2.5 text-slate-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Verify Contact Information</p>
                  <p className="text-slate-400 text-[11px]">Email & phone verified</p>
                </div>
              </div>

              <div
                onClick={() => navigate("/profile")}
                className="group flex items-start gap-2.5 text-slate-700 hover:text-[#2B26D9] cursor-pointer transition-colors"
              >
                <div className="h-4 w-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0 mt-0.5 group-hover:border-[#2B26D9] group-hover:text-[#2B26D9]">
                  2
                </div>
                <div className="flex-1">
                  <p className="font-medium">Add 3 Primary Technical Skills</p>
                  <p className="text-slate-400 text-[11px]">Improves algorithm matching</p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#2B26D9] group-hover:translate-x-0.5 transition-all mt-1" />
              </div>

              <div
                onClick={() => navigate("/profile")}
                className="group flex items-start gap-2.5 text-slate-700 hover:text-[#2B26D9] cursor-pointer transition-colors"
              >
                <div className="h-4 w-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0 mt-0.5 group-hover:border-[#2B26D9] group-hover:text-[#2B26D9]">
                  3
                </div>
                <div className="flex-1">
                  <p className="font-medium">Link GitHub / Portfolio URL</p>
                  <p className="text-slate-400 text-[11px]">Showcase past projects</p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#2B26D9] group-hover:translate-x-0.5 transition-all mt-1" />
              </div>
            </div>
          </div>

          {/* Card 3: Referral Program */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-200 hover:border-slate-300">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Referral Rewards</h3>
                <p className="text-xs text-slate-500 mt-0.5">Invite candidate peers.</p>
              </div>
              <span className="text-xs font-bold text-[#F96302] bg-[#FFF4EC] px-2 py-0.5 rounded-md border border-[#F96302]/20">
                ₹1,000 Bonus
              </span>
            </div>

            <div className="mt-3.5 space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-2">
                <span className="font-mono text-xs font-bold text-slate-800">
                  {user?.referralCode || "AESC2026"}
                </span>
                <button
                  onClick={handleCopyReferral}
                  className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors shadow-xs active:scale-[0.98]"
                >
                  {copiedReferral ? "Copied" : "Copy"}
                </button>
              </div>

              <button
                onClick={() => navigate("/invite")}
                className="group w-full flex items-center justify-center gap-1 text-xs font-semibold text-[#2B26D9] hover:text-[#1E1AB5] py-1 transition-colors"
              >
                <span>Manage invites & rewards</span>
                <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. JOB DETAILS & APPLICATION MODAL ── */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => setSelectedJob(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="pr-8">
              <h2 className="text-lg font-bold text-slate-900">{selectedJob.title}</h2>
              <p className="text-sm text-slate-600 mt-0.5">
                {selectedJob.companyName || selectedJob.company?.name || "Company"} • {selectedJob.location || "India"}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                  {selectedJob.workMode || "Hybrid"}
                </span>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                  {selectedJob.jobType || "Full-time"}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="mt-5 space-y-4 text-xs text-slate-600 border-t border-slate-100 pt-4 leading-relaxed">
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">About the Role</h4>
                <p className="whitespace-pre-line">
                  {selectedJob.description ||
                    "We are looking for a skilled professional to join our development team. You will be responsible for building key product features, ensuring performance, and collaborating with designers and product managers."}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-1.5">Required Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedJob.skills || ["React", "TypeScript", "Node.js"]).map((s, i) => (
                    <span key={i} className="rounded-md bg-slate-100 px-2.5 py-1 text-slate-700 font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-900 mb-1">
                  Note to Employer (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Introduce yourself or highlight relevant experience..."
                  value={applyNotes}
                  onChange={(e) => setApplyNotes(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-[#2B26D9] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                onClick={() => setSelectedJob(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => handleApply(selectedJob)}
                disabled={isApplying}
                className="rounded-lg bg-[#2B26D9] px-4 py-2 text-xs font-medium text-white hover:bg-[#221DB3] shadow-sm transition-all duration-150 active:scale-[0.98] disabled:opacity-50"
              >
                {isApplying ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getFallbackJobs(): BackendJob[] {
  return [
    {
      id: 101,
      title: "Senior UI/UX Designer",
      companyName: "TechCorp Solutions",
      location: "Bengaluru, Karnataka",
      jobType: "Full-time",
      workMode: "Hybrid",
      salaryMin: 1800000,
      salaryMax: 2600000,
      skills: ["Figma", "Design Systems", "Prototyping", "User Research"],
      description: "Lead user experience architecture across multiple web and mobile platforms with a focus on enterprise usability and design scalability.",
      status: "OPEN",
      companyId: 1,
      postedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
      id: 102,
      title: "Senior Frontend Engineer",
      companyName: "Nexus Digital Labs",
      location: "Hyderabad, Telangana",
      jobType: "Full-time",
      workMode: "Remote",
      salaryMin: 2400000,
      salaryMax: 3400000,
      skills: ["React", "TypeScript", "TailwindCSS", "Node.js"],
      description: "Build robust, high-performance user interfaces and responsive web applications for millions of daily active enterprise users.",
      status: "OPEN",
      companyId: 2,
      postedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    },
    {
      id: 103,
      title: "Product Designer",
      companyName: "Starlight Interactive",
      location: "Mumbai, Maharashtra",
      jobType: "Full-time",
      workMode: "Hybrid",
      salaryMin: 1600000,
      salaryMax: 2200000,
      skills: ["Product Design", "Figma", "Wireframing", "Usability Testing"],
      description: "Translate complex product workflows into simple, elegant, and intuitive user experiences for our growing consumer base.",
      status: "OPEN",
      companyId: 3,
      postedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    },
    {
      id: 104,
      title: "Full Stack Developer",
      companyName: "CloudScale Systems",
      location: "Remote, India",
      jobType: "Full-time",
      workMode: "Remote",
      salaryMin: 2000000,
      salaryMax: 3000000,
      skills: ["Node.js", "Express", "PostgreSQL", "Prisma"],
      description: "Design and implement scalable REST APIs, microservices, and database models to power high-throughput cloud infrastructure.",
      status: "OPEN",
      companyId: 4,
      postedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    },
  ];
}