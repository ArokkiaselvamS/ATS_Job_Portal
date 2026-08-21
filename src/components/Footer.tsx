import { Link } from "react-router-dom";
import Logo from "./Logo";
import { ArrowRight, Mail, Github, Linkedin, Twitter, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      {/* Top CTA Banner */}
      <div className="border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 px-4 py-12 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[1420px] flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Ready to Accelerate Your Career?
            </h3>
            <p className="mt-2 text-sm sm:text-base text-slate-400">
              Join thousands of professionals finding their dream roles through AESCION AI matching.
            </p>
          </div>
          <Link
            to="/auth/register"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#2B26D9] to-[#F96302] px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-indigo-900/40 transition hover:opacity-95"
          >
            Create Free Account
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-[1420px] px-4 py-16 sm:px-6 lg:px-10">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/90 p-2.5 rounded-xl inline-block">
              <Logo iconSize={40} textSize="text-2xl" />
            </div>
            <p className="text-sm leading-6 text-slate-400 max-w-sm">
              AESCION is the next-generation AI-powered career platform connecting job seekers with top global companies through smart matching and automated tools.
            </p>
            <div className="flex items-center gap-3 text-slate-400 pt-2">
              <a href="#" className="rounded-lg border border-slate-800 p-2.5 hover:border-slate-700 hover:text-white transition">
                <Linkedin size={18} />
              </a>
              <a href="#" className="rounded-lg border border-slate-800 p-2.5 hover:border-slate-700 hover:text-white transition">
                <Twitter size={18} />
              </a>
              <a href="#" className="rounded-lg border border-slate-800 p-2.5 hover:border-slate-700 hover:text-white transition">
                <Github size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">For Job Seekers</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link to="/jobs" className="hover:text-white transition">Browse Jobs</Link>
              </li>
              <li>
                <Link to="/resume-builder" className="hover:text-white transition">AI Resume Builder</Link>
              </li>
              <li>
                <Link to="/application-tracker" className="hover:text-white transition">Application Tracker</Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-white transition">Career Advice</Link>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">For Employers</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link to="/employers" className="hover:text-white transition">Post a Job</Link>
              </li>
              <li>
                <Link to="/employers" className="hover:text-white transition">Talent Search</Link>
              </li>
              <li>
                <Link to="/employers" className="hover:text-white transition">AI Candidate Scoring</Link>
              </li>
              <li>
                <Link to="/employers" className="hover:text-white transition">Pricing Plans</Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Stay Updated</h4>
            <p className="mt-4 text-xs text-slate-400">
              Subscribe to get top job alerts & weekly career insights.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="mt-3 space-y-2">
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3 text-slate-500" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-slate-800 bg-slate-800/60 py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-[#2B26D9] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-[#2B26D9] py-2 text-xs font-bold text-white transition hover:bg-[#3828dc]"
              >
                Subscribe
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} AESCION Portal. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-400">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400">Terms of Service</a>
            <a href="#" className="hover:text-slate-400">Security</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
