import { Link } from "react-router-dom";
import Logo from "./Logo";
import { ArrowRight, Mail, Github, Linkedin, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-[#0F172A] text-slate-300">
      
      {/* Top CTA Banner */}
      <div className="border-b border-slate-800 bg-[#0A0F1D] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Ready to Advance Your Career?
            </h3>
            <p className="text-xs text-slate-400 font-normal mt-0.5">
              Join thousands of verified candidates finding their next role through transparent matching.
            </p>
          </div>
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 rounded-md bg-[#2B26D9] px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-[#1E1AB8] transition-colors shrink-0 shadow-2xs"
          >
            <span>Create Free Account</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-3">
            <div className="bg-white p-1.5 rounded-md inline-block">
              <Logo iconSize={26} textSize="text-sm" />
            </div>
            <p className="text-xs leading-relaxed text-slate-400 max-w-sm font-normal">
              AESCION is a global recruitment and career management platform connecting professionals with verified employers across Technology, Finance, Healthcare, Sales, Design, and Operations.
            </p>
            <div className="flex items-center gap-2 text-slate-400 pt-1">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="rounded border border-slate-800 p-1.5 hover:border-slate-700 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={14} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="rounded border border-slate-800 p-1.5 hover:border-slate-700 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={14} />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="rounded border border-slate-800 p-1.5 hover:border-slate-700 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github size={14} />
              </a>
            </div>
          </div>

          {/* For Candidates */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              For Candidates
            </h4>
            <ul className="mt-2.5 space-y-1.5 text-xs text-slate-400">
              <li>
                <Link to="/explore-jobs" className="hover:text-white transition-colors">Find Jobs</Link>
              </li>
              <li>
                <Link to="/resume-builder" className="hover:text-white transition-colors">Resume ATS Scanner</Link>
              </li>
              <li>
                <Link to="/applications" className="hover:text-white transition-colors">Application Tracker</Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-white transition-colors">Career Advice</Link>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              For Employers
            </h4>
            <ul className="mt-2.5 space-y-1.5 text-xs text-slate-400">
              <li>
                <Link to="/company/register" className="hover:text-white transition-colors">Post a Job</Link>
              </li>
              <li>
                <Link to="/explore-jobs?tab=companies" className="hover:text-white transition-colors">Candidate Search</Link>
              </li>
              <li>
                <Link to="/company-admin/login" className="hover:text-white transition-colors">Employer Portal</Link>
              </li>
              <li>
                <Link to="/employers" className="hover:text-white transition-colors">Enterprise Solutions</Link>
              </li>
            </ul>
          </div>

          {/* Security & Verification */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Platform & Trust
            </h4>
            <ul className="mt-2.5 space-y-1.5 text-xs text-slate-400">
              <li className="text-emerald-400 font-medium">
                ✓ 100% Verified Employers
              </li>
              <li className="text-emerald-400 font-medium">
                ✓ Binding Recruiter SLAs
              </li>
              <li>
                Zero Intermediary Fees
              </li>
              <li className="pt-1">
                <Link to="/admin" className="text-slate-500 hover:text-slate-300 transition-colors">
                  System Admin
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-slate-800 pt-4 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} AESCION. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Security</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
