/**
 * AdminConsole — hidden admin panel at /xk9-admin-console-7f3a
 * Tabs: Users | Support Inbox | Audit Log
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, LogOut, Download, Send, RefreshCw, ChevronLeft, ChevronRight, History,
} from 'lucide-react';
import { adminApi, getAdminToken, setAdminToken } from '../lib/adminApi';
import { supportApi, SupportThread, SupportMessage, AdminUser } from '../lib/supportApi';

interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  phone: string | null;
  email: string | null;
  role: string | null;
  grind_score: number | null;
  verified_badge: string | null;
  created_at: string;
}

interface LoginEvent {
  id: number;
  email: string | null;
  user_agent: string | null;
  created_at: string;
}

interface Thread {
  user_id: string;
  sender: string;
  body: string;
  created_at: string;
  full_name?: string | null;
  username?: string | null;
  email?: string | null;
}

interface ChatMsg {
  id: number;
  sender: 'user' | 'support';
  body: string;
  created_at: string;
}

interface AuditEntry {
  id: number;
  actor: string;
  action: string;
  target: string | null;
  old_values: any;
  new_values: any;
  created_at: string;
}

const fmt = (iso: string) => new Date(iso).toLocaleString('en-NG');

// ── Login gate ───────────────────────────────────────────────────────────────
function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { token } = await adminApi.login(username, password);
      setAdminToken(token);
      onLogin();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020d1f] flex items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-sm bg-[#0A1628] border border-white/10 rounded-2xl p-8">
        <h1 className="text-white font-black text-xl mb-1">Console</h1>
        <p className="text-white/40 text-xs mb-6">Restricted access. All activity is logged.</p>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          autoComplete="username"
          className="w-full mb-3 px-4 py-3 rounded-lg bg-[#020d1f] border border-white/10 text-white text-sm outline-none focus:border-[#1E56CC]"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoComplete="current-password"
          className="w-full mb-4 px-4 py-3 rounded-lg bg-[#020d1f] border border-white/10 text-white text-sm outline-none focus:border-[#1E56CC]"
          required
        />
        {error && <p className="text-red-400 text-xs mb-4">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full bg-[#1E56CC] hover:bg-[#1848B0] disabled:opacity-50 text-white font-bold py-3 rounded-lg text-sm transition-colors"
        >
          {busy ? 'Verifying…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
// ── Users tab ────────────────────────────────────────────────────────────────
function UsersTab() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<Profile[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Profile | null>(null);
  const [form, setForm] = useState({ full_name: '', username: '', phone: '', email: '' });
  const [msg, setMsg] = useState('');
  const [loginsFor, setLoginsFor] = useState<{ user: Profile; events: LoginEvent[]; total: number } | null>(null);
  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.users(q, page, limit);
      setUsers(res.users ?? []);
      setTotal(res.total ?? 0);
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  }, [q, page]);

  useEffect(() => { load(); }, [load]);

  const startEdit = (u: Profile) => {
    setEditing(u);
    setForm({ full_name: u.full_name ?? '', username: u.username ?? '', phone: u.phone ?? '', email: u.email ?? '' });
    setMsg('');
  };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      await adminApi.updateUser(editing.id, form);
      setMsg('Saved.');
      setEditing(null);
      load();
    } catch (err: any) {
      setMsg(err.message);
    }
  };

  const exportCsv = async () => {
    try {
      const res = await fetch(adminApi.exportUrl().split('?')[0], {
        headers: { Authorization: `Bearer ${getAdminToken() ?? ''}` },
      });
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'grind-users.csv';
      a.click();
      URL.revokeObjectURL(a.href);
    } catch { /* ignore */ }
  };

  const openLogins = async (u: Profile) => {
    try {
      const res = await adminApi.userLogins(u.id);
      setLoginsFor({ user: u, events: res.events ?? [], total: res.total ?? 0 });
    } catch (err: any) {
      setMsg(err.message);
    }
  };

  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 flex items-center gap-2 bg-[#020d1f] border border-white/10 rounded-lg px-3">
          <Search size={14} className="text-white/40" />
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Search name, email, username…"
            className="flex-1 bg-transparent py-2.5 text-sm text-white outline-none"
          />
        </div>
        <button onClick={exportCsv} className="flex items-center gap-1.5 bg-[#1E56CC] hover:bg-[#1848B0] text-white text-xs font-bold px-4 py-2.5 rounded-lg">
          <Download size={14} /> CSV
        </button>
        <button onClick={load} className="p-2.5 bg-[#020d1f] border border-white/10 rounded-lg text-white/60 hover:text-white">
          <RefreshCw size={14} />
        </button>
      </div>
      {msg && <p className="text-xs text-yellow-400 mb-3">{msg}</p>}
      {loginsFor && (
        <div className="mb-4 bg-[#020d1f] border border-white/10 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white text-sm font-bold flex items-center gap-2">
              <History size={14} /> Login history — {loginsFor.user.full_name || loginsFor.user.username}
              <span className="text-white/40 font-normal">({loginsFor.total} total)</span>
            </h4>
            <button onClick={() => setLoginsFor(null)} className="text-white/40 hover:text-white text-xs">Close</button>
          </div>
          <div className="max-h-60 overflow-y-auto space-y-1.5">
            {loginsFor.events.map((e) => (
              <div key={e.id} className="text-xs text-white/60 flex justify-between gap-4">
                <span className="truncate">{e.email || '—'}</span>
                <span className="text-white/30 shrink-0">{fmt(e.created_at)}</span>
              </div>
            ))}
            {loginsFor.events.length === 0 && <p className="text-xs text-white/30">No login events recorded.</p>}
          </div>
        </div>
      )}

      <div className="overflow-x-auto border border-white/10 rounded-lg">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#020d1f] text-white/40 uppercase tracking-wider">
            <tr>
              {['Name', 'Username', 'Email', 'Phone', 'Score', 'Joined', ''].map((h) => (
                <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                <td className="px-3 py-2.5 text-white">{u.full_name || '—'}</td>
                <td className="px-3 py-2.5 text-white/60">{u.username || '—'}</td>
                <td className="px-3 py-2.5 text-white/60">{u.email || '—'}</td>
                <td className="px-3 py-2.5 text-white/60">{u.phone || '—'}</td>
                <td className="px-3 py-2.5 text-white/60">{u.grind_score ?? 0}</td>
                <td className="px-3 py-2.5 text-white/40">{fmt(u.created_at)}</td>
                <td className="px-3 py-2.5 text-right whitespace-nowrap">
                  <button onClick={() => startEdit(u)} className="text-[#4d8bff] hover:underline mr-3">Edit</button>
                  <button onClick={() => openLogins(u)} className="text-white/50 hover:text-white">Logins</button>
                </td>
              </tr>
            ))}
            {!loading && users.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-white/30">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-3 text-xs text-white/50">
        <span>{total} users · page {page} / {pages}</span>
        <div className="flex gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="p-1.5 border border-white/10 rounded disabled:opacity-30"><ChevronLeft size={14} /></button>
          <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages} className="p-1.5 border border-white/10 rounded disabled:opacity-30"><ChevronRight size={14} /></button>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setEditing(null)}>
          <div className="bg-[#0A1628] border border-white/10 rounded-xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-white font-bold text-sm mb-4">Edit user</h3>
            {(['full_name', 'username', 'phone', 'email'] as const).map((k) => (
              <div key={k} className="mb-3">
                <label className="block text-white/40 text-[10px] uppercase tracking-wider mb-1">{k.replace('_', ' ')}</label>
                <input
                  value={form[k]}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  className="w-full bg-[#020d1f] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#1E56CC]"
                />
              </div>
            ))}
            <div className="flex gap-2 mt-4">
              <button onClick={saveEdit} className="flex-1 bg-[#1E56CC] hover:bg-[#1848B0] text-white font-bold py-2.5 rounded-lg text-xs">Save</button>
              <button onClick={() => setEditing(null)} className="flex-1 border border-white/10 text-white/60 py-2.5 rounded-lg text-xs">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// ── Support Inbox tab (reads the ONE shared store the widget writes to) ───────
function SupportTab() {
  const [threads, setThreads] = useState<SupportThread[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [reply, setReply] = useState('');
  const [error, setError] = useState('');
  const [storeLabel, setStoreLabel] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');
  const openIdRef = useRef<string | null>(null);

  useEffect(() => { openIdRef.current = openId; }, [openId]);

  const loadThreads = useCallback(async () => {
    try {
      const res = await supportApi.fetchThreads();
      setThreads(res.threads ?? []);
      setStoreLabel(res.store ?? '');
      setUpdatedAt(new Date().toLocaleTimeString('en-NG'));
      setError('');
    } catch (err: any) {
      setError(`Shared store unreachable — ${err.message}`);
    }
  }, []);

  const loadThread = useCallback(async (userId: string) => {
    try {
      const res = await supportApi.fetchMessages(userId);
      setMessages(res.messages ?? []);
      // Opening the thread is the admin reading it → flip the user's ticks.
      await supportApi.markRead(userId, 'support').catch(() => {});
      setError('');
    } catch (err: any) {
      setError(`Could not load thread — ${err.message}`);
    }
  }, []);

  // Realtime: the admin stream receives every conversation, so threads and the
  // open thread update instantly. No 5s polling loop.
  useEffect(() => {
    const cleanup = supportApi.subscribeRealtime({
      isAdmin: true,
      onEvent: (event) => {
        if (event.type === 'message') {
          loadThreads();
          if (openIdRef.current && event.data?.user_id === openIdRef.current) {
            loadThread(openIdRef.current);
          }
        }
      },
    });
    return cleanup;
  }, [loadThreads, loadThread]);

  useEffect(() => {
    loadThreads();
    // Safety fallback only — the SSE stream above is the real transport.
    const iv = setInterval(loadThreads, 20000);
    return () => clearInterval(iv);
  }, [loadThreads]);

  useEffect(() => {
    if (openId) loadThread(openId);
  }, [openId, loadThread]);

  const sendReply = async () => {
    if (!openId || !reply.trim()) return;
    try {
      await supportApi.sendMessage({ userId: openId, sender: 'support', body: reply.trim() });
      setReply('');
      await loadThread(openId);
      loadThreads();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex gap-4">
      {/* Thread list */}
      <div className={`w-full ${openId ? 'hidden md:block md:w-72' : ''} space-y-1.5`}>
        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-white/40 mb-1">
          <span>{storeLabel ? `Store: ${storeLabel}` : 'Store: …'}</span>
          <span>updated {updatedAt || '—'}</span>
        </div>
        {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
        {threads.length === 0 && !error && (
          <p className="text-xs text-white/30 p-3">No support threads yet.</p>
        )}
        {threads.map((t) => (
          <div
            key={t.userId}
            className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer ${openId === t.userId ? 'bg-[#1E56CC]/20 border-[#1E56CC]' : 'bg-[#020d1f] border-white/10 hover:border-white/20'}`}
            onClick={() => setOpenId(t.userId)}
          >
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-bold truncate">
                {t.userName || t.userEmail || t.userId.slice(0, 12)}
              </div>
              <div className="text-white/40 text-[11px] truncate">
                {t.lastSender === 'support' ? 'You: ' : ''}{t.lastMessage}
              </div>
            </div>
            {t.unreadCount > 0 && (
              <span className="shrink-0 bg-red-500 text-white text-[10px] font-black min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
                {t.unreadCount}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Open thread */}
      {openId && (
        <div className="flex-1 flex flex-col bg-[#020d1f] border border-white/10 rounded-lg overflow-hidden" style={{ minHeight: 420 }}>
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <h4 className="text-white text-sm font-bold truncate">
              {(() => {
                const t = threads.find((x) => x.userId === openId);
                return t?.userName || t?.userEmail || 'Thread';
              })()}
            </h4>
            <button onClick={() => setOpenId(null)} className="text-white/40 hover:text-white text-xs md:hidden">Back</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender === 'support' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-xl px-3 py-2 text-xs ${m.sender === 'support' ? 'bg-[#1E56CC] text-white' : 'bg-white/10 text-white/90'}`}>
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <p className="text-[10px] opacity-50 mt-1">{fmt(m.created_at)}</p>
                </div>
              </div>
            ))}
            {messages.length === 0 && <p className="text-xs text-white/30 text-center mt-8">No messages.</p>}
          </div>
          <div className="p-3 border-t border-white/10 flex gap-2">
            <input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendReply()}
              placeholder="Reply as support…"
              className="flex-1 bg-[#0A1628] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#1E56CC]"
            />
            <button onClick={sendReply} disabled={!reply.trim()} className="w-9 h-9 rounded-lg bg-[#1E56CC] hover:bg-[#1848B0] disabled:opacity-40 flex items-center justify-center">
              <Send size={14} className="text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
// ── Audit tab ────────────────────────────────────────────────────────────────
function AuditTab() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);

  useEffect(() => {
    const load = () => adminApi.audit(50).then((r) => setEntries(r.entries ?? [])).catch(() => {});
    load();
    const iv = setInterval(load, 15000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="space-y-1.5">
      {entries.length === 0 && <p className="text-xs text-white/30 p-3">No audit entries yet.</p>}
      {entries.map((e) => (
        <div key={e.id} className="bg-[#020d1f] border border-white/10 rounded-lg p-3 text-xs">
          <div className="flex justify-between text-white/70">
            <span><span className="text-[#4d8bff] font-bold">{e.actor}</span> · {e.action}{e.target ? ` · ${e.target.slice(0, 12)}…` : ''}</span>
            <span className="text-white/30">{fmt(e.created_at)}</span>
          </div>
          {(e.old_values || e.new_values) && (
            <div className="mt-1.5 text-white/40 font-mono text-[10px] truncate">
              {e.old_values ? `- ${JSON.stringify(e.old_values)}` : ''}
              {e.new_values ? ` → + ${JSON.stringify(e.new_values)}` : ''}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Logins tab (who signed up / logged in — straight from the shared store) ───
function LoginsTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [storeLabel, setStoreLabel] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');
  const [openEmail, setOpenEmail] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await supportApi.fetchAdminUsers();
      setUsers(res.users ?? []);
      setStoreLabel(res.store ?? '');
      setUpdatedAt(new Date().toLocaleTimeString('en-NG'));
      setError('');
    } catch (err: any) {
      setError(`Shared store unreachable — ${err.message}`);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    // Live: every signup/login is broadcast from the server as it happens.
    const cleanup = supportApi.subscribeRealtime({
      isAdmin: true,
      onEvent: (event) => { if (event.type === 'login') load(); },
    });
    // Safety fallback only — the SSE stream above is the real transport.
    const iv = setInterval(load, 20000);
    return () => { cleanup(); clearInterval(iv); };
  }, [load]);

  const filtered = users.filter((u) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (u.email || '').toLowerCase().includes(q) || (u.name || '').toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 flex items-center gap-2 bg-[#020d1f] border border-white/10 rounded-lg px-3">
          <Search size={14} className="text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search email or name…"
            className="flex-1 bg-transparent py-2.5 text-sm text-white outline-none"
          />
        </div>
        <button onClick={load} className="p-2.5 bg-[#020d1f] border border-white/10 rounded-lg text-white/60 hover:text-white">
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-white/40 mb-2">
        <span>{storeLabel ? `Store: ${storeLabel}` : 'Store: …'}</span>
        <span>updated {updatedAt || '—'}</span>
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-3">{error}</p>
      )}

      {!error && users.length === 0 && (
        <p className="text-xs text-white/30 p-3">No signups or logins recorded yet.</p>
      )}

      <div className="space-y-1.5">
        {filtered.map((u) => {
          const open = openEmail === u.email;
          return (
            <div key={u.email} className="bg-[#020d1f] border border-white/10 rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenEmail(open ? null : u.email)}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/[0.02]"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-white text-xs font-bold truncate">{u.name || u.email}</div>
                  <div className="text-white/40 text-[11px] truncate">{u.email}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[#4d8bff] text-xs font-black">
                    {u.login_count} login{u.login_count === 1 ? '' : 's'}
                  </div>
                  <div className="text-white/30 text-[10px]">last {fmt(u.last_login_at)}</div>
                </div>
                <History size={14} className="text-white/30 shrink-0" />
              </button>
              {open && (
                <div className="border-t border-white/10 p-3 space-y-1 max-h-64 overflow-y-auto">
                  <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">
                    Full history · signed up {fmt(u.created_at)}
                  </p>
                  {u.logins.length === 0 && <p className="text-xs text-white/30">No login rows.</p>}
                  {u.logins.map((l) => (
                    <div key={l.id} className="flex justify-between text-[11px] text-white/60">
                      <span>{fmt(l.created_at)}</span>
                      <span className="text-white/40">{l.method || 'email'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main console shell ───────────────────────────────────────────────────────
export default function AdminConsole() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(!!getAdminToken());
  const [tab, setTab] = useState<'logins' | 'support' | 'users' | 'audit'>('logins');

  const logout = () => {
    setAdminToken(null);
    setAuthed(false);
    navigate('/');
  };

  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />;

  return (
    <div className="min-h-screen bg-[#020d1f] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-white font-black text-lg tracking-tight">Console</h1>
          <div className="flex items-center gap-2">
            {(['logins', 'support', 'users', 'audit'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-colors ${tab === t ? 'bg-[#1E56CC] text-white' : 'bg-white/5 text-white/50 hover:text-white'}`}
              >
                {t === 'support' ? 'Support Inbox' : t === 'audit' ? 'Audit Log' : t === 'logins' ? 'Logins' : 'Users'}
              </button>
            ))}
            <button onClick={logout} className="p-2 rounded-lg bg-white/5 text-white/50 hover:text-white" aria-label="Log out">
              <LogOut size={14} />
            </button>
          </div>
        </div>
        {tab === 'logins' && <LoginsTab />}
        {tab === 'users' && <UsersTab />}
        {tab === 'support' && <SupportTab />}
        {tab === 'audit' && <AuditTab />}
      </div>
    </div>
  );
}