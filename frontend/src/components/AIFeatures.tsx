import { Sparkles, Cpu, ShieldCheck, Target, Zap, FileCheck2 } from "lucide-react";

const features = [
  {
    icon: Cpu,
    title: "AI Resume Parsing & Match Score",
    description:
      "Upload your resume and get an instant AI compatibility score against job descriptions, along with tailored improvement tips.",
    color: "bg-indigo-50 text-[#2B26D9]",
    badge: "Instant Analysis",
  },
  {
    icon: Target,
    title: "Precision Job Recommendations",
    description:
      "Our neural matching algorithm filters through thousands of positions daily to suggest high-matching opportunities tailored to your career trajectory.",
    color: "bg-orange-50 text-[#F96302]",
    badge: "98% Match Rate",
  },
  {
    icon: Zap,
    title: "Automated Application Tracker",
    description:
      "Monitor application stages, interview invitations, and status updates seamlessly in one unified dashboard.",
    color: "bg-emerald-50 text-emerald-600",
    badge: "Real-time Alerts",
  },
  {
    icon: ShieldCheck,
    title: "Verified Employer Talent Pool",
    description:
      "Connect directly with vetted tech companies and hiring managers without dealing with recruiter spam or phantom job postings.",
    color: "bg-slate-100 text-slate-800",
    badge: "100% Vetted",
  },
];

export default function AIFeatures() {
  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-[1420px] px-4 sm:px-6 lg:px-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-xs font-bold text-[#F96302] ring-1 ring-orange-100">
            <Sparkles size={15} />
            <span>AESCION Intelligence</span>
          </div>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">
            Powered by Next-Gen AI Technology
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            Say goodbye to endless job boards and black-hole applications. AESCION leverages AI models to streamline your career growth.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group relative rounded-3xl border border-slate-200/80 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-100/50"
              >
                <div className="flex items-center justify-between">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${item.color}`}>
                    <Icon size={28} />
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600">
                    {item.badge}
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-bold text-slate-900 group-hover:text-[#2B26D9] transition">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Interactive Banner Box */}
        <div className="mt-16 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-lg bg-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-300">
                <FileCheck2 size={15} />
                Try Free AI Resume Audit
              </span>
              <h3 className="mt-3 text-2xl sm:text-3xl font-extrabold text-white">
                Get Your Free Resume AI Score in 30 Seconds
              </h3>
              <p className="mt-2 text-sm sm:text-base text-slate-300">
                Find out how ATS-friendly your resume is and get customized recommendations to land 3x more interviews.
              </p>
            </div>
            <a
              href="/resume-builder"
              className="shrink-0 rounded-2xl bg-white px-8 py-4 text-base font-bold text-slate-900 shadow-xl transition hover:bg-slate-100 hover:scale-105 active:scale-100"
            >
              Analyze My Resume Now
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
