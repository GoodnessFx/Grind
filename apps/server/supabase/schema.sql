-- ============================================================
-- Grind Campus — Database Schema
-- Run this in order. Never drop existing columns.
-- All monetary values in kobo (1 NGN = 100 kobo).
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for full-text search on gig titles

-- ============================================================
-- 1. USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email                 TEXT UNIQUE NOT NULL,
  phone                 TEXT UNIQUE,
  handle                TEXT UNIQUE NOT NULL,
  full_name             TEXT,
  avatar_url            TEXT,
  bio                   TEXT,

  -- Campus profile
  campus                TEXT,                -- e.g. "University of Lagos"
  hostel                TEXT,                -- e.g. "Moremi Hall"
  department            TEXT,
  level                 TEXT,                -- e.g. "300L"

  -- Roles (comma-separated or individual booleans)
  role_earn             BOOLEAN DEFAULT FALSE,
  role_hire             BOOLEAN DEFAULT FALSE,
  role_sell             BOOLEAN DEFAULT FALSE,
  role_company          BOOLEAN DEFAULT FALSE,

  -- Skills and interests (array of category slugs)
  skills                TEXT[] DEFAULT '{}',

  -- Verification
  is_verified           BOOLEAN DEFAULT FALSE,
  verification_status   TEXT DEFAULT 'unverified', -- unverified, pending, approved, rejected
  verification_doc_url  TEXT,
  verification_reviewed_at TIMESTAMP WITH TIME ZONE,
  verified_badge        BOOLEAN DEFAULT FALSE,

  -- Wallet
  wallet_balance        BIGINT DEFAULT 0,    -- in kobo
  bank_name             TEXT,
  bank_code             TEXT,
  bank_account_number   TEXT,
  bank_account_name     TEXT,
  paystack_recipient_code TEXT,              -- for transfers

  -- GrindScore & Tier
  grind_score           INT DEFAULT 0,
  tier                  TEXT DEFAULT 'Fresher', -- Fresher, Padi, Plug, Oga, Big Boy, Big Girl

  -- Streak
  streak_count          INT DEFAULT 0,
  streak_last_gig_date  DATE,
  streak_broken_at      DATE,

  -- Sapa Meter
  weekly_earn_target    BIGINT DEFAULT 0,    -- in kobo

  -- Onboarding
  onboarding_step       INT DEFAULT 0,       -- 0=not started, 11=complete
  onboarding_complete   BOOLEAN DEFAULT FALSE,

  -- Referral
  referred_by           UUID REFERENCES users(id),
  referral_code         TEXT UNIQUE,

  -- Settings
  lang                  TEXT DEFAULT 'pidgin',
  notif_8am             BOOLEAN DEFAULT TRUE,
  notif_gigs            BOOLEAN DEFAULT TRUE,
  notif_chat            BOOLEAN DEFAULT TRUE,
  notif_wallet          BOOLEAN DEFAULT TRUE,
  notif_promo           BOOLEAN DEFAULT FALSE,

  -- Creator
  is_creator            BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 2. GIGS (tasks)
-- ============================================================
CREATE TABLE IF NOT EXISTS gigs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poster_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  doer_id       UUID REFERENCES users(id),

  title         TEXT NOT NULL,
  description   TEXT NOT NULL,
  category      TEXT NOT NULL,
  budget        BIGINT NOT NULL,             -- in kobo
  deadline      TIMESTAMP WITH TIME ZONE,
  duration_days INT DEFAULT 3,

  -- Escrow
  escrow_locked BOOLEAN DEFAULT FALSE,
  escrow_ref    TEXT UNIQUE,                 -- Paystack transaction reference

  -- Status machine: open > accepted > submitted > approved > completed | disputed | cancelled
  status        TEXT DEFAULT 'open',

  -- Metadata
  campus        TEXT,                        -- Inherit from poster at post time
  is_featured   BOOLEAN DEFAULT FALSE,
  is_urgent     BOOLEAN DEFAULT FALSE,       -- true if deadline < 2h from now
  views         INT DEFAULT 0,

  -- Spam filter
  flagged       BOOLEAN DEFAULT FALSE,
  flag_reason   TEXT,

  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 3. GIG APPLICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS applications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gig_id      UUID NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pitch       TEXT NOT NULL,
  status      TEXT DEFAULT 'pending',        -- pending, accepted, rejected, withdrawn
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (gig_id, applicant_id)
);

-- ============================================================
-- 4. MESSAGES (gig chat + direct messages)
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL,             -- gig_id for gig chat, or deterministic UUID for DMs
  sender_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id     UUID REFERENCES users(id), -- null for group/stream chat
  content         TEXT NOT NULL,
  image_url       TEXT,
  is_read         BOOLEAN DEFAULT FALSE,
  msg_type        TEXT DEFAULT 'text',       -- text, image, system
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 5. NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  type        TEXT NOT NULL,                 -- money_in, new_gig, application, gig_accepted, gig_approved, system
  ref_id      UUID,                          -- related gig/message/transaction id
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 6. TRANSACTIONS (wallet ledger)
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount          BIGINT NOT NULL,           -- positive = credit, negative = debit, in kobo
  reference       TEXT UNIQUE NOT NULL,      -- Paystack ref or internal
  type            TEXT NOT NULL,             -- fund, withdrawal, escrow_lock, escrow_release, gift, transfer_in, transfer_out
  status          TEXT DEFAULT 'pending',    -- pending, success, failed
  description     TEXT,
  metadata        JSONB,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 7. WITHDRAWALS (separate status tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS withdrawals (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount              BIGINT NOT NULL,       -- in kobo
  bank_name           TEXT NOT NULL,
  bank_account_number TEXT NOT NULL,
  bank_account_name   TEXT NOT NULL,
  paystack_recipient_code TEXT,
  paystack_transfer_code  TEXT,
  reference           TEXT UNIQUE NOT NULL,
  status              TEXT DEFAULT 'pending', -- pending, processing, paid, failed, cancelled
  failure_reason      TEXT,
  retry_count         INT DEFAULT 0,
  initiated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at        TIMESTAMP WITH TIME ZONE,
  paid_at             TIMESTAMP WITH TIME ZONE
);

-- ============================================================
-- 8. STREAMS (live video)
-- ============================================================
CREATE TABLE IF NOT EXISTS streams (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  broadcaster_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  category          TEXT DEFAULT 'Talk',
  livekit_room_name TEXT UNIQUE NOT NULL,
  is_live           BOOLEAN DEFAULT TRUE,
  viewer_count      INT DEFAULT 0,
  scheduled_for     TIMESTAMP WITH TIME ZONE,
  is_scheduled      BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at          TIMESTAMP WITH TIME ZONE
);

-- ============================================================
-- 9. STREAM CHAT MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS stream_messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stream_id   UUID NOT NULL REFERENCES streams(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  msg_type    TEXT DEFAULT 'text',           -- text, gift, reaction
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 10. GIFTS (in-stream)
-- ============================================================
CREATE TABLE IF NOT EXISTS gifts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stream_id       UUID NOT NULL REFERENCES streams(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gift_type       TEXT NOT NULL,             -- rose, fire, crown, naira_rain, diamond
  amount_kobo     BIGINT NOT NULL,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 11. REPORTS
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL,                 -- gig, user, message, post
  target_id   TEXT NOT NULL,                 -- target id (text so local/mock ids also reportable)
  reason      TEXT NOT NULL,
  details     TEXT,
  status      TEXT DEFAULT 'open',           -- open, reviewed, actioned, dismissed
  reviewed_by UUID REFERENCES users(id),
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migration (idempotent) — relax target_id from UUID to TEXT on existing installs
ALTER TABLE reports ALTER COLUMN target_id TYPE TEXT USING target_id::text;

-- ============================================================
-- 12. REQUESTS BOARD
-- ============================================================
CREATE TABLE IF NOT EXISTS requests (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poster_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  budget      BIGINT,                        -- in kobo, optional
  deadline    TIMESTAMP WITH TIME ZONE,
  campus      TEXT,
  category    TEXT,
  status      TEXT DEFAULT 'open',           -- open, awarded, converted, closed
  gig_id      UUID REFERENCES gigs(id),      -- set when converted to a gig
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS request_offers (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id  UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  offerer_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  price       BIGINT NOT NULL,               -- in kobo
  note        TEXT,
  status      TEXT DEFAULT 'pending',        -- pending, accepted, rejected
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (request_id, offerer_id)
);

-- ============================================================
-- 13. REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gig_id      UUID NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating      INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (gig_id, reviewer_id)
);

-- ============================================================
-- 14. CAMPUS POSTS (social feed)
-- ============================================================
CREATE TABLE IF NOT EXISTS posts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  image_url   TEXT,
  campus      TEXT,
  likes       INT DEFAULT 0,
  status      TEXT DEFAULT 'active',         -- active, removed
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS post_likes (
  post_id   UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS post_comments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id     UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 15. LEADERBOARD (weekly snapshot, reset every Monday)
-- ============================================================
CREATE TABLE IF NOT EXISTS leaderboard_weekly (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  campus        TEXT NOT NULL,
  hostel        TEXT,
  week_start    DATE NOT NULL,               -- Monday of the week
  score         INT DEFAULT 0,
  gigs_completed INT DEFAULT 0,
  earnings_kobo BIGINT DEFAULT 0,
  rank          INT,
  prize_paid    BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, week_start)
);

-- ============================================================
-- 16. DAILY SPIN
-- ============================================================
CREATE TABLE IF NOT EXISTS daily_spins (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  spun_at     DATE NOT NULL DEFAULT CURRENT_DATE,
  prize_type  TEXT NOT NULL,                 -- credit, free_gig_post, try_again
  prize_value BIGINT DEFAULT 0,              -- kobo for credit
  UNIQUE (user_id, spun_at)
);

-- ============================================================
-- 17. WEBHOOK EVENTS (idempotency store)
-- ============================================================
CREATE TABLE IF NOT EXISTS webhook_events (
  id          TEXT PRIMARY KEY,              -- Paystack event id
  type        TEXT NOT NULL,
  payload     JSONB NOT NULL,
  processed   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 18. ADMIN AUDIT LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor       TEXT NOT NULL,
  action      TEXT NOT NULL,
  target      TEXT,
  old_values  JSONB,
  new_values  JSONB,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 19. SUPPORT THREADS (chat widget)
-- ============================================================
CREATE TABLE IF NOT EXISTS support_threads (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id),
  guest_token TEXT,
  email       TEXT,
  status      TEXT DEFAULT 'open',           -- open, resolved
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id   UUID NOT NULL REFERENCES support_threads(id) ON DELETE CASCADE,
  from_admin  BOOLEAN DEFAULT FALSE,
  content     TEXT NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 20. COLLABS (schema only, no UI yet)
-- ============================================================
CREATE TABLE IF NOT EXISTS collab_posts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  skills_needed   TEXT[] DEFAULT '{}',
  campus          TEXT,
  status          TEXT DEFAULT 'open',       -- open, closed
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS collab_members (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id     UUID NOT NULL REFERENCES collab_posts(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status      TEXT DEFAULT 'pending',        -- pending, accepted, rejected
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (post_id, user_id)
);

-- ============================================================
-- 21. B2B SOCIAL (existing tables kept, not dropped)
-- ============================================================
CREATE TABLE IF NOT EXISTS companies (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id    UUID REFERENCES users(id),
  name        TEXT NOT NULL,
  industry    TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS social_accounts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID REFERENCES companies(id),
  platform        TEXT NOT NULL,
  access_token    TEXT NOT NULL,
  refresh_token   TEXT,
  connected_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Users
CREATE INDEX IF NOT EXISTS idx_users_campus           ON users (campus);
CREATE INDEX IF NOT EXISTS idx_users_handle           ON users (handle);
CREATE INDEX IF NOT EXISTS idx_users_grind_score      ON users (grind_score DESC);
CREATE INDEX IF NOT EXISTS idx_users_tier             ON users (tier);

-- Gigs
CREATE INDEX IF NOT EXISTS idx_gigs_status            ON gigs (status);
CREATE INDEX IF NOT EXISTS idx_gigs_category          ON gigs (category);
CREATE INDEX IF NOT EXISTS idx_gigs_campus            ON gigs (campus);
CREATE INDEX IF NOT EXISTS idx_gigs_poster            ON gigs (poster_id);
CREATE INDEX IF NOT EXISTS idx_gigs_doer              ON gigs (doer_id);
CREATE INDEX IF NOT EXISTS idx_gigs_deadline          ON gigs (deadline);
CREATE INDEX IF NOT EXISTS idx_gigs_created           ON gigs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gigs_urgent            ON gigs (is_urgent) WHERE is_urgent = TRUE;
CREATE INDEX IF NOT EXISTS idx_gigs_featured          ON gigs (is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_gigs_title_trgm        ON gigs USING GIN (title gin_trgm_ops);

-- Applications
CREATE INDEX IF NOT EXISTS idx_applications_gig       ON applications (gig_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant ON applications (applicant_id);
CREATE INDEX IF NOT EXISTS idx_applications_status    ON applications (status);

-- Messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation  ON messages (conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender        ON messages (sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver      ON messages (receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread        ON messages (receiver_id, is_read) WHERE is_read = FALSE;

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user     ON notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread   ON notifications (user_id, is_read) WHERE is_read = FALSE;

-- Transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user      ON transactions (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_ref       ON transactions (reference);
CREATE INDEX IF NOT EXISTS idx_transactions_status    ON transactions (status);

-- Withdrawals
CREATE INDEX IF NOT EXISTS idx_withdrawals_user       ON withdrawals (user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status     ON withdrawals (status);

-- Stream messages
CREATE INDEX IF NOT EXISTS idx_stream_messages_stream ON stream_messages (stream_id, created_at DESC);

-- Posts
CREATE INDEX IF NOT EXISTS idx_posts_author           ON posts (author_id);
CREATE INDEX IF NOT EXISTS idx_posts_campus           ON posts (campus);
CREATE INDEX IF NOT EXISTS idx_posts_created          ON posts (created_at DESC);

-- Post comments
CREATE INDEX IF NOT EXISTS idx_post_comments_post     ON post_comments (post_id, created_at);

-- Leaderboard
CREATE INDEX IF NOT EXISTS idx_leaderboard_campus_week ON leaderboard_weekly (campus, week_start, score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_hostel_week ON leaderboard_weekly (hostel, week_start, earnings_kobo DESC);

-- Requests
CREATE INDEX IF NOT EXISTS idx_requests_status        ON requests (status);
CREATE INDEX IF NOT EXISTS idx_requests_campus        ON requests (campus);
CREATE INDEX IF NOT EXISTS idx_requests_created       ON requests (created_at DESC);

-- Reports
CREATE INDEX IF NOT EXISTS idx_reports_status         ON reports (status);
CREATE INDEX IF NOT EXISTS idx_reports_target         ON reports (target_type, target_id);

-- Reviews
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee       ON reviews (reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_gig            ON reviews (gig_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all user-data tables
ALTER TABLE users                ENABLE ROW LEVEL SECURITY;
ALTER TABLE gigs                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications         ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages             ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications        ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals          ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews              ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts                ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_spins          ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports              ENABLE ROW LEVEL SECURITY;
ALTER TABLE streams              ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_messages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE gifts                ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests             ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_offers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_weekly   ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_threads      ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages     ENABLE ROW LEVEL SECURITY;

-- Users: read own row fully; others see limited public info
CREATE POLICY users_select_own        ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY users_update_own        ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY users_insert_own        ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Gigs: anyone can read open gigs; only poster can insert/update
CREATE POLICY gigs_select_open        ON gigs FOR SELECT USING (status != 'cancelled');
CREATE POLICY gigs_insert_own         ON gigs FOR INSERT WITH CHECK (auth.uid() = poster_id);
CREATE POLICY gigs_update_own         ON gigs FOR UPDATE USING (auth.uid() = poster_id OR auth.uid() = doer_id);

-- Applications: applicant or gig poster can read
CREATE POLICY applications_select     ON applications FOR SELECT
  USING (auth.uid() = applicant_id OR auth.uid() = (SELECT poster_id FROM gigs WHERE id = gig_id));
CREATE POLICY applications_insert     ON applications FOR INSERT WITH CHECK (auth.uid() = applicant_id);
CREATE POLICY applications_update     ON applications FOR UPDATE
  USING (auth.uid() = applicant_id OR auth.uid() = (SELECT poster_id FROM gigs WHERE id = gig_id));

-- Messages: only sender or receiver
CREATE POLICY messages_select         ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY messages_insert         ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY messages_update_read    ON messages FOR UPDATE
  USING (auth.uid() = receiver_id);

-- Notifications: only the user
CREATE POLICY notifications_own       ON notifications FOR ALL USING (auth.uid() = user_id);

-- Transactions: only the user
CREATE POLICY transactions_own        ON transactions FOR ALL USING (auth.uid() = user_id);

-- Withdrawals: only the user
CREATE POLICY withdrawals_own         ON withdrawals FOR ALL USING (auth.uid() = user_id);

-- Reviews: anyone reads; only reviewer inserts
CREATE POLICY reviews_select          ON reviews FOR SELECT USING (TRUE);
CREATE POLICY reviews_insert          ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Posts: anyone reads active; only author modifies
CREATE POLICY posts_select            ON posts FOR SELECT USING (status = 'active');
CREATE POLICY posts_insert            ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY posts_update            ON posts FOR UPDATE USING (auth.uid() = author_id);

-- Post likes: anyone reads; only own
CREATE POLICY post_likes_own          ON post_likes FOR ALL USING (auth.uid() = user_id);

-- Post comments: anyone reads; only own inserts
CREATE POLICY post_comments_select    ON post_comments FOR SELECT USING (TRUE);
CREATE POLICY post_comments_insert    ON post_comments FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Daily spins: only the user
CREATE POLICY daily_spins_own         ON daily_spins FOR ALL USING (auth.uid() = user_id);

-- Reports: only reporter reads own; insert own
CREATE POLICY reports_own             ON reports FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY reports_insert          ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Streams: anyone reads
CREATE POLICY streams_select          ON streams FOR SELECT USING (TRUE);
CREATE POLICY streams_insert          ON streams FOR INSERT WITH CHECK (auth.uid() = broadcaster_id);
CREATE POLICY streams_update          ON streams FOR UPDATE USING (auth.uid() = broadcaster_id);

-- Stream messages: anyone in the stream reads
CREATE POLICY stream_messages_select  ON stream_messages FOR SELECT USING (TRUE);
CREATE POLICY stream_messages_insert  ON stream_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Gifts: sender or receiver
CREATE POLICY gifts_select            ON gifts FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY gifts_insert            ON gifts FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Requests: open requests are public
CREATE POLICY requests_select         ON requests FOR SELECT USING (status = 'open' OR auth.uid() = poster_id);
CREATE POLICY requests_insert         ON requests FOR INSERT WITH CHECK (auth.uid() = poster_id);
CREATE POLICY requests_update         ON requests FOR UPDATE USING (auth.uid() = poster_id);

-- Request offers: offerer or request poster
CREATE POLICY request_offers_select   ON request_offers FOR SELECT
  USING (auth.uid() = offerer_id OR auth.uid() = (SELECT poster_id FROM requests WHERE id = request_id));
CREATE POLICY request_offers_insert   ON request_offers FOR INSERT WITH CHECK (auth.uid() = offerer_id);
CREATE POLICY request_offers_update   ON request_offers FOR UPDATE
  USING (auth.uid() = offerer_id OR auth.uid() = (SELECT poster_id FROM requests WHERE id = request_id));

-- Leaderboard: anyone reads
CREATE POLICY leaderboard_select      ON leaderboard_weekly FOR SELECT USING (TRUE);

-- Support threads: own thread or guest
CREATE POLICY support_threads_own     ON support_threads FOR SELECT
  USING (auth.uid() = user_id OR guest_token IS NOT NULL);
CREATE POLICY support_threads_insert  ON support_threads FOR INSERT WITH CHECK (TRUE);

CREATE POLICY support_messages_select ON support_messages FOR SELECT
  USING (TRUE);
CREATE POLICY support_messages_insert ON support_messages FOR INSERT WITH CHECK (TRUE);
