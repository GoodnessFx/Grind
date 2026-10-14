/**
 * Gigs API — full CRUD + apply + accept + approve + dispute.
 * All amounts in kobo.
 */
import { Router } from 'express';
import { z } from 'zod';
import crypto from 'node:crypto';
import { supabase, supabaseAdmin } from '../lib/supabase';
import { createValidator } from '../middleware/validation';
import { requireAuth, type AuthRequest } from '../middleware/requireAuth';
import { notifyUser } from '../lib/notify';
import { sanitize } from './chat';

const router = Router();
const db = () => supabaseAdmin ?? supabase;

// Spam / scam keyword filter for gig content
const SCAM_KEYWORDS = [
  'send me money', 'pay upfront', 'western union', 'moneygram', 'bitcoin', 'btc',
  'crypto', 'ponzi', 'invest and earn', 'double your money', 'work from home and earn daily',
  'nudes', 'adult content', '18+',
];

function hasScamContent(text: string): boolean {
  const lower = text.toLowerCase();
  return SCAM_KEYWORDS.some(k => lower.includes(k));
}

const CATEGORY_SLUGS = [
  'Writing', 'Design', 'Coding', 'Tutoring', 'Delivery', 'Research',
  'Video', 'Hostel Runs', 'Food Pickup', 'Assignment', 'Braid and Barb',
  'Thrift', 'Phone Repair', 'Printing', 'Laundry', 'Other',
];

// ── GET /api/gigs — paginated, filtered, sorted list ─────────────────────────

router.get('/', async (req, res) => {
  const {
    category, campus, status = 'open', q,
    sort = 'newest', page = '1', limit = '20',
    featured, urgent,
  } = req.query as Record<string, string>;

  const pageNum  = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(50, parseInt(limit) || 20);
  const from     = (pageNum - 1) * limitNum;

  let query = db()
    .from('gigs')
    .select(`
      id, title, description, category, budget, deadline, duration_days,
      status, is_featured, is_urgent, views, campus, created_at,
      poster:poster_id ( id, handle, full_name, avatar_url, grind_score, tier, verified_badge )
    `, { count: 'exact' })
    .eq('status', status)
    .eq('flagged', false);

  if (category && category !== 'All') query = query.eq('category', category);
  if (campus)   query = query.eq('campus', campus);
  if (featured === 'true') query = query.eq('is_featured', true);
  if (urgent   === 'true') query = query.eq('is_urgent', true);

  if (q) {
    // Use trigram full-text search
    query = query.textSearch('title', q, { type: 'plain', config: 'english' });
  }

  switch (sort) {
    case 'price_high': query = query.order('budget', { ascending: false }); break;
    case 'price_low':  query = query.order('budget', { ascending: true });  break;
    case 'urgent':     query = query.order('deadline', { ascending: true }); break;
    default:           query = query.order('created_at', { ascending: false });
  }

  // Urgent gigs float to top within any sort
  query = query.order('is_urgent', { ascending: false });

  const { data, error, count } = await query.range(from, from + limitNum - 1);
  if (error) return res.status(500).json({ error: 'Could not load gigs.' });

  res.json({ gigs: data ?? [], total: count ?? 0, page: pageNum, limit: limitNum });
});

// ── GET /api/gigs/:id — single gig + application count ───────────────────────

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { data: gig, error } = await db()
    .from('gigs')
    .select(`
      *,
      poster:poster_id ( id, handle, full_name, avatar_url, grind_score, tier, verified_badge, campus ),
      doer:doer_id ( id, handle, full_name, avatar_url, grind_score, tier )
    `)
    .eq('id', id)
    .single();
  if (error || !gig) return res.status(404).json({ error: 'Gig not found.' });

  const { count: appCount } = await db()
    .from('applications')
    .select('id', { count: 'exact', head: true })
    .eq('gig_id', id);

  // Increment view count (fire and forget)
  db().from('gigs').update({ views: (gig.views ?? 0) + 1 }).eq('id', id);

  res.json({ gig: { ...gig, application_count: appCount ?? 0 } });
});

// ── POST /api/gigs — create gig ───────────────────────────────────────────────

const createGigSchema = z.object({
  title:         z.string().min(10).max(120),
  description:   z.string().min(20).max(1000),
  category:      z.enum(CATEGORY_SLUGS as [string, ...string[]]),
  budget:        z.number().int().min(50000),      // min ₦500
  deadline_days: z.number().int().min(1).max(90),
});

router.post('/', requireAuth, createValidator(createGigSchema), async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const { title, description, category, budget, deadline_days } = req.body;

  const titleClean = sanitize(title);
  const descClean  = sanitize(description);

  const flagged = hasScamContent(title) || hasScamContent(description);
  const flagReason = flagged ? 'Auto-flagged: suspicious keyword detected' : null;

  const deadlineDate = new Date();
  deadlineDate.setDate(deadlineDate.getDate() + deadline_days);
  const isUrgent = deadline_days <= 0.08; // under 2 hours

  const { data: poster } = await db().from('users').select('campus').eq('id', userId).single();

  const escrowRef = `GRD-ESCROW-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

  const { data: gig, error } = await db()
    .from('gigs')
    .insert({
      poster_id:    userId,
      title:        titleClean,
      description:  descClean,
      category,
      budget,
      deadline:     deadlineDate.toISOString(),
      duration_days: deadline_days,
      campus:       poster?.campus ?? null,
      is_urgent:    isUrgent,
      escrow_ref:   escrowRef,
      flagged,
      flag_reason:  flagReason,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: 'Could not create gig.' });
  if (flagged) {
    // Notify admin but still return — gig is hidden until reviewed
    return res.status(201).json({ gig, warning: 'Your gig is under review before it goes live.' });
  }

  res.status(201).json({ gig });
});

// ── PUT /api/gigs/:id — edit gig (poster only, only if still open) ────────────

const editGigSchema = z.object({
  title:       z.string().min(10).max(120).optional(),
  description: z.string().min(20).max(1000).optional(),
  budget:      z.number().int().min(50000).optional(),
});

router.put('/:id', requireAuth, createValidator(editGigSchema), async (req: AuthRequest, res) => {
  const { id } = req.params;
  const updates: Record<string, any> = {};
  if (req.body.title)       updates.title       = sanitize(req.body.title);
  if (req.body.description) updates.description = sanitize(req.body.description);
  if (req.body.budget)      updates.budget      = req.body.budget;

  const { data: gig } = await db().from('gigs').select('poster_id, status').eq('id', id).single();
  if (!gig) return res.status(404).json({ error: 'Gig not found.' });
  if (gig.poster_id !== req.userId!) return res.status(403).json({ error: 'Not your gig.' });
  if (gig.status !== 'open') return res.status(400).json({ error: 'Can only edit open gigs.' });

  const { data: updated, error } = await db().from('gigs').update(updates).eq('id', id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ gig: updated });
});

// ── POST /api/gigs/:id/apply — submit application ────────────────────────────

const applySchema = z.object({ pitch: z.string().min(10).max(500) });

router.post('/:id/apply', requireAuth, createValidator(applySchema), async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const gigId  = req.params.id;
  const { pitch } = req.body;

  const { data: gig } = await db().from('gigs').select('poster_id, status, title').eq('id', gigId).single();
  if (!gig) return res.status(404).json({ error: 'Gig not found.' });
  if (gig.status !== 'open') return res.status(400).json({ error: 'This gig is no longer accepting applications.' });
  if (gig.poster_id === userId) return res.status(400).json({ error: 'Cannot apply to your own gig.' });

  const { data: existing } = await db().from('applications')
    .select('id, status')
    .eq('gig_id', gigId)
    .eq('applicant_id', userId)
    .single();
  if (existing) {
    if (existing.status === 'withdrawn') {
      await db().from('applications').update({ status: 'pending', pitch: sanitize(pitch) }).eq('id', existing.id);
      return res.status(200).json({ message: 'Application resubmitted.' });
    }
    return res.status(409).json({ error: 'You have already applied for this gig.' });
  }

  const { data: app, error } = await db().from('applications').insert({
    gig_id:       gigId,
    applicant_id: userId,
    pitch:        sanitize(pitch),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  await notifyUser(gig.poster_id, 'New application', `Someone applied for your gig: "${gig.title}"`, 'application', gigId);
  res.status(201).json({ application: app });
});

// ── POST /api/gigs/:id/accept/:applicantId — poster accepts a doer ────────────

router.post('/:id/accept/:applicantId', requireAuth, async (req: AuthRequest, res) => {
  const { id: gigId, applicantId } = req.params;
  const posterId = req.userId!;

  const { data: gig } = await db().from('gigs').select('*').eq('id', gigId).single();
  if (!gig) return res.status(404).json({ error: 'Gig not found.' });
  if (gig.poster_id !== posterId) return res.status(403).json({ error: 'Not your gig.' });
  if (gig.status !== 'open') return res.status(400).json({ error: 'Gig is not open.' });

  // Reject all other applicants
  await db().from('applications')
    .update({ status: 'rejected' })
    .eq('gig_id', gigId)
    .neq('applicant_id', applicantId);

  await db().from('applications')
    .update({ status: 'accepted' })
    .eq('gig_id', gigId)
    .eq('applicant_id', applicantId);

  await db().from('gigs')
    .update({ status: 'accepted', doer_id: applicantId })
    .eq('id', gigId);

  const { data: doer } = await db().from('users').select('handle').eq('id', applicantId).single();
  await notifyUser(applicantId, 'You got the gig!', `Your application don accept. Start work now!`, 'gig_accepted', gigId);
  res.json({ success: true });
});

// ── POST /api/gigs/:id/submit — doer marks work as submitted ─────────────────

router.post('/:id/submit', requireAuth, async (req: AuthRequest, res) => {
  const { id: gigId } = req.params;
  const { data: gig } = await db().from('gigs').select('*').eq('id', gigId).single();
  if (!gig) return res.status(404).json({ error: 'Gig not found.' });
  if (gig.doer_id !== req.userId!) return res.status(403).json({ error: 'Not your gig to submit.' });
  if (gig.status !== 'accepted') return res.status(400).json({ error: 'Gig must be accepted first.' });

  await db().from('gigs').update({ status: 'submitted' }).eq('id', gigId);
  await notifyUser(gig.poster_id, 'Gig submitted for review', `The doer has submitted work for "${gig.title}". Review and approve.`, 'gig_submitted', gigId);
  res.json({ success: true });
});

// ── POST /api/gigs/:id/approve — poster approves, releases escrow ─────────────

router.post('/:id/approve', requireAuth, async (req: AuthRequest, res) => {
  const { id: gigId } = req.params;
  const { data: gig } = await db().from('gigs').select('*').eq('id', gigId).single();
  if (!gig) return res.status(404).json({ error: 'Gig not found.' });
  if (gig.poster_id !== req.userId!) return res.status(403).json({ error: 'Not your gig.' });
  if (gig.status !== 'submitted') return res.status(400).json({ error: 'Gig must be submitted first.' });

  // Calculate doer earnings (deduct platform + escrow fee)
  const doerEarns = Math.round(gig.budget * (1 - 0.08 - 0.015));

  await db().from('gigs').update({ status: 'completed' }).eq('id', gigId);

  // Credit doer wallet
  const { notifyUser: _n, ...walletModule } = await import('../lib/notify');
  const creditRef = `GRD-RELEASE-${gigId}-${Date.now()}`;
  await (supabaseAdmin ?? supabase)
    .from('transactions')
    .insert({
      user_id:     gig.doer_id,
      amount:      doerEarns,
      reference:   creditRef,
      type:        'escrow_release',
      status:      'success',
      description: `Payment for gig: ${gig.title}`,
    });

  await (supabaseAdmin ?? supabase).rpc('increment_wallet_balance', {
    p_user_id: gig.doer_id,
    p_amount:  doerEarns,
  });

  // Update doer GrindScore
  await db().rpc('increment_grind_score', { p_user_id: gig.doer_id, p_points: 25 });

  await notifyUser(gig.doer_id, 'Alert! Money don land.', `₦${(doerEarns / 100).toLocaleString()} don enter your wallet for "${gig.title}".`, 'money_in', gigId);

  res.json({ success: true, doer_earnings: doerEarns });
});

// ── POST /api/gigs/:id/dispute — open a dispute ───────────────────────────────

const disputeSchema = z.object({ reason: z.string().min(10).max(1000) });

router.post('/:id/dispute', requireAuth, createValidator(disputeSchema), async (req: AuthRequest, res) => {
  const { id: gigId } = req.params;
  const { reason } = req.body;

  const { data: gig } = await db().from('gigs').select('*').eq('id', gigId).single();
  if (!gig) return res.status(404).json({ error: 'Gig not found.' });
  if (gig.poster_id !== req.userId! && gig.doer_id !== req.userId!)
    return res.status(403).json({ error: 'Not involved in this gig.' });

  await db().from('gigs').update({ status: 'disputed' }).eq('id', gigId);
  await db().from('reports').insert({
    reporter_id: req.userId!,
    target_type: 'gig',
    target_id:   gigId,
    reason:      sanitize(reason),
  });

  res.json({ success: true, message: 'Dispute opened. Admin will review within 24 hours.' });
});

// ── GET /api/gigs/my/posted — poster's own gigs ───────────────────────────────

router.get('/my/posted', requireAuth, async (req: AuthRequest, res) => {
  const { status } = req.query as { status?: string };
  let query = db()
    .from('gigs')
    .select('*, applications(count)')
    .eq('poster_id', req.userId!)
    .order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ gigs: data ?? [] });
});

// ── GET /api/gigs/my/active — doer's accepted gigs ───────────────────────────

router.get('/my/active', requireAuth, async (req: AuthRequest, res) => {
  const { data, error } = await db()
    .from('gigs')
    .select('*, poster:poster_id(handle, full_name, avatar_url)')
    .eq('doer_id', req.userId!)
    .in('status', ['accepted', 'submitted'])
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ gigs: data ?? [] });
});

// ── GET /api/gigs/:id/applications — list applicants (poster only) ────────────

router.get('/:id/applications', requireAuth, async (req: AuthRequest, res) => {
  const { id: gigId } = req.params;
  const { data: gig } = await db().from('gigs').select('poster_id').eq('id', gigId).single();
  if (!gig) return res.status(404).json({ error: 'Gig not found.' });
  if (gig.poster_id !== req.userId!) return res.status(403).json({ error: 'Not your gig.' });

  const { data, error } = await db()
    .from('applications')
    .select('*, applicant:applicant_id(id, handle, full_name, avatar_url, grind_score, tier, verified_badge)')
    .eq('gig_id', gigId)
    .order('created_at', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ applications: data ?? [] });
});

export default router;
