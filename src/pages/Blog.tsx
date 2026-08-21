import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ArrowRight, BookOpen, Clock } from "lucide-react";

const posts = [
  {
    id: 1,
    title: "10 AI Tools Every Software Engineer Should Use in 2026",
    category: "Career Insights",
    readTime: "5 min read",
    date: "Aug 18, 2026",
    excerpt: "Discover how AI pair programmers, resume auditors, and smart trackers accelerate your career growth.",
  },
  {
    id: 2,
    title: "How to Pass AI ATS Resume Screening with a 95%+ Score",
    category: "Resume Tips",
    readTime: "7 min read",
    date: "Aug 15, 2026",
    excerpt: "Learn the exact formatting techniques and keyword strategy top tech candidates use.",
  },
  {
    id: 3,
    title: "The Shift to AI-Driven Tech Hiring: What Candidates Need to Know",
    category: "Industry Trends",
    readTime: "4 min read",
    date: "Aug 10, 2026",
    excerpt: "Insights into how modern hiring teams use candidate scoring engines to evaluate applications.",
  },
];

export default function Blog() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="mx-auto max-w-[1420px] px-4 sm:px-6 lg:px-10 py-12">
          <div className="border-b border-slate-200 pb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2B26D9]">
              AESCION Career Hub
            </span>
            <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-5xl">
              Career Articles & AI Hiring Insights
            </h1>
            <p className="mt-2 text-base text-slate-600">
              Expert advice on resume building, interview preparation, and navigating AI-driven job markets.
            </p>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {posts.map((post) => (
              <article key={post.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg transition">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-bold text-[#2B26D9]">{post.category}</span>
                  <span className="flex items-center gap-1"><Clock size={13} /> {post.readTime}</span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900 leading-snug hover:text-[#2B26D9] cursor-pointer">
                  {post.title}
                </h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  {post.excerpt}
                </p>
                <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">{post.date}</span>
                  <button className="text-xs font-bold text-[#2B26D9] flex items-center gap-1 hover:underline">
                    Read Article <ArrowRight size={14} />
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
