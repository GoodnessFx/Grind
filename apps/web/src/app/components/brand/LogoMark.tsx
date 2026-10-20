import React from "react";
import { cn } from "../../../lib/utils";

type LogoTone = "light" | "dark";

interface LogoMarkProps {
  size?: number;
  tone?: LogoTone;
  className?: string;
  /** Wrap in the rounded-square app-icon container */
  framed?: boolean;
}

/**
 * Grind brand mark.
 *
 * Inspired by the brand mark: a dark 3-D sphere with concentric ring lines
 * wrapping its surface, lit from the top-left, with a signature green
 * ambient glow emanating from the base (matches the app's #00A651 primary).
 *
 * Renders as a pure SVG — sharp at any size from favicon to splash hero.
 * The "framed" prop adds the near-black rounded-square app-icon shell.
 */
export function LogoMark({
  size = 52,
  tone = "dark",
  className,
  framed = false,
}: LogoMarkProps) {
  const id = React.useId().replace(/:/g, "_");

  // The sphere mark itself
  const mark = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      aria-label="Grind"
      role="img"
      className={className}
    >
      <defs>
        {/* Sphere base — dark charcoal */}
        <radialGradient
          id={`${id}_sphere`}
          cx="38%" cy="32%"
          r="62%"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0%"   stopColor="#4a4a5a" />
          <stop offset="45%"  stopColor="#1c1c2b" />
          <stop offset="100%" stopColor="#0a0a12" />
        </radialGradient>

        {/* Green glow pool at base — matches the app's #00A651 primary */}
        <radialGradient
          id={`${id}_glow`}
          cx="50%" cy="100%"
          r="60%"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0%"   stopColor="#00A651" stopOpacity="0.9" />
          <stop offset="50%"  stopColor="#00703A" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#0a0a12"  stopOpacity="0"   />
        </radialGradient>

        {/* Highlight lens flare top-left */}
        <radialGradient
          id={`${id}_hi`}
          cx="32%" cy="28%"
          r="35%"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0"    />
        </radialGradient>

        {/* Ring tint — subtle green sheen */}
        <linearGradient id={`${id}_ring`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#34D07F" stopOpacity="0.7" />
          <stop offset="50%"  stopColor="#00A651" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#34D07F" stopOpacity="0.7" />
        </linearGradient>

        <clipPath id={`${id}_clip`}>
          <circle cx="50" cy="50" r="46" />
        </clipPath>
      </defs>

      {/* ── Outer glow halo ────────────────────────────────────── */}
      <ellipse
        cx="50" cy="88"
        rx="36" ry="8"
        fill={`url(#${id}_glow)`}
        opacity="0.9"
      />

      {/* ── Sphere body ───────────────────────────────────────── */}
      <circle cx="50" cy="50" r="46" fill={`url(#${id}_sphere)`} />

      {/* ── Concentric elliptical ring lines (clipped to sphere) ── */}
      <g clipPath={`url(#${id}_clip)`} strokeWidth="2.2" fill="none">
        {/* Five rings, tilted ~18° to give the 3-D warp */}
        {[14, 24, 34, 44, 54].map((ry, i) => (
          <ellipse
            key={i}
            cx="50"
            cy="50"
            rx="44"
            ry={ry}
            stroke={`url(#${id}_ring)`}
            strokeOpacity={0.55 - i * 0.05}
            transform="rotate(-18 50 50)"
          />
        ))}
      </g>

      {/* ── Top-left highlight ────────────────────────────────── */}
      <circle cx="50" cy="50" r="46" fill={`url(#${id}_hi)`} />

      {/* ── Rim light — thin green arc at bottom-right ─────── */}
      <circle
        cx="50" cy="50" r="44"
        stroke="#00E07A"
        strokeWidth="1.5"
        strokeOpacity="0.4"
        fill="none"
        strokeDasharray="60 200"
        strokeDashoffset="-80"
      />
    </svg>
  );

  if (!framed) return mark;

  // App-icon shell: near-black rounded square, matching the reference image
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center relative overflow-hidden flex-shrink-0",
        className
      )}
      style={{
        width:  Math.round(size * 1.5),
        height: Math.round(size * 1.5),
        borderRadius: Math.round(size * 0.3),
        background: "radial-gradient(circle at 40% 30%, #1a1a2e 0%, #0d0d14 100%)",
        boxShadow: `0 0 ${Math.round(size * 0.5)}px rgba(0,166,81,0.3), 0 ${Math.round(size * 0.1)}px ${Math.round(size * 0.4)}px rgba(0,0,0,0.7)`,
      }}
    >
      {/* Subtle ambient inner glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 110%, rgba(0,166,81,0.16) 0%, transparent 70%)",
        }}
      />
      {mark}
    </div>
  );
}
