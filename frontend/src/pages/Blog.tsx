import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ArrowRight, Clock } from "lucide-react";

const posts = [
  {
    id: 1,
    title: "10 Productivity & Workflow Tools for Modern Professionals in 2026",
    category: "Career Insights",
    readTime: "5 min read",
    date: "Aug 18, 2026",
    excerpt: "Discover how smart candidate profiling, resume audits, and automated trackers accelerate career progression across any domain.",
  },
  {
    id: 2,
    title: "How to Pass Modern ATS Resume Screening with a 95%+ Match Score",
    category: "Resume Tips",
    readTime: "7 min read",
    date: "Aug 15, 2026",
    excerpt: "Learn the exact formatting standards and keyword matching strategies top candidates use across Technology, Finance, and Healthcare.",
  },
  {
    id: 3,
    title: "Direct Recruitment Trends: How Companies Evaluate Global Candidates",
    category: "Industry Trends",
    readTime: "4 min read",
    date: "Aug 10, 2026",
    excerpt: "Insights into how modern hiring teams conduct direct evaluations and streamline candidate interview pipelines.",
  },
];

export default function Blog() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="mx-auto max-w-[1420px] px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="border-b border-slate-200/80 pb-5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F96302]">
              AESCION Career Hub
            </span>
            <h1 className="mt-1 text-xl sm:text-3xl font-bold text-slate-900">
              Career Articles & Recruitment Insights
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 font-normal">
              Expert advice on resume optimization, direct interviews, and navigating worldwide employment markets.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="rounded-[6px] border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-[#2B26D9]">{post.category}</span>
                    <span className="flex items-center gap-1 text-[11px]"><Clock size={12} /> {post.readTime}</span>
                  </div>
                  <h3 className="mt-2.5 text-sm font-bold text-slate-900 leading-snug hover:text-[#2B26D9] transition-colors cursor-pointer">
                    {post.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed font-normal">
                    {post.excerpt}
                  </p>
                </div>
                <div className="mt-5 border-t border-slate-100 pt-3 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">{post.date}</span>
                  <button className="text-xs font-medium text-[#2B26D9] flex items-center gap-1 hover:underline">
                    Read Article <ArrowRight size={12} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
