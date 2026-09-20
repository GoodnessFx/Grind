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
    <div
      className="h-full min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "#0D1B2E" }}
    >
      {/* Center app tile + wordmark (Mitao-style) */}
      <div className="flex flex-col items-center gap-7 animate-in fade-in zoom-in duration-700">
        <div
          className="relative flex items-center justify-center rounded-[26px] shadow-2xl"
          style={{
            width: 116,
            height: 116,
            background: "#000000",
            border: "1px solid rgba(255,255,255,0.14)",
            boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
          }}
        >
          <LogoMark size={72} tone="light" />
        </div>
        <h1 className="text-white text-4xl font-extrabold tracking-tight">Grind</h1>
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
