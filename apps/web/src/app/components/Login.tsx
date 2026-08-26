import React, { useMemo, useState } from "react";
import { Eye, EyeOff, ArrowRight, Shield, ChevronLeft, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import type { UserData } from "../App";
import { LogoMark } from "./brand/LogoMark";
import { cn } from "../../lib/utils";

interface LoginProps {
  onLogin: (userData: UserData) => void;
  /**
   * Optional context shown on the welcome step (used for referral / gig deep-link landings).
   */
  context?: {
    title?: string;
    subtitle?: string;
    prelude?: React.ReactNode;
  };
  initialStep?: Step;
  /**
   * `full`: default full-screen login page
   * `card`: renders without enforcing full-height/background (meant to be embedded in a shell)
   */
  layout?: "full" | "card";
}

type Step = "welcome" | "phone" | "email" | "otp" | "register";

function makeUser(overrides: Partial<UserData> = {}): UserData {
  return {
    id: crypto.randomUUID(),
    userName: "Goodness",
    handle: "@goodness_grind",
    email: "goodness@unilag.edu.ng",
    school: "University of Lagos",
    level: "300L",
    score: 672,
    tier: "GOLD",
    walletBalance: 12500,
    isCreator: false,
    referrals: 3,
    bio: "Campus hustler. Writing | Design | Tutoring",
    phone: "+234 807 202 7335",
    transactions: [
      { id: "TX001", title: "Calculus Tutoring", amount: 8500, date: "Aug 18, 2026", status: "Completed", type: "earn" },
      { id: "TX002", title: "Event Flyer Design", amount: 5000, date: "Aug 15, 2026", status: "Completed", type: "earn" },
      { id: "TX003", title: "Wallet Funding", amount: 10000, date: "Aug 10, 2026", status: "Completed", type: "fund" },
      { id: "TX004", title: "Business Law Essay", amount: -3500, date: "Aug 5, 2026", status: "Completed", type: "spend" },
    ],
    notifications: [
      { id: 1, title: "Welcome to Grind!", message: "Start earning cNGN by completing campus gigs.", time: "Just now", read: false },
      { id: 2, title: "New gig matched", message: "A writing gig matching your skills just dropped.", time: "2h ago", read: false },
    ],
    ...overrides,
  };
}

export function Login({ onLogin, context, initialStep, layout = "full" }: LoginProps) {
  const [step, setStep] = useState<Step>(initialStep ?? "welcome");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");

  const welcomeTitle = useMemo(() => context?.title ?? "Welcome to Grind", [context?.title]);
  const welcomeSubtitle = useMemo(
    () => context?.subtitle ?? "The campus gig economy for Nigerian students",
    [context?.subtitle]
  );

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Welcome back to Grind!");
      onLogin(makeUser());
    }, 1200);
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.replace(/\D/g, "").length < 10) {
      toast.error("Enter a valid phone number");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
    }, 800);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Enter a valid email address");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("register");
    }, 800);
  };

  const handleOtpChange = (val: string, idx: number) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) {
      const el = document.getElementById(`otp-${idx + 1}`);
      el?.focus();
    }
  };

  const handleOtpSubmit = () => {
    const code = otp.join("");
    if (code.length < 6) {
      toast.error("Enter all 6 digits");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Any 6-digit code works in demo
      toast.success("Phone verified!");
      onLogin(makeUser({ phone }));
    }, 1000);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Enter your full name"); return; }
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Account created! Welcome to Grind 🎉");
      onLogin(makeUser({
        userName: name,
        handle: `@${name.toLowerCase().replace(/\s/g, "_")}`,
        email,
        score: 0,
        tier: "STARTER",
        walletBalance: 0,
        transactions: [],
        notifications: [
          { id: 1, title: "Welcome to Grind!", message: "Start earning by completing campus gigs.", time: "Just now", read: false },
        ],
      }));
    }, 1200);
  };

  return (
    <div className={cn(layout === "full" ? "h-full bg-white flex flex-col overflow-y-auto" : "flex flex-col")}>
      {/* Header */}
      {step !== "welcome" && (
        <div className={cn("flex items-center gap-3 px-5 pb-2", layout === "full" ? "pt-12" : "pt-6")}>
          <button
            onClick={() => setStep(step === "otp" ? "phone" : step === "register" ? "email" : "welcome")}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      )}

      <div className={cn(layout === "full" ? "flex-1 flex flex-col px-6" : "flex flex-col px-6")}>
        {/* ── Welcome ─────────────────────────────────────────── */}
        {step === "welcome" && (
          <div className={cn("flex flex-col", layout === "full" ? "flex-1" : "")}>
            {context?.prelude && (
              <div className={cn("pt-7", layout === "full" ? "pb-2" : "pb-3")}>
                {context.prelude}
              </div>
            )}
            {/* Logo area */}
            <div className={cn("flex flex-col items-center", layout === "full" ? "pt-16 pb-10" : "pt-4 pb-7")}>
              <div className="w-20 h-20 bg-accent rounded-3xl flex items-center justify-center mb-6 shadow-lg">
                <LogoMark size={46} tone="light" />
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{welcomeTitle}</h1>
              <p className="text-gray-500 text-sm mt-2 text-center leading-relaxed">
                {welcomeSubtitle}
              </p>
            </div>

            {/* Auth buttons */}
            <div className="space-y-3 mt-2">
              {/* Google */}
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full h-14 bg-white border border-gray-200 rounded-2xl flex items-center justify-center gap-3 font-semibold text-gray-800 hover:bg-gray-50 active:scale-[0.98] transition-all shadow-sm disabled:opacity-60"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                {loading ? "Signing in…" : "Continue with Google"}
              </button>

              {/* Phone */}
              <button
                onClick={() => setStep("phone")}
                className="w-full h-14 bg-white border border-gray-200 rounded-2xl flex items-center justify-center gap-3 font-semibold text-gray-800 hover:bg-gray-50 active:scale-[0.98] transition-all shadow-sm"
              >
                <Phone className="w-5 h-5 text-accent" />
                Continue with Phone
              </button>

              {/* Email */}
              <button
                onClick={() => setStep("email")}
                className="w-full h-14 bg-accent rounded-2xl flex items-center justify-center gap-3 font-semibold text-white hover:bg-grind-accent-dark active:scale-[0.98] transition-all shadow-lg shadow-accent/30"
              >
                <Mail className="w-5 h-5" />
                Continue with Email
              </button>
            </div>

            {/* Trust badge */}
            <div className="mt-8 p-4 bg-grind-accent-light rounded-2xl flex items-start gap-3">
              <Shield className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600 leading-relaxed">
                <span className="font-semibold text-gray-800">Secured by smart contracts.</span> Your funds are locked in escrow until work is approved. No one can touch them without your consent.
              </p>
            </div>

            <p className="text-xs text-gray-400 text-center mt-6 pb-8">
              By continuing, you agree to Grind's{" "}
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-accent font-medium hover:underline">Terms of Service</a> &{" "}
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-accent font-medium hover:underline">Privacy Policy</a>
            </p>
          </div>
        )}

        {/* ── Phone step ────────────────────────────────────── */}
        {step === "phone" && (
          <div className="flex flex-col flex-1 pt-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Enter your number</h2>
            <p className="text-gray-500 text-sm mb-8">We'll send a 6-digit code to verify</p>
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="flex gap-2">
                <div className="w-16 h-14 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center font-semibold text-gray-700">
                  🇳🇬
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="080 0000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 h-14 px-4 bg-gray-50 border border-gray-200 rounded-2xl text-base font-medium focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-accent text-white rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-grind-accent-dark active:scale-[0.98] transition-all shadow-lg shadow-accent/30 disabled:opacity-60"
              >
                {loading ? "Sending…" : <>Send Code <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          </div>
        )}

        {/* ── OTP step ──────────────────────────────────────── */}
        {step === "otp" && (
          <div className="flex flex-col flex-1 pt-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Verify your number</h2>
            <p className="text-gray-500 text-sm mb-8">Enter the 6-digit code sent to <span className="font-semibold text-gray-700">{phone}</span></p>

            <div className="flex gap-2 justify-between mb-8">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, idx)}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !digit && idx > 0) {
                      document.getElementById(`otp-${idx - 1}`)?.focus();
                    }
                  }}
                  className="w-12 h-14 text-center text-xl font-bold bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                  autoFocus={idx === 0}
                />
              ))}
            </div>

            <button
              onClick={handleOtpSubmit}
              disabled={loading}
              className="w-full h-14 bg-accent text-white rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-grind-accent-dark active:scale-[0.98] transition-all shadow-lg shadow-accent/30 disabled:opacity-60"
            >
              {loading ? "Verifying…" : "Verify & Continue"}
            </button>

            <button
              onClick={() => toast.info("Code resent!")}
              className="mt-4 text-center text-sm text-accent font-medium w-full py-3"
            >
              Didn't receive a code? Resend
            </button>
          </div>
        )}

        {/* ── Email step ────────────────────────────────────── */}
        {step === "email" && (
          <div className="flex flex-col flex-1 pt-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Enter your email</h2>
            <p className="text-gray-500 text-sm mb-8">Use your school email for verified access</p>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="yourname@school.edu.ng"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-14 px-4 bg-gray-50 border border-gray-200 rounded-2xl text-base font-medium focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                autoFocus
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-accent text-white rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-grind-accent-dark active:scale-[0.98] transition-all shadow-lg shadow-accent/30 disabled:opacity-60"
              >
                {loading ? "Checking…" : <>Continue <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          </div>
        )}

        {/* ── Register step ─────────────────────────────────── */}
        {step === "register" && (
          <div className="flex flex-col flex-1 pt-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h2>
            <p className="text-gray-500 text-sm mb-8">You're one step away from your first gig</p>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Goodness Iyamah"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-14 px-4 bg-gray-50 border border-gray-200 rounded-2xl text-base font-medium focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Email</label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full h-14 px-4 bg-gray-100 border border-gray-200 rounded-2xl text-base font-medium text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-14 px-4 pr-12 bg-gray-50 border border-gray-200 rounded-2xl text-base font-medium focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-accent text-white rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-grind-accent-dark active:scale-[0.98] transition-all shadow-lg shadow-accent/30 disabled:opacity-60 mt-2"
              >
                {loading ? "Creating account…" : "Create Account"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
