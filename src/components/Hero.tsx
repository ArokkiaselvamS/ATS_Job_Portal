import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Star, Search, MapPin, Briefcase } from "lucide-react";
import heroOffice from "../assets/hero-office.jpg";

export default function Hero() {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (keyword) query.set("q", keyword);
    if (location) query.set("location", location);
    navigate(`/jobs?${query.toString()}`);
  };

  return (
    <section className="hero-grid relative overflow-hidden border-b border-slate-100 bg-slate-50/50">
      <div className="mx-auto grid max-w-[1420px] items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:gap-12 lg:px-10 pb-16 pt-8 sm:pb-20 sm:pt-12 lg:pb-24 lg:pt-14">
        
        {/* Left Column: Hero Content & Search */}
        <div className="relative z-10">
          
          {/* AI Pill Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-[#2B26D9] shadow-sm ring-1 ring-indigo-100">
            <Sparkles size={16} className="text-[#F96302]" />
            <span>AI-Powered Job Search</span>
          </div>

          {/* Main Title */}
          <h1 className="hero-title text-4xl font-black tracking-tight text-[#18202d] sm:text-6xl lg:text-5xl xl:text-6xl leading-[1.08]">
            Find Jobs.
            <br />
            Build Careers.
            <br />
            <span className="gradient-text">Shape Your Future.</span>
          </h1>

          {/* Subtitle with styled AESCION brand */}
          <p className="mt-5 sm:mt-6 max-w-[620px] text-base leading-7 sm:text-lg sm:leading-8 text-slate-600">
            <span className="font-extrabold tracking-tight">
              <span style={{ color: "#F96302" }}>AE</span>
              <span style={{ color: "#2B26D9" }}>SCI</span>
              <span style={{ color: "#363636" }}>ON</span>
            </span>{" "}
            connects talent with opportunities using AI-driven matching, smart insights, and a seamless job search experience.
          </p>

          {/* Interactive Job Search Bar */}
          <form
            onSubmit={handleSearch}
            className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-xl shadow-indigo-100/50 transition-all focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 max-w-xl"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {/* Keyword Input */}
              <div className="flex flex-1 items-center gap-2.5 px-3 py-2 border-b border-slate-100 sm:border-b-0 sm:border-r">
                <Search size={18} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Job title, skills, or company..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>

              {/* Location Input */}
              <div className="flex flex-1 items-center gap-2.5 px-3 py-2">
                <MapPin size={18} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="City, state, or 'Remote'"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2B26D9] to-[#F96302] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:opacity-95 shrink-0"
              >
                Search
                <ArrowRight size={16} />
              </button>
            </div>
          </form>

          {/* Popular Tag Pills */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="text-slate-400">Popular:</span>
            {["Frontend Dev", "AI Engineer", "Product Designer", "Remote"].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setKeyword(tag)}
                className="rounded-lg bg-white px-2.5 py-1 text-slate-600 border border-slate-200 hover:border-[#2B26D9] hover:text-[#2B26D9] transition"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Social Proof / Job Seekers Avatar Group */}
          <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-slate-200/60 pt-6">
            <div className="flex -space-x-2">
              {["A", "R", "S", "K", "M"].map((letter, i) => (
                <div
                  key={i}
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-indigo-500 to-slate-700 text-xs font-bold text-white shadow-sm"
                >
                  {letter}
                </div>
              ))}
            </div>
            <div>
              <div className="flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={15} fill="currentColor" />
                ))}
              </div>
              <p className="mt-1 text-xs sm:text-sm font-medium text-slate-600">
                Trusted by <span className="font-bold text-slate-900">25,000+</span> job seekers & 500+ top employers
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Visual Image Frame */}
        <div className="relative min-h-[300px] sm:min-h-[420px] lg:min-h-[540px] mt-6 lg:mt-0">
          <div className="absolute -inset-4 rounded-[60px] bg-gradient-to-br from-indigo-100/70 via-orange-50/50 to-indigo-50/80 blur-2xl" />
          
          <div className="image-frame relative h-[320px] sm:h-[440px] lg:h-[540px] overflow-hidden rounded-2xl sm:rounded-3xl border border-indigo-100/80 bg-slate-100 shadow-xl">
            <img
              src={heroOffice}
              alt="Professionals collaborating in modern software engineering office"
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
            
            {/* Floating Glassmorphism Cards */}
            <div className="absolute top-6 left-6 hidden sm:flex items-center gap-3 rounded-2xl bg-white/90 p-3.5 shadow-lg backdrop-blur-md border border-white/40">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-[#2B26D9]">
                <Briefcase size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">1,200+ New Jobs</p>
                <p className="text-[11px] font-medium text-slate-500">Added this week</p>
              </div>
            </div>

            <div className="absolute bottom-6 right-6 hidden sm:flex items-center gap-3 rounded-2xl bg-white/90 p-3.5 shadow-lg backdrop-blur-md border border-white/40">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#F96302]">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">98% Match Rate</p>
                <p className="text-[11px] font-medium text-slate-500">Powered by AESCION AI</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}