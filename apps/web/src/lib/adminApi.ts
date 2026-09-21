/**
 * Admin + support-chat API helper.
 * - 45s timeout on every call (AbortController)
 * - Admin token stored in sessionStorage
 * - Base URL from VITE_API_BASE_URL (falls back to same-origin /api)
 */

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '';
export const ADMIN_PREFIX = '/api/xk9-admin-console-7f3a';

const TOKEN_KEY = 'grind_admin_token';

export function getAdminToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string | null) {
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.removeItem(TOKEN_KEY);
}

export function getSupabaseAccessToken(): string | null {
  try {
    // Supabase JS v2 localStorage session
    const raw = localStorage.getItem(
      Object.keys(localStorage).find((k) => k.startsWith('sb-') && k.endsWith('-auth-token')) || ''
    );
    if (raw) return JSON.parse(raw)?.access_token ?? null;
  } catch {
    /* ignore */
  }
  return null;
}

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token, ...init } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45_000); // 45s timeout
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init.headers || {}),
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data as any).error || `HTTP ${res.status}`);
    return data as T;
  } finally {
    clearTimeout(timer);
  }
}

export const adminApi = {
  login: (username: string, password: string) =>
    apiFetch(`${ADMIN_PREFIX}/login`, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  users: (q: string, page: number, limit = 20) =>
    apiFetch(
      `${ADMIN_PREFIX}/users?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`,
      { token: getAdminToken() }
    ),
  updateUser: (id: string, patch: Record<string, string>) =>
    apiFetch(`${ADMIN_PREFIX}/users/${id}`, {
      method: 'PATCH',
      token: getAdminToken(),
      body: JSON.stringify(patch),
    }),
  exportUrl: () => `${API_BASE}${ADMIN_PREFIX}/users/export?token=${getAdminToken() ?? ''}`,
  userLogins: (id: string, page = 1, limit = 20) =>
    apiFetch(`${ADMIN_PREFIX}/users/${id}/logins?page=${page}&limit=${limit}`, {
      token: getAdminToken(),
    }),
  threads: () => apiFetch(`${ADMIN_PREFIX}/threads`, { token: getAdminToken() }),
  thread: (userId: string) =>
    apiFetch(`${ADMIN_PREFIX}/threads/${userId}`, { token: getAdminToken() }),
  reply: (userId: string, body: string) =>
    apiFetch(`${ADMIN_PREFIX}/threads/${userId}/reply`, {
      method: 'POST',
      token: getAdminToken(),
      body: JSON.stringify({ body }),
    }),
  deleteThread: (userId: string) =>
    apiFetch(`${ADMIN_PREFIX}/threads/${userId}`, {
      method: 'DELETE',
      token: getAdminToken(),
    }),
  audit: (limit = 50) =>
    apiFetch(`${ADMIN_PREFIX}/audit?limit=${limit}`, { token: getAdminToken() }),
};

export const chatApi = {
  fetchMessages: (since?: string) => {
    const token = getSupabaseAccessToken();
    const qs = since ? `?since=${encodeURIComponent(since)}` : '';
    return apiFetch(`${ADMIN_PREFIX}/chat-messages${qs}`, { token });
  },
  send: (body: string) => {
    const token = getSupabaseAccessToken();
    return apiFetch(`${ADMIN_PREFIX}/chat-messages`, {
      method: 'POST',
      token,
      body: JSON.stringify({ body }),
    });
  },
  logLogin: (email: string) => {
    const token = getSupabaseAccessToken();
    return apiFetch(`${ADMIN_PREFIX}/log-login`, {
      method: 'POST',
      token,
      body: JSON.stringify({ email }),
    }).catch(() => {});
  },
};

/** Wake ping fired on App mount to warm the server. */
export function wakePing() {
  apiFetch('/api/health').catch(() => {});
}