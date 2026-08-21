import { useState } from "react";
import { MapPin, DollarSign, Clock, Building2, Bookmark, CheckCircle2 } from "lucide-react";

interface Job {
  id: string;
  title: string;
  company: string;
  logoBg: string;
  logoText: string;
  location: string;
  type: string;
  salary: string;
  posted: string;
  tags: string[];
  featured?: boolean;
}

const sampleJobs: Job[] = [
  {
    id: "1",
    title: "Senior AI Software Engineer",
    company: "AESCION Intelligence",
    logoBg: "bg-indigo-600 text-white",
    logoText: "AI",
    location: "San Francisco, CA (Hybrid)",
    type: "Full-Time",
    salary: "$140,000 - $185,000",
    posted: "2 hours ago",
    tags: ["React", "Python", "PyTorch", "LLMs"],
    featured: true,
  },
  {
    id: "2",
    title: "Lead Product Designer (UI/UX)",
    company: "Nova Cloud Systems",
    logoBg: "bg-orange-500 text-white",
    logoText: "NC",
    location: "Remote",
    type: "Full-Time",
    salary: "$120,000 - $150,000",
    posted: "5 hours ago",
    tags: ["Figma", "Design Systems", "Prototyping"],
    featured: true,
  },
  {
    id: "3",
    title: "Full Stack Developer (React & Node)",
    company: "Apex Global Tech",
    logoBg: "bg-slate-800 text-white",
    logoText: "AG",
    location: "Austin, TX (On-site)",
    type: "Full-Time",
    salary: "$110,000 - $140,000",
    posted: "1 day ago",
    tags: ["TypeScript", "React", "Node.js", "PostgreSQL"],
  },
  {
    id: "4",
    title: "DevOps & Cloud Infrastructure Lead",
    company: "CyberShield Security",
    logoBg: "bg-emerald-600 text-white",
    logoText: "CS",
    location: "Remote",
    type: "Contract",
    salary: "$90 - $120 / hr",
    posted: "1 day ago",
    tags: ["AWS", "Kubernetes", "Terraform", "CI/CD"],
  },
  {
    id: "5",
    title: "Data Scientist & Analytics Manager",
    company: "QuantVantage Analytics",
    logoBg: "bg-blue-600 text-white",
    logoText: "QV",
    location: "New York, NY (Hybrid)",
    type: "Full-Time",
    salary: "$135,000 - $170,000",
    posted: "2 days ago",
    tags: ["Python", "SQL", "Machine Learning", "Tableau"],
  },
  {
    id: "6",
    title: "Technical Product Manager",
    company: "AESCION Labs",
    logoBg: "bg-[#2B26D9] text-white",
    logoText: "AE",
    location: "Remote",
    type: "Full-Time",
    salary: "$130,000 - $160,000",
    posted: "3 days ago",
    tags: ["Product Strategy", "Agile", "AI Tech", "Roadmapping"],
    featured: true,
  },
];

export default function FeaturedJobs() {
  const [savedJobs, setSavedJobs] = useState<Record<string, boolean>>({});
  const [appliedJobs, setAppliedJobs] = useState<Record<string, boolean>>({});

  const toggleSave = (id: string) => {
    setSavedJobs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleApply = (id: string) => {
    setAppliedJobs((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <section className="bg-slate-50/70 py-16 sm:py-20 border-t border-b border-slate-200/60">
      <div className="mx-auto max-w-[1420px] px-4 sm:px-6 lg:px-10">
        
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#F96302]">
              Hand-picked Opportunities
            </span>
            <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Featured Job Openings
            </h2>
            <p className="mt-2 text-base text-slate-600">
              Apply to high-impact positions curated for your skills and career aspirations.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center text-sm font-bold text-[#2B26D9] hover:underline"
          >
            View All 1,200+ Jobs →
          </button>
        </div>

        {/* Job Cards Grid */}
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {sampleJobs.map((job) => {
            const isSaved = savedJobs[job.id];
            const isApplied = appliedJobs[job.id];

            return (
              <article
                key={job.id}
                className={`relative flex flex-col justify-between rounded-2xl border bg-white p-6 transition duration-200 hover:-translate-y-1 hover:shadow-xl ${
                  job.featured
                    ? "border-indigo-200 shadow-md ring-1 ring-indigo-50"
                    : "border-slate-200 shadow-sm"
                }`}
              >
                <div>
                  {/* Top Bar: Company Logo & Bookmark */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-extrabold shadow-sm ${job.logoBg}`}
                      >
                        {job.logoText}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          {job.company}
                        </h4>
                        <p className="flex items-center gap-1 text-xs font-medium text-slate-500">
                          <Building2 size={13} />
                          Tech / Software
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleSave(job.id)}
                      className={`rounded-xl p-2.5 transition ${
                        isSaved
                          ? "bg-indigo-50 text-[#2B26D9]"
                          : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      }`}
                      aria-label="Bookmark job"
                    >
                      <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />
                    </button>
                  </div>

                  {/* Job Title */}
                  <h3 className="mt-4 text-lg font-bold text-slate-900 line-clamp-1 hover:text-[#2B26D9] cursor-pointer">
                    {job.title}
                  </h3>

                  {/* Metadata Pills */}
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
                    <span className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1">
                      <MapPin size={13} className="text-slate-400" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1 rounded-lg bg-indigo-50 text-[#2B26D9] px-2.5 py-1 font-semibold">
                      {job.type}
                    </span>
                  </div>

                  {/* Salary & Posted */}
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
                    <span className="flex items-center gap-1 font-bold text-slate-900 text-sm">
                      <DollarSign size={14} className="text-emerald-600" />
                      {job.salary}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={13} />
                      {job.posted}
                    </span>
                  </div>

                  {/* Skill Tags */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {job.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-slate-200 bg-slate-50/50 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="mt-6 border-t border-slate-100 pt-4">
                  {isApplied ? (
                    <button
                      disabled
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-50 py-2.5 text-sm font-bold text-emerald-600 cursor-default"
                    >
                      <CheckCircle2 size={16} />
                      Applied Successfully
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleApply(job.id)}
                      className="w-full rounded-xl bg-slate-900 py-2.5 text-sm font-bold text-white transition hover:bg-[#2B26D9]"
                    >
                      Quick Apply
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>

      </div>
    </section>
  );
}
