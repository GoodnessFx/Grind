import crypto from 'node:crypto';

/**
 * Hidden admin token — HMAC-SHA256 signed, 2-hour expiry.
 * Completely separate from Supabase user sessions.
 * Payload format: base64url(json).base64url(hmac)
 */
const ADMIN_SECRET = process.env.ADMIN_TOKEN_SECRET || 'xk9-grind-admin-default-secret-7f3a';
const ADMIN_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

export interface AdminTokenPayload {
  sub: string; // admin username
  role: 'admin';
  exp: number; // expiry ms
}

const b64url = (buf: Buffer) => buf.toString('base64url');

const hmac = (data: string) =>
  crypto.createHmac('sha256', ADMIN_SECRET).update(data).digest();

export function signAdminToken(username: string): string {
  const payload: AdminTokenPayload = {
    sub: username,
    role: 'admin',
    exp: Date.now() + ADMIN_TTL_MS,
  };
  const body = b64url(Buffer.from(JSON.stringify(payload)));
  const sig = b64url(hmac(body));
  return `${body}.${sig}`;
}

export function verifyAdminToken(token: string | undefined): AdminTokenPayload | null {
  if (!token || typeof token !== 'string') return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = hmac(body);
  const given = Buffer.from(sig, 'base64url');
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as AdminTokenPayload;
    if (payload.role !== 'admin' || typeof payload.exp !== 'number') return null;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}