export interface SupportMessage {
  id: string;
  user_id: string;
  sender: 'user' | 'support';
  body: string;
  read: boolean;
  created_at: string;
  user_name?: string | null;
  user_email?: string | null;
}

export interface SupportThread {
  userId: string;
  userName: string | null;
  userEmail: string | null;
  lastMessage: string;
  lastMessageAt: string;
  lastSender: string;
  unreadCount: number;
}

export interface LoginEvent {
  id: string;
  email: string;
  name: string | null;
  method: string | null;
  created_at: string;
}

export interface AdminUser {
  email: string;
  name: string | null;
  created_at: string;
  last_login_at: string;
  login_count: number;
  logins: LoginEvent[];
}

const API_BASE = '/api/support';

export function getOrInitSupportUser(): {
  userId: string;
  name: string;
  email?: string;
  isGuest: boolean;
} {
  try {
    const raw = localStorage.getItem('grind_user');
    if (raw) {
      const u = JSON.parse(raw);
      if (u && (u.id || u.email)) {
        return {
          userId: String(u.id || u.email),
          name: u.name || u.full_name || 'Grind User',
          email: u.email,
          isGuest: false,
        };
      }
    }
  } catch {
    /* fallback to guest */
  }

  let guestId = localStorage.getItem('grind_guest_support_id');
  if (!guestId) {
    guestId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    localStorage.setItem('grind_guest_support_id', guestId);
  }

  const customGuestName = localStorage.getItem('grind_guest_name') || 'Guest Visitor';
  return {
    userId: guestId,
    name: customGuestName,
    isGuest: true,
  };
}

export const supportApi = {
  async fetchMessages(userId: string): Promise<{ messages: SupportMessage[]; store: string }> {
    const res = await fetch(`${API_BASE}/messages?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  async sendMessage(params: {
    userId: string;
    sender: 'user' | 'support';
    body: string;
    userName?: string | null;
    userEmail?: string | null;
  }): Promise<{ success: boolean; message: SupportMessage }> {
    const res = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  async markRead(userId: string, readBy: 'user' | 'support'): Promise<{ success: boolean; updated: number }> {
    const res = await fetch(`${API_BASE}/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, readBy }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  async sendTyping(userId: string, sender: 'user' | 'support', isTyping: boolean) {
    try {
      await fetch(`${API_BASE}/typing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, sender, isTyping }),
      });
    } catch {
      /* ignore */
    }
  },

  async fetchThreads(): Promise<{ threads: SupportThread[]; store: string }> {
    const res = await fetch(`${API_BASE}/admin/threads`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  async fetchAdminUsers(): Promise<{ users: AdminUser[]; store: string; timestamp: string }> {
    const res = await fetch(`${API_BASE}/admin/users`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  async logLogin(email: string, name?: string | null, method?: string | null) {
    try {
      await fetch(`${API_BASE}/log-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, method }),
      });
    } catch {
      /* ignore */
    }
  },

  async getStatus(): Promise<{ status: string; store: string; activeClients: number }> {
    const res = await fetch(`${API_BASE}/status`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  /**
   * Realtime SSE connection with exponential backoff and tab visibility reconnect
   */
  subscribeRealtime(params: {
    userId?: string;
    isAdmin?: boolean;
    onEvent: (event: { type: string; data: any }) => void;
    onStatusChange?: (status: 'connected' | 'reconnecting') => void;
  }): () => void {
    let es: EventSource | null = null;
    let retryDelay = 3000;
    let closed = false;
    let reconnectTimeout: any = null;

    const connect = () => {
      if (closed) return;
      const url = `${API_BASE}/stream?userId=${encodeURIComponent(params.userId || '')}&isAdmin=${params.isAdmin ? 'true' : 'false'}`;
      es = new EventSource(url);

      es.onopen = () => {
        retryDelay = 3000;
        params.onStatusChange?.('connected');
      };

      es.onmessage = (e) => {
        try {
          const parsed = JSON.parse(e.data);
          params.onEvent(parsed);
        } catch (err) {
          console.error('[SSE Parse error]', err);
        }
      };

      es.onerror = () => {
        params.onStatusChange?.('reconnecting');
        if (es) {
          es.close();
          es = null;
        }
        if (!closed) {
          clearTimeout(reconnectTimeout);
          reconnectTimeout = setTimeout(connect, retryDelay);
          retryDelay = Math.min(30000, retryDelay * 1.5);
        }
      };
    };

    connect();

    const onVisible = () => {
      if (document.visibilityState === 'visible' && !closed) {
        if (!es || es.readyState === EventSource.CLOSED) {
          connect();
        }
      }
    };

    const onOnline = () => {
      if (!closed) connect();
    };

    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('online', onOnline);

    return () => {
      closed = true;
      clearTimeout(reconnectTimeout);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('online', onOnline);
      if (es) {
        es.close();
        es = null;
      }
    };
  },
};
