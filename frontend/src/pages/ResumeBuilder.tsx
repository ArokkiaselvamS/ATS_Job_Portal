import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Sparkles, FileText, Download, CheckCircle2, Upload, RefreshCw } from "lucide-react";
import { useState } from "react";

export default function ResumeBuilder() {
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  const handleAudit = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setAnalyzed(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="mx-auto max-w-[1420px] px-4 sm:px-6 lg:px-10 py-10">
          {/* Header */}
          <div className="border-b border-slate-200 pb-8 text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3.5 py-1 text-xs font-bold text-[#2B26D9]">
              <Sparkles size={14} className="text-[#F96302]" />
              AI Resume Optimization
            </span>
            <h1 className="mt-3 text-3xl font-black text-slate-900 sm:text-5xl">
              AI Resume Builder & Optimizer
            </h1>
            <p className="mt-2 text-base text-slate-600 max-w-2xl">
              Upload your existing resume or build one from scratch. Our AI scores ATS compatibility and tailors your resume for target job descriptions.
            </p>
          </div>

          {/* Builder / Analyzer Container */}
          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            
            {/* Upload / Form Section */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Upload size={20} className="text-[#2B26D9]" />
                Upload Resume for AI Scoring
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Supports PDF, DOCX, or plain text formats.
              </p>

              <div
                onClick={handleAudit}
                className="mt-6 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/30 p-10 text-center cursor-pointer hover:border-[#2B26D9] hover:bg-indigo-50/60 transition"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-md text-[#2B26D9]">
                  <FileText size={30} />
                </div>
                <p className="mt-4 text-sm font-bold text-slate-800">
                  Click or Drag & Drop your resume here
                </p>
                <p className="mt-1 text-xs text-slate-500">Maximum file size: 10MB</p>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">OR START FROM SCRATCH</span>
                <button
                  type="button"
                  className="text-xs font-bold text-[#2B26D9] hover:underline"
                >
                  Use Built-in AI Template →
                </button>
              </div>

              <button
                type="button"
                onClick={handleAudit}
                disabled={analyzing}
                className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2B26D9] to-[#F96302] py-3.5 text-sm font-bold text-white shadow-lg transition hover:opacity-95"
              >
                {analyzing ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    Analyzing ATS Compatibility...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Run AI Audit & Scoring
                  </>
                )}
              </button>
            </div>

            {/* Results Preview Box */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">
                    AI Assessment Report
                  </h3>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-600 border border-emerald-200">
                    Ready
                  </span>
                </div>

                <div className="mt-6 flex items-center gap-6 rounded-2xl bg-slate-50 p-6 border border-slate-100">
                  <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2B26D9] to-[#F96302] p-1 text-white shadow-lg">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-slate-900 font-black text-2xl">
                      {analyzed ? "94%" : "88%"}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">Excellent ATS Match</h4>
                    <p className="mt-1 text-xs text-slate-600">
                      Your resume scores in the top 5% for Senior Software & Tech roles.
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Key AI Feedback
                  </h4>
                  <div className="flex items-start gap-2 text-xs font-medium text-slate-700">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>Strong keyword density for React, TypeScript, and Cloud Architecture.</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs font-medium text-slate-700">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>Action-oriented bullet points with quantified achievements.</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs font-medium text-slate-700">
                    <Sparkles size={16} className="text-[#F96302] shrink-0 mt-0.5" />
                    <span>Recommendation: Add 2-3 metric-driven project outcomes.</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-[#2B26D9] transition">
                  <Download size={16} />
                  Download Optimized PDF
                </button>
              </div>
            </div>

          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
