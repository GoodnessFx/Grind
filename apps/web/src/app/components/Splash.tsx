import React, { useEffect } from "react";
import { LogoMark } from "./brand/LogoMark";

interface SplashProps {
  onComplete: () => void;
}

export function Splash({ onComplete }: SplashProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="h-full flex flex-col items-center justify-between bg-[var(--color-primary)] relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10" />
        <div className="absolute top-1/3 -left-16 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 right-1/4 w-56 h-56 rounded-full bg-white/10" />
      </div>

      {/* Top spacer */}
      <div />

      {/* Center logo */}
      <div className="flex flex-col items-center gap-5 animate-in fade-in zoom-in duration-700">
        <LogoMark size={54} tone="dark" framed />
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Grind</h1>
          <p className="text-white/80 text-sm font-medium mt-1">Campus Gig Economy</p>
        </div>
      </div>

      {/* Bottom */}
      <div className="pb-12 flex flex-col items-center gap-4">
        {/* Loading dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-white/60 animate-pulse"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
        <p className="text-white/50 text-xs font-medium">Trustless Campus Economy</p>
      </div>
    </div>
  );
}
