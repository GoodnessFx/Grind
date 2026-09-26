import { Router, Request, Response } from 'express';
import { z } from 'zod';
import {
  addMessage,
  getMessages,
  markMessagesAsRead,
  getThreads,
  logUserLogin,
  getUsersWithLogins,
  getActiveStoreType,
  SupportMessage,
} from '../services/store';

const router = Router();

interface SseClient {
  id: string;
  res: Response;
  userId?: string;
  isAdmin: boolean;
}

const sseClients = new Set<SseClient>();

export function broadcast(payload: {
  type: 'message' | 'read' | 'typing' | 'login';
  data: any;
  targetUserId?: string;
}) {
  const json = JSON.stringify(payload);
  const eventString = `data: ${json}\n\n`;

  for (const client of sseClients) {
    try {
      if (client.isAdmin) {
        // Admin gets all events
        client.res.write(eventString);
      } else if (payload.targetUserId && client.userId === payload.targetUserId) {
        // Client scoped to this conversation
        client.res.write(eventString);
      }
    } catch (err) {
      console.error('[SSE] Broadcast error on client:', err);
    }
  }
}

// ── 1. SSE Stream ─────────────────────────────────────────────────────────────
router.get('/stream', (req: Request, res: Response) => {
  const userId = req.query.userId ? String(req.query.userId).trim() : undefined;
  const isAdmin = req.query.isAdmin === 'true';

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  // Retry interval
  res.write('retry: 3000\n\n');

  const clientId = `client_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const client: SseClient = { id: clientId, res, userId, isAdmin };
  sseClients.add(client);

  // Send initial connected frame
  res.write(`data: ${JSON.stringify({ type: 'connected', store: getActiveStoreType() })}\n\n`);

  // Heartbeat comment every 25 seconds
  const heartbeat = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch {
      clearInterval(heartbeat);
    }
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(client);
  });
});

// ── 2. Get Messages ───────────────────────────────────────────────────────────
router.get('/messages', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId ? String(req.query.userId).trim() : '';
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    const messages = await getMessages(userId);
    res.json({
      messages,
      store: getActiveStoreType(),
    });
  } catch (err: any) {
    console.error('[Support GET messages]', err);
    res.status(500).json({ error: 'Failed to retrieve messages' });
  }
});

// ── 3. Post Message ───────────────────────────────────────────────────────────
const postMessageSchema = z.object({
  userId: z.string().min(1),
  sender: z.enum(['user', 'support']),
  body: z.string().min(1).max(2000),
  userName: z.string().optional().nullable(),
  userEmail: z.string().optional().nullable(),
});

router.post('/messages', async (req: Request, res: Response) => {
  try {
    const parsed = postMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid payload', details: parsed.error.issues });
    }

    const { userId, sender, body, userName, userEmail } = parsed.data;
    const cleanBody = body.trim();
    if (!cleanBody) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const message: SupportMessage = await addMessage({
      userId,
      sender,
      body: cleanBody,
      userName,
      userEmail,
    });

    // Broadcast in real-time to both the client thread and admins
    broadcast({
      type: 'message',
      data: message,
      targetUserId: userId,
    });

    res.status(201).json({ success: true, message });
  } catch (err: any) {
    console.error('[Support POST message]', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// ── 4. Read Receipts ──────────────────────────────────────────────────────────
const readReceiptSchema = z.object({
  userId: z.string().min(1),
  readBy: z.enum(['user', 'support']),
});

router.post('/read', async (req: Request, res: Response) => {
  try {
    const parsed = readReceiptSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const { userId, readBy } = parsed.data;
    // If read by support, mark user messages as read. If read by user, mark support messages as read.
    const senderToMark = readBy === 'support' ? 'user' : 'support';
    const updated = await markMessagesAsRead(userId, senderToMark);

    if (updated > 0) {
      broadcast({
        type: 'read',
        data: { userId, readBy, count: updated },
        targetUserId: userId,
      });
    }

    res.json({ success: true, updated });
  } catch (err: any) {
    console.error('[Support read receipt]', err);
    res.status(500).json({ error: 'Failed to update read status' });
  }
});

// ── 5. Typing Indicator ───────────────────────────────────────────────────────
router.post('/typing', (req: Request, res: Response) => {
  const { userId, sender, isTyping } = req.body;
  if (!userId || !sender) return res.status(400).json({ error: 'Missing parameters' });

  broadcast({
    type: 'typing',
    data: { userId, sender, isTyping: !!isTyping },
    targetUserId: userId,
  });

  res.json({ success: true });
});

// ── 6. Admin Threads ──────────────────────────────────────────────────────────
router.get('/admin/threads', async (_req: Request, res: Response) => {
  try {
    const threads = await getThreads();
    res.json({
      threads,
      store: getActiveStoreType(),
      activeConnections: sseClients.size,
    });
  } catch (err: any) {
    console.error('[Support admin threads]', err);
    res.status(500).json({ error: 'Failed to retrieve threads' });
  }
});

// ── 7. Admin Users & Login History (Step 5) ───────────────────────────────────
router.get('/admin/users', async (_req: Request, res: Response) => {
  try {
    const users = await getUsersWithLogins();
    res.json({
      users,
      store: getActiveStoreType(),
      timestamp: new Date().toLocaleTimeString(),
    });
  } catch (err: any) {
    console.error('[Support admin users]', err);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

// ── 8. Log Login / Signup ─────────────────────────────────────────────────────
router.post('/log-login', async (req: Request, res: Response) => {
  try {
    const { email, name, method } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    await logUserLogin(email, name, method);

    broadcast({
      type: 'login',
      data: { email, name, method, timestamp: new Date().toISOString() },
    });

    res.json({ success: true });
  } catch (err: any) {
    console.error('[Support log-login]', err);
    res.json({ success: true }); // never block auth on telemetry failure
  }
});

// ── 9. Store Status & Diagnostics ─────────────────────────────────────────────
router.get('/status', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    store: getActiveStoreType(),
    activeClients: sseClients.size,
    timestamp: new Date().toISOString(),
  });
});

export default router;
