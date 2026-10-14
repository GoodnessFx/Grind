import { Router } from 'express';
import { supabase, supabaseAdmin } from '../lib/supabase';
import { requireAuth, type AuthRequest } from '../middleware/requireAuth';

const router = Router();
const db = () => supabaseAdmin ?? supabase;

// GET /api/notifications — paginated, newest first
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  const page  = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, parseInt(req.query.limit as string) || 30);
  const from  = (page - 1) * limit;

  const { data, error, count } = await db()
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', req.userId!)
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1);

  if (error) return res.status(500).json({ error: 'Could not load notifications.' });
  res.json({ notifications: data ?? [], total: count ?? 0, page, limit });
});

// POST /api/notifications/read-all
router.post('/read-all', requireAuth, async (req: AuthRequest, res) => {
  await db().from('notifications').update({ is_read: true })
    .eq('user_id', req.userId!).eq('is_read', false);
  res.json({ success: true });
});

// POST /api/notifications/:id/read
router.post('/:id/read', requireAuth, async (req: AuthRequest, res) => {
  await db().from('notifications').update({ is_read: true })
    .eq('id', req.params.id).eq('user_id', req.userId!);
  res.json({ success: true });
});

export default router;
