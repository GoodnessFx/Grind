import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, ChevronDown, Check, CheckCheck, Sparkles, User, ExternalLink } from 'lucide-react';
import { supportApi, SupportMessage, getOrInitSupportUser } from '../../lib/supportApi';
import { LogoMark } from '../../app/components/brand/LogoMark';
import { Link } from 'react-router-dom';

// ── Grind AI knowledge base ────────────────────────────────────────────────────
// Instant answers for common questions. Human admins see every user message in
// the Admin Console and can reply in realtime (SSE) — AI never blocks that.
const AI_KB: { keys: string[]; answer: string }[] = [
  {
    keys: ['escrow', 'lock', 'safe', 'secure', 'protect'],
    answer: 'Every payment on Grind locks in escrow 🛡️ — the money only lands in the doer\'s wallet when the poster approves the work. If person conduct well, open a dispute and our team go review am within 24 hours.',
  },
  {
    keys: ['withdraw', 'cash out', 'bank', 'payout'],
    answer: 'Withdrawals land for your bank in 1–2 hours (rare cases up to 24h). Go to Wallet → Withdraw, enter the amount and your bank details. Minimum withdrawal na ₦500.',
  },
  {
    keys: ['verif', 'badge', 'student id', 'school email'],
    answer: 'Verify with your school email or upload your student ID (Onboarding → Verification). The verified badge builds trust and brings more gigs your way.',
  },
  {
    keys: ['post', 'create gig', 'publish', 'new gig'],
    answer: 'To post a gig: tap "Post a Gig" from Home or the Gigs page. Fill in title, description, budget (min ₦500) and deadline. Scam keywords go hold the gig for review before e go live.',
  },
  {
    keys: ['spin', 'daily spin', 'wheel'],
    answer: 'Daily Spin dey your home page — one spin per day. You fit win ₦100–₦500 credit or a free gig post! Credit enters your wallet immediately. 🎡',
  },
  {
    keys: ['refer', 'invite', 'referral'],
    answer: 'Share your referral link (Settings → Refer & Earn). When your invite completes their first gig, you chop ₦500 straight to your wallet! 🎉',
  },
  {
    keys: ['fee', 'charge', 'commission', 'percentage', 'cost'],
    answer: 'Platform fee na 8% + 1.5% escrow fee on each gig. That\'s all — no hidden charges. The doer receives budget minus those two fees.',
  },
  {
    keys: ['fund', 'deposit', 'top up', 'topup', 'card', 'paystack'],
    answer: 'Fund your wallet: Wallet → Fund. You fit use card (Paystack) or bank transfer to your unique virtual account. Money lands instantly.',
  },
  {
    keys: ['scam', 'fraud', 'report', 'suspicious'],
    answer: 'Nor send money outside Grind, nor pay upfront for any gig. If person misbehave, tap the Report button (flag icon) on their profile, gig or chat — we go look am.',
  },
  {
    keys: ['live', 'stream', 'spray', 'gift'],
    answer: 'You fit watch campus live streams on /live and spray money (₦50–₦1,000) for creators. Creators fit even schedule streams ahead with reminders! 💸',
  },
  {
    keys: ['grindscore', 'grind score', 'score', 'tier'],
    answer: 'Your GrindScore na your CV 💪 — every completed gig, positive review and on-time delivery grows am. It determines your tier: Fresher → Padi → Plug → Oga → Big Boy/Girl.',
  },
  {
    keys: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'how far', 'una'],
    answer: 'Hello! 👋 I\'m Grind AI. Ask me anything about escrow, withdrawals, posting gigs, verification or referrals — I answer sharp sharp.',
  },
];

function grindAiReply(text: string): string {
  const lower = text.toLowerCase();
  for (const entry of AI_KB) {
    if (entry.keys.some((k) => lower.includes(k))) return entry.answer;
  }
  return "Hmm, I nor sure about that one 😅 — I don pass am to the Grind support team. A human go reply you here shortly. Meanwhile you fit ask me about: escrow, withdrawals, verification, referrals or daily spin.";
}

const AI_SUGGESTIONS = [
  'How does escrow work?',
  'How do I withdraw?',
  'How do I get verified?',
  'How does the daily spin work?',
];

function timeLabel(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(getOrInitSupportUser());
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'reconnecting'>('connected');
  const [unreadCount, setUnreadCount] = useState(0);
  const [guestNameInput, setGuestNameInput] = useState('');
  const [isEditingGuestName, setIsEditingGuestName] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  // Sync current user on mount & storage changes
  useEffect(() => {
    const sync = () => {
      const u = getOrInitSupportUser();
      setCurrentUser(u);
      setGuestNameInput(u.name);
    };
    sync();
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  // Fetch full history from server on mount
  useEffect(() => {
    if (!currentUser.userId) return;
    supportApi
      .fetchMessages(currentUser.userId)
      .then((res) => {
        setMessages(res.messages || []);
        // Calculate initial unread
        const unread = (res.messages || []).filter((m) => m.sender === 'support' && !m.read).length;
        if (!open) setUnreadCount(unread);
      })
      .catch(() => {});
  }, [currentUser.userId]);

  // Realtime SSE push subscription (No polling!)
  useEffect(() => {
    if (!currentUser.userId) return;

    const cleanup = supportApi.subscribeRealtime({
      userId: currentUser.userId,
      onEvent: (event) => {
        if (event.type === 'message') {
          const newMsg: SupportMessage = event.data;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });

          if (!open && newMsg.sender === 'support') {
            setUnreadCount((c) => c + 1);
            // In-app short notification sound
            try {
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
              audio.volume = 0.4;
              audio.play().catch(() => {});
            } catch {}
          } else if (open && newMsg.sender === 'support') {
            supportApi.markRead(currentUser.userId, 'user').catch(() => {});
          }
        } else if (event.type === 'read') {
          // Read receipt update
          if (event.data?.readBy === 'support') {
            setMessages((prev) =>
              prev.map((m) => (m.sender === 'user' ? { ...m, read: true } : m))
            );
          }
        }
      },
      onStatusChange: (status) => setConnectionStatus(status),
    });

    return cleanup;
  }, [currentUser.userId, open]);

  // Mark messages as read when opening chat
  useEffect(() => {
    if (open && currentUser.userId) {
      setUnreadCount(0);
      supportApi.markRead(currentUser.userId, 'user').catch(() => {});
    }
  }, [open, currentUser.userId]);

  // Scroll to bottom on message list change
  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const sendBody = async (body: string) => {
    if (!body || sending || !currentUser.userId) return;

    setSending(true);
    try {
      const res = await supportApi.sendMessage({
        userId: currentUser.userId,
        sender: 'user',
        body,
        userName: currentUser.name,
        userEmail: currentUser.email,
      });

      if (res?.message) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === res.message.id)) return prev;
          return [...prev, res.message];
        });
      }
      setInput('');

      // ── Grind AI instant answer (human admin still sees the message above
      //    in the Admin Console and can reply in realtime) ──────────────────
      setAiTyping(true);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai_${Date.now()}`,
            user_id: currentUser.userId,
            sender: 'ai',
            body: grindAiReply(body),
            read: true,
            created_at: new Date().toISOString(),
          } as SupportMessage,
        ]);
        setAiTyping(false);
      }, 900);
    } catch (err) {
      console.error('[Support] send error:', err);
    } finally {
      setSending(false);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    await sendBody(input.trim());
  };

  const askSuggestion = (q: string) => sendBody(q);

  const handleSaveGuestName = () => {
    if (!guestNameInput.trim()) return;
    localStorage.setItem('grind_guest_name', guestNameInput.trim());
    setCurrentUser((prev) => ({ ...prev, name: guestNameInput.trim() }));
    setIsEditingGuestName(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-[Inter,sans-serif]">
      {open && (
        <div
          className="w-[90vw] sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom duration-200"
          style={{ height: '480px' }}
        >
          {/* Header — Grind AI */}
          <div className="bg-[#006400] text-white px-4 py-3.5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center bg-white shrink-0">
                <LogoMark size={22} tone="dark" />
              </div>
              <div>
                <div className="text-white text-sm font-bold flex items-center gap-2">
                  Grind AI
                  <span className="text-[10px] bg-white/25 px-2 py-0.5 rounded-full font-medium">AI + human team</span>
                </div>
                <div className="text-white/80 text-xs flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`w-2 h-2 rounded-full inline-block ${
                      connectionStatus === 'connected' ? 'bg-green-300 animate-pulse' : 'bg-amber-300'
                    }`}
                  />
                  <span>{connectionStatus === 'connected' ? 'Online — answers instantly' : 'Reconnecting...'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-white/80">
              <Link
                to="/support"
                title="Open full support page"
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <ExternalLink size={16} />
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* User identifier strip */}
          <div className="bg-gray-50 border-b border-gray-200 px-3.5 py-1.5 flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-1.5 truncate">
              <User size={13} className="text-[#006400]" />
              {isEditingGuestName ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={guestNameInput}
                    onChange={(e) => setGuestNameInput(e.target.value)}
                    className="border border-gray-300 rounded px-1.5 py-0.5 text-xs text-black w-28"
                    placeholder="Your name"
                  />
                  <button onClick={handleSaveGuestName} className="text-[#006400] font-bold px-1 hover:underline">
                    Save
                  </button>
                </div>
              ) : (
                <span className="font-semibold text-gray-800 truncate">
                  Chatting as: {currentUser.name} {currentUser.isGuest && '(Guest)'}
                </span>
              )}
            </div>
            {currentUser.isGuest && !isEditingGuestName && (
              <button
                onClick={() => setIsEditingGuestName(true)}
                className="text-[11px] text-[#006400] hover:underline font-medium ml-2"
              >
                Edit name
              </button>
            )}
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F9FBFA]">
            {messages.length === 0 && !aiTyping ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-white border border-gray-200 flex items-center justify-center mb-3 shadow-sm">
                  <LogoMark size={34} tone="dark" />
                </div>
                <p className="font-bold text-gray-800 text-sm">Hi! I'm Grind AI 🇳🇬</p>
                <p className="text-xs text-gray-500 mt-1 max-w-[240px]">
                  Ask me anything about gigs, escrow, withdrawals, or spin — or tap a question below. Humans are here too.
                </p>
                <div className="flex flex-wrap justify-center gap-1.5 mt-4">
                  {AI_SUGGESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => askSuggestion(q)}
                      className="text-[11px] font-semibold bg-green-50 hover:bg-[#006400] hover:text-white text-[#006400] border border-green-200 px-3 py-1.5 rounded-full transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m) => {
                const isMe = m.sender === 'user';
                const isAi = m.sender === 'ai';
                return (
                  <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    {!isMe && isAi && (
                      <span className="text-[10px] font-bold text-[#006400] px-1 mb-0.5 flex items-center gap-1">
                        <Sparkles size={10} /> Grind AI
                      </span>
                    )}
                    {!isMe && !isAi && (
                      <span className="text-[10px] font-semibold text-gray-400 px-1 mb-0.5">
                        Support team
                      </span>
                    )}
                    <div
                      className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm break-words ${
                        isMe
                          ? 'bg-[#006400] text-white rounded-br-sm'
                          : isAi
                            ? 'bg-green-50 text-gray-800 border border-green-200 rounded-bl-sm'
                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                      }`}
                    >
                      <p>{m.body}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400 px-1">
                      <span>{timeLabel(m.created_at)}</span>
                      {isMe && (
                        <span>
                          {m.read ? (
                            <CheckCheck size={13} className="text-green-600 inline" />
                          ) : (
                            <Check size={13} className="text-gray-400 inline" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            {aiTyping && (
              <div className="flex items-start">
                <div className="bg-white border border-green-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#006400] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#006400] animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#006400] animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Chat input */}
          <form onSubmit={handleSend} className="p-2.5 bg-white border-t border-gray-200 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about Grind..."
              className="flex-1 bg-gray-50 border border-gray-200 focus:border-[#006400] focus:bg-white rounded-xl px-3.5 py-2 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="w-9 h-9 rounded-xl bg-[#006400] hover:bg-[#004d00] disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-md active:scale-95"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}

      {/* Floating trigger button — Grind AI */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Grind AI — Ask anything"
        title="Ask Grind AI"
        className="group relative w-13 h-13 sm:w-14 sm:h-14 bg-[#006400] hover:bg-[#004d00] text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-200 active:scale-95 border-2 border-white/20 hover:scale-105"
      >
        {open ? <ChevronDown size={22} /> : <MessageCircle size={24} />}
        {unreadCount > 0 && !open && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow">
            {unreadCount}
          </span>
        )}
        <span
          className={`absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border border-[#006400] ${
            connectionStatus === 'connected' ? 'bg-green-400' : 'bg-amber-400'
          }`}
          title={connectionStatus === 'connected' ? 'Online' : 'Reconnecting'}
        />
      </button>
    </div>
  );
}