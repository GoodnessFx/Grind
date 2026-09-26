import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, ChevronDown, Check, CheckCheck, Sparkles, User, ExternalLink } from 'lucide-react';
import { supportApi, SupportMessage, getOrInitSupportUser } from '../../lib/supportApi';
import { Link } from 'react-router-dom';

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

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const body = input.trim();
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
    } catch (err) {
      console.error('[Support] send error:', err);
    } finally {
      setSending(false);
    }
  };

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
          {/* Header */}
          <div className="bg-[#006400] text-white px-4 py-3.5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-white shadow-inner">
                <Sparkles size={18} className="text-green-200" />
              </div>
              <div>
                <div className="text-white text-sm font-bold flex items-center gap-2">
                  Grind Support
                  <span className="text-[10px] bg-white/25 px-2 py-0.5 rounded-full font-medium">Campus 24/7</span>
                </div>
                <div className="text-white/80 text-xs flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`w-2 h-2 rounded-full inline-block ${
                      connectionStatus === 'connected' ? 'bg-green-300 animate-pulse' : 'bg-amber-300'
                    }`}
                  />
                  <span>{connectionStatus === 'connected' ? 'Active Realtime' : 'Reconnecting...'}</span>
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
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-[#006400] mb-3">
                  <MessageCircle size={24} />
                </div>
                <p className="font-semibold text-gray-800 text-sm">Need help with a gig, payment, or escrow?</p>
                <p className="text-xs text-gray-500 mt-1 max-w-[220px]">
                  Our campus support team is online across Nigerian universities to help you!
                </p>
              </div>
            ) : (
              messages.map((m) => {
                const isMe = m.sender === 'user';
                return (
                  <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm break-words ${
                        isMe
                          ? 'bg-[#006400] text-white rounded-br-sm'
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

      {/* Floating trigger pill/button */}
      <button
        onClick={() => setOpen(!open)}
        className="group relative flex items-center gap-2.5 bg-[#006400] hover:bg-[#004d00] text-white font-bold px-4 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 active:scale-95 border-2 border-white/20"
      >
        <div className="relative">
          <MessageCircle size={20} />
          {unreadCount > 0 && !open && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce shadow">
              {unreadCount}
            </span>
          )}
        </div>
        <span className="text-sm font-semibold tracking-wide">Campus Support</span>
        <span
          className={`w-2 h-2 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-300' : 'bg-amber-300'
          }`}
        />
      </button>
    </div>
  );
}