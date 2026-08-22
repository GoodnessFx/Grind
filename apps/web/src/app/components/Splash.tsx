import React, { useEffect } from "react";

interface SplashProps {
  onComplete: () => void;
}

export function Splash({ onComplete }: SplashProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="h-full flex flex-col items-center justify-between bg-accent relative overflow-hidden">
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
        <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl">
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
            <path d="M26 4C13.85 4 4 13.85 4 26s9.85 22 22 22 22-9.85 22-22S38.15 4 26 4z" fill="#00A651" />
            <path d="M26 12c-7.73 0-14 6.27-14 14s6.27 14 14 14 14-6.27 14-14-6.27-14-14-14z" fill="white" />
            <path d="M26 18c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8z" fill="#00A651" />
          </svg>
        </div>
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
