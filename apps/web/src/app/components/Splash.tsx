import React, { useEffect } from "react";
import { Shield, Sparkles } from "lucide-react";

interface SplashProps {
  onComplete: () => void;
}

export function Splash({ onComplete }: SplashProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center relative overflow-hidden">
      <div className="relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="w-24 h-24 bg-accent rounded-[32px] flex items-center justify-center mb-8 rotate-6 shadow-2xl">
          <span className="text-white text-5xl font-black">O</span>
        </div>
        <h1 className="text-4xl font-black text-white mb-2 tracking-tighter">Oui Market</h1>
        <div className="flex items-center gap-2 text-accent">
          <Shield className="w-4 h-4 fill-accent/20" />
          <p className="text-xs font-bold uppercase tracking-[0.2em]">Trustless Campus Economy</p>
        </div>
      </div>
      
      <div className="absolute bottom-12 flex items-center gap-2 text-white/40 animate-pulse">
        <Sparkles className="w-4 h-4" />
        <span className="text-[10px] font-black uppercase tracking-widest">Built for Unilag</span>
      </div>

      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
