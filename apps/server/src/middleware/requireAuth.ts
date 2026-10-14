import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY ?? '';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

/**
 * Verify the Supabase JWT from the Authorization header.
 * Adds req.userId and req.userEmail on success.
 */
export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header.' });
  }
  const token = authHeader.slice(7);
  try {
    // Use a per-request client so the JWT is scoped correctly
    const client = createClient(SUPABASE_URL, SUPABASE_KEY);
    const { data: { user }, error } = await client.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Unauthorized.' });
    req.userId    = user.id;
    req.userEmail = user.email ?? undefined;
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized.' });
  }
}
