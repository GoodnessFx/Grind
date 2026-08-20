import React from "react";
import { cn } from "../../lib/utils";

interface TaskCardProps {
  category: string;
  price: number;
  title: string;
  description: string;
  posterHandle: string;
  posterTier: "STARTER" | "BRONZE" | "GOLD" | "DIAMOND";
  posterScore: number;
  deadline: string;
  status?: string;
  onClick?: () => void;
}

const tierColors = {
  STARTER: "#98A2B3",
  BRONZE: "#F79009",
  GOLD: "#6C63FF",
  DIAMOND: "#0BA5EC",
};

export function TaskCard({
  category,
  price,
  title,
  description,
  posterHandle,
  posterTier,
  posterScore,
  deadline,
  status,
  onClick,
}: TaskCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-grind-neutral-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="inline-block px-3 py-1 rounded-full bg-grind-accent-light text-accent text-xs font-medium">
          {category}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-primary">₦{price.toLocaleString()}</span>
          <span className="text-[10px] font-bold text-accent px-1.5 py-0.5 bg-accent/10 rounded tracking-wider">cNGN</span>
        </div>
      </div>

      <h3 className="font-semibold text-primary mb-1 line-clamp-2">{title}</h3>
      <p className="text-sm text-grind-neutral-700 mb-3 line-clamp-1">{description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-grind-neutral-200 flex items-center justify-center text-xs font-medium">
            {posterHandle[0].toUpperCase()}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-grind-neutral-700">{posterHandle}</span>
            <div className="flex items-center gap-1">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: tierColors[posterTier] }}
              />
              <span className="text-xs text-grind-neutral-500">{posterTier}</span>
            </div>
          </div>
        </div>
        <span
          className={cn(
            "text-xs px-2 py-1 rounded-full",
            deadline.includes("hour") || deadline.includes("1 day")
              ? "bg-grind-warning/10 text-grind-warning"
              : "bg-grind-success/10 text-grind-success"
          )}
        >
          {deadline}
        </span>
      </div>

      {status && (
        <div className="mt-2 pt-2 border-t border-grind-neutral-200">
          <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-grind-accent-light text-accent">
            {status}
          </span>
        </div>
      )}
    </div>
  );
}
