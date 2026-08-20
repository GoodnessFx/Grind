import React, { useState } from "react";
import { Mail, ArrowRight, Shield, Phone } from "lucide-react";
import { Button } from "./Button";
import { toast } from "sonner";

interface LoginProps {
  onLogin: (userData: any) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"choice" | "email">("choice");

  const simulateWelcomeEmail = (userData: any) => {
    toast.custom((t) => (
      <div className="bg-white border-2 border-accent rounded-[32px] p-6 shadow-2xl max-w-sm animate-in zoom-in duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-black text-primary">Welcome to Grind!</h4>
            <p className="text-[10px] font-bold text-grind-neutral-400 uppercase tracking-widest">New Email Notification</p>
          </div>
        </div>
        <p className="text-xs text-grind-neutral-600 leading-relaxed mb-4">
          Hi <b>{userData.userName}</b>, we're excited to have you on campus! <br/><br/>
          Your account is now active. You can start earning cNGN by completing tasks or post your own. <br/><br/>
          <b>Support Hotline:</b> +2348072027335
        </p>
        <Button onClick={() => toast.dismiss(t)} className="w-full h-10 py-0 text-[10px] font-black">
          GOT IT
        </Button>
      </div>
    ), { duration: 10000 });
  };

  const handleGoogleLogin = () => {
    const userData = {
      userName: "IG",
      handle: "@ig_grind",
      email: "ig@university.edu.ng",
      school: "University of Lagos",
      level: "300L",
      score: 672,
      tier: "GOLD",
      walletBalance: 12500,
      transactions: [
        { id: "TX123", title: "Business Law Essay", amount: -3500, date: "2026-06-04", status: "Completed" },
        { id: "TX122", title: "Wallet Funding (Card)", amount: 5000, date: "2026-06-03", status: "Completed" },
      ],
      referrals: 12,
      notifications: [
        { id: 1, title: "Welcome to Grind!", message: "Get started by browsing available gigs.", time: "Just now" }
      ]
    };
    simulateWelcomeEmail(userData);
    onLogin(userData);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      const userData = {
        userName: email.split("@")[0],
        handle: `@${email.split("@")[0]}`,
        email: email,
        school: "University of Lagos",
        level: "100L",
        score: 0,
        tier: "STARTER",
        walletBalance: 0,
        transactions: [],
        referrals: 0,
        notifications: [
          { id: 1, title: "Welcome to Grind!", message: "Get started by browsing available gigs.", time: "Just now" }
        ]
      };
      simulateWelcomeEmail(userData);
      onLogin(userData);
    }
  };

  return (
    <div className="min-h-screen bg-white px-6 flex flex-col justify-center max-w-[600px] mx-auto">
      <div className="mb-12 text-center">
        <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3 shadow-lg">
          <span className="text-white text-3xl font-bold">O</span>
        </div>
        <h1 className="text-3xl font-bold text-grind-neutral-900 mb-2">Oui Market</h1>
        <p className="text-grind-neutral-500">The trustless campus gig economy</p>
      </div>

      {step === "choice" ? (
        <div className="space-y-4">
          <Button 
            onClick={handleGoogleLogin}
            variant="outline" 
            className="w-full h-14 font-medium flex items-center justify-center gap-3"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Continue with Google
          </Button>
          
          <Button 
            onClick={() => setStep("email")}
            className="w-full h-14 bg-accent hover:bg-accent/90 text-white font-medium flex items-center justify-center gap-3"
          >
            <Mail className="w-5 h-5" />
            Continue with Email
          </Button>

          <div className="mt-8 p-4 bg-grind-neutral-50 rounded-xl border border-grind-neutral-100">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-4 h-4 text-accent" />
              <span className="text-xs font-bold uppercase tracking-wider text-grind-neutral-500">Security First</span>
            </div>
            <p className="text-xs text-grind-neutral-500 leading-relaxed">
              Every transaction is protected by smart contracts. No human can unilaterally move your funds.
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-xs text-grind-neutral-400 mt-6">
            <Phone className="w-3 h-3" />
            Support: +2348072027335
          </div>
        </div>
      ) : (
        <form onSubmit={handleEmailSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div>
            <label className="block text-sm font-medium text-grind-neutral-700 mb-2">
              School Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@unilag.edu.ng"
              className="w-full h-14 px-4 rounded-xl border border-grind-neutral-200 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
              required
            />
            <p className="mt-2 text-xs text-grind-neutral-500 flex items-center gap-1.5 font-bold uppercase tracking-tighter">
              <Shield className="w-3 h-3 text-accent" />
              Must be a valid .edu.ng address
            </p>
          </div>

          <Button type="submit" className="w-full h-14 bg-accent hover:bg-accent/90 text-white font-medium flex items-center justify-center gap-2">
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>

          <button 
            type="button"
            onClick={() => setStep("choice")}
            className="w-full text-center text-sm text-grind-neutral-500 hover:text-grind-neutral-700 transition-colors"
          >
            Back to options
          </button>
        </form>
      )}
    </div>
  );
}
