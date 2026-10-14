# Grind Changelog

## August 2026 — Full MVP Production Rebuild

### Foundation
Real Supabase auth replacing all localStorage-only flows. Google OAuth, phone OTP and email code flows all wired to real Supabase sessions. Signup saves a full profile row including campus, hostel, level and department. AuthCallback page handles OAuth redirects cleanly.

New auth hook (useAuth) exposes session, profile, refreshProfile and updateUser. apiFetch helper attaches the Supabase JWT to every server request automatically.

### Database
21 tables added or extended. New tables: gigs (renamed and extended from tasks), applications, messages, notifications, withdrawals, streams, stream_messages, gifts, reports, requests, request_offers, reviews, posts, post_likes, post_comments, leaderboard_weekly, daily_spins, webhook_events, collab_posts, collab_members, support_threads, support_messages.

Full index coverage on every filter, sort and join path. Row Level Security enabled and tested on all user-data tables. Atomic Postgres functions for balance credit, balance debit, GrindScore increment, streak update and weekly leaderboard refresh.

### Gig Board
Hardcoded ALL_TASKS array replaced with real paginated API. Full text search via pg_trgm. Filter by category, campus, urgency. Sort by newest, price, deadline. Spam and scam keyword filter on every gig post. Urgent Now tag for gigs due within 2 hours. 16 categories including Hostel Runs, Food Pickup, Assignment, Braid and Barb, Phone Repair, Printing, Laundry.

### Gig Lifecycle
Apply with pitch saved to database. Poster accepts one applicant, rejects the rest. Doer submits work. Poster approves, funds release atomically. Auto-release after 48 hours if poster does not respond. Dispute opens an admin report. GrindScore incremented on completion. Streak updated on completion.

### Wallet
All fake setTimeout wallet actions replaced with real Paystack flows. Fund via Paystack Popup (card) and bank transfer with per-user virtual account. Withdraw creates a Paystack recipient and initiates a transfer. Idempotency on every credit and debit using reference uniqueness. Paystack webhook handler with signature verification stores each event ID to prevent double-credit. Transfer failure triggers automatic refund. Withdraw has full status tracking: pending, processing, paid, failed. Send cNGN between users by handle. Bank account name resolution via Paystack.

### Chat
Socket.io chat saved to Supabase messages table. Real conversations per gig (conversationId = gigId). Typing indicator. Unread count. Profanity filter with real keyword list. Notification pushed to receiver when offline. Fake auto-reply setTimeout removed.

### Notifications
Dedicated notifications table. Every real event (money landed, new application, gig accepted, gig approved) creates a notification row and pushes via Socket.io to the user's personal room. Mark read and mark all read endpoints.

### Onboarding
8-step resumable onboarding flow: role selection, profile setup with live handle availability check, skills picker, student ID upload, wallet explanation, bank details with Paystack name resolve, notification preferences, first action screen. Step saved to database after every screen so user can resume after closing.

### Tiers renamed
Fresher, Padi, Plug, Oga, Big Boy or Big Girl (based on profile). Thresholds unchanged. Tier updated atomically in Postgres when GrindScore changes.

### Leaderboard
Real weekly leaderboard from leaderboard_weekly table. Campus filter. Hostel vs hostel aggregate. Refreshed by a Postgres function on a weekly cron.

### Requests Board
Post a request with budget and deadline. Make an offer. Poster accepts one offer. Accepted offer converts to a real escrow gig automatically.

### Daily Spin
One spin per day per user. Prize pool: credit (₦100 to ₦500), free gig post, or try again. Daily budget cap to control platform cost. Prizes credited to wallet immediately.

### Share Card
Server-side SVG share card generated from real user data (earnings, GrindScore, tier, campus). Sized for Instagram Story and WhatsApp Status.

### i18n
Full Pidgin and English string catalogue covering every screen, empty state, error, success and notification. useTranslation hook dispatches language change events so all components re-render. Language saved in localStorage and user profile.

### Security
requireAuth middleware validates Supabase JWT on every protected route. Admin password fails fast at server start if still default in production. Paystack webhook signature verified with HMAC-SHA512. Rate limits: 300 global, 20 strict on auth and gig post, 10 on wallet operations. Scam keyword filter on gig content.

### 10k Readiness
Redis connection added for Socket.io adapter and rate limit counters. Graceful shutdown with SIGTERM and SIGINT handling. Health endpoint at /health. Paginated list endpoints with max 50 per page. N plus 1 queries fixed via Supabase select with joins. Connection pooler URL documented. Structured error logging (no stack trace to client). Atomic balance changes with row locks.

---

## What still needs manual setup

See the bottom of READINESS.md for the full list of keys, provider accounts and cron jobs that must be configured by hand.
