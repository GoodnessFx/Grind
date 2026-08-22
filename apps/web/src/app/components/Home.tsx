import React, { useState } from "react";
import {
  Bell, Search, ChevronRight, Eye, EyeOff,
  Briefcase, Tv2, Users, TrendingUp, X, CheckCircle2,
  ArrowUpRight, Zap, Gift
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
        <div className="bg-grind-neutral-900 rounded-3xl p-4 flex items-center justify-between relative overflow-hidden">
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-24 h-24 bg-accent/20 rounded-full blur-xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 text-xs font-bold uppercase tracking-wide">Smart Pick</span>
            </div>
            <p className="text-white font-bold text-sm">Post your first gig</p>
            <p className="text-white/60 text-xs mt-0.5">Earn your first cNGN today</p>
          </div>
          <button
            onClick={onPostTask}
            className="relative z-10 bg-accent text-white px-4 py-2.5 rounded-2xl text-sm font-bold hover:bg-grind-accent-dark active:scale-95 transition-all flex-shrink-0"
          >
            Post
          </button>
        </div>
      </div>

      {/* ── Exclusive Reward Banner ──────────────────────────── */}
      <div className="px-4 mb-5">
        <div className="bg-orange-50 border border-orange-100 rounded-3xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center">
              <Gift className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Your Exclusive Rewards!</p>
              <p className="text-xs text-gray-500">Complete tasks and earn cash rewards</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate("wallet")}
            className="text-accent text-xs font-bold flex items-center gap-1 shrink-0"
          >
            View All <ArrowUpRight className="w-3 h-3" />
          </button>
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
