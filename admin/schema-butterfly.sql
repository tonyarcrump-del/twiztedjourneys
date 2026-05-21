-- ============================================================
--  Zach's Butterflies — QR Charm Tracking Schema
--  Run once in Supabase SQL Editor
--  Safe to re-run: uses IF NOT EXISTS + DROP POLICY IF EXISTS
-- ============================================================

-- ----------------------------------------------------------
-- TABLE: butterflies
--   Admin-managed catalog. Each row = one physical butterfly/
--   charm with a unique QR code.
--   The "code" column is the short ID printed on the item
--   (e.g. "ZB-001") and used as the ?id= URL param.
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS butterflies (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT UNIQUE NOT NULL,          -- e.g. "ZB-001"
  name        TEXT NOT NULL,                 -- display name shown on tracking page
  in_memory_of TEXT,                         -- optional memorial name
  description TEXT,                          -- short backstory / mission note
  released_at TIMESTAMPTZ DEFAULT NOW(),
  released_by TEXT,                          -- who released it into the world
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------
-- TABLE: butterfly_sightings
--   Public log. Anyone who scans a QR can add a sighting.
--   No login required.
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS butterfly_sightings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  butterfly_id  UUID NOT NULL REFERENCES butterflies(id) ON DELETE CASCADE,
  finder_name   TEXT NOT NULL DEFAULT 'Anonymous',
  location      TEXT NOT NULL,               -- city/state or place description
  message       TEXT,                        -- personal note from the finder
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------
-- RLS
-- ----------------------------------------------------------
ALTER TABLE butterflies        ENABLE ROW LEVEL SECURITY;
ALTER TABLE butterfly_sightings ENABLE ROW LEVEL SECURITY;

-- butterflies: anyone can read, only authenticated admins can manage
DROP POLICY IF EXISTS "butterflies_public_select"  ON butterflies;
DROP POLICY IF EXISTS "butterflies_auth_all"        ON butterflies;

CREATE POLICY "butterflies_public_select"
  ON butterflies FOR SELECT USING (is_active = TRUE);

CREATE POLICY "butterflies_auth_all"
  ON butterflies FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- sightings: anyone can read or insert, auth can delete
DROP POLICY IF EXISTS "sightings_public_select" ON butterfly_sightings;
DROP POLICY IF EXISTS "sightings_public_insert" ON butterfly_sightings;
DROP POLICY IF EXISTS "sightings_auth_delete"   ON butterfly_sightings;

CREATE POLICY "sightings_public_select"
  ON butterfly_sightings FOR SELECT USING (TRUE);

CREATE POLICY "sightings_public_insert"
  ON butterfly_sightings FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "sightings_auth_delete"
  ON butterfly_sightings FOR DELETE
  USING (auth.role() = 'authenticated');

-- ----------------------------------------------------------
-- SEED: a starter butterfly so the page isn't empty
-- ----------------------------------------------------------
INSERT INTO butterflies (code, name, in_memory_of, description, released_by)
VALUES (
  'ZB-001',
  'Zach''s Butterfly #1',
  'In memory of Zach',
  'This butterfly was released into the world to carry hope, awareness, and remembrance. Each person who receives it is asked to pass it forward — and to leave a note about where it''s been.',
  'Twizted Journeys'
)
ON CONFLICT (code) DO NOTHING;
