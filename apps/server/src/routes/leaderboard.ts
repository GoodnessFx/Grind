import { Router } from 'express';
import { supabase, supabaseAdmin } from '../lib/supabase';

const router = Router();
const db = () => supabaseAdmin ?? supabase;

function weekStart(): string {
  const d = new Date();
  const day = d.getDay(); // 0 = Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

// GET /api/leaderboard — top users this week by campus
router.get('/', async (req, res) => {
  const { campus, limit = '50', type = 'campus' } = req.query as Record<string, string>;
  const week = weekStart();
  const limitNum = Math.min(100, parseInt(limit) || 50);

  if (type === 'hostel') {
    // Hostel vs hostel — aggregate by hostel
    const { data, error } = await db()
      .from('leaderboard_weekly')
      .select('hostel, campus, earnings_kobo.sum(), gigs_completed.sum()')
      .eq('week_start', week)
      .not('hostel', 'is', null)
      .order('earnings_kobo', { ascending: false })
      .limit(limitNum);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ leaderboard: data ?? [], week, type: 'hostel' });
  }

  let query = db()
    .from('leaderboard_weekly')
    .select(`
      rank, score, gigs_completed, earnings_kobo, prize_paid,
      user:user_id(id, handle, full_name, avatar_url, tier, verified_badge, campus, hostel)
    `)
    .eq('week_start', week)
    .order('score', { ascending: false })
    .limit(limitNum);

  if (campus) query = query.eq('campus', campus);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ leaderboard: data ?? [], week, type: 'campus' });
});

// GET /api/leaderboard/global — all-time top by grind_score
router.get('/global', async (req, res) => {
  const limit = Math.min(100, parseInt(req.query.limit as string) || 50);
  const { data, error } = await db()
    .from('users')
    .select('id, handle, full_name, avatar_url, grind_score, tier, campus, verified_badge')
    .order('grind_score', { ascending: false })
    .limit(limit);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ leaderboard: data ?? [] });
});

export default router;
