import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import http from 'http';
import path from 'path';
import fs from 'fs';

import applyRouter from './routes/apply';
import streamsRouter from './routes/streams';
import chatRouter, { initChat } from './routes/chat';
import giftsRouter from './routes/gifts';
import adminRouter from './routes/admin';
import supportRouter from './routes/support';
import { initStore } from './services/store';

dotenv.config();

const app = express();
// Trust reverse proxy (Vercel / Heroku / proxies) so `req.ip` reflects X-Forwarded-For
app.set('trust proxy', true);
// Default to 3000 so platforms that proxy a fixed port (Pxxl etc.) always connect;
// platforms that inject $PORT (Railway, Heroku, Render) override it automatically.
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

// ── Security headers ─────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:", "http:"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:", "http:"],
        imgSrc: ["'self'", 'data:', 'blob:', 'https:', 'http:'],
        mediaSrc: ["'self'", 'blob:', 'data:', 'https:', 'http:'],
        connectSrc: ["'self'", 'wss:', 'ws:', 'https:', 'http:'],
        fontSrc: ["'self'", 'data:', 'https:', 'http:'],
        frameSrc: ["'self'", 'https:', 'http:'],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// ── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));

// ── Global rate limit (PASS #11) ─────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  // Use the first value in X-Forwarded-For when behind a proxy, falling back to req.ip
  keyGenerator: (req) => {
    const xf = (req.headers['x-forwarded-for'] as string) || '';
    if (xf) return xf.split(',')[0].trim();
    return String(req.ip ?? '');
  },
  message: { error: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

// Tighter limit for auth / write endpoints
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const xf = (req.headers['x-forwarded-for'] as string) || '';
    if (xf) return xf.split(',')[0].trim();
    return String(req.ip ?? '');
  },
  message: { error: 'Too many requests, please slow down.' },
});

// ── Health check (before API routes so it is always fast) ────────────────────
app.get(['/health', '/healthcheck', '/ping', '/api/health'], (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api', strictLimiter, applyRouter);
app.use('/api/streams', streamsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/gifts', giftsRouter);
// Hidden admin system — obscure prefix, own rate limits per route
app.use('/api/xk9-admin-console-7f3a', adminRouter);
app.use('/api/support', supportRouter);

// ── Serve web SPA (if dist exists) ───────────────────────────────────────────
const candidateDistPaths = [
  path.resolve(__dirname, '../../web/dist'),
  path.resolve(process.cwd(), 'apps/web/dist'),
  path.resolve(process.cwd(), 'dist'),
  path.resolve(__dirname, '../../../apps/web/dist'),
  path.resolve(__dirname, '../web/dist'),
];
const webDistPath = candidateDistPaths.find((p) => fs.existsSync(p));

if (webDistPath) {
  console.log(`[Grind Server] Serving static web SPA from: ${webDistPath}`);
  app.use(express.static(webDistPath, { maxAge: '1h' }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(webDistPath, 'index.html'));
  });
} else {
  console.log('[Grind Server] web/dist not found, candidate paths checked:', candidateDistPaths);
  app.get('/', (_req, res) => {
    res.status(200).json({ status: 'ok', message: 'Grind API is running.' });
  });
}

// ── Global error handler — never leak stack traces (PASS #45) ────────────────
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err.status ?? err.statusCode ?? 500;
  console.error('[Grind Error]', err.message, err.stack);
  res.status(status).json({
    error: status >= 500 ? 'Internal server error' : err.message,
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const server = http.createServer(app);
initChat(server);

server.listen(PORT, HOST, async () => {
  console.log(`[Grind Server] Running on http://${HOST}:${PORT}`);
  try {
    await initStore();
  } catch (err: any) {
    console.error('[Grind Server] Error initializing store:', err.message);
  }
});

export default app;
