import React, { useState } from "react";
import { Bell, FileText, Share2, ShieldCheck, Briefcase, Plus, X, Sparkles, ArrowUpRight } from "lucide-react";
import { TaskCard } from "./TaskCard";
import { toast } from "sonner";
import { Button } from "./Button";

interface HomeProps {
  userName: string;
  userHandle: string;
  notifications: any[];
  onNavigate: (tab: string) => void;
  onPostTask: () => void;
  onTaskClick?: (taskId: number) => void;
}

const mockTasks = [
  {
    id: 1,
    category: "Writing",
    price: 3500,
    title: "Write my BUS 301 Business Law essay (1500 words)",
    description: "Need a well-researched essay on corporate governance. Due Friday before 5pm.",
    posterHandle: "@emeka_dev",
    posterTier: "GOLD" as const,
    posterScore: 672,
    deadline: "Due in 2 days",
  },
  {
    id: 2,
    category: "Design",
    price: 5000,
    title: "Design my event flyer for Faculty Week",
    description: "Looking for a creative flyer design for our upcoming Faculty Week event.",
    posterHandle: "@fatimah.writes",
    posterTier: "BRONZE" as const,
    posterScore: 423,
    deadline: "Due in 4 days",
  },
  {
    id: 3,
    category: "Tutoring",
    price: 8500,
    title: "Tutor me in Calculus before my exam on Friday",
    description: "Need help with integration and differentiation. 3 sessions needed.",
    posterHandle: "@seun_designs",
    posterTier: "DIAMOND" as const,
    posterScore: 847,
    deadline: "Due in 3 days",
  },
];

export function Home({ userName, userHandle, notifications, onNavigate, onPostTask, onTaskClick }: HomeProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  const handleShareReferral = () => {
    const refLink = `https://oui.market/ref/${userHandle.replace("@", "")}`;
    navigator.clipboard.writeText(refLink);
    toast.success("Referral link copied! Share with friends to boost your GrindScore.");
  };

  return (
    <div className="pb-32 px-4 max-w-[600px] mx-auto">
      <div className="pt-6 pb-4 flex items-center justify-between sticky top-0 bg-grind-neutral-50 z-20">
        <div>
          <h2 className="text-2xl font-black text-grind-neutral-900 tracking-tight flex items-center gap-2">
            Good morning, {userName} <Sparkles className="w-5 h-5 text-accent" />
          </h2>
          <p className="text-xs text-grind-neutral-500 font-bold uppercase tracking-widest">{userHandle}</p>
        </div>
        <button 
          onClick={() => setShowNotifications(true)}
          className="relative p-3 bg-white border border-grind-neutral-100 rounded-2xl shadow-sm hover:bg-grind-neutral-50 transition-all group"
        >
          <Bell className="w-5 h-5 text-grind-neutral-700 group-hover:rotate-12 transition-transform" />
          {notifications.length > 0 && (
            <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-accent rounded-full border-2 border-white" />
          )}
        </button>
      </div>

      <div className="bg-primary text-white rounded-[32px] p-6 mb-8 relative overflow-hidden shadow-lg mt-2">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="#6C63FF"
                  strokeWidth="6"
                  strokeDasharray={`${(672 / 1000) * 176} 176`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold">672</span>
              </div>
            </div>
            <div>
              <p className="text-xs opacity-70 mb-1">Current GrindScore</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-grind-tier-gold shadow-[0_0_8px_#F79009]" />
                <span className="font-bold tracking-wider">GOLD TIER</span>
              </div>
            </div>
          </div>
          <Button 
            onClick={onPostTask}
            className="w-full bg-white text-primary hover:bg-white/90 font-bold flex items-center justify-center gap-2 py-4"
          >
            <Plus className="w-5 h-5" />
            Post a New Task
          </Button>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full -mr-16 -mt-16 blur-2xl" />
      </div>

      <div className="mb-8">
        <h3 className="font-bold mb-4 text-grind-neutral-900 text-sm uppercase tracking-widest">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onNavigate("tasks")}
            className="bg-white border border-grind-neutral-100 rounded-2xl p-4 hover:shadow-md transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Briefcase className="w-5 h-5 text-accent" />
            </div>
            <span className="font-bold text-sm block">Browse Gigs</span>
            <span className="text-[10px] text-grind-neutral-500">Find work near you</span>
          </button>
          <button
            onClick={handleShareReferral}
            className="bg-white border border-grind-neutral-100 rounded-2xl p-4 hover:shadow-md transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-grind-success/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Share2 className="w-5 h-5 text-grind-success" />
            </div>
            <span className="font-bold text-sm block">Refer Classmate</span>
            <span className="text-[10px] text-grind-neutral-500">Boost your score</span>
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-grind-neutral-900">Recommended for you</h3>
          <button
            onClick={() => onNavigate("tasks")}
            className="text-xs text-accent font-bold hover:underline tracking-wide uppercase flex items-center gap-1"
          >
            See all <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
        <div className="space-y-4">
          {mockTasks.map((task) => (
            <TaskCard key={task.id} {...task} onClick={() => onTaskClick?.(task.id)} />
          ))}
        </div>
      </div>

      {showNotifications && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-end justify-center">
          <div className="bg-white w-full max-w-[600px] rounded-t-[32px] p-8 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold">Notifications</h3>
              <button onClick={() => setShowNotifications(false)} className="p-2 hover:bg-grind-neutral-50 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {notifications.map((n: any) => (
                <div key={n.id} className="p-4 bg-grind-neutral-50 rounded-2xl border border-grind-neutral-100">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-sm">{n.title}</h4>
                    <span className="text-[10px] text-grind-neutral-400 font-medium">{n.time}</span>
                  </div>
                  <p className="text-xs text-grind-neutral-600 leading-relaxed">{n.message}</p>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-grind-neutral-400 italic">No new notifications</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
