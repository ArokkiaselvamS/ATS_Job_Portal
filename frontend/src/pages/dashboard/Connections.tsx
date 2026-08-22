import { useState } from "react";
import {
  Search,
  MessageSquare,
  ExternalLink,
  UserPlus,
  Check,
  X,
  Users as UsersIcon,
} from "lucide-react";
import {
  mockConnections,
  mockConnectionRequests,
  mockPeopleYouMayKnow,
} from "../../data/mockData";

const tabs = ["All", "My Connections", "Requests", "Discover"] as const;
type Tab = (typeof tabs)[number];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);
}

const avatarColors = [
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];

export default function Connections() {
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConnections = mockConnections.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Connections</h1>
        <p className="mt-1 text-[15px] text-slate-500">
          Build your professional network and grow your career.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search people, companies or skills..."
          className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "text-blue-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-blue-600" />
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              {activeTab === "All" || activeTab === "My Connections"
                ? "My Connections"
                : activeTab === "Requests"
                  ? "Pending Requests"
                  : "Discover People"}
            </h2>
            <span className="text-sm text-slate-500">{filteredConnections.length} connections</span>
          </div>

          {(activeTab === "All" || activeTab === "My Connections") && (
            <div className="space-y-3">
              {filteredConnections.map((c, idx) => (
                <div
                  key={c.id}
                  className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${avatarColors[idx % avatarColors.length]}`}
                    >
                      {getInitials(c.name)}
                    </div>
                    <div>
                      <h3 className="text-[15px] font-semibold text-slate-900">{c.name}</h3>
                      <p className="text-sm text-slate-500">
                        {c.title} at {c.company}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {c.skills.map((s) => (
                          <span
                            key={s}
                            className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50">
                      <MessageSquare className="h-3.5 w-3.5" />
                      Message
                    </button>
                    <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50">
                      <ExternalLink className="h-3.5 w-3.5" />
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "Requests" && (
            <div className="space-y-3">
              {mockConnectionRequests.map((r, idx) => (
                <div
                  key={r.id}
                  className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${avatarColors[(idx + 3) % avatarColors.length]}`}
                    >
                      {getInitials(r.name)}
                    </div>
                    <div>
                      <h3 className="text-[15px] font-semibold text-slate-900">{r.name}</h3>
                      <p className="text-sm text-slate-500">
                        {r.title} at {r.company}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700">
                      <Check className="h-3.5 w-3.5" />
                      Accept
                    </button>
                    <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50">
                      <X className="h-3.5 w-3.5" />
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "Discover" && (
            <div className="space-y-3">
              {mockPeopleYouMayKnow.map((p, idx) => (
                <div
                  key={p.id}
                  className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${avatarColors[(idx + 1) % avatarColors.length]}`}
                    >
                      {getInitials(p.name)}
                    </div>
                    <div>
                      <h3 className="text-[15px] font-semibold text-slate-900">{p.name}</h3>
                      <p className="text-sm text-slate-500">
                        {p.title} at {p.company}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {p.mutualConnections} mutual connections
                      </p>
                    </div>
                  </div>
                  <button className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700">
                    <UserPlus className="h-3.5 w-3.5" />
                    Connect
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Connection Requests */}
          {activeTab !== "Requests" && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-[15px] font-semibold text-slate-900">Connection Requests</h3>
              <div className="space-y-3">
                {mockConnectionRequests.slice(0, 2).map((r, idx) => (
                  <div key={r.id} className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatarColors[(idx + 3) % avatarColors.length]}`}
                    >
                      {getInitials(r.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">{r.name}</p>
                      <p className="truncate text-xs text-slate-500">{r.title}</p>
                    </div>
                    <button className="rounded-md bg-blue-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-blue-700">
                      Accept
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* People You May Know */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-[15px] font-semibold text-slate-900">People You May Know</h3>
            <div className="space-y-3">
              {mockPeopleYouMayKnow.map((p, idx) => (
                <div key={p.id} className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatarColors[(idx + 1) % avatarColors.length]}`}
                  >
                    {getInitials(p.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">{p.name}</p>
                    <p className="truncate text-xs text-slate-500">{p.title} at {p.company}</p>
                  </div>
                  <button className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-600 hover:bg-blue-100">
                    Connect
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Network Stats */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-[15px] font-semibold text-slate-900">Your Network</h3>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50">
                <UsersIcon className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">24</p>
                <p className="text-xs text-slate-500">Total connections</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
