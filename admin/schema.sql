-- Twizted Journeys — New Admin Tables
-- Run this SQL in your Supabase SQL Editor AFTER the existing TJ_Story_System schema.sql
-- These tables EXTEND the existing project. Do not re-run the original schema.sql.
-- =====================================================================================

-- ─── TABLE: shop_products ────────────────────────────────────────────────────────────
-- Controls what appears on the public Shop page. Webador handles all checkout/payment.
-- Display only — this table is never involved in transactions.

CREATE TABLE IF NOT EXISTS shop_products (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku              TEXT NOT NULL UNIQUE,
  name             TEXT NOT NULL,
  description      TEXT,
  category         TEXT NOT NULL CHECK (category IN ('charm','apparel','accessory','awareness','bundle','other')),
  price_cents      INTEGER NOT NULL DEFAULT 0,   -- display only (Webador charges)
  webador_url      TEXT,                         -- link to the actual Webador product page
  image_url        TEXT,                         -- Supabase Storage URL or external CDN
  quantity_total   INTEGER NOT NULL DEFAULT 0,   -- units stocked
  quantity_sold    INTEGER NOT NULL DEFAULT 0,   -- updated manually after Webador sales
  quantity_held    INTEGER NOT NULL DEFAULT 0,   -- reserved (optional use)
  is_hidden        BOOLEAN NOT NULL DEFAULT FALSE,
  is_sold_out      BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order       INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Computed view for available quantity
CREATE OR REPLACE VIEW shop_products_with_available AS
  SELECT *,
    (quantity_total - quantity_sold - quantity_held) AS quantity_available
  FROM shop_products;

-- Auto-update updated_at on change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_shop_products_updated ON shop_products;
CREATE TRIGGER trg_shop_products_updated
  BEFORE UPDATE ON shop_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row-Level Security: public can read non-hidden products; only authenticated users can write
ALTER TABLE shop_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read visible products"
  ON shop_products FOR SELECT
  USING (is_hidden = FALSE);

CREATE POLICY "Authenticated users can manage products"
  ON shop_products FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');


-- ─── TABLE: event_registrations ──────────────────────────────────────────────────────
-- Stores RSVP form submissions from events.html (Netlify Forms webhook → Supabase, or direct)

CREATE TABLE IF NOT EXISTS event_registrations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_slug        TEXT NOT NULL DEFAULT 'sept-2026',  -- identifier for the event
  name              TEXT NOT NULL,
  email             TEXT NOT NULL,
  phone             TEXT,
  registration_type TEXT NOT NULL DEFAULT 'attendee'
                    CHECK (registration_type IN ('attendee','vendor','volunteer','rider','walker')),
  guests            TEXT DEFAULT '1',
  day1              BOOLEAN DEFAULT FALSE,  -- Sept 12 — Light Up the Night
  day2              BOOLEAN DEFAULT FALSE,  -- Sept 13 — The Cause Walk
  notes             TEXT,
  source            TEXT DEFAULT 'netlify-form',  -- how submission arrived
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: only authenticated admin can read registrations; no public reads
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read registrations"
  ON event_registrations FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow inserts from service role or authenticated"
  ON event_registrations FOR INSERT
  WITH CHECK (TRUE);  -- webhook inserts use service role; tighten if needed


-- ─── TABLE: memorial_submissions ─────────────────────────────────────────────────────
-- Stores memorial form submissions pending Tonya's review

CREATE TABLE IF NOT EXISTS memorial_submissions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,       -- submitter's name
  email          TEXT NOT NULL,       -- submitter's email
  loved_one_name TEXT,                -- name of the loved one being memorialized
  message        TEXT,               -- full message/details
  status         TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','approved','rejected','needs_edit')),
  reviewed_at    TIMESTAMPTZ,
  reviewed_by    TEXT,
  source         TEXT DEFAULT 'netlify-form',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE memorial_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage memorial submissions"
  ON memorial_submissions FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow public inserts"
  ON memorial_submissions FOR INSERT
  WITH CHECK (TRUE);

-- Also update story_submissions to add status/reviewed fields if not already there
-- (The existing TJ_Story_System may already have these — only run if missing)
-- ALTER TABLE story_submissions ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
--   CHECK (status IN ('pending','approved','rejected','needs_edit'));
-- ALTER TABLE story_submissions ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
-- ALTER TABLE story_submissions ADD COLUMN IF NOT EXISTS reviewed_by TEXT;


-- ─── STORAGE BUCKETS (run in Supabase dashboard → Storage → New bucket) ────────────
-- product-photos  — public bucket, for shop product images (Tonya's artwork)
-- memorial-media  — private bucket, for any media submitted with memorials

-- INSERT INTO storage.buckets (id, name, public)
--   VALUES ('product-photos', 'product-photos', TRUE)
--   ON CONFLICT DO NOTHING;

-- INSERT INTO storage.buckets (id, name, public)
--   VALUES ('memorial-media', 'memorial-media', FALSE)
--   ON CONFLICT DO NOTHING;
