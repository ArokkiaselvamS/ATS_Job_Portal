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

  const filteredConnections: any[] = [];

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

          {/* Empty State for all tabs */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              {activeTab === "Requests" ? (
                <Check className="h-8 w-8 text-slate-400" />
              ) : activeTab === "Discover" ? (
                <UserPlus className="h-8 w-8 text-slate-400" />
              ) : (
                <UsersIcon className="h-8 w-8 text-slate-400" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              {activeTab === "Requests"
                ? "No Pending Requests"
                : activeTab === "Discover"
                  ? "No People to Discover"
                  : "No Connections Yet"}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              {activeTab === "Requests"
                ? "Connection requests from other professionals will appear here."
                : activeTab === "Discover"
                  ? "Discover people in your industry to grow your network."
                  : "Start building your professional network by connecting with others."}
            </p>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Connection Requests */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-[15px] font-semibold text-slate-900">Connection Requests</h3>
            <div className="py-6 text-center">
              <p className="text-xs text-slate-400">No pending requests</p>
            </div>
          </div>

          {/* People You May Know */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-[15px] font-semibold text-slate-900">People You May Know</h3>
            <div className="py-6 text-center">
              <p className="text-xs text-slate-400">No suggestions yet</p>
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
                <p className="text-xl font-bold text-slate-900">0</p>
                <p className="text-xs text-slate-500">Total connections</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
