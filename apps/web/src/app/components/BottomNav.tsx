import React from "react";
import { Home, Briefcase, Wallet, User, Plus } from "lucide-react";
import { cn } from "../../lib/utils";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: "home", icon: Home, label: "Home" },
    { id: "tasks", icon: Briefcase, label: "Tasks" },
    { id: "post", icon: Plus, label: "Post", isCenter: true },
    { id: "wallet", icon: Wallet, label: "Wallet" },
    { id: "profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-grind-neutral-100 z-50 pb-safe">
      <div className="max-w-[600px] mx-auto px-4 py-2 flex items-end justify-between relative">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.isCenter) {
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="flex flex-col items-center gap-1 -mt-8 relative z-10"
              >
                <div className="w-14 h-14 rounded-2xl bg-accent shadow-[0_8px_20px_rgba(108,99,255,0.3)] flex items-center justify-center rotate-3 hover:rotate-0 transition-all active:scale-95">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-accent mt-1">
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-3 transition-all duration-300 flex-1",
                isActive ? "text-accent" : "text-grind-neutral-400 hover:text-grind-neutral-600"
              )}
            >
              <Icon className={cn("w-6 h-6", isActive ? "fill-accent/5" : "")} />
              <span className={cn("text-[8px] font-bold uppercase tracking-wider", isActive ? "opacity-100" : "opacity-60")}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
