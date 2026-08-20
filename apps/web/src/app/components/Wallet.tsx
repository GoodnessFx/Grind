import React, { useState } from "react";
import { Wallet as WalletIcon, Plus, Download, ArrowUpRight, ArrowDownLeft, CreditCard, Landmark, ChevronRight, Trophy, Star } from "lucide-react";
import { Button } from "./Button";
import { toast } from "sonner";
import { cn } from "../../lib/utils";

interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: string;
  status: string;
}

interface WalletProps {
  balance: number;
  transactions: Transaction[];
  score: number;
  tier: string;
}

const mockLeaderboard = [
  { name: "Chidi_Codes", score: 982, tier: "DIAMOND", rank: 1 },
  { name: "Ada_Tech", score: 945, tier: "DIAMOND", rank: 2 },
  { name: "IG", score: 672, tier: "GOLD", rank: 3, isUser: true },
  { name: "Emeka_Dev", score: 642, tier: "GOLD", rank: 4 },
  { name: "Fatimah_Writes", score: 580, tier: "BRONZE", rank: 5 },
];

export function Wallet({ balance, transactions, score, tier }: WalletProps) {
  const [activeView, setActiveView] = useState<"wallet" | "leaderboard">("wallet");
  const [showFundModal, setShowFundModal] = useState(false);
  const [fundMethod, setFundMethod] = useState<"card" | "transfer" | null>(null);

  const handleDownloadPDF = () => {
    toast.info("Generating transaction report...");
    setTimeout(() => {
      toast.success("Transaction history downloaded successfully!");
    }, 1500);
  };

  const handleFund = (method: "card" | "transfer") => {
    if (method === "transfer") {
      toast.custom((t) => (
        <div className="bg-white border-2 border-accent rounded-[32px] p-6 shadow-2xl max-w-sm animate-in zoom-in duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-primary text-sm">Transfer to cNGN Smart Vault</h4>
              <p className="text-[10px] font-bold text-grind-neutral-400 uppercase tracking-widest">Base Network Bridge</p>
            </div>
          </div>
          <div className="bg-grind-neutral-50 p-4 rounded-2xl mb-4 space-y-3">
            <div>
              <p className="text-[10px] font-bold text-grind-neutral-400 uppercase mb-1">Bank Name</p>
              <p className="text-sm font-black">Oui Market Trust Bank (Wema/VFD)</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-grind-neutral-400 uppercase mb-1">Account Number</p>
              <p className="text-lg font-black tracking-wider">0123456789</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-grind-neutral-400 uppercase mb-1">Account Name</p>
              <p className="text-sm font-black">OUI MARKET - {tier} TIER</p>
            </div>
          </div>
          <p className="text-[10px] text-grind-neutral-500 mb-4 leading-relaxed">
            Transfer funds here to instantly mint cNGN into your wallet. Funds are protected by the smart contract.
          </p>
          <Button onClick={() => toast.dismiss(t)} className="w-full h-10 py-0 text-[10px] font-black">
            I'VE MADE THE TRANSFER
          </Button>
        </div>
      ), { duration: 15000 });
      setShowFundModal(false);
      return;
    }
    
    setFundMethod(method);
    toast.loading(`Initializing ${method} payment...`);
    setTimeout(() => {
      toast.dismiss();
      toast.success(`₦5,000 added to your wallet via ${method}`);
      setShowFundModal(false);
      setFundMethod(null);
    }, 2000);
  };

  return (
    <div className="pb-32 px-4 max-w-[600px] mx-auto">
      <div className="pt-6 pb-6 flex items-center justify-between sticky top-0 bg-grind-neutral-50 z-20">
        <div className="flex bg-grind-neutral-100 p-1 rounded-2xl">
          <button 
            onClick={() => setActiveView("wallet")}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
              activeView === "wallet" ? "bg-white text-primary shadow-sm" : "text-grind-neutral-500 hover:text-grind-neutral-700"
            )}
          >
            Wallet
          </button>
          <button 
            onClick={() => setActiveView("leaderboard")}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
              activeView === "leaderboard" ? "bg-white text-primary shadow-sm" : "text-grind-neutral-500 hover:text-grind-neutral-700"
            )}
          >
            Leaderboard
          </button>
        </div>
        {activeView === "wallet" && (
          <button onClick={handleDownloadPDF} className="p-2.5 bg-white border border-grind-neutral-100 rounded-xl shadow-sm hover:bg-grind-neutral-50 transition-colors">
            <Download className="w-5 h-5 text-grind-neutral-700" />
          </button>
        )}
      </div>

      {activeView === "wallet" ? (
        <div className="animate-in fade-in slide-in-from-left-4 duration-300">
          <div className="bg-primary text-white rounded-[40px] p-8 mb-8 relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-xs opacity-70 uppercase tracking-widest font-bold mb-1">Total Balance</p>
                  <h3 className="text-4xl font-black flex items-center gap-2">
                    ₦{balance.toLocaleString()}
                    <span className="text-sm font-bold bg-white/20 px-2 py-0.5 rounded">cNGN</span>
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-70 uppercase tracking-widest font-bold mb-1">GrindScore</p>
                  <div className="flex items-center gap-2 justify-end">
                    <Star className="w-4 h-4 text-accent fill-accent" />
                    <span className="text-2xl font-black">{score}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button 
                  onClick={() => setShowFundModal(true)}
                  className="flex-1 bg-white text-primary hover:bg-white/90 font-black flex items-center justify-center gap-2 h-14"
                >
                  <Plus className="w-5 h-5" />
                  FUND
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/10 font-black h-14"
                >
                  WITHDRAW
                </Button>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-48 h-48 bg-accent/20 rounded-full -mr-24 -mt-24 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16 blur-2xl" />
          </div>

          <div className="mb-6">
            <h3 className="font-black text-sm uppercase tracking-widest text-grind-neutral-400 mb-4">Transaction History</h3>
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div key={tx.id} className="bg-white border border-grind-neutral-100 rounded-[24px] p-5 flex items-center gap-4 hover:shadow-md transition-all group">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                    tx.amount > 0 ? 'bg-grind-success/10 text-grind-success' : 'bg-grind-warning/10 text-grind-warning'
                  )}>
                    {tx.amount > 0 ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-grind-neutral-900">{tx.title}</h4>
                    <p className="text-[10px] font-bold text-grind-neutral-400 uppercase tracking-wider">{tx.date} • {tx.status}</p>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "font-black text-lg",
                      tx.amount > 0 ? 'text-grind-success' : 'text-grind-neutral-900'
                    )}>
                      {tx.amount > 0 ? '+' : ''}₦{Math.abs(tx.amount).toLocaleString()}
                    </p>
                    <p className="text-[10px] font-bold text-accent uppercase tracking-widest">cNGN</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="bg-accent text-white rounded-[40px] p-8 mb-8 flex items-center gap-6 relative overflow-hidden">
            <div className="w-20 h-20 bg-white/20 rounded-[32px] flex items-center justify-center shrink-0">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black mb-1">Unilag Leaderboard</h3>
              <p className="text-sm opacity-80">You are currently ranked #3 on campus. Keep grinding to reach Diamond!</p>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          </div>

          <div className="space-y-3">
            {mockLeaderboard.map((user) => (
              <div 
                key={user.name} 
                className={cn(
                  "p-5 rounded-[24px] border flex items-center gap-4 transition-all",
                  user.isUser ? "bg-accent/5 border-accent/20" : "bg-white border-grind-neutral-100"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm",
                  user.rank === 1 ? "bg-grind-tier-gold text-white" : 
                  user.rank === 2 ? "bg-grind-neutral-200 text-grind-neutral-600" :
                  "bg-grind-neutral-50 text-grind-neutral-400"
                )}>
                  #{user.rank}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-grind-neutral-900 flex items-center gap-2">
                    {user.name}
                    {user.isUser && <span className="text-[10px] bg-accent text-white px-2 py-0.5 rounded-full">YOU</span>}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    <span className="text-[10px] font-bold text-grind-neutral-400 uppercase tracking-widest">{user.tier} TIER</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5 justify-end">
                    <Star className="w-3 h-3 text-accent fill-accent" />
                    <span className="font-black text-lg">{user.score}</span>
                  </div>
                  <p className="text-[10px] font-bold text-grind-neutral-400 uppercase tracking-widest">GrindScore</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showFundModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-end justify-center backdrop-blur-sm">
          <div className="bg-white w-full max-w-[600px] rounded-t-[40px] p-8 animate-in slide-in-from-bottom duration-500">
            <div className="w-12 h-1.5 bg-grind-neutral-200 rounded-full mx-auto mb-8" />
            <h3 className="text-3xl font-black mb-2">Fund Wallet</h3>
            <p className="text-grind-neutral-500 mb-8 font-medium">Choose a professional payment method.</p>
            
            <div className="space-y-4">
              <button 
                onClick={() => handleFund("card")}
                className="w-full p-6 border-2 border-grind-neutral-100 rounded-[24px] flex items-center gap-4 hover:border-accent transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent transition-transform group-hover:scale-110">
                  <CreditCard className="w-7 h-7" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-black text-lg">Debit Card</h4>
                  <p className="text-sm text-grind-neutral-500">Instant funding via Paystack</p>
                </div>
                <ChevronRight className="w-5 h-5 text-grind-neutral-300 group-hover:text-accent transition-transform group-hover:translate-x-1" />
              </button>

              <button 
                onClick={() => handleFund("transfer")}
                className="w-full p-6 border-2 border-grind-neutral-100 rounded-[24px] flex items-center gap-4 hover:border-accent transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent transition-transform group-hover:scale-110">
                  <Landmark className="w-7 h-7" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-black text-lg">Bank Transfer</h4>
                  <p className="text-sm text-grind-neutral-500">Secure smart contract address</p>
                </div>
                <ChevronRight className="w-5 h-5 text-grind-neutral-300 group-hover:text-accent transition-transform group-hover:translate-x-1" />
              </button>

              <Button 
                variant="ghost" 
                onClick={() => setShowFundModal(false)}
                className="w-full mt-4 h-14 font-black text-grind-neutral-400"
              >
                CANCEL
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
