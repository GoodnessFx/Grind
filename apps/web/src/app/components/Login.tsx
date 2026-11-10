import React, { useState, useMemo } from "react";
import { Eye, EyeOff, ArrowRight, Phone, Mail, Shield, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { LogoMark } from "./brand/LogoMark";
import { cn } from "../../lib/utils";
import {
  signInWithEmail, signUpWithEmail, signInWithGoogle,
  signInWithPhone, verifyPhoneOtp, sendEmailOtp, verifyEmailOtp,
  upsertProfile, fetchProfile, supabase,
} from "../../lib/auth";
import type { UserData } from "../App";

interface LoginProps {
  onLogin: (userData: UserData) => void;
  context?: {
    title?: string;
    subtitle?: string;
    prelude?: React.ReactNode;
  };
  initialStep?: Step;
  layout?: "full" | "card";
}

type Step = "welcome" | "phone" | "email" | "otp" | "phone_otp" | "register";

function supabaseProfileToUserData(profile: any): UserData {
  return {
    id: profile.id,
    userName: profile.full_name || profile.handle || "Hustler",
    handle: profile.handle ? (profile.handle.startsWith("@") ? profile.handle : `@${profile.handle}`) : "@user",
    email: profile.email || "",
    school: profile.campus || "University",
    level: profile.level || "300L",
    score: profile.grind_score || 0,
    tier: profile.tier || "Fresher",
    walletBalance: profile.wallet_balance ? profile.wallet_balance / 100 : 0,
    isCreator: profile.is_creator || false,
    referrals: 0,
    bio: profile.bio || "",
    phone: profile.phone || "",
    transactions: [],
    notifications: [
      { id: 1, title: "Welcome to Grind!", message: "Start earning by completing campus gigs.", time: "Just now", read: false },
    ],
    skills: profile.skills || [],
    lang: profile.lang || "pidgin",
    campus: profile.campus,
    hostel: profile.hostel,
  } as any;
}

function makeDemoUser(overrides: Partial<UserData> = {}): UserData {
  return {
    id: `demo_${Date.now()}`,
    userName: "Goodness",
    handle: "@goodness_grind",
    email: "goodness@unilag.edu.ng",
    school: "University of Lagos",
    level: "300L",
    score: 672,
    tier: "Plug",
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
    skills: ["Writing", "Design"],
    lang: "pidgin",
    ...overrides,
  } as any;
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
  const welcomeSubtitle = useMemo(() => context?.subtitle ?? "Way for poor people.", [context?.subtitle]);

  // ── Helpers ───────────────────────────────────────────────
  const afterAuth = async (userId?: string, fallbackUser?: UserData) => {
    try {
      if (userId) {
        const profile = await fetchProfile(userId);
        if (profile) { onLogin(supabaseProfileToUserData(profile)); return; }
      }
    } catch { /* fall through to demo */ }
    onLogin(fallbackUser ?? makeDemoUser());
  };

  // ── Google ────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      // Redirect handled by OAuth — but if running locally without redirect:
      toast.success("Redirecting to Google...");
    } catch {
      // Demo fallback
      toast.success("Welcome back to Grind!");
      onLogin(makeDemoUser());
    } finally {
      setLoading(false);
    }
  };

  // ── Phone → OTP ───────────────────────────────────────────
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) { toast.error("Enter a valid phone number"); return; }
    const formatted = digits.startsWith("0") ? `+234${digits.slice(1)}` : `+${digits}`;
    setLoading(true);
    try {
      await signInWithPhone(formatted);
      setPhone(formatted);
      setOtp(["", "", "", "", "", ""]);
      setStep("phone_otp");
      toast.success(`Code sent to ${formatted}`);
    } catch (err: any) {
      // Demo fallback when Supabase phone not configured
      if (err.message?.includes("placeholder") || err.message?.includes("fetch") || err.message?.includes("disabled")) {
        setStep("phone_otp");
        toast.success("Demo mode: use any 6-digit code");
      } else {
        toast.error("Could not send code. Try email instead.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── OTP verify (phone) ────────────────────────────────────
  const handlePhoneOtpSubmit = async () => {
    const code = otp.join("");
    if (code.length < 6) { toast.error("Enter all 6 digits"); return; }
    setLoading(true);
    try {
      const { user } = await verifyPhoneOtp(phone, code);
      toast.success("Phone verified!");
      await afterAuth(user?.id, makeDemoUser({ phone }));
    } catch (err: any) {
      if (err.message?.includes("placeholder") || err.message?.includes("fetch")) {
        // Demo: accept any code
        toast.success("Phone verified!");
        onLogin(makeDemoUser({ phone }));
      } else {
        toast.error("Wrong code or code expired. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Email step ────────────────────────────────────────────
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) { toast.error("Enter a valid email address"); return; }
    setLoading(true);
    try {
      await sendEmailOtp(email);
      setOtp(["", "", "", "", "", ""]);
      setStep("otp");
      toast.success("Code sent. Check your inbox.");
    } catch (err: any) {
      // If Supabase not configured, go straight to register/password
      setStep("register");
    } finally {
      setLoading(false);
    }
  };

  // ── OTP verify (email) ────────────────────────────────────
  const handleEmailOtpSubmit = async () => {
    const code = otp.join("");
    if (code.length < 6) { toast.error("Enter all 6 digits"); return; }
    setLoading(true);
    try {
      const { user } = await verifyEmailOtp(email, code);
      toast.success("Email verified! Welcome to Grind 🎉");
      await afterAuth(user?.id, makeDemoUser({ email }));
    } catch (err: any) {
      if (err.message?.includes("placeholder") || err.message?.includes("fetch")) {
        onLogin(makeDemoUser({ email }));
      } else {
        toast.error("Wrong code or code expired.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Register (email + password) ───────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Enter your full name"); return; }
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const { user } = await signUpWithEmail(email, password);
      if (user) {
        const handle = `${name.toLowerCase().replace(/\s+/g, "_")}_${Math.floor(Math.random() * 9000) + 1000}`;
        await upsertProfile(user.id, {
          email, handle,
          full_name: name.trim(),
          onboarding_step: 1,
        } as any);
        toast.success("Account created! Welcome to Grind 🎉");
        await afterAuth(user.id, makeDemoUser({ userName: name, email, handle: `@${handle}`, score: 0, tier: "Fresher", walletBalance: 0, transactions: [], notifications: [{ id: 1, title: "Welcome to Grind!", message: "Start earning by completing campus gigs.", time: "Just now", read: false }] }));
      }
    } catch (err: any) {
      if (err.message?.includes("placeholder") || err.message?.includes("fetch") || err.message?.includes("network")) {
        // Demo fallback
        const demoHandle = `@${name.toLowerCase().replace(/\s+/g, "_")}`;
        const demoUser = makeDemoUser({ userName: name, email, handle: demoHandle, score: 0, tier: "Fresher", walletBalance: 0, transactions: [], notifications: [{ id: 1, title: "Welcome to Grind!", message: "Start earning by completing campus gigs.", time: "Just now", read: false }] });
        toast.success("Account created! Welcome to Grind 🎉");
        onLogin(demoUser);
      } else if (err.message?.includes("already registered")) {
        // Try sign in instead
        try {
          const { user } = await signInWithEmail(email, password);
          toast.success("Welcome back!");
          await afterAuth(user?.id);
        } catch {
          toast.error("That email is already registered. Try logging in.");
        }
      } else {
        toast.error(err.message ?? "Sign-up failed. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── OTP input helpers ─────────────────────────────────────
  const handleOtpChange = (val: string, idx: number) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[idx] = val; setOtp(next);
    if (val && idx < 5) (document.getElementById(`otp-${idx + 1}`) as HTMLInputElement | null)?.focus();
  };

  const resend = async () => {
    setOtp(["", "", "", "", "", ""]);
    if (step === "phone_otp") { await handlePhoneSubmit({ preventDefault: () => {} } as any); }
    else { await handleEmailSubmit({ preventDefault: () => {} } as any); }
  };

  // ── Render ────────────────────────────────────────────────
  const otpInputs = (
    <div className="flex gap-2 justify-between">
      {otp.map((d, i) => (
        <input key={i} id={`otp-${i}`} type="text" inputMode="numeric" maxLength={1} value={d}
          onChange={e => handleOtpChange(e.target.value, i)}
          onKeyDown={e => { if (e.key === "Backspace" && !d && i > 0) (document.getElementById(`otp-${i - 1}`) as HTMLInputElement | null)?.focus(); }}
          className="w-12 h-14 text-center text-xl font-bold bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          autoFocus={i === 0} />
      ))}
    </div>
  );

  return (
    <div className={cn(layout === "full" ? "h-full bg-white flex flex-col overflow-y-auto" : "flex flex-col")}>
      {step !== "welcome" && (
        <div className={cn("flex items-center gap-3 px-5 pb-2", layout === "full" ? "pt-12" : "pt-6")}>
          <button onClick={() => setStep(step === "otp" ? "email" : step === "phone_otp" ? "phone" : step === "register" ? "email" : "welcome")}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      )}

      <div className={cn(layout === "full" ? "flex-1 flex flex-col px-6" : "flex flex-col px-6")}>

        {/* ── Welcome ───────────────────────────────────────── */}
        {step === "welcome" && (
          <div className={cn("flex flex-col", layout === "full" ? "flex-1" : "")}>
            {context?.prelude && <div className={cn("pt-7", layout === "full" ? "pb-2" : "pb-3")}>{context.prelude}</div>}
            <div className={cn("flex flex-col items-center", layout === "full" ? "pt-16 pb-10" : "pt-4 pb-7")}>
              <div className="w-20 h-20 bg-accent rounded-3xl flex items-center justify-center mb-6 shadow-lg">
                <LogoMark size={46} tone="light" />
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{welcomeTitle}</h1>
              <p className="text-gray-500 text-sm mt-2 text-center leading-relaxed">{welcomeSubtitle}</p>
            </div>
            <div className="space-y-3 mt-2">
              <button onClick={handleGoogleLogin} disabled={loading}
                className="w-full h-14 bg-white border border-gray-200 rounded-2xl flex items-center justify-center gap-3 font-semibold text-gray-800 hover:bg-gray-50 active:scale-[0.98] transition-all shadow-sm disabled:opacity-60">
                <img src="https://www.google.com/favicon.ico" alt="" className="w-5 h-5" />
                {loading ? "Please wait..." : "Continue with Google"}
              </button>
              <button onClick={() => setStep("phone")}
                className="w-full h-14 bg-white border border-gray-200 rounded-2xl flex items-center justify-center gap-3 font-semibold text-gray-800 hover:bg-gray-50 active:scale-[0.98] transition-all shadow-sm">
                <Phone className="w-5 h-5 text-accent" /> Continue with Phone
              </button>
              <button onClick={() => setStep("email")}
                className="w-full h-14 bg-accent rounded-2xl flex items-center justify-center gap-3 font-bold text-white hover:bg-grind-accent-dark active:scale-[0.98] transition-all shadow-lg shadow-accent/30">
                <Mail className="w-5 h-5" /> Continue with Email
              </button>
            </div>
            <div className="mt-8 p-4 bg-grind-accent-light rounded-2xl flex items-start gap-3">
              <Shield className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600 leading-relaxed">
                <span className="font-semibold text-gray-800">Secured by escrow.</span> Your funds lock in a smart contract until work is approved. Nobody moves your money without your say.
              </p>
            </div>
            <p className="text-xs text-gray-400 text-center mt-6 pb-8">
              By continuing you agree to Grind's <span className="text-accent font-medium">Terms</span> & <span className="text-accent font-medium">Privacy Policy</span>
            </p>
          </div>
        )}

        {/* ── Phone ─────────────────────────────────────────── */}
        {step === "phone" && (
          <div className="flex flex-col flex-1 pt-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Enter your number</h2>
            <p className="text-gray-500 text-sm mb-8">We'll send a 6-digit code to verify</p>
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="flex gap-2">
                <div className="w-16 h-14 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center font-semibold text-gray-700">🇳🇬</div>
                <input type="tel" inputMode="numeric" placeholder="080 0000 0000" value={phone} onChange={e => setPhone(e.target.value)}
                  className="flex-1 h-14 px-4 bg-gray-50 border border-gray-200 rounded-2xl text-base font-medium focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent" autoFocus />
              </div>
              <button type="submit" disabled={loading}
                className="w-full h-14 bg-accent text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-grind-accent-dark active:scale-[0.98] transition-all shadow-lg shadow-accent/30 disabled:opacity-60">
                {loading ? "Sending..." : <><span>Send Code</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          </div>
        )}

        {/* ── Phone OTP ─────────────────────────────────────── */}
        {step === "phone_otp" && (
          <div className="flex flex-col flex-1 pt-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Verify your number</h2>
            <p className="text-gray-500 text-sm mb-8">Enter the 6-digit code sent to <span className="font-semibold text-gray-700">{phone}</span></p>
            {otpInputs}
            <button onClick={handlePhoneOtpSubmit} disabled={loading}
              className="w-full mt-5 h-14 bg-accent text-white rounded-2xl font-bold flex items-center justify-center hover:bg-grind-accent-dark active:scale-[0.98] transition-all shadow-lg shadow-accent/30 disabled:opacity-60">
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>
            <button onClick={resend} className="mt-4 text-center text-sm text-accent font-medium w-full py-3">Didn't get it? Resend code</button>
          </div>
        )}

        {/* ── Email ─────────────────────────────────────────── */}
        {step === "email" && (
          <div className="flex flex-col flex-1 pt-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Enter your email</h2>
            <p className="text-gray-500 text-sm mb-8">Use your school email for verified access</p>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <input type="email" placeholder="yourname@school.edu.ng" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full h-14 px-4 bg-gray-50 border border-gray-200 rounded-2xl text-base font-medium focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent" autoFocus />
              <button type="submit" disabled={loading}
                className="w-full h-14 bg-accent text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-grind-accent-dark active:scale-[0.98] transition-all shadow-lg shadow-accent/30 disabled:opacity-60">
                {loading ? "Checking..." : <><span>Continue</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          </div>
        )}

        {/* ── Email OTP ─────────────────────────────────────── */}
        {step === "otp" && (
          <div className="flex flex-col flex-1 pt-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Check your inbox</h2>
            <p className="text-gray-500 text-sm mb-8">Enter the 6-digit code sent to <span className="font-semibold text-gray-700">{email}</span></p>
            {otpInputs}
            <button onClick={handleEmailOtpSubmit} disabled={loading}
              className="w-full mt-5 h-14 bg-accent text-white rounded-2xl font-bold flex items-center justify-center hover:bg-grind-accent-dark active:scale-[0.98] transition-all shadow-lg shadow-accent/30 disabled:opacity-60">
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>
            <button onClick={resend} className="mt-4 text-center text-sm text-accent font-medium w-full py-3">Didn't get it? Resend code</button>
          </div>
        )}

        {/* ── Register ──────────────────────────────────────── */}
        {step === "register" && (
          <div className="flex flex-col flex-1 pt-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h2>
            <p className="text-gray-500 text-sm mb-8">One step away from your first gig</p>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Full Name</label>
                <input type="text" placeholder="e.g. Goodness Iyamah" value={name} onChange={e => setName(e.target.value)}
                  className="w-full h-14 px-4 bg-gray-50 border border-gray-200 rounded-2xl text-base font-medium focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent" autoFocus />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Email</label>
                <input type="email" value={email} readOnly
                  className="w-full h-14 px-4 bg-gray-100 border border-gray-200 rounded-2xl text-base font-medium text-gray-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full h-14 px-4 pr-12 bg-gray-50 border border-gray-200 rounded-2xl text-base font-medium focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent" />
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full h-14 bg-accent text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-grind-accent-dark active:scale-[0.98] transition-all shadow-lg shadow-accent/30 mt-2 disabled:opacity-60">
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
