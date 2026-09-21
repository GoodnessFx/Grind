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
    <div className="h-full min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-black">
      <style>{`
        @keyframes grindBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          30% { transform: translateY(-18px) scale(1.03); }
          55% { transform: translateY(0) scale(0.99); }
          70% { transform: translateY(-6px) scale(1.01); }
        }
        @keyframes grindFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {/* Center logo, bouncing like the Mitao splash */}
      <div
        className="flex flex-col items-center gap-7"
        style={{
          animation: "grindBounce 2s cubic-bezier(0.45, 0, 0.55, 1) infinite, grindFadeIn 0.7s ease-out",
        }}
      >
        <LogoMark size={150} tone="light" />
        <h1 className="text-white text-5xl font-extrabold tracking-tight">Grind</h1>
      </div>

      {/* Bottom loader dots */}
      <div className="absolute bottom-16 flex flex-col items-center gap-5">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-white/70 animate-pulse"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
        <p className="text-white/40 text-xs font-medium tracking-wide">Trustless Campus Economy</p>
      </div>
    </div>
  );
}
