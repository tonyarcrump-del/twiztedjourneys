-- ============================================================
-- add-crystal-heart-products.sql
-- Upserts Crystal Heart Pocket Stones into shop_products.
--
-- Safe to run multiple times (ON CONFLICT DO UPDATE).
-- Does NOT include any API keys, secrets, or passwords.
-- Run this in the Supabase SQL Editor for the TJ project.
--
-- Column reference: admin/schema.sql → shop_products
--   price_cents  INTEGER  (display only — 300 = $3.00)
--   category     TEXT CHECK IN ('charm','apparel','accessory',
--                               'awareness','bundle','other')
-- ============================================================

INSERT INTO shop_products
  (sku, name, description, category, price_cents, image_url, sort_order)
VALUES
  (
    'HOC',
    'Orange Howlite Heart',
    'Bright orange coloring paired with dark veining creates a bold and energetic look. A striking pocket stone that carries the warmth and vitality of its natural hues.',
    'awareness',
    300,
    'images/merch/clean/hoc-orange-howlite-heart-clean.png',
    60
  ),
  (
    'HOWC',
    'Orange Imperial Jasper Heart',
    'Warm orange tones mixed with cream and brown matrix patterns create a beautiful natural design. Each piece is a unique expression of stone artistry.',
    'awareness',
    300,
    'images/merch/clean/howc-orange-imperial-jasper-heart-clean.png',
    61
  ),
  (
    'HO',
    'Orange Aventurine Heart',
    'A smooth, warm-toned heart displaying natural orange hues and subtle shimmer. Orange Aventurine is often associated with creativity, enthusiasm, and positive energy.',
    'awareness',
    300,
    'images/merch/clean/ho-orange-aventurine-heart-clean.png',
    62
  ),
  (
    'HPBC',
    'Pink Brecciated Jasper Heart',
    'A vibrant pink heart accented with natural matrix patterns throughout the stone. Pink Brecciated Jasper is associated with strength, vitality, and gentle healing energy.',
    'awareness',
    300,
    'images/merch/clean/hpbc-pink-brecciated-jasper-heart-clean.png',
    63
  ),
  (
    'HPC',
    'Pink Howlite Heart',
    'Featuring bold pink tones and delicate dark veining, this heart combines beauty and serenity. Howlite is often associated with calming energy, patience, and reducing stress.',
    'awareness',
    300,
    'images/merch/clean/hpc-pink-howlite-heart-clean.png',
    64
  ),
  (
    'HPC2',
    'Pink Composite Jasper Heart',
    'Bright pink tones with natural-looking matrix patterns create a bold and cheerful piece. A joyful pocket stone full of color and character.',
    'awareness',
    300,
    'images/merch/clean/hpc2-pink-composite-jasper-heart-clean.png',
    65
  ),
  (
    'HA',
    'Rainbow Mosaic Heart',
    'Bright, colorful, and playful, each heart features a unique blend of vibrant colors. A celebration of diversity and joy, no two pieces are alike.',
    'awareness',
    300,
    'images/merch/clean/ha-rainbow-mosaic-heart-clean.png',
    66
  )
ON CONFLICT (sku) DO UPDATE SET
  name         = EXCLUDED.name,
  description  = EXCLUDED.description,
  category     = EXCLUDED.category,
  price_cents  = EXCLUDED.price_cents,
  image_url    = EXCLUDED.image_url,
  sort_order   = EXCLUDED.sort_order,
  updated_at   = NOW();
