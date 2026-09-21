import React, { useState } from "react";
import {
  Plus, Download, ArrowUpRight, ArrowDownLeft,
  CreditCard, Landmark, ChevronRight, Trophy,
  Star, Eye, EyeOff, Send, X, CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../lib/utils";
import type { UserData } from "../App";

interface WalletProps {
  user: UserData;
  onUpdateUser: (updates: Partial<UserData>) => void;
}

const mockLeaderboard = [
  { name: "Chidi_Codes", score: 982, tier: "DIAMOND", rank: 1 },
  { name: "Ada_Tech", score: 945, tier: "DIAMOND", rank: 2 },
  { name: "Emeka_Dev", score: 701, tier: "GOLD", rank: 3 },
  { name: "Seun_Maths", score: 642, tier: "GOLD", rank: 4 },
  { name: "Fatimah_Writes", score: 580, tier: "BRONZE", rank: 5 },
];

const tierColors: Record<string, string> = {
  STARTER: "#98A2B3", BRONZE: "#CD7F32", GOLD: "#F79009", DIAMOND: "#0BA5EC",
};

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

  const handleDownload = () => {
    toast.info("Generating transaction report…");
    setTimeout(() => toast.success("Statement downloaded!"), 1500);
  };

  const handleFund = (method: "card" | "transfer") => {
    const amount = parseFloat(fundAmount);
    if (isNaN(amount) || amount < 100) { toast.error("Enter a valid amount (min ₦100)"); return; }

    if (method === "transfer") {
      const ref = `GRD-${Math.floor(Math.random() * 999999).toString().padStart(6, "0")}`;
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
            onClick={() => {
              toast.dismiss(t);
              setLoading(true);
              setTimeout(() => {
                onUpdateUser({
                  walletBalance: user.walletBalance + amount,
                  transactions: [
                    { id: `TX${Date.now()}`, title: "Wallet Funding", amount, date: new Date().toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" }), status: "Completed", type: "fund" },
                    ...user.transactions,
                  ],
                });
                setLoading(false);
                setShowFundModal(false);
                setFundAmount("");
                toast.success(`₦${amount.toLocaleString()} added!`);
              }, 1500);
            }}
            className="w-full bg-accent text-white font-bold py-3 rounded-2xl text-sm"
          >
            I've Made the Transfer
          </button>
        </div>
      ), { duration: 30000 });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      onUpdateUser({
        walletBalance: user.walletBalance + amount,
        transactions: [
          { id: `TX${Date.now()}`, title: "Wallet Funding (Card)", amount, date: new Date().toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" }), status: "Completed", type: "fund" },
          ...user.transactions,
        ],
      });
      setLoading(false);
      setShowFundModal(false);
      setFundAmount("");
      toast.success(`₦${amount.toLocaleString()} funded!`);
    }, 2000);
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount < 500) { toast.error("Minimum withdrawal is ₦500"); return; }
    if (amount > user.walletBalance) { toast.error("Insufficient balance"); return; }
    setLoading(true);
    setTimeout(() => {
      onUpdateUser({
        walletBalance: user.walletBalance - amount,
        transactions: [
          { id: `TX${Date.now()}`, title: "Withdrawal to Bank", amount: -amount, date: new Date().toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" }), status: "Processing", type: "spend" },
          ...user.transactions,
        ],
      });
      setLoading(false);
      setShowWithdrawModal(false);
      setWithdrawAmount("");
      toast.success("Withdrawal initiated! Arrives in 1-2 hours.");
    }, 2000);
  };

  const handleSend = () => {
    const amount = parseFloat(sendAmount);
    if (!sendHandle.startsWith("@")) { toast.error("Enter a valid handle (e.g. @username)"); return; }
    if (isNaN(amount) || amount < 100) { toast.error("Minimum transfer is ₦100"); return; }
    if (amount > user.walletBalance) { toast.error("Insufficient balance"); return; }
    setLoading(true);
    setTimeout(() => {
      onUpdateUser({
        walletBalance: user.walletBalance - amount,
        transactions: [
          { id: `TX${Date.now()}`, title: `Transfer to ${sendHandle}`, amount: -amount, date: new Date().toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" }), status: "Completed", type: "spend" },
          ...user.transactions,
        ],
      });
      setLoading(false);
      setShowSendModal(false);
      setSendHandle(""); setSendAmount("");
      toast.success(`₦${amount.toLocaleString()} sent to ${sendHandle}!`);
    }, 1800);
  };

  const userRank = mockLeaderboard.findIndex((u) => u.score <= user.score) + 1;
  const displayRank = userRank > 0 ? userRank : mockLeaderboard.length + 1;

  return (
    <div className="pb-28">
      {/* ── Tab header ──────────────────────────────────────── */}
      <div className="bg-white px-5 pt-12 pb-4 flex items-center justify-between">
        <div className="flex bg-gray-100 p-1 rounded-2xl">
          {["wallet", "leaderboard"].map((v) => (
            <button
              key={v}
              onClick={() => setActiveView(v as any)}
              className={cn(
                "px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-all",
                activeView === v ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
              )}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
        {activeView === "wallet" && (
          <button onClick={handleDownload} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
            <Download className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>

      {/* ── Wallet view ─────────────────────────────────────── */}
      {activeView === "wallet" && (
        <div className="animate-in fade-in slide-in-from-left-4 duration-300">
          {/* Balance card */}
          <div className="px-4 mb-4">
            <div className="bg-accent rounded-3xl p-5 relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-16 -mt-10 pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-white/70 text-xs font-medium">cNGN Balance</p>
                  <button onClick={() => setBalanceHidden((v) => !v)} className="text-white/70">
                    {balanceHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <h3 className="text-3xl font-extrabold text-white mb-4">
                  {balanceHidden ? "₦ ••••••" : `₦${user.walletBalance.toLocaleString()}`}
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "+ Add", action: () => setShowFundModal(true) },
                    { label: "� Send", action: () => setShowSendModal(true) },
                    { label: "↙ Cash", action: () => setShowWithdrawModal(true) },
                  ].map((btn) => (
                    <button
                      key={btn.label}
                      onClick={btn.action}
                      className="bg-white/20 hover:bg-white/30 active:scale-95 transition-all rounded-2xl py-2.5 text-white text-xs font-bold"
                    >
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
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tierColors[user.tier] ?? "#98A2B3" }} />
                  <span className="text-xs font-semibold" style={{ color: tierColors[user.tier] }}>{user.tier}</span>
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
            {user.transactions.length > 0 ? (
              <div className="space-y-2">
                {user.transactions.map((tx) => {
                  const isIn = tx.amount > 0;
                  return (
                    <div key={tx.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                      <div className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0",
                        isIn ? "bg-green-50" : "bg-red-50"
                      )}>
                        {isIn ? <ArrowDownLeft className="w-5 h-5 text-green-500" /> : <ArrowUpRight className="w-5 h-5 text-red-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{tx.title}</p>
                        <p className="text-[10px] text-gray-400 font-medium mt-0.5">{tx.date} • {tx.status}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={cn("font-extrabold text-sm", isIn ? "text-green-500" : "text-gray-700")}>
                          {isIn ? "+" : ""}₦{Math.abs(tx.amount).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-accent font-semibold">cNGN</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <ArrowDownLeft className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-gray-400 text-sm font-medium">No transactions yet</p>
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

          <div className="px-4 space-y-2">
            {/* User's own rank */}
            <div className="bg-grind-accent-light border border-accent/20 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center text-white font-bold text-sm">#{displayRank}</div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-sm flex items-center gap-2">{user.userName} <span className="text-[10px] bg-accent text-white px-2 py-0.5 rounded-full">YOU</span></p>
                <p className="text-[10px] text-gray-500">{user.tier} TIER</p>
              </div>
              <div className="text-right">
                <p className="font-extrabold text-lg text-gray-900">{user.score}</p>
                <p className="text-[10px] text-gray-400">GrindScore</p>
              </div>
            </div>

            {mockLeaderboard.map((u) => (
              <div key={u.name} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                <div className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm",
                  u.rank === 1 ? "bg-yellow-400 text-white" : u.rank === 2 ? "bg-gray-300 text-gray-700" : u.rank === 3 ? "bg-orange-400 text-white" : "bg-gray-100 text-gray-500"
                )}>
                  #{u.rank}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-sm">{u.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tierColors[u.tier] }} />
                    <span className="text-[10px] text-gray-400 font-medium">{u.tier}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="font-extrabold text-gray-900">{u.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Fund Modal ─────────────────────────────────────── */}
      {showFundModal && (
        <Modal title="Add Money" onClose={() => setShowFundModal(false)}>
          <p className="text-sm text-gray-500 mb-4">Enter amount to add to your cNGN wallet</p>
          <div className="relative mb-4">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">₦</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              className="w-full pl-9 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-2xl font-extrabold focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              autoFocus
            />
          </div>
          {/* Quick amounts */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[1000, 2500, 5000, 10000].map((amt) => (
              <button key={amt} onClick={() => setFundAmount(String(amt))} className="py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:border-accent hover:text-accent transition-all">
                ₦{amt.toLocaleString()}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <button disabled={loading} onClick={() => handleFund("card")} className="w-full h-13 bg-accent text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-grind-accent-dark active:scale-95 transition-all disabled:opacity-60 py-3.5">
              <CreditCard className="w-4 h-4" /> {loading ? "Processing…" : "Pay with Card"}
            </button>
            <button disabled={loading} onClick={() => handleFund("transfer")} className="w-full h-13 bg-white border border-gray-200 rounded-2xl font-semibold text-gray-700 text-sm flex items-center justify-center gap-2 hover:border-gray-300 active:scale-95 transition-all py-3.5">
              <Landmark className="w-4 h-4 text-gray-500" /> Bank Transfer
            </button>
          </div>
        </Modal>
      )}

      {/* ── Withdraw Modal ─────────────────────────────────── */}
      {showWithdrawModal && (
        <Modal title="Withdraw to Bank" onClose={() => setShowWithdrawModal(false)}>
          <p className="text-sm text-gray-500 mb-1">Available: <span className="font-bold text-gray-900">₦{user.walletBalance.toLocaleString()}</span></p>
          <div className="relative mb-4 mt-3">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">₦</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="w-full pl-9 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-2xl font-extrabold focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              autoFocus
            />
          </div>
          <button disabled={loading} onClick={handleWithdraw} className="w-full h-13 bg-accent text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-grind-accent-dark active:scale-95 transition-all disabled:opacity-60 py-3.5">
            {loading ? "Processing…" : "Withdraw to Bank"}
          </button>
        </Modal>
      )}

      {/* ── Send Modal ─────────────────────────────────────── */}
      {showSendModal && (
        <Modal title="Send cNGN" onClose={() => setShowSendModal(false)}>
          <p className="text-sm text-gray-500 mb-4">Send to any Grind user by their handle</p>
          <div className="space-y-3 mb-4">
            <input
              type="text"
              placeholder="@username"
              value={sendHandle}
              onChange={(e) => setSendHandle(e.target.value)}
              className="w-full h-13 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              autoFocus
            />
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₦</span>
              <input
                type="number"
                inputMode="numeric"
                placeholder="Amount"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-base font-bold focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
            </div>
          </div>
          <button disabled={loading} onClick={handleSend} className="w-full h-13 bg-accent text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-grind-accent-dark active:scale-95 transition-all disabled:opacity-60 py-3.5">
            <Send className="w-4 h-4" /> {loading ? "Sending…" : "Send Now"}
          </button>
        </Modal>
      )}
    </div>
  );
}

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
