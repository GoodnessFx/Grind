-- ============================================================
-- Grind — Hidden Admin System Migration (001_admin.sql)
-- Run this in the Supabase SQL editor (or via `supabase db push`).
-- ============================================================

-- 1. admin-visible email column on profiles (used when the server
--    runs with only the anon key and cannot read auth.users)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_key ON profiles (email) WHERE email IS NOT NULL;

-- 2. Login tracking
CREATE TABLE IF NOT EXISTS login_events (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  email TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS login_events_user_idx ON login_events (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS login_events_email_idx ON login_events (email);

-- 3. Support chat (database-backed, cross-device)
CREATE TABLE IF NOT EXISTS support_messages (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'support')),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS support_messages_user_idx ON support_messages (user_id, created_at DESC);

-- 4. Admin audit log
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id BIGSERIAL PRIMARY KEY,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS admin_audit_log_created_idx ON admin_audit_log (created_at DESC);

-- ============================================================
-- RLS-friendly policies
-- ============================================================
ALTER TABLE login_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Authenticated users may insert their own login events
CREATE POLICY "users_insert_own_login_events"
  ON login_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Users may read their own login history
CREATE POLICY "users_read_own_login_events"
  ON login_events FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Users may chat with support: insert their own messages, read their own thread
CREATE POLICY "users_insert_own_support_messages"
  ON support_messages FOR INSERT
  TO authenticated
  WITH CHECK (sender = 'user' AND user_id = auth.uid());

CREATE POLICY "users_read_own_support_messages"
  ON support_messages FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admin audit log is server-only (service role bypasses RLS);
-- no policies are granted to anon/authenticated by design.

-- Allow users to update their own profile email mirror
CREATE POLICY "users_update_own_email"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());