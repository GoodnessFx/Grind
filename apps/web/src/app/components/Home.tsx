import React, { useState, useEffect } from "react";
import {
  Bell, Search, ChevronRight, Eye, EyeOff,
  Briefcase, Tv2, Users, TrendingUp, X, CheckCircle2,
  ArrowUpRight, Zap, Gift, Sparkles, Crown, Target, Edit2
} from "lucide-react";
import { TaskCard } from "./TaskCard";
import { toast } from "sonner";
import { apiFetch } from "../../lib/auth";
import { cn } from "../../lib/utils";
import type { Tab, UserData } from "../App";

interface HomeProps {
  user: UserData;
  onNavigate: (tab: Tab) => void;
  onPostTask: () => void;
  onTaskClick: (taskId: number) => void;
  onUpdateUser: (updates: Partial<UserData>) => void;
  onGoLive: () => void;
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
  { id: "gigs", label: "Browse Gigs", icon: Briefcase, color: "uniform" , desc: "Find work now" },
  { id: "live", label: "Go Live", icon: Tv2, color: "uniform" , desc: "Start streaming" },
  { id: "refer", label: "Refer Friend", icon: Users, color: "uniform" , desc: "Earn bonuses" },
  { id: "wallet", label: "Top Up", icon: TrendingUp, color: "uniform" , desc: "Add money" },
];

const tierColors: Record<string, string> = {
  STARTER: "#98A2B3",
  BRONZE: "#CD7F32",
  GOLD: "#F79009",
  DIAMOND: "#0BA5EC",
};

// ── Sapa Meter helpers ─────────────────────────────────────────────────────
function getWeeklyEarned(transactions: UserData["transactions"]): number {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  return transactions
    .filter((t) => t.amount > 0 && new Date(t.date) >= monday)
    .reduce((sum, t) => sum + t.amount, 0);
}

// ── Sapa Meter ─────────────────────────────────────────────────────────────
function SapaMeter({ user, onUpdateUser }: { user: UserData; onUpdateUser: (u: Partial<UserData>) => void }) {
  const weeklyEarned = getWeeklyEarned(user.transactions);
  const target = (user as any).weeklyTarget ?? 10000;
  const pct = Math.min((weeklyEarned / target) * 100, 100);
  const toGo = Math.max(target - weeklyEarned, 0);
  const isWeekEnd = new Date().getDay() === 0; // Sunday
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState(String(target));

  const barColor = isWeekEnd && weeklyEarned === 0
    ? "bg-red-500"
    : pct > 80
    ? "bg-yellow-400"
    : "bg-[#00FF7F]";

  const saveTarget = () => {
    const num = parseInt(editVal.replace(/[^0-9]/g, ""), 10);
    if (!num || num < 500) { toast.error("Set a target of at least ₦500"); return; }
    onUpdateUser({ weeklyTarget: num } as any);
    setEditing(false);
    toast.success("Target don set!");
  };

  return (
    <div className="px-4 mb-5">
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎯</span>
            <h4 className="font-extrabold text-gray-900 text-sm">Sapa Meter</h4>
          </div>
          <button
            onClick={() => setEditing((v) => !v)}
            className="flex items-center gap-1 text-[11px] text-accent font-bold"
          >
            <Edit2 className="w-3 h-3" /> Edit target
          </button>
        </div>

        {editing ? (
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₦</span>
              <input
                type="number"
                inputMode="numeric"
                value={editVal}
                onChange={(e) => setEditVal(e.target.value)}
                className="w-full pl-7 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <button
              onClick={saveTarget}
              className="px-4 py-2.5 bg-accent text-white rounded-xl text-xs font-bold"
            >
              Save
            </button>
          </div>
        ) : null}

        <div className="flex items-end justify-between text-xs mb-2">
          <span className="text-gray-500 font-medium">₦{weeklyEarned.toLocaleString()} earned this week</span>
          <span className={cn("font-bold", pct >= 100 ? "text-accent" : "text-gray-400")}>
            {pct >= 100 ? "🎉 Target reached!" : `₦${toGo.toLocaleString()} to go`}
          </span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-700", barColor)}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-[10px] text-gray-400 mt-1.5 font-medium">
          Weekly target: ₦{target.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

// ── Daily Spin ─────────────────────────────────────────────────────────────
function DailySpin({ user, onUpdateUser }: { user: UserData; onUpdateUser: (u: Partial<UserData>) => void }) {
  const [spinning, setSpinning] = useState(false);
  const [prize, setPrize] = useState<null | { type: string; amount?: number; message: string }>(null);
  const [showPrize, setShowPrize] = useState(false);
  const [alreadySpun, setAlreadySpun] = useState(false);
  const [nextSpin, setNextSpin] = useState("");
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Check local spin state first
    try {
      const spinData = JSON.parse(localStorage.getItem("grind_spin") ?? "{}");
      const today = new Date().toDateString();
      if (spinData.date === today) {
        setAlreadySpun(true);
        // Calculate time until midnight
        const now = new Date();
        const midnight = new Date();
        midnight.setHours(24, 0, 0, 0);
        const diff = midnight.getTime() - now.getTime();
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        setNextSpin(`${h}h ${m}m`);
      }
    } catch { /* ignore */ }

    // Check server spin status
    apiFetch<{ can_spin: boolean; next_spin_at?: string }>("/api/spin/status")
      .then((data) => {
        if (!data.can_spin) {
          setAlreadySpun(true);
          if (data.next_spin_at) {
            const diff = new Date(data.next_spin_at).getTime() - Date.now();
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            setNextSpin(`${h}h ${m}m`);
          }
        }
        setChecked(true);
      })
      .catch(() => setChecked(true));
  }, []);

  const DEMO_PRIZES = [
    { type: "credit", amount: 200, message: "Gbam! ₦200 don land 🎉" },
    { type: "credit", amount: 500, message: "Gbam! ₦500 don land 🎉" },
    { type: "free_gig_post", message: "Free gig post don land! 🎁" },
    { type: "try_again", message: "Try again tomorrow 😅" },
  ];

  const handleSpin = async () => {
    if (alreadySpun || spinning) return;
    setSpinning(true);
    try {
      const data = await apiFetch<{ prize: { type: string; amount?: number } }>("/api/spin", { method: "POST" });
      const p = data.prize;
      const msg =
        p.type === "credit" ? `Gbam! ₦${p.amount} don land 🎉` :
        p.type === "free_gig_post" ? "Free gig post don land! 🎁" :
        "Try again tomorrow 😅";
      setPrize({ ...p, message: msg });
      if (p.type === "credit" && p.amount) {
        onUpdateUser({ walletBalance: user.walletBalance + p.amount });
      }
    } catch {
      // Demo fallback
      const demo = DEMO_PRIZES[Math.floor(Math.random() * DEMO_PRIZES.length)];
      setPrize(demo);
      if (demo.type === "credit" && demo.amount) {
        onUpdateUser({ walletBalance: user.walletBalance + demo.amount });
      }
    } finally {
      // Save spin state to localStorage
      try {
        localStorage.setItem("grind_spin", JSON.stringify({ date: new Date().toDateString() }));
      } catch { /* ignore */ }
      setAlreadySpun(true);
      setSpinning(false);
      setShowPrize(true);
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setNextSpin(`${h}h ${m}m`);
    }
  };

  return (
    <>
      <div className="px-4 mb-5">
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <span className={cn("text-3xl transition-transform duration-300", spinning && "animate-spin")}>🎰</span>
            <div className="flex-1">
              <h4 className="font-extrabold text-gray-900 text-sm">Daily Spin</h4>
              <p className="text-xs text-gray-500">One spin per day. You fit win credit or a free gig post.</p>
            </div>
          </div>

          {alreadySpun ? (
            <div className="bg-gray-50 rounded-2xl p-3 text-center">
              <p className="text-sm font-semibold text-gray-600">Come back tomorrow</p>
              {nextSpin && <p className="text-xs text-accent font-bold mt-0.5">⏱ {nextSpin} remaining</p>}
            </div>
          ) : (
            <button
              onClick={handleSpin}
              disabled={spinning || !checked}
              className="w-full h-12 bg-gradient-to-r from-accent to-[#008A43] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-95 active:scale-95 transition-all shadow-lg shadow-accent/30 disabled:opacity-50"
            >
              {spinning ? (
                <><span className="animate-spin">🎰</span> Spinning...</>
              ) : (
                <>🎯 Spin!</>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Prize modal */}
      {showPrize && prize && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPrize(false)} />
          <div className="relative bg-white rounded-3xl p-8 text-center max-w-xs w-full shadow-2xl animate-in zoom-in duration-300">
            <p className="text-5xl mb-4">
              {prize.type === "credit" ? "💰" : prize.type === "free_gig_post" ? "🎁" : "🎲"}
            </p>
            <h3 className="text-xl font-extrabold text-gray-900 mb-2">{prize.message}</h3>
            {prize.type === "credit" && (
              <p className="text-sm text-gray-500 mb-5">Credited to your wallet!</p>
            )}
            {prize.type === "free_gig_post" && (
              <p className="text-sm text-gray-500 mb-5">Your next gig post na free!</p>
            )}
            {prize.type === "try_again" && (
              <p className="text-sm text-gray-500 mb-5">Your luck go change tomorrow 💪</p>
            )}
            <button
              onClick={() => setShowPrize(false)}
              className="w-full h-12 bg-accent text-white rounded-2xl font-bold"
            >
              Nice one!
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ── Seller of the Week ─────────────────────────────────────────────────────
function SellerOfWeek({ campus }: { campus?: string }) {
  const [seller, setSeller] = useState<any>(null);

  useEffect(() => {
    const params = new URLSearchParams({ limit: "1" });
    if (campus) params.set("campus", campus);
    apiFetch<{ leaderboard: any[] }>(`/api/leaderboard?${params.toString()}`)
      .then((d) => {
        if (d.leaderboard?.[0]) setSeller(d.leaderboard[0]);
      })
      .catch(() => {
        // Fallback seeded seller
        setSeller({
          handle: "@ada_hustler",
          full_name: "Ada O.",
          grind_score: 892,
          tier: "DIAMOND",
          total_earned: 87000,
        });
      });
  }, [campus]);

  if (!seller) return null;

  const initial = (seller.full_name ?? seller.handle ?? "?")[0].toUpperCase();

  return (
    <div className="px-4 mb-5">
      <div className="bg-gradient-to-br from-[#0A2540] to-[#04111E] rounded-3xl p-5 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-yellow-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="flex items-center gap-2 mb-4">
          <Crown className="w-4 h-4 text-yellow-400" />
          <h4 className="text-white font-extrabold text-sm">Seller of the Week</h4>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-yellow-400 flex items-center justify-center text-[#0A2540] font-extrabold text-xl shadow-lg">
            {initial}
          </div>
          <div className="flex-1">
            <p className="text-white font-extrabold">{seller.full_name ?? seller.handle}</p>
            <p className="text-white/60 text-xs">{seller.handle}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-yellow-400 text-[10px] font-bold bg-yellow-400/10 px-2 py-0.5 rounded-full">
                {seller.tier ?? "GOLD"}
              </span>
              <span className="text-white/50 text-[10px]">GrindScore: {seller.grind_score ?? seller.score ?? "—"}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-yellow-400 font-extrabold text-sm">₦{((seller.total_earned ?? 0) / 100).toLocaleString()}</p>
            <p className="text-white/40 text-[10px]">this week</p>
          </div>
        </div>
        <a
          href={`/u/${(seller.handle ?? "").replace("@", "")}`}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2.5 rounded-xl transition-all"
        >
          View profile <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

export function Home({ user, onNavigate, onPostTask, onTaskClick, onUpdateUser, onGoLive }: HomeProps) {
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = user.notifications?.filter((n) => !n.read).length ?? 0;

  const handleQuickAction = (id: string) => {
    if (id === "gigs") onNavigate("gigs");
    else if (id === "live") onGoLive();
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
                { label: "Transfer", icon: "�" },
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

      {/* ── Sapa Meter ───────────────────────────────────────── */}
      <SapaMeter user={user} onUpdateUser={onUpdateUser} />

      {/* ── Daily Spin ───────────────────────────────────────── */}
      <DailySpin user={user} onUpdateUser={onUpdateUser} />

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
                  <div className={`w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center`}>
                          <Icon className="w-5 h-5" />
                        </div>
                  <span className="text-[10px] font-semibold text-gray-600 text-center leading-tight">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Seller of the Week ─────────────────────────────── */}
      <SellerOfWeek campus={(user as any).campus} />

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
            <div className="inline-flex items-center gap-2 rounded-full bg-grind-accent-light px-3.5 py-1">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-[11px] font-extrabold text-accent tracking-wide uppercase">Smart Pick</span>
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
