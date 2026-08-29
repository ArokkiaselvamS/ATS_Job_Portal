import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Users, ShieldCheck, Zap } from "lucide-react";

export default function Employers() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="mx-auto max-w-[1420px] px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          {/* Hero Banner for Employers (8px radius, clean 1px border) */}
          <div className="rounded-[8px] bg-[#0F172A] p-6 sm:p-10 text-white shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-1.5 rounded-[4px] bg-[#FFF7F2] px-2.5 py-0.5 text-xs font-semibold text-[#F96302]">
                AESCION Enterprise Solutions
              </span>
              <h1 className="mt-3 text-2xl font-bold sm:text-4xl leading-tight text-white">
                Hire Verified Industry Talent Directly
              </h1>
              <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                Post job openings, screen candidate profiles with verified credentials, and accelerate hiring across Technology, Finance, Healthcare, Sales, and Operations.
              </p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                <button
                  onClick={() => navigate("/company/register")}
                  className="rounded-[4px] bg-[#2B26D9] px-4 py-2 text-sm font-medium text-white hover:bg-[#221DB3] transition-colors"
                >
                  Post a Job Opening
                </button>
                <button
                  onClick={() => navigate("/company-admin/login")}
                  className="rounded-[4px] border border-slate-700 bg-slate-800/80 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
                >
                  Employer Portal Login
                </button>
              </div>
            </div>
          </div>

          {/* Employer Benefits Grid (6px radius cards) */}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[6px] border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <div className="flex h-9 w-9 items-center justify-center rounded-[4px] bg-indigo-50 text-[#2B26D9]">
                <Zap size={18} />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900">Precision Screening</h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed font-normal">
                Automatically screen applicants based on verified skill sets, domain experience, and ATS resume benchmarks.
              </p>
            </div>

            <div className="rounded-[6px] border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <div className="flex h-9 w-9 items-center justify-center rounded-[4px] bg-orange-50 text-[#F96302]">
                <ShieldCheck size={18} />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900">Pre-Vetted Candidates</h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed font-normal">
                Candidate profiles feature validated skills, transparent salary expectations, and direct communication channels.
              </p>
            </div>

            <div className="rounded-[6px] border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <div className="flex h-9 w-9 items-center justify-center rounded-[4px] bg-emerald-50 text-emerald-600">
                <Users size={18} />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900">Direct Candidate Engagement</h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed font-normal">
                Connect directly with qualified applicants with zero intermediary delays and live application tracking.
              </p>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
