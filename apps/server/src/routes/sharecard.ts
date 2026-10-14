/**
 * Share card — server-side image generation using sharp + canvas-like SVG rendering.
 * Returns a PNG sized for Instagram Story (1080x1920) and WhatsApp Status.
 */
import { Router } from 'express';
import { supabase, supabaseAdmin } from '../lib/supabase';
import { requireAuth, type AuthRequest } from '../middleware/requireAuth';

const router = Router();
const db = () => supabaseAdmin ?? supabase;

// GET /api/share-card/:userId — generate share card image
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { data: user, error } = await db()
    .from('users')
    .select('full_name, handle, grind_score, tier, campus')
    .eq('id', userId)
    .single();
  if (error || !user) return res.status(404).json({ error: 'User not found.' });

  // Total earnings
  const { data: txns } = await db()
    .from('transactions')
    .select('amount')
    .eq('user_id', userId)
    .in('type', ['escrow_release', 'transfer_in'])
    .eq('status', 'success');
  const totalEarnedKobo = (txns ?? []).reduce((s: number, t: any) => s + (t.amount ?? 0), 0);
  const totalNGN = (totalEarnedKobo / 100).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 });

  const tierColors: Record<string, string> = {
    Fresher: '#98A2B3', Padi: '#CD7F32', Plug: '#F59E0B', Oga: '#F59E0B',
    'Big Boy': '#0BA5EC', 'Big Girl': '#EC4899',
  };
  const tierColor = tierColors[user.tier] ?? '#98A2B3';

  // SVG share card — 1080 x 1920
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0A2540"/>
      <stop offset="100%" stop-color="#003D1F"/>
    </linearGradient>
    <linearGradient id="card" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#00A651" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#00A651" stop-opacity="0.05"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1080" height="1920" fill="url(#bg)"/>

  <!-- Decorative circles -->
  <circle cx="900" cy="200" r="400" fill="#00A651" opacity="0.05"/>
  <circle cx="-80" cy="1700" r="350" fill="#00A651" opacity="0.06"/>

  <!-- Card -->
  <rect x="80" y="600" width="920" height="720" rx="48" fill="url(#card)" stroke="#00A651" stroke-width="1.5" stroke-opacity="0.3"/>

  <!-- Grind logo area -->
  <rect x="440" y="200" width="200" height="200" rx="48" fill="#00A651"/>
  <text x="540" y="322" text-anchor="middle" font-family="Arial Black, sans-serif" font-weight="900" font-size="96" fill="white">G</text>

  <!-- Brand name -->
  <text x="540" y="480" text-anchor="middle" font-family="Arial Black, sans-serif" font-weight="900" font-size="64" fill="white">GRIND</text>
  <text x="540" y="548" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" fill="#00A651">Way for poor people</text>

  <!-- User name -->
  <text x="540" y="730" text-anchor="middle" font-family="Arial Black, sans-serif" font-weight="900" font-size="80" fill="white">${(user.full_name ?? user.handle ?? '').toUpperCase().slice(0, 20)}</text>
  <text x="540" y="800" text-anchor="middle" font-family="Arial, sans-serif" font-size="40" fill="#00A651">${user.handle}</text>

  <!-- Divider -->
  <line x1="200" y1="850" x2="880" y2="850" stroke="#00A651" stroke-width="1" opacity="0.3"/>

  <!-- Stats -->
  <text x="270" y="960" text-anchor="middle" font-family="Arial Black, sans-serif" font-weight="900" font-size="80" fill="white">${totalNGN}</text>
  <text x="270" y="1010" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" fill="white" opacity="0.6">TOTAL EARNED</text>

  <line x1="540" y1="880" x2="540" y2="1060" stroke="#00A651" stroke-width="1" opacity="0.3"/>

  <text x="810" y="960" text-anchor="middle" font-family="Arial Black, sans-serif" font-weight="900" font-size="80" fill="${tierColor}">${user.grind_score}</text>
  <text x="810" y="1010" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" fill="white" opacity="0.6">GRIND SCORE</text>

  <!-- Tier badge -->
  <rect x="380" y="1110" width="320" height="80" rx="40" fill="${tierColor}" opacity="0.2" stroke="${tierColor}" stroke-width="2"/>
  <text x="540" y="1162" text-anchor="middle" font-family="Arial Black, sans-serif" font-weight="900" font-size="40" fill="${tierColor}">${(user.tier ?? 'Fresher').toUpperCase()}</text>

  <!-- Campus -->
  <text x="540" y="1380" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" fill="white" opacity="0.5">${user.campus ?? ''}</text>

  <!-- CTA -->
  <text x="540" y="1560" text-anchor="middle" font-family="Arial Black, sans-serif" font-weight="900" font-size="44" fill="#00A651">grind.market</text>
  <text x="540" y="1620" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" fill="white" opacity="0.4">Join the campus hustle</text>
</svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.send(svg);
});

export default router;
