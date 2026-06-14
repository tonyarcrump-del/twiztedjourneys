-- Run manually in the Supabase SQL Editor.
-- Hat pins are $3 each / 2 for $5.
-- This only updates admin inventory visibility/pricing.
-- It does not change checkout backend.

UPDATE public.shop_products
SET
  price_cents = 300,
  is_hidden = false,
  updated_at = now()
WHERE sku IN ('HP2','HP3','HP4','HP5','HP6','HP7','HP8','HP9','HP10','HP11');
