import React, { useState } from "react";
import {
  ChevronLeft, ChevronRight, User, Lock, Bell,
  Shield, CreditCard, HelpCircle, FileText, Moon,
  Smartphone, Trash2, CheckCircle2, X, Eye, EyeOff,
  LogOut, MessageSquare, Link2, Globe, Users, Facebook, Twitter, Github
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../lib/utils";
import type { UserData } from "../App";

interface SettingsProps {
  user: UserData;
  onBack: () => void;
  onLogout: () => void;
  onUpdate: (updates: Partial<UserData>) => void;
}

type SubScreen = null | "profile" | "password" | "notifications" | "security" | "payment" | "feedback" | "connected" | "referral";

interface SettingsRow {
  icon: React.ElementType;
  label: string;
  desc?: string;
  badge?: string;
  badgeColor?: string;
  action: () => void;
  danger?: boolean;
}

export function Settings({ user, onBack, onLogout, onUpdate }: SettingsProps) {
  const [sub, setSub] = useState<SubScreen>(null);

  // Profile edit state
  const [showSchool, setShowSchool] = useState(user.showSchool !== false);

  // Password state
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Notification toggles
  const [notifGigs, setNotifGigs] = useState(true);
  const [notifChat, setNotifChat] = useState(true);
  const [notifWallet, setNotifWallet] = useState(true);
  const [notifPromo, setNotifPromo] = useState(false);

  // Security toggles
  const [biometrics, setBiometrics] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  // Feedback state
  const [feedbackText, setFeedbackText] = useState("");

  const handleSavePassword = () => {
    if (!currentPw) { toast.error("Enter your current password"); return; }
    if (newPw.length < 6) { toast.error("New password must be at least 6 characters"); return; }
    toast.success("Password updated successfully!");
    setCurrentPw(""); setNewPw(""); setSub(null);
  };

  const handleSendFeedback = () => {
    if (!feedbackText.trim()) { toast.error("Write something first"); return; }
    toast.success("Feedback sent! Thank you 🙏");
    setFeedbackText(""); setSub(null);
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={cn(
        "relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0",
        value ? "bg-accent" : "bg-gray-200"
      )}
    >
      <span className={cn(
        "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200",
        value ? "translate-x-5" : "translate-x-0.5"
      )} />
    </button>
  );

  const ACCOUNT_ROWS: SettingsRow[] = [
    { icon: Globe, label: "School & Level", desc: `${user.school} • ${user.level}`, action: () => {
        const newVal = !showSchool;
        setShowSchool(newVal);
        onUpdate({ showSchool: newVal });
        toast.success(newVal ? "School badge is visible on profile" : "School badge hidden from profile");
      },
      badge: showSchool ? "Visible" : "Hidden",
      badgeColor: showSchool ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
    },
    { icon: Lock, label: "Login Settings", desc: "Change password & PIN", action: () => setSub("password") },
    { icon: CreditCard, label: "Payment Settings", desc: "Linked cards & banks", action: () => setSub("payment") },
    { icon: Users, label: "Refer & Earn", desc: "Invite friends, earn cash", action: () => setSub("referral") },
  ];

  const PREFERENCES_ROWS: SettingsRow[] = [
    { icon: Bell, label: "Notifications", desc: "Gigs, chats, wallet alerts", action: () => setSub("notifications") },
    { icon: Shield, label: "Security Center", desc: "Biometrics, 2FA, sessions", action: () => setSub("security") },
    { icon: Link2, label: "Connected Accounts", desc: "Google, X, LinkedIn", action: () => setSub("connected") },
    { icon: Moon, label: "Themes", desc: "Light / Dark mode", action: () => toast.info("Dark mode coming soon!") },
  ];

  const SUPPORT_ROWS: SettingsRow[] = [
    { icon: MessageSquare, label: "Feedback & Suggestions", desc: "Help us improve Grind", action: () => setSub("feedback") },
    { icon: HelpCircle, label: "Help Center", desc: "FAQs & contact support", action: () => window.open("mailto:support@grind.market", "_blank") },
    { icon: FileText, label: "Terms & Privacy Policy", desc: "Read our policies", action: () => {
      const links = [
        window.open("/terms", "_blank"),
        window.open("/privacy", "_blank"),
      ];
      toast.success("Opening legal documents in new tabs…");
    } },
  ];

  const DANGER_ROWS: SettingsRow[] = [
    { icon: LogOut, label: "Sign Out", desc: "You can sign back in anytime", action: onLogout, danger: true },
    { icon: Trash2, label: "Delete Account", desc: "Permanently remove your data", action: () => toast.error("Contact support@grind.market to delete your account"), danger: true },
  ];

  const RowItem = ({ row }: { row: SettingsRow }) => {
    const Icon = row.icon;
    return (
      <button
        onClick={row.action}
        className={cn(
          "w-full flex items-center gap-4 px-4 py-3.5 bg-white active:bg-gray-50 transition-colors",
          row.danger && "bg-red-50 active:bg-red-100"
        )}
      >
        <div className={cn(
          "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0",
          row.danger ? "bg-red-100" : "bg-grind-accent-light"
        )}>
          <Icon className={cn("w-5 h-5", row.danger ? "text-red-500" : "text-accent")} />
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className={cn("text-[15px] font-extrabold tracking-tight leading-tight", row.danger ? "text-red-600" : "text-gray-900")}>{row.label}</p>
          {row.desc && <p className="text-xs text-gray-500 mt-0.5 truncate font-medium">{row.desc}</p>}
        </div>
        {row.badge && (
          <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide mr-2", row.badgeColor ?? "text-orange-500 bg-orange-50")}>
            {row.badge}
          </span>
        )}
        {!row.danger && <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />}
      </button>
    );
  };

  const SectionCard = ({ title, rows }: { title: string; rows: SettingsRow[] }) => (
    <div className="mb-5">
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide px-5 mb-2.5">{title}</p>
      <div className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.03)] mx-4 divide-y divide-gray-50">
        {rows.map((row, i) => <RowItem key={i} row={row} />)}
      </div>
    </div>
  );

  // ── Sub-screens ──────────────────────────────────────────
  const SubHeader = ({ title }: { title: string }) => (
    <div className="px-5 pt-12 pb-4 flex items-center gap-3 border-b border-gray-100 bg-white shadow-sm relative z-10">
      <button onClick={() => setSub(null)} className="w-9 h-9 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center border border-gray-100 transition-colors">
        <ChevronLeft className="w-5 h-5 text-gray-700" />
      </button>
      <h2 className="font-extrabold text-gray-900 text-[17px] tracking-tight">{title}</h2>
    </div>
  );

  // Password
  if (sub === "password") {
    return (
      <div className="bg-background min-h-full">
        <SubHeader title="Login Settings" />
        <div className="px-5 py-6 space-y-5">
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2 block">Current Password</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="Enter current password"
                className="w-full h-14 px-4 pr-12 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
              <button type="button" onClick={() => setShowCurrent((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2 block">New Password</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full h-14 px-4 pr-12 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
              <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button onClick={handleSavePassword} className="w-full h-14 bg-accent text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-grind-accent-dark active:scale-95 transition-all shadow-[0_8px_16px_-4px_rgba(0,166,81,0.3)]">
            Update Password
          </button>
        </div>
      </div>
    );
  }

  // Connected Accounts
  if (sub === "connected") {
    return (
      <div className="bg-background min-h-full">
        <SubHeader title="Connected Accounts" />
        <div className="px-5 py-6 space-y-4">
          <div className="bg-white border border-gray-100 rounded-[24px] p-5 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.03)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1DA1F2]/10 flex items-center justify-center">
                <Twitter className="w-5 h-5 text-[#1DA1F2]" />
              </div>
              <div>
                <p className="font-extrabold text-gray-900 text-sm">X (Twitter)</p>
                <p className="text-[11px] text-gray-500 font-medium">@goodness_grind</p>
              </div>
            </div>
            <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold text-gray-700 transition-colors">Disconnect</button>
          </div>
          
          <div className="bg-white border border-gray-100 rounded-[24px] p-5 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.03)] flex items-center justify-between opacity-70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <Github className="w-5 h-5 text-gray-900" />
              </div>
              <div>
                <p className="font-extrabold text-gray-900 text-sm">GitHub</p>
                <p className="text-[11px] text-gray-500 font-medium">Showcase your repos</p>
              </div>
            </div>
            <button className="px-3 py-1.5 bg-accent hover:bg-grind-accent-dark rounded-lg text-xs font-bold text-white transition-colors">Connect</button>
          </div>

          <div className="bg-white border border-gray-100 rounded-[24px] p-5 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.03)] flex items-center justify-between opacity-70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0A66C2]/10 flex items-center justify-center">
                <Facebook className="w-5 h-5 text-[#0A66C2]" />
              </div>
              <div>
                <p className="font-extrabold text-gray-900 text-sm">LinkedIn</p>
                <p className="text-[11px] text-gray-500 font-medium">Connect for pro network</p>
              </div>
            </div>
            <button className="px-3 py-1.5 bg-accent hover:bg-grind-accent-dark rounded-lg text-xs font-bold text-white transition-colors">Connect</button>
          </div>
        </div>
      </div>
    );
  }

  // Referral Page
  if (sub === "referral") {
    return (
      <div className="bg-background min-h-full">
        <SubHeader title="Refer & Earn" />
        <div className="px-5 py-6">
          <div className="bg-gradient-to-br from-accent to-[#008A43] rounded-[28px] p-6 text-white relative overflow-hidden shadow-[0_12px_32px_-8px_rgba(0,166,81,0.4)]">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 border border-white/20">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-extrabold tracking-tight mb-1">Invite Friends,<br/>Earn ₦1,500</h3>
              <p className="text-sm text-white/80 font-medium">Get cash for every student who signs up and completes their first gig.</p>
            </div>
          </div>

          <div className="mt-6 bg-white border border-gray-100 rounded-[24px] p-5 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.03)]">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-3">Your Referral Link</p>
            <div className="flex gap-2">
              <input
                readOnly
                value={`grind.market/ref/${user.handle.replace("@", "")}`}
                className="flex-1 h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`https://grind.market/ref/${user.handle.replace("@", "")}`);
                  toast.success("Copied to clipboard!");
                }}
                className="px-5 h-12 bg-gray-900 text-white font-bold rounded-xl active:scale-95 transition-transform"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-gray-900 text-lg">My Referrals</h3>
              <span className="text-xs font-bold text-accent bg-grind-accent-light px-2.5 py-1 rounded-lg">{user.referrals} Joined</span>
            </div>
            
            {user.referrals > 0 ? (
              <div className="space-y-3">
                {Array.from({ length: user.referrals }).map((_, i) => (
                  <div key={i} className="bg-white border border-gray-100 p-4 rounded-[20px] flex items-center justify-between shadow-[0_2px_8px_-4px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-[15px]">Student #{1000 + i}</p>
                        <p className="text-[11px] text-gray-500 font-medium">Joined {i + 1} days ago</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-extrabold text-green-500 uppercase tracking-wide">+₦1,500</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-sm text-gray-500 font-medium">No friends joined yet. Start sharing!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Notifications
  if (sub === "notifications") {
    const rows = [
      { label: "New Gig Matches", desc: "When a gig matches your skills", value: notifGigs, toggle: () => setNotifGigs((v) => !v) },
      { label: "Chat Messages", desc: "New messages from clients", value: notifChat, toggle: () => setNotifChat((v) => !v) },
      { label: "Wallet Activity", desc: "Deposits, withdrawals, earnings", value: notifWallet, toggle: () => setNotifWallet((v) => !v) },
      { label: "Promotions", desc: "Offers, referral updates", value: notifPromo, toggle: () => setNotifPromo((v) => !v) },
    ];
    return (
      <div className="bg-background min-h-full">
        <SubHeader title="Notifications" />
        <div className="px-4 py-5">
          <div className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-sm divide-y divide-gray-50">
            {rows.map((row) => (
              <div key={row.label} className="flex items-center gap-4 px-4 py-4">
                <div className="flex-1">
                  <p className="text-[15px] font-extrabold text-gray-900 leading-tight">{row.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5 font-medium">{row.desc}</p>
                </div>
                <Toggle value={row.value} onChange={row.toggle} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Security
  if (sub === "security") {
    return (
      <div className="bg-background min-h-full">
        <SubHeader title="Security Center" />
        <div className="px-4 py-5 space-y-4">
          <div className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-sm divide-y divide-gray-50">
            <div className="flex items-center gap-4 px-4 py-4">
              <div className="flex-1">
                <p className="text-[15px] font-extrabold text-gray-900 leading-tight">Biometric Login</p>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">Fingerprint or Face ID</p>
              </div>
              <Toggle value={biometrics} onChange={() => { setBiometrics((v) => !v); toast.success(biometrics ? "Biometrics off" : "Biometrics enabled!"); }} />
            </div>
            <div className="flex items-center gap-4 px-4 py-4">
              <div className="flex-1">
                <p className="text-[15px] font-extrabold text-gray-900 leading-tight">Two-Factor Auth (2FA)</p>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">Extra login protection</p>
              </div>
              <Toggle value={twoFactor} onChange={() => { setTwoFactor((v) => !v); toast.success(twoFactor ? "2FA disabled" : "2FA enabled!"); }} />
            </div>
            <button
              onClick={() => toast.info("Sessions feature coming soon!")}
              className="w-full flex items-center justify-between px-4 py-4 bg-white active:bg-gray-50"
            >
              <div>
                <p className="text-[15px] font-extrabold text-gray-900 text-left leading-tight">Active Sessions</p>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">1 active session</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </button>
          </div>
          <div className="bg-grind-accent-light border border-accent/20 rounded-2xl p-4 flex items-start gap-3">
            <Shield className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <p className="text-xs text-gray-600 font-medium leading-relaxed">
              Your escrow transactions are always secured by smart contracts, independent of account security settings.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Payment
  if (sub === "payment") {
    return (
      <div className="bg-background min-h-full">
        <SubHeader title="Payment Settings" />
        <div className="px-4 py-5 space-y-4">
          <div className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-sm divide-y divide-gray-50">
            {["Add Debit Card", "Add Bank Account", "Withdrawal Settings", "Transaction Limits"].map((item) => (
              <button
                key={item}
                onClick={() => toast.info(`${item} — coming soon!`)}
                className="w-full flex items-center justify-between px-4 py-4 active:bg-gray-50 transition-colors"
              >
                <p className="text-[15px] font-extrabold text-gray-900">{item}</p>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Feedback
  if (sub === "feedback") {
    return (
      <div className="bg-background min-h-full">
        <SubHeader title="Feedback & Suggestions" />
        <div className="px-5 py-5 space-y-4">
          <p className="text-sm text-gray-500 font-medium">Your feedback helps us build a better Grind for everyone on campus.</p>
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            rows={6}
            maxLength={500}
            placeholder="Tell us what you love, what's broken, or what you'd like to see..."
            className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
          <p className="text-[10px] text-gray-400 text-right">{feedbackText.length}/500</p>
          <button onClick={handleSendFeedback} className="w-full h-14 bg-accent text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-grind-accent-dark active:scale-95 transition-all shadow-lg shadow-accent/30">
            Send Feedback
          </button>
        </div>
      </div>
    );
  }

  // ── Main Settings screen ─────────────────────────────────
  return (
    <div className="bg-background min-h-full pb-10">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center gap-3 border-b border-gray-100 bg-white shadow-sm relative z-10">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center border border-gray-100 transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h2 className="font-extrabold text-gray-900 text-[17px] tracking-tight">Settings</h2>
      </div>

      <div className="pt-6">
        <SectionCard title="Account" rows={ACCOUNT_ROWS} />
        <SectionCard title="Preferences" rows={PREFERENCES_ROWS} />
        <SectionCard title="Support" rows={SUPPORT_ROWS} />
        <SectionCard title="Danger Zone" rows={DANGER_ROWS} />
      </div>

      <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-wide pb-6 mt-4">Grind Campus • v1.0.0</p>
    </div>
  );
}
