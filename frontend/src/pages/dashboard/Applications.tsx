import { useState } from "react";
import {
  LayoutGrid,
  List,
  Briefcase,
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  Eye,
  Plus,
  Upload,
} from "lucide-react";

type AppStatus = "Applied" | "Screening" | "Interview" | "Offer" | "Rejected";

const statusConfig: Record<AppStatus, { color: string; bg: string; icon: any }> = {
  Applied: { color: "text-blue-600", bg: "bg-blue-50", icon: Clock },
  Screening: { color: "text-amber-600", bg: "bg-amber-50", icon: Eye },
  Interview: { color: "text-violet-600", bg: "bg-violet-50", icon: Briefcase },
  Offer: { color: "text-emerald-600", bg: "bg-emerald-50", icon: Award },
  Rejected: { color: "text-red-500", bg: "bg-red-50", icon: XCircle },
};

const kanbanColumns: AppStatus[] = ["Applied", "Screening", "Interview", "Offer"];

export default function Applications() {
  const [view, setView] = useState<"kanban" | "table">("kanban");

  const applications: any[] = [];

  const totals = {
    all: applications.length,
    Applied: applications.filter((a) => a.status === "Applied").length,
    Screening: applications.filter((a) => a.status === "Screening").length,
    Interview: applications.filter((a) => a.status === "Interview").length,
    Offer: applications.filter((a) => a.status === "Offer").length,
    Rejected: applications.filter((a) => a.status === "Rejected").length,
  };

  const metrics = [
    { label: "Total", value: totals.all, color: "text-slate-900", bg: "bg-slate-50" },
    { label: "Applied", value: totals.Applied, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Screening", value: totals.Screening, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Interviews", value: totals.Interview, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "Offers", value: totals.Offer, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Rejected", value: totals.Rejected, color: "text-red-500", bg: "bg-red-50" },
  ];

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
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50">
            <Upload className="h-3.5 w-3.5" />
            Import CSV
          </button>
          <button className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-blue-700">
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

      {/* Kanban View */}
      {view === "kanban" && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {kanbanColumns.map((status) => {
            const apps = applications.filter((a) => a.status === status);
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
                    <div
                      key={app.id}
                      className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-blue-200"
                    >
                      <h4 className="text-sm font-semibold text-slate-900">{app.company}</h4>
                      <p className="text-xs text-slate-500">{app.position}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">{app.appliedDate}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            app.atsScore >= 85
                              ? "bg-emerald-50 text-emerald-600"
                              : app.atsScore >= 75
                                ? "bg-amber-50 text-amber-600"
                                : "bg-red-50 text-red-500"
                          }`}
                        >
                          ATS {app.atsScore}%
                        </span>
                      </div>
                    </div>
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
      )}

      {/* Table View */}
      {view === "table" && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[700px] text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-slate-400">Company</th>
                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-slate-400">Position</th>
                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-slate-400">Applied Date</th>
                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-slate-400">Status</th>
                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-slate-400">ATS Score</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => {
                const cfg = statusConfig[app.status];
                return (
                  <tr
                    key={app.id}
                    className="border-b border-slate-50 transition-colors hover:bg-slate-50 cursor-pointer"
                  >
                    <td className="px-5 py-3.5 text-sm font-medium text-slate-800">{app.company}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{app.position}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">{app.appliedDate}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                        <cfg.icon className="h-3 w-3" />
                        {app.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-sm font-semibold ${
                          app.atsScore >= 85
                            ? "text-emerald-600"
                            : app.atsScore >= 75
                              ? "text-amber-600"
                              : "text-red-500"
                        }`}
                      >
                        {app.atsScore}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Empty State */}
          {applications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <Briefcase className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                No Applications Yet
              </h3>
              <p className="mt-2 max-w-sm text-center text-sm text-slate-500">
                Start tracking your job applications by adding your first application.
              </p>
              <div className="mt-5 flex items-center gap-3">
                <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50">
                  <Upload className="h-3.5 w-3.5" />
                  Import CSV
                </button>
                <button className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-blue-700">
                  <Plus className="h-3.5 w-3.5" />
                  Add Application
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
