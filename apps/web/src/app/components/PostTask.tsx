import React, { useState } from "react";
import {
  ChevronLeft, ArrowRight, Shield, CreditCard, Landmark,
  CheckCircle2, PenLine, Paintbrush2, Code2, BookOpen,
  Truck, FlaskConical, Video, MoreHorizontal
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../lib/utils";

interface PostTaskProps {
  onBack: () => void;
  onPostSuccess?: (taskData: any) => void;
}

const CATEGORIES = [
  { value: "Writing", label: "Writing", icon: PenLine, color: "bg-blue-50 text-blue-600" },
  { value: "Design", label: "Design", icon: Paintbrush2, color: "bg-pink-50 text-pink-600" },
  { value: "Coding", label: "Coding", icon: Code2, color: "bg-purple-50 text-purple-600" },
  { value: "Tutoring", label: "Tutoring", icon: BookOpen, color: "bg-green-50 text-green-600" },
  { value: "Delivery", label: "Delivery", icon: Truck, color: "bg-orange-50 text-orange-600" },
  { value: "Research", label: "Research", icon: FlaskConical, color: "bg-yellow-50 text-yellow-600" },
  { value: "Video", label: "Video", icon: Video, color: "bg-red-50 text-red-600" },
  { value: "Other", label: "Other", icon: MoreHorizontal, color: "bg-gray-100 text-gray-600" },
];

const DURATIONS = ["1 day", "3 days", "7 days", "14 days", "30 days"];

export function PostTask({ onBack, onPostSuccess }: PostTaskProps) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [duration, setDuration] = useState("3 days");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const budgetNum = parseFloat(budget) || 0;
  const platformFee = Math.round(budgetNum * 0.08);
  const escrowFee = Math.round(budgetNum * 0.015);
  const totalToPay = budgetNum + escrowFee;
  const doerEarns = budgetNum - platformFee;

  const canNext1 = title.trim().length >= 5 && category && description.trim().length >= 20;
  const canNext2 = budgetNum >= 500;

  const handlePay = (method: "wallet" | "card" | "transfer") => {
    if (method === "transfer") {
      const ref = `GRD-${Math.floor(Math.random() * 999999).toString().padStart(6, "0")}`;
      toast.custom((t) => (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-5 max-w-sm w-full mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-grind-accent-light rounded-2xl flex items-center justify-center">
              <Landmark className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Escrow Funding Account</p>
              <p className="text-[10px] text-gray-400">Smart Contract Bridge</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-2xl p-4 space-y-3 mb-4">
            <div><p className="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">Bank Name</p><p className="font-bold text-sm text-gray-800">Grind Market Trust (VFD)</p></div>
            <div><p className="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">Account Number</p><p className="font-extrabold text-xl tracking-widest text-gray-900">0123456789</p></div>
            <div><p className="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">Reference</p><p className="font-bold text-accent text-sm">{ref}</p></div>
            <div><p className="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">Amount</p><p className="font-bold text-sm text-gray-800">₦{totalToPay.toLocaleString()}</p></div>
          </div>
          <button
            onClick={() => { toast.dismiss(t); setLoading(true); setTimeout(() => { setLoading(false); setDone(true); }, 1500); }}
            className="w-full bg-accent text-white font-bold py-3 rounded-2xl text-sm hover:bg-grind-accent-dark active:scale-95 transition-all"
          >
            I've Made the Transfer
          </button>
        </div>
      ), { duration: 30000 });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
      onPostSuccess?.({ title, category, description, price: budgetNum, deadline: duration });
    }, 2000);
  };

  // ── Success ──────────────────────────────────────────────
  if (done) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white px-6 text-center">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Gig is Live!</h2>
        <p className="text-gray-500 text-sm mb-8 max-w-xs">Your gig is now visible to all students. Expect applications within minutes.</p>
        <button
          onClick={onBack}
          className="w-full h-14 bg-accent text-white rounded-2xl font-bold hover:bg-grind-accent-dark active:scale-95 transition-all shadow-lg shadow-accent/30"
        >
          Back to Gigs
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="px-5 pt-12 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={step === 1 ? onBack : () => setStep((s) => s - 1)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h2 className="font-bold text-gray-900">Post a Gig</h2>
            <p className="text-xs text-gray-400">Step {step} of 3</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="flex gap-1.5">
          {[1, 2, 3].map((s) => (
            <div key={s} className={cn("h-1.5 flex-1 rounded-full transition-all duration-500", s <= step ? "bg-accent" : "bg-gray-100")} />
          ))}
        </div>
      </div>

      {/* ── Step Content ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 py-6">
        {/* ─── Step 1: Details ──────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-1">What do you need done?</h3>
              <p className="text-sm text-gray-500">Be specific to attract the best talent on campus.</p>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Gig Title *</label>
              <input
                type="text"
                placeholder="e.g. Write my BUS 301 assignment (1500 words)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                className="w-full h-13 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
              <p className="text-[10px] text-gray-400 text-right mt-1">{title.length}/100</p>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 block">Category *</label>
              <div className="grid grid-cols-4 gap-2">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const active = category === cat.value;
                  return (
                    <button
                      key={cat.value}
                      onClick={() => setCategory(cat.value)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all active:scale-95",
                        active ? "border-accent bg-grind-accent-light" : "border-transparent bg-gray-50"
                      )}
                    >
                      <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", active ? "bg-accent text-white" : cat.color)}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={cn("text-[10px] font-semibold text-center", active ? "text-accent" : "text-gray-600")}>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Description *</label>
              <textarea
                placeholder="Describe exactly what needs to be done, format, and any requirements..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                maxLength={500}
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
              <p className="text-[10px] text-gray-400 text-right mt-1">{description.length}/500</p>
            </div>
          </div>
        )}

        {/* ─── Step 2: Budget & Timeline ────────────────────── */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-1">Budget & Timeline</h3>
              <p className="text-sm text-gray-500">Set a fair price and realistic deadline.</p>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">How much will you pay? *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">₦</span>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  min={500}
                  className="w-full pl-9 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-2xl font-extrabold focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
              </div>
              {budgetNum > 0 && (
                <div className="mt-3 bg-gray-50 rounded-2xl p-4 space-y-2 border border-gray-100">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Platform Fee (8%)</span>
                    <span>₦{platformFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Escrow Fee (1.5%)</span>
                    <span>₦{escrowFee.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 space-y-1.5">
                    <div className="flex justify-between text-sm font-bold text-gray-700">
                      <span>Doer Earns</span>
                      <span className="text-accent">₦{doerEarns.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-gray-900">
                      <span>You Pay</span>
                      <span>₦{totalToPay.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
              {budgetNum > 0 && budgetNum < 500 && (
                <p className="text-xs text-red-500 font-medium mt-2">Minimum budget is ₦500</p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 block">Deadline</label>
              <div className="grid grid-cols-3 gap-2">
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={cn(
                      "py-3 rounded-2xl text-sm font-semibold border-2 transition-all active:scale-95",
                      duration === d ? "bg-accent text-white border-accent shadow-sm" : "bg-gray-50 text-gray-700 border-transparent"
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── Step 3: Payment ──────────────────────────────── */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="mb-6">
              <h3 className="text-xl font-extrabold text-gray-900 mb-1">Secure Payment</h3>
              <p className="text-sm text-gray-500">Funds are held in escrow until you approve the work.</p>
            </div>

            {/* Summary card */}
            <div className="bg-accent rounded-3xl p-5 mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 pointer-events-none" />
              <p className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-1">Total to Pay</p>
              <h4 className="text-3xl font-extrabold text-white mb-1">₦{totalToPay.toLocaleString()}</h4>
              <p className="text-white/60 text-xs">Includes escrow & service fees • {duration}</p>
            </div>

            <div className="space-y-3">
              {/* Wallet */}
              <button
                onClick={() => handlePay("wallet")}
                disabled={loading}
                className="w-full border-2 border-accent bg-grind-accent-light rounded-2xl p-4 flex items-center gap-4 active:scale-[0.99] transition-all disabled:opacity-60"
              >
                <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center text-white"><Shield className="w-6 h-6" /></div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-gray-900">Pay from Wallet</p>
                  <p className="text-xs text-gray-500">Instant • Most secure</p>
                </div>
                {loading && <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />}
              </button>

              {/* Card */}
              <button
                onClick={() => handlePay("card")}
                disabled={loading}
                className="w-full border-2 border-gray-100 rounded-2xl p-4 flex items-center gap-4 active:scale-[0.99] transition-all hover:border-gray-200 disabled:opacity-60"
              >
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center"><CreditCard className="w-6 h-6 text-gray-600" /></div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-gray-900">Debit Card</p>
                  <p className="text-xs text-gray-500">Instant via Paystack</p>
                </div>
              </button>

              {/* Bank Transfer */}
              <button
                onClick={() => handlePay("transfer")}
                disabled={loading}
                className="w-full border-2 border-gray-100 rounded-2xl p-4 flex items-center gap-4 active:scale-[0.99] transition-all hover:border-gray-200 disabled:opacity-60"
              >
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center"><Landmark className="w-6 h-6 text-gray-600" /></div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-gray-900">Bank Transfer</p>
                  <p className="text-xs text-gray-500">Smart contract address</p>
                </div>
              </button>
            </div>

            <div className="mt-5 flex items-start gap-2.5 bg-grind-accent-light rounded-2xl p-3.5">
              <Shield className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600">Every payment is protected by the GrindEscrow smart contract. You get a full refund if the doer misses the deadline.</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Footer CTA ──────────────────────────────────────── */}
      <div className="px-5 py-4 pb-safe border-t border-gray-100 bg-white">
        {step < 3 ? (
          <div className="flex gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex-1 h-13 bg-gray-50 text-gray-700 rounded-2xl font-bold py-3.5 hover:bg-gray-100 active:scale-95 transition-all"
              >
                Back
              </button>
            )}
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={step === 1 ? !canNext1 : !canNext2}
              className="flex-[2] h-13 bg-accent text-white rounded-2xl font-bold py-3.5 flex items-center justify-center gap-2 hover:bg-grind-accent-dark active:scale-95 transition-all shadow-lg shadow-accent/30 disabled:opacity-40 disabled:shadow-none"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
