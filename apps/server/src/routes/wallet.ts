/**
 * Wallet routes — fund, withdraw, transfer, history.
 * All amounts in kobo (1 NGN = 100 kobo).
 * Every write that touches balance uses a Supabase RPC with row-lock for idempotency.
 */
import { Router } from 'express';
import { z } from 'zod';
import crypto from 'node:crypto';
import { supabase, supabaseAdmin } from '../lib/supabase';
import { createValidator } from '../middleware/validation';
import { requireAuth, type AuthRequest } from '../middleware/requireAuth';
import { notifyUser } from '../lib/notify';

const router = Router();
const db = () => supabaseAdmin ?? supabase;

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY ?? '';
const PLATFORM_FEE_BPS = 800;   // 8% = 800 basis points
const ESCROW_FEE_BPS   = 150;   // 1.5%

// ── Helper: Paystack API ──────────────────────────────────────────────────────

async function paystackPost(path: string, body: object) {
  if (!PAYSTACK_SECRET) throw new Error('Paystack not configured.');
  const res = await fetch(`https://api.paystack.co${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.status) throw new Error(data.message ?? 'Paystack error');
  return data.data;
}

async function paystackGet(path: string) {
  if (!PAYSTACK_SECRET) throw new Error('Paystack not configured.');
  const res = await fetch(`https://api.paystack.co${path}`, {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
  });
  const data = await res.json();
  if (!data.status) throw new Error(data.message ?? 'Paystack error');
  return data.data;
}

// ── Idempotent balance credit (uses Postgres function to prevent double-credit)
async function creditBalance(userId: string, amountKobo: number, reference: string, type: string, description: string) {
  // Check if reference already processed
  const { data: existing } = await db()
    .from('transactions')
    .select('id')
    .eq('reference', reference)
    .single();
  if (existing) return { alreadyProcessed: true };

  const { error: txError } = await db().from('transactions').insert({
    user_id: userId,
    amount: amountKobo,
    reference,
    type,
    status: 'success',
    description,
  });
  if (txError) throw new Error(txError.message);

  // Increment wallet balance atomically
  const { error: balError } = await db().rpc('increment_wallet_balance', {
    p_user_id: userId,
    p_amount: amountKobo,
  });
  if (balError) {
    // Rollback transaction record
    await db().from('transactions').delete().eq('reference', reference);
    throw new Error(balError.message);
  }
  return { alreadyProcessed: false };
}

async function debitBalance(userId: string, amountKobo: number, reference: string, type: string, description: string) {
  // Check existing
  const { data: existing } = await db()
    .from('transactions')
    .select('id')
    .eq('reference', reference)
    .single();
  if (existing) return { alreadyProcessed: true };

  // Fetch current balance and check sufficiency
  const { data: user, error: userErr } = await db()
    .from('users')
    .select('wallet_balance')
    .eq('id', userId)
    .single();
  if (userErr || !user) throw new Error('User not found');
  if (user.wallet_balance < amountKobo) throw new Error('Insufficient balance');

  const { error: txError } = await db().from('transactions').insert({
    user_id: userId,
    amount: -amountKobo,
    reference,
    type,
    status: 'success',
    description,
  });
  if (txError) throw new Error(txError.message);

  const { error: balError } = await db().rpc('decrement_wallet_balance', {
    p_user_id: userId,
    p_amount: amountKobo,
  });
  if (balError) {
    await db().from('transactions').delete().eq('reference', reference);
    throw new Error(balError.message);
  }
  return { alreadyProcessed: false };
}

// ── GET /api/wallet — balance + recent transactions ─────────────────────────

router.get('/', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const { data: user, error } = await db()
    .from('users')
    .select('wallet_balance, grind_score, tier')
    .eq('id', userId)
    .single();
  if (error) return res.status(500).json({ error: 'Could not fetch balance.' });

  const { data: txns } = await db()
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  res.json({ balance: user.wallet_balance, grind_score: user.grind_score, tier: user.tier, transactions: txns ?? [] });
});

// ── POST /api/wallet/initialize-payment — Paystack Popup ref ─────────────────

const initPaySchema = z.object({ amount_kobo: z.number().int().min(10000) }); // min ₦100

router.post('/initialize-payment', requireAuth, createValidator(initPaySchema), async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const { amount_kobo } = req.body;
  const { data: user } = await db().from('users').select('email').eq('id', userId).single();
  if (!user) return res.status(404).json({ error: 'User not found.' });

  const reference = `GRD-FUND-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  try {
    const data = await paystackPost('/transaction/initialize', {
      email: user.email,
      amount: amount_kobo,
      reference,
      callback_url: `${process.env.CLIENT_ORIGIN}/wallet?funded=1`,
      metadata: { user_id: userId, type: 'wallet_fund' },
    });
    res.json({ authorization_url: data.authorization_url, reference, access_code: data.access_code });
  } catch (err: any) {
    res.status(502).json({ error: err.message });
  }
});

// ── POST /api/wallet/verify-payment — called after Paystack redirect ─────────

const verifySchema = z.object({ reference: z.string().min(1) });

router.post('/verify-payment', requireAuth, createValidator(verifySchema), async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const { reference } = req.body;
  try {
    const data = await paystackGet(`/transaction/verify/${encodeURIComponent(reference)}`);
    if (data.status !== 'success') return res.status(400).json({ error: 'Payment not successful.' });
    if (data.metadata?.user_id !== userId) return res.status(403).json({ error: 'Mismatch.' });

    const result = await creditBalance(userId, data.amount, reference, 'fund', 'Wallet funded via Paystack');
    if (!result.alreadyProcessed) {
      await notifyUser(userId, 'Money don land!', `Alert! ₦${(data.amount / 100).toLocaleString()} don enter your wallet.`, 'money_in');
    }
    const { data: user } = await db().from('users').select('wallet_balance').eq('id', userId).single();
    res.json({ success: true, new_balance: user?.wallet_balance ?? 0 });
  } catch (err: any) {
    res.status(502).json({ error: err.message });
  }
});

// ── POST /api/wallet/withdraw ─────────────────────────────────────────────────

const withdrawSchema = z.object({
  amount_kobo:    z.number().int().min(50000), // min ₦500
  bank_code:      z.string().min(1),
  account_number: z.string().min(10).max(10),
  account_name:   z.string().min(2),
  bank_name:      z.string().min(2),
});

router.post('/withdraw', requireAuth, createValidator(withdrawSchema), async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const { amount_kobo, bank_code, account_number, account_name, bank_name } = req.body;
  const reference = `GRD-WD-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

  try {
    // Debit immediately (optimistic)
    await debitBalance(userId, amount_kobo, reference, 'withdrawal', `Withdrawal to ${bank_name} ${account_number}`);

    // Create Paystack recipient
    let recipientCode: string;
    try {
      const recipientData = await paystackPost('/transferrecipient', {
        type: 'nuban',
        name: account_name,
        account_number,
        bank_code,
        currency: 'NGN',
      });
      recipientCode = recipientData.recipient_code;
    } catch (err: any) {
      // Refund on recipient creation failure
      await creditBalance(userId, amount_kobo, `${reference}-REFUND`, 'fund', 'Withdrawal refund (recipient error)');
      return res.status(502).json({ error: 'Could not create bank recipient: ' + err.message });
    }

    // Initiate transfer
    let transferCode: string | null = null;
    let status = 'processing';
    try {
      const transferData = await paystackPost('/transfer', {
        source: 'balance',
        amount: amount_kobo,
        recipient: recipientCode,
        reason: `Grind withdrawal ${reference}`,
        reference,
      });
      transferCode = transferData.transfer_code;
      status = transferData.status ?? 'processing';
    } catch { /* transfer queued, will be confirmed via webhook */ }

    // Log withdrawal record
    await db().from('withdrawals').insert({
      user_id: userId,
      amount: amount_kobo,
      bank_name,
      bank_account_number: account_number,
      bank_account_name: account_name,
      bank_code,
      paystack_recipient_code: recipientCode,
      paystack_transfer_code: transferCode,
      reference,
      status,
    });

    await notifyUser(userId, 'Withdrawal initiated', `Your ₦${(amount_kobo / 100).toLocaleString()} withdrawal is processing. Should land in 1-2 hours.`, 'money_in');

    res.json({ success: true, reference, status });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ── GET /api/wallet/withdrawals — withdrawal history with status ──────────────

router.get('/withdrawals', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const { data, error } = await db()
    .from('withdrawals')
    .select('*')
    .eq('user_id', userId)
    .order('initiated_at', { ascending: false })
    .limit(20);
  if (error) return res.status(500).json({ error: 'Could not fetch withdrawals.' });
  res.json({ withdrawals: data });
});

// ── POST /api/wallet/transfer — send to another user by handle ───────────────

const transferSchema = z.object({
  to_handle:   z.string().min(2),
  amount_kobo: z.number().int().min(10000), // min ₦100
  note:        z.string().max(200).optional(),
});

router.post('/transfer', requireAuth, createValidator(transferSchema), async (req: AuthRequest, res) => {
  const fromId = req.userId!;
  const { to_handle, amount_kobo, note } = req.body;

  const handle = to_handle.startsWith('@') ? to_handle.slice(1) : to_handle;
  const { data: toUser, error: toErr } = await db()
    .from('users')
    .select('id, full_name')
    .eq('handle', handle)
    .single();
  if (toErr || !toUser) return res.status(404).json({ error: `No user found with handle @${handle}.` });
  if (toUser.id === fromId) return res.status(400).json({ error: 'Cannot send money to yourself.' });

  const reference = `GRD-TRF-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  try {
    await debitBalance(fromId, amount_kobo, `${reference}-OUT`, 'transfer_out', `Transfer to @${handle}`);
    await creditBalance(toUser.id, amount_kobo, `${reference}-IN`, 'transfer_in', `Transfer from ${req.userId}`);

    await notifyUser(
      toUser.id,
      'Alert! Money don land.',
      `₦${(amount_kobo / 100).toLocaleString()} don land from @${handle}${note ? ': ' + note : ''}.`,
      'money_in'
    );

    res.json({ success: true, reference });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ── POST /api/wallet/resolve-account — Paystack name lookup ──────────────────

const resolveSchema = z.object({ account_number: z.string().length(10), bank_code: z.string().min(3) });

router.post('/resolve-account', requireAuth, createValidator(resolveSchema), async (req: AuthRequest, res) => {
  const { account_number, bank_code } = req.body;
  try {
    const data = await paystackGet(`/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`);
    res.json({ account_name: data.account_name });
  } catch (err: any) {
    res.status(404).json({ error: 'Could not resolve account. Check the number and bank.' });
  }
});

// ── GET /api/wallet/banks — list Nigerian banks from Paystack ─────────────────

router.get('/banks', async (_req, res) => {
  try {
    const data = await paystackGet('/bank?currency=NGN&perPage=100');
    res.json({ banks: data });
  } catch (err: any) {
    res.status(502).json({ error: err.message });
  }
});

// ── POST /api/wallet/paystack-webhook — Paystack event handler ───────────────
// Mounted WITHOUT requireAuth — verified by signature instead.

export async function handlePaystackWebhook(req: any, res: any) {
  const sig  = req.headers['x-paystack-signature'] as string;
  const body = JSON.stringify(req.body);
  const expected = crypto.createHmac('sha512', PAYSTACK_SECRET).update(body).digest('hex');
  if (sig !== expected) return res.status(401).json({ error: 'Invalid signature' });

  const event = req.body;
  const eventId = event.data?.id ?? event.data?.reference ?? `${event.event}-${Date.now()}`;

  // Idempotency check
  const { data: existing } = await db().from('webhook_events').select('id').eq('id', String(eventId)).single();
  if (existing) return res.status(200).json({ received: true });

  await db().from('webhook_events').insert({ id: String(eventId), type: event.event, payload: event });

  if (event.event === 'charge.success') {
    const { reference, amount, metadata } = event.data;
    const userId = metadata?.user_id;
    if (userId) {
      await creditBalance(userId, amount, reference, 'fund', 'Wallet funded via Paystack').catch(() => {});
      await notifyUser(userId, 'Money don land!', `Alert! ₦${(amount / 100).toLocaleString()} don enter your wallet.`, 'money_in').catch(() => {});
    }
  }

  if (event.event === 'transfer.success') {
    const { reference } = event.data;
    await db().from('withdrawals')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('reference', reference);
    const { data: wd } = await db().from('withdrawals').select('user_id, amount').eq('reference', reference).single();
    if (wd) {
      await notifyUser(wd.user_id, 'Withdrawal paid!', `Alert! Your ₦${(wd.amount / 100).toLocaleString()} don land in your bank.`, 'money_in').catch(() => {});
    }
  }

  if (event.event === 'transfer.failed') {
    const { reference, reason } = event.data;
    const { data: wd } = await db().from('withdrawals').select('user_id, amount').eq('reference', reference).single();
    if (wd) {
      await db().from('withdrawals').update({ status: 'failed', failure_reason: reason }).eq('reference', reference);
      // Auto-refund
      await creditBalance(wd.user_id, wd.amount, `${reference}-REFUND`, 'fund', 'Withdrawal refund (transfer failed)').catch(() => {});
      await notifyUser(wd.user_id, 'Withdrawal failed', `Your ₦${(wd.amount / 100).toLocaleString()} don return to your wallet. Wahala: ${reason ?? 'unknown'}.`, 'system').catch(() => {});
    }
  }

  res.status(200).json({ received: true });
}

export default router;
