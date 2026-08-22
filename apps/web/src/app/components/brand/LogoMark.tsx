import React from "react";
import { cn } from "../../../lib/utils";

type LogoTone = "light" | "dark";

interface LogoMarkProps {
  size?: number;
  tone?: LogoTone;
  className?: string;
  /**
   * If true, render the mark inside a rounded square container (matches existing Splash/Login treatment).
   */
  framed?: boolean;
}

/**
 * Grind brand mark: a clean single-letter “G”.
 * Intentionally minimal so it doesn't read as generic AI/placeholder iconography.
 */
export function LogoMark({
  size = 52,
  tone = "dark",
  className,
  framed = false,
}: LogoMarkProps) {
  const foreground = tone === "dark" ? "#0A2540" : "#ffffff";

  const glyph = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 52 52"
      fill="none"
      aria-label="Grind"
      role="img"
      className={className}
    >
      {/* Subtle inner gradient for a premium look while staying inside the brand palette */}
      <defs>
        <linearGradient id="g_fill" x1="10" y1="8" x2="44" y2="46" gradientUnits="userSpaceOnUse">
          <stop stopColor={foreground} stopOpacity="1" />
          <stop offset="1" stopColor="#00A651" stopOpacity={tone === "dark" ? "0.18" : "0.28"} />
        </linearGradient>
      </defs>
      <path
        d="M26 6.5c-10.8 0-19.5 8.7-19.5 19.5S15.2 45.5 26 45.5c8.35 0 15.47-5.2 18.35-12.55.35-.9-.13-1.95-1.07-2.2l-2.7-.7c-.74-.2-1.52.2-1.8.93-2.2 5.6-7.66 9.57-12.78 9.57-8.2 0-14.85-6.65-14.85-14.85S17.8 11.85 26 11.85c6.82 0 12.6 4.65 14.25 11h-9.3c-1.1 0-2 .9-2 2v3.2c0 1.1.9 2 2 2h13.95c1.1 0 2-.9 2-2V26c0-10.8-8.7-19.5-19.5-19.5Z"
        fill="url(#g_fill)"
      />
    </svg>
  );

  if (!framed) return glyph;

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-3xl shadow-2xl",
        tone === "dark" ? "bg-white" : "bg-white/15 backdrop-blur",
        className
      )}
      style={{
        width: Math.round(size * 1.55),
        height: Math.round(size * 1.55),
      }}
    >
      {glyph}
    </div>
  );
}

