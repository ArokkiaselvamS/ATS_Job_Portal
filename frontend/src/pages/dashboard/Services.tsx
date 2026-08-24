import { useState, useCallback } from "react";
import {
  FileCheck,
  ScanSearch,
  MessageCircle,
  Eye,
  Video,
  FilePen,
  Linkedin,
  BarChart3,
  SearchIcon,
  ArrowRight,
  ArrowLeft,
  Upload,
  CheckCircle2,
  Clock,
  Star,
  Calendar,
  Send,
  Download,
  Sparkles,
  Target,
  TrendingUp,
  AlertCircle,
  X,
  ChevronRight,
} from "lucide-react";
import { mockServices } from "../../data/mockData";

const iconMap: Record<string, any> = {
  "file-check": FileCheck,
  "scan-search": ScanSearch,
  "message-circle": MessageCircle,
  eye: Eye,
  video: Video,
  "file-pen": FilePen,
  linkedin: Linkedin,
  "bar-chart-3": BarChart3,
  search: SearchIcon,
};

// ── Shared back button + breadcrumb ──
function WorkflowHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Services
        </button>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-slate-700 font-medium">{title}</span>
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        {title}
      </h1>
    </div>
  );
}

// ═══════════════════════════════════════
//  1. Resume Optimization
// ═══════════════════════════════════════
function ResumeOptimization({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<"input" | "processing" | "result">("input");
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [progress, setProgress] = useState(0);

  const handleOptimize = () => {
    if (!resumeText.trim() || !jobDescription.trim()) return;
    setStep("processing");
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setStep("result"), 400);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 300);
  };

  if (step === "processing") {
    return (
      <div className="space-y-6">
        <WorkflowHeader title="Resume Optimization" onBack={onBack} />
        <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
            <Sparkles className="h-8 w-8 text-blue-600 animate-pulse" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Optimizing Your Resume
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            AI is analyzing and improving your resume for the target role...
          </p>
          <div className="mx-auto max-w-md">
            <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-400 font-medium">
              {Math.min(Math.round(progress), 100)}% complete
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (step === "result") {
    return (
      <div className="space-y-6">
        <WorkflowHeader title="Resume Optimization" onBack={onBack} />
        <div className="rounded-2xl border border-emerald-200/80 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Optimization Complete
              </h3>
              <p className="text-sm text-slate-500">
                Your resume has been enhanced for better ATS compatibility
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="rounded-xl border border-slate-100 bg-[#F8FAFC] p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">78%</p>
              <p className="text-xs text-slate-500 mt-1">Original Score</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-[#F8FAFC] p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">94%</p>
              <p className="text-xs text-slate-500 mt-1">Optimized Score</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-[#F8FAFC] p-4 text-center">
              <p className="text-2xl font-bold text-indigo-600">+16%</p>
              <p className="text-xs text-slate-500 mt-1">Improvement</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-800">
              Key Improvements Made
            </h4>
            {[
              "Added quantifiable metrics to achievement bullets",
              "Optimized keywords for target job description",
              "Improved action verbs and professional tone",
              "Restructured experience section for ATS parsing",
              "Added relevant technical skills from job posting",
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 rounded-lg bg-emerald-50/60 px-3 py-2.5"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-700">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors">
              <Download className="h-4 w-4" />
              Download Optimized Resume
            </button>
            <button
              onClick={() => setStep("input")}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Optimize Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WorkflowHeader title="Resume Optimization" onBack={onBack} />
      <p className="text-sm text-slate-500 -mt-4">
        Paste your resume and the target job description to get AI-powered
        optimizations.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">
            Your Resume
          </h3>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume content here..."
            rows={10}
            className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-3.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 resize-none"
          />
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">
            Target Job Description
          </h3>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description you're targeting..."
            rows={10}
            className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-3.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 resize-none"
          />
        </div>
      </div>
      <button
        onClick={handleOptimize}
        disabled={!resumeText.trim() || !jobDescription.trim()}
        className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
      >
        <Sparkles className="h-4 w-4" />
        Optimize Resume
      </button>
    </div>
  );
}

// ═══════════════════════════════════════
//  2. ATS Resume Analysis
// ═══════════════════════════════════════
function ATSResumeAnalysis({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<"upload" | "scanning" | "result">("upload");
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFile = (file: File) => {
    setFileName(file.name);
    setStep("scanning");
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setStep("result"), 500);
          return 100;
        }
        return prev + Math.random() * 12 + 4;
      });
    }, 250);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0)
      handleFile(e.target.files[0]);
  };

  if (step === "scanning") {
    return (
      <div className="space-y-6">
        <WorkflowHeader title="ATS Resume Analysis" onBack={onBack} />
        <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
            <ScanSearch className="h-8 w-8 text-indigo-600 animate-pulse" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">
            Scanning "{fileName}"
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            Analyzing ATS compatibility, keywords, and formatting...
          </p>
          <div className="mx-auto max-w-md">
            <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-400 font-medium">
              {Math.min(Math.round(progress), 100)}% scanned
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (step === "result") {
    const score = 85;
    const sections = [
      { name: "Contact Information", score: 100, status: "pass" },
      { name: "Work Experience", score: 90, status: "pass" },
      { name: "Skills Keywords", score: 75, status: "warn" },
      { name: "Education", score: 95, status: "pass" },
      { name: "Formatting", score: 80, status: "pass" },
      { name: "Quantifiable Achievements", score: 60, status: "warn" },
    ];

    return (
      <div className="space-y-6">
        <WorkflowHeader title="ATS Resume Analysis" onBack={onBack} />
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-6">
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4 border-emerald-200 bg-emerald-50">
              <span className="text-3xl font-bold text-emerald-700">
                {score}%
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                ATS Compatibility Score
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Your resume "{fileName}" scores well but has room for
                improvement.
              </p>
              <span className="mt-2 inline-block rounded-full bg-emerald-50 border border-emerald-200 px-3 py-0.5 text-xs font-medium text-emerald-700">
                Good — Likely to pass ATS filters
              </span>
            </div>
          </div>

          <h4 className="text-sm font-semibold text-slate-800 mb-3">
            Section Breakdown
          </h4>
          <div className="space-y-3">
            {sections.map((s) => (
              <div
                key={s.name}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-[#F8FAFC] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  {s.status === "pass" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  )}
                  <span className="text-sm font-medium text-slate-700">
                    {s.name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${s.score >= 80 ? "bg-emerald-500" : "bg-amber-500"}`}
                      style={{ width: `${s.score}%` }}
                    />
                  </div>
                  <span
                    className={`text-xs font-semibold ${s.score >= 80 ? "text-emerald-600" : "text-amber-600"}`}
                  >
                    {s.score}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setStep("upload")}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              <Upload className="h-4 w-4" />
              Analyze Another Resume
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WorkflowHeader title="ATS Resume Analysis" onBack={onBack} />
      <p className="text-sm text-slate-500 -mt-4">
        Upload your resume to check its ATS compatibility score.
      </p>
      <div
        className={`rounded-2xl border-2 border-dashed ${dragOver ? "border-blue-400 bg-blue-50/50" : "border-slate-200 bg-white"} p-12 shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-center transition-colors`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
          <Upload className="h-6 w-6 text-slate-500" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-1">
          Drop your resume here
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          Supports PDF, DOCX, and TXT files (Max 5MB)
        </p>
        <label className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors cursor-pointer">
          <Upload className="h-4 w-4" />
          Browse Files
          <input
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            onChange={handleFileInput}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
//  3. Career Consultation
// ═══════════════════════════════════════
function CareerConsultation({ onBack }: { onBack: () => void }) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [booked, setBooked] = useState(false);

  const availableDates = [
    "Mon, Aug 25",
    "Tue, Aug 26",
    "Wed, Aug 27",
    "Thu, Aug 28",
    "Fri, Aug 29",
  ];
  const timeSlots = [
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
  ];

  const handleBook = () => {
    if (selectedDate && selectedTime) setBooked(true);
  };

  if (booked) {
    return (
      <div className="space-y-6">
        <WorkflowHeader title="Career Consultation" onBack={onBack} />
        <div className="rounded-2xl border border-emerald-200/80 bg-white p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">
            Session Booked!
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            Your career consultation has been confirmed.
          </p>
          <div className="inline-flex items-center gap-4 rounded-xl border border-slate-100 bg-[#F8FAFC] px-6 py-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-slate-800">
                {selectedDate}
              </span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-slate-800">
                {selectedTime}
              </span>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            A confirmation email has been sent. You can reschedule up to 24
            hours before.
          </p>
          <button
            onClick={() => {
              setBooked(false);
              setSelectedDate("");
              setSelectedTime("");
            }}
            className="mt-5 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Book Another Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WorkflowHeader title="Career Consultation" onBack={onBack} />
      <p className="text-sm text-slate-500 -mt-4">
        Book a 1-on-1 session with an industry career professional.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            Select a Date
          </h3>
          <div className="space-y-2">
            {availableDates.map((date) => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`w-full rounded-xl border px-4 py-3 text-sm font-medium text-left transition-all ${selectedDate === date ? "border-blue-500 bg-blue-50 text-blue-700 shadow-[0_0_0_3px_rgba(59,130,246,0.1)]" : "border-slate-200 bg-[#F8FAFC] text-slate-700 hover:bg-slate-100"}`}
              >
                {date}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            Select a Time
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {timeSlots.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${selectedTime === time ? "border-blue-500 bg-blue-50 text-blue-700 shadow-[0_0_0_3px_rgba(59,130,246,0.1)]" : "border-slate-200 bg-[#F8FAFC] text-slate-700 hover:bg-slate-100"}`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      </div>
      <button
        onClick={handleBook}
        disabled={!selectedDate || !selectedTime}
        className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
      >
        <CheckCircle2 className="h-4 w-4" />
        Confirm Booking
      </button>
    </div>
  );
}

// ═══════════════════════════════════════
//  4. Resume Review
// ═══════════════════════════════════════
function ResumeReview({ onBack }: { onBack: () => void }) {
  const [notes, setNotes] = useState("");
  const [fileName, setFileName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0)
      setFileName(e.target.files[0].name);
  };

  const handleSubmit = () => {
    if (fileName) setSubmitted(true);
  };

  const mockRequests = [
    {
      id: 1,
      name: "Software_Engineer_Resume.pdf",
      date: "Aug 22, 2026",
      status: "Completed",
      reviewer: "Sarah Chen",
    },
    {
      id: 2,
      name: "FullStack_Dev_Resume.docx",
      date: "Aug 20, 2026",
      status: "In Review",
      reviewer: "Assigned",
    },
  ];

  return (
    <div className="space-y-6">
      <WorkflowHeader title="Resume Review" onBack={onBack} />
      <p className="text-sm text-slate-500 -mt-4">
        Submit your resume for expert human review and feedback.
      </p>

      {submitted && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>
            Your resume "{fileName}" has been submitted for review. You'll
            receive feedback within 48 hours.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">
            Submit for Review
          </h3>
          <label className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-[#F8FAFC] p-6 cursor-pointer hover:border-blue-300 transition-colors">
            <Upload className="h-6 w-6 text-slate-400" />
            <span className="text-sm text-slate-600 font-medium">
              {fileName || "Choose resume file"}
            </span>
            <input
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={handleFileInput}
              className="hidden"
            />
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any specific areas you'd like feedback on? (Optional)"
            rows={3}
            className="mt-3 w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 resize-none"
          />
          <button
            onClick={handleSubmit}
            disabled={!fileName}
            className="mt-3 flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
            Submit for Review
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">
            Your Review Requests
          </h3>
          <div className="space-y-3">
            {mockRequests.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-[#F8FAFC] px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {r.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {r.date} · Reviewer: {r.reviewer}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium border ${r.status === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-200/60" : "bg-amber-50 text-amber-700 border-amber-200/60"}`}
                >
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
//  5. Interview Preparation
// ═══════════════════════════════════════
function InterviewPreparation({ onBack }: { onBack: () => void }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  const questions = [
    {
      q: "How do you handle conflict in a team environment?",
      type: "text" as const,
      tip: "Use the STAR method: Situation, Task, Action, Result",
    },
    {
      q: "What is the difference between REST and GraphQL?",
      type: "choice" as const,
      options: [
        "REST is newer than GraphQL",
        "GraphQL allows clients to request exactly the data they need",
        "REST supports real-time subscriptions natively",
        "They are the same technology with different names",
      ],
      correct: 1,
    },
    {
      q: "Describe a time you led a project under tight deadlines.",
      type: "text" as const,
      tip: "Highlight prioritization, communication, and outcome",
    },
    {
      q: "Which data structure is best for implementing a priority queue?",
      type: "choice" as const,
      options: ["Array", "Linked List", "Heap", "Hash Table"],
      correct: 2,
    },
    {
      q: "Where do you see yourself in 5 years?",
      type: "text" as const,
      tip: "Align your answer with the company's growth trajectory",
    },
  ];

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((prev) => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  if (showResults) {
    const choiceQs = questions.filter((q) => q.type === "choice");
    const correctCount = choiceQs.filter((q) => {
      const origIdx = questions.indexOf(q);
      return answers[origIdx] === String(q.correct);
    }).length;
    const totalScore = Math.round(
      ((correctCount / choiceQs.length) * 50 +
        (Object.keys(answers).length / questions.length) * 50)
    );

    return (
      <div className="space-y-6">
        <WorkflowHeader title="Interview Preparation" onBack={onBack} />
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="text-center mb-6">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-4 border-blue-200 bg-blue-50">
              <span className="text-2xl font-bold text-blue-700">
                {totalScore}%
              </span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              Mock Interview Complete
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              You answered {Object.keys(answers).length} of {questions.length}{" "}
              questions
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-800">
              Coaching Feedback
            </h4>
            {[
              "Practice structuring your behavioral answers with STAR method",
              "Your technical knowledge shows a strong foundation",
              "Consider adding more specific metrics to your project stories",
              "Great job completing the full mock session!",
            ].map((tip, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 rounded-lg bg-blue-50/60 px-3 py-2.5"
              >
                <Star className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-700">{tip}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              setCurrentQ(0);
              setAnswers({});
              setShowResults(false);
            }}
            className="mt-5 flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            Practice Again
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div className="space-y-6">
      <WorkflowHeader title="Interview Preparation" onBack={onBack} />
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
            Question {currentQ + 1} of {questions.length}
          </span>
          <span className="text-xs text-slate-400">
            {q.type === "choice" ? "Multiple Choice" : "Open Response"}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-100 mb-5 overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-300"
            style={{
              width: `${((currentQ + 1) / questions.length) * 100}%`,
            }}
          />
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-4">{q.q}</h3>

        {q.type === "choice" && q.options ? (
          <div className="space-y-2 mb-4">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() =>
                  setAnswers((prev) => ({
                    ...prev,
                    [currentQ]: String(i),
                  }))
                }
                className={`w-full text-left rounded-xl border px-4 py-3 text-sm font-medium transition-all ${answers[currentQ] === String(i) ? "border-blue-500 bg-blue-50 text-blue-700 shadow-[0_0_0_3px_rgba(59,130,246,0.1)]" : "border-slate-200 bg-[#F8FAFC] text-slate-700 hover:bg-slate-100"}`}
              >
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <div className="mb-4">
            {q.tip && (
              <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2 mb-3 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5" />
                Tip: {q.tip}
              </p>
            )}
            <textarea
              value={answers[currentQ] || ""}
              onChange={(e) =>
                setAnswers((prev) => ({
                  ...prev,
                  [currentQ]: e.target.value,
                }))
              }
              placeholder="Type your answer here..."
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-3.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 resize-none"
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentQ((p) => Math.max(0, p - 1))}
            disabled={currentQ === 0}
            className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Previous
          </button>
          <button
            onClick={handleNext}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            {currentQ === questions.length - 1 ? "View Results" : "Next"}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
//  6. Cover Letter Builder
// ═══════════════════════════════════════
function CoverLetterBuilder({ onBack }: { onBack: () => void }) {
  const [formData, setFormData] = useState({
    jobTitle: "",
    company: "",
    achievements: "",
    tone: "professional",
  });
  const [generated, setGenerated] = useState(false);

  const coverLetterTemplate = `Dear Hiring Manager,

I am writing to express my strong interest in the ${formData.jobTitle || "[Job Title]"} position at ${formData.company || "[Company]"}. With a proven track record in delivering results, I am confident in my ability to contribute meaningfully to your team.

${formData.achievements ? `Key achievements that demonstrate my qualifications include:\n${formData.achievements.split("\n").map((a) => `• ${a.trim()}`).filter(Boolean).join("\n")}` : "Throughout my career, I have consistently demonstrated a strong commitment to excellence and innovation."}

I am particularly drawn to ${formData.company || "[Company]"}'s mission and values, and I am excited about the opportunity to bring my skills and experience to your organization.

I would welcome the opportunity to discuss how my background and skills would be an asset to your team. Thank you for your time and consideration.

Sincerely,
[Your Name]`;

  const handleGenerate = () => {
    if (formData.jobTitle.trim() && formData.company.trim()) {
      setGenerated(true);
    }
  };

  if (generated) {
    return (
      <div className="space-y-6">
        <WorkflowHeader title="Cover Letter Builder" onBack={onBack} />
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-800">
              Generated Cover Letter
            </h3>
            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-medium">
              Editable
            </span>
          </div>
          <textarea
            defaultValue={coverLetterTemplate}
            rows={16}
            className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-5 py-4 text-sm text-slate-800 leading-relaxed outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 resize-none font-[system-ui]"
          />
          <div className="mt-4 flex gap-3">
            <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors">
              <Download className="h-4 w-4" />
              Download as PDF
            </button>
            <button
              onClick={() => {
                setGenerated(false);
                setFormData({
                  jobTitle: "",
                  company: "",
                  achievements: "",
                  tone: "professional",
                });
              }}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Create Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WorkflowHeader title="Cover Letter Builder" onBack={onBack} />
      <p className="text-sm text-slate-500 -mt-4">
        Generate a tailored cover letter for your target role.
      </p>
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">
              Job Title *
            </label>
            <input
              type="text"
              value={formData.jobTitle}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, jobTitle: e.target.value }))
              }
              placeholder="e.g., Senior Frontend Developer"
              className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">
              Company Name *
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, company: e.target.value }))
              }
              placeholder="e.g., Google"
              className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">
              Key Achievements (one per line)
            </label>
            <textarea
              value={formData.achievements}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  achievements: e.target.value,
                }))
              }
              placeholder={"e.g., Led team of 8 to deliver product 2 weeks early\nIncreased conversion rate by 35%"}
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-3.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 resize-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">
              Tone
            </label>
            <div className="flex gap-2">
              {["professional", "friendly", "confident"].map((tone) => (
                <button
                  key={tone}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, tone }))
                  }
                  className={`rounded-xl border px-4 py-2 text-sm font-medium capitalize transition-all ${formData.tone === tone ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-[#F8FAFC] text-slate-600 hover:bg-slate-100"}`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={!formData.jobTitle.trim() || !formData.company.trim()}
          className="mt-5 flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          <FilePen className="h-4 w-4" />
          Generate Cover Letter
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
//  7. LinkedIn Optimization
// ═══════════════════════════════════════
function LinkedInOptimization({ onBack }: { onBack: () => void }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const sections = [
    {
      id: "headline",
      title: "Profile Headline",
      description:
        "Your headline appears in search results. Use keywords and your value proposition.",
      template:
        "Senior [Role] | [Key Skill] | [Industry] | Helping [Target Audience] achieve [Goal]",
      tips: [
        "Include your top 2-3 skills or specializations",
        "Use industry-specific keywords for search visibility",
        "Highlight your unique value proposition",
      ],
    },
    {
      id: "summary",
      title: "About / Summary",
      description:
        "Your summary is your elevator pitch. Tell your professional story.",
      template:
        "With [X] years of experience in [Industry], I specialize in [Key Skills]. I've [Key Achievement]. I'm passionate about [Interest/Goal] and currently [What You're Doing Now].",
      tips: [
        "Keep it under 2,000 characters",
        "Start with a compelling hook",
        "Include a call-to-action at the end",
      ],
    },
    {
      id: "experience",
      title: "Experience Descriptions",
      description: "Make each role entry impactful with metrics and results.",
      template:
        "[Action Verb] [Task/Project] resulting in [Quantifiable Result] using [Technology/Method]",
      tips: [
        "Lead with action verbs",
        "Include numbers and percentages",
        "Mirror keywords from target job descriptions",
      ],
    },
    {
      id: "skills",
      title: "Skills & Endorsements",
      description: "Select skills that match your target roles.",
      template: "Pin your top 3 most relevant skills for maximum visibility",
      tips: [
        "Reorder to pin most relevant skills first",
        "Request endorsements from colleagues",
        "Add at least 10 relevant skills",
      ],
    },
    {
      id: "photo",
      title: "Profile Photo & Banner",
      description: "Professional photos increase profile views by 21x.",
      template:
        "Use a high-quality headshot with solid/simple background and professional attire",
      tips: [
        "Your face should fill 60% of the frame",
        "Use a custom banner related to your field",
        "Smile — approachable photos get more engagement",
      ],
    },
  ];

  const completedCount = Object.values(checked).filter(Boolean).length;
  const progressPct = Math.round((completedCount / sections.length) * 100);

  return (
    <div className="space-y-6">
      <WorkflowHeader title="LinkedIn Optimization" onBack={onBack} />
      <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-[3px] border-blue-200 bg-blue-50">
          <span className="text-lg font-bold text-blue-700">{progressPct}%</span>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-slate-900">
            Profile Optimization Progress
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {completedCount} of {sections.length} sections optimized
          </p>
          <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <div
            key={section.id}
            className={`rounded-2xl border bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-colors ${checked[section.id] ? "border-emerald-200/80" : "border-slate-200/80"}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {section.title}
                  </h3>
                  {checked[section.id] && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  )}
                </div>
                <p className="text-xs text-slate-500">{section.description}</p>
              </div>
              <button
                onClick={() =>
                  setChecked((prev) => ({
                    ...prev,
                    [section.id]: !prev[section.id],
                  }))
                }
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${checked[section.id] ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {checked[section.id] ? "✓ Done" : "Mark Done"}
              </button>
            </div>
            <div className="mt-3 rounded-lg bg-slate-50 border border-slate-100 p-3">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Template
              </p>
              <p className="text-sm text-slate-700 italic">
                "{section.template}"
              </p>
            </div>
            <div className="mt-3 space-y-1.5">
              {section.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-600">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
//  8. Skill Assessment
// ═══════════════════════════════════════
function SkillAssessment({ onBack }: { onBack: () => void }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const questions = [
    {
      q: "Rate your proficiency with JavaScript/TypeScript",
      options: ["Beginner", "Intermediate", "Advanced", "Expert"],
      category: "Technical",
    },
    {
      q: "How comfortable are you with system design?",
      options: ["Need guidance", "Can handle simple designs", "Design moderately complex systems", "Design distributed architectures"],
      category: "Technical",
    },
    {
      q: "Rate your project management skills",
      options: ["Learning", "Can manage small tasks", "Lead small teams", "Lead cross-functional teams"],
      category: "Soft Skills",
    },
    {
      q: "How would you describe your communication skills?",
      options: ["Developing", "Good in small groups", "Strong presenter", "Executive communication"],
      category: "Soft Skills",
    },
    {
      q: "Rate your data structures & algorithms knowledge",
      options: ["Basic understanding", "Can solve medium problems", "Strong problem solver", "Competition level"],
      category: "Technical",
    },
  ];

  const handleAnswer = (optionIdx: number) => {
    setAnswers((prev) => ({ ...prev, [currentQ]: optionIdx }));
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((p) => p + 1);
    } else {
      setShowResults(true);
    }
  };

  if (showResults) {
    const avgScore = Object.values(answers).reduce((a, b) => a + b, 0);
    const maxScore = questions.length * 3;
    const percentage = Math.round((avgScore / maxScore) * 100);

    const technical = questions
      .map((q, i) => (q.category === "Technical" ? answers[i] ?? 0 : null))
      .filter((v) => v !== null) as number[];
    const soft = questions
      .map((q, i) => (q.category === "Soft Skills" ? answers[i] ?? 0 : null))
      .filter((v) => v !== null) as number[];

    const techAvg = Math.round(
      (technical.reduce((a, b) => a + b, 0) / (technical.length * 3)) * 100
    );
    const softAvg = Math.round(
      (soft.reduce((a, b) => a + b, 0) / (soft.length * 3)) * 100
    );

    return (
      <div className="space-y-6">
        <WorkflowHeader title="Skill Assessment" onBack={onBack} />
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="text-center mb-6">
            <div className="mx-auto mb-4 relative">
              <div className="flex h-24 w-24 mx-auto items-center justify-center rounded-full border-4 border-indigo-200 bg-indigo-50">
                <span className="text-2xl font-bold text-indigo-700">
                  {percentage}%
                </span>
              </div>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1">
                <Target className="h-3.5 w-3.5 text-indigo-600" />
                <span className="text-xs font-semibold text-indigo-700">
                  Assessment Complete
                </span>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              Your Skill Profile
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="rounded-xl border border-slate-100 bg-[#F8FAFC] p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Technical Skills
              </p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-blue-600">
                  {techAvg}%
                </span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{ width: `${techAvg}%` }}
                />
              </div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-[#F8FAFC] p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Soft Skills
              </p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-violet-600">
                  {softAvg}%
                </span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-violet-500"
                  style={{ width: `${softAvg}%` }}
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setCurrentQ(0);
              setAnswers({});
              setShowResults(false);
            }}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            Retake Assessment
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div className="space-y-6">
      <WorkflowHeader title="Skill Assessment" onBack={onBack} />
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            Question {currentQ + 1} of {questions.length}
          </span>
          <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-medium">
            {q.category}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-100 mb-5 overflow-hidden">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all duration-300"
            style={{
              width: `${((currentQ + 1) / questions.length) * 100}%`,
            }}
          />
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-4">{q.q}</h3>
        <div className="space-y-2 mb-5">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              className={`w-full text-left rounded-xl border px-4 py-3 text-sm font-medium transition-all ${answers[currentQ] === i ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-[0_0_0_3px_rgba(99,102,241,0.1)]" : "border-slate-200 bg-[#F8FAFC] text-slate-700 hover:bg-slate-100"}`}
            >
              {opt}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentQ((p) => Math.max(0, p - 1))}
            disabled={currentQ === 0}
            className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={answers[currentQ] === undefined}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            {currentQ === questions.length - 1 ? "View Results" : "Next"}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
//  9. Job Search Assistance
// ═══════════════════════════════════════
function JobSearchAssistance({ onBack }: { onBack: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    location: "",
    experience: "",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (formData.name && formData.email && formData.role) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="space-y-6">
        <WorkflowHeader title="Job Search Assistance" onBack={onBack} />
        <div className="rounded-2xl border border-emerald-200/80 bg-white p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">
            Request Submitted!
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Our placement team will review your details and get in touch within
            24-48 hours with personalized job listings.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setFormData({
                name: "",
                email: "",
                role: "",
                location: "",
                experience: "",
                notes: "",
              });
            }}
            className="mt-5 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WorkflowHeader title="Job Search Assistance" onBack={onBack} />
      <p className="text-sm text-slate-500 -mt-4">
        Get personalized job search support from our placement team.
      </p>
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="John Doe"
              className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="john@example.com"
              className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">
              Target Role *
            </label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, role: e.target.value }))
              }
              placeholder="e.g., Full Stack Developer"
              className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">
              Preferred Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, location: e.target.value }))
              }
              placeholder="e.g., Remote, Bangalore"
              className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">
              Years of Experience
            </label>
            <select
              value={formData.experience}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  experience: e.target.value,
                }))
              }
              className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            >
              <option value="">Select...</option>
              <option value="0-1">0-1 years</option>
              <option value="1-3">1-3 years</option>
              <option value="3-5">3-5 years</option>
              <option value="5-10">5-10 years</option>
              <option value="10+">10+ years</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="text-sm font-medium text-slate-700 block mb-1.5">
            Additional Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, notes: e.target.value }))
            }
            placeholder="Any specific preferences, salary expectations, or questions..."
            rows={3}
            className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-3.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 resize-none"
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={!formData.name || !formData.email || !formData.role}
          className="mt-5 flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
          Submit Request
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
//  MAIN SERVICES PAGE
// ═══════════════════════════════════════
export default function Services() {
  const [activeWorkflow, setActiveWorkflow] = useState<number | null>(null);

  const workflowMap: Record<number, (onBack: () => void) => React.ReactNode> = {
    1: (onBack) => <ResumeOptimization onBack={onBack} />,
    2: (onBack) => <ATSResumeAnalysis onBack={onBack} />,
    3: (onBack) => <CareerConsultation onBack={onBack} />,
    4: (onBack) => <ResumeReview onBack={onBack} />,
    5: (onBack) => <InterviewPreparation onBack={onBack} />,
    6: (onBack) => <CoverLetterBuilder onBack={onBack} />,
    7: (onBack) => <LinkedInOptimization onBack={onBack} />,
    8: (onBack) => <SkillAssessment onBack={onBack} />,
    9: (onBack) => <JobSearchAssistance onBack={onBack} />,
  };

  // If a workflow is active, render it
  if (activeWorkflow !== null && workflowMap[activeWorkflow]) {
    return (
      <div className="space-y-6">
        {workflowMap[activeWorkflow](() => setActiveWorkflow(null))}
      </div>
    );
  }

  // Otherwise, render the services grid
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Career Services</h1>
        <p className="mt-1 text-[15px] text-slate-500">
          Professional tools and support to accelerate your career.
        </p>
      </div>

      {/* Service Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockServices.map((service) => {
          const IconComp = iconMap[service.icon] || FileCheck;
          return (
            <div
              key={service.id}
              onClick={() => setActiveWorkflow(service.id)}
              className="group flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-200 cursor-pointer"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 transition-colors group-hover:bg-blue-100">
                <IconComp className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-[15px] font-semibold text-slate-900">{service.title}</h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-500">
                {service.description}
              </p>
              <button className="mt-5 flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700">
                {service.cta}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
