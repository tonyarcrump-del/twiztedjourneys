-- ============================================================
--  Semicolon Charm Journey Tracker — Supabase Schema
--  Run once in Supabase SQL Editor
--  Safe to re-run: uses IF NOT EXISTS + DROP POLICY IF EXISTS
-- ============================================================

-- ----------------------------------------------------------
-- TABLE: charms
--   Admin-managed catalog. Each row = one physical semicolon
--   charm with a unique QR code.
--   "code" is the short ID on the item (e.g. "TJ-001") and
--   is used as the ?id= URL param on the tracking page.
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS charms (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code          TEXT UNIQUE NOT NULL,       -- e.g. "TJ-001"
  name          TEXT NOT NULL,              -- display name shown on tracking page
  in_memory_of  TEXT,                       -- optional memorial dedication
  description   TEXT,                       -- backstory / note
  released_at   TIMESTAMPTZ DEFAULT NOW(),
  released_by   TEXT,                       -- who first released it
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------
-- TABLE: charm_sightings
--   Public log. Anyone who scans a charm QR can add a stop.
--   No login required.
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS charm_sightings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  charm_id    UUID NOT NULL REFERENCES charms(id) ON DELETE CASCADE,
  finder_name TEXT NOT NULL DEFAULT 'Anonymous',
  location    TEXT NOT NULL,               -- city/state or place description
  message     TEXT,                        -- personal note from the finder
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------
-- RLS
-- ----------------------------------------------------------
ALTER TABLE charms         ENABLE ROW LEVEL SECURITY;
ALTER TABLE charm_sightings ENABLE ROW LEVEL SECURITY;

-- charms: anyone can read active charms; only admins can manage
DROP POLICY IF EXISTS "charms_public_select" ON charms;
DROP POLICY IF EXISTS "charms_auth_all"       ON charms;

CREATE POLICY "charms_public_select"
  ON charms FOR SELECT USING (is_active = TRUE);

CREATE POLICY "charms_auth_all"
  ON charms FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- sightings: public read + insert; auth can delete
DROP POLICY IF EXISTS "sightings_public_select" ON charm_sightings;
DROP POLICY IF EXISTS "sightings_public_insert" ON charm_sightings;
DROP POLICY IF EXISTS "sightings_auth_delete"   ON charm_sightings;

CREATE POLICY "sightings_public_select"
  ON charm_sightings FOR SELECT USING (TRUE);

CREATE POLICY "sightings_public_insert"
  ON charm_sightings FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "sightings_auth_delete"
  ON charm_sightings FOR DELETE
  USING (auth.role() = 'authenticated');

-- ----------------------------------------------------------
-- SEED: first charm so the page isn't empty on launch
-- ----------------------------------------------------------
INSERT INTO charms (code, name, in_memory_of, description, released_by)
VALUES (
  'TJ-001',
  'Semicolon Charm #1',
  NULL,
  'This charm was released into the world to carry hope, awareness, and connection. Each person who receives it is invited to log their stop and pass it forward to someone who needs a reminder: your story isn''t over.',
  'Twizted Journeys'
)
ON CONFLICT (code) DO NOTHING;
