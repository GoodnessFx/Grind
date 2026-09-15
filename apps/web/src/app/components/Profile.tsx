import React, { useState } from "react";
import {
  Settings, Share2, TrendingUp, LogOut, Camera, Edit2,
  Check, Download, History, X as CloseIcon,
  Star, Shield, Briefcase, ChevronRight,
  Crown, Clock, Users, Link2, MapPin, Grid, Hexagon, Medal
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../lib/utils";
import type { UserData } from "../App";

interface ProfileProps {
  user: UserData;
  onLogout?: () => void;
  onUpdate?: (updates: Partial<UserData>) => void;
  onOpenSettings?: () => void;
}

const tierColors: Record<string, string> = {
  STARTER: "#98A2B3",
  BRONZE: "#CD7F32",
  GOLD: "#F79009",
  DIAMOND: "#0BA5EC",
};

const tierBg: Record<string, string> = {
  STARTER: "bg-gray-100 text-gray-500",
  BRONZE: "bg-orange-50 text-orange-500",
  GOLD: "bg-yellow-50 text-yellow-600",
  DIAMOND: "bg-blue-50 text-blue-500",
};

export function Profile({ user, onLogout, onUpdate, onOpenSettings }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user.userName);
  const [editedBio, setEditedBio] = useState(user.bio ?? "");
  const [editedSkills, setEditedSkills] = useState(user.skills?.join(", ") ?? "");
  
  const [showHistory, setShowHistory] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const handleSave = () => {
    const skillsArray = editedSkills.split(",").map(s => s.trim()).filter(Boolean);
    onUpdate?.({ userName: editedName, bio: editedBio, skills: skillsArray });
    setIsEditing(false);
    toast.success("Profile updated!");
  };

  const handleShare = () => {
    const link = `https://grind.market/ref/${user.handle.replace("@", "")}`;
    navigator.clipboard.writeText(link);
    toast.success("Referral link copied!");
  };

  const totalEarned = user.transactions
    .filter((t) => (t.type === "earn" || t.amount > 0) && t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const tierNext: Record<string, string> = {
    STARTER: "BRONZE",
    BRONZE: "GOLD",
    GOLD: "DIAMOND",
    DIAMOND: "MAX",
  };
  const tierThresholds: Record<string, number> = {
    STARTER: 400,
    BRONZE: 600,
    GOLD: 800,
    DIAMOND: 1000,
  };
  const nextTier = tierNext[user.tier] ?? "MAX";
  const nextThreshold = tierThresholds[user.tier] ?? 1000;
  const tierProgress = Math.min((user.score / nextThreshold) * 100, 100);

  // Mock portfolio if none exists
  const portfolio = user.portfolio ?? [
    { title: "UI Redesign", url: "#" },
    { title: "Smart Contract Audit", url: "#" }
  ];

  const skills = user.skills ?? ["React", "UI Design", "Copywriting"];

  return (
    <div className="pb-28">
      {/* ── Top bar (Overlaid on banner) ───────────────────── */}
      <div className="relative h-48 bg-gradient-to-r from-accent to-grind-accent-dark">
        {/* Banner image could go here */}
        <div className="absolute inset-0 bg-black/10" />
        
        <div className="absolute top-0 left-0 right-0 px-5 pt-12 pb-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-extrabold text-white drop-shadow-md">Profile</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30"
            >
              <Share2 className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={onOpenSettings}
              className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30"
            >
              <Settings className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {isEditing && (
          <button className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-white border border-white/30 flex items-center gap-1.5 z-10">
            <Camera className="w-3.5 h-3.5" /> Edit Banner
          </button>
        )}
      </div>

      {/* ── Avatar + name card ─────────────────────────────── */}
      <div className="px-4 -mt-12 relative z-20 mb-4">
        <div className="bg-white rounded-[28px] p-5 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.08)] border border-gray-100">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-start">
              {/* Avatar */}
              <div className="relative -mt-10">
                <div className="w-24 h-24 rounded-[2rem] bg-accent flex items-center justify-center text-white text-4xl font-extrabold shadow-xl border-4 border-white">
                  {user.userName?.[0]?.toUpperCase() ?? "G"}
                </div>
                <button
                  onClick={() => toast.info("Camera access needed to change photo")}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full border-2 border-gray-100 flex items-center justify-center shadow-md"
                >
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                  <Edit2 className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            {/* Name + details */}
            <div className="w-full">
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Name</label>
                    <input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-accent/20"
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Bio</label>
                    <textarea
                      value={editedBio}
                      onChange={(e) => setEditedBio(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs resize-none focus:outline-none focus:ring-2 focus:ring-accent/20"
                      placeholder="Short bio..."
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Skills (comma separated)</label>
                    <input
                      value={editedSkills}
                      onChange={(e) => setEditedSkills(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-accent/20"
                      placeholder="e.g. React, UI Design"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={handleSave} className="flex-1 bg-accent text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1">
                      <Check className="w-4 h-4" /> Save Profile
                    </button>
                    <button onClick={() => setIsEditing(false)} className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl text-xs font-bold">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-xl truncate tracking-tight">{user.userName}</h3>
                    <p className="text-sm text-accent font-semibold">{user.handle}</p>
                  </div>
                  
                  {user.showSchool !== false && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <p className="text-xs text-gray-500 font-medium">{user.school} • {user.level}</p>
                    </div>
                  )}
                  
                  {user.bio && <p className="text-sm text-gray-600 mt-2.5 leading-relaxed">{user.bio}</p>}

                  {/* Skills Grid */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {skills.map(skill => (
                      <span key={skill} className="px-2.5 py-1 bg-gray-50 border border-gray-100 text-gray-700 text-[10px] font-bold rounded-lg uppercase tracking-wide">
                        {skill}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Tier badge */}
          <div className={cn("mt-5 flex items-center gap-3 px-4 py-3 rounded-[20px] border w-full", tierBg[user.tier], "border-current/10")}>
            <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center shadow-sm">
              <Crown className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-extrabold">Tier {user.tier}</span>
                {nextTier !== "MAX" && <span className="text-[10px] font-bold opacity-70 tracking-wide uppercase">Next: {nextTier}</span>}
              </div>
              <div className="h-2 bg-current/10 rounded-full overflow-hidden">
                <div className="h-full bg-current rounded-full transition-all" style={{ width: `${tierProgress}%` }} />
              </div>
            </div>
            <span className="text-lg font-black shrink-0">{user.score}</span>
          </div>
        </div>
      </div>

      {/* ── Reputation Surface (Badges) ────────────────────── */}
      <div className="px-4 mb-4">
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-extrabold text-gray-900">Reputation</h3>
            <span className="text-[10px] font-bold text-accent uppercase tracking-wide bg-grind-accent-light px-2 py-1 rounded-md">Top 5% Campus</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Tasks Done", value: "34", icon: Briefcase, color: "text-blue-500", bg: "bg-blue-50" },
              { label: "On-Time", value: "98%", icon: Clock, color: "text-green-500", bg: "bg-green-50" },
              { label: "5-Star Rating", value: "28", icon: Star, color: "text-yellow-500", bg: "bg-yellow-50" },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center flex flex-col items-center">
                  <div className={cn("w-12 h-12 rounded-[1rem] flex items-center justify-center mb-2 shadow-sm border border-black/5", stat.bg)}>
                    <Icon className={cn("w-5 h-5", stat.color)} />
                  </div>
                  <p className="text-[15px] font-extrabold text-gray-900 leading-tight">{stat.value}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mt-0.5">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Portfolio / Links ─────────────────────────────── */}
      <div className="px-4 mb-4">
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
              <Grid className="w-4 h-4 text-gray-400" /> Portfolio & Links
            </h3>
            {isEditing && (
              <button className="text-xs text-accent font-bold">Add New</button>
            )}
          </div>
          <div className="space-y-3">
            {portfolio.map((item, idx) => (
              <div key={idx} onClick={() => item.url !== "#" ? window.open(item.url) : toast.info("Portfolio link not yet set")} className={cn("flex items-center justify-between p-3 rounded-2xl border border-gray-100", item.url === "#" ? "bg-gray-50 opacity-60 cursor-not-allowed" : "bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer")}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center border border-gray-100">
                    <Link2 className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-sm font-bold text-gray-700">{item.title}</p>
                </div>
                <ChevronRight className={cn("w-4 h-4", item.url === "#" ? "text-gray-200" : "text-gray-300")} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Total Earned card ──────────────────────────────── */}
      <div className="px-4 mb-4">
        <div className="bg-gradient-to-br from-grind-accent-light to-[#e6f5ec] border border-accent/20 rounded-3xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-gray-600 font-bold mb-1 uppercase tracking-wide">Total Earned</p>
            <p className="text-2xl font-black text-gray-900 tracking-tight">₦{totalEarned.toLocaleString()}</p>
            <p className="text-[10px] text-accent font-bold mt-1 uppercase tracking-wide flex items-center gap-1">
              <Shield className="w-3 h-3" /> Campus Verified
            </p>
          </div>
          <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center shadow-[0_8px_16px_-4px_rgba(0,166,81,0.4)] border border-white/20">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* ── Action list ─────────────────────────────────────── */}
      <div className="px-4 space-y-3 mb-4">
        <button
          onClick={() => setShowStats(true)}
          className="w-full bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md active:scale-[0.99] transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center group-hover:scale-105 transition-transform">
            <TrendingUp className="w-5 h-5 text-orange-500" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-extrabold text-gray-900 text-[15px]">Growth Stats</p>
            <p className="text-xs text-green-500 font-bold mt-0.5">+12% this month</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-accent transition-colors" />
        </button>

        <button
          onClick={() => setShowHistory(true)}
          className="w-full bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md active:scale-[0.99] transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:scale-105 transition-transform">
            <History className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-extrabold text-gray-900 text-[15px]">Work History</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">34 tasks completed</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-accent transition-colors" />
        </button>
      </div>

      {/* ── Growth Stats Modal ──────────────────────────────── */}
      {showStats && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowStats(false)} />
          <div className="relative bg-white rounded-t-3xl px-5 pt-5 pb-8 animate-in slide-in-from-bottom duration-300 shadow-[0_-8px_32px_rgba(0,0,0,0.1)]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Performance Growth</h3>
              <button onClick={() => setShowStats(false)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                <CloseIcon className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { label: "Income Growth", pct: "24.5%", value: 75 },
                { label: "Response Rate", pct: "98%", value: 98 },
                { label: "Completion Rate", pct: "100%", value: 100 },
              ].map((item) => (
                <div key={item.label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between text-sm font-extrabold text-gray-900 mb-2.5">
                    <span>{item.label}</span>
                    <span className="text-green-500">+{item.pct}</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full transition-all duration-1000" style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-gray-50 rounded-2xl p-5 text-center border border-gray-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                  <Clock className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <p className="text-2xl font-black text-gray-900 tracking-tight">1.2d</p>
                  <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wide mt-1">Avg. Delivery</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-5 text-center border border-gray-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                  <Shield className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-black text-gray-900 tracking-tight">100%</p>
                  <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wide mt-1">Safety Score</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Work History Modal ──────────────────────────────── */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowHistory(false)} />
          <div className="relative bg-white rounded-t-3xl px-5 pt-5 pb-8 max-h-[75vh] flex flex-col animate-in slide-in-from-bottom duration-300 shadow-[0_-8px_32px_rgba(0,0,0,0.1)]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Work History</h3>
              <button onClick={() => setShowHistory(false)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                <CloseIcon className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 space-y-3 pr-2 -mr-2">
              {user.transactions.filter((t) => t.amount > 0).map((tx) => (
                <div key={tx.id} className="bg-white rounded-2xl p-4 flex items-center justify-between border border-gray-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] hover:border-accent/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-[1rem] bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
                      <Briefcase className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="min-w-0 pr-2">
                      <p className="font-extrabold text-gray-900 text-[15px] truncate">{tx.title}</p>
                      <p className="text-[11px] text-gray-500 font-semibold mt-0.5">{tx.date} • {tx.status}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-green-500 text-[15px]">+₦{tx.amount.toLocaleString()}</p>
                    <button
                      onClick={() => toast.success("Downloading receipt…")}
                      className="text-[10px] text-accent font-bold flex items-center justify-end gap-1 mt-1 uppercase tracking-wide w-full"
                    >
                      <Download className="w-3.5 h-3.5" /> Receipt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
