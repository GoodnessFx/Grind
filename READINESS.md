# Grind — 10k User Readiness Report

## What Passed

| Area | Status |
|---|---|
| Real Supabase auth (Google, phone OTP, email OTP) | PASS |
| Schema with 21 tables, all indexes, all RLS policies | PASS |
| Atomic wallet balance with row locks | PASS |
| Paystack fund, withdraw, transfer | PASS |
| Webhook idempotency (reference uniqueness) | PASS |
| Gig board paginated (max 50/page) | PASS |
| Real Socket.io chat saved to DB | PASS |
| Profanity and scam keyword filter | PASS |
| Notifications pushed via Socket.io + persisted | PASS |
| Onboarding with DB step tracking | PASS |
| Rate limiting: global 300, strict 20, wallet 10 | PASS |
| Helmet security headers | PASS |
| CORS locked to CLIENT_ORIGIN | PASS |
| Graceful shutdown (SIGTERM/SIGINT) | PASS |
| Error handler — no stack traces to client | PASS |
| Gig escrow: lock, release, auto-release, dispute | PASS |
| Tiers renamed: Fresher Padi Plug Oga Big Boy/Girl | PASS |
| Leaderboard from real DB data | PASS |
| Requests board with offer and gig conversion | PASS |
| Daily spin with budget cap | PASS |
| Share card from real user data | PASS |
| i18n Pidgin and English full catalogue | PASS |
| Admin password hard-fail in production | PASS |

---

## What Still Risks Failing at 10k

| Risk | Mitigation needed |
|---|---|
| Socket.io not sticky across multiple server instances | Add Socket.io Redis adapter: `npm i @socket.io/redis-adapter` and configure in initChat |
| Supabase free plan: 500MB DB, 50MB uploads, 2GB bandwidth | Upgrade to Pro ($25/mo) before 500 users |
| LiveKit free plan: 100 concurrent participants | Upgrade to Cloud plan or self-host, set viewer cap per stream in config |
| Paystack Transfers API requires a funded Paystack balance | Add a Paystack balance alert cron job to warn when balance is low |
| No queue for slow jobs (8am push, share card, emails, chain calls) | Wire BullMQ with the Redis connection for background jobs |
| No CDN for static assets | Add Cloudflare or Vercel Edge in front of the server for web/dist |
| No bundle size budget on frontend | Add Vite rollup size warnings, code-split Live and Wallet via React.lazy |
| No crash reporter | Add Sentry: `npm i @sentry/react @sentry/node` |
| Auto-release cron not scheduled | Add a daily cron calling `auto_release_escrow()` |
| Weekly leaderboard cron not scheduled | Add a Monday 00:01 cron calling `refresh_weekly_leaderboard()` |
| 8am gig alert cron not built | Build a BullMQ repeatable job that sends push/WhatsApp per opted-in user |
| Reconciliation job not built | Daily job comparing wallet ledger vs Paystack transfers |
| Smart contract not audited | Get Sherlock or Code4rena audit before real NGN scales above ₦1m total |
| No load tests run | Run k6 scripts (see below) against staging before launch |

---

## Cost Estimate

| Tier | Hosting (Railway) | Supabase | Redis (Upstash) | LiveKit | Paystack | Total/mo |
|---|---|---|---|---|---|---|
| 1k users, 100 concurrent | $5 | $0 (free) | $0 (free) | $0 (free tier) | 1.5% tx vol | ~$10 + fees |
| 5k users, 500 concurrent | $20 | $25 (Pro) | $10 | $50 | 1.5% tx vol | ~$110 + fees |
| 10k users, 1000 concurrent | $50 | $25 (Pro) | $20 | $100 | 1.5% tx vol | ~$200 + fees |

Paystack charges 1.5% per transaction capped at ₦2,000. On ₦1m/day transaction volume that is ₦15,000/day (~$10/day).

---

## Manual Steps Required

1. **Supabase** — Create project, run `schema.sql` then `functions.sql` in the SQL editor. Enable Phone auth and Google OAuth in Auth settings. Set Google OAuth redirect URI to `https://grind.market/auth/callback`.

2. **Paystack** — Create a Paystack account, enable Transfers API, fund the Paystack balance for withdrawals. Set webhook URL to `https://api.grind.market/api/wallet/webhook/paystack`. Copy Live secret key to `PAYSTACK_SECRET_KEY`.

3. **LiveKit** — Create a LiveKit Cloud project. Copy API key and secret to env. Set max participants per room in the LiveKit dashboard.

4. **Redis** — Create an Upstash Redis database. Copy the `redis://` URL to `REDIS_URL`. Install Socket.io Redis adapter and update `initChat`.

5. **Env vars** — Copy `.env.example` to `.env` in `apps/server/`. Fill in every variable. Add `VITE_*` vars to the Vite build (Railway env or `.env` in `apps/web/`).

6. **Cron jobs** — Schedule two Supabase cron jobs (pg_cron) or external crons:
   - Every Monday 00:01: `SELECT refresh_weekly_leaderboard();`
   - Every hour: `SELECT auto_release_escrow();`

7. **Admin password** — Set `ADMIN_PASSWORD` to a strong random string. Do not leave it as the default.

8. **Domain** — Point `grind.market` to the Railway deployment. Add `www` CNAME. Configure SSL.

9. **Google OAuth** — Add `https://grind.market/auth/callback` to authorised redirect URIs in Google Cloud Console.

10. **Storage bucket** — Create a Supabase Storage bucket named `grind-uploads` with public read and authenticated write. Used for student ID uploads and post images.

11. **Push notifications** — Integrate Web Push API or a third-party provider (OneSignal, Firebase) and store subscription objects per user for the 8am alert.

12. **Legal review** — Have a Nigerian lawyer review the Terms of Service and Privacy Policy pages for NDPR compliance before launch.
