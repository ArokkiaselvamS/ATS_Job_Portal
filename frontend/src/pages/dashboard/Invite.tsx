import { useState, useEffect, useCallback } from "react";
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
  X,
  AlertCircle,
  Linkedin,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { mockReferrals, MockReferral } from "../../data/mockData";
import { useAuth } from "../../context/AuthContext";
import { referralApi } from "../../services/apiClient";

export default function Invite() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [emails, setEmails] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showRewardsModal, setShowRewardsModal] = useState(false);

  const referralCode = user?.referralCode || "JOHN123";
  const referralLink = `https://aescion.com/invite/${referralCode}`;

  const [statsData, setStatsData] = useState({
    invitesSent: 12,
    joined: 7,
    activeUsers: 5,
    rewardsEarned: 3,
  });

  const [referralsList, setReferralsList] = useState<MockReferral[]>(mockReferrals);

  const fetchReferralData = useCallback(async () => {
    try {
      const [statsRes, listRes] = await Promise.all([
        referralApi.getStats(),
        referralApi.getInvitations(),
      ]);

      if (statsRes.success && statsRes.data) {
        setStatsData((prev) => ({
          invitesSent: statsRes.data?.invitesSent ?? prev.invitesSent,
          joined: statsRes.data?.joined ?? prev.joined,
          activeUsers: statsRes.data?.activeUsers ?? prev.activeUsers,
          rewardsEarned: statsRes.data?.rewardsEarned ?? prev.rewardsEarned,
        }));
      }

      if (listRes.success && Array.isArray(listRes.data) && listRes.data.length > 0) {
        setReferralsList(
          listRes.data.map((r) => {
            const normalizedStatus = (r.status.charAt(0).toUpperCase() +
              r.status.slice(1).toLowerCase()) as "Joined" | "Pending" | "Active";
            return {
              id: r.id,
              name: r.name,
              email: r.email,
              status: normalizedStatus,
              date: r.date
                ? new Date(r.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Just now",
            };
          })
        );
      }
    } catch (err) {
      console.error("Error fetching referral data:", err);
    }
  }, []);

  useEffect(() => {
    fetchReferralData();
  }, [fetchReferralData]);

  // Helper for user initials
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return (parts[0] ? parts[0].slice(0, 2) : "U").toUpperCase();
  };

  // Avatar background colors based on name hash
  const getAvatarBg = (name: string) => {
    const colors = [
      "bg-blue-100 text-blue-700",
      "bg-indigo-100 text-indigo-700",
      "bg-violet-100 text-violet-700",
      "bg-emerald-100 text-emerald-700",
      "bg-amber-100 text-amber-700",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // 1. Copy Link reusable function
  const copyReferralLink = useCallback(async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(referralLink);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = referralLink;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      referralApi.recordShare("link").catch(() => {});
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy referral link:", err);
    }
  }, [referralLink]);

  // 2. Share reusable function (native or modal)
  const shareReferralLink = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Join AESCION",
          text: "Discover better career opportunities with AESCION. Join using my referral link.",
          url: referralLink,
        });
        referralApi.recordShare("native").catch(() => {});
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setShowShareModal(true);
        }
      }
    } else {
      setShowShareModal(true);
    }
  }, [referralLink]);

  // 3. WhatsApp reusable function
  const shareViaWhatsApp = useCallback(() => {
    const message = `Hi! 👋\n\nI found AESCION, a career platform for discovering better career opportunities.\n\nJoin using my referral link:\n${referralLink}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    referralApi.recordShare("whatsapp").catch(() => {});
  }, [referralLink]);

  // 4. Email reusable function
  const shareViaEmail = useCallback(() => {
    const subject = "Join me on AESCION";
    const body = `Hi,\n\nI found AESCION, a platform for discovering better career opportunities.\n\nJoin using my referral link:\n${referralLink}\n\nThanks!`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    referralApi.recordShare("email").catch(() => {});
  }, [referralLink]);

  // 5. LinkedIn reusable function
  const shareViaLinkedIn = useCallback(() => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`;
    window.open(linkedInUrl, "_blank", "noopener,noreferrer");
    referralApi.recordShare("linkedin").catch(() => {});
  }, [referralLink]);

  // 6. Send Invitations with validation & backend API call
  const validateAndParseEmails = (input: string) => {
    const emailList = input
      .split(/[\n,;]+/)
      .map((e) => e.trim())
      .filter(Boolean);

    if (emailList.length === 0) {
      return { valid: false, error: "Please enter at least one email address.", emails: [] };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emailList.filter((e) => !emailRegex.test(e));
    if (invalidEmails.length > 0) {
      return {
        valid: false,
        error: "Please enter a valid email address.",
        emails: [],
      };
    }

    return { valid: true, error: null, emails: emailList };
  };

  const sendInvitations = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const { valid, error, emails: parsedEmails } = validateAndParseEmails(emails);
    if (!valid) {
      setErrorMessage(error);
      return;
    }

    setIsSending(true);
    try {
      const res = await referralApi.sendInvitations(parsedEmails);
      if (res.success) {
        setSendSuccess(true);
        setSuccessMessage(res.message || "Invitations sent successfully.");
        setEmails("");
        fetchReferralData();
        setTimeout(() => {
          setSendSuccess(false);
          setSuccessMessage(null);
        }, 4000);
      } else {
        setErrorMessage(res.message || "Unable to send invitation. Please try again.");
      }
    } catch {
      setErrorMessage("Unable to send invitation. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const stats = [
    { label: "Invites Sent", value: statsData.invitesSent, icon: Send, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Joined", value: statsData.joined, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Active Users", value: statsData.activeUsers, icon: Users, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "Rewards Earned", value: statsData.rewardsEarned, icon: Gift, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl md:text-[30px] font-bold tracking-tight text-slate-900">
          Invite Friends
        </h1>
        <p className="mt-1 text-sm md:text-[15px] text-slate-500">
          Help your friends discover better career opportunities.
        </p>
      </div>

      {/* REFERRAL LINK CARD */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 md:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <h2 className="mb-3 text-[16px] font-semibold text-slate-900">Your Referral Link</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1 rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-3">
            <p className="truncate font-mono text-sm text-slate-700 select-all">{referralLink}</p>
          </div>
          <div className="flex gap-2.5 shrink-0">
            <button
              onClick={copyReferralLink}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.98]"
            >
              <Copy className="h-4 w-4" />
              {copied ? "✓ Copied" : "Copy Link"}
            </button>
            <button
              onClick={shareReferralLink}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 active:scale-[0.98]"
            >
              <Share2 className="h-4 w-4 text-slate-500" />
              Share
            </button>
          </div>
        </div>

        {/* INVITE VIA */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="mb-3 text-sm font-medium text-slate-700">Invite Via</p>
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={shareViaWhatsApp}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 active:scale-[0.98] shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
            >
              <MessageCircle className="h-4 w-4 text-emerald-600" />
              WhatsApp
            </button>
            <button
              onClick={shareViaEmail}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 active:scale-[0.98] shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
            >
              <Mail className="h-4 w-4 text-blue-600" />
              Email
            </button>
            <button
              onClick={shareViaLinkedIn}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 active:scale-[0.98] shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
            >
              <Linkedin className="h-4 w-4 text-indigo-600" />
              LinkedIn
            </button>
            <button
              onClick={copyReferralLink}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
            >
              <Copy className="h-4 w-4 text-slate-500" />
              {copied ? "✓ Copied" : "Copy Link"}
            </button>
          </div>
        </div>
      </div>

      {/* 4 SIMPLE STATISTICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
          >
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.bg}`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 leading-tight">{s.value}</p>
              <p className="text-xs md:text-sm font-medium text-slate-500 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* MAIN CONTENT (TWO COLUMNS) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* LEFT: INVITE FRIENDS SECTION */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 md:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <h2 className="text-[17px] font-semibold text-slate-900">Invite Friends</h2>
            <p className="mt-1 text-sm text-slate-500 mb-4">
              Enter email addresses to send invitations.
            </p>

            {errorMessage && (
              <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm text-rose-700 animate-in fade-in duration-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-700 animate-in fade-in duration-200">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            <div className="space-y-2">
              <textarea
                value={emails}
                disabled={isSending}
                onChange={(e) => {
                  setEmails(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Enter email addresses, separated by commas..."
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-3.5 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:opacity-60 resize-none"
              />
              <p className="text-xs text-slate-400">
                You can add multiple email addresses separated by commas
              </p>
            </div>
          </div>

          <div className="mt-5">
            <button
              onClick={sendInvitations}
              disabled={isSending}
              className={`flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-white shadow-sm transition-all active:scale-[0.98] ${
                sendSuccess
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : isSending
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {sendSuccess ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  ✓ Invitations Sent
                </>
              ) : isSending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Invitations
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT: REFERRAL HISTORY */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 md:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <h2 className="text-[17px] font-semibold text-slate-900 mb-4">Referral History</h2>
          <div className="space-y-3">
            {referralsList.map((r) => {
              const statusLower = r.status.toLowerCase();
              return (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-[#F8FAFC] px-4 py-3 transition-colors hover:bg-slate-100/70"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${getAvatarBg(
                        r.name
                      )}`}
                    >
                      {getInitials(r.name)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{r.name}</p>
                      <p className="text-xs text-slate-500">{r.email}</p>
                    </div>
                  </div>
                  <span
                    className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                      statusLower === "joined"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                        : statusLower === "active"
                          ? "bg-blue-50 text-blue-700 border-blue-200/60"
                          : "bg-amber-50 text-amber-700 border-amber-200/60"
                    }`}
                  >
                    {statusLower === "joined" ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                    {r.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* BOTTOM REWARD BANNER */}
      <div className="rounded-2xl border border-blue-100/90 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 p-5 md:p-6 shadow-[0_1px_6px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm md:text-base font-semibold text-slate-900">
                Earn rewards when your friends join and stay active!
              </p>
              <p className="text-xs md:text-sm text-slate-600 mt-0.5">
                More active referrals = more rewards
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowRewardsModal(true)}
            className="self-start sm:self-auto rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs md:text-sm font-medium text-slate-800 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] shrink-0"
          >
            View Rewards
          </button>
        </div>
      </div>

      {/* REWARDS MODAL */}
      {showRewardsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
          onClick={() => setShowRewardsModal(false)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Referral Rewards</h3>
              </div>
              <button
                onClick={() => setShowRewardsModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-slate-100 bg-[#F8FAFC] p-3.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">Tier 1</span>
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Unlocked</span>
                </div>
                <p className="text-sm font-semibold text-slate-800 mt-1">3 Active Referrals</p>
                <p className="text-xs text-slate-500 mt-0.5">Free Premium Resume Review credit</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-[#F8FAFC] p-3.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Tier 2</span>
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">2 more needed</span>
                </div>
                <p className="text-sm font-semibold text-slate-800 mt-1">5 Active Referrals</p>
                <p className="text-xs text-slate-500 mt-0.5">1-on-1 Career Consultation session</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-[#F8FAFC] p-3.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold uppercase tracking-wider text-purple-600">Tier 3</span>
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">5 more needed</span>
                </div>
                <p className="text-sm font-semibold text-slate-800 mt-1">10 Active Referrals</p>
                <p className="text-xs text-slate-500 mt-0.5">Priority Job Application Fast-Track badge</p>
              </div>
            </div>
            <button
              onClick={() => setShowRewardsModal(false)}
              className="mt-5 w-full rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* SHARE MODAL (Fallback when native navigator.share is unavailable) */}
      {showShareModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">Share via</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Share your referral link with friends and colleagues across platforms.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  shareViaWhatsApp();
                  setShowShareModal(false);
                }}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-colors shadow-sm"
              >
                <MessageCircle className="h-4 w-4 text-emerald-600" />
                WhatsApp
              </button>
              <button
                onClick={() => {
                  shareViaEmail();
                  setShowShareModal(false);
                }}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors shadow-sm"
              >
                <Mail className="h-4 w-4 text-blue-600" />
                Email
              </button>
              <button
                onClick={() => {
                  shareViaLinkedIn();
                  setShowShareModal(false);
                }}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors shadow-sm"
              >
                <Linkedin className="h-4 w-4 text-indigo-600" />
                LinkedIn
              </button>
              <button
                onClick={() => {
                  copyReferralLink();
                  setShowShareModal(false);
                }}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm"
              >
                <Copy className="h-4 w-4 text-slate-500" />
                {copied ? "✓ Copied" : "Copy Link"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

