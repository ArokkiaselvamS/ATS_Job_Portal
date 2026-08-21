import { BriefcaseBusiness, FileText, Search, UsersRound } from "lucide-react";

const cards = [
  {
    title: "Smart Job Search",
    description: "Find jobs that match your skills and interests.",
    icon: Search,
    tone: "bg-violet-50 text-violet-600",
  },
  {
    title: "AI Resume Builder",
    description: "Create a professional resume that gets noticed.",
    icon: FileText,
    tone: "bg-orange-50 text-orange-500",
  },
  {
    title: "Track Applications",
    description: "Monitor your applications and get real-time updates.",
    icon: BriefcaseBusiness,
    tone: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "Connect & Grow",
    description: "Build your network and grow your career.",
    icon: UsersRound,
    tone: "bg-blue-50 text-blue-600",
  },
];

export default function OpportunityCards() {
  return (
    <section className="mx-auto max-w-[1420px] px-6 py-16 lg:px-10 lg:py-20">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Explore Opportunities
        </h2>
        <p className="mt-3 text-base text-slate-500 sm:text-lg">
          Search jobs, build your profile, and connect with top employers.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ title, description, icon: Icon, tone }) => (
          <article
            key={title}
            className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-soft"
          >
            <div className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${tone}`}>
              <Icon size={29} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <p className="mt-2 text-[15px] leading-7 text-slate-500">
              {description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}