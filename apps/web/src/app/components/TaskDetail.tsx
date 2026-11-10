import React, { useState } from "react";
import {
  ChevronLeft, Share2, Shield, Clock, Tag, Star,
  CheckCircle2, MessageCircle, Send, X, Flag, Download
} from "lucide-react";
import { toast } from "sonner";
import { ALL_TASKS } from "./TaskBoard";
import { cn } from "../../lib/utils";
import { ReportModal } from "./ReportModal";
import type { UserData } from "../App";

interface TaskDetailProps {
  taskId: number;
  user: UserData;
  onBack: () => void;
}

const tierColors: Record<string, string> = {
  STARTER: "#98A2B3",
  BRONZE: "#CD7F32",
  GOLD: "#F79009",
  DIAMOND: "#0BA5EC",
};

const CHAT_SEED = [
  { id: 1, from: "poster", text: "Hi! Are you available to start today?", time: "10:02 AM" },
  { id: 2, from: "me", text: "Yes, I can start right away. What format do you need?", time: "10:05 AM" },
  { id: 3, from: "poster", text: "PDF is fine. Follow the course outline I'll send.", time: "10:07 AM" },
];

export function TaskDetail({ taskId, user, onBack }: TaskDetailProps) {
  const task = ALL_TASKS.find((t) => t.id === taskId) ?? ALL_TASKS[0];
  const [applied, setApplied] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(CHAT_SEED);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [pitch, setPitch] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [gigStatus] = useState<"open"|"completed">("open"); // in real app comes from API

  const handleShare = () => {
    navigator.clipboard.writeText(`https://grind.market/gig/${task.id}`);
    toast.success("Gig link copied!");
  };

  const handleApply = () => {
    if (!pitch.trim()) { toast.error("Write a short pitch first"); return; }
    toast.success("Application sent! The poster will respond shortly.");
    setApplied(true);
    setShowApplyModal(false);
  };

  const handleSend = () => {
    if (!message.trim()) return;
    const newMsg = { id: Date.now(), from: "me", text: message.trim(), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setMessages((prev) => [...prev, newMsg]);
    setMessage("");
    // Simulate reply
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: Date.now() + 1, from: "poster", text: "Got it, thanks! I'll review your application.", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* ── Top Bar ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-gray-100">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h2 className="font-bold text-gray-900">Gig Details</h2>
        <button onClick={handleShare} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
          <Share2 className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* ── Scrollable content ──────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 py-5 pb-36">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-lg">
            {task.posterHandle?.[1]?.toUpperCase() ?? "?"}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-gray-900">{task.posterHandle}</span>
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tierColors[task.posterTier] }} />
              <span className="text-xs text-gray-500">{task.posterTier}</span>
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs text-gray-400">Score: {task.posterScore}</span>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={cn("w-3 h-3", s <= 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-200")} />
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowChat(true)}
            className="flex items-center gap-1.5 bg-grind-accent-light text-accent px-3 py-2 rounded-xl text-xs font-semibold"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Chat
          </button>
        </div>

        {/* Category + price */}
        <div className="flex items-center gap-2 mb-4">
          <span className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold">
            <Tag className="w-3 h-3" />
            {task.category}
          </span>
          <span className="flex items-center gap-1 bg-gray-50 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold">
            <Clock className="w-3 h-3" />
            {task.deadline}
          </span>
        </div>

        {/* Title & description */}
        <h1 className="text-xl font-extrabold text-gray-900 mb-3 leading-snug">{task.title}</h1>
        <p className="text-sm text-gray-600 leading-relaxed mb-6">{task.description}</p>

        {/* Pay breakdown */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Payment Breakdown</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Gig Budget</span>
              <span className="font-bold text-gray-900">₦{task.price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Platform Fee (8%)</span>
              <span className="text-gray-500">- ₦{Math.round(task.price * 0.08).toLocaleString()}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between text-sm">
              <span className="font-bold text-gray-900">You Earn</span>
              <span className="font-extrabold text-accent">₦{Math.round(task.price * 0.92).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Escrow badge */}
        <div className="bg-grind-accent-light border border-accent/20 rounded-2xl p-4 mb-5 flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800 mb-0.5">Secured by escrow</p>
            <p className="text-xs text-gray-600 leading-relaxed">
              Payment locks in a smart contract. Funds release only when you approve the work, or auto-refund after 48h of no response.
            </p>
          </div>
        </div>

        {/* Share your win — shown when gig is completed */}
        {gigStatus === "completed" && (
          <div className="bg-[#0D0D14] rounded-2xl p-5 mb-5">
            <p className="text-white font-extrabold text-base mb-1">Share your win 🎉</p>
            <p className="text-white/60 text-xs mb-4">
              You earned ₦{Math.round(task.price * 0.92).toLocaleString()} on Grind. Share it!
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const url = `${import.meta.env.VITE_API_URL ?? ""}/api/share-card/${user.id ?? "me"}`;
                  const a = document.createElement("a");
                  a.href = url; a.download = "grind-win.svg"; a.target = "_blank"; a.click();
                  toast.success("Share card downloading!");
                }}
                className="flex-1 flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-3 rounded-xl transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Download card
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`I just earned ₦${Math.round(task.price * 0.92).toLocaleString()} on Grind! Way for poor people. grind.market`)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#1ebe57] text-white text-xs font-bold py-3 rounded-xl transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </a>
            </div>
          </div>
        )}

        {/* Report link */}
        <button
          onClick={() => setShowReport(true)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors mb-6"
        >
          <Flag className="w-3.5 h-3.5" /> Report this gig
        </button>

        {/* About the poster */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">About the Poster</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
              {task.posterHandle?.[1]?.toUpperCase() ?? "?"}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">{task.posterHandle}</p>
              <p className="text-xs text-gray-500">34 tasks completed • 0 disputes • Member since 2024</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Fixed Bottom CTA ─────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white border-t border-gray-100 px-5 py-4 pb-safe">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">You earn</p>
            <p className="text-2xl font-extrabold text-gray-900">₦{Math.round(task.price * 0.92).toLocaleString()}</p>
          </div>
          {applied ? (
            <div className="flex-1 flex items-center justify-center gap-2 h-13 bg-green-50 border border-green-200 rounded-2xl py-3.5">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="font-bold text-green-600">Applied!</span>
            </div>
          ) : (
            <button
              onClick={() => setShowApplyModal(true)}
              className="flex-1 h-13 bg-accent text-white rounded-2xl font-bold py-3.5 hover:bg-grind-accent-dark active:scale-95 transition-all shadow-lg shadow-accent/30"
            >
              Apply for Gig
            </button>
          )}
        </div>
      </div>

      {/* ── Apply Modal ─────────────────────────────────────── */}      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowApplyModal(false)} />
          <div className="relative bg-white rounded-t-3xl px-5 pt-5 pb-8 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Apply for Gig</h3>
              <button onClick={() => setShowApplyModal(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Write a short pitch telling the poster why you're the best fit</p>
            <textarea
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              placeholder="e.g. I'm a 300L Law student with experience writing corporate law essays. I can deliver in 24h..."
              rows={4}
              maxLength={300}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
            <p className="text-[10px] text-gray-400 text-right mt-1 mb-5">{pitch.length}/300</p>
            <button
              onClick={handleApply}
              className="w-full h-13 bg-accent text-white rounded-2xl font-bold py-3.5 hover:bg-grind-accent-dark active:scale-95 transition-all shadow-lg shadow-accent/30"
            >
              Submit Application
            </button>
          </div>
        </div>
      )}

      {/* ── Chat Panel ──────────────────────────────────────── */}
      {showChat && (
        <div className="fixed inset-0 z-50 flex flex-col">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowChat(false)} />
          <div className="relative mt-auto bg-white rounded-t-3xl flex flex-col h-[70vh] animate-in slide-in-from-bottom duration-300">
            {/* Chat header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
              <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                {task.posterHandle?.[1]?.toUpperCase() ?? "?"}
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm text-gray-900">{task.posterHandle}</p>
                <p className="text-[10px] text-green-500 font-medium">� Online</p>
              </div>
              <button onClick={() => setShowChat(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex", msg.from === "me" ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[75%] px-4 py-2.5 rounded-2xl text-sm",
                    msg.from === "me"
                      ? "bg-accent text-white rounded-br-md"
                      : "bg-gray-100 text-gray-800 rounded-bl-md"
                  )}>
                    <p>{msg.text}</p>
                    <p className={cn("text-[10px] mt-1", msg.from === "me" ? "text-white/70 text-right" : "text-gray-400")}>{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="px-5 py-3 pb-safe border-t border-gray-100 flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 h-11 px-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
              <button
                onClick={handleSend}
                className="w-11 h-11 bg-accent rounded-2xl flex items-center justify-center text-white hover:bg-grind-accent-dark active:scale-95 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {showReport && (
        <ReportModal targetType="gig" targetId={task.id} onClose={() => setShowReport(false)} />
      )}
    </div>
  );
}
