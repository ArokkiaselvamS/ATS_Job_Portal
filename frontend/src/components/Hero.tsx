import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Star, Briefcase, FileText, Building2, Target } from "lucide-react";
import heroOffice from "../assets/hero-office.jpg";

export default function Hero() {
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();

  const handleTagClick = (tag: string) => {
    setKeyword(tag);
    navigate(`/jobs?q=${encodeURIComponent(tag)}`);
  };

  return (
    <section className="hero-grid relative overflow-hidden border-b border-slate-100 bg-[#FAFAFC] pt-12 pb-14 sm:pt-16 sm:pb-18 lg:pt-20 lg:pb-24">
      <div className="mx-auto grid max-w-[1420px] items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:gap-14 lg:px-10">
        
        {/* Left Column: Hero Content */}
        <div className="relative z-10">
          
          {/* Main Title */}
          <h1 className="hero-title text-4xl font-black tracking-tight text-[#0F172A] sm:text-6xl lg:text-5xl xl:text-[68px] leading-[1.04]">
            Find Jobs.
            <br />
            Build Careers.
            <br />
            <span className="bg-gradient-to-r from-[#3B28EC] via-[#6335F3] to-[#F25C05] bg-clip-text text-transparent">
              Shape Your Future.
            </span>
          </h1>

          {/* Subtitle with styled AESCION brand */}
          <p className="mt-6 max-w-[580px] text-base leading-7 sm:text-lg sm:leading-8 text-slate-600 font-normal">
            <span className="font-extrabold tracking-tight">
              <span style={{ color: "#F96302" }}>AE</span>
              <span style={{ color: "#2B26D9" }}>SCI</span>
              <span style={{ color: "#363636" }}>ON</span>
            </span>{" "}
            connects talent with opportunities using AI-driven matching, smart insights, and a seamless job search experience.
          </p>

          {/* Upgraded Premium Hero Action Options Group */}
          <div className="mt-9 inline-flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 rounded-2xl sm:rounded-full bg-white/90 backdrop-blur-md p-2 sm:p-2.5 sm:pl-5 shadow-xl shadow-indigo-100/70 border border-slate-200/80 max-w-full">
            
            {/* Option 1: Application Tracker */}
            <Link
              to="/application-tracker"
              className="group flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#3B28EC] hover:bg-indigo-50/60 px-3.5 py-2.5 rounded-xl sm:rounded-full transition duration-200 whitespace-nowrap"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-[#3B28EC] group-hover:bg-[#3B28EC] group-hover:text-white transition duration-200">
                <Target size={14} />
              </div>
              <span>Application Tracker</span>
            </Link>
            
            {/* Option 2: Resume Builder */}
            <Link
              to="/resume-builder"
              className="group flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#6335F3] hover:bg-purple-50/60 px-3.5 py-2.5 rounded-xl sm:rounded-full transition duration-200 whitespace-nowrap"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-50 text-[#6335F3] group-hover:bg-[#6335F3] group-hover:text-white transition duration-200">
                <FileText size={14} />
              </div>
              <span>Resume Builder</span>
            </Link>

            {/* Option 3: Companies (Navigate to Company Registration) */}
            <Link
              to="/company/register"
              className="group flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#F96302] hover:bg-orange-50/60 px-3.5 py-2.5 rounded-xl sm:rounded-full transition duration-200 whitespace-nowrap"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-50 text-[#F96302] group-hover:bg-[#F96302] group-hover:text-white transition duration-200">
                <Building2 size={14} />
              </div>
              <span>Companies</span>
            </Link>

            {/* Option 4: Join Now (Primary CTA with colorful gradient & glowing emphasis) */}
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 rounded-xl sm:rounded-full bg-gradient-to-r from-[#3B28EC] via-[#6335F3] to-[#F25C05] hover:opacity-95 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition transform hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap sm:ml-2"
            >
              <span>Join Now</span>
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>

          </div>

          {/* Popular Tag Pills */}
          <div className="mt-7 flex flex-wrap items-center gap-2 text-xs font-medium">
            <span className="text-slate-400 font-normal">Popular:</span>
            {["Frontend Dev", "AI Engineer", "Product Designer", "Remote"].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className="rounded-xl border border-slate-200/80 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:border-[#3B28EC] hover:text-[#3B28EC] transition"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Social Proof / Rating Avatar Group */}
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <div className="flex -space-x-2">
              {["A", "R", "E", "K", "M"].map((letter, i) => (
                <div
                  key={i}
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-[#3B28EC] to-slate-800 text-xs font-bold text-white shadow-sm"
                >
                  {letter}
                </div>
              ))}
            </div>
            <div>
              <div className="flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>
              <p className="mt-1 text-xs sm:text-sm font-medium text-slate-600">
                Trusted by <span className="font-bold text-slate-900">25,000+</span> job seekers & 500+ top employers
              </p>
            </div>
          </div>

        </div>

        {/* Right Column: Hero Visual Frame with Badges */}
        <div className="relative min-h-[340px] sm:min-h-[460px] lg:min-h-[560px] mt-6 lg:mt-0 flex items-center justify-center">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute -inset-4 rounded-[60px] bg-gradient-to-br from-indigo-100/60 via-purple-50/40 to-orange-50/50 blur-2xl" />

          {/* Outer Chamfered White Frame Container */}
          <div className="relative w-full h-[340px] sm:h-[460px] lg:h-[540px] p-3 rounded-[40px] bg-white/70 shadow-2xl shadow-indigo-100/80 backdrop-blur-sm border border-white">
            
            {/* Inner Angled Clipped Photo Container */}
            <div className="image-frame relative h-full w-full overflow-hidden bg-slate-900 shadow-inner">
              <img
                src={heroOffice}
                alt="Professionals collaborating in modern engineering office"
                className="h-full w-full object-cover opacity-95 transition-transform duration-700 hover:scale-105"
              />
              
              {/* Top-Left Floating Badge: 1,200+ New Jobs */}
              <div className="absolute top-5 left-5 z-20 flex items-center gap-3 rounded-2xl bg-white/95 p-3.5 shadow-xl backdrop-blur-md border border-slate-100/90 transition hover:scale-105">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-[#3B28EC]">
                  <Briefcase size={20} />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-900">1,200+ New Jobs</p>
                  <p className="text-[11px] font-medium text-slate-400">added this week</p>
                </div>
              </div>

              {/* Bottom-Right Floating Badge: 95% Match Rate */}
              <div className="absolute bottom-5 right-5 z-20 flex items-center gap-3 rounded-2xl bg-white/95 p-3.5 shadow-xl backdrop-blur-md border border-slate-100/90 transition hover:scale-105">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#F25C05]">
                  <Sparkles size={18} />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-900">95% Match Rate</p>
                  <p className="text-[11px] font-medium text-slate-400">Powered by AESCION AI</p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}