/**
 * ChatWidget — database-backed floating support chat for logged-in users.
 * Cross-device: messages live in the `support_messages` table via the server.
 * Polls GET /chat-messages?since=<ts> every 5s; send button POSTs new message.
 * Only rendered when a user is logged in (localStorage 'grind_user').
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, ChevronDown } from 'lucide-react';
import { chatApi } from '../../lib/adminApi';

interface Msg {
  id: number;
  sender: 'user' | 'support';
  body: string;
  created_at: string;
}

const isLoggedIn = () => !!localStorage.getItem('grind_user');

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
}

export function ChatWidget() {
  const [visible, setVisible] = useState(isLoggedIn());
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastTs = useRef<string | undefined>(undefined);

  const poll = useCallback(async () => {
    try {
      const { messages: msgs } = await chatApi.fetchMessages(lastTs.current);
      if (msgs.length) {
        setMessages((prev) => {
          const seen = new Set(prev.map((m) => m.id));
          return [...prev, ...msgs.filter((m: Msg) => !seen.has(m.id))];
        });
        lastTs.current = msgs[msgs.length - 1].created_at;
      }
    } catch {
      /* silent — server may be starting */
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    poll();
    const iv = setInterval(poll, 5000);
    return () => clearInterval(iv);
  }, [visible, poll]);

  useEffect(() => {
    const onStorage = () => setVisible(isLoggedIn());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);
  const handleSend = async () => {
    const body = input.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      const { message } = await chatApi.send(body);
      if (message) {
        setMessages((prev) => [...prev, message]);
        lastTs.current = message.created_at;
      }
      setInput('');
    } catch {
      /* silent */
    } finally {
      setSending(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden" style={{ height: 420 }}>
          <div className="bg-[#0A0F1E] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#1E56CC] flex items-center justify-center">
                <MessageCircle size={16} className="text-white" />
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

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
            {messages.length === 0 && (
              <p className="text-xs text-gray-400 text-center mt-8">
                Hi! Welcome to Grind Support. How can we help you today?
              </p>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-3 py-2 ${msg.sender === 'user' ? 'bg-[#1E56CC] text-white rounded-br-sm' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'}`}>
                  <p className="text-xs leading-relaxed whitespace-pre-wrap break-words">{msg.body}</p>
                  <p className={`text-[10px] mt-1 ${msg.sender === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                    {timeLabel(msg.created_at)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="p-3 border-t border-gray-100 bg-white flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="flex-1 text-xs px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#1E56CC]"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="w-8 h-8 rounded-xl bg-[#1E56CC] hover:bg-[#1848B0] disabled:opacity-40 flex items-center justify-center transition-all"
            >
              <Send size={14} className="text-white" />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full bg-[#0A0F1E] hover:bg-[#1E2640] shadow-xl flex items-center justify-center transition-all"
        aria-label="Support chat"
      >
        {open ? <ChevronDown size={22} className="text-white" /> : <MessageCircle size={22} className="text-white" />}
      </button>
    </div>
  );
}