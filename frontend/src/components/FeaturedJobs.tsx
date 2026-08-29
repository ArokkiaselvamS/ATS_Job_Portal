import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, CheckCircle2, ArrowRight, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { jobApi, BackendJob } from "../services/jobApi";

const appleEase = [0.16, 1, 0.3, 1] as const;

export default function FeaturedJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<BackendJob[]>([]);
  const [savedJobs, setSavedJobs] = useState<Set<number>>(new Set());
  const [appliedJobs, setAppliedJobs] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<"all" | "tech" | "finance" | "health" | "sales">("all");

  useEffect(() => {
    let isMounted = true;
    async function loadFeatured() {
      try {
        const res = await jobApi.search({ limit: "12" });
        if (isMounted && res?.success && Array.isArray(res.data) && res.data.length > 0) {
          setJobs(res.data);
        } else if (isMounted) {
          setJobs(getFallbackFeaturedJobs());
        }
      } catch {
        if (isMounted) setJobs(getFallbackFeaturedJobs());
      }
    }
    loadFeatured();
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleSave = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSaved = new Set(savedJobs);
    if (newSaved.has(id)) {
      newSaved.delete(id);
    } else {
      newSaved.add(id);
    }
    setSavedJobs(newSaved);
  };

  const handleApply = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newApplied = new Set(appliedJobs);
    newApplied.add(id);
    setAppliedJobs(newApplied);
    jobApi.apply(id).catch(() => {});
  };

  const filteredJobs = jobs.filter((job) => {
    if (activeTab === "tech") {
      return (
        (job.skills || []).some((s) => /react|node|python|java|cloud|engineer|stack|devops/i.test(s)) ||
        /engineer|developer|architect|tech/i.test(job.title)
      );
    }
    if (activeTab === "finance") {
      return (
        (job.skills || []).some((s) => /finance|audit|tax|accounting|banking|analyst/i.test(s)) ||
        /finance|analyst|accountant|bank/i.test(job.title)
      );
    }
    if (activeTab === "health") {
      return (
        (job.skills || []).some((s) => /health|clinical|medical|pharma|patient/i.test(s)) ||
        /clinical|health|nurse|medical/i.test(job.title)
      );
    }
    if (activeTab === "sales") {
      return (
        (job.skills || []).some((s) => /sales|marketing|growth|operations|client|crm/i.test(s)) ||
        /sales|marketing|operations|manager/i.test(job.title)
      );
    }
    return true;
  });

  return (
    <motion.section
      initial={{ opacity: 0, y: -25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease: appleEase }}
      className="bg-transparent py-10 sm:py-14 border-t border-b border-slate-200/80"
    >
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Featured Job Openings
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Verified positions with direct recruiter response and transparent compensation.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/explore-jobs")}
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#0067b8] hover:text-[#005a9e] transition-colors cursor-pointer"
          >
            <span>Explore all 15,000+ jobs</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: "All Roles" },
            { id: "tech", label: "Technology" },
            { id: "finance", label: "Finance" },
            { id: "health", label: "Healthcare" },
            { id: "sales", label: "Sales & Growth" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`rounded-[4px] px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#0067b8] text-white shadow-2xs"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Job Cards Grid with staggered drop-down */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.slice(0, 6).map((job, idx) => {
            const isSaved = savedJobs.has(job.id);
            const isApplied = appliedJobs.has(job.id);
            const companyName = job.companyName || job.company?.name || "Global Partner Ltd.";
            const companyInitials = companyName.substring(0, 2).toUpperCase();

            const salaryText =
              job.salaryMin && job.salaryMax
                ? `₹${(job.salaryMin / 100000).toFixed(0)}L – ₹${(job.salaryMax / 100000).toFixed(0)}L / yr`
                : job.salaryMax
                ? `Up to ₹${(job.salaryMax / 100000).toFixed(0)}L / yr`
                : "Competitive Package";

            return (
              <motion.article
                key={job.id}
                initial={{ opacity: 0, y: -15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05, ease: appleEase }}
                onClick={() => navigate("/explore-jobs")}
                className="ms-card-interactive group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-2xs cursor-pointer hover:border-[#0067b8] transition-all"
              >
                <div>
                  {/* Top: Logo & Info */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 group-hover:bg-[#EEF0FE] group-hover:text-[#2B26D9] transition-colors">
                        {job.company?.logo ? (
                          <img src={job.company.logo} alt={companyName} className="h-10 w-10 rounded-md object-cover" />
                        ) : (
                          <span>{companyInitials}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-[#2B26D9] transition-colors">
                          {companyName}
                        </h4>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin size={11} className="text-slate-400 shrink-0" />
                          <span>{job.location || "Bengaluru, India"}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => toggleSave(job.id, e)}
                      className={`rounded p-1.5 transition-colors ${
                        isSaved
                          ? "bg-amber-50 text-amber-600 border border-amber-200"
                          : "text-slate-400 hover:text-slate-600 border border-slate-100 hover:bg-slate-50"
                      }`}
                      aria-label="Bookmark job"
                    >
                      <Bookmark size={14} fill={isSaved ? "currentColor" : "none"} />
                    </button>
                  </div>

                  {/* Title */}
                  <h3 className="mt-3 text-sm font-bold text-slate-900 group-hover:text-[#2B26D9] transition-colors line-clamp-1">
                    {job.title}
                  </h3>

                  {/* Badges */}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="rounded bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700 border border-emerald-200/60">
                      {salaryText}
                    </span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                      {job.workMode || "Hybrid"}
                    </span>
                  </div>

                  {/* Skills */}
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {(job.skills || ["Strategy", "Leadership", "Analytics"]).slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-slate-50 border border-slate-200/80 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Verified Direct Employer
                  </span>

                  {isApplied ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                      <CheckCircle2 size={13} /> Applied
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => handleApply(job.id, e)}
                      className="rounded-[4px] bg-[#0067b8] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#005a9e] transition-colors shadow-2xs cursor-pointer"
                    >
                      Quick Apply
                    </button>
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>

      </div>
    </motion.section>
  );
}

function getFallbackFeaturedJobs(): BackendJob[] {
  return [
    {
      id: 1,
      title: "Senior Full Stack Engineer",
      companyName: "Nexus Cloud Systems",
      location: "Bengaluru, Karnataka",
      jobType: "Full-time",
      workMode: "Hybrid",
      salaryMin: 2200000,
      salaryMax: 3200000,
      skills: ["React", "TypeScript", "Node.js", "PostgreSQL"],
      description: "Build robust web applications.",
      status: "OPEN",
      companyId: 1,
      postedAt: new Date().toISOString(),
    },
    {
      id: 2,
      title: "Senior Financial Analyst",
      companyName: "Deloitte Global",
      location: "Mumbai, Maharashtra",
      jobType: "Full-time",
      workMode: "Hybrid",
      salaryMin: 1800000,
      salaryMax: 2600000,
      skills: ["Financial Modeling", "Corporate Audit", "IFRS"],
      description: "Financial evaluation and analysis.",
      status: "OPEN",
      companyId: 2,
      postedAt: new Date().toISOString(),
    },
    {
      id: 3,
      title: "Clinical Operations Lead",
      companyName: "Apollo Healthcare",
      location: "Chennai, Tamil Nadu",
      jobType: "Full-time",
      workMode: "On-site",
      salaryMin: 1600000,
      salaryMax: 2400000,
      skills: ["Clinical Protocols", "Healthcare Ops", "Regulatory"],
      description: "Oversee clinical trials and hospital workflows.",
      status: "OPEN",
      companyId: 3,
      postedAt: new Date().toISOString(),
    },
    {
      id: 4,
      title: "Enterprise Sales Director",
      companyName: "Global Trade Dynamics",
      location: "Delhi NCR / Remote",
      jobType: "Full-time",
      workMode: "Remote",
      salaryMin: 2400000,
      salaryMax: 3600000,
      skills: ["Enterprise Sales", "B2B Negotiations", "CRM"],
      description: "Drive revenue expansion.",
      status: "OPEN",
      companyId: 4,
      postedAt: new Date().toISOString(),
    },
    {
      id: 5,
      title: "Lead UI/UX Designer",
      companyName: "Starlight Interactive",
      location: "Remote, India",
      jobType: "Full-time",
      workMode: "Remote",
      salaryMin: 1900000,
      salaryMax: 2700000,
      skills: ["Figma", "Design Systems", "Prototyping"],
      description: "Design core web and mobile workflows.",
      status: "OPEN",
      companyId: 5,
      postedAt: new Date().toISOString(),
    },
    {
      id: 6,
      title: "Operations Manager",
      companyName: "Tata Logistics",
      location: "Pune, Maharashtra",
      jobType: "Full-time",
      workMode: "Hybrid",
      salaryMin: 1700000,
      salaryMax: 2500000,
      skills: ["Supply Chain", "Vendor Management", "ERP"],
      description: "Manage freight networks and logistics.",
      status: "OPEN",
      companyId: 6,
      postedAt: new Date().toISOString(),
    },
  ];
}
