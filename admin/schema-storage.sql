-- ============================================================
--  schema-storage.sql — Supabase Storage buckets for TJ Media
-- ============================================================
--
--  Run this in: supabase.com → your project → SQL Editor
--
--  Creates two public storage buckets and sets RLS policies so:
--    • Anyone can view/read images (public site access)
--    • Only authenticated admins can upload or delete
--
--  After running, go to Storage in the Supabase dashboard to
--  confirm the buckets appear. Then use the Media Library in
--  the admin panel to upload images.
-- ============================================================

-- 1. Create the buckets (idempotent — safe to re-run)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'site-media',
    'site-media',
    TRUE,
    10485760,   -- 10 MB max per file
    ARRAY['image/jpeg','image/png','image/webp','image/gif','image/svg+xml']
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'product-photos',
    'product-photos',
    TRUE,
    10485760,   -- 10 MB max per file
    ARRAY['image/jpeg','image/png','image/webp','image/gif','image/svg+xml']
  )
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 2. RLS Policies — site-media bucket (drop first so re-runs work)
-- ============================================================
DROP POLICY IF EXISTS "site-media: public read"  ON storage.objects;
DROP POLICY IF EXISTS "site-media: auth upload"  ON storage.objects;
DROP POLICY IF EXISTS "site-media: auth delete"  ON storage.objects;
DROP POLICY IF EXISTS "site-media: auth update"  ON storage.objects;

-- Allow anyone to read/view images (needed for public site)
CREATE POLICY "site-media: public read"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'site-media' );

-- Only authenticated users can upload
CREATE POLICY "site-media: auth upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'site-media'
    AND auth.role() = 'authenticated'
  );

-- Only authenticated users can delete
CREATE POLICY "site-media: auth delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'site-media'
    AND auth.role() = 'authenticated'
  );

-- Only authenticated users can update/replace
CREATE POLICY "site-media: auth update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'site-media'
    AND auth.role() = 'authenticated'
  );


-- ============================================================
-- 3. RLS Policies — product-photos bucket (drop first so re-runs work)
-- ============================================================
DROP POLICY IF EXISTS "product-photos: public read"  ON storage.objects;
DROP POLICY IF EXISTS "product-photos: auth upload"  ON storage.objects;
DROP POLICY IF EXISTS "product-photos: auth delete"  ON storage.objects;
DROP POLICY IF EXISTS "product-photos: auth update"  ON storage.objects;

-- Allow anyone to read/view product images
CREATE POLICY "product-photos: public read"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'product-photos' );

-- Only authenticated users can upload
CREATE POLICY "product-photos: auth upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-photos'
    AND auth.role() = 'authenticated'
  );

-- Only authenticated users can delete
CREATE POLICY "product-photos: auth delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-photos'
    AND auth.role() = 'authenticated'
  );

-- Only authenticated users can update/replace
CREATE POLICY "product-photos: auth update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-photos'
    AND auth.role() = 'authenticated'
  );


-- ============================================================
-- Done! After running:
--   1. Go to supabase.com → Storage — confirm both buckets appear
--   2. Log in to admin panel → Media Library
--   3. Upload a test image and verify you get a public URL back
-- ============================================================
