# Merch Catalog Admin Notes

The public `merch.html` catalog is currently hard-coded in the page. It does not read from `public.shop_products` yet.

The admin inventory view uses `public.shop_products`, so the admin catalog must be seeded separately from the public page. Run `admin/sql/seed-full-merch-catalog.sql` manually in the Supabase SQL Editor to add the current public merch catalog to Tonya's admin inventory.

This seed is for admin inventory visibility only. It does not change `merch.html`, checkout behavior, payment settings, shipping settings, or Edge Functions.

Pins that are listed on the public page as "Price coming soon" are seeded with `price_cents = 0` and hidden by default on first insert. Existing rows keep their inventory counts on re-run.

Recommended future project: make `public.shop_products` the single source of truth for public merch rendering so Tonya can manage the catalog in one place.
