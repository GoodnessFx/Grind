import { Router } from 'express';
import { z } from 'zod';
import { supabase, supabaseAdmin } from '../lib/supabase';
import { createValidator } from '../middleware/validation';
import { requireAuth, type AuthRequest } from '../middleware/requireAuth';
import { notifyUser } from '../lib/notify';
import { sanitize } from './chat';

const router = Router();
const db = () => supabaseAdmin ?? supabase;

// GET /api/requests — open requests, newest first
router.get('/', async (req, res) => {
  const { campus, category, page = '1', limit = '20' } = req.query as Record<string, string>;
  const pageNum  = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(50, parseInt(limit) || 20);
  const from     = (pageNum - 1) * limitNum;

  let query = db()
    .from('requests')
    .select(`*, poster:poster_id(id, handle, full_name, avatar_url, grind_score, tier, verified_badge)`, { count: 'exact' })
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .range(from, from + limitNum - 1);

  if (campus)   query = query.eq('campus', campus);
  if (category) query = query.eq('category', category);

  const { data, error, count } = await query;
  if (error) return res.status(500).json({ error: 'Could not load requests.' });
  res.json({ requests: data ?? [], total: count ?? 0, page: pageNum, limit: limitNum });
});

// POST /api/requests — post a new request
const createSchema = z.object({
  title:        z.string().min(10).max(120),
  description:  z.string().min(10).max(500),
  budget:       z.number().int().min(0).optional(),
  deadline_days: z.number().int().min(1).max(30).optional(),
  category:     z.string().optional(),
});

router.post('/', requireAuth, createValidator(createSchema), async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const { title, description, budget, deadline_days, category } = req.body;

  const { data: poster } = await db().from('users').select('campus').eq('id', userId).single();

  const deadline = deadline_days
    ? new Date(Date.now() + deadline_days * 86400000).toISOString()
    : null;

  const { data, error } = await db().from('requests').insert({
    poster_id:   userId,
    title:       sanitize(title),
    description: sanitize(description),
    budget:      budget ?? null,
    deadline,
    campus:      poster?.campus ?? null,
    category:    category ?? null,
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ request: data });
});

// GET /api/requests/:id — single request with offers
router.get('/:id', async (req, res) => {
  const { data: request, error } = await db()
    .from('requests')
    .select('*, poster:poster_id(id, handle, full_name, avatar_url, grind_score, tier)')
    .eq('id', req.params.id)
    .single();
  if (error || !request) return res.status(404).json({ error: 'Request not found.' });

  const { data: offers } = await db()
    .from('request_offers')
    .select('*, offerer:offerer_id(id, handle, full_name, avatar_url, grind_score, tier, verified_badge)')
    .eq('request_id', req.params.id)
    .order('created_at', { ascending: true });

  res.json({ request, offers: offers ?? [] });
});

// POST /api/requests/:id/offer — make an offer
const offerSchema = z.object({
  price: z.number().int().min(10000),
  note:  z.string().max(300).optional(),
});

router.post('/:id/offer', requireAuth, createValidator(offerSchema), async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const { price, note } = req.body;

  const { data: request } = await db().from('requests').select('poster_id, title').eq('id', req.params.id).single();
  if (!request) return res.status(404).json({ error: 'Request not found.' });
  if (request.poster_id === userId) return res.status(400).json({ error: 'Cannot offer on your own request.' });

  const { data: offer, error } = await db().from('request_offers').upsert({
    request_id:  req.params.id,
    offerer_id:  userId,
    price,
    note:        note ? sanitize(note) : null,
  }).select().single();

  if (error) return res.status(409).json({ error: 'You already made an offer on this request.' });

  await notifyUser(request.poster_id, 'New offer on your request', `Someone made an offer for "${request.title}"`, 'application', req.params.id);
  res.status(201).json({ offer });
});

// POST /api/requests/:id/accept/:offererId — accept an offer, convert to gig
router.post('/:id/accept/:offererId', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const { id: requestId, offererId } = req.params;

  const { data: request } = await db().from('requests').select('*').eq('id', requestId).single();
  if (!request) return res.status(404).json({ error: 'Request not found.' });
  if (request.poster_id !== userId) return res.status(403).json({ error: 'Not your request.' });

  const { data: offer } = await db().from('request_offers')
    .select('*')
    .eq('request_id', requestId)
    .eq('offerer_id', offererId)
    .single();
  if (!offer) return res.status(404).json({ error: 'Offer not found.' });

  // Convert to gig
  const { data: gig, error: gigErr } = await db().from('gigs').insert({
    poster_id:   userId,
    doer_id:     offererId,
    title:       request.title,
    description: request.description,
    category:    request.category ?? 'Other',
    budget:      offer.price,
    deadline:    request.deadline,
    campus:      request.campus,
    status:      'accepted',
  }).select().single();

  if (gigErr) return res.status(500).json({ error: gigErr.message });

  await db().from('requests').update({ status: 'converted', gig_id: gig.id }).eq('id', requestId);
  await db().from('request_offers').update({ status: 'accepted' }).eq('id', offer.id);

  await notifyUser(offererId, 'Your offer was accepted!', `Your offer for "${request.title}" has been accepted. The gig is now active.`, 'gig_accepted', gig.id);
  res.json({ gig });
});

export default router;
