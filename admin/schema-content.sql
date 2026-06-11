-- ─────────────────────────────────────────────────────────────────────────────
-- schema-content.sql — Twizted Journeys
-- Run this in: Supabase → SQL Editor → New Query → paste → Run
--
-- This creates the site_content key/value table that powers the admin
-- content editor (admin/content.html). Values appear live on the public site.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS site_content (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update timestamp on any change
CREATE OR REPLACE FUNCTION update_site_content_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_site_content_updated ON site_content;
CREATE TRIGGER trg_site_content_updated
  BEFORE UPDATE ON site_content
  FOR EACH ROW EXECUTE FUNCTION update_site_content_updated_at();

-- Row-Level Security
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Public can read all content (used by public site to fetch dynamic text)
CREATE POLICY "Public can read site content"
  ON site_content FOR SELECT
  USING (TRUE);

-- Only authenticated admins can insert / update / delete
CREATE POLICY "Authenticated admins can write site content"
  ON site_content FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');


-- ─── Seed default values ──────────────────────────────────────────────────────
-- These are defaults so the site has content before Tonya edits anything.
-- Edit freely — all values can be overwritten from admin/content.html.

INSERT INTO site_content (key, value) VALUES
  -- Announcement banner
  ('announcement_text',   'Welcome to Twizted Journeys — Indiana''s suicide awareness and grief support community. 💜'),
  ('announcement_type',   'info'),
  ('announcement_active', 'false'),
  ('announcement_link',   ''),

  -- Homepage hero
  ('home_headline',    'Hope Rides. Grief Walks. Love Never Stops.'),
  ('home_subheadline', 'Twizted Journeys is a grief support and suicide awareness nonprofit serving Shelby County and surrounding Indiana communities.'),
  ('home_mission',     'We believe no one should grieve alone. Through community, creativity, and action — we turn loss into legacy.'),
  ('home_cta_text',    'RSVP for Light Up the Night →'),
  ('home_cta_url',     'events.html'),

  -- About / story
  ('home_about', 'Twizted Journeys was founded by Tonya Crump after losing her son to suicide. What began as a personal journey through grief grew into a community of riders, walkers, artists, and advocates — all united by love and the belief that mental health matters.'),
  ('home_quote', '"I started Twizted Journeys because I needed a place where grief was allowed to exist." — Tonya Crump'),

  -- 988 crisis line
  ('home_988', 'If you or someone you know is struggling, help is available 24/7. Call or text 988.'),

  -- Event details
  ('event_name',        'Light Up the Night 2026'),
  ('event_dates',       'September 12–13, 2026'),
  ('event_location',    ''),
  ('event_address',     ''),
  ('event_description', 'Light Up the Night kicks off Twizted Journeys'' September awareness weekend on Sept. 12, followed by The Cause Walk on Sept. 13. Riders, walkers, vendors, volunteers, and the whole community are welcome.'),
  ('event_day1',        'Sept 12 — Light Up the Night (evening)'),
  ('event_day2',        'Sept 13 — The Cause Walk (daytime)'),

  -- RSVP settings
  ('event_rsvp_open',       'true'),
  ('event_rsvp_closed_msg', 'Registration opens in spring 2026 — check back soon!'),
  ('event_rsvp_confirm',    'Thank you for registering! We''ll email you details closer to the event. 💜'),

  -- RSVP registration types
  ('rsvp_type_attendee',  'true'),
  ('rsvp_type_rider',     'true'),
  ('rsvp_type_walker',    'true'),
  ('rsvp_type_vendor',    'true'),
  ('rsvp_type_volunteer', 'true'),

  -- Social links
  ('social_facebook',  'https://www.facebook.com/twiztedjourneys'),
  ('social_instagram', ''),
  ('social_tiktok',    ''),
  ('social_youtube',   ''),

  -- Contact & donation
  ('contact_email', 'tonyarcrump@gmail.com'),
  ('donate_url',    'https://shop.twiztedjourneys.org/donations-matter'),
  ('shop_url',      'https://shop.twiztedjourneys.org/twizted-merch'),
  ('contact_phone', ''),

  -- Footer
  ('footer_tagline', 'Turning loss into legacy — one journey at a time.'),
  ('footer_legal',   'Twizted Journeys is a registered 501(c)(3) nonprofit in Indiana.')

ON CONFLICT (key) DO NOTHING;
-- ↑ Safe to re-run: existing values are never overwritten by this seed.
