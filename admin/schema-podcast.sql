-- ============================================================
--  Hope Signal Podcast — Launch Interest List
--  Run once in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS podcast_interest (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE podcast_interest ENABLE ROW LEVEL SECURITY;

-- Anyone can sign up; only admins can read the list
DROP POLICY IF EXISTS "podcast_interest_public_insert" ON podcast_interest;
DROP POLICY IF EXISTS "podcast_interest_auth_select"   ON podcast_interest;

CREATE POLICY "podcast_interest_public_insert"
  ON podcast_interest FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "podcast_interest_auth_select"
  ON podcast_interest FOR SELECT
  USING (auth.role() = 'authenticated');
