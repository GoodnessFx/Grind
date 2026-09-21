import { Request, Response, NextFunction } from 'express';
import { verifyAdminToken } from '../lib/adminToken';

/**
 * adminMiddleware — guards every hidden admin route.
 * Expects: Authorization: Bearer <admin-token>
 */
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : undefined;
  const payload = verifyAdminToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  (req as any).admin = payload;
  next();
};

/** Sanitize any admin-editable string: trim + strip angle brackets. */
export const sanitize = (value: unknown): string =>
  String(value ?? '')
    .replace(/[<>]/g, '')
    .trim();