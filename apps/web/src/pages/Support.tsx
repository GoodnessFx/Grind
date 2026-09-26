import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageCircle, Send, Check, CheckCheck, Shield, HelpCircle,
  FileQuestion, Clock, User, ArrowLeft, ExternalLink, Sparkles
} from 'lucide-react';
import { LogoMark } from '../app/components/brand/LogoMark';
import { supportApi, SupportMessage, getOrInitSupportUser } from '../lib/supportApi';

function timeLabel(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export function Support() {
  const [currentUser, setCurrentUser] = useState(getOrInitSupportUser());
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'reconnecting'>('connected');
  const [guestNameInput, setGuestNameInput] = useState('');
  const [isEditingGuestName, setIsEditingGuestName] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

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

  // Fetch initial history
  useEffect(() => {
    if (!currentUser.userId) return;
    supportApi
      .fetchMessages(currentUser.userId)
      .then((res) => {
        setMessages(res.messages || []);
        supportApi.markRead(currentUser.userId, 'user').catch(() => {});
      })
      .catch(() => {});
  }, [currentUser.userId]);

  // Real-time SSE push
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
          if (newMsg.sender === 'support') {
            supportApi.markRead(currentUser.userId, 'user').catch(() => {});
          }
        } else if (event.type === 'read') {
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
  }, [currentUser.userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
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
      console.error('[Support page send error]', err);
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
    <div className="min-h-screen bg-[#F4F6F8] font-[Inter,sans-serif] flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <LogoMark size={36} tone="dark" />
              <span className="font-black text-xl text-[var(--grind-primary)] tracking-tight">Grind</span>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-700 font-bold text-sm">Help & Campus Support</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full text-xs font-medium text-gray-700">
              <span
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span>{connectionStatus === 'connected' ? 'Support Desk Online' : 'Connecting...'}</span>
            </div>
            <Link
              to="/"
              className="text-xs font-bold text-[#006400] hover:underline flex items-center gap-1"
            >
              <ArrowLeft size={14} /> Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Support Chat Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-sm flex flex-col h-[700px] overflow-hidden">
          {/* Chat Header */}
          <div className="bg-[#006400] text-white p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm shadow-inner">
                <Sparkles size={22} className="text-green-200" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                  Live Campus Support Desk
                </h1>
                <p className="text-xs text-green-100 flex items-center gap-1.5 mt-0.5">
                  <Clock size={12} /> Instant resolution for gigs, escrow, and campus inquiries
                </p>
              </div>
            </div>
          </div>

          {/* User Status Bar */}
          <div className="bg-gray-50 border-b border-gray-200 px-5 py-2.5 flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <User size={14} className="text-[#006400]" />
              {isEditingGuestName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={guestNameInput}
                    onChange={(e) => setGuestNameInput(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-0.5 text-xs text-black"
                    placeholder="Enter your name"
                  />
                  <button
                    onClick={handleSaveGuestName}
                    className="bg-[#006400] text-white font-bold px-2 py-0.5 rounded text-xs"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <span>
                  Connected as: <strong className="text-gray-900">{currentUser.name}</strong>{' '}
                  {currentUser.isGuest ? '(Guest)' : `(${currentUser.email})`}
                </span>
              )}
            </div>

            {currentUser.isGuest && !isEditingGuestName && (
              <button
                onClick={() => setIsEditingGuestName(true)}
                className="text-xs text-[#006400] hover:underline font-bold"
              >
                Change Display Name
              </button>
            )}
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#F9FBFA]">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-500">
                <div className="w-16 h-16 rounded-3xl bg-green-50 text-[#006400] flex items-center justify-center mb-4 shadow-sm">
                  <MessageCircle size={32} />
                </div>
                <h3 className="text-base font-bold text-gray-900">How can we assist your campus grind today?</h3>
                <p className="text-xs text-gray-500 mt-1.5 max-w-sm leading-relaxed">
                  Type a message below to instantly connect with our Nigerian university support team. We help with escrow transactions, profile verifications, gig questions, and payouts.
                </p>
              </div>
            ) : (
              messages.map((m) => {
                const isMe = m.sender === 'user';
                return (
                  <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm break-words ${
                        isMe
                          ? 'bg-[#006400] text-white rounded-br-sm'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                      }`}
                    >
                      <p>{m.body}</p>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-gray-400 px-1">
                      <span>{timeLabel(m.created_at)}</span>
                      {isMe && (
                        <span>
                          {m.read ? (
                            <CheckCheck size={14} className="text-green-600 inline" />
                          ) : (
                            <Check size={14} className="text-gray-400 inline" />
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

          {/* Chat Input */}
          <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-200 flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything or request support assistance..."
              className="flex-1 bg-gray-50 border border-gray-200 focus:border-[#006400] focus:bg-white rounded-2xl px-4 py-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 shadow-inner"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="px-6 py-3 rounded-2xl bg-[#006400] hover:bg-[#004d00] disabled:opacity-40 text-white font-bold text-sm flex items-center gap-2 transition-all shadow-md active:scale-95"
            >
              <Send size={16} /> Send
            </button>
          </form>
        </div>

        {/* Right Side: Quick FAQ & Guidelines */}
        <div className="space-y-6">
          {/* Escrow Guarantee Box */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-green-50 text-[#006400] flex items-center justify-center">
              <Shield size={24} />
            </div>
            <h2 className="text-lg font-black text-gray-900">100% Escrow Protection</h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              Every cNGN gig payment is locked inside the smart contract escrow. Sellers only get paid when buyers confirm receipt and satisfaction.
            </p>
          </div>

          {/* Common Campus Questions */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
              <HelpCircle size={18} className="text-[#006400]" /> Frequently Asked
            </h3>

            <div className="space-y-3 text-xs text-gray-600">
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="font-bold text-gray-900 mb-1">How does student identity verification work?</p>
                <p>We verify student matric numbers and school emails across OAU, UNILAG, UI, and other institutions.</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="font-bold text-gray-900 mb-1">What is GrindScore?</p>
                <p>An onchain reputation score computed mathematically from verified delivery, client reviews, and punctuality.</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="font-bold text-gray-900 mb-1">Can I withdraw cNGN to my Nigerian bank?</p>
                <p>Yes, instant withdrawals to any Nigerian commercial bank account arrive within 1-2 hours.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
