/**
 * SupportChat — floating widget + localStorage persistence
 * Users: send messages to support
 * Admins: view at /admin/support and reply to all sessions
 *
 * localStorage keys:
 *   grind_support_sessions  — Array<SupportSession>
 *   grind_support_user_id   — string (ephemeral user id)
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, ChevronDown, Bot, AlertCircle } from 'lucide-react';

export interface SupportMessage {
  id: string;
  from: 'user' | 'admin';
  text: string;
  time: string;
}

export interface SupportSession {
  id: string;
  userId: string;
  userAlias: string;
  messages: SupportMessage[];
  status: 'open' | 'resolved';
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'grind_support_sessions';
const USER_ID_KEY = 'grind_support_user_id';

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

function now() {
  return new Date().toISOString();
}

function timeLabel(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
}

export function getAllSessions(): SupportSession[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveSessions(sessions: SupportSession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function getOrCreateUserId(): string {
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = 'u_' + genId();
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

export function getOrCreateSession(userId: string, userAlias: string): SupportSession {
  const sessions = getAllSessions();
  const existing = sessions.find(s => s.userId === userId && s.status === 'open');
  if (existing) return existing;

  const newSession: SupportSession = {
    id: 's_' + genId(),
    userId,
    userAlias,
    messages: [
      {
        id: genId(),
        from: 'admin',
        text: 'Hi! Welcome to Grind Support. How can we help you today?',
        time: now(),
      },
    ],
    status: 'open',
    createdAt: now(),
    updatedAt: now(),
  };
  sessions.push(newSession);
  saveSessions(sessions);
  return newSession;
}

export function addUserMessage(sessionId: string, text: string): SupportSession | null {
  const sessions = getAllSessions();
  const idx = sessions.findIndex(s => s.id === sessionId);
  if (idx === -1) return null;

  const msg: SupportMessage = { id: genId(), from: 'user', text, time: now() };
  sessions[idx].messages.push(msg);
  sessions[idx].updatedAt = now();
  saveSessions(sessions);
  return sessions[idx];
}

export function addAdminReply(sessionId: string, text: string): SupportSession | null {
  const sessions = getAllSessions();
  const idx = sessions.findIndex(s => s.id === sessionId);
  if (idx === -1) return null;

  const msg: SupportMessage = { id: genId(), from: 'admin', text, time: now() };
  sessions[idx].messages.push(msg);
  sessions[idx].updatedAt = now();
  saveSessions(sessions);
  return sessions[idx];
}

export function resolveSession(sessionId: string) {
  const sessions = getAllSessions();
  const idx = sessions.findIndex(s => s.id === sessionId);
  if (idx !== -1) {
    sessions[idx].status = 'resolved';
    saveSessions(sessions);
  }
}

// ─────────────────────────────────────────────────────────
// SupportChat floating widget (user-facing)
// ─────────────────────────────────────────────────────────
interface Props {
  userAlias?: string;
}

export function SupportChat({ userAlias = 'Guest' }: Props) {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<SupportSession | null>(null);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const userId = useRef(getOrCreateUserId());

  const loadSession = useCallback(() => {
    const s = getOrCreateSession(userId.current, userAlias);
    // Always read latest from storage
    const latest = getAllSessions().find(x => x.id === s.id) || s;
    setSession(latest);
  }, [userAlias]);

  useEffect(() => {
    loadSession();
    // Poll for admin replies every 3s when open
    if (!open) return;
    const t = setInterval(loadSession, 3000);
    return () => clearInterval(t);
  }, [open, loadSession]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages.length]);

  const handleSend = () => {
    if (!input.trim() || !session) return;
    const updated = addUserMessage(session.id, input.trim());
    if (updated) setSession({ ...updated });
    setInput('');
  };

  const unreadCount = session
    ? session.messages.filter(m => m.from === 'admin').length
    : 0;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat panel */}
      {open && (
        <div className="w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden" style={{ height: 420 }}>
          {/* Header */}
          <div className="bg-[#0A0F1E] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#1E56CC] flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div>
                <div className="text-white text-sm font-semibold">Grind Support</div>
                <div className="text-gray-400 text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                  Online
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
            {session?.messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.from === 'admin' && (
                  <div className="w-6 h-6 rounded-full bg-[#1E56CC] flex items-center justify-center mr-2 shrink-0 mt-1">
                    <Bot size={12} className="text-white" />
                  </div>
                )}
                <div className={`max-w-[75%] rounded-2xl px-3 py-2 ${msg.from === 'user' ? 'bg-[#1E56CC] text-white rounded-br-sm' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'}`}>
                  <p className="text-xs leading-relaxed">{msg.text}</p>
                  <p className={`text-[10px] mt-1 ${msg.from === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>{timeLabel(msg.time)}</p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-100 bg-white flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="flex-1 text-xs px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#1E56CC]"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-8 h-8 rounded-xl bg-[#1E56CC] hover:bg-[#1848B0] disabled:opacity-40 flex items-center justify-center transition-all"
            >
              <Send size={14} className="text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full bg-[#0A0F1E] hover:bg-[#1E2640] shadow-xl flex items-center justify-center transition-all relative"
      >
        {open ? <ChevronDown size={22} className="text-white" /> : <MessageCircle size={22} className="text-white" />}
        {!open && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#FF6B35] text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
