import React, { useState } from "react";
import { 
  Settings, Share2, TrendingUp, LogOut, Camera, Edit2, 
  Check, Download, History, X as CloseIcon, 
  Star, Shield, Briefcase, Clock, AlertCircle, Sparkles,
  ArrowUpRight, ExternalLink
} from "lucide-react";
import { Button } from "./Button";
import { toast } from "sonner";
import { cn } from "../../lib/utils";

interface ProfileProps {
  userName: string;
  handle: string;
  school: string;
  level: string;
  score: number;
  tier: "STARTER" | "BRONZE" | "GOLD" | "DIAMOND";
  onLogout?: () => void;
  onUpdate?: (updates: any) => void;
}

const tierColors = {
  STARTER: "#98A2B3",
  BRONZE: "#F79009",
  GOLD: "#6C63FF",
  DIAMOND: "#0BA5EC",
};

const skills = ["Writing", "Design", "Research", "Tutoring"];

const recentActivity = [
  { title: "Business Law Essay", date: "2 days ago", amount: 3500, type: "earn" },
  { title: "Event Flyer Design", date: "5 days ago", amount: 5000, type: "earn" },
  { title: "Calculus Tutoring", date: "1 week ago", amount: 8500, type: "earn" },
];

export function Profile({
  userName,
  handle,
  school,
  level,
  score,
  tier,
  onLogout,
  onUpdate,
}: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(userName);
  const [editedLevel, setEditedLevel] = useState(level);
  const [showHistory, setShowHistory] = useState(false);
  const [showGrowthStats, setShowGrowthStats] = useState(false);

  const handleSave = () => {
    onUpdate?.({ userName: editedName, level: editedLevel });
    setIsEditing(false);
    toast.success("Profile updated successfully!");
  };

  const handleImageUpload = () => {
    toast.info("Image upload starting...");
    setTimeout(() => {
      toast.success("Profile picture updated!");
    }, 1000);
  };

  const handleShare = () => {
    const refLink = `https://oui.market/ref/${handle.replace("@", "")}`;
    navigator.clipboard.writeText(refLink);
    toast.success("Referral link copied to clipboard!");
  };

  return (
    <div className="pb-32 px-4 max-w-[600px] mx-auto">
      <div className="pt-6 pb-6 flex items-center justify-between sticky top-0 bg-grind-neutral-50 z-20">
        <h2 className="text-2xl font-black text-grind-neutral-900 tracking-tight">Profile</h2>
        <div className="flex items-center gap-2">
          <button onClick={handleShare} className="p-2.5 bg-white border border-grind-neutral-100 rounded-xl shadow-sm hover:bg-grind-neutral-50 transition-colors">
            <Share2 className="w-5 h-5 text-grind-neutral-700" />
          </button>
          <button onClick={onLogout} className="p-2.5 bg-white border border-grind-neutral-100 rounded-xl shadow-sm hover:text-grind-warning transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* GrindScore Header Card */}
      <div className="bg-primary text-white rounded-[40px] p-8 mb-8 relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center gap-8 mb-8">
            <div className="relative">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                <circle
                  cx="48"
                  cy="48"
                  r="42"
                  fill="none"
                  stroke={tierColors[tier]}
                  strokeWidth="8"
                  strokeDasharray={`${(score / 1000) * 264} 264`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-black">{score}</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-xs opacity-70 uppercase tracking-widest font-bold mb-1">Your GrindScore</p>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tierColors[tier] }} />
                <span className="text-xl font-black tracking-tight">{tier}</span>
                <Sparkles className="w-4 h-4 text-accent fill-accent" />
              </div>
              <p className="text-sm font-medium opacity-80 italic">Top 15% on campus</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 pt-6 border-t border-white/10">
            <div className="text-center">
              <p className="text-xl font-black">34</p>
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-wider">Tasks</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-black">98%</p>
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-wider">On-time</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-black">4.8</p>
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-wider">Rating</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-black text-grind-warning">0</p>
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-wider">Disputes</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full -mr-32 -mt-32 blur-3xl" />
      </div>

      {/* Skills Section */}
      <div className="mb-8">
        <h3 className="font-black text-sm uppercase tracking-widest text-grind-neutral-400 mb-4">Core Skills</h3>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="px-6 py-2.5 bg-white border border-grind-neutral-100 rounded-2xl text-sm font-bold text-grind-neutral-700 shadow-sm hover:border-accent transition-all"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Credential Share Card */}
      <div className="bg-accent/5 border-2 border-accent/10 rounded-[32px] p-6 mb-8 relative group">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-black text-primary mb-1">Share your GrindScore as a credential</h4>
            <p className="text-xs text-grind-neutral-500 leading-relaxed">
              Employers, landlords, and scholarship bodies can verify your on-chain profile.
            </p>
          </div>
        </div>
        <button 
          onClick={handleShare}
          className="w-full bg-white border border-grind-neutral-100 py-4 rounded-2xl font-black text-sm text-primary hover:border-accent transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          Generate credential link <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Profile Info Section */}
      <div className="bg-white border border-grind-neutral-100 rounded-[32px] p-8 mb-8 shadow-sm">
        <div className="relative w-32 h-32 mx-auto mb-6 group">
          <div className="w-full h-full bg-gradient-to-br from-accent to-grind-tier-diamond rounded-[40px] flex items-center justify-center text-4xl font-black text-white shadow-xl rotate-3 transition-transform group-hover:rotate-0">
            {userName[0]}
          </div>
          <button 
            onClick={handleImageUpload}
            className="absolute -bottom-2 -right-2 p-3 bg-white rounded-2xl shadow-lg border border-grind-neutral-100 text-accent hover:scale-110 transition-transform"
          >
            <Camera className="w-5 h-5" />
          </button>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <input 
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="w-full px-6 py-4 bg-grind-neutral-50 border border-grind-neutral-100 rounded-2xl text-center font-black text-xl focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Full Name"
            />
            <input 
              value={editedLevel}
              onChange={(e) => setEditedLevel(e.target.value)}
              className="w-full px-6 py-4 bg-grind-neutral-50 border border-grind-neutral-100 rounded-2xl text-center text-sm font-bold focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Level (e.g. 300L)"
            />
            <Button onClick={handleSave} className="w-full h-14 font-black">
              <Check className="w-5 h-5 mr-2" /> SAVE CHANGES
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <h3 className="font-black text-3xl text-grind-neutral-900 tracking-tight">{userName}</h3>
              <button onClick={() => setIsEditing(true)} className="p-1.5 hover:bg-grind-neutral-100 rounded-lg text-grind-neutral-400">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm font-black text-accent mb-2 uppercase tracking-widest">{handle}</p>
            <p className="text-sm text-grind-neutral-500 font-bold">
              {school} • {level}
            </p>
          </div>
        )}
      </div>

      {/* Action List */}
      <div className="space-y-4 mb-8">
        <button 
          onClick={() => setShowGrowthStats(true)}
          className="w-full bg-white border border-grind-neutral-100 p-6 rounded-3xl flex items-center justify-between group hover:border-accent transition-all shadow-sm"
        >
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-grind-warning/10 flex items-center justify-center text-grind-warning transition-transform group-hover:scale-110">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="text-left">
              <span className="font-black text-grind-neutral-900 block">Growth Stats</span>
              <span className="text-[10px] font-bold text-grind-success uppercase">+12% performance boost</span>
            </div>
          </div>
          <ExternalLink className="w-5 h-5 text-grind-neutral-300 group-hover:text-accent transition-all" />
        </button>

        <button 
          onClick={() => setShowHistory(true)}
          className="w-full bg-white border border-grind-neutral-100 p-6 rounded-3xl flex items-center justify-between group hover:border-accent transition-all shadow-sm"
        >
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent transition-transform group-hover:scale-110">
              <History className="w-6 h-6" />
            </div>
            <div className="text-left">
              <span className="font-black text-grind-neutral-900 block">Work History</span>
              <span className="text-[10px] font-bold text-grind-neutral-400 uppercase">34 tasks completed</span>
            </div>
          </div>
          <ExternalLink className="w-5 h-5 text-grind-neutral-300 group-hover:text-accent transition-all" />
        </button>
      </div>

      {/* Recent Activity List */}
      <div className="mb-8">
        <h3 className="font-black text-sm uppercase tracking-widest text-grind-neutral-400 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-5 bg-white border border-grind-neutral-100 rounded-[24px] hover:shadow-md transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-grind-success/10 flex items-center justify-center text-grind-success group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-black text-grind-neutral-900">{activity.title}</p>
                  <p className="text-[10px] font-bold text-grind-neutral-400 uppercase">{activity.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-grind-success text-lg">+₦{activity.amount.toLocaleString()}</p>
                <p className="text-[10px] font-bold text-accent uppercase tracking-widest">cNGN</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Growth Stats Modal */}
      {showGrowthStats && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-end justify-center backdrop-blur-sm">
          <div className="bg-white w-full max-w-[600px] rounded-t-[40px] p-8 animate-in slide-in-from-bottom duration-500">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black text-primary">Performance Growth</h3>
                <p className="text-xs font-bold text-grind-neutral-400 uppercase tracking-widest">Last 30 Days</p>
              </div>
              <button onClick={() => setShowGrowthStats(false)} className="p-2.5 bg-grind-neutral-50 rounded-2xl hover:bg-grind-neutral-100 transition-colors">
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="p-6 bg-accent/5 border-2 border-accent/10 rounded-3xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-black text-sm">Income Growth</span>
                  <span className="text-grind-success font-black">+24.5%</span>
                </div>
                <div className="h-2 bg-accent/10 rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full w-[75%]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-grind-neutral-50 rounded-3xl border border-grind-neutral-100 text-center">
                  <Clock className="w-6 h-6 text-grind-warning mx-auto mb-2" />
                  <p className="text-2xl font-black text-primary">1.2d</p>
                  <p className="text-[10px] font-bold text-grind-neutral-400 uppercase tracking-widest">Avg. Delivery</p>
                </div>
                <div className="p-6 bg-grind-neutral-50 rounded-3xl border border-grind-neutral-100 text-center">
                  <Shield className="w-6 h-6 text-grind-success mx-auto mb-2" />
                  <p className="text-2xl font-black text-primary">100%</p>
                  <p className="text-[10px] font-bold text-grind-neutral-400 uppercase tracking-widest">Safety Score</p>
                </div>
              </div>

              <Button onClick={() => setShowGrowthStats(false)} className="w-full h-14 font-black">
                BACK TO PROFILE
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-end justify-center backdrop-blur-sm">
          <div className="bg-white w-full max-w-[600px] rounded-t-[40px] p-8 animate-in slide-in-from-bottom duration-500">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black">Work History</h3>
              <button onClick={() => setShowHistory(false)} className="p-2.5 bg-grind-neutral-50 rounded-2xl">
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="p-6 bg-grind-neutral-50 rounded-[32px] border border-grind-neutral-100 hover:border-accent transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-black text-lg group-hover:text-accent transition-colors">Business Law Essay</h4>
                    <p className="text-[10px] font-bold text-grind-neutral-400 uppercase">June 4, 2026 • 1500 words</p>
                  </div>
                  <span className="px-3 py-1 bg-grind-success/10 text-grind-success text-[10px] font-black rounded-full uppercase tracking-widest">COMPLETED</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-black text-primary">₦3,500 <span className="text-[10px] opacity-60">cNGN</span></p>
                  <button onClick={() => toast.success("Downloading receipt...")} className="flex items-center gap-2 text-[10px] font-black text-accent uppercase tracking-widest hover:underline">
                    <Download className="w-3 h-3" /> RECEIPT
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



