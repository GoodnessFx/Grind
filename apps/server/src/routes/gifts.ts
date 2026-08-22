import { Router } from 'express';
import { z } from 'zod';
import { createValidator } from '../middleware/validation';

const router = Router();

const giftSchema = z.object({
  streamId: z.string().min(1),
  senderId: z.string().min(1),
  receiverId: z.string().min(1),
  giftType: z.enum(['rose', 'fire', 'crown', 'diamond']),
  amount: z.number().positive(),
});

// In-memory store for MVP — replace with DB in production
const giftLog: Array<{
  id: string;
  streamId: string;
  senderId: string;
  receiverId: string;
  giftType: string;
  amount: number;
  timestamp: string;
}> = [];

// POST /api/gifts — send a gift during a live stream
router.post(
  '/',
  createValidator(giftSchema),
  (req, res) => {
    const { streamId, senderId, receiverId, giftType, amount } = req.body;

    const gift = {
      id: `gift_${Date.now()}`,
      streamId,
      senderId,
      receiverId,
      giftType,
      amount,
      timestamp: new Date().toISOString(),
    };

    giftLog.push(gift);

    // In production: debit sender wallet, credit receiver via Supabase
    res.status(201).json({ success: true, gift });
  }
);

// GET /api/gifts/:streamId — list gifts for a stream
router.get('/:streamId', (req, res) => {
  const { streamId } = req.params;
  const gifts = giftLog.filter((g) => g.streamId === streamId);
  res.json({ gifts });
});

export default router;
