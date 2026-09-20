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
 * Grind brand mark: the clean lowercase "g." glyph, rendered as crisp SVG
 * so it stays sharp at any size (favicon, splash, headers, footers).
 */
export function LogoMark({
  size = 52,
  tone = "dark",
  className,
  framed = false,
}: LogoMarkProps) {
  const foreground = tone === "dark" ? "#000000" : "#ffffff";

  const glyph = (
    <svg
      width={size}
      height={size * 0.8}
      viewBox="0 0 125 80"
      fill="none"
      aria-label="Grind"
      role="img"
      className={className}
    >
      {/* lowercase "g": flat top, round-bottom bowl with open counter, plus the dot */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0 H100 V20 A50 50 0 0 1 0 20 Z M30 0 H70 V20 A20 20 0 0 1 30 20 Z"
        fill={foreground}
      />
      <circle cx="109" cy="58" r="11" fill={foreground} />
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

