-- ============================================================
-- Grind — Postgres helper functions
-- Run after schema.sql
-- ============================================================

-- Atomic wallet credit (row-locked)
CREATE OR REPLACE FUNCTION increment_wallet_balance(p_user_id UUID, p_amount BIGINT)
RETURNS VOID AS $$
BEGIN
  UPDATE users SET wallet_balance = wallet_balance + p_amount, updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomic wallet debit (row-locked, check sufficiency)
CREATE OR REPLACE FUNCTION decrement_wallet_balance(p_user_id UUID, p_amount BIGINT)
RETURNS VOID AS $$
DECLARE v_balance BIGINT;
BEGIN
  SELECT wallet_balance INTO v_balance FROM users WHERE id = p_user_id FOR UPDATE;
  IF v_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
  UPDATE users SET wallet_balance = wallet_balance - p_amount, updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomic GrindScore increment + tier update
CREATE OR REPLACE FUNCTION increment_grind_score(p_user_id UUID, p_points INT)
RETURNS VOID AS $$
DECLARE
  v_score INT;
  v_tier  TEXT;
BEGIN
  UPDATE users SET grind_score = grind_score + p_points, updated_at = NOW()
  WHERE id = p_user_id
  RETURNING grind_score INTO v_score;

  -- Determine tier
  IF    v_score >= 950 THEN v_tier := 'Big Boy'; -- or Big Girl, updated separately
  ELSIF v_score >= 800 THEN v_tier := 'Oga';
  ELSIF v_score >= 600 THEN v_tier := 'Plug';
  ELSIF v_score >= 300 THEN v_tier := 'Padi';
  ELSE                       v_tier := 'Fresher';
  END IF;

  UPDATE users SET tier = v_tier WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Weekly leaderboard snapshot (run by cron every Monday 00:01)
CREATE OR REPLACE FUNCTION refresh_weekly_leaderboard()
RETURNS VOID AS $$
DECLARE
  v_week_start DATE := DATE_TRUNC('week', NOW())::DATE;
BEGIN
  INSERT INTO leaderboard_weekly (user_id, campus, hostel, week_start, score, gigs_completed, earnings_kobo)
  SELECT
    u.id,
    u.campus,
    u.hostel,
    v_week_start,
    u.grind_score,
    COUNT(g.id) FILTER (WHERE g.status = 'completed' AND g.updated_at >= v_week_start),
    COALESCE(SUM(t.amount) FILTER (WHERE t.type = 'escrow_release' AND t.created_at >= v_week_start), 0)
  FROM users u
  LEFT JOIN gigs g ON g.doer_id = u.id
  LEFT JOIN transactions t ON t.user_id = u.id
  WHERE u.onboarding_complete = TRUE
  GROUP BY u.id
  ON CONFLICT (user_id, week_start)
  DO UPDATE SET
    score          = EXCLUDED.score,
    gigs_completed = EXCLUDED.gigs_completed,
    earnings_kobo  = EXCLUDED.earnings_kobo;

  -- Update ranks per campus
  WITH ranked AS (
    SELECT id, user_id, campus,
           ROW_NUMBER() OVER (PARTITION BY campus ORDER BY score DESC) AS rn
    FROM leaderboard_weekly
    WHERE week_start = v_week_start
  )
  UPDATE leaderboard_weekly lw
  SET rank = r.rn
  FROM ranked r
  WHERE lw.id = r.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-release escrow after 48h of no poster response on 'submitted' gigs
CREATE OR REPLACE FUNCTION auto_release_escrow()
RETURNS VOID AS $$
DECLARE
  rec RECORD;
  v_doer_earns BIGINT;
  v_ref TEXT;
BEGIN
  FOR rec IN
    SELECT * FROM gigs
    WHERE status = 'submitted'
    AND updated_at < NOW() - INTERVAL '48 hours'
  LOOP
    v_doer_earns := ROUND(rec.budget * 0.905); -- 8% platform + 1.5% escrow
    v_ref := 'GRD-AUTO-RELEASE-' || rec.id;

    UPDATE gigs SET status = 'completed' WHERE id = rec.id;

    INSERT INTO transactions (user_id, amount, reference, type, status, description)
    VALUES (rec.doer_id, v_doer_earns, v_ref, 'escrow_release', 'success',
            'Auto-released after 48h: ' || rec.title)
    ON CONFLICT (reference) DO NOTHING;

    PERFORM increment_wallet_balance(rec.doer_id, v_doer_earns);
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update streak when a gig is completed
CREATE OR REPLACE FUNCTION update_streak_on_gig_complete(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_last_date DATE;
  v_streak    INT;
BEGIN
  SELECT streak_last_gig_date, streak_count
  INTO v_last_date, v_streak
  FROM users WHERE id = p_user_id;

  IF v_last_date IS NULL OR v_last_date < CURRENT_DATE - INTERVAL '7 days' THEN
    -- Reset streak (missed a week)
    UPDATE users SET
      streak_count       = 1,
      streak_last_gig_date = CURRENT_DATE,
      streak_broken_at   = CASE WHEN v_last_date IS NOT NULL THEN CURRENT_DATE ELSE NULL END,
      updated_at         = NOW()
    WHERE id = p_user_id;
  ELSIF v_last_date < CURRENT_DATE THEN
    -- Extend streak
    UPDATE users SET
      streak_count       = streak_count + 1,
      streak_last_gig_date = CURRENT_DATE,
      streak_broken_at   = NULL,
      updated_at         = NOW()
    WHERE id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
