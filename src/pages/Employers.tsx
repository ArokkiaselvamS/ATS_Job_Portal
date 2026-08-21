import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Users, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export default function Employers() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="mx-auto max-w-[1420px] px-4 sm:px-6 lg:px-10 py-12">
          {/* Hero for Employers */}
          <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-14 text-white shadow-2xl">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-orange-500/20 px-4 py-1.5 text-xs font-bold text-orange-300">
                <Sparkles size={14} />
                AESCION Employer Solutions
              </span>
              <h1 className="mt-4 text-3xl font-black sm:text-5xl leading-tight">
                Hire Top 1% Tech Talent Powered by AI Matching
              </h1>
              <p className="mt-4 text-base sm:text-lg text-slate-300">
                Post jobs, score candidates instantly, and cut hiring cycles by up to 60% with AESCION intelligent talent matching.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <button className="rounded-xl bg-gradient-to-r from-[#2B26D9] to-[#F96302] px-7 py-3.5 text-sm font-bold text-white shadow-lg hover:opacity-95">
                  Post a Job Opening Now
                </button>
                <button className="rounded-xl border border-slate-700 bg-slate-800/80 px-6 py-3.5 text-sm font-bold text-white hover:bg-slate-800">
                  Schedule Demo
                </button>
              </div>
            </div>
          </div>

          {/* Employer Benefits */}
          <div className="mt-16 grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-[#2B26D9]">
                <Zap size={24} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">Instant AI Ranking</h3>
              <p className="mt-2 text-xs text-slate-600 leading-5">
                Automatically rank applicants based on skill stack, experience, and verified project work.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-[#F96302]">
                <ShieldCheck size={24} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">Pre-Vetted Candidates</h3>
              <p className="mt-2 text-xs text-slate-600 leading-5">
                Every candidate profile comes with verified credentials and skill assessment badges.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Users size={24} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">Direct Messaging</h3>
              <p className="mt-2 text-xs text-slate-600 leading-5">
                Connect directly with qualified job seekers through integrated scheduling and chat.
              </p>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
