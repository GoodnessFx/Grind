import React, { useState } from "react";
import {
  Bell, Search, ChevronRight, Eye, EyeOff,
  Briefcase, Tv2, Users, TrendingUp, X, CheckCircle2,
  ArrowUpRight, Zap, Gift, Sparkles
} from "lucide-react";
import { TaskCard } from "./TaskCard";
import { toast } from "sonner";
import type { Tab, UserData } from "../App";

interface HomeProps {
  user: UserData;
  onNavigate: (tab: Tab) => void;
  onPostTask: () => void;
  onTaskClick: (taskId: number) => void;
  onUpdateUser: (updates: Partial<UserData>) => void;
}

const FEATURED_GIGS = [
  { id: 1, category: "Writing", price: 3500, title: "Write my BUS 301 Business Law essay (1500 words)", description: "Need a well-researched essay on corporate governance. Due Friday before 5pm.", posterHandle: "@emeka_dev", posterTier: "GOLD" as const, posterScore: 672, deadline: "Due in 2 days" },
  { id: 2, category: "Design", price: 5000, title: "Design event flyer for Faculty Week", description: "Creative flyer design for our upcoming Faculty Week event.", posterHandle: "@fatimah.writes", posterTier: "BRONZE" as const, posterScore: 423, deadline: "Due in 4 days" },
  { id: 3, category: "Tutoring", price: 8500, title: "Tutor me in Calculus before my exam", description: "Help with integration and differentiation. 3 sessions needed.", posterHandle: "@seun_designs", posterTier: "DIAMOND" as const, posterScore: 847, deadline: "Due in 3 days" },
];

const REAL_WORLD_OPPS = [
  { id: 101, company: "TechNova Solutions", logo: "T", role: "Junior Frontend Developer (Remote)", type: "Internship", stipend: "₦150k/mo", tag: "Tech" },
  { id: 102, company: "Campus Connect", logo: "C", role: "Campus Ambassador", type: "Part-time", stipend: "₦50k/mo + Comm", tag: "Marketing" },
];

const QUICK_ACTIONS = [
  { id: "gigs", label: "Browse Gigs", icon: Briefcase, color: "bg-accent/10 text-accent", desc: "Find work now" },
  { id: "live", label: "Go Live", icon: Tv2, color: "bg-red-50 text-red-500", desc: "Start streaming" },
  { id: "refer", label: "Refer Friend", icon: Users, color: "bg-blue-50 text-blue-500", desc: "Earn bonuses" },
  { id: "wallet", label: "Top Up", icon: TrendingUp, color: "bg-orange-50 text-orange-500", desc: "Add money" },
];

const tierColors: Record<string, string> = {
  STARTER: "#98A2B3",
  BRONZE: "#CD7F32",
  GOLD: "#F79009",
  DIAMOND: "#0BA5EC",
};

export function Home({ user, onNavigate, onPostTask, onTaskClick, onUpdateUser }: HomeProps) {
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = user.notifications?.filter((n) => !n.read).length ?? 0;

  const handleQuickAction = (id: string) => {
    if (id === "gigs") onNavigate("gigs");
    else if (id === "live") onNavigate("live");
    else if (id === "wallet") onNavigate("wallet");
    else if (id === "refer") {
      const link = `https://grind.market/ref/${user.handle.replace("@", "")}`;
      navigator.clipboard.writeText(link).then(() => toast.success("Referral link copied!"));
    }
  };

  const markAllRead = () => {
    onUpdateUser({
      notifications: user.notifications?.map((n) => ({ ...n, read: true })),
    });
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="pb-28">
      {/* ── Top Bar ─────────────────────────────────────────── */}
      <div className="bg-white px-5 pt-12 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-accent flex items-center justify-center text-white font-bold text-lg shadow-sm">
            {user.userName?.[0]?.toUpperCase() ?? "G"}
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">{greeting()},</p>
            <h2 className="text-base font-bold text-gray-900 leading-tight">
              {user.userName} <span className="text-[11px] font-semibold text-accent bg-grind-accent-light px-2 py-0.5 rounded-full ml-1">{user.tier}</span>
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNotifications(true)}
            className="relative w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* ── Balance Card ────────────────────────────────────── */}
      <div className="px-4 mb-4">
        <div className="bg-accent rounded-3xl p-5 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-16 -mt-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-8 -mb-8 pointer-events-none" />

          <div className="relative z-10">
            {/* Balance row */}
            <div className="flex items-center justify-between mb-1">
              <p className="text-white/70 text-xs font-medium">Available Balance</p>
              <button onClick={() => setBalanceHidden((v) => !v)} className="text-white/70">
                {balanceHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-end gap-2 mb-4">
              <h3 className="text-3xl font-extrabold text-white tracking-tight">
                {balanceHidden ? "₦ ••••••" : `₦${user.walletBalance.toLocaleString()}`}
              </h3>
              <span className="text-white/60 text-xs font-semibold mb-1">cNGN</span>
            </div>

            {/* GrindScore row */}
            <div className="flex items-center gap-2 mb-5">
              <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tierColors[user.tier] ?? "#98A2B3" }} />
                <span className="text-white text-xs font-semibold">GrindScore: {user.score}</span>
              </div>
              <button
                onClick={() => onNavigate("gigs")}
                className="flex items-center gap-1 bg-white/15 rounded-full px-3 py-1"
              >
                <span className="text-white text-xs font-semibold">Transaction History</span>
                <ChevronRight className="w-3 h-3 text-white/70" />
              </button>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Add Money", icon: "＋" },
                { label: "Transfer", icon: "↗" },
                { label: "Withdraw", icon: "↙" },
              ].map((btn) => (
                <button
                  key={btn.label}
                  onClick={() => onNavigate("wallet")}
                  className="bg-white/20 hover:bg-white/30 active:scale-95 transition-all rounded-2xl py-2.5 flex flex-col items-center gap-1"
                >
                  <span className="text-white text-lg font-bold leading-none">{btn.icon}</span>
                  <span className="text-white/80 text-[10px] font-medium">{btn.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ────────────────────────────────────── */}
      <div className="px-4 mb-5">
        <div className="bg-white rounded-3xl p-4">
          <div className="grid grid-cols-4 gap-3">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action.id)}
                  className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
                >
                  <div className={`w-12 h-12 rounded-2xl ${action.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-600 text-center leading-tight">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Smart Pick Banner ────────────────────────────────── */}
      <div className="px-4 mb-5">
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-[#0A2540] to-[#04111E] p-6 shadow-[0_12px_32px_-8px_rgba(10,37,64,0.3)]">
          {/* Depth layers */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-accent/20 blur-[40px]" />
            <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-white/5 blur-[40px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(255,255,255,0.06),transparent_60%)]" />
          </div>

          <div className="relative z-10 flex flex-col items-start gap-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <Sparkles className="w-4 h-4 text-[#E6F7EE]" />
              <span className="text-[11px] font-extrabold text-[#E6F7EE] tracking-widest uppercase">Smart Pick</span>
            </div>
            
            <div className="pr-12">
              <h3 className="text-[26px] font-extrabold text-white tracking-tight leading-[1.05]">
                Post your<br />first gig.
              </h3>
              <p className="mt-2.5 text-[15px] font-medium text-white/70 leading-relaxed max-w-[220px]">
                Earn your first cNGN today, protected by escrow.
              </p>
            </div>

            <button
              onClick={onPostTask}
              className="mt-2 w-full sm:w-auto rounded-2xl px-6 py-4 text-[15px] font-extrabold text-white shadow-[0_8px_16px_-4px_rgba(0,166,81,0.4),inset_0_1px_1px_rgba(255,255,255,0.3)] bg-gradient-to-b from-accent to-[#008A43] hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Post gig now
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Exclusive Reward Banner ──────────────────────────── */}
      <div className="px-4 mb-5">
        <div className="relative overflow-hidden rounded-[28px] border border-gray-100 bg-white p-6 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.08)] transition-all cursor-pointer group" onClick={() => onNavigate("wallet")}>
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-gradient-to-br from-orange-100/50 to-orange-50/10 blur-2xl pointer-events-none group-hover:bg-orange-100/70 transition-colors" />

          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-orange-100 to-orange-50 flex items-center justify-center border border-orange-100 shadow-sm shrink-0">
              <Gift className="w-6 h-6 text-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[17px] font-extrabold text-gray-900 leading-tight truncate">Exclusive Rewards</p>
              <p className="text-[13px] font-medium text-gray-500 mt-1.5 leading-snug">
                Complete gigs. Earn bonuses. Level up your GrindScore.
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0 group-hover:bg-orange-50 transition-colors">
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Recommended Gigs ─────────────────────────────────── */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-gray-900">Recommended for You</h3>
          <button
            onClick={() => onNavigate("gigs")}
            className="text-accent text-xs font-semibold flex items-center gap-1"
          >
            See all <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
        <div className="space-y-3">
          {FEATURED_GIGS.map((task) => (
            <TaskCard key={task.id} {...task} onClick={() => onTaskClick(task.id)} />
          ))}
        </div>
      </div>

      {/* ── Real-World Opportunities ──────────────────────────── */}
      <div className="px-4 mt-8 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-gray-900">Real-World Opportunities</h3>
          <button
            onClick={() => toast.info("More opportunities coming soon!")}
            className="text-accent text-xs font-semibold flex items-center gap-1"
          >
            See all <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar">
          {REAL_WORLD_OPPS.map(opp => (
            <div key={opp.id} className="snap-center shrink-0 w-[260px] bg-white border border-gray-100 rounded-[24px] p-5 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.03)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center font-black text-gray-900">
                    {opp.logo}
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide bg-gray-50 px-2 py-1 rounded-md border border-gray-100">{opp.tag}</span>
                </div>
                <h4 className="font-extrabold text-[15px] text-gray-900 leading-tight mb-1">{opp.role}</h4>
                <p className="text-xs text-gray-500 font-medium">{opp.company}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">{opp.type}</p>
                  <p className="text-xs font-black text-green-500">{opp.stipend}</p>
                </div>
                <button className="bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-transform">Apply</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Notifications Panel ──────────────────────────────── */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowNotifications(false)} />
          <div className="relative bg-white rounded-t-3xl max-h-[75vh] flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                {unreadCount > 0 && <p className="text-xs text-gray-500">{unreadCount} unread</p>}
              </div>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-accent font-semibold">Mark all read</button>
                )}
                <button onClick={() => setShowNotifications(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
              {user.notifications?.length ? (
                user.notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 rounded-2xl border ${n.read ? "bg-gray-50 border-gray-100" : "bg-grind-accent-light border-accent/20"}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${n.read ? "bg-gray-200" : "bg-accent"}`}>
                        <CheckCircle2 className={`w-4 h-4 ${n.read ? "text-gray-500" : "text-white"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-gray-900 truncate">{n.title}</p>
                          <span className="text-[10px] text-gray-400 shrink-0">{n.time}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{n.message}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Bell className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No notifications yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
