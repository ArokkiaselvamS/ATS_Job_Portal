import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, ArrowRight, ShieldCheck, DollarSign, CheckCircle2 } from "lucide-react";

interface SalaryBenchmark {
  role: string;
  p25: string;
  median: string;
  p90: string;
  topSkills: string[];
  openings: number;
}

const salaryData: Record<string, SalaryBenchmark[]> = {
  tech: [
    {
      role: "Staff / Principal Cloud Architect",
      p25: "₹32,00,000",
      median: "₹45,00,000",
      p90: "₹68,00,000",
      topSkills: ["Distributed Systems", "Kubernetes", "Golang", "AWS"],
      openings: 320,
    },
    {
      role: "Senior Full Stack Engineer (React/Node)",
      p25: "₹20,00,000",
      median: "₹28,50,000",
      p90: "₹42,00,000",
      topSkills: ["React 19", "TypeScript", "Node.js", "PostgreSQL"],
      openings: 840,
    },
    {
      role: "AI/ML Infrastructure Specialist",
      p25: "₹26,00,000",
      median: "₹38,00,000",
      p90: "₹58,00,000",
      topSkills: ["PyTorch", "MLOps", "LLM Inference", "CUDA"],
      openings: 410,
    },
  ],
  finance: [
    {
      role: "VP / Director of Corporate Finance",
      p25: "₹30,00,000",
      median: "₹44,00,000",
      p90: "₹65,00,000",
      topSkills: ["M&A Valuation", "IFRS Audit", "Capital Structuring"],
      openings: 190,
    },
    {
      role: "Senior Quantitative / Financial Analyst",
      p25: "₹18,00,000",
      median: "₹26,00,000",
      p90: "₹38,00,000",
      topSkills: ["Financial Modeling", "Python/SQL", "Risk Analytics"],
      openings: 460,
    },
  ],
  product: [
    {
      role: "Group / Principal Product Manager",
      p25: "₹28,00,000",
      median: "₹40,00,000",
      p90: "₹56,00,000",
      topSkills: ["GTM Strategy", "B2B Monetization", "Roadmapping"],
      openings: 210,
    },
    {
      role: "Lead UI/UX & Design Systems Architect",
      p25: "₹19,00,000",
      median: "₹27,50,000",
      p90: "₹39,00,000",
      topSkills: ["Figma Design Systems", "Prototyping", "User Research"],
      openings: 280,
    },
  ],
};

export default function SalaryIntelligence() {
  const [activeCategory, setActiveCategory] = useState<"tech" | "finance" | "product">("tech");
  const navigate = useNavigate();

  return (
    <section className="py-7 sm:py-9 bg-slate-50/70 border-b border-slate-200">
      <div className="mx-auto max-w-[1420px] px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-0.5">
              <TrendingUp size={13} />
              <span>Real-Time Compensation Intelligence</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              Transparent Market Salary Percentiles
            </h2>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Verified annual CTC distributions based on live direct-hire offers across India and remote markets.
            </p>
          </div>

          {/* Domain Category Selector */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-[5px] border border-slate-200 shadow-2xs">
            <button
              onClick={() => setActiveCategory("tech")}
              className={`text-[12px] font-semibold px-3 py-1 rounded-[4px] transition-all ${
                activeCategory === "tech"
                  ? "bg-[#0F172A] text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Technology & AI
            </button>
            <button
              onClick={() => setActiveCategory("finance")}
              className={`text-[12px] font-semibold px-3 py-1 rounded-[4px] transition-all ${
                activeCategory === "finance"
                  ? "bg-[#0F172A] text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Finance & Advisory
            </button>
            <button
              onClick={() => setActiveCategory("product")}
              className={`text-[12px] font-semibold px-3 py-1 rounded-[4px] transition-all ${
                activeCategory === "product"
                  ? "bg-[#0F172A] text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Product & Design
            </button>
          </div>
        </div>

        {/* Data Cards Table Hybrid */}
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {salaryData[activeCategory].map((item) => (
            <div
              key={item.role}
              onClick={() => navigate(`/explore-jobs?q=${encodeURIComponent(item.role)}`)}
              className="rounded-[7px] border border-slate-200 bg-white p-4 shadow-2xs hover:border-[#2563EB]/50 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{item.openings} verified vacancies</span>
                  <span className="font-semibold text-emerald-600">Verified CTC</span>
                </div>

                <h3 className="mt-1.5 text-[13px] font-bold text-slate-900 leading-snug">
                  {item.role}
                </h3>

                {/* Percentile Stats Block */}
                <div className="mt-3 rounded-[5px] bg-slate-50 border border-slate-200/80 p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">25th Percentile:</span>
                    <span className="font-semibold text-slate-800">{item.p25}</span>
                  </div>
                  <div className="flex items-center justify-between text-[12px] font-bold border-t border-slate-200/60 pt-1">
                    <span className="text-[#2563EB]">Median Compensation:</span>
                    <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-[3px] border border-emerald-200">
                      {item.median}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">90th Percentile (Staff/Lead):</span>
                    <span className="font-semibold text-slate-800">{item.p90}</span>
                  </div>
                </div>

                {/* Top Required Stack */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {item.topSkills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-[3px] bg-white border border-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Link */}
              <div className="mt-3.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-[#2563EB]">
                <span>Explore Matching Roles</span>
                <ArrowRight size={13} />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
