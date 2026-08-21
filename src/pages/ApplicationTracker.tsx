import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Briefcase, Clock, CheckCircle, XCircle, Search, Filter } from "lucide-react";
import { useState } from "react";

const initialApplications = [
  {
    id: "1",
    role: "Senior AI Software Engineer",
    company: "AESCION Intelligence",
    date: "2026-08-20",
    status: "Interview Scheduled",
    statusColor: "bg-amber-50 text-amber-700 border-amber-200",
    matchScore: 96,
  },
  {
    id: "2",
    role: "Lead Product Designer",
    company: "Nova Cloud Systems",
    date: "2026-08-18",
    status: "Under Review",
    statusColor: "bg-blue-50 text-blue-700 border-blue-200",
    matchScore: 92,
  },
  {
    id: "3",
    role: "Full Stack Developer",
    company: "Apex Global Tech",
    date: "2026-08-15",
    status: "Application Sent",
    statusColor: "bg-slate-100 text-slate-700 border-slate-200",
    matchScore: 88,
  },
  {
    id: "4",
    role: "DevOps Engineer",
    company: "CyberShield Security",
    date: "2026-08-10",
    status: "Offer Extended",
    statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    matchScore: 95,
  },
];

export default function ApplicationTracker() {
  const [search, setSearch] = useState("");

  const filtered = initialApplications.filter(
    (app) =>
      app.role.toLowerCase().includes(search.toLowerCase()) ||
      app.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="mx-auto max-w-[1420px] px-4 sm:px-6 lg:px-10 py-10">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#2B26D9]">
                Career Dashboard
              </span>
              <h1 className="text-3xl font-black text-slate-900 sm:text-4xl">
                Application Tracker
              </h1>
              <p className="mt-1 text-sm sm:text-base text-slate-600">
                Track your active job applications, interview stages, and status updates in real-time.
              </p>
            </div>
            <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2B26D9] to-[#F96302] px-6 py-3 text-sm font-bold text-white shadow-md hover:opacity-95">
              + Track New Job
            </button>
          </div>

          {/* Stats Summary */}
          <div className="mt-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                <span>Total Applied</span>
                <Briefcase size={18} className="text-[#2B26D9]" />
              </div>
              <p className="mt-2 text-3xl font-black text-slate-900">12</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                <span>In Review</span>
                <Clock size={18} className="text-blue-500" />
              </div>
              <p className="mt-2 text-3xl font-black text-slate-900">5</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                <span>Interviews</span>
                <CheckCircle size={18} className="text-amber-500" />
              </div>
              <p className="mt-2 text-3xl font-black text-slate-900">3</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                <span>Offers</span>
                <CheckCircle size={18} className="text-emerald-500" />
              </div>
              <p className="mt-2 text-3xl font-black text-slate-900">1</p>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Filter by role or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 focus:border-[#2B26D9] focus:outline-none shadow-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50">
                <Filter size={15} /> Filter Status
              </button>
            </div>
          </div>

          {/* Applications Table / Cards */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50/80 text-xs font-bold uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Role & Company</th>
                    <th className="px-6 py-4">Date Applied</th>
                    <th className="px-6 py-4">AI Match Score</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        <div className="font-bold text-slate-900">{app.role}</div>
                        <div className="text-xs font-medium text-slate-500">{app.company}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">{app.date}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-extrabold text-[#2B26D9]">
                          {app.matchScore}% Match
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${app.statusColor}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-xs font-bold text-[#2B26D9] hover:underline">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
