import React from "react";
import { cn } from "../../lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger" | "outline";
  children: React.ReactNode;
}

export function Button({ variant = "primary", className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "px-6 py-3 rounded-[999px] transition-colors font-medium",
        {
          "bg-accent text-accent-foreground hover:bg-accent/90": variant === "primary",
          "bg-transparent text-grind-neutral-700 hover:bg-grind-neutral-50": variant === "ghost",
          "bg-destructive text-destructive-foreground hover:bg-destructive/90": variant === "danger",
          "border border-grind-neutral-200 text-grind-neutral-700 hover:bg-grind-neutral-50": variant === "outline",
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
