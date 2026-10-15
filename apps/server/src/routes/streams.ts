import { Router } from 'express';
import crypto from 'node:crypto';
import { z } from 'zod';
import { LivekitRoomService } from '../services/livekit';
import { supabase, supabaseAdmin } from '../lib/supabase';
import { createValidator } from '../middleware/validation';
import { requireAuth, type AuthRequest } from '../middleware/requireAuth';
import { notifyUser } from '../lib/notify';

const router = Router();
const db = () => supabaseAdmin ?? supabase;

// ── Scheduled streams ──────────────────────────────────────────────────────────
// GET /api/streams/scheduled — upcoming scheduled streams (public list).
// MUST be registered before GET /:roomId so "scheduled" isn't treated as a roomId.
router.get('/scheduled', async (_req, res) => {
  const { data, error } = await db()
    .from('streams')
    .select(`
      id, title, category, scheduled_for, is_live, is_scheduled,
      broadcaster:broadcaster_id ( id, handle, full_name, avatar_url, tier, verified_badge )
    `)
    .eq('is_scheduled', true)
    .gte('scheduled_for', new Date(Date.now() - 3600_000).toISOString())
    .order('scheduled_for', { ascending: true })
    .limit(20);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ streams: data ?? [] });
});

// POST /api/streams/schedule — creator schedules a stream for later (reminder set)
router.post('/schedule', requireAuth, async (req: AuthRequest, res) => {
  const { title, scheduled_for } = req.body as { title?: string; scheduled_for?: string };
  const cleanTitle = String(title ?? '').trim();
  if (cleanTitle.length < 3) return res.status(400).json({ error: 'Give the stream a title first.' });

  const when = Date.parse(String(scheduled_for ?? ''));
  if (Number.isNaN(when)) return res.status(400).json({ error: 'Pick a valid date and time.' });
  if (when < Date.now() - 60_000) return res.status(400).json({ error: 'That time don pass already.' });
  if (when > Date.now() + 90 * 86_400_000) return res.status(400).json({ error: 'You fit schedule only up to 90 days ahead.' });

  const { data: stream, error } = await db()
    .from('streams')
    .insert({
      broadcaster_id:   req.userId!,
      title:            cleanTitle,
      livekit_room_name: `sched-${crypto.randomUUID()}`,
      is_live:          false,
      is_scheduled:     true,
      scheduled_for:    new Date(when).toISOString(),
    })
    .select('id, title, scheduled_for, is_live, is_scheduled')
    .single();
  if (error) return res.status(500).json({ error: 'Could not schedule the stream.' });

  await notifyUser(
    req.userId!,
    'Reminder set! ⏰',
    `We go remind you when “${cleanTitle}” start.`,
    'stream_schedule',
    stream.id,
  );
  res.status(201).json({ stream });
});

// Create a new streaming room (creator only)
router.post(
  '/create',
  createValidator(
    z.object({
      title: z.string().min(1),
      creatorId: z.string().uuid(),
    })
  ),
  async (req, res) => {
    const { title, creatorId } = req.body;
    try {
      const room = await LivekitRoomService.createRoom({ title, creatorId });
      res.status(201).json({ roomId: room.name, token: room.token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create stream' });
    }
  }
);

// Join an existing room (viewer)
router.get('/:roomId', async (req, res) => {
  const { roomId } = req.params;
  const { userId } = req.query as any;
  try {
    const token = await LivekitRoomService.generateToken({ roomId, userId });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to join stream' });
  }
});

// ── Reminder sweeper ───────────────────────────────────────────────────────────
// Every minute: find scheduled streams whose time has come and notify the host.
// Deduped through the notifications table (type=stream_reminder, ref_id=stream id),
// so each stream reminds exactly once even if the sweeper runs many times.
let sweeperStarted = false;

export function startStreamReminderSweeper(): void {
  if (sweeperStarted) return;
  sweeperStarted = true;

  const tick = async () => {
    try {
      const { data: due } = await db()
        .from('streams')
        .select('id, broadcaster_id, title, scheduled_for')
        .eq('is_scheduled', true)
        .lte('scheduled_for', new Date().toISOString())
        .limit(20);
      if (!due?.length) return;

      for (const s of due) {
        const { data: already } = await db()
          .from('notifications')
          .select('id')
          .eq('user_id', s.broadcaster_id)
          .eq('type', 'stream_reminder')
          .eq('ref_id', s.id)
          .limit(1);
        if (already?.length) continue;

        await notifyUser(
          s.broadcaster_id,
          'Stream time! ⏰',
          `“${s.title}” don reach time. Go live now — your people dey wait.`,
          'stream_reminder',
          s.id,
        );
      }
    } catch (err: any) {
      console.error('[streams] reminder sweep failed:', err?.message ?? err);
    }
  };

  tick();
  setInterval(tick, 60_000);
}

export default router;

