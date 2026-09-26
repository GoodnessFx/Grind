import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

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

export interface UserRecord {
  email: string;
  name: string | null;
  created_at: string;
  last_login_at: string;
  login_count: number;
}

export interface LoginEvent {
  id: string;
  email: string;
  name: string | null;
  method: string | null;
  created_at: string;
}

interface FileStoreData {
  messages: SupportMessage[];
  users: Record<string, UserRecord>;
  logins: LoginEvent[];
}

let pool: Pool | null = null;
let activeStore: 'Postgres' | 'file' = 'file';

const dataDir = path.resolve(process.cwd(), 'apps/server/data');
const dataFilePath = path.join(dataDir, 'store.json');

function readFileStore(): FileStoreData {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(dataFilePath)) {
      const initial: FileStoreData = { messages: [], users: {}, logins: [] };
      fs.writeFileSync(dataFilePath, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    const raw = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[Store File] Read error:', err);
    return { messages: [], users: {}, logins: [] };
  }
}

function writeFileStore(data: FileStoreData) {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[Store File] Write error:', err);
  }
}

export async function initStore(): Promise<string> {
  const dbUrl = process.env.DATABASE_URL;

  if (dbUrl) {
    try {
      const isLocal = /localhost|127\.0\.0\.1/.test(dbUrl);
      pool = new Pool({
        connectionString: dbUrl,
        ssl: isLocal ? false : { rejectUnauthorized: false },
        max: 5,
        connectionTimeoutMillis: 7000,
      });

      // Verify connection and create tables
      const client = await pool.connect();
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS support_messages (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            sender TEXT NOT NULL,
            body TEXT NOT NULL,
            read BOOLEAN DEFAULT false,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            user_name TEXT,
            user_email TEXT
          );
          CREATE TABLE IF NOT EXISTS users (
            email TEXT PRIMARY KEY,
            name TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            last_login_at TIMESTAMPTZ DEFAULT NOW(),
            login_count INT DEFAULT 1
          );
          CREATE TABLE IF NOT EXISTS logins (
            id TEXT PRIMARY KEY,
            email TEXT,
            name TEXT,
            method TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `);
        activeStore = 'Postgres';
        console.log('store: Postgres (shared across devices/deploys)');
        return 'store: Postgres (shared across devices/deploys)';
      } finally {
        client.release();
      }
    } catch (err: any) {
      console.warn('[Store Postgres] Connection failed, falling back to file store:', err.message);
      pool = null;
      activeStore = 'file';
    }
  }

  // Ensure file store exists
  readFileStore();
  activeStore = 'file';
  console.log('store: file (dev only)');
  return 'store: file (dev only)';
}

export function getActiveStoreType() {
  return activeStore === 'Postgres'
    ? 'Postgres (shared across devices/deploys)'
    : 'file (dev only)';
}

export async function addMessage(params: {
  userId: string;
  sender: 'user' | 'support';
  body: string;
  userName?: string | null;
  userEmail?: string | null;
}): Promise<SupportMessage> {
  const id = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();

  if (activeStore === 'Postgres' && pool) {
    const res = await pool.query(
      `INSERT INTO support_messages (id, user_id, sender, body, read, created_at, user_name, user_email)
       VALUES ($1, $2, $3, $4, false, $5, $6, $7)
       RETURNING *`,
      [id, params.userId, params.sender, params.body, now, params.userName || null, params.userEmail || null]
    );
    const row = res.rows[0];
    return {
      id: row.id,
      user_id: row.user_id,
      sender: row.sender,
      body: row.body,
      read: row.read,
      created_at: new Date(row.created_at).toISOString(),
      user_name: row.user_name,
      user_email: row.user_email,
    };
  }

  // File fallback
  const store = readFileStore();
  const msg: SupportMessage = {
    id,
    user_id: params.userId,
    sender: params.sender,
    body: params.body,
    read: false,
    created_at: now,
    user_name: params.userName || null,
    user_email: params.userEmail || null,
  };
  store.messages.push(msg);
  writeFileStore(store);
  return msg;
}

export async function getMessages(userId: string): Promise<SupportMessage[]> {
  if (activeStore === 'Postgres' && pool) {
    const res = await pool.query(
      `SELECT * FROM support_messages WHERE user_id = $1 ORDER BY created_at ASC LIMIT 1000`,
      [userId]
    );
    return res.rows.map((r) => ({
      id: r.id,
      user_id: r.user_id,
      sender: r.sender,
      body: r.body,
      read: r.read,
      created_at: new Date(r.created_at).toISOString(),
      user_name: r.user_name,
      user_email: r.user_email,
    }));
  }

  const store = readFileStore();
  return store.messages
    .filter((m) => m.user_id === userId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

export async function markMessagesAsRead(userId: string, senderToMark: 'user' | 'support'): Promise<number> {
  if (activeStore === 'Postgres' && pool) {
    const res = await pool.query(
      `UPDATE support_messages
       SET read = true
       WHERE user_id = $1 AND sender = $2 AND read = false`,
      [userId, senderToMark]
    );
    return res.rowCount || 0;
  }

  const store = readFileStore();
  let updatedCount = 0;
  for (const m of store.messages) {
    if (m.user_id === userId && m.sender === senderToMark && !m.read) {
      m.read = true;
      updatedCount++;
    }
  }
  if (updatedCount > 0) {
    writeFileStore(store);
  }
  return updatedCount;
}

export async function getThreads(): Promise<Array<{
  userId: string;
  userName: string | null;
  userEmail: string | null;
  lastMessage: string;
  lastMessageAt: string;
  lastSender: string;
  unreadCount: number;
}>> {
  if (activeStore === 'Postgres' && pool) {
    const res = await pool.query(`
      SELECT DISTINCT ON (user_id)
        user_id,
        user_name,
        user_email,
        body as last_message,
        created_at as last_message_at,
        sender as last_sender,
        (SELECT COUNT(*)::int FROM support_messages sm2 WHERE sm2.user_id = sm.user_id AND sm2.sender = 'user' AND sm2.read = false) as unread_count
      FROM support_messages sm
      ORDER BY user_id, created_at DESC
    `);
    return res.rows.map((r) => ({
      userId: r.user_id,
      userName: r.user_name,
      userEmail: r.user_email,
      lastMessage: r.last_message,
      lastMessageAt: new Date(r.last_message_at).toISOString(),
      lastSender: r.last_sender,
      unreadCount: Number(r.unread_count || 0),
    }));
  }

  const store = readFileStore();
  const threadMap = new Map<string, any>();

  for (const m of store.messages) {
    const existing = threadMap.get(m.user_id);
    const unreadInc = m.sender === 'user' && !m.read ? 1 : 0;
    if (!existing) {
      threadMap.set(m.user_id, {
        userId: m.user_id,
        userName: m.user_name || null,
        userEmail: m.user_email || null,
        lastMessage: m.body,
        lastMessageAt: m.created_at,
        lastSender: m.sender,
        unreadCount: unreadInc,
      });
    } else {
      if (new Date(m.created_at) > new Date(existing.lastMessageAt)) {
        existing.lastMessage = m.body;
        existing.lastMessageAt = m.created_at;
        existing.lastSender = m.sender;
        if (m.user_name) existing.userName = m.user_name;
        if (m.user_email) existing.userEmail = m.user_email;
      }
      existing.unreadCount += unreadInc;
    }
  }

  return Array.from(threadMap.values()).sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );
}

export async function logUserLogin(email: string, name?: string | null, method?: string | null) {
  const normEmail = email.trim().toLowerCase();
  const now = new Date().toISOString();
  const loginId = `login_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  if (activeStore === 'Postgres' && pool) {
    await pool.query(
      `INSERT INTO users (email, name, created_at, last_login_at, login_count)
       VALUES ($1, $2, $3, $3, 1)
       ON CONFLICT (email) DO UPDATE
       SET last_login_at = EXCLUDED.last_login_at,
           name = COALESCE(EXCLUDED.name, users.name),
           login_count = users.login_count + 1`,
      [normEmail, name || null, now]
    );

    await pool.query(
      `INSERT INTO logins (id, email, name, method, created_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [loginId, normEmail, name || null, method || 'email', now]
    );
    return;
  }

  const store = readFileStore();
  if (!store.users[normEmail]) {
    store.users[normEmail] = {
      email: normEmail,
      name: name || null,
      created_at: now,
      last_login_at: now,
      login_count: 1,
    };
  } else {
    store.users[normEmail].last_login_at = now;
    store.users[normEmail].login_count += 1;
    if (name) store.users[normEmail].name = name;
  }

  store.logins.push({
    id: loginId,
    email: normEmail,
    name: name || null,
    method: method || 'email',
    created_at: now,
  });

  writeFileStore(store);
}

export async function getUsersWithLogins(): Promise<Array<UserRecord & { logins: LoginEvent[] }>> {
  if (activeStore === 'Postgres' && pool) {
    const usersRes = await pool.query(`SELECT * FROM users ORDER BY last_login_at DESC`);
    const loginsRes = await pool.query(`SELECT * FROM logins ORDER BY created_at DESC LIMIT 5000`);

    const loginsByEmail = new Map<string, LoginEvent[]>();
    for (const l of loginsRes.rows) {
      const email = l.email.toLowerCase();
      if (!loginsByEmail.has(email)) loginsByEmail.set(email, []);
      loginsByEmail.get(email)!.push({
        id: l.id,
        email: l.email,
        name: l.name,
        method: l.method,
        created_at: new Date(l.created_at).toISOString(),
      });
    }

    return usersRes.rows.map((u) => ({
      email: u.email,
      name: u.name,
      created_at: new Date(u.created_at).toISOString(),
      last_login_at: new Date(u.last_login_at).toISOString(),
      login_count: Number(u.login_count || 1),
      logins: loginsByEmail.get(u.email.toLowerCase()) || [],
    }));
  }

  const store = readFileStore();
  const loginsByEmail = new Map<string, LoginEvent[]>();
  for (const l of store.logins) {
    const email = l.email.toLowerCase();
    if (!loginsByEmail.has(email)) loginsByEmail.set(email, []);
    loginsByEmail.get(email)!.push(l);
  }

  return Object.values(store.users)
    .sort((a, b) => new Date(b.last_login_at).getTime() - new Date(a.last_login_at).getTime())
    .map((u) => ({
      ...u,
      logins: loginsByEmail.get(u.email.toLowerCase()) || [],
    }));
}
