import React from "react";
import { ArrowLeft, Clock, DollarSign, Folder, Shield, ArrowUpRight, Share2 } from "lucide-react";
import { Button } from "./Button";

interface TaskDetailProps {
  task: {
    category: string;
    price: number;
    title: string;
    description: string;
    posterHandle: string;
    posterTier: "STARTER" | "BRONZE" | "GOLD" | "DIAMOND";
    posterScore: number;
    deadline: string;
  };
  onBack: () => void;
}

const tierColors = {
  STARTER: "#98A2B3",
  BRONZE: "#F79009",
  GOLD: "#6C63FF",
  DIAMOND: "#0BA5EC",
};

export function TaskDetail({ task, onBack }: TaskDetailProps) {
  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="sticky top-0 bg-white border-b border-grind-neutral-200 z-10">
        <div className="max-w-[600px] mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-grind-neutral-50 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="font-semibold">Task</h2>
          <button className="p-2 -mr-2 hover:bg-grind-neutral-50 rounded-full">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-[600px] mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-grind-neutral-200 flex items-center justify-center font-medium">
            {task.posterHandle[1].toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-medium">{task.posterHandle}</span>
              <div className="flex items-center gap-1">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: tierColors[task.posterTier] }}
                />
                <span className="text-xs text-grind-neutral-500">{task.posterTier}</span>
                <span className="text-xs text-grind-neutral-500">• {task.posterScore}</span>
              </div>
            </div>
            <p className="text-xs text-grind-neutral-500">Posted 2 hours ago</p>
          </div>
        </div>

        <h1 className="text-xl font-bold mb-3">{task.title}</h1>
        <p className="text-grind-neutral-700 mb-6 leading-relaxed">{task.description}</p>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2 px-3 py-2 bg-grind-neutral-50 rounded-lg">
            <DollarSign className="w-4 h-4 text-grind-success" />
            <span className="text-sm font-medium">₦{task.price.toLocaleString()}</span>
            <span className="text-[10px] font-bold text-accent px-1.5 py-0.5 bg-accent/10 rounded tracking-wider">cNGN</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-grind-neutral-50 rounded-lg">
            <Clock className="w-4 h-4 text-grind-warning" />
            <span className="text-sm font-medium">3 days</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-grind-neutral-50 rounded-lg">
            <Folder className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">{task.category}</span>
          </div>
        </div>

        <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 mb-8 flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div>
            <h4 className="text-sm font-bold text-accent mb-0.5">Trustless Escrow Active</h4>
            <p className="text-xs text-grind-neutral-600">Your payment is locked in the smart contract. Funds are only released when you approve the work or after 48h of no response.</p>
          </div>
        </div>

        <div className="border-t border-grind-neutral-200 pt-6 mb-6">
          <h3 className="font-semibold mb-3">About the poster</h3>
          <div className="flex items-center gap-4">
            <div className="relative">
              <svg className="w-10 h-10 transform -rotate-90">
                <circle cx="20" cy="20" r="16" fill="none" stroke="#E0E0E0" strokeWidth="4" />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke={tierColors[task.posterTier]}
                  strokeWidth="4"
                  strokeDasharray={`${(task.posterScore / 1000) * 100} 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold">{task.posterScore}</span>
              </div>
            </div>
            <div className="text-sm text-grind-neutral-700">
              <p>34 tasks completed • 0 disputes</p>
              <p>Member since Mar 2024</p>
            </div>
          </div>
        </div>

        <div className="border-t border-grind-neutral-200 pt-6">
          <div className="bg-grind-accent-light border border-accent/20 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h4 className="font-semibold mb-1 text-sm text-primary">Funds are locked in escrow</h4>
                <p className="text-xs text-grind-neutral-700 leading-relaxed">
                  Your payment is held safely until you approve the work. Auto-refunded if no
                  delivery by deadline.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-grind-neutral-200 p-6 z-20 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-[600px] mx-auto flex items-center justify-between gap-6">
          <div>
            <p className="text-[10px] font-bold text-grind-neutral-400 uppercase tracking-widest mb-0.5">Gig Budget</p>
            <p className="text-2xl font-black text-primary">₦{task.price.toLocaleString()}</p>
          </div>
          <Button className="flex-1 h-14 font-black flex items-center justify-center gap-2">
            APPLY FOR GIG <ArrowUpRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
