/**
 * Users API — public profile lookup by handle + public stats.
 * Powers /u/:handle (PublicProfile.tsx) and its OG meta tags.
 */
import { Router } from 'express';
import { supabase, supabaseAdmin } from '../lib/supabase';

const router = Router();
const db = () => supabaseAdmin ?? supabase;

// GET /api/users/by-handle/:handle — public profile + stats (no auth needed)
router.get('/by-handle/:handle', async (req, res) => {
  const raw = String(req.params.handle ?? '').trim().replace(/^@/, '');
  const handle = raw.toLowerCase().replace(/[^a-z0-9_.]/g, '');
  if (!handle) return res.status(400).json({ error: 'Handle is required.' });

  const { data: user, error } = await db()
    .from('users')
    .select(`
      id, handle, full_name, avatar_url, bio, campus, hostel, department, level,
      grind_score, tier, verified_badge, is_verified, is_creator, skills,
      created_at
    `)
    .ilike('handle', handle)
    .single();
  if (error || !user) return res.status(404).json({ error: 'No one dey on Grind with that handle.' });

  // Completed gigs as doer
  const { count: gigsDone } = await db()
    .from('gigs')
    .select('id', { count: 'exact', head: true })
    .eq('doer_id', user.id)
    .eq('status', 'completed');

  // Reviews about this user → average rating
  const { data: reviewRows } = await db()
    .from('reviews')
    .select('rating')
    .eq('reviewee_id', user.id);
  const reviews = reviewRows ?? [];
  const avgRating = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + ((r as any).rating ?? 0), 0) / reviews.length) * 10) / 10
    : null;

  // Open gigs they are selling right now
  const { count: openGigs } = await db()
    .from('gigs')
    .select('id', { count: 'exact', head: true })
    .eq('poster_id', user.id)
    .eq('status', 'open')
    .eq('flagged', false);

  res.json({
    user: {
      ...user,
      stats: {
        gigs_completed: gigsDone ?? 0,
        avg_rating: avgRating,
        review_count: reviews.length,
        open_gigs: openGigs ?? 0,
      },
    },
  });
});

export default router;
