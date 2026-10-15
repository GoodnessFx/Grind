/**
 * Reports API — users report gigs, users, messages or posts.
 * Backs the Report button on gig cards, profiles and chat.
 */
import { Router } from 'express';
import { z } from 'zod';
import { supabase, supabaseAdmin } from '../lib/supabase';
import { createValidator } from '../middleware/validation';
import { requireAuth, type AuthRequest } from '../middleware/requireAuth';
import { sanitize } from './chat';

const router = Router();
const db = () => supabaseAdmin ?? supabase;

const reportSchema = z.object({
  target_type: z.enum(['gig', 'user', 'message', 'post']),
  target_id:   z.string().min(1).max(120),
  reason:      z.string().min(3).max(120),
  details:     z.string().max(1000).optional(),
});

// POST /api/reports — file a report (authenticated)
router.post('/', requireAuth, createValidator(reportSchema), async (req: AuthRequest, res) => {
  const { target_type, target_id, reason, details } = req.body;

  const { data, error } = await db()
    .from('reports')
    .insert({
      reporter_id: req.userId!,
      target_type,
      target_id,
      reason: sanitize(reason),
      details: details ? sanitize(details) : null,
    })
    .select('id, target_type, reason, status, created_at')
    .single();

  if (error) return res.status(500).json({ error: 'Could not submit report. Try again.' });
  res.status(201).json({ success: true, report: data });
});

// GET /api/reports/mine — reports filed by the current user
router.get('/mine', requireAuth, async (req: AuthRequest, res) => {
  const { data, error } = await db()
    .from('reports')
    .select('id, target_type, target_id, reason, status, created_at')
    .eq('reporter_id', req.userId!)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ reports: data ?? [] });
});

export default router;
