import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import http from 'http';
import path from 'path';
import fs from 'fs';
import IORedis from 'ioredis';

import applyRouter from './routes/apply';
import streamsRouter from './routes/streams';
import chatRouter, { initChat } from './routes/chat';
import giftsRouter from './routes/gifts';
import walletRouter, { handlePaystackWebhook } from './routes/wallet';
import gigsRouter from './routes/gigs';
import notificationsRouter from './routes/notifications';
import requestsRouter from './routes/requests';
import leaderboardRouter from './routes/leaderboard';
import spinRouter from './routes/spin';
import shareCardRouter from './routes/sharecard';
import adminRouter from './routes/admin';
import supportRouter from './routes/support';
import { initStore } from './services/store';

dotenv.config();

// ── Fail fast if admin password is default ────────────────────────────────────
if (
  process.env.NODE_ENV === 'production' &&
  (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === 'GrindXk9!2026')
) {
  console.error('[Grind] FATAL: Set a strong ADMIN_PASSWORD env var before running in production.');
  process.exit(1);
}

const app  = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

app.set('trust proxy', true);

// ── Redis (optional — gracefully degrades without it) ─────────────────────────
let redis: IORedis | null = null;
if (process.env.REDIS_URL) {
  try {
    redis = new IORedis(process.env.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1 });
    redis.on('error', (e: Error) => console.error('[Redis]', e.message));
    redis.connect().then(() => console.log('[Redis] Connected')).catch(() => {
      console.warn('[Redis] Could not connect, running without Redis (no sticky sessions)');
    });
  } catch { /* continue without Redis */ }
}

// ── Security headers ──────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc:  ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:", "http:"],
        styleSrc:   ["'self'", "'unsafe-inline'", "https:", "http:"],
        imgSrc:     ["'self'", 'data:', 'blob:', 'https:', 'http:'],
        mediaSrc:   ["'self'", 'blob:', 'data:', 'https:'],
        connectSrc: ["'self'", 'wss:', 'ws:', 'https:', 'http:'],
        fontSrc:    ["'self'", 'data:', 'https:'],
        frameSrc:   ["'self'", 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CLIENT_ORIGIN ?? '*').split(',').map(s => s.trim());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: ${origin} not allowed`));
  },
  credentials: true,
}));

// ── Paystack webhook — raw body needed for signature verification ─────────────
app.post(
  '/api/wallet/webhook/paystack',
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    try { (req as any).body = JSON.parse(req.body.toString()); } catch { /* already parsed */ }
    next();
  },
  handlePaystackWebhook
);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));

// ── Rate limiting ─────────────────────────────────────────────────────────────
const makeLimit = (max: number, windowMin = 15) => rateLimit({
  windowMs: windowMin * 60 * 1000, max,
  standardHeaders: true, legacyHeaders: false,
  keyGenerator: (req) => {
    const xf = (req.headers['x-forwarded-for'] as string) || '';
    return xf ? xf.split(',')[0].trim() : String(req.ip ?? '');
  },
  message: { error: 'Too many requests. Slow down.' },
});

const globalLimiter  = makeLimit(300);
const strictLimiter  = makeLimit(20);   // auth, apply, gig post
const otpLimiter     = makeLimit(5);    // OTP endpoints
const walletLimiter  = makeLimit(10);   // withdraw, transfer

app.use(globalLimiter);

// ── Health ────────────────────────────────────────────────────────────────────
app.get(['/health', '/healthcheck', '/ping', '/api/health'], (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/gigs',           gigsRouter);
app.use('/api/chat',           chatRouter);
app.use('/api/wallet',         walletLimiter, walletRouter);
app.use('/api/notifications',  notificationsRouter);
app.use('/api/requests',       requestsRouter);
app.use('/api/leaderboard',    leaderboardRouter);
app.use('/api/spin',           spinRouter);
app.use('/api/share-card',     shareCardRouter);
app.use('/api/streams',        streamsRouter);
app.use('/api/gifts',          giftsRouter);
app.use('/api/support',        supportRouter);
app.use('/api',                strictLimiter, applyRouter);
app.use('/api/xk9-admin-console-7f3a', adminRouter);

// ── Serve web SPA ─────────────────────────────────────────────────────────────
const candidateDistPaths = [
  path.resolve(__dirname, '../../web/dist'),
  path.resolve(process.cwd(), 'apps/web/dist'),
  path.resolve(process.cwd(), 'dist'),
  path.resolve(__dirname, '../../../apps/web/dist'),
];
const webDistPath = candidateDistPaths.find((p) => fs.existsSync(p));

if (webDistPath) {
  app.use(express.static(webDistPath, { maxAge: '1h' }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(webDistPath, 'index.html'));
  });
} else {
  app.get('/', (_req, res) => {
    res.status(200).json({ status: 'ok', message: 'Grind API running.' });
  });
}

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err.status ?? err.statusCode ?? 500;
  console.error('[Grind Error]', err.message);
  res.status(status).json({ error: status >= 500 ? 'Internal server error' : err.message });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const server = http.createServer(app);
initChat(server);

server.listen(PORT, HOST, async () => {
  console.log(`[Grind Server] Running on http://${HOST}:${PORT}`);
  try { await initStore(); } catch (e: any) { console.error('[Store]', e.message); }
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
const shutdown = () => {
  console.log('[Grind Server] Shutting down...');
  server.close(() => {
    redis?.quit().catch(() => {});
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default app;
