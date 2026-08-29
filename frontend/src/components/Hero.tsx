import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const subNavLinks = [
  { name: "Compare account types", path: "/explore-jobs" },
  { name: "Explore tech roles", path: "/explore-jobs?q=Technology" },
  { name: "Verified employers", path: "/employers" },
  { name: "Resume ATS builder", path: "/resume-builder" },
  { name: "Application tracker", path: "/application-tracker" },
  { name: "Salary insights", path: "/explore-jobs" },
  { name: "Remote locations", path: "/explore-jobs?q=Remote" },
];

// Apple's signature smooth ease curve (const tuple)
const appleEase = [0.16, 1, 0.3, 1] as const;

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay handled by browser policy
      });
    }
  }, []);

  return (
    <section className="relative bg-white border-b border-slate-200 overflow-hidden">

      {/* Full-Bleed 3D Video Background Layer (Desktop) with Apple-style drop-down fade */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease: appleEase, delay: 0.1 }}
        className="absolute inset-0 hidden lg:block pointer-events-none overflow-hidden select-none"
      >
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover object-right transform-gpu"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
          <source src="/hero-video.webm" type="video/webm" />
        </video>

        {/* Seamless Left Gradient Fade for text clarity */}
        <div className="absolute inset-y-0 left-0 w-[55%] bg-gradient-to-r from-white via-white/95 to-transparent"></div>
      </motion.div>

      {/* Main Content Container - Perfect Alignment with Navbar */}
      <div className="relative z-10 mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20 pb-10 sm:pb-14 min-h-[460px] lg:min-h-[520px] flex flex-col justify-center">

        {/* Left Column Content Area with Staggered Apple Drop-Down Entrance */}
        <div className="w-full lg:max-w-[560px] text-left">

          {/* Main Headline - Apple Smooth Drop-down */}
          <motion.h1
            initial={{ opacity: 0, y: -35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: appleEase, delay: 0.05 }}
            className="text-3xl sm:text-4xl lg:text-[48px] font-semibold text-slate-900 tracking-tight leading-[1.12]"
          >
            Build your career with an Aescion account
          </motion.h1>

          {/* Subtitle / Paragraph - Staggered Drop-down */}
          <motion.p
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: appleEase, delay: 0.18 }}
            className="mt-5 text-base sm:text-[17px] text-slate-700 font-normal leading-relaxed max-w-lg"
          >
            Get started exploring verified opportunities, applying directly to global tech employers, and tracking your hiring journey—with transparent compensation and zero intermediary fees.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: appleEase, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center gap-3.5"
          >
            <button
              type="button"
              onClick={() => navigate("/explore-jobs")}
              className="rounded-[4px] bg-[#0067b8] hover:bg-[#005a9e] active:bg-[#004f8c] px-6 py-2.5 text-sm font-semibold text-white transition-all shadow-xs cursor-pointer inline-flex items-center gap-2"
            >
              <span>Explore jobs for free</span>
            </button>

            <button
              type="button"
              onClick={() => navigate("/company-register")}
              className="rounded-[4px] border border-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100 px-6 py-2.5 text-sm font-semibold text-slate-900 transition-all shadow-2xs cursor-pointer inline-flex items-center gap-2"
            >
              <span>For employers</span>
            </button>
          </motion.div>

        </div>

      </div>

      {/* Sub-Navigation Quick Links Strip with Drop-down Animation */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: appleEase, delay: 0.45 }}
        className="border-t border-slate-200 bg-white py-3 px-4 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-[1240px] flex flex-wrap items-center justify-start gap-x-6 sm:gap-x-8 gap-y-2 text-xs sm:text-sm font-medium">
          {subNavLinks.map((link) => (
            <button
              key={link.name}
              type="button"
              onClick={() => navigate(link.path)}
              className="text-[#0067b8] hover:text-[#004f8c] hover:underline transition-all cursor-pointer"
            >
              {link.name}
            </button>
          ))}
        </div>
      </motion.div>

    </section>
  );
}