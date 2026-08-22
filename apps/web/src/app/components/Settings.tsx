import React, { useState } from "react";
import {
  ChevronLeft, ChevronRight, User, Lock, Bell,
  Shield, CreditCard, HelpCircle, FileText, Moon,
  Smartphone, Trash2, CheckCircle2, X, Eye, EyeOff,
  LogOut, MessageSquare, Link2, Globe
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

type SubScreen = null | "profile" | "password" | "notifications" | "security" | "payment" | "feedback";

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
  const [name, setName] = useState(user.userName);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [bio, setBio] = useState(user.bio ?? "");

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

  const handleSaveProfile = () => {
    if (!name.trim()) { toast.error("Name cannot be empty"); return; }
    onUpdate({ userName: name.trim(), phone: phone.trim(), bio: bio.trim() });
    toast.success("Profile updated!");
    setSub(null);
  };

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
    { icon: User, label: "My Profile", desc: "Edit name, bio, contact", action: () => setSub("profile") },
    { icon: Lock, label: "Login Settings", desc: "Change password & PIN", action: () => setSub("password") },
    { icon: CreditCard, label: "Payment Settings", desc: "Linked cards & banks", action: () => setSub("payment") },
    { icon: Globe, label: "School & Level", desc: `${user.school} • ${user.level}`, action: () => toast.info("Contact support to update school info") },
  ];

  const PREFERENCES_ROWS: SettingsRow[] = [
    { icon: Bell, label: "Notifications", desc: "Gigs, chats, wallet alerts", action: () => setSub("notifications") },
    { icon: Shield, label: "Security Center", desc: "Biometrics, 2FA, sessions", action: () => setSub("security") },
    { icon: Link2, label: "Connected Accounts", desc: "Google, socials", action: () => toast.info("Coming soon!") },
    { icon: Moon, label: "Themes", desc: "Light / Dark mode", action: () => toast.info("Dark mode coming soon!") },
  ];

  const SUPPORT_ROWS: SettingsRow[] = [
    { icon: MessageSquare, label: "Feedback & Suggestions", desc: "Help us improve Grind", action: () => setSub("feedback") },
    { icon: HelpCircle, label: "Help Center", desc: "FAQs & contact support", action: () => toast.info("Opening Help Center…") },
    { icon: FileText, label: "Terms & Privacy Policy", desc: "Read our policies", action: () => toast.info("Opening legal docs…") },
    { icon: Smartphone, label: "About Grind", desc: "Version 1.0.0-MVP", action: () => toast.info("Grind Campus v1.0.0") },
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
          <p className={cn("text-sm font-semibold", row.danger ? "text-red-600" : "text-gray-900")}>{row.label}</p>
          {row.desc && <p className="text-xs text-gray-400 mt-0.5 truncate">{row.desc}</p>}
        </div>
        {row.badge && (
          <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full mr-2", row.badgeColor ?? "text-orange-500 bg-orange-50")}>
            {row.badge}
          </span>
        )}
        {!row.danger && <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />}
      </button>
    );
  };

  const SectionCard = ({ title, rows }: { title: string; rows: SettingsRow[] }) => (
    <div className="mb-4">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide px-5 mb-2">{title}</p>
      <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm mx-4 divide-y divide-gray-50">
        {rows.map((row, i) => <RowItem key={i} row={row} />)}
      </div>
    </div>
  );

  // ── Sub-screens ──────────────────────────────────────────
  const SubHeader = ({ title }: { title: string }) => (
    <div className="px-5 pt-12 pb-4 flex items-center gap-3 border-b border-gray-100 bg-white">
      <button onClick={() => setSub(null)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
        <ChevronLeft className="w-5 h-5 text-gray-700" />
      </button>
      <h2 className="font-bold text-gray-900">{title}</h2>
    </div>
  );

  // Profile
  if (sub === "profile") {
    return (
      <div className="bg-background min-h-full">
        <SubHeader title="My Profile" />
        <div className="px-5 py-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Full Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full h-13 px-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Phone Number</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="+234 800 000 0000" className="w-full h-13 px-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={150} placeholder="Tell the campus who you are..." className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
            <p className="text-[10px] text-gray-400 text-right mt-1">{bio.length}/150</p>
          </div>
          <button onClick={handleSaveProfile} className="w-full h-13 bg-accent text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-grind-accent-dark active:scale-95 transition-all shadow-lg shadow-accent/30">
            <CheckCircle2 className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </div>
    );
  }

  // Password
  if (sub === "password") {
    return (
      <div className="bg-background min-h-full">
        <SubHeader title="Login Settings" />
        <div className="px-5 py-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Current Password</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="Enter current password"
                className="w-full h-13 px-4 pr-12 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
              <button type="button" onClick={() => setShowCurrent((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">New Password</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full h-13 px-4 pr-12 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
              <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button onClick={handleSavePassword} className="w-full h-13 bg-accent text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-grind-accent-dark active:scale-95 transition-all shadow-lg shadow-accent/30">
            Update Password
          </button>
          <button onClick={() => toast.info("PIN setup coming soon!")} className="w-full h-13 bg-white border border-gray-200 rounded-2xl font-semibold text-gray-700 text-sm flex items-center justify-center gap-2 hover:border-gray-300 active:scale-95 transition-all">
            Set Transaction PIN
          </button>
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
          <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm divide-y divide-gray-50">
            {rows.map((row) => (
              <div key={row.label} className="flex items-center gap-4 px-4 py-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{row.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{row.desc}</p>
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
          <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm divide-y divide-gray-50">
            <div className="flex items-center gap-4 px-4 py-4">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Biometric Login</p>
                <p className="text-xs text-gray-400 mt-0.5">Fingerprint or Face ID</p>
              </div>
              <Toggle value={biometrics} onChange={() => { setBiometrics((v) => !v); toast.success(biometrics ? "Biometrics off" : "Biometrics enabled!"); }} />
            </div>
            <div className="flex items-center gap-4 px-4 py-4">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Two-Factor Auth (2FA)</p>
                <p className="text-xs text-gray-400 mt-0.5">Extra login protection</p>
              </div>
              <Toggle value={twoFactor} onChange={() => { setTwoFactor((v) => !v); toast.success(twoFactor ? "2FA disabled" : "2FA enabled!"); }} />
            </div>
            <button
              onClick={() => toast.info("Sessions feature coming soon!")}
              className="w-full flex items-center justify-between px-4 py-4 bg-white active:bg-gray-50"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900 text-left">Active Sessions</p>
                <p className="text-xs text-gray-400 mt-0.5">1 active session</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </button>
          </div>
          <div className="bg-grind-accent-light border border-accent/20 rounded-2xl p-4 flex items-start gap-3">
            <Shield className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <p className="text-xs text-gray-600 leading-relaxed">
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
          <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm divide-y divide-gray-50">
            {["Add Debit Card", "Add Bank Account", "Withdrawal Settings", "Transaction Limits"].map((item) => (
              <button
                key={item}
                onClick={() => toast.info(`${item} — coming soon!`)}
                className="w-full flex items-center justify-between px-4 py-4 active:bg-gray-50 transition-colors"
              >
                <p className="text-sm font-semibold text-gray-900">{item}</p>
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
          <p className="text-sm text-gray-500">Your feedback helps us build a better Grind for everyone on campus.</p>
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            rows={6}
            maxLength={500}
            placeholder="Tell us what you love, what's broken, or what you'd like to see..."
            className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
          <p className="text-[10px] text-gray-400 text-right">{feedbackText.length}/500</p>
          <button onClick={handleSendFeedback} className="w-full h-13 bg-accent text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-grind-accent-dark active:scale-95 transition-all shadow-lg shadow-accent/30">
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
      <div className="px-5 pt-12 pb-4 flex items-center gap-3 border-b border-gray-100 bg-white">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h2 className="font-bold text-gray-900 text-base">Settings</h2>
      </div>

      {/* User card */}
      <div className="px-4 py-4">
        <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center text-white text-xl font-extrabold">
            {user.userName?.[0]?.toUpperCase() ?? "G"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 truncate">{user.userName}</p>
            <p className="text-xs text-accent font-semibold">{user.handle}</p>
            <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
          </div>
          <button
            onClick={() => setSub("profile")}
            className="px-3 py-2 bg-grind-accent-light text-accent rounded-xl text-xs font-bold"
          >
            Edit
          </button>
        </div>
      </div>

      <div className="pt-2">
        <SectionCard title="Account" rows={ACCOUNT_ROWS} />
        <SectionCard title="Preferences" rows={PREFERENCES_ROWS} />
        <SectionCard title="Support" rows={SUPPORT_ROWS} />
        <SectionCard title="Danger Zone" rows={DANGER_ROWS} />
      </div>

      <p className="text-center text-xs text-gray-300 font-medium pb-4 mt-2">Grind Campus • v1.0.0</p>
    </div>
  );
}
