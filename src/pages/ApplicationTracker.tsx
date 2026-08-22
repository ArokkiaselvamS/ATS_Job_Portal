import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useState, useMemo, useRef, useCallback } from "react";
import {
  Briefcase,
  CheckCircle,
  Search,
  Filter,
  Plus,
  Download,
  Upload,
  Edit3,
  Archive,
  Trash2,
  ExternalLink,
  LayoutGrid,
  X,
  Eye,
  MapPin,
  Building2,
  Globe,
  DollarSign,
  Mail,
  FileText,
  Bookmark,
  Send,
  Mic,
  PartyPopper,
  Ban,
  TrendingUp,
  BarChart3,
  ArrowRight,
  User,
  LinkIcon,
  Calendar,
  Layers,
} from "lucide-react";

type JobType = "Full-time" | "Part-time" | "Contract" | "Internship" | "Freelance";
type WorkMode = "Remote" | "Hybrid" | "On-site";
type AppStatus = "Saved" | "Applied" | "Screening" | "Interview" | "Offer" | "Rejected";

interface JobApplication {
  id: string;
  company: string;
  jobTitle: string;
  jobType: JobType;
  location: string;
  workMode: WorkMode;
  jobUrl: string;
  applicationDate: string;
  savedDate: string;
  status: AppStatus;
  salary: string;
  recruiterName: string;
  recruiterEmail: string;
  notes: string;
  resumeUsed: string;
  coverLetter: string;
  archived: boolean;
}

const STATUS_PIPELINE: AppStatus[] = ["Saved", "Applied", "Screening", "Interview", "Offer", "Rejected"];

const STATUS_CONFIG: Record<AppStatus, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
  Saved: { color: "text-slate-600", bg: "bg-slate-100", border: "border-slate-200", icon: <Bookmark size={14} /> },
  Applied: { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", icon: <Send size={14} /> },
  Screening: { color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200", icon: <Eye size={14} /> },
  Interview: { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", icon: <Mic size={14} /> },
  Offer: { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", icon: <PartyPopper size={14} /> },
  Rejected: { color: "text-red-600", bg: "bg-red-50", border: "border-red-200", icon: <Ban size={14} /> },
};

const JOB_TYPES: JobType[] = ["Full-time", "Part-time", "Contract", "Internship", "Freelance"];
const WORK_MODES: WorkMode[] = ["Remote", "Hybrid", "On-site"];

const LOGO_COLORS = [
  "bg-indigo-600", "bg-rose-500", "bg-emerald-600", "bg-amber-500",
  "bg-cyan-600", "bg-violet-600", "bg-pink-500", "bg-teal-600",
];

function getLogoColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return LOGO_COLORS[Math.abs(hash) % LOGO_COLORS.length];
}

function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}
const SAMPLE_APPLICATIONS: JobApplication[] = [
  {
    id: "1",
    company: "Evismart",
    jobTitle: "Senior Product Manager",
    jobType: "Full-time",
    location: "Vancouver, BC, Canada",
    workMode: "Hybrid",
    jobUrl: "https://evismart.com/careers/senior-product-manager",
    applicationDate: "2026-08-15",
    savedDate: "2026-08-10",
    status: "Interview",
    salary: "$140,000 - $170,000",
    recruiterName: "Sarah Chen",
    recruiterEmail: "sarah.chen@evismart.com",
    notes: "Great company culture. Interview with CTO scheduled.",
    resumeUsed: "Senior_PM_Resume_v3.pdf",
    coverLetter: "Cover_Letter_Evismart.pdf",
    archived: false,
  },
  {
    id: "2",
    company: "Remote",
    jobTitle: "Senior Product Manager",
    jobType: "Full-time",
    location: "Remote in USA",
    workMode: "Remote",
    jobUrl: "https://remote.com/jobs/senior-product-manager",
    applicationDate: "2026-08-12",
    savedDate: "2026-08-08",
    status: "Applied",
    salary: "$150,000 - $180,000",
    recruiterName: "Michael Torres",
    recruiterEmail: "michael@remote.com",
    notes: "Applied through referral.",
    resumeUsed: "Senior_PM_Resume_v3.pdf",
    coverLetter: "",
    archived: false,
  },
  {
    id: "3",
    company: "Capgemini",
    jobTitle: "Software Engineer",
    jobType: "Full-time",
    location: "Chennai, Tamil Nadu, India",
    workMode: "Hybrid",
    jobUrl: "https://capgemini.com/careers/software-engineer-chennai",
    applicationDate: "2026-08-05",
    savedDate: "2026-08-01",
    status: "Screening",
    salary: "INR 12,00,000 - 18,00,000",
    recruiterName: "Priya Sharma",
    recruiterEmail: "priya.sharma@capgemini.com",
    notes: "Online assessment completed.",
    resumeUsed: "Software_Engineer_Resume.pdf",
    coverLetter: "",
    archived: false,
  },
  {
    id: "4",
    company: "KLA Corporation",
    jobTitle: "Associate / Technical Lead",
    jobType: "Full-time",
    location: "Chennai, Tamil Nadu, India",
    workMode: "On-site",
    jobUrl: "https://kla.com/careers/technical-lead-chennai",
    applicationDate: "2026-08-01",
    savedDate: "2026-07-28",
    status: "Saved",
    salary: "INR 15,00,000 - 22,00,000",
    recruiterName: "",
    recruiterEmail: "",
    notes: "Found via LinkedIn. Need to tailor resume.",
    resumeUsed: "",
    coverLetter: "",
    archived: false,
  },
  {
    id: "5",
    company: "AESCION Intelligence",
    jobTitle: "Senior AI Software Engineer",
    jobType: "Full-time",
    location: "San Francisco, CA, USA",
    workMode: "Hybrid",
    jobUrl: "https://aescion.com/careers/ai-engineer",
    applicationDate: "2026-08-20",
    savedDate: "2026-08-18",
    status: "Offer",
    salary: "$180,000 - $220,000",
    recruiterName: "James Wright",
    recruiterEmail: "james.wright@aescion.com",
    notes: "Offer received! Reviewing compensation package.",
    resumeUsed: "AI_Engineer_Resume.pdf",
    coverLetter: "Cover_Letter_AESCION.pdf",
    archived: false,
  },
  {
    id: "6",
    company: "Nova Cloud Systems",
    jobTitle: "Lead Product Designer",
    jobType: "Contract",
    location: "Austin, TX, USA",
    workMode: "Remote",
    jobUrl: "https://novacloud.com/careers/lead-designer",
    applicationDate: "2026-07-25",
    savedDate: "2026-07-20",
    status: "Rejected",
    salary: "$120,000 - $150,000",
    recruiterName: "Lisa Park",
    recruiterEmail: "lisa.park@novacloud.com",
    notes: "Position filled internally.",
    resumeUsed: "Design_Lead_Resume.pdf",
    coverLetter: "",
    archived: false,
  },
  {
    id: "7",
    company: "Apex Global Tech",
    jobTitle: "Full Stack Developer",
    jobType: "Full-time",
    location: "Bangalore, Karnataka, India",
    workMode: "Hybrid",
    jobUrl: "https://apexglobal.com/careers/fullstack",
    applicationDate: "2026-08-18",
    savedDate: "2026-08-15",
    status: "Applied",
    salary: "INR 14,00,000 - 20,00,000",
    recruiterName: "",
    recruiterEmail: "",
    notes: "Applied via company website.",
    resumeUsed: "Fullstack_Resume.pdf",
    coverLetter: "",
    archived: false,
  },
  {
    id: "8",
    company: "CyberShield Security",
    jobTitle: "DevOps Engineer",
    jobType: "Full-time",
    location: "Toronto, ON, Canada",
    workMode: "Remote",
    jobUrl: "https://cybershield.com/careers/devops",
    applicationDate: "2026-08-10",
    savedDate: "2026-08-06",
    status: "Interview",
    salary: "CAD $110,000 - $140,000",
    recruiterName: "David Kim",
    recruiterEmail: "david.kim@cybershield.com",
    notes: "Second round interview scheduled for next week.",
    resumeUsed: "DevOps_Resume.pdf",
    coverLetter: "Cover_Letter_CyberShield.pdf",
    archived: false,
  },
];

function applicationToCSVRow(app: JobApplication): string {
  const fields = [
    app.company,
    app.jobTitle,
    app.jobType,
    app.location,
    app.workMode,
    app.jobUrl,
    app.applicationDate,
    app.savedDate,
    app.status,
    app.salary,
    app.recruiterName,
    app.recruiterEmail,
    app.notes,
    app.resumeUsed,
    app.coverLetter,
    app.archived ? "true" : "false",
  ];
  return fields.map((f) => `"${(f || "").replace(/"/g, '""')}"`).join(",");
}

const CSV_HEADERS = [
  "Company", "Job Title", "Job Type", "Location", "Work Mode",
  "Job URL", "Application Date", "Saved Date", "Status", "Salary",
  "Recruiter Name", "Recruiter Email", "Notes", "Resume Used",
  "Cover Letter", "Archived",
];

function exportCSV(applications: JobApplication[]): void {
  const header = CSV_HEADERS.join(",");
  const rows = applications.map(applicationToCSVRow);
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `application-tracker-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
  }
  result.push(current.trim());
  return result;
}

function importCSVToApplications(csvText: string): { applications: Partial<JobApplication>[]; errors: string[] } {
  const lines = csvText.split("\n").filter((l) => l.trim());
  const errors: string[] = [];
  const applications: Partial<JobApplication>[] = [];

  if (lines.length < 2) {
    errors.push("CSV file is empty or has no data rows.");
    return { applications, errors };
  }

  const header = parseCSVLine(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, "_"));

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    header.forEach((key, idx) => {
      row[key] = values[idx] || "";
    });

    if (!row["company"] && !row["job_title"]) {
      errors.push(`Row ${i + 1}: Missing both Company and Job Title.`);
      continue;
    }

    const validStatuses: AppStatus[] = ["Saved", "Applied", "Screening", "Interview", "Offer", "Rejected"];
    const status = (row["status"] as AppStatus) || "Saved";
    const validJobTypes: JobType[] = ["Full-time", "Part-time", "Contract", "Internship", "Freelance"];
    const jobType = (row["job_type"] as JobType) || "Full-time";
    const validWorkModes: WorkMode[] = ["Remote", "Hybrid", "On-site"];
    const workMode = (row["work_mode"] as WorkMode) || "On-site";

    applications.push({
      id: `import-${Date.now()}-${i}`,
      company: row["company"] || "Unknown Company",
      jobTitle: row["job_title"] || row["jobtitle"] || "Untitled Position",
      jobType: validJobTypes.includes(jobType) ? jobType : "Full-time",
      location: row["location"] || "",
      workMode: validWorkModes.includes(workMode) ? workMode : "On-site",
      jobUrl: row["job_url"] || row["joburl"] || "",
      applicationDate: row["application_date"] || row["applicationdate"] || new Date().toISOString().slice(0, 10),
      savedDate: row["saved_date"] || row["saveddate"] || new Date().toISOString().slice(0, 10),
      status: validStatuses.includes(status) ? status : "Saved",
      salary: row["salary"] || "",
      recruiterName: row["recruiter_name"] || row["recruitername"] || "",
      recruiterEmail: row["recruiter_email"] || row["recruiteremail"] || "",
      notes: row["notes"] || "",
      resumeUsed: row["resume_used"] || row["resumeused"] || "",
      coverLetter: row["cover_letter"] || row["coverletter"] || "",
      archived: row["archived"] === "true",
    });
  }

  return { applications, errors };
}

function StatusPipeline({
  currentStatus,
  onStatusChange,
  compact = false,
}: {
  currentStatus: AppStatus;
  onStatusChange: (s: AppStatus) => void;
  compact?: boolean;
}) {
  const activeIndex = STATUS_PIPELINE.indexOf(currentStatus);
  const isRejected = currentStatus === "Rejected";

  return (
    <div className="flex items-center gap-0 flex-wrap">
      {STATUS_PIPELINE.map((step, idx) => {
        const isActive = idx === activeIndex;
        const isPast = !isRejected && idx < activeIndex;
        const isFuture = idx > activeIndex && !isRejected;
        const isRejectedStep = step === "Rejected";
        const cfg = STATUS_CONFIG[step];

        let classes = "group relative flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold transition-all duration-200 cursor-pointer ";
        if (isActive) {
          classes += `${cfg.bg} ${cfg.color} ${cfg.border} shadow-sm ring-2 ring-offset-1 `;
        } else if (isPast) {
          classes += `${cfg.bg} ${cfg.color} ${cfg.border} opacity-70 `;
        } else if (isFuture) {
          classes += "bg-slate-50 text-slate-400 border-slate-200 opacity-50 ";
        } else if (isRejectedStep && isRejected) {
          classes += `${cfg.bg} ${cfg.color} ${cfg.border} `;
        } else {
          classes += "bg-slate-50 text-slate-400 border-slate-200 opacity-40 ";
        }
        classes += "hover:opacity-100 hover:shadow-sm";

        return (
          <div key={step} className="flex items-center">
            <button
              onClick={() => onStatusChange(step)}
              title={`Mark as ${step}`}
              className={classes}
            >
              <span className="hidden sm:inline-flex">{cfg.icon}</span>
              <span>{compact ? step.slice(0, 4) : step}</span>
            </button>
            {idx < STATUS_PIPELINE.length - 1 && !isRejectedStep && (
              <ArrowRight
                size={12}
                className={`mx-0.5 ${isPast ? "text-slate-400" : "text-slate-300"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function JobCard({
  job,
  onStatusChange,
  onEdit,
  onArchive,
  onDelete,
}: {
  job: JobApplication;
  onStatusChange: (id: string, status: AppStatus) => void;
  onEdit: (job: JobApplication) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const logoColor = getLogoColor(job.company);
  const initials = getInitials(job.company);
  const cfg = STATUS_CONFIG[job.status];

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-sm font-black text-white ${logoColor}`}>
            {initials}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 truncate">{job.jobTitle}</h3>
            <p className="text-xs font-medium text-slate-500 truncate">{job.company}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(job)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#2B26D9] transition" title="Edit">
            <Edit3 size={14} />
          </button>
          <button onClick={() => onArchive(job.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition" title="Archive">
            <Archive size={14} />
          </button>
          <button onClick={() => onDelete(job.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition" title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin size={12} className="flex-shrink-0" />
          <span className="truncate">{job.location}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Globe size={12} className="flex-shrink-0" />
          <span>{job.workMode}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Briefcase size={12} className="flex-shrink-0" />
          <span>{job.jobType}</span>
        </div>
        {job.salary && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <DollarSign size={12} className="flex-shrink-0" />
            <span className="truncate">{job.salary}</span>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center gap-3 text-[10px] font-medium text-slate-400">
        <span className="flex items-center gap-1">
          <Bookmark size={10} />
          Saved {job.savedDate}
        </span>
        {job.applicationDate && (
          <span className="flex items-center gap-1">
            <Send size={10} />
            Applied {job.applicationDate}
          </span>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100">
        <StatusPipeline
          currentStatus={job.status}
          onStatusChange={(s) => onStatusChange(job.id, s)}
          compact
        />
      </div>

      <div className="mt-3 flex items-center gap-2">
        {job.jobUrl && (
          <a
            href={job.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-100 hover:text-[#2B26D9] transition"
          >
            <ExternalLink size={10} />
            View Job
          </a>
        )}
        <span className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${cfg.bg} ${cfg.color} ${cfg.border}`}>
          {cfg.icon}
          {job.status}
        </span>
      </div>
    </div>
  );
}

function AddEditModal({
  initial,
  onSave,
  onClose,
}: {
  initial: JobApplication | null;
  onSave: (data: Omit<JobApplication, "id" | "archived"> & { id?: string }) => void;
  onClose: () => void;
}) {
  const now = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    company: initial?.company || "",
    jobTitle: initial?.jobTitle || "",
    jobType: (initial?.jobType || "Full-time") as JobType,
    location: initial?.location || "",
    workMode: (initial?.workMode || "Remote") as WorkMode,
    jobUrl: initial?.jobUrl || "",
    applicationDate: initial?.applicationDate || now,
    savedDate: initial?.savedDate || now,
    status: (initial?.status || "Saved") as AppStatus,
    salary: initial?.salary || "",
    recruiterName: initial?.recruiterName || "",
    recruiterEmail: initial?.recruiterEmail || "",
    notes: initial?.notes || "",
    resumeUsed: initial?.resumeUsed || "",
    coverLetter: initial?.coverLetter || "",
  });

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company.trim() || !form.jobTitle.trim()) return;
    onSave({ ...form, id: initial?.id });
  };

  const fieldClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 focus:border-[#2B26D9] focus:outline-none focus:ring-1 focus:ring-[#2B26D9] shadow-sm transition";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 backdrop-blur-sm p-4 pt-10 sm:pt-20">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">
            {initial ? "Edit Application" : "Add Application"}
          </h2>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto px-6 py-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                <Building2 size={12} className="mr-1 inline" />
                Company Name *
              </label>
              <input type="text" required value={form.company} onChange={(e) => update("company", e.target.value)} placeholder="e.g. Google" className={fieldClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                <Briefcase size={12} className="mr-1 inline" />
                Job Title *
              </label>
              <input type="text" required value={form.jobTitle} onChange={(e) => update("jobTitle", e.target.value)} placeholder="e.g. Senior Engineer" className={fieldClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                <Layers size={12} className="mr-1 inline" />
                Job Type
              </label>
              <select value={form.jobType} onChange={(e) => update("jobType", e.target.value)} className={fieldClass}>
                {JOB_TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                <MapPin size={12} className="mr-1 inline" />
                Location
              </label>
              <input type="text" value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="e.g. New York, NY" className={fieldClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                <Globe size={12} className="mr-1 inline" />
                Work Mode
              </label>
              <select value={form.workMode} onChange={(e) => update("workMode", e.target.value)} className={fieldClass}>
                {WORK_MODES.map((m) => (<option key={m} value={m}>{m}</option>))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-600">
              <LinkIcon size={12} className="mr-1 inline" />
              Job URL
            </label>
            <input type="url" value={form.jobUrl} onChange={(e) => update("jobUrl", e.target.value)} placeholder="https://..." className={fieldClass} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                <Calendar size={12} className="mr-1 inline" />
                Application Date
              </label>
              <input type="date" value={form.applicationDate} onChange={(e) => update("applicationDate", e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                <Calendar size={12} className="mr-1 inline" />
                Saved Date
              </label>
              <input type="date" value={form.savedDate} onChange={(e) => update("savedDate", e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                <CheckCircle size={12} className="mr-1 inline" />
                Status
              </label>
              <select value={form.status} onChange={(e) => update("status", e.target.value)} className={fieldClass}>
                {STATUS_PIPELINE.map((s) => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-600">
              <DollarSign size={12} className="mr-1 inline" />
              Salary / Package
            </label>
            <input type="text" value={form.salary} onChange={(e) => update("salary", e.target.value)} placeholder="e.g. $120,000 - $150,000" className={fieldClass} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                <User size={12} className="mr-1 inline" />
                Recruiter Name
              </label>
              <input type="text" value={form.recruiterName} onChange={(e) => update("recruiterName", e.target.value)} placeholder="e.g. John Smith" className={fieldClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                <Mail size={12} className="mr-1 inline" />
                Recruiter Email
              </label>
              <input type="email" value={form.recruiterEmail} onChange={(e) => update("recruiterEmail", e.target.value)} placeholder="e.g. john@company.com" className={fieldClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                <FileText size={12} className="mr-1 inline" />
                Resume Used
              </label>
              <input type="text" value={form.resumeUsed} onChange={(e) => update("resumeUsed", e.target.value)} placeholder="e.g. Resume_v2.pdf" className={fieldClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                <FileText size={12} className="mr-1 inline" />
                Cover Letter
              </label>
              <input type="text" value={form.coverLetter} onChange={(e) => update("coverLetter", e.target.value)} placeholder="e.g. Cover_Letter.pdf" className={fieldClass} />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-600">
              <FileText size={12} className="mr-1 inline" />
              Notes
            </label>
            <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={3} placeholder="Any notes about this application..." className={`${fieldClass} resize-none`} />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition">
              Cancel
            </button>
            <button type="submit" className="rounded-xl bg-gradient-to-r from-[#2B26D9] to-[#F96302] px-6 py-2.5 text-sm font-bold text-white shadow-md hover:opacity-95 transition">
              {initial ? "Update Application" : "Save Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AnalyticsSection({ applications }: { applications: JobApplication[] }) {
  const active = applications.filter((a) => !a.archived);
  const counts = useMemo(() => {
    const c: Record<AppStatus, number> = { Saved: 0, Applied: 0, Screening: 0, Interview: 0, Offer: 0, Rejected: 0 };
    active.forEach((a) => { c[a.status]++; });
    return c;
  }, [active]);

  const total = active.length;
  const successRate = total > 0 ? ((counts.Offer / total) * 100).toFixed(1) : "0";
  const interviewRate = total > 0 ? (((counts.Interview + counts.Offer) / total) * 100).toFixed(1) : "0";

  const stats = [
    { label: "Total Apps", value: total, icon: <Briefcase size={16} className="text-[#2B26D9]" /> },
    { label: "Saved", value: counts.Saved, icon: <Bookmark size={16} className="text-slate-500" /> },
    { label: "Applied", value: counts.Applied, icon: <Send size={16} className="text-blue-500" /> },
    { label: "Screening", value: counts.Screening, icon: <Eye size={16} className="text-purple-500" /> },
    { label: "Interviews", value: counts.Interview, icon: <Mic size={16} className="text-amber-500" /> },
    { label: "Offers", value: counts.Offer, icon: <PartyPopper size={16} className="text-emerald-500" /> },
    { label: "Rejected", value: counts.Rejected, icon: <Ban size={16} className="text-red-500" /> },
    { label: "Success", value: `${successRate}%`, icon: <TrendingUp size={16} className="text-emerald-600" /> },
  ];

  const maxCount = Math.max(...Object.values(counts), 1);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={18} className="text-[#2B26D9]" />
        <h3 className="text-sm font-bold text-slate-900">Tracker Analytics</h3>
        <span className="ml-auto text-[10px] font-bold text-slate-400">
          Interview Rate: {interviewRate}%
        </span>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 mb-5">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <div className="flex justify-center mb-1">{s.icon}</div>
            <p className="text-lg font-black text-slate-900">{s.value}</p>
            <p className="text-[9px] font-bold text-slate-500 uppercase leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-100 pt-4">
        <p className="text-[10px] font-bold text-slate-500 uppercase mb-3 flex items-center gap-1">
          <TrendingUp size={12} />
          Application Progress Flow
        </p>
        <div className="flex items-end gap-2 h-28">
          {(["Saved", "Applied", "Screening", "Interview", "Offer"] as AppStatus[]).map((step) => {
            const count = counts[step];
            const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
            const cfg = STATUS_CONFIG[step];
            return (
              <div key={step} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-slate-700">{count}</span>
                <div className="w-full flex items-end justify-center" style={{ height: "80px" }}>
                  <div
                    className={`w-full max-w-[40px] rounded-t-lg transition-all duration-500 ${cfg.bg} ${cfg.border} border`}
                    style={{ height: `${Math.max(height, 4)}%` }}
                  />
                </div>
                <span className="text-[9px] font-bold text-slate-500 text-center leading-tight">{step}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-center gap-1 mt-3">
          {(["Saved", "Applied", "Screening", "Interview", "Offer"] as AppStatus[]).map((step, idx) => (
            <div key={step} className="flex items-center">
              <div className={`h-1.5 w-1.5 rounded-full ${STATUS_CONFIG[step].bg}`} />
              {idx < 4 && <div className="w-4 h-[1px] bg-slate-300" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ApplicationTracker() {
  const [applications, setApplications] = useState<JobApplication[]>(SAMPLE_APPLICATIONS);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<JobType | "All">("All");
  const [filterStatus, setFilterStatus] = useState<AppStatus | "All">("All");
  const [viewMode, setViewMode] = useState<"list" | "board">("board");
  const [showActive, setShowActive] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editJob, setEditJob] = useState<JobApplication | null>(null);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [showImportErrors, setShowImportErrors] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    return applications.filter((app) => {
      if (app.archived !== !showActive) return false;
      const matchSearch =
        app.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
        app.company.toLowerCase().includes(search.toLowerCase()) ||
        app.location.toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === "All" || app.jobType === filterType;
      const matchStatus = filterStatus === "All" || app.status === filterStatus;
      return matchSearch && matchType && matchStatus;
    });
  }, [applications, search, filterType, filterStatus, showActive]);

  const activeCount = useMemo(() => applications.filter((a) => !a.archived).length, [applications]);
  const archivedCount = useMemo(() => applications.filter((a) => a.archived).length, [applications]);

  const handleStatusChange = useCallback((id: string, status: AppStatus) => {
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  }, []);

  const handleEdit = useCallback((job: JobApplication) => {
    setEditJob(job);
    setShowModal(true);
  }, []);

  const handleArchive = useCallback((id: string) => {
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, archived: !a.archived } : a)));
  }, []);

  const handleDelete = useCallback((id: string) => {
    if (confirm("Are you sure you want to delete this application?")) {
      setApplications((prev) => prev.filter((a) => a.id !== id));
    }
  }, []);

  const handleSave = useCallback(
    (data: Omit<JobApplication, "id" | "archived"> & { id?: string }) => {
      if (data.id) {
        setApplications((prev) =>
          prev.map((a) => (a.id === data.id ? { ...a, ...data, id: a.id, archived: a.archived } : a))
        );
      } else {
        const newJob: JobApplication = { ...data, id: `app-${Date.now()}`, archived: false };
        setApplications((prev) => [newJob, ...prev]);
      }
      setShowModal(false);
      setEditJob(null);
    },
    []
  );

  const handleExportCSV = useCallback(() => {
    exportCSV(applications);
  }, [applications]);

  const handleImportCSV = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const { applications: imported, errors } = importCSVToApplications(text);
      if (errors.length > 0) {
        setImportErrors(errors);
        setShowImportErrors(true);
      }
      if (imported.length > 0) {
        const newApps: JobApplication[] = imported.map((a) => ({
          id: a.id || `import-${Date.now()}-${Math.random()}`,
          company: a.company || "Unknown",
          jobTitle: a.jobTitle || "Untitled",
          jobType: a.jobType || "Full-time",
          location: a.location || "",
          workMode: a.workMode || "On-site",
          jobUrl: a.jobUrl || "",
          applicationDate: a.applicationDate || new Date().toISOString().slice(0, 10),
          savedDate: a.savedDate || new Date().toISOString().slice(0, 10),
          status: a.status || "Saved",
          salary: a.salary || "",
          recruiterName: a.recruiterName || "",
          recruiterEmail: a.recruiterEmail || "",
          notes: a.notes || "",
          resumeUsed: a.resumeUsed || "",
          coverLetter: a.coverLetter || "",
          archived: a.archived || false,
        }));
        setApplications((prev) => [...newApps, ...prev]);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }, []);

  const handleArchiveAll = useCallback(() => {
    if (confirm("Archive all active applications?")) {
      setApplications((prev) => prev.map((a) => ({ ...a, archived: true })));
    }
  }, []);
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="mx-auto max-w-[1420px] px-4 sm:px-6 lg:px-10 py-10">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#2B26D9]">Career Dashboard</span>
              <h1 className="text-3xl font-black text-slate-900 sm:text-4xl">Application Tracker</h1>
              <p className="mt-1 text-sm sm:text-base text-slate-600">
                Track your active job applications, interview stages, and status updates in real-time.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500">
                Total Jobs: <span className="text-slate-900">{applications.length}</span>
              </span>
              <button
                onClick={() => { setEditJob(null); setShowModal(true); }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2B26D9] to-[#F96302] px-6 py-3 text-sm font-bold text-white shadow-md hover:opacity-95"
              >
                <Plus size={16} />
                Add Application
              </button>
            </div>
          </div>

          {/* Active / Archived Toggle */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
              <button
                onClick={() => setShowActive(true)}
                className={`rounded-lg px-4 py-2 text-xs font-bold transition ${showActive ? "bg-[#2B26D9] text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}
              >
                Active ({activeCount})
              </button>
              <button
                onClick={() => setShowActive(false)}
                className={`rounded-lg px-4 py-2 text-xs font-bold transition ${!showActive ? "bg-[#2B26D9] text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}
              >
                Archived ({archivedCount})
              </button>
            </div>
          </div>

          {/* Analytics */}
          <div className="mt-6">
            <AnalyticsSection applications={applications} />
          </div>

          {/* Controls Bar */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search size={16} className="absolute left-3.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search jobs, companies, locations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 focus:border-[#2B26D9] focus:outline-none shadow-sm"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as JobType | "All")}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 shadow-sm focus:border-[#2B26D9] focus:outline-none"
              >
                <option value="All">All Job Types</option>
                {JOB_TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as AppStatus | "All")}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 shadow-sm focus:border-[#2B26D9] focus:outline-none"
              >
                <option value="All">All Statuses</option>
                {STATUS_PIPELINE.map((s) => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleExportCSV} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition" title="Export CSV">
                <Download size={14} />
                Export
              </button>
              <button onClick={handleImportCSV} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition" title="Import CSV">
                <Upload size={14} />
                Import
              </button>
              <button onClick={handleArchiveAll} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition" title="Archive All">
                <Archive size={14} />
                Archive All
              </button>
              <div className="flex items-center rounded-xl border border-slate-200 bg-white p-0.5 shadow-sm">
                <button
                  onClick={() => setViewMode("board")}
                  className={`rounded-lg p-2 transition ${viewMode === "board" ? "bg-[#2B26D9] text-white" : "text-slate-500 hover:bg-slate-50"}`}
                  title="Board View"
                >
                  <LayoutGrid size={14} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`rounded-lg p-2 transition ${viewMode === "list" ? "bg-[#2B26D9] text-white" : "text-slate-500 hover:bg-slate-50"}`}
                  title="List View"
                >
                  <Filter size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Application Cards */}
          {viewMode === "board" ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onStatusChange={handleStatusChange}
                  onEdit={handleEdit}
                  onArchive={handleArchive}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-50/80 text-xs font-bold uppercase text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3">Role & Company</th>
                      <th className="px-5 py-3">Location</th>
                      <th className="px-5 py-3">Type</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Applied</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((job) => {
                      const cfg = STATUS_CONFIG[job.status];
                      const logoColor = getLogoColor(job.company);
                      const initials = getInitials(job.company);
                      return (
                        <tr key={job.id} className="hover:bg-slate-50/60 transition">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-xs font-black text-white ${logoColor}`}>
                                {initials}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 text-xs">{job.jobTitle}</div>
                                <div className="text-[10px] font-medium text-slate-500">{job.company}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-xs text-slate-500">{job.location}</td>
                          <td className="px-5 py-3">
                            <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">{job.jobType}</span>
                          </td>
                          <td className="px-5 py-3">
                            <StatusPipeline currentStatus={job.status} onStatusChange={(s) => handleStatusChange(job.id, s)} compact />
                          </td>
                          <td className="px-5 py-3 text-xs text-slate-500">{job.applicationDate}</td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => handleEdit(job)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#2B26D9] transition">
                                <Edit3 size={13} />
                              </button>
                              <button onClick={() => handleArchive(job.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition">
                                <Archive size={13} />
                              </button>
                              <button onClick={() => handleDelete(job.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty State */}
          {filtered.length === 0 && (
            <div className="mt-12 flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-2xl bg-slate-100 p-4 mb-4">
                <Briefcase size={32} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No applications found</h3>
              <p className="mt-1 text-sm text-slate-500">
                {search || filterType !== "All" || filterStatus !== "All"
                  ? "Try adjusting your filters or search terms."
                  : "Click 'Add Application' to start tracking your job applications."}
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <AddEditModal
          initial={editJob}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditJob(null); }}
        />
      )}

      {/* Import Errors Modal */}
      {showImportErrors && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Import Warnings</h3>
              <button onClick={() => setShowImportErrors(false)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 transition">
                <X size={18} />
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {importErrors.map((err, i) => (
                <div key={i} className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs font-medium text-amber-800">
                  {err}
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowImportErrors(false)}
              className="mt-4 w-full rounded-xl bg-[#2B26D9] px-4 py-2.5 text-sm font-bold text-white hover:opacity-95 transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Hidden file input for CSV import */}
      <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />

      <Footer />
    </div>
  );
}
