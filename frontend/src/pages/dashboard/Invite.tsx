import { useState } from "react";
import {
  Copy,
  Share2,
  Mail,
  Send,
  Users,
  UserCheck,
  Gift,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { mockReferrals } from "../../data/mockData";

export default function Invite() {
  const [copied, setCopied] = useState(false);
  const [emails, setEmails] = useState("");
  const referralLink = "https://aescion.com/invite/JOHN123";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = [
    { label: "Invites Sent", value: 12, icon: Send, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Joined", value: 7, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Active Users", value: 5, icon: Users, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "Rewards Earned", value: 3, icon: Gift, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Invite Friends</h1>
        <p className="mt-1 text-[15px] text-slate-500">
          Help your friends discover better career opportunities.
        </p>
      </div>

      {/* Referral Link */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-[15px] font-semibold text-slate-900">Your Referral Link</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5">
            <p className="truncate text-sm font-mono text-slate-600">{referralLink}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <Copy className="h-4 w-4" />
              {copied ? "Copied!" : "Copy Link"}
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>
        </div>

        {/* Invite Via */}
        <div className="mt-5">
          <p className="mb-3 text-sm font-medium text-slate-700">Invite Via</p>
          <div className="flex flex-wrap gap-2">
            {["WhatsApp", "Email", "LinkedIn", "Copy Link"].map((method) => (
              <button
                key={method}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:border-blue-200 hover:text-blue-600"
              >
                {method}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${s.bg}`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Email Invite */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-[15px] font-semibold text-slate-900">Invite Friends</h2>
          <p className="mb-4 text-sm text-slate-500">Enter email addresses to send invitations.</p>
          <textarea
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            placeholder="Enter email addresses, separated by commas..."
            rows={3}
            className="mb-4 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
          <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700">
            <Mail className="h-4 w-4" />
            Send Invitations
          </button>
        </div>

        {/* Referral History */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-[15px] font-semibold text-slate-900">Referral History</h2>
          <div className="space-y-3">
            {mockReferrals.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">{r.name}</p>
                  <p className="text-xs text-slate-500">{r.email}</p>
                </div>
                <span
                  className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    r.status === "Joined"
                      ? "bg-emerald-50 text-emerald-600"
                      : r.status === "Active"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-amber-50 text-amber-600"
                  }`}
                >
                  {r.status === "Joined" ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <Clock className="h-3 w-3" />
                  )}
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
