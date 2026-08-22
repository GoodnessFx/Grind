import React from "react";
import { Clock, Shield } from "lucide-react";
import { cn } from "../../lib/utils";

export interface TaskCardData {
  id: number;
  category: string;
  price: number;
  title: string;
  description: string;
  posterHandle: string;
  posterTier: "STARTER" | "BRONZE" | "GOLD" | "DIAMOND";
  posterScore: number;
  deadline: string;
  status?: string;
  squadSize?: number;
  onClick?: () => void;
}

const tierColors: Record<string, string> = {
  STARTER: "#98A2B3",
  BRONZE: "#CD7F32",
  GOLD: "#F79009",
  DIAMOND: "#0BA5EC",
};

const categoryColors: Record<string, string> = {
  Writing: "bg-blue-50 text-blue-600",
  Design: "bg-pink-50 text-pink-600",
  Coding: "bg-purple-50 text-purple-600",
  Tutoring: "bg-green-50 text-green-600",
  Delivery: "bg-orange-50 text-orange-600",
  Research: "bg-yellow-50 text-yellow-700",
  Video: "bg-red-50 text-red-600",
  Squads: "bg-indigo-50 text-indigo-600",
  Other: "bg-gray-100 text-gray-600",
};

import { Users } from "lucide-react";

export function TaskCard({ category, price, title, description, posterHandle, posterTier, posterScore, deadline, status, squadSize, onClick }: TaskCardData) {
  const urgent = deadline.includes("hour") || deadline.includes("1 day");

  return (
    <button
      onClick={onClick}
      className="w-full bg-white border border-gray-100 rounded-2xl p-4 text-left hover:shadow-md active:scale-[0.99] transition-all shadow-sm"
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-2 items-center">
          <span className={cn("px-2.5 py-1 rounded-full text-[11px] font-semibold", categoryColors[category] ?? "bg-gray-100 text-gray-600")}>
            {category}
          </span>
          {squadSize && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Users className="w-3 h-3" />
              Squad of {squadSize}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-base font-extrabold text-gray-900">₦{price.toLocaleString()}</span>
          <span className="text-[10px] font-bold text-accent bg-grind-accent-light px-1.5 py-0.5 rounded-md">cNGN</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2 leading-snug">{title}</h3>
      <p className="text-xs text-gray-500 line-clamp-1 mb-3">{description}</p>

      {/* Bottom row */}
      <div className="flex items-center justify-between">
        {/* Poster info */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent">
            {posterHandle?.[1]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-700">{posterHandle}</span>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tierColors[posterTier] }} />
              <span className="text-[10px] text-gray-400">{posterTier}</span>
            </div>
          </div>
        </div>

        {/* Deadline */}
        <div className={cn(
          "flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold",
          urgent ? "bg-red-50 text-red-500" : "bg-green-50 text-green-600"
        )}>
          <Clock className="w-3 h-3" />
          {deadline}
        </div>
      </div>

      {/* Escrow badge */}
      <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-1.5">
        <Shield className="w-3 h-3 text-accent" />
        <span className="text-[10px] text-gray-400 font-medium">Protected by escrow</span>
        {status && <span className="ml-auto text-[10px] font-semibold text-accent bg-grind-accent-light px-2 py-0.5 rounded-full">{status}</span>}
      </div>
    </button>
  );
}
