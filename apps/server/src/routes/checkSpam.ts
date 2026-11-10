import { Router } from 'express';
import { z } from 'zod';
import { createValidator } from '../middleware/validation';

const router = Router();

const SCAM_KEYWORDS = [
  'send me money', 'pay upfront', 'western union', 'moneygram', 'bitcoin',
  'btc', 'crypto payment', 'ponzi', 'invest and earn', 'double your money',
  'work from home and earn daily', 'nudes', 'adult content', '18+',
  'pay before', 'send first', 'wire transfer', 'gift card',
];

const SPAM_PATTERNS = [
  /whatsapp\s*(?:me|us|now)/i,
  /call\s*(?:me|us|now)\s*on/i,
  /\+234\d{10}/,
  /(?:gmail|yahoo|hotmail)\.com/i,
];

export function checkSpamContent(title: string, description: string): { flagged: boolean; reason?: string } {
  const combined = `${title} ${description}`.toLowerCase();
  for (const kw of SCAM_KEYWORDS) {
    if (combined.includes(kw)) {
      return { flagged: true, reason: `Looks like spam or scam: "${kw}" — remove and try again.` };
    }
  }
  for (const pat of SPAM_PATTERNS) {
    if (pat.test(combined)) {
      return { flagged: true, reason: 'E get contact info inside. Grind handles all communication — remove it.' };
    }
  }
  // Too short title
  if (title.trim().length < 10) {
    return { flagged: true, reason: 'Title too short. Add more detail so students understand the gig.' };
  }
  return { flagged: false };
}

// POST /api/gigs/check-spam
router.post(
  '/',
  createValidator(z.object({ title: z.string().min(1).max(200), description: z.string().max(2000) })),
  (req, res) => {
    const { title, description } = req.body;
    res.json(checkSpamContent(title, description));
  }
);

export default router;
