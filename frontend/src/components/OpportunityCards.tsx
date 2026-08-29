import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const categories = [
  { title: "Technology & Engineering", count: "4,250+ Openings", query: "Technology" },
  { title: "Finance & Banking", count: "2,610+ Openings", query: "Finance" },
  { title: "Healthcare & Clinical", count: "1,840+ Openings", query: "Healthcare" },
  { title: "Sales & Marketing", count: "3,180+ Openings", query: "Sales" },
  { title: "Product & UI/UX Design", count: "1,490+ Openings", query: "Design" },
  { title: "Operations & HR", count: "1,920+ Openings", query: "Operations" },
  { title: "Hardware Systems", count: "1,180+ Openings", query: "Engineering" },
  { title: "Education & EdTech", count: "930+ Openings", query: "Education" },
];

const appleEase = [0.16, 1, 0.3, 1] as const;

export default function OpportunityCards() {
  const navigate = useNavigate();

  return (
    <motion.section
      initial={{ opacity: 0, y: -25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease: appleEase }}
      className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8 py-10 sm:py-12"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
            Popular Job Categories
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Explore verified career openings across high-growth industries.
          </p>
        </div>

        <button
          onClick={() => navigate("/explore-jobs")}
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#0067b8] hover:text-[#004f8c] transition-colors cursor-pointer"
        >
          <span>View all</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Grid with staggered card drop-down */}
      <div className="mt-4 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map(({ title, count, query }, idx) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: -15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.05, ease: appleEase }}
            onClick={() => navigate(`/explore-jobs?q=${encodeURIComponent(query)}`)}
            className="ms-card-interactive group flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-2xs cursor-pointer hover:border-[#0067b8] transition-all"
          >
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0067b8] transition-colors truncate">
                {title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{count}</p>
            </div>
            <ArrowRight size={14} className="text-slate-300 group-hover:text-[#0067b8] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}