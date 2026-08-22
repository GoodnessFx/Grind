import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Tv2, Users, Heart, Send, Gift, Eye, Mic, MicOff,
  Video, VideoOff, X, Plus, ChevronLeft, Radio,
  Crown, Star, Flame, Zap, ThumbsUp, Monitor, MonitorOff, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../lib/utils";
import type { UserData } from "../App";

interface LiveStreamProps {
  user: UserData;
  onUpdateUser: (updates: Partial<UserData>) => void;
  onBack: () => void;
}

interface Stream {
  id: string;
  title: string;
  creator: string;
  viewers: number;
  category: string;
  thumbnail: string;
  isLive: boolean;
  tier: "STARTER" | "BRONZE" | "GOLD" | "DIAMOND";
}

interface ChatMessage {
  id: number;
  user: string;
  text: string;
  color: string;
  badge?: string;
}

const MOCK_STREAMS: Stream[] = [
  { id: "1", title: "Live Coding: Building a React App from Scratch", creator: "@ada_tech", viewers: 234, category: "Coding", thumbnail: "", isLive: true, tier: "DIAMOND" },
  { id: "2", title: "Calculus Made Easy — Live Tutoring Session", creator: "@seun_maths", viewers: 189, category: "Tutoring", thumbnail: "", isLive: true, tier: "GOLD" },
  { id: "3", title: "Grind Hustle Talk: How I Made ₦80k in 30 Days", creator: "@emeka_dev", viewers: 412, category: "Talk", thumbnail: "", isLive: true, tier: "GOLD" },
  { id: "4", title: "Logo Design Speed Run — Watch Me Work!", creator: "@fatimah.design", viewers: 97, category: "Design", thumbnail: "", isLive: true, tier: "BRONZE" },
  { id: "5", title: "Q&A: Getting your first campus gig", creator: "@chidi_grind", viewers: 156, category: "Talk", thumbnail: "", isLive: false, tier: "GOLD" },
];

const CHAT_COLORS = ["text-yellow-500", "text-pink-500", "text-blue-500", "text-green-500", "text-purple-500", "text-orange-500"];

const SEED_CHAT: ChatMessage[] = [
  { id: 1, user: "Emeka_D", text: "This is 🔥🔥", color: "text-yellow-500" },
  { id: 2, user: "Fatimah", text: "Can you do the same with TypeScript?", color: "text-pink-500", badge: "GOLD" },
  { id: 3, user: "Temi_B", text: "Learned so much already", color: "text-blue-500" },
  { id: 4, user: "Chidi_C", text: "Please show the deployment step 🙏", color: "text-green-500" },
];

const GIFTS = [
  { id: "rose", emoji: "🌹", label: "Rose", price: 50 },
  { id: "fire", emoji: "🔥", label: "Fire", price: 100 },
  { id: "crown", emoji: "👑", label: "Crown", price: 500 },
  { id: "diamond", emoji: "💎", label: "Diamond", price: 1000 },
];

const STREAM_CATEGORIES = ["All", "Coding", "Design", "Tutoring", "Talk", "Music", "Gaming"];

const tierColors: Record<string, string> = {
  STARTER: "#98A2B3", BRONZE: "#CD7F32", GOLD: "#F79009", DIAMOND: "#0BA5EC",
};

export function LiveStream({ user, onUpdateUser, onBack }: LiveStreamProps) {
  const [view, setView] = useState<"browse" | "watch" | "go-live">("browse");
  const [activeStream, setActiveStream] = useState<Stream | null>(null);
  const [filter, setFilter] = useState("All");
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(SEED_CHAT);
  const [viewers, setViewers] = useState(0);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [showGifts, setShowGifts] = useState(false);
  const [heartBurst, setHeartBurst] = useState(false);
  const [liveTitle, setLiveTitle] = useState("");
  const [liveCategory, setLiveCategory] = useState("Talk");
  const [isStreaming, setIsStreaming] = useState(false);
  const [liveSeconds, setLiveSeconds] = useState(0);
  const [streamLikes, setStreamLikes] = useState(0);
  const [replyTargetId, setReplyTargetId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const [isScreenShare, setIsScreenShare] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const chatRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Start camera / screen + mic with graceful permission handling
  const startMedia = useCallback(async (shareScreen = isScreenShare) => {
    try {
      setPermissionError(null);
      // Stop any existing stream first
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }

      let stream: MediaStream;
      if (shareScreen) {
        if (!navigator.mediaDevices?.getDisplayMedia) {
          toast.error("Screen sharing is not supported on this browser.");
          return;
        }
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: isMicOn,
        });

        // If user stops sharing from browser UI
        stream.getVideoTracks()[0].onended = () => {
          setIsScreenShare(false);
          startMedia(false);
        };
      } else {
        stream = await navigator.mediaDevices.getUserMedia({
          video: isCamOn ? { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" } : false,
          audio: isMicOn,
        });
      }

      mediaStreamRef.current = stream;

      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = stream;
      }
      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Camera/mic/screen access error:", err);
      let errorMsg = "Could not access device camera or microphone.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        errorMsg = "Camera/Microphone permission was denied. Please allow camera and mic permissions in your browser URL bar.";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        errorMsg = "No camera or microphone device found on this system.";
      }
      setPermissionError(errorMsg);
      toast.error(errorMsg);
    }
  }, [isCamOn, isMicOn, isScreenShare]);

  // Stop all tracks
  const stopMedia = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
  }, []);

  // Start camera when entering go-live or streaming
  useEffect(() => {
    if (view === "go-live") {
      startMedia();
    }
    return () => {
      // Only stop if leaving go-live and not streaming
      if (view === "go-live" && !isStreaming) {
        stopMedia();
      }
    };
  }, [view, startMedia, stopMedia, isStreaming]);

  // Toggle camera track on/off
  useEffect(() => {
    const stream = mediaStreamRef.current;
    if (!stream) return;
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) videoTrack.enabled = isCamOn;
  }, [isCamOn]);

  // Toggle mic track on/off
  useEffect(() => {
    const stream = mediaStreamRef.current;
    if (!stream) return;
    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack) audioTrack.enabled = isMicOn;
  }, [isMicOn]);

  // Re-attach stream when switching between preview and live video elements
  useEffect(() => {
    if (mediaStreamRef.current) {
      if (isStreaming && liveVideoRef.current) {
        liveVideoRef.current.srcObject = mediaStreamRef.current;
      } else if (!isStreaming && previewVideoRef.current) {
        previewVideoRef.current.srcObject = mediaStreamRef.current;
      }
    }
  }, [isStreaming]);

  // Simulated viewer count fluctuation
  useEffect(() => {
    if (view !== "watch") return;
    const base = activeStream?.viewers ?? 100;
    setViewers(base);
    const iv = setInterval(() => {
      setViewers((v) => v + Math.floor(Math.random() * 5) - 2);
    }, 3000);
    return () => clearInterval(iv);
  }, [view, activeStream]);

  // Simulated chat messages
  useEffect(() => {
    if (view !== "watch") return;
    const names = ["Victor_O", "Amara_S", "Kunle_T", "Ngozi_B", "Ike_P", "Bisi_M"];
    const texts = ["Amazing content 🔥", "Keep going!", "How much does this pay?", "📱📱📱", "First time watching, loving it!", "GrindScore going up!", "Followed! 💚"];
    const iv = setInterval(() => {
      const newMsg: ChatMessage = {
        id: Date.now(),
        user: names[Math.floor(Math.random() * names.length)],
        text: texts[Math.floor(Math.random() * texts.length)],
        color: CHAT_COLORS[Math.floor(Math.random() * CHAT_COLORS.length)],
      };
      setMessages((prev) => [...prev.slice(-50), newMsg]);
    }, 2500);
    return () => clearInterval(iv);
  }, [view]);

  // Auto-scroll chat
  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Stream timer
  useEffect(() => {
    if (isStreaming) {
      timerRef.current = setInterval(() => setLiveSeconds((s) => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isStreaming]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0
      ? `${h}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
      : `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    setMessages((prev) => [...prev, {
      id: Date.now(),
      user: user.userName,
      text: chatInput.trim(),
      color: "text-accent",
      badge: user.tier,
    }]);
    setChatInput("");
  };

  const handleSendReply = (replyToUser: string) => {
    if (!replyText.trim()) return;
    setMessages((prev) => [...prev, {
      id: Date.now(),
      user: user.userName,
      text: `↳ @${replyToUser}: ${replyText.trim()}`,
      color: "text-accent",
      badge: user.tier,
    }]);
    setReplyText("");
    setReplyTargetId(null);
  };

  const handleGift = (gift: typeof GIFTS[0]) => {
    if (user.walletBalance < gift.price) {
      toast.error("Insufficient balance. Top up your wallet first.");
      return;
    }
    onUpdateUser({ walletBalance: user.walletBalance - gift.price });
    setMessages((prev) => [...prev, {
      id: Date.now(),
      user: user.userName,
      text: `sent ${gift.emoji} ${gift.label} (₦${gift.price})`,
      color: "text-yellow-500",
      badge: "GIFT",
    }]);
    setHeartBurst(true);
    setTimeout(() => setHeartBurst(false), 1000);
    toast.success(`${gift.emoji} Gift sent!`);
    setShowGifts(false);
  };

  const handleBecomeCreator = () => {
    if (!liveTitle.trim()) { toast.error("Enter a stream title"); return; }
    setIsStreaming(true);
    toast.success("You're live! 🎉");
    onUpdateUser({ isCreator: true });
  };

  const handleEndStream = () => {
    setIsStreaming(false);
    setLiveSeconds(0);
    stopMedia();
    toast.success("Stream ended. Great session!");
    setView("browse");
  };

  const filtered = MOCK_STREAMS.filter((s) => filter === "All" || s.category === filter);

  // ── Browse ─────────────────────────────────────────────────────
  if (view === "browse") {
    return (
      <div className="pb-28">
        <div className="bg-white px-5 pt-12 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button onClick={onBack} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">Live</h2>
                <p className="text-xs text-gray-500">{MOCK_STREAMS.filter((s) => s.isLive).length} streams live now</p>
              </div>
            </div>
            <button
              onClick={() => setView("go-live")}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2.5 rounded-2xl text-sm font-bold shadow-lg shadow-red-500/30 hover:bg-red-600 active:scale-95 transition-all"
            >
              <Radio className="w-4 h-4" />
              Go Live
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {STREAM_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={cn(
                  "flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all",
                  filter === cat ? "bg-accent text-white border-accent" : "bg-gray-50 text-gray-600 border-gray-200"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Featured stream */}
        {filtered[0] && (
          <div className="px-4 mt-4 mb-4">
            <button
              onClick={() => { setActiveStream(filtered[0]); setView("watch"); }}
              className="w-full bg-grind-neutral-900 rounded-3xl overflow-hidden text-left active:scale-[0.99] transition-all"
            >
              <div className="h-44 bg-gradient-to-br from-grind-neutral-900 via-accent/30 to-grind-neutral-900 flex items-center justify-center relative">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                  <Tv2 className="w-8 h-8 text-white" />
                </div>
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-500 text-white px-2.5 py-1 rounded-full text-xs font-bold">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  LIVE
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 text-white px-2.5 py-1 rounded-full text-xs font-medium">
                  <Eye className="w-3 h-3" />
                  {filtered[0].viewers.toLocaleString()}
                </div>
              </div>
              <div className="p-4">
                <p className="text-white font-bold text-sm line-clamp-1">{filtered[0].title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-white/60 text-xs">{filtered[0].creator}</span>
                  <div className="w-1 h-1 bg-white/40 rounded-full" />
                  <span className="text-white/60 text-xs">{filtered[0].category}</span>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* All streams grid */}
        <div className="px-4">
          <h3 className="text-sm font-bold text-gray-700 mb-3">All Streams</h3>
          <div className="space-y-3">
            {filtered.slice(1).map((stream) => (
              <button
                key={stream.id}
                onClick={() => { setActiveStream(stream); setView("watch"); }}
                className="w-full bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 text-left active:scale-[0.99] transition-all shadow-sm"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-accent/20 to-accent/5 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Tv2 className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm line-clamp-1">{stream.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{stream.creator}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {stream.isLive ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-red-500">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> LIVE
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-400 font-medium">Offline</span>
                    )}
                    <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                      <Eye className="w-3 h-3" /> {stream.viewers}
                    </span>
                    <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{stream.category}</span>
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tierColors[stream.tier] }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Watch ──────────────────────────────────────────────────────
  if (view === "watch" && activeStream) {
    return (
      <div className="h-full flex flex-col bg-black">
        {/* Video area */}
        <div className="relative bg-gradient-to-br from-gray-900 via-accent/20 to-gray-900 flex-shrink-0" style={{ height: "45%" }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center">
              <Tv2 className="w-10 h-10 text-white/60" />
            </div>
          </div>

          {/* Overlay controls */}
          <div className="absolute top-12 left-4 right-4 flex items-center justify-between">
            <button onClick={() => setView("browse")} className="w-9 h-9 bg-black/40 rounded-full flex items-center justify-center">
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-red-500 px-2.5 py-1 rounded-full text-white text-xs font-bold">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                LIVE
              </div>
              <div className="flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded-full text-white text-xs">
                <Eye className="w-3 h-3" /> {viewers.toLocaleString()}
              </div>
              <button onClick={() => setStreamLikes((c) => c + 1)} className="flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded-full text-white text-xs active:scale-95 transition-transform">
                <ThumbsUp className="w-3 h-3" /> {streamLikes}
              </button>
            </div>
          </div>

          {/* Stream info */}
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-white font-bold text-sm line-clamp-1 mb-1">{activeStream.title}</p>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold">
                {activeStream.creator[1].toUpperCase()}
              </div>
              <span className="text-white/80 text-xs">{activeStream.creator}</span>
              <button
                onClick={() => toast.success("Following!")}
                className="ml-auto bg-accent text-white px-3 py-1 rounded-full text-xs font-bold"
              >
                Follow
              </button>
            </div>
          </div>

          {heartBurst && (
            <div className="absolute right-8 bottom-20 text-3xl animate-bounce">❤️</div>
          )}
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-h-0 bg-gray-950">
          <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            {messages.map((msg) => (
              <div key={msg.id} className="flex items-start gap-2">
                <span className={cn("text-xs font-bold shrink-0", msg.color)}>
                  {msg.user}
                  {msg.badge && (
                    <span className="ml-1 text-[9px] bg-white/10 text-white px-1.5 py-0.5 rounded-full font-normal">{msg.badge}</span>
                  )}:
                </span>
                <span className="text-white/80 text-xs">{msg.text}</span>
                <button onClick={() => setReplyTargetId(msg.id)} className="ml-2 text-xs text-accent hover:underline shrink-0">Reply</button>
              </div>
            ))}
          </div>

          {/* Chat input */}
          <div className="px-4 py-3 pb-safe flex flex-col border-t border-white/10">
            {replyTargetId !== null && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] text-white/50">Replying to {messages.find(m => m.id === replyTargetId)?.user}</span>
                <button onClick={() => setReplyTargetId(null)} className="text-xs text-red-400 ml-auto">Cancel</button>
              </div>
            )}
            {replyTargetId !== null && (
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 h-8 px-3 bg-white/10 text-white placeholder-white/40 rounded-xl text-sm border-none focus:outline-none"
                  onKeyDown={(e) => e.key === "Enter" && handleSendReply(messages.find(m => m.id === replyTargetId)?.user || "")}
                  autoFocus
                />
                <button
                  onClick={() => handleSendReply(messages.find(m => m.id === replyTargetId)?.user || "")}
                  className="px-3 py-1.5 bg-accent text-white rounded-xl text-xs font-bold"
                >
                  Send
                </button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setHeartBurst(true); setTimeout(() => setHeartBurst(false), 1000); }}
                className="w-10 h-10 flex items-center justify-center text-xl active:scale-90 transition-transform"
              >
                ❤️
              </button>
              <input
                type="text"
                placeholder="Say something..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                className="flex-1 h-10 px-4 bg-white/10 text-white placeholder-white/40 rounded-2xl text-sm border-none focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
              <button
                onClick={() => setShowGifts(true)}
                className="w-10 h-10 flex items-center justify-center text-xl active:scale-90 transition-transform"
              >
                🎁
              </button>
              <button
                onClick={handleSendChat}
                className="w-10 h-10 bg-accent rounded-2xl flex items-center justify-center active:scale-95 transition-all"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Gift panel */}
        {showGifts && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end">
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowGifts(false)} />
            <div className="relative bg-gray-900 rounded-t-3xl px-5 pt-5 pb-8">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-bold">Send a Gift</h3>
                <button onClick={() => setShowGifts(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
              <p className="text-white/50 text-xs mb-4">Balance: ₦{user.walletBalance.toLocaleString()} cNGN</p>
              <div className="grid grid-cols-4 gap-3">
                {GIFTS.map((gift) => (
                  <button
                    key={gift.id}
                    onClick={() => handleGift(gift)}
                    className="flex flex-col items-center gap-2 bg-white/10 rounded-2xl p-3 active:scale-95 transition-all hover:bg-white/20"
                  >
                    <span className="text-3xl">{gift.emoji}</span>
                    <span className="text-white/80 text-[10px] font-medium">{gift.label}</span>
                    <span className="text-accent text-[10px] font-bold">₦{gift.price}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Go Live ────────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col bg-white">
      <div className="px-5 pt-12 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button onClick={() => { if (isStreaming) { handleEndStream(); } else { stopMedia(); setView("browse"); } }} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h2 className="font-bold text-gray-900">{isStreaming ? "You're Live 🔴" : "Start Streaming"}</h2>
        </div>
      </div>

      {isStreaming ? (
        <div className="flex-1 flex flex-col">
          {/* Live camera feed */}
          <div className="bg-gray-900 flex-shrink-0 relative" style={{ height: "40%" }}>
            <div className="absolute inset-0">
              {isCamOn ? (
                <video
                  ref={liveVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <VideoOff className="w-12 h-12 text-white/30" />
                </div>
              )}
            </div>
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center gap-2 bg-red-500 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-white text-xs font-bold">LIVE {formatTime(liveSeconds)}</span>
              </div>
              <div className="flex items-center gap-1 bg-black/40 px-2.5 py-1.5 rounded-full text-white text-xs">
                <Eye className="w-3 h-3" />
                <span>{Math.floor(liveSeconds / 10) + 1}</span>
              </div>
            </div>
          </div>

          {/* Live controls */}
          <div className="px-5 py-5 border-t border-gray-100">
            <p className="font-bold text-gray-900 text-sm mb-1">{liveTitle}</p>
            <p className="text-xs text-gray-500 mb-5">{liveCategory} • You are broadcasting live to all connected users</p>
            <div className="flex justify-around">
              <button
                onClick={() => setIsMicOn((v) => !v)}
                className={cn("flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all", isMicOn ? "bg-gray-100" : "bg-red-50")}
              >
                {isMicOn ? <Mic className="w-6 h-6 text-gray-700" /> : <MicOff className="w-6 h-6 text-red-500" />}
                <span className="text-[10px] font-medium text-gray-500">{isMicOn ? "Mute" : "Unmute"}</span>
              </button>
              <button
                onClick={() => setIsCamOn((v) => !v)}
                className={cn("flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all", isCamOn ? "bg-gray-100" : "bg-red-50")}
              >
                {isCamOn ? <Video className="w-6 h-6 text-gray-700" /> : <VideoOff className="w-6 h-6 text-red-500" />}
                <span className="text-[10px] font-medium text-gray-500">{isCamOn ? "Camera" : "No Camera"}</span>
              </button>
              <button
                onClick={() => {
                  const nextScreen = !isScreenShare;
                  setIsScreenShare(nextScreen);
                  startMedia(nextScreen);
                }}
                className={cn("flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all", isScreenShare ? "bg-accent/10 text-accent" : "bg-gray-100 text-gray-700")}
              >
                {isScreenShare ? <Monitor className="w-6 h-6 text-accent" /> : <Monitor className="w-6 h-6 text-gray-700" />}
                <span className="text-[10px] font-medium">{isScreenShare ? "Sharing Screen" : "Share Screen"}</span>
              </button>
              <button
                onClick={handleEndStream}
                className="flex flex-col items-center gap-1.5 p-3 bg-red-50 rounded-2xl"
              >
                <X className="w-6 h-6 text-red-500" />
                <span className="text-[10px] font-medium text-red-500">End</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5">
          {permissionError && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-bold text-red-800 mb-1">Permissions Needed</p>
                <p className="text-xs text-red-700 leading-relaxed">{permissionError}</p>
                <button
                  onClick={() => startMedia(isScreenShare)}
                  className="mt-2 text-xs font-bold text-red-800 underline"
                >
                  Retry Access
                </button>
              </div>
            </div>
          )}

          {/* Camera / Screen preview — real feed */}
          <div className="bg-gray-900 rounded-3xl h-52 overflow-hidden relative shadow-inner">
            {isCamOn || isScreenShare ? (
              <video
                ref={previewVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                <VideoOff className="w-8 h-8 text-white/40" />
                <span className="text-white/40 text-xs">Camera / Screen preview off</span>
              </div>
            )}
            {/* Cam/Mic/Screen toggle overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-md p-1.5 rounded-full">
              <button
                onClick={() => setIsMicOn((v) => !v)}
                title="Toggle Mic"
                className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-all", isMicOn ? "bg-white/20 text-white" : "bg-red-500 text-white")}
              >
                {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  setIsCamOn((v) => !v);
                  if (isScreenShare) {
                    setIsScreenShare(false);
                    startMedia(false);
                  }
                }}
                title="Toggle Camera"
                className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-all", isCamOn && !isScreenShare ? "bg-white/20 text-white" : "bg-red-500 text-white")}
              >
                {isCamOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  const nextScreen = !isScreenShare;
                  setIsScreenShare(nextScreen);
                  startMedia(nextScreen);
                }}
                title="Share Screen to show what you are building"
                className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-all", isScreenShare ? "bg-accent text-white" : "bg-white/20 text-white")}
              >
                <Monitor className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stream title */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Stream Title *</label>
            <input
              type="text"
              placeholder="e.g. Live Coding: Building a gig app"
              value={liveTitle}
              onChange={(e) => setLiveTitle(e.target.value)}
              className="w-full h-13 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {["Coding", "Design", "Tutoring", "Talk", "Music", "Gaming"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setLiveCategory(cat)}
                  className={cn(
                    "py-2.5 rounded-2xl text-sm font-semibold border-2 transition-all active:scale-95",
                    liveCategory === cat ? "bg-accent text-white border-accent" : "bg-gray-50 text-gray-600 border-transparent"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Creator tip */}
          {!user.isCreator && (
            <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 flex items-start gap-3">
              <Crown className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-gray-800 mb-0.5">Become a Creator</p>
                <p className="text-xs text-gray-600">Going live for the first time grants you Creator status. Earn gifts and grow your audience!</p>
              </div>
            </div>
          )}

          <button
            onClick={handleBecomeCreator}
            className="w-full h-14 bg-red-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-600 active:scale-95 transition-all shadow-lg shadow-red-500/30"
          >
            <Radio className="w-5 h-5" />
            Start Stream
          </button>
        </div>
      )}
    </div>
  );
}
