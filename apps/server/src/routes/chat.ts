import { Router } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { z } from 'zod';
import { supabase, supabaseAdmin } from '../lib/supabase';
import { createValidator } from '../middleware/validation';
import { requireAuth, type AuthRequest } from '../middleware/requireAuth';

const router = Router();
export let io: SocketIOServer | null = null;

const db = () => supabaseAdmin ?? supabase;

// ── Spam / profanity filter ───────────────────────────────────────────────────
const BAD_WORDS = [
  'badword', 'scam', 'fraud', 'ponzi', 'send me money', 'send your',
  'western union', 'moneygram', 'pay me outside',
];

export function sanitize(text: string): string {
  let clean = text.trim().slice(0, 2000);
  for (const w of BAD_WORDS) {
    clean = clean.replace(new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '****');
  }
  return clean;
}

// ── Socket.io init ────────────────────────────────────────────────────────────

export const initChat = (httpServer: any) => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: (process.env.CLIENT_ORIGIN ?? '*').split(',').map(s => s.trim()),
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // Require auth token on connection
    allowRequest: async (req, callback) => {
      const token = (req as any).auth?.token
        ?? (req.headers['authorization'] as string)?.replace('Bearer ', '')
        ?? (req as any)._query?.token;
      if (!token) return callback(null, true); // allow — stream viewers don't need auth
      callback(null, true);
    },
  });

  io.on('connection', (socket) => {
    // Authenticate on connect
    socket.on('auth', async ({ token }: { token: string }) => {
      if (!token) return;
      try {
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) {
          (socket as any).userId = user.id;
          // Join personal notification room
          socket.join(`user:${user.id}`);
        }
      } catch { /* invalid token, socket still works for public rooms */ }
    });

    // Join a conversation (gigId for gig chat, stream id for live chat)
    socket.on('joinRoom', (roomId: string) => {
      socket.join(roomId);
    });

    socket.on('leaveRoom', (roomId: string) => {
      socket.leave(roomId);
    });

    // Typing indicator
    socket.on('typing', ({ roomId, handle }: { roomId: string; handle: string }) => {
      socket.to(roomId).emit('typing', { handle });
    });

    socket.on('stopTyping', ({ roomId }: { roomId: string }) => {
      socket.to(roomId).emit('stopTyping');
    });

    // Chat message
    socket.on('chatMessage', async (payload: {
      roomId: string;
      conversationId: string;
      senderId: string;
      receiverId?: string;
      content: string;
      msgType?: string;
    }) => {
      if (!payload?.roomId || !payload?.content?.trim()) return;
      const clean = sanitize(payload.content);

      const msgRecord = {
        conversation_id: payload.conversationId ?? payload.roomId,
        sender_id:       payload.senderId,
        receiver_id:     payload.receiverId ?? null,
        content:         clean,
        msg_type:        payload.msgType ?? 'text',
      };

      // Persist to Supabase
      const { data: saved } = await db()
        .from('messages')
        .insert(msgRecord)
        .select()
        .single();

      const outMsg = saved ?? { ...msgRecord, id: `tmp-${Date.now()}`, created_at: new Date().toISOString() };

      // Emit to everyone in the room
      io?.to(payload.roomId).emit('chatMessage', outMsg);

      // Push notification to receiver if they're not in the room
      if (payload.receiverId) {
        const sockets = await io?.in(payload.roomId).fetchSockets();
        const receiverOnline = sockets?.some((s) => (s as any).userId === payload.receiverId);
        if (!receiverOnline) {
          await db().from('notifications').insert({
            user_id: payload.receiverId,
            title:   'New message',
            body:    clean.slice(0, 120),
            type:    'chat',
            ref_id:  payload.conversationId ?? null,
          });
          io?.to(`user:${payload.receiverId}`).emit('notification', {
            type: 'chat', body: clean.slice(0, 120), ref_id: payload.conversationId,
          });
        }
      }
    });

    socket.on('disconnect', () => {
      /* connection closed */
    });
  });
};

// ── REST fallback ─────────────────────────────────────────────────────────────

// GET /api/chat/:conversationId — paginated message history
router.get('/:conversationId', requireAuth, async (req: AuthRequest, res) => {
  const { conversationId } = req.params;
  const page  = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, parseInt(req.query.limit as string) || 50);
  const from  = (page - 1) * limit;

  const { data, error } = await db()
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1);

  if (error) return res.status(500).json({ error: 'Could not load messages.' });
  res.json({ messages: (data ?? []).reverse(), page, limit });
});

// POST /api/chat/:conversationId — send via REST (no websocket)
const sendSchema = z.object({
  content:     z.string().min(1).max(2000),
  receiver_id: z.string().uuid().optional(),
  msg_type:    z.enum(['text', 'image']).optional().default('text'),
});

router.post('/:conversationId', requireAuth, createValidator(sendSchema), async (req: AuthRequest, res) => {
  const { conversationId } = req.params;
  const { content, receiver_id, msg_type } = req.body;
  const clean = sanitize(content);

  const { data: msg, error } = await db()
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: req.userId!,
      receiver_id: receiver_id ?? null,
      content: clean,
      msg_type,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: 'Could not send message.' });

  // Also push via socket
  io?.to(conversationId).emit('chatMessage', msg);

  res.status(201).json({ message: msg });
});

// POST /api/chat/:conversationId/read — mark messages as read
router.post('/:conversationId/read', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  await db()
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', req.params.conversationId)
    .eq('receiver_id', userId);
  res.json({ success: true });
});

// GET /api/chat/unread/count — total unread across all conversations
router.get('/unread/count', requireAuth, async (req: AuthRequest, res) => {
  const { count } = await db()
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('receiver_id', req.userId!)
    .eq('is_read', false);
  res.json({ unread: count ?? 0 });
});

export default router;
