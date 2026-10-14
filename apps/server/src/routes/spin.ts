import { Router } from 'express';
import crypto from 'node:crypto';
import { supabase, supabaseAdmin } from '../lib/supabase';
import { requireAuth, type AuthRequest } from '../middleware/requireAuth';
import { notifyUser } from '../lib/notify';

const router = Router();
const db = () => supabaseAdmin ?? supabase;

// Daily budget: max ₦500 in credits per day across all spins
const DAILY_BUDGET_KOBO = 50_000;

const PRIZES = [
  { type: 'credit',      value: 10000,  weight: 5,  label: '₦100 credit' },
  { type: 'credit',      value: 20000,  weight: 3,  label: '₦200 credit' },
  { type: 'credit',      value: 50000,  weight: 2,  label: '₦500 credit' },
  { type: 'free_gig_post', value: 0,   weight: 4,  label: 'Free gig post' },
  { type: 'try_again',   value: 0,      weight: 86, label: 'Try again tomorrow' },
];

function pickPrize(): typeof PRIZES[0] {
  const total = PRIZES.reduce((s, p) => s + p.weight, 0);
  let rand = Math.random() * total;
  for (const p of PRIZES) {
    rand -= p.weight;
    if (rand <= 0) return p;
  }
  return PRIZES[PRIZES.length - 1];
}

// GET /api/spin/status — check if user has spun today
router.get('/status', requireAuth, async (req: AuthRequest, res) => {
  const today = new Date().toISOString().split('T')[0];
  const { data } = await db()
    .from('daily_spins')
    .select('*')
    .eq('user_id', req.userId!)
    .eq('spun_at', today)
    .single();
  res.json({ spun_today: !!data, last_spin: data ?? null });
});

// POST /api/spin — execute today's spin
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const today  = new Date().toISOString().split('T')[0];

  const { data: existing } = await db()
    .from('daily_spins')
    .select('id')
    .eq('user_id', userId)
    .eq('spun_at', today)
    .single();
  if (existing) return res.status(409).json({ error: 'You don spin today already. Come back tomorrow.' });

  // Check daily budget
  const { data: todaySpins } = await db()
    .from('daily_spins')
    .select('prize_value')
    .eq('spun_at', today);
  const totalPaidToday = (todaySpins ?? []).reduce((s: number, r: any) => s + (r.prize_value ?? 0), 0);
  const budgetLeft = DAILY_BUDGET_KOBO - totalPaidToday;

  let prize = pickPrize();
  // If budget exhausted, force try_again
  if (prize.type === 'credit' && prize.value > budgetLeft) {
    prize = PRIZES.find(p => p.type === 'try_again')!;
  }

  await db().from('daily_spins').insert({
    user_id:     userId,
    spun_at:     today,
    prize_type:  prize.type,
    prize_value: prize.value,
  });

  if (prize.type === 'credit' && prize.value > 0) {
    const ref = `GRD-SPIN-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    await db().from('transactions').insert({
      user_id:     userId,
      amount:      prize.value,
      reference:   ref,
      type:        'spin_reward',
      status:      'success',
      description: `Daily spin reward: ${prize.label}`,
    });
    await db().rpc('increment_wallet_balance', { p_user_id: userId, p_amount: prize.value });
    await notifyUser(userId, 'You win!', `You win ${prize.label} from daily spin. E don enter your wallet.`, 'money_in');
  }

  res.json({ prize });
});

export default router;
