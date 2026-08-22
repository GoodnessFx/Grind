import React from "react";
import { Home, Briefcase, Search, Wallet, User, Plus } from "lucide-react";
import { cn } from "../../lib/utils";
import type { Tab } from "../App";

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onPostTask: () => void;
}

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "gigs", label: "Gigs", icon: Briefcase },
  { id: "discovery", label: "Discovery", icon: Search },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "profile", label: "Profile", icon: User },
];

export function BottomNav({ activeTab, onTabChange, onPostTask }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white border-t border-gray-100 z-50">
      {/* Post Gig FAB — floats above the nav */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2">
        <button
          onClick={onPostTask}
          className="w-12 h-12 rounded-2xl bg-accent text-white flex items-center justify-center shadow-xl shadow-accent/40 hover:bg-grind-accent-dark active:scale-95 transition-all rotate-3 hover:rotate-0"
          aria-label="Post a Gig"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="flex items-end pb-safe h-16">
        {TABS.map((tab, i) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isCenter = i === 2; // "Discovery" sits under the FAB

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex-1 flex flex-col items-center justify-end gap-0.5 pb-2 pt-1 transition-all",
                isCenter && "pt-4", // keep space for FAB while still showing the icon
                isActive ? "text-accent" : "text-gray-400"
              )}
            >
              <div className={cn("relative", isCenter && "mt-1")}>
                <Icon className={cn(isCenter ? "w-5 h-5" : "w-6 h-6", "transition-all", isActive ? "stroke-[2.5]" : "stroke-[1.5]")} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent rounded-full" />
                )}
              </div>
              <span className={cn("text-[10px] font-semibold leading-tight", isActive ? "opacity-100" : "opacity-60")}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
