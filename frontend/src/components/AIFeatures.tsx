import { Link } from "react-router-dom";
import { ArrowRight, FileText, Building2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const appleEase = [0.16, 1, 0.3, 1] as const;

export default function AIFeatures() {
  return (
    <motion.section
      initial={{ opacity: 0, y: -25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease: appleEase }}
      className="py-10 sm:py-14 bg-transparent"
    >
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        
        <div className="grid gap-5 md:grid-cols-2">
          
          {/* Candidate Card */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.05, ease: appleEase }}
            className="rounded-xl border border-blue-100 bg-[#EEF0FE]/40 p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:border-blue-300 transition-all"
          >
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0067b8] mb-2.5">
                <FileText size={14} />
                <span>For Job Seekers</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-snug">
                Optimize Your Resume for Direct ATS Matching
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                Check your resume's parsing score, identify skill gaps, and apply directly to hiring managers with transparent compensation.
              </p>

              <div className="mt-5 flex flex-wrap gap-3 text-xs text-slate-700 font-medium">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-600" /> Free ATS Scanner
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-600" /> Direct Recruiter Line
                </span>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-blue-100/90">
              <Link
                to="/resume-builder"
                className="inline-flex items-center gap-1.5 rounded-[4px] bg-[#0067b8] px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-[#005a9e] transition-colors shadow-2xs"
              >
                <span>Build & Scan Resume</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>

          {/* Employer Card */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.12, ease: appleEase }}
            className="rounded-xl border border-slate-800 bg-[#0F172A] text-white p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:border-slate-700 transition-all"
          >
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#F96302] mb-2.5">
                <Building2 size={14} />
                <span>For Employers & Recruiters</span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight leading-snug">
                Hire Verified Talent with Zero Intermediary Fees
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                Post openings directly to verified professionals. Enjoy automated candidate ranking, applicant tracking, and direct interview scheduling.
              </p>

              <div className="mt-5 flex flex-wrap gap-3 text-xs text-slate-300 font-medium">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-400" /> Verified Candidates
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-400" /> 0% Placement Cuts
                </span>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800">
              <Link
                to="/company/register"
                className="inline-flex items-center gap-1.5 rounded-[4px] bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-slate-900 hover:bg-slate-100 transition-colors shadow-2xs"
              >
                <span>Post a Job Opening</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>

        </div>

      </div>
    </motion.section>
  );
}
