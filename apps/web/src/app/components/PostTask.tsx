import { useState } from "react";
import { ArrowLeft, ArrowRight, ShieldCheck, CreditCard, Landmark, Check, Edit2, Sparkles, Briefcase, Star, Clock, Shield, Camera, Settings } from "lucide-react";
import { Button } from "./Button";
import { cn } from "../../lib/utils";
import { toast } from "sonner";

interface PostTaskProps {
  onBack: () => void;
  onPostSuccess?: (taskData: any) => void;
}

const categories = [
  { value: "writing", label: "Writing", icon: <Edit2 className="w-5 h-5" /> },
  { value: "design", label: "Design", icon: <Sparkles className="w-5 h-5" /> },
  { value: "coding", label: "Coding", icon: <Briefcase className="w-5 h-5" /> },
  { value: "tutoring", label: "Tutoring", icon: <Star className="w-5 h-5" /> },
  { value: "delivery", label: "Delivery", icon: <Clock className="w-5 h-5" /> },
  { value: "research", label: "Research", icon: <Shield className="w-5 h-5" /> },
  { value: "video", label: "Video", icon: <Camera className="w-5 h-5" /> },
  { value: "other", label: "Other", icon: <Settings className="w-5 h-5" /> },
];

const durations = ["1 day", "3 days", "7 days", "14 days", "30 days"];

export function PostTask({ onBack, onPostSuccess }: PostTaskProps) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [duration, setDuration] = useState("3 days");
  const [showPayment, setShowPayment] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const platformFee = budget ? Math.round(parseFloat(budget) * 0.08) : 0;
  const escrowFee = budget ? Math.round(parseFloat(budget) * 0.015) : 0;
  const totalToPay = budget ? parseFloat(budget) + escrowFee : 0;
  const doerEarns = budget ? parseFloat(budget) - platformFee : 0;

  const handlePost = (method: "card" | "transfer" | "wallet") => {
    if (method === "transfer") {
      toast.custom((t) => (
        <div className="bg-white border-2 border-accent rounded-[32px] p-6 shadow-2xl max-w-sm animate-in zoom-in duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-primary text-sm">Escrow Funding Account</h4>
              <p className="text-[10px] font-bold text-grind-neutral-400 uppercase tracking-widest">Base Smart Contract Bridge</p>
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
              <p className="text-[10px] font-bold text-grind-neutral-400 uppercase mb-1">Payment Reference</p>
              <p className="text-sm font-black text-accent uppercase tracking-wider">OUI-{Math.floor(Math.random() * 999999)}</p>
            </div>
          </div>
          <p className="text-[10px] text-grind-neutral-500 mb-4 leading-relaxed">
            Funds will be instantly locked in the OuiEscrow contract (0x8a9B...F2e4) once received.
          </p>
          <Button onClick={() => {
            toast.dismiss(t);
            setIsSuccess(true);
          }} className="w-full h-10 py-0 text-[10px] font-black">
            I'VE MADE THE TRANSFER
          </Button>
        </div>
      ), { duration: 20000 });
      return;
    }
    
    toast.loading(`Processing ₦${totalToPay.toLocaleString()} via ${method}...`);
    setTimeout(() => {
      toast.dismiss();
      setIsSuccess(true);
      toast.success("Task posted and funded successfully!");
      if (onPostSuccess) {
        onPostSuccess({
          title,
          category,
          description,
          price: parseFloat(budget),
          deadline: duration,
        });
      }
    }, 3000);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-grind-success/10 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <Check className="w-10 h-10 text-grind-success" />
        </div>
        <h2 className="text-3xl font-black mb-2">Task is Live!</h2>
        <p className="text-grind-neutral-500 mb-8 max-w-[300px]">
          Your task has been funded and is now visible to all students at Unilag.
        </p>
        <Button onClick={onBack} className="w-full h-14">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="sticky top-0 bg-white border-b border-grind-neutral-200 z-10">
        <div className="max-w-[600px] mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={onBack} className="p-2 -ml-2 hover:bg-grind-neutral-50 rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="font-bold flex-1">Post a New Gig</h2>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-all duration-500",
                  s <= step ? "bg-accent" : "bg-grind-neutral-100"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[600px] mx-auto px-4 py-8">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-black mb-2">What do you need?</h2>
            <p className="text-sm text-grind-neutral-500 mb-8 font-medium">
              Be specific to attract the best doers on campus.
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-grind-neutral-400 mb-2">Task title</label>
                <input
                  type="text"
                  placeholder="e.g. Help me with Calculus homework"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-4 bg-grind-neutral-50 border border-grind-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-grind-neutral-400 mb-2">Category</label>
                <div className="grid grid-cols-4 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setCategory(cat.value)}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2",
                        category === cat.value
                          ? "border-accent bg-accent/5 scale-105"
                          : "border-grind-neutral-100 hover:border-grind-neutral-200"
                      )}
                    >
                      <div className={cn(
                        "transition-colors",
                        category === cat.value ? "text-accent" : "text-grind-neutral-400"
                      )}>
                        {cat.icon}
                      </div>
                      <div className="text-[10px] font-bold uppercase">{cat.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-grind-neutral-400 mb-2">Description</label>
                <textarea
                  placeholder="Tell us exactly what needs to be done..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-4 bg-grind-neutral-50 border border-grind-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none font-medium"
                />
                <div className="text-[10px] font-bold text-grind-neutral-400 text-right mt-2">
                  {description.length} / 500 CHARACTERS
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-black mb-2">Budget & Timeline</h2>
            <p className="text-sm text-grind-neutral-500 mb-8 font-medium">
              Set a professional price and a realistic deadline.
            </p>

            <div className="space-y-8">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-grind-neutral-400 mb-2">How much will you pay?</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-grind-neutral-400 font-black text-xl">
                    ₦
                  </span>
                  <input
                    type="number"
                    placeholder="0"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full pl-10 pr-4 py-6 bg-grind-neutral-50 border border-grind-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-3xl font-black"
                  />
                </div>
                <div className="mt-4 p-4 bg-grind-neutral-50 rounded-2xl border border-grind-neutral-100 space-y-2">
                  <div className="flex justify-between text-xs font-medium text-grind-neutral-500">
                    <span>Platform Fee (8%)</span>
                    <span>₦{platformFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs font-medium text-grind-neutral-500">
                    <span>Escrow Service Fee (1.5%)</span>
                    <span>₦{escrowFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-grind-neutral-200">
                    <span className="text-sm font-bold">The Doer Earns</span>
                    <span className="text-sm font-black text-grind-success">₦{doerEarns.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-grind-neutral-400 mb-2">
                  Duration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {durations.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={cn(
                        "px-4 py-3 rounded-xl text-xs font-bold transition-all",
                        duration === d
                          ? "bg-accent text-white shadow-lg"
                          : "bg-grind-neutral-50 text-grind-neutral-700 hover:bg-grind-neutral-100"
                      )}
                    >
                      {d.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-black mb-2">Secure Payment</h2>
            <p className="text-sm text-grind-neutral-500 mb-8 font-medium">
              Funds are held trustlessly until you approve the work.
            </p>

            <div className="bg-primary text-white rounded-[32px] p-6 mb-8 relative overflow-hidden shadow-xl">
              <div className="relative z-10">
                <p className="text-xs opacity-70 mb-1 uppercase tracking-widest font-bold">Total to Pay</p>
                <h3 className="text-4xl font-black mb-1 flex items-center gap-2">
                  ₦{totalToPay.toLocaleString()}
                  <span className="text-sm font-bold bg-white/20 px-2 py-0.5 rounded">cNGN</span>
                </h3>
                <p className="text-[10px] opacity-60">Includes all service and escrow fees</p>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full -mr-16 -mt-16 blur-2xl" />
            </div>

            <div className="space-y-4">
              <button 
                onClick={() => handlePost("wallet")}
                className="w-full p-6 border-2 border-accent bg-accent/5 rounded-3xl flex items-center gap-4 hover:bg-accent/10 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-white">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-bold">Pay from Wallet</h4>
                  <p className="text-xs text-grind-neutral-500">Fastest & most secure</p>
                </div>
              </button>

              <button 
                onClick={() => handlePost("card")}
                className="w-full p-6 border-2 border-grind-neutral-100 rounded-3xl flex items-center gap-4 hover:border-accent transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-bold text-grind-neutral-900">Pay with Debit Card</h4>
                  <p className="text-xs text-grind-neutral-500">Instant funding via Paystack</p>
                </div>
              </button>

              <button 
                onClick={() => handlePost("transfer")}
                className="w-full p-6 border-2 border-grind-neutral-100 rounded-3xl flex items-center gap-4 hover:border-accent transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                  <Landmark className="w-6 h-6" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-bold text-grind-neutral-900">Bank Transfer</h4>
                  <p className="text-xs text-grind-neutral-500">Secure smart contract address</p>
                </div>
              </button>
            </div>

            <div className="mt-8 p-4 bg-grind-accent-light rounded-2xl border border-accent/20 flex gap-3">
              <ShieldCheck className="w-5 h-5 text-accent shrink-0" />
              <p className="text-[10px] text-accent font-bold uppercase leading-relaxed tracking-wider">
                Every transaction is protected by the OuiEscrow smart contract.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-grind-neutral-100 p-6 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-[600px] mx-auto flex gap-4">
          {step > 1 && (
            <Button variant="ghost" onClick={() => setStep(step - 1)} className="flex-1 h-14">
              <ArrowLeft className="w-4 h-4 mr-2" />
              BACK
            </Button>
          )}
          {step < 3 && (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 1 && (!title || !category || !description)) ||
                (step === 2 && (!budget || parseFloat(budget) < 500))
              }
              className="flex-[2] h-14 font-black"
            >
              CONTINUE
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
