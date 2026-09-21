/**
 * Hidden admin system router — mounted at /api/xk9-admin-console-7f3a
 *
 * Sections:
 *   1. Admin auth (login, rate-limited 5/15min, HMAC token)
 *   2. Users (list/search/paginate, edit, CSV export)
 *   3. Login history
 *   4. Support chat (admin side + user side with Supabase token auth)
 *   5. Audit log
 */
import { Router, Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { supabase, supabaseAdmin } from '../lib/supabase';
import { signAdminToken } from '../lib/adminToken';
import { adminMiddleware, sanitize } from '../middleware/adminAuth';
import { createValidator } from '../middleware/validation';

const router = Router();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'grind_admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'GrindXk9!2026';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const audit = async (
  actor: string,
  action: string,
  target: string | null,
  oldValues: unknown,
  newValues: unknown
) => {
  await supabase.from('admin_audit_log').insert({
    actor,
    action,
    target,
    old_values: oldValues ?? null,
    new_values: newValues ?? null,
  });
};

/** Resolve the admin DB client — service role if configured, otherwise anon. */
const db = () => supabaseAdmin ?? supabase;

// ── 1. Admin auth ────────────────────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const xf = (req.headers['x-forwarded-for'] as string) || '';
    if (xf) return xf.split(',')[0].trim();
    return String(req.ip ?? '');
  },
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
});

const loginSchema = z.object({
  username: z.string().min(1).max(100),
  password: z.string().min(1).max(200),
});

router.post('/login', loginLimiter, createValidator(loginSchema), (req, res) => {
  const { username, password } = req.body as { username: string; password: string };
  if (username.trim() !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = signAdminToken(ADMIN_USERNAME);
  res.json({ token, expiresIn: 7200 });
});
// ── 2. Users ─────────────────────────────────────────────────────────────────
router.get('/users', adminMiddleware, async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const q = sanitize(req.query.q as string);
    const from = (page - 1) * limit;

    let query = db()
      .from('profiles')
      .select(
        'id, full_name, username, phone, email, role, grind_score, verified_badge, created_at',
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    if (q) {
      query = query.or(
        [`full_name.ilike.%${q}%`, `username.ilike.%${q}%`, `email.ilike.%${q}%`].join(',')
      );
    }

    const { data, error, count } = await query;
    if (error) throw error;

    // If a service role key is configured, enrich with auth emails where missing
    const users: any[] = data ?? [];
    if (supabaseAdmin && users.some((u) => !u.email)) {
      for (const u of users.filter((x) => !x.email)) {
        const { data: authUser } = await supabaseAdmin!.auth.admin.getUserById(u.id);
        if (authUser?.user?.email) u.email = authUser.user.email;
      }
    }

    res.json({ users, total: count ?? users.length, page, limit });
  } catch (err: any) {
    console.error('[admin/users]', err.message);
    res.status(500).json({ error: 'Failed to load users' });
  }
});

const patchSchema = z.object({
  full_name: z.string().min(1).max(120).optional(),
  username: z.string().min(1).max(60).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().max(200).optional(),
});

router.patch('/users/:id', adminMiddleware, createValidator(patchSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const updates: Record<string, string> = {};
    for (const key of ['full_name', 'username', 'phone', 'email'] as const) {
      if (req.body[key] !== undefined) updates[key] = sanitize(req.body[key]);
    }

    if (updates.full_name === '' || updates.username === '') {
      return res.status(400).json({ error: 'full_name and username cannot be blank' });
    }
    if (updates.email !== undefined && !EMAIL_RE.test(updates.email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const { data: existing, error: fetchErr } = await db()
      .from('profiles')
      .select('full_name, username, phone, email')
      .eq('id', id)
      .single();
    if (fetchErr || !existing) return res.status(404).json({ error: 'User not found' });

    // Duplicate email/username check (excluding this user)
    const conflictChecks: Promise<any>[] = [];
    if (updates.username && updates.username !== (existing as any).username) {
      conflictChecks.push(
        Promise.resolve(
          db().from('profiles').select('id').eq('username', updates.username).neq('id', id).maybeSingle()
        )
      );
    }
    if (updates.email && updates.email !== (existing as any).email) {
      conflictChecks.push(
        Promise.resolve(
          db().from('profiles').select('id').eq('email', updates.email).neq('id', id).maybeSingle()
        )
      );
    }
    const conflicts = await Promise.all(conflictChecks);
    if (conflicts.some((c) => c.data)) {
      return res.status(409).json({ error: 'Email or username already in use' });
    }

    const { data, error } = await db().from('profiles').update(updates).eq('id', id).select().single();
    if (error) throw error;

    await audit((req as any).admin.sub, 'update_user', id, existing, updates);
    res.json({ user: data });
  } catch (err: any) {
    console.error('[admin/users/:id]', err.message);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.get('/users/export', adminMiddleware, async (_req, res) => {
  try {
    const { data, error } = await db()
      .from('profiles')
      .select('id, full_name, username, phone, email, role, grind_score, verified_badge, created_at')
      .order('created_at', { ascending: false })
      .limit(10000);
    if (error) throw error;

    const esc = (v: any) => {
      const s = v === null || v === undefined ? '' : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const header = 'id,full_name,username,phone,email,role,grind_score,verified_badge,created_at';
    const rows = (data ?? []).map((u: any) =>
      [u.id, u.full_name, u.username, u.phone, u.email, u.role, u.grind_score, u.verified_badge, u.created_at]
        .map(esc)
        .join(',')
    );
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="grind-users.csv"');
    res.send([header, ...rows].join('\n'));
  } catch (err: any) {
    console.error('[admin/users/export]', err.message);
    res.status(500).json({ error: 'Failed to export users' });
  }
});
// ── 3. Login history ─────────────────────────────────────────────────────────
router.get('/users/:id/logins', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const from = (page - 1) * limit;

    const { data, error, count } = await db()
      .from('login_events')
      .select('*', { count: 'exact' })
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);
    if (error) throw error;
    res.json({ events: data ?? [], total: count ?? 0, page, limit });
  } catch (err: any) {
    console.error('[admin/users/:id/logins]', err.message);
    res.status(500).json({ error: 'Failed to load login history' });
  }
});

// ── 4a. User-facing chat (Supabase token auth) ───────────────────────────────
interface UserReq extends Request {
  userId?: string;
  userEmail?: string;
}

const userAuth = async (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return res.status(401).json({ error: 'Unauthorized' });
  (req as UserReq).userId = data.user.id;
  (req as UserReq).userEmail = data.user.email;
  next();
};

const chatSendLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many messages. Slow down.' },
});

// POST .../log-login — called by the web Login flow after successful login
router.post('/log-login', chatSendLimiter, async (req, res) => {
  try {
    const email = sanitize((req.body as any)?.email).toLowerCase();
    let userId: string | null = null;
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : undefined;
    if (token) {
      const { data } = await supabase.auth.getUser(token);
      if (data?.user) userId = data.user.id;
    }
    if (email || userId) {
      await supabase.from('login_events').insert({
        user_id: userId,
        email: email || null,
        user_agent: String(req.headers['user-agent'] || '').slice(0, 400),
      });
    }
    res.json({ ok: true }); // never block login on telemetry failure
  } catch (err: any) {
    console.error('[admin/log-login]', err.message);
    res.json({ ok: true });
  }
});

router.get('/chat-messages', userAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as UserReq).userId!;
    const since = req.query.since as string | undefined;
    let query = db()
      .from('support_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(500);
    if (since) query = query.gt('created_at', since);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ messages: data ?? [] });
  } catch (err: any) {
    console.error('[admin/chat-messages GET]', err.message);
    res.status(500).json({ error: 'Failed to load messages' });
  }
});

const messageSchema = z.object({ body: z.string().min(1).max(2000) });

router.post(
  '/chat-messages',
  chatSendLimiter,
  userAuth,
  createValidator(messageSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as UserReq).userId!;
      const body = sanitize((req.body as any).body);
      if (!body) return res.status(400).json({ error: 'Message cannot be empty' });
      const { data, error } = await db()
        .from('support_messages')
        .insert({ user_id: userId, sender: 'user', body })
        .select()
        .single();
      if (error) throw error;
      res.status(201).json({ message: data });
    } catch (err: any) {
      console.error('[admin/chat-messages POST]', err.message);
      res.status(500).json({ error: 'Failed to send message' });
    }
  }
);
// ── 4b. Support chat (admin side) ────────────────────────────────────────────
router.get('/threads', adminMiddleware, async (_req, res) => {
  try {
    // Distinct threads with last message preview
    const { data, error } = await db()
      .from('support_messages')
      .select('user_id, sender, body, created_at')
      .order('created_at', { ascending: false })
      .limit(2000);
    if (error) throw error;

    const seen = new Set<string>();
    const threads: any[] = [];
    for (const m of data ?? []) {
      if (seen.has(m.user_id)) continue;
      seen.add(m.user_id);
      threads.push(m);
    }

    // Enrich with profile names
    if (threads.length) {
      const ids = threads.map((t) => t.user_id);
      const { data: profiles } = await db()
        .from('profiles')
        .select('id, full_name, username, email')
        .in('id', ids);
      const map = new Map((profiles ?? []).map((p: any) => [p.id, p]));
      for (const t of threads) {
        const p = map.get(t.user_id);
        t.full_name = p?.full_name ?? null;
        t.username = p?.username ?? null;
        t.email = p?.email ?? null;
      }
    }
    res.json({ threads });
  } catch (err: any) {
    console.error('[admin/threads]', err.message);
    res.status(500).json({ error: 'Failed to load threads' });
  }
});

router.get('/threads/:userId', adminMiddleware, async (req, res) => {
  try {
    const { data, error } = await db()
      .from('support_messages')
      .select('*')
      .eq('user_id', req.params.userId)
      .order('created_at', { ascending: true })
      .limit(1000);
    if (error) throw error;
    res.json({ messages: data ?? [] });
  } catch (err: any) {
    console.error('[admin/threads/:userId]', err.message);
    res.status(500).json({ error: 'Failed to load thread' });
  }
});

const replySchema = z.object({ body: z.string().min(1).max(2000) });

router.post(
  '/threads/:userId/reply',
  adminMiddleware,
  createValidator(replySchema),
  async (req, res) => {
    try {
      const body = sanitize((req.body as any).body);
      if (!body) return res.status(400).json({ error: 'Reply cannot be empty' });
      const { data, error } = await db()
        .from('support_messages')
        .insert({ user_id: req.params.userId, sender: 'support', body })
        .select()
        .single();
      if (error) throw error;
      await audit((req as any).admin.sub, 'support_reply', req.params.userId, null, { body });
      res.status(201).json({ message: data });
    } catch (err: any) {
      console.error('[admin/threads/:userId/reply]', err.message);
      res.status(500).json({ error: 'Failed to send reply' });
    }
  }
);

router.delete('/threads/:userId', adminMiddleware, async (req, res) => {
  try {
    const { data, error } = await db()
      .from('support_messages')
      .delete()
      .eq('user_id', req.params.userId)
      .select('id');
    if (error) throw error;
    await audit(
      (req as any).admin.sub,
      'delete_thread',
      req.params.userId,
      { deleted: data?.length ?? 0 },
      null
    );
    res.json({ ok: true, deleted: data?.length ?? 0 });
  } catch (err: any) {
    console.error('[admin/threads/:userId DELETE]', err.message);
    res.status(500).json({ error: 'Failed to delete thread' });
  }
});

// ── 5. Audit log ─────────────────────────────────────────────────────────────
router.get('/audit', adminMiddleware, async (req, res) => {
  try {
    const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 50));
    const { data, error } = await db()
      .from('admin_audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    res.json({ entries: data ?? [] });
  } catch (err: any) {
    console.error('[admin/audit]', err.message);
    res.status(500).json({ error: 'Failed to load audit log' });
  }
});

export default router;