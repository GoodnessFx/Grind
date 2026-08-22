import React, { useState } from "react";
import {
  Settings, Share2, TrendingUp, LogOut, Camera, Edit2,
  Check, Download, History, X as CloseIcon,
  Star, Shield, Briefcase, ChevronRight,
  Crown, Clock, Users
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
  const [showHistory, setShowHistory] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const handleSave = () => {
    onUpdate?.({ userName: editedName, bio: editedBio });
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

  return (
    <div className="pb-28">
      {/* ── Top bar ────────────────────────────────────────── */}
      <div className="bg-white px-5 pt-12 pb-4 flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-gray-900">Profile</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <Share2 className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={onOpenSettings}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <Settings className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* ── Avatar + name card ─────────────────────────────── */}
      <div className="px-4 mb-4">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-accent flex items-center justify-center text-white text-3xl font-extrabold shadow-lg">
                {user.userName?.[0]?.toUpperCase() ?? "G"}
              </div>
              <button
                onClick={() => toast.info("Camera access needed to change photo")}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full border-2 border-gray-100 flex items-center justify-center shadow-md"
              >
                <Camera className="w-3.5 h-3.5 text-gray-600" />
              </button>
            </div>

            {/* Name + details */}
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-accent/20"
                    placeholder="Full name"
                  />
                  <textarea
                    value={editedBio}
                    onChange={(e) => setEditedBio(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs resize-none focus:outline-none focus:ring-2 focus:ring-accent/20"
                    placeholder="Short bio..."
                  />
                  <div className="flex gap-2">
                    <button onClick={handleSave} className="flex-1 bg-accent text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Save
                    </button>
                    <button onClick={() => setIsEditing(false)} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-xl text-xs font-bold">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-gray-900 text-lg truncate">{user.userName}</h3>
                    <button onClick={() => setIsEditing(true)} className="shrink-0">
                      <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  </div>
                  <p className="text-xs text-accent font-semibold">{user.handle}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{user.school} • {user.level}</p>
                  {user.bio && <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{user.bio}</p>}
                </>
              )}
            </div>
          </div>

          {/* Tier badge */}
          <div className={cn("mt-4 flex items-center gap-2 px-4 py-2.5 rounded-2xl border w-full", tierBg[user.tier], "border-current/10")}>
            <Crown className="w-4 h-4 shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold">Tier {user.tier}</span>
                {nextTier !== "MAX" && <span className="text-[10px] font-medium opacity-70">→ {nextTier} at {nextThreshold} pts</span>}
              </div>
              <div className="h-1.5 bg-current/10 rounded-full overflow-hidden">
                <div className="h-full bg-current rounded-full transition-all" style={{ width: `${tierProgress}%` }} />
              </div>
            </div>
            <span className="text-sm font-extrabold shrink-0">{user.score}</span>
          </div>
        </div>
      </div>

      {/* ── Stats row ──────────────────────────────────────── */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Tasks Done", value: "34", icon: Briefcase, color: "text-accent" },
            { label: "On-Time", value: "98%", icon: Clock, color: "text-green-500" },
            { label: "Rating", value: "4.8★", icon: Star, color: "text-yellow-500" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm">
                <Icon className={cn("w-5 h-5 mx-auto mb-1.5", stat.color)} />
                <p className="text-lg font-extrabold text-gray-900">{stat.value}</p>
                <p className="text-[10px] text-gray-400 font-medium">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Total Earned card ──────────────────────────────── */}
      <div className="px-4 mb-4">
        <div className="bg-grind-accent-light border border-accent/20 rounded-3xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600 font-medium mb-1">Total Earned</p>
            <p className="text-2xl font-extrabold text-gray-900">₦{totalEarned.toLocaleString()}</p>
            <p className="text-[10px] text-accent font-semibold mt-0.5">cNGN • Campus Verified</p>
          </div>
          <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center shadow-lg shadow-accent/30">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>

      {/* ── Credential share ────────────────────────────────── */}
      <div className="px-4 mb-4">
        <button
          onClick={handleShare}
          className="w-full bg-white border border-gray-100 rounded-3xl p-4 flex items-center gap-4 shadow-sm active:scale-[0.99] transition-all"
        >
          <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-gray-900 text-sm">Share Referral Link</p>
            <p className="text-xs text-gray-500">Earn ₦500 for every friend who joins</p>
          </div>
          <div className="flex items-center gap-1 text-accent">
            <span className="text-xs font-semibold">x{user.referrals ?? 0}</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </button>
      </div>

      {/* ── Action list ─────────────────────────────────────── */}
      <div className="px-4 space-y-3 mb-4">
        <button
          onClick={() => setShowStats(true)}
          className="w-full bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm active:scale-[0.99] transition-all"
        >
          <div className="w-11 h-11 rounded-2xl bg-orange-50 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-orange-500" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-gray-900 text-sm">Growth Stats</p>
            <p className="text-xs text-green-500 font-semibold">+12% this month</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </button>

        <button
          onClick={() => setShowHistory(true)}
          className="w-full bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm active:scale-[0.99] transition-all"
        >
          <div className="w-11 h-11 rounded-2xl bg-accent/10 flex items-center justify-center">
            <History className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-gray-900 text-sm">Work History</p>
            <p className="text-xs text-gray-500">34 tasks completed</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </button>

        <button
          onClick={onOpenSettings}
          className="w-full bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm active:scale-[0.99] transition-all"
        >
          <div className="w-11 h-11 rounded-2xl bg-gray-100 flex items-center justify-center">
            <Settings className="w-5 h-5 text-gray-600" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-gray-900 text-sm">Settings</p>
            <p className="text-xs text-gray-500">Account, security, notifications</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </button>

        <button
          onClick={onLogout}
          className="w-full bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-4 active:scale-[0.99] transition-all"
        >
          <div className="w-11 h-11 rounded-2xl bg-red-100 flex items-center justify-center">
            <LogOut className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-red-600 text-sm">Sign Out</p>
            <p className="text-xs text-red-400">You can sign back in anytime</p>
          </div>
        </button>
      </div>

      {/* ── Growth Stats Modal ──────────────────────────────── */}
      {showStats && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowStats(false)} />
          <div className="relative bg-white rounded-t-3xl px-5 pt-5 pb-8 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Performance Growth</h3>
              <button onClick={() => setShowStats(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <CloseIcon className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { label: "Income Growth", pct: "24.5%", value: 75 },
                { label: "Response Rate", pct: "98%", value: 98 },
                { label: "Completion Rate", pct: "100%", value: 100 },
              ].map((item) => (
                <div key={item.label} className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex justify-between text-sm font-semibold text-gray-800 mb-2">
                    <span>{item.label}</span>
                    <span className="text-green-500">{item.pct}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
                  <Clock className="w-5 h-5 text-orange-500 mx-auto mb-1.5" />
                  <p className="text-xl font-extrabold text-gray-900">1.2d</p>
                  <p className="text-[10px] text-gray-400 font-medium">Avg. Delivery</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
                  <Shield className="w-5 h-5 text-green-500 mx-auto mb-1.5" />
                  <p className="text-xl font-extrabold text-gray-900">100%</p>
                  <p className="text-[10px] text-gray-400 font-medium">Safety Score</p>
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
          <div className="relative bg-white rounded-t-3xl px-5 pt-5 pb-8 max-h-[75vh] flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Work History</h3>
              <button onClick={() => setShowHistory(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <CloseIcon className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 space-y-3">
              {user.transactions.filter((t) => t.amount > 0).map((tx) => (
                <div key={tx.id} className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center">
                      <Briefcase className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{tx.title}</p>
                      <p className="text-[10px] text-gray-400">{tx.date} • {tx.status}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-green-500 text-sm">+₦{tx.amount.toLocaleString()}</p>
                    <button
                      onClick={() => toast.success("Downloading receipt…")}
                      className="text-[10px] text-accent font-semibold flex items-center gap-0.5 mt-0.5"
                    >
                      <Download className="w-3 h-3" /> Receipt
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
