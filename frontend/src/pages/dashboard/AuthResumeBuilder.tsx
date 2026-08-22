import {
  Plus,
  Upload,
  Edit3,
  Download,
  ScanSearch,
  MoreHorizontal,
  CheckCircle2,
  Lightbulb,
  FileText,
} from "lucide-react";
import { mockResumes } from "../../data/mockData";

const checklist = [
  "Personal Information",
  "Professional Summary",
  "Work Experience",
  "Education",
  "Skills",
  "Projects",
  "Certifications",
  "Achievements",
  "Languages",
  "Portfolio / Links",
];

export default function AuthResumeBuilder() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Resume Builder</h1>
          <p className="mt-1 text-[15px] text-slate-500">
            Create a professional, ATS-friendly resume that gets you hired.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Create New Resume
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
            <Upload className="h-4 w-4" />
            Upload Resume
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* My Resumes */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">My Resumes</h2>
          <div className="space-y-3">
            {mockResumes.map((r) => (
              <div
                key={r.id}
                className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-slate-900">{r.name}</h3>
                    <p className="text-xs text-slate-500">Updated: {r.updatedAt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      r.atsScore >= 85
                        ? "bg-emerald-50 text-emerald-600"
                        : r.atsScore >= 75
                          ? "bg-amber-50 text-amber-600"
                          : "bg-red-50 text-red-600"
                    }`}
                  >
                    ATS {r.atsScore}%
                  </span>
                  <div className="flex items-center gap-1">
                    <button className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700" title="Edit">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700" title="Analyze">
                      <ScanSearch className="h-4 w-4" />
                    </button>
                    <button className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700" title="Download">
                      <Download className="h-4 w-4" />
                    </button>
                    <button className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700" title="More">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Checklist */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-[15px] font-semibold text-slate-900">Build Your Resume</h3>
            <ul className="space-y-2.5">
              {checklist.map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span className="text-sm text-slate-600">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ATS Tip */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-amber-600" />
              <h3 className="text-sm font-semibold text-amber-800">ATS Tip</h3>
            </div>
            <p className="text-sm leading-relaxed text-amber-700">
              Use relevant keywords from the job description to improve your ATS score. Match skills, job titles, and qualifications exactly as listed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
