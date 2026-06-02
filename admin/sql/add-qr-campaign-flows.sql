-- ============================================================================
-- Twizted Journeys — QR Campaign Flows SQL Migration
-- File: admin/sql/add-qr-campaign-flows.sql
-- ============================================================================
-- Run this in the Supabase SQL Editor (supabase.com → your project → SQL Editor).
-- This migration adds tables for the Twizted Treasure Tracker and Pause Spinner
-- Check-In QR campaigns. It does NOT modify any existing tables.
--
-- BEFORE RUNNING:
--   1. Log in to supabase.com and select your Twizted Journeys project.
--   2. Open the SQL Editor tab.
--   3. Paste this entire file and click "Run".
--   4. Verify both tables appear under Database → Tables.
--
-- NOTE: This file does not run automatically. It must be executed manually.
-- ============================================================================


-- ─── TABLE: treasure_checkins ────────────────────────────────────────────────
-- Stores public check-in submissions from twizted-treasure-checkin.html.
-- People scan the Twizted Treasure Tracker QR and share where a treasure found them.
-- Submissions are NOT publicly readable — only authenticated admins can read them.

CREATE TABLE IF NOT EXISTS treasure_checkins (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname    TEXT        NOT NULL,
  city        TEXT        NOT NULL,
  state       TEXT        NOT NULL,
  item_type   TEXT,                         -- charm, stone, tag, shirt, etc.
  message     TEXT,                         -- optional personal note
  email       TEXT,                         -- optional, not published
  source      TEXT        NOT NULL DEFAULT 'treasure-checkin',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for admin queries sorted by date
CREATE INDEX IF NOT EXISTS idx_treasure_checkins_created
  ON treasure_checkins (created_at DESC);

-- RLS: public can INSERT (submit check-ins), but cannot SELECT
-- Only authenticated admins can read submissions
ALTER TABLE treasure_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a treasure check-in"
  ON treasure_checkins FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read treasure check-ins"
  ON treasure_checkins FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage treasure check-ins"
  ON treasure_checkins FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');


-- ─── TABLE: spinner_checkins ─────────────────────────────────────────────────
-- Stores check-in submissions from pause-spinner-checkin.html.
-- Repeated-use check-in for the three fidget spinners at the physical therapy location.
-- This is NOT a clinical or medical record. It is a simple community engagement tool.
-- Submissions are NOT publicly readable — only authenticated admins can read them.

CREATE TABLE IF NOT EXISTS spinner_checkins (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname        TEXT        NOT NULL,
  spinner_id      TEXT,                         -- spinner number, color, or identifier
  feeling_before  TEXT,                         -- how they felt before using it (non-clinical dropdown)
  feeling_after   TEXT,                         -- how they felt after using it (non-clinical dropdown)
  note            TEXT,                         -- optional free-text note
  source          TEXT        NOT NULL DEFAULT 'spinner-checkin',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for admin queries sorted by date
CREATE INDEX IF NOT EXISTS idx_spinner_checkins_created
  ON spinner_checkins (created_at DESC);

-- RLS: public can INSERT, cannot SELECT
ALTER TABLE spinner_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a spinner check-in"
  ON spinner_checkins FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read spinner check-ins"
  ON spinner_checkins FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage spinner check-ins"
  ON spinner_checkins FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');


-- ─── VERIFY ──────────────────────────────────────────────────────────────────
-- After running, verify with:
--   SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public'
--   AND table_name IN ('treasure_checkins', 'spinner_checkins');
--
-- Expected result: 2 rows.
-- ============================================================================
