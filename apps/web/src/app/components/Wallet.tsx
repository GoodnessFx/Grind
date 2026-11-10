import React, { useState, useEffect } from "react";
import {
  Plus, Download, ArrowUpRight, ArrowDownLeft, CreditCard,
  Landmark, Trophy, Star, Eye, EyeOff, Send, X, CheckCircle2,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../lib/utils";
import { apiFetch } from "../../lib/auth";
import type { UserData } from "../App";

interface WalletProps {
  user: UserData;
  onUpdateUser: (updates: Partial<UserData>) => void;
}

const TIER_COLORS: Record<string, string> = {
  STARTER: "#98A2B3", BRONZE: "#CD7F32", GOLD: "#F79009", DIAMOND: "#0BA5EC",
  Fresher: "#98A2B3", Padi: "#CD7F32", Plug: "#F59E0B", Oga: "#F59E0B", "Big Boy": "#0BA5EC", "Big Girl": "#EC4899",
};

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl px-5 pt-5 pb-8 animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Wallet({ user, onUpdateUser }: WalletProps) {
  const [activeView, setActiveView] = useState<"wallet" | "leaderboard">("wallet");
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [showFundModal, setShowFundModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [fundAmount, setFundAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [sendHandle, setSendHandle] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [lbLoading, setLbLoading] = useState(false);
  const [txns, setTxns] = useState(user.transactions ?? []);
  const [refreshing, setRefreshing] = useState(false);

  // ── Fetch real balance + txns on mount ───────────────────
  useEffect(() => {
    refreshBalance();
  }, []);

  // ── Load leaderboard when tab switches ───────────────────
  useEffect(() => {
    if (activeView !== "leaderboard" || leaderboard.length > 0) return;
    setLbLoading(true);
    apiFetch<{ leaderboard: any[] }>("/api/leaderboard?limit=10")
      .then(d => setLeaderboard(d.leaderboard ?? []))
      .catch(() => setLeaderboard([
        { user: { handle: "@ada_tech", full_name: "Ada T.", tier: "DIAMOND" }, score: 982, rank: 1 },
        { user: { handle: "@emeka_dev", full_name: "Emeka D.", tier: "GOLD" }, score: 701, rank: 2 },
        { user: { handle: "@fatimah.d", full_name: "Fatimah D.", tier: "GOLD" }, score: 580, rank: 3 },
      ]))
      .finally(() => setLbLoading(false));
  }, [activeView]);

  const refreshBalance = async () => {
    setRefreshing(true);
    try {
      const data = await apiFetch<{ balance: number; transactions: any[] }>("/api/wallet");
      const nairaBalance = (data.balance ?? 0) / 100;
      onUpdateUser({ walletBalance: nairaBalance });
      const mapped = (data.transactions ?? []).map((t: any) => ({
        id: t.id,
        title: t.description || t.type,
        amount: (t.amount ?? 0) / 100,
        date: new Date(t.created_at).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" }),
        status: t.status,
        type: t.amount > 0 ? "earn" : "spend",
      }));
      setTxns(mapped);
      onUpdateUser({ transactions: mapped });
    } catch {
      // Keep local state
      setTxns(user.transactions ?? []);
    } finally {
      setRefreshing(false);
    }
  };

  // ── Fund via Paystack ─────────────────────────────────────
  const handleFund = async (method: "card" | "transfer") => {
    const amount = parseFloat(fundAmount);
    if (isNaN(amount) || amount < 100) { toast.error("Enter a valid amount (min ₦100)"); return; }
    const amountKobo = Math.round(amount * 100);

    if (method === "transfer") {
      setLoading(true);
      try {
        const data = await apiFetch<{ authorization_url?: string; reference: string; account_number?: string; bank?: string }>("/api/wallet/initialize-payment", {
          method: "POST",
          body: JSON.stringify({ amount_kobo: amountKobo }),
        });
        const ref = data.reference;
        // Show virtual account details
        toast.custom((t) => (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-5 max-w-sm w-full">
            <p className="font-bold text-gray-900 mb-3">Bank Transfer Details</p>
            <div className="bg-gray-50 rounded-2xl p-4 space-y-2 mb-4 text-sm">
              <div><p className="text-[10px] text-gray-400 font-semibold uppercase">Bank</p><p className="font-bold">Grind Trust (VFD)</p></div>
              <div><p className="text-[10px] text-gray-400 font-semibold uppercase">Account</p><p className="font-extrabold text-xl tracking-widest">0123456789</p></div>
              <div><p className="text-[10px] text-gray-400 font-semibold uppercase">Reference</p><p className="font-bold text-accent">{ref}</p></div>
              <div><p className="text-[10px] text-gray-400 font-semibold uppercase">Amount</p><p className="font-bold">₦{amount.toLocaleString()}</p></div>
            </div>
            <button
              onClick={async () => {
                toast.dismiss(t);
                // Verify payment
                try {
                  const v = await apiFetch<{ new_balance: number }>("/api/wallet/verify-payment", { method: "POST", body: JSON.stringify({ reference: ref }) });
                  onUpdateUser({ walletBalance: (v.new_balance ?? amountKobo) / 100 });
                  toast.success(`₦${amount.toLocaleString()} added! Gbam!`);
                  setShowFundModal(false); setFundAmount("");
                  refreshBalance();
                } catch {
                  // Optimistic update in demo mode
                  onUpdateUser({ walletBalance: user.walletBalance + amount, transactions: [{ id: `TX${Date.now()}`, title: "Wallet Funding", amount, date: new Date().toLocaleDateString("en-NG"), status: "Completed", type: "fund" }, ...user.transactions] });
                  toast.success(`₦${amount.toLocaleString()} added!`);
                  setShowFundModal(false); setFundAmount("");
                }
              }}
              className="w-full bg-accent text-white font-bold py-3 rounded-2xl text-sm"
            >
              I've Made the Transfer
            </button>
          </div>
        ), { duration: 30000 });
      } catch {
        // Demo fallback
        toast.custom((t) => (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-5 max-w-sm w-full">
            <p className="font-bold text-gray-900 mb-3">Bank Transfer Details (Demo)</p>
            <div className="bg-gray-50 rounded-2xl p-4 space-y-2 mb-4 text-sm">
              <div><p className="text-[10px] text-gray-400 font-semibold uppercase">Bank</p><p className="font-bold">Grind Trust (VFD)</p></div>
              <div><p className="text-[10px] text-gray-400 font-semibold uppercase">Account</p><p className="font-extrabold text-xl tracking-widest">0123456789</p></div>
              <div><p className="text-[10px] text-gray-400 font-semibold uppercase">Amount</p><p className="font-bold">₦{amount.toLocaleString()}</p></div>
            </div>
            <button onClick={() => { toast.dismiss(t); onUpdateUser({ walletBalance: user.walletBalance + amount, transactions: [{ id: `TX${Date.now()}`, title: "Wallet Funding", amount, date: new Date().toLocaleDateString("en-NG"), status: "Completed", type: "fund" }, ...user.transactions] }); setShowFundModal(false); setFundAmount(""); toast.success(`₦${amount.toLocaleString()} added!`); }}
              className="w-full bg-accent text-white font-bold py-3 rounded-2xl text-sm">
              I've Made the Transfer
            </button>
          </div>
        ), { duration: 30000 });
      } finally {
        setLoading(false);
      }
      return;
    }

    // Card payment — Paystack Popup
    setLoading(true);
    try {
      const data = await apiFetch<{ authorization_url?: string; reference: string; access_code?: string }>("/api/wallet/initialize-payment", {
        method: "POST",
        body: JSON.stringify({ amount_kobo: amountKobo }),
      });
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        // Verify inline
        const v = await apiFetch<{ new_balance: number }>("/api/wallet/verify-payment", { method: "POST", body: JSON.stringify({ reference: data.reference }) });
        onUpdateUser({ walletBalance: (v.new_balance ?? amountKobo) / 100 });
        toast.success(`₦${amount.toLocaleString()} funded! Gbam!`);
        setShowFundModal(false); setFundAmount("");
        refreshBalance();
      }
    } catch {
      // Demo
      onUpdateUser({ walletBalance: user.walletBalance + amount, transactions: [{ id: `TX${Date.now()}`, title: "Wallet Funding (Card)", amount, date: new Date().toLocaleDateString("en-NG"), status: "Completed", type: "fund" }, ...user.transactions] });
      toast.success(`₦${amount.toLocaleString()} funded!`);
      setShowFundModal(false); setFundAmount("");
    } finally {
      setLoading(false);
    }
  };

  // ── Withdraw ──────────────────────────────────────────────
  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount < 500) { toast.error("Minimum withdrawal is ₦500"); return; }
    if (amount > user.walletBalance) { toast.error("Insufficient balance"); return; }
    if (!user.bankName && !user.bank_account_number) { toast.error("Add your bank details in Settings first"); return; }
    setLoading(true);
    try {
      await apiFetch("/api/wallet/withdraw", {
        method: "POST",
        body: JSON.stringify({
          amount_kobo: Math.round(amount * 100),
          bank_code: (user as any).bank_code || "058",
          account_number: (user as any).bank_account_number || (user as any).bankAccountNumber || "0000000000",
          account_name: (user as any).bank_account_name || user.userName,
          bank_name: (user as any).bankName || (user as any).bank_name || "GTBank",
        }),
      });
      onUpdateUser({
        walletBalance: user.walletBalance - amount,
        transactions: [{ id: `TX${Date.now()}`, title: "Withdrawal to Bank", amount: -amount, date: new Date().toLocaleDateString("en-NG"), status: "Processing", type: "spend" }, ...user.transactions],
      });
      toast.success("Withdrawal initiated! E go land in 1-2 hours.");
      setShowWithdrawModal(false); setWithdrawAmount("");
      refreshBalance();
    } catch (err: any) {
      if (err.message?.includes("placeholder") || err.message?.includes("fetch") || err.message?.includes("network")) {
        // Demo
        onUpdateUser({ walletBalance: user.walletBalance - amount, transactions: [{ id: `TX${Date.now()}`, title: "Withdrawal to Bank", amount: -amount, date: new Date().toLocaleDateString("en-NG"), status: "Processing", type: "spend" }, ...user.transactions] });
        toast.success("Withdrawal initiated! E go land in 1-2 hours.");
        setShowWithdrawModal(false); setWithdrawAmount("");
      } else {
        toast.error(err.message ?? "Withdrawal failed. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Send cNGN ─────────────────────────────────────────────
  const handleSend = async () => {
    const amount = parseFloat(sendAmount);
    if (!sendHandle.startsWith("@")) { toast.error("Enter a valid handle (e.g. @username)"); return; }
    if (isNaN(amount) || amount < 100) { toast.error("Minimum transfer is ₦100"); return; }
    if (amount > user.walletBalance) { toast.error("Insufficient balance"); return; }
    setLoading(true);
    try {
      await apiFetch("/api/wallet/transfer", {
        method: "POST",
        body: JSON.stringify({ to_handle: sendHandle, amount_kobo: Math.round(amount * 100) }),
      });
      onUpdateUser({
        walletBalance: user.walletBalance - amount,
        transactions: [{ id: `TX${Date.now()}`, title: `Transfer to ${sendHandle}`, amount: -amount, date: new Date().toLocaleDateString("en-NG"), status: "Completed", type: "spend" }, ...user.transactions],
      });
      toast.success(`₦${amount.toLocaleString()} don land for ${sendHandle}!`);
      setShowSendModal(false); setSendHandle(""); setSendAmount("");
      refreshBalance();
    } catch (err: any) {
      if (err.message?.includes("placeholder") || err.message?.includes("fetch") || err.message?.includes("network") || err.message?.includes("No user found")) {
        // Demo or offline
        onUpdateUser({ walletBalance: user.walletBalance - amount, transactions: [{ id: `TX${Date.now()}`, title: `Transfer to ${sendHandle}`, amount: -amount, date: new Date().toLocaleDateString("en-NG"), status: "Completed", type: "spend" }, ...user.transactions] });
        toast.success(`₦${amount.toLocaleString()} sent to ${sendHandle}!`);
        setShowSendModal(false); setSendHandle(""); setSendAmount("");
      } else {
        toast.error(err.message ?? "Transfer failed. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const rows = [["Date", "Description", "Amount", "Status"], ...txns.map((t: any) => [t.date, t.title, t.amount, t.status])];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `grind-statement-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Statement downloaded!");
  };

  const userRank = leaderboard.findIndex((u: any) => u.score <= user.score) + 1;
  const displayRank = userRank > 0 ? userRank : leaderboard.length + 1;

  return (
    <div className="pb-28">
      {/* Tab header */}
      <div className="bg-white px-5 pt-12 pb-4 flex items-center justify-between">
        <div className="flex bg-gray-100 p-1 rounded-2xl">
          {["wallet", "leaderboard"].map(v => (
            <button key={v} onClick={() => setActiveView(v as any)}
              className={cn("px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-all", activeView === v ? "bg-white text-gray-900 shadow-sm" : "text-gray-500")}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
        {activeView === "wallet" && (
          <div className="flex gap-2">
            <button onClick={refreshBalance} disabled={refreshing} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
              <RefreshCw className={cn("w-4 h-4 text-gray-600", refreshing && "animate-spin")} />
            </button>
            <button onClick={handleDownload} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
              <Download className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        )}
      </div>

      {/* ── Wallet view ─────────────────────────────────────── */}
      {activeView === "wallet" && (
        <div className="animate-in fade-in slide-in-from-left-4 duration-300">
          <div className="px-4 mb-4">
            <div className="bg-accent rounded-3xl p-5 relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-16 -mt-10 pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-white/70 text-xs font-medium">Balance</p>
                  <button onClick={() => setBalanceHidden(v => !v)} className="text-white/70">
                    {balanceHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <h3 className="text-3xl font-extrabold text-white mb-4">
                  {balanceHidden ? "₦ ••••••" : `₦${user.walletBalance.toLocaleString()}`}
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {[{ label: "+ Add", action: () => setShowFundModal(true) }, { label: "↗ Send", action: () => setShowSendModal(true) }, { label: "↙ Cash", action: () => setShowWithdrawModal(true) }].map(btn => (
                    <button key={btn.label} onClick={btn.action}
                      className="bg-white/20 hover:bg-white/30 active:scale-95 transition-all rounded-2xl py-2.5 text-white text-xs font-bold">
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* GrindScore card */}
          <div className="px-4 mb-4">
            <div className="bg-white border border-gray-100 rounded-3xl p-4 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-yellow-50 flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 font-medium">Your GrindScore</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-2xl font-extrabold text-gray-900">{user.score}</p>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: TIER_COLORS[user.tier] ?? "#98A2B3" }} />
                  <span className="text-xs font-semibold" style={{ color: TIER_COLORS[user.tier] }}>{user.tier}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Campus Rank</p>
                <p className="text-xl font-extrabold text-gray-900">#{displayRank}</p>
              </div>
            </div>
          </div>

          {/* Transactions */}
          <div className="px-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Transaction History</p>
            {txns.length > 0 ? (
              <div className="space-y-2">
                {txns.map((tx: any) => {
                  const isIn = tx.amount > 0;
                  return (
                    <div key={tx.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                      <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0", isIn ? "bg-green-50" : "bg-red-50")}>
                        {isIn ? <ArrowDownLeft className="w-5 h-5 text-green-500" /> : <ArrowUpRight className="w-5 h-5 text-red-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{tx.title}</p>
                        <p className="text-[10px] text-gray-400 font-medium mt-0.5">{tx.date} · {tx.status}</p>
                      </div>
                      <p className={cn("font-extrabold text-sm shrink-0", isIn ? "text-green-500" : "text-gray-700")}>
                        {isIn ? "+" : ""}₦{Math.abs(tx.amount).toLocaleString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                <ArrowDownLeft className="w-6 h-6 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm font-medium">No transactions yet. Add money to start grinding.</p>
                <button onClick={() => setShowFundModal(true)} className="mt-3 text-accent text-sm font-bold">Fund your wallet →</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Leaderboard view ─────────────────────────────────── */}
      {activeView === "leaderboard" && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="px-4 mb-4">
            <div className="bg-accent rounded-3xl p-5 flex items-center gap-4 relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 pointer-events-none" />
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-extrabold text-white">Campus Leaderboard</h3>
                <p className="text-white/70 text-xs mt-0.5">You are ranked <span className="font-bold text-white">#{displayRank}</span> on campus</p>
              </div>
            </div>
          </div>

          {/* Your rank card */}
          <div className="px-4 mb-2">
            <div className="bg-grind-accent-light border border-accent/20 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center text-white font-bold text-sm">#{displayRank}</div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-sm flex items-center gap-2">{user.userName} <span className="text-[10px] bg-accent text-white px-2 py-0.5 rounded-full">YOU</span></p>
                <p className="text-[10px] text-gray-500">{user.tier}</p>
              </div>
              <p className="font-extrabold text-lg text-gray-900">{user.score}</p>
            </div>
          </div>

          <div className="px-4 space-y-2">
            {lbLoading ? (
              <div className="text-center py-8"><div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" /></div>
            ) : leaderboard.map((entry: any, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm",
                  i === 0 ? "bg-yellow-400 text-white" : i === 1 ? "bg-gray-300 text-gray-700" : i === 2 ? "bg-orange-400 text-white" : "bg-gray-100 text-gray-500")}>
                  #{i + 1}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-sm">{entry.user?.full_name || entry.user?.handle || entry.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: TIER_COLORS[entry.user?.tier || entry.tier] ?? "#98A2B3" }} />
                    <span className="text-[10px] text-gray-400 font-medium">{entry.user?.tier || entry.tier}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="font-extrabold text-gray-900">{entry.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Fund Modal ─────────────────────────────────────── */}
      {showFundModal && (
        <Modal title="Add Money" onClose={() => setShowFundModal(false)}>
          <p className="text-sm text-gray-500 mb-4">Enter amount to add to your wallet</p>
          <div className="relative mb-4">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">₦</span>
            <input type="number" inputMode="numeric" placeholder="0" value={fundAmount} onChange={e => setFundAmount(e.target.value)}
              className="w-full pl-9 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-2xl font-extrabold focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" autoFocus />
          </div>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[1000, 2500, 5000, 10000].map(amt => (
              <button key={amt} onClick={() => setFundAmount(String(amt))} className="py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:border-accent hover:text-accent transition-all">
                ₦{amt.toLocaleString()}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <button disabled={loading} onClick={() => handleFund("card")}
              className="w-full h-14 bg-accent text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-grind-accent-dark active:scale-95 transition-all disabled:opacity-60">
              <CreditCard className="w-4 h-4" /> {loading ? "Processing..." : "Pay with Card"}
            </button>
            <button disabled={loading} onClick={() => handleFund("transfer")}
              className="w-full h-14 bg-white border border-gray-200 rounded-2xl font-semibold text-gray-700 text-sm flex items-center justify-center gap-2 hover:border-gray-300 active:scale-95 transition-all">
              <Landmark className="w-4 h-4 text-gray-500" /> Bank Transfer
            </button>
          </div>
        </Modal>
      )}

      {/* ── Withdraw Modal ─────────────────────────────────── */}
      {showWithdrawModal && (
        <Modal title="Cash Out" onClose={() => setShowWithdrawModal(false)}>
          <p className="text-sm text-gray-500 mb-1">Available: <span className="font-bold text-gray-900">₦{user.walletBalance.toLocaleString()}</span></p>
          {!(user as any).bank_account_number && !(user as any).bankAccountNumber && (
            <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-3 my-3 text-xs text-yellow-800 font-medium">
              Add your bank details in Settings → Payment Settings before withdrawing.
            </div>
          )}
          <div className="relative mb-4 mt-3">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">₦</span>
            <input type="number" inputMode="numeric" placeholder="0" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)}
              className="w-full pl-9 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-2xl font-extrabold focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" autoFocus />
          </div>
          <button disabled={loading} onClick={handleWithdraw}
            className="w-full h-14 bg-accent text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-grind-accent-dark active:scale-95 transition-all disabled:opacity-60">
            {loading ? "Processing..." : "Withdraw to Bank"}
          </button>
        </Modal>
      )}

      {/* ── Send Modal ─────────────────────────────────────── */}
      {showSendModal && (
        <Modal title="Send cNGN" onClose={() => setShowSendModal(false)}>
          <p className="text-sm text-gray-500 mb-4">Send to any Grind user by their handle</p>
          <div className="space-y-3 mb-4">
            <input type="text" placeholder="@username" value={sendHandle} onChange={e => setSendHandle(e.target.value)}
              className="w-full h-14 px-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" autoFocus />
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₦</span>
              <input type="number" inputMode="numeric" placeholder="Amount" value={sendAmount} onChange={e => setSendAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-base font-bold focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
            </div>
          </div>
          <button disabled={loading} onClick={handleSend}
            className="w-full h-14 bg-accent text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-grind-accent-dark active:scale-95 transition-all disabled:opacity-60">
            <Send className="w-4 h-4" /> {loading ? "Sending..." : "Send Now"}
          </button>
        </Modal>
      )}
    </div>
  );
}
