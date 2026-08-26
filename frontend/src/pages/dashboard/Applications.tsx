import { useState, useEffect, useMemo, useCallback } from "react";
import {
  LayoutGrid,
  List,
  Briefcase,
  Clock,
  XCircle,
  Award,
  Eye,
  Plus,
  Upload,
  Search,
  MapPin,
  ChevronDown,
  X,
  ExternalLink,
  FileText,
  Loader2,
  AlertCircle,
  ArrowUpDown,
  ChevronUp,
  ChevronRight,
  Send,
} from "lucide-react";
import {
  jobApi,
  Application,
  ApplicationStatus,
} from "../../services/jobApi";

// ─── Status Mapping (API → UI) ──────────────────────────
type UiStatus = "Saved" | "Applied" | "Screening" | "Interview" | "Offer" | "Rejected";

const API_TO_UI: Record<ApplicationStatus, UiStatus> = {
  SAVED: "Saved",
  APPLIED: "Applied",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
  ACCEPTED: "Offer",
  WITHDRAWN: "Saved",
};

const STATUS_OPTIONS: ApplicationStatus[] = [
  "SAVED",
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "ACCEPTED",
  "WITHDRAWN",
];

const JOB_TYPE_OPTIONS = [
  "Full Time",
  "Part Time",
  "Internship",
  "Contract",
];

// ─── Status Config ──────────────────────────────────────
const statusConfig: Record<UiStatus, { color: string; bg: string; icon: any }> = {
  Saved: { color: "text-slate-600", bg: "bg-slate-100", icon: Eye },
  Applied: { color: "text-blue-600", bg: "bg-blue-50", icon: Clock },
  Screening: { color: "text-amber-600", bg: "bg-amber-50", icon: Eye },
  Interview: { color: "text-violet-600", bg: "bg-violet-50", icon: Briefcase },
  Offer: { color: "text-emerald-600", bg: "bg-emerald-50", icon: Award },
  Rejected: { color: "text-red-500", bg: "bg-red-50", icon: XCircle },
};

const kanbanColumns: UiStatus[] = ["Saved", "Applied", "Screening", "Interview", "Offer"];

// ─── Helpers ────────────────────────────────────────────
function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getMatchScoreColor(score: number | null | undefined): string {
  if (score === null || score === undefined) return "text-slate-400";
  if (score >= 85) return "text-emerald-600";
  if (score >= 75) return "text-amber-600";
  return "text-red-500";
}

function getMatchScoreBg(score: number | null | undefined): string {
  if (score === null || score === undefined) return "bg-slate-50 text-slate-400";
  if (score >= 85) return "bg-emerald-50 text-emerald-600";
  if (score >= 75) return "bg-amber-50 text-amber-600";
  return "bg-red-50 text-red-500";
}

// ─── Empty State Component ──────────────────────────────
function EmptyState({ onAddClick }: { onAddClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
        <Briefcase className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900">No Applications Yet</h3>
      <p className="mt-2 max-w-sm text-center text-sm text-slate-500">
        Start tracking your job applications by adding your first application.
      </p>
      <div className="mt-5 flex items-center gap-3">
        <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50">
          <Upload className="h-3.5 w-3.5" />
          Import CSV
        </button>
        <button
          onClick={onAddClick}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Application
        </button>
      </div>
    </div>
  );
}

// ─── Add Application Modal ──────────────────────────────
function AddApplicationModal({
  isOpen,
  onClose,
  onAdded,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [form, setForm] = useState({
    companyName: "",
    position: "",
    location: "",
    jobType: "Full Time",
    appliedDate: new Date().toISOString().split("T")[0],
    status: "APPLIED" as ApplicationStatus,
    notes: "",
    resumeUrl: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyName.trim() || !form.position.trim()) {
      setError("Company name and position are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await jobApi.addApplication({
        companyName: form.companyName,
        position: form.position,
        location: form.location || undefined,
        jobType: form.jobType || undefined,
        status: form.status,
        notes: form.notes || undefined,
        resumeUrl: form.resumeUrl || undefined,
        appliedDate: form.appliedDate || undefined,
      });
      if (res.success) {
        setForm({
          companyName: "",
          position: "",
          location: "",
          jobType: "Full Time",
          appliedDate: new Date().toISOString().split("T")[0],
          status: "APPLIED",
          notes: "",
          resumeUrl: "",
        });
        onAdded();
        onClose();
      } else {
        setError(res.message || "Failed to add application.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Add Application</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                placeholder="e.g. Google"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Position <span className="text-red-500">*</span>
              </label>
              <input
                name="position"
                value={form.position}
                onChange={handleChange}
                placeholder="e.g. Frontend Developer"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Location</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. San Francisco, CA"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Job Type</label>
              <select
                name="jobType"
                value={form.jobType}
                onChange={handleChange}
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              >
                {JOB_TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Applied Date</label>
              <input
                name="appliedDate"
                type="date"
                value={form.appliedDate}
                onChange={handleChange}
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Resume URL</label>
            <input
              name="resumeUrl"
              value={form.resumeUrl}
              onChange={handleChange}
              placeholder="https://..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Any notes about this application..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              Add Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Application Detail Panel ───────────────────────────
function DetailPanel({
  app,
  onClose,
  onStatusUpdate,
}: {
  app: Application;
  onClose: () => void;
  onStatusUpdate: (id: number, status: ApplicationStatus) => void;
}) {
  const uiStatus = API_TO_UI[app.status];
  const cfg = statusConfig[uiStatus];
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    setUpdating(true);
    try {
      await onStatusUpdate(app.id, newStatus);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm">
      <div className="h-full w-full max-w-lg overflow-y-auto border-l border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-slate-100 bg-white p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-slate-900 truncate">
                {app.job?.title || "Untitled Position"}
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                {app.job?.company?.name || "Unknown Company"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.color}`}>
              <cfg.icon className="h-3 w-3" />
              {uiStatus}
            </span>
            {app.atsMatchScore !== null && (
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getMatchScoreBg(app.atsMatchScore)}`}>
                ATS {app.atsMatchScore}%
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Job Info */}
          <section>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Job Details</h3>
            <div className="space-y-2.5">
              <InfoRow icon={Briefcase} label="Position" value={app.job?.title} />
              <InfoRow icon={Briefcase} label="Company" value={app.job?.company?.name} />
              <InfoRow icon={MapPin} label="Location" value={app.job?.location} />
              <InfoRow
                icon={Clock}
                label="Applied"
                value={formatDate(app.appliedAt)}
              />
              {app.job?.workMode && (
                <InfoRow icon={Eye} label="Work Mode" value={app.job.workMode} />
              )}
              {app.job?.jobType && (
                <InfoRow icon={FileText} label="Job Type" value={app.job.jobType} />
              )}
              {app.applicationMethod && (
                <InfoRow
                  icon={Send}
                  label="Method"
                  value={app.applicationMethod.replace("_", " ")}
                />
              )}
            </div>
          </section>

          {/* Skills */}
          {app.job?.skills && app.job.skills.length > 0 && (
            <section>
              <h3 className="mb-3 text-sm font-semibold text-slate-900">Required Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {app.job.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Resume */}
          {app.resumeUrl && (
            <section>
              <h3 className="mb-3 text-sm font-semibold text-slate-900">Resume Used</h3>
              <a
                href={app.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-slate-200 p-3 text-sm text-blue-600 transition-colors hover:bg-blue-50"
              >
                <FileText className="h-4 w-4" />
                View Resume
                <ExternalLink className="ml-auto h-3.5 w-3.5" />
              </a>
            </section>
          )}

          {/* Cover Letter */}
          {app.coverLetterUrl && (
            <section>
              <h3 className="mb-3 text-sm font-semibold text-slate-900">Cover Letter</h3>
              <a
                href={app.coverLetterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-slate-200 p-3 text-sm text-blue-600 transition-colors hover:bg-blue-50"
              >
                <FileText className="h-4 w-4" />
                View Cover Letter
                <ExternalLink className="ml-auto h-3.5 w-3.5" />
              </a>
            </section>
          )}

          {/* Notes */}
          {app.notes && (
            <section>
              <h3 className="mb-3 text-sm font-semibold text-slate-900">Notes</h3>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600 whitespace-pre-wrap">
                {app.notes}
              </div>
            </section>
          )}

          {/* Update Status */}
          <section>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Update Status</h3>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map((s) => {
                const uiSt = API_TO_UI[s];
                const stCfg = statusConfig[uiSt];
                const isActive = app.status === s;
                return (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    disabled={updating || isActive}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                      isActive
                        ? `${stCfg.bg} ${stCfg.color} border-transparent cursor-default`
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    } disabled:opacity-50`}
                  >
                    <stCfg.icon className="h-3 w-3" />
                    {uiSt}
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100">
        <Icon className="h-3.5 w-3.5 text-slate-500" />
      </div>
      <div>
        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-slate-800">{value}</p>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────
export default function Applications() {
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [detailApp, setDetailApp] = useState<Application | null>(null);

  // Table state
  const [sortField, setSortField] = useState<"company" | "position" | "appliedAt" | "status" | "atsMatchScore">("appliedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [tableFilter, setTableFilter] = useState("");

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await jobApi.getApplications({ page: '1', limit: '200' });
      if (res.success && res.data) {
        setApplications(res.data.applications || []);
      } else {
        setError(res.message || "Failed to load applications.");
      }
    } catch {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // ─── Metrics ─────────────────────────────────────────
  const totals = useMemo(() => {
    const all = applications.length;
    const counts: Record<UiStatus, number> = {
      Saved: 0,
      Applied: 0,
      Screening: 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0,
    };
    for (const app of applications) {
      const ui = API_TO_UI[app.status];
      if (ui in counts) counts[ui]++;
    }
    return { all, ...counts };
  }, [applications]);

  const metrics = [
    { label: "Total", value: totals.all, color: "text-slate-900", bg: "bg-slate-50" },
    { label: "Applied", value: totals.Applied, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Screening", value: totals.Screening, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Interviews", value: totals.Interview, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "Offers", value: totals.Offer, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Rejected", value: totals.Rejected, color: "text-red-500", bg: "bg-red-50" },
  ];

  // ─── Kanban groups ───────────────────────────────────
  const kanbanGroups = useMemo(() => {
    const groups: Record<UiStatus, Application[]> = {
      Saved: [],
      Applied: [],
      Screening: [],
      Interview: [],
      Offer: [],
      Rejected: [],
    };
    for (const app of applications) {
      const ui = API_TO_UI[app.status];
      if (ui in groups) groups[ui].push(app);
    }
    return groups;
  }, [applications]);

  // ─── Table data ──────────────────────────────────────
  const tableData = useMemo(() => {
    let data = [...applications];

    if (tableFilter) {
      const q = tableFilter.toLowerCase();
      data = data.filter(
        (a) =>
          a.job?.title?.toLowerCase().includes(q) ||
          a.job?.company?.name?.toLowerCase().includes(q) ||
          a.job?.location?.toLowerCase().includes(q)
      );
    }

    data.sort((a, b) => {
      let av: any;
      let bv: any;
      switch (sortField) {
        case "company":
          av = a.job?.company?.name || "";
          bv = b.job?.company?.name || "";
          break;
        case "position":
          av = a.job?.title || "";
          bv = b.job?.title || "";
          break;
        case "appliedAt":
          av = new Date(a.appliedAt).getTime();
          bv = new Date(b.appliedAt).getTime();
          break;
        case "status":
          av = a.status;
          bv = b.status;
          break;
        case "atsMatchScore":
          av = a.atsMatchScore ?? -1;
          bv = b.atsMatchScore ?? -1;
          break;
        default:
          return 0;
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return data;
  }, [applications, sortField, sortDir, tableFilter]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field)
      return <ArrowUpDown className="ml-1 h-3 w-3 text-slate-300" />;
    return sortDir === "asc" ? (
      <ChevronUp className="ml-1 h-3 w-3 text-blue-600" />
    ) : (
      <ChevronDown className="ml-1 h-3 w-3 text-blue-600" />
    );
  };

  // ─── Status update handler ───────────────────────────
  const handleStatusUpdate = async (id: number, newStatus: ApplicationStatus) => {
    const res = await jobApi.updateApplicationStatus(id, newStatus);
    if (res.success) {
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );
      if (detailApp && detailApp.id === id) {
        setDetailApp({ ...detailApp, status: newStatus });
      }
    }
  };

  const handleRefresh = () => {
    fetchApplications();
  };

  const isEmpty = !loading && applications.length === 0;
  const hasError = !loading && error;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Application Tracker</h1>
          <p className="mt-1 text-[15px] text-slate-500">
            Track and manage all your job applications in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {}}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
          >
            <Upload className="h-3.5 w-3.5" />
            Import CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Application
          </button>
          <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
            <button
              onClick={() => setView("kanban")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                view === "kanban"
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Kanban
            </button>
            <button
              onClick={() => setView("table")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                view === "table"
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
            <p className="mt-0.5 text-xs font-medium text-slate-500">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <p className="mt-3 text-sm text-slate-500">Loading applications...</p>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Failed to Load</h3>
          <p className="mt-2 max-w-sm text-center text-sm text-slate-500">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !hasError && isEmpty && (
        <EmptyState onAddClick={() => setShowAddModal(true)} />
      )}

      {/* Kanban View */}
      {!loading && !hasError && !isEmpty && view === "kanban" && (
        <div className="space-y-6">
          <div className="flex gap-4 overflow-x-auto pb-4">
            {kanbanColumns.map((status) => {
              const apps = kanbanGroups[status];
              const cfg = statusConfig[status];
              return (
                <div key={status} className="w-72 shrink-0">
                  <div className="mb-3 flex items-center gap-2">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-md ${cfg.bg}`}>
                      <cfg.icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-700">{status}</h3>
                    <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                      {apps.length}
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {apps.map((app) => (
                      <KanbanCard
                        key={app.id}
                        app={app}
                        onClick={() => setDetailApp(app)}
                      />
                    ))}
                    {apps.length === 0 && (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                        <p className="text-xs text-slate-400">No applications</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rejected Section */}
          {kanbanGroups.Rejected.length > 0 && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <div className={`flex h-6 w-6 items-center justify-center rounded-md ${statusConfig.Rejected.bg}`}>
                  <XCircle className={`h-3.5 w-3.5 ${statusConfig.Rejected.color}`} />
                </div>
                <h3 className="text-sm font-semibold text-slate-700">Rejected</h3>
                <span className="ml-auto rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-500">
                  {kanbanGroups.Rejected.length}
                </span>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {kanbanGroups.Rejected.map((app) => (
                  <div key={app.id} className="w-72 shrink-0">
                    <KanbanCard
                      app={app}
                      onClick={() => setDetailApp(app)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Table View */}
      {!loading && !hasError && !isEmpty && view === "table" && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* Table search */}
          <div className="border-b border-slate-100 p-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search applications..."
                value={tableFilter}
                onChange={(e) => setTableFilter(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <table className="w-full min-w-[800px] text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th
                  className="cursor-pointer px-5 py-3 text-xs font-medium uppercase tracking-wide text-slate-400 hover:text-slate-600"
                  onClick={() => toggleSort("company")}
                >
                  <span className="flex items-center">
                    Company <SortIcon field="company" />
                  </span>
                </th>
                <th
                  className="cursor-pointer px-5 py-3 text-xs font-medium uppercase tracking-wide text-slate-400 hover:text-slate-600"
                  onClick={() => toggleSort("position")}
                >
                  <span className="flex items-center">
                    Position <SortIcon field="position" />
                  </span>
                </th>
                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-slate-400">
                  Location
                </th>
                <th
                  className="cursor-pointer px-5 py-3 text-xs font-medium uppercase tracking-wide text-slate-400 hover:text-slate-600"
                  onClick={() => toggleSort("appliedAt")}
                >
                  <span className="flex items-center">
                    Applied Date <SortIcon field="appliedAt" />
                  </span>
                </th>
                <th
                  className="cursor-pointer px-5 py-3 text-xs font-medium uppercase tracking-wide text-slate-400 hover:text-slate-600"
                  onClick={() => toggleSort("atsMatchScore")}
                >
                  <span className="flex items-center">
                    Match Score <SortIcon field="atsMatchScore" />
                  </span>
                </th>
                <th
                  className="cursor-pointer px-5 py-3 text-xs font-medium uppercase tracking-wide text-slate-400 hover:text-slate-600"
                  onClick={() => toggleSort("status")}
                >
                  <span className="flex items-center">
                    Status <SortIcon field="status" />
                  </span>
                </th>
                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-slate-400">
                  Method
                </th>
                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((app) => {
                const uiStatus = API_TO_UI[app.status];
                const cfg = statusConfig[uiStatus];
                return (
                  <tr
                    key={app.id}
                    className="border-b border-slate-50 transition-colors hover:bg-slate-50 cursor-pointer"
                    onClick={() => setDetailApp(app)}
                  >
                    <td className="px-5 py-3.5 text-sm font-medium text-slate-800">
                      {app.job?.company?.name || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">
                      {app.job?.title || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">
                      {app.job?.location || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">
                      {formatDate(app.appliedAt)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-sm font-semibold ${getMatchScoreColor(app.atsMatchScore)}`}
                      >
                        {app.atsMatchScore != null ? `${app.atsMatchScore}%` : "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.color}`}
                      >
                        <cfg.icon className="h-3 w-3" />
                        {uiStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-500 capitalize">
                      {app.applicationMethod?.replace("_", " ") || "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDetailApp(app);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {tableData.length === 0 && applications.length > 0 && (
            <div className="py-10 text-center">
              <p className="text-sm text-slate-500">No applications match your search.</p>
            </div>
          )}
        </div>
      )}

      {/* Add Application Modal */}
      <AddApplicationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdded={handleRefresh}
      />

      {/* Detail Panel */}
      {detailApp && (
        <DetailPanel
          app={detailApp}
          onClose={() => setDetailApp(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}

// ─── Kanban Card ────────────────────────────────────────
function KanbanCard({
  app,
  onClick,
}: {
  app: Application;
  onClick: () => void;
}) {
  const uiStatus = API_TO_UI[app.status];
  const cfg = statusConfig[uiStatus];

  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-blue-200"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-slate-900 truncate">
            {app.job?.title || "Untitled"}
          </h4>
          <p className="text-xs text-slate-500 truncate">
            {app.job?.company?.name || "Unknown"}
          </p>
        </div>
        {app.atsMatchScore != null && (
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${getMatchScoreBg(app.atsMatchScore)}`}
          >
            ATS {app.atsMatchScore}%
          </span>
        )}
      </div>
      {app.job?.location && (
        <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
          <MapPin className="h-3 w-3" />
          {app.job.location}
        </div>
      )}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">{formatDate(app.appliedAt)}</span>
        <span
          className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${cfg.bg} ${cfg.color}`}
        >
          <cfg.icon className="h-2.5 w-2.5" />
          {uiStatus}
        </span>
      </div>
    </div>
  );
}
