-- Twizted Journeys merch order capture
-- Run this in the Supabase SQL Editor before publishing the merch order form.
-- This stores order details only. It does not collect payment details.
--
-- Security posture:
-- - Public website users can INSERT new orders only.
-- - Public/anon users cannot SELECT, UPDATE, or DELETE orders.
-- - Submitted orders are forced to payment_status='pending',
--   order_status='new', and source='merch-page' before insert.
-- - Admin read/update policies are intentionally not added here until an
--   admin-only auth role/claim is confirmed for customer PII access.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.merch_orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_code        TEXT NOT NULL CHECK (length(trim(item_code)) BETWEEN 1 AND 80),
  item_name        TEXT NOT NULL CHECK (length(trim(item_name)) BETWEEN 1 AND 200),
  price_label      TEXT CHECK (price_label IS NULL OR length(trim(price_label)) <= 80),
  quantity         INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0 AND quantity <= 99),
  customer_name    TEXT NOT NULL CHECK (length(trim(customer_name)) BETWEEN 1 AND 160),
  customer_email   TEXT NOT NULL CHECK (
                     length(trim(customer_email)) BETWEEN 3 AND 254
                     AND customer_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
                   ),
  customer_phone   TEXT CHECK (customer_phone IS NULL OR length(trim(customer_phone)) <= 40),
  shipping_address TEXT NOT NULL CHECK (length(trim(shipping_address)) BETWEEN 5 AND 1000),
  notes            TEXT CHECK (notes IS NULL OR length(trim(notes)) <= 2000),
  payment_status   TEXT NOT NULL DEFAULT 'pending'
                   CHECK (payment_status IN ('pending','paid','failed','refunded','cancelled')),
  order_status     TEXT NOT NULL DEFAULT 'new'
                   CHECK (order_status IN ('new','contacted','awaiting_payment','paid','fulfilled','cancelled')),
  source           TEXT NOT NULL DEFAULT 'merch-page',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_merch_orders_created_at
  ON public.merch_orders (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_merch_orders_status
  ON public.merch_orders (order_status, payment_status);

ALTER TABLE public.merch_orders
  ALTER COLUMN quantity SET DEFAULT 1,
  ALTER COLUMN payment_status SET DEFAULT 'pending',
  ALTER COLUMN order_status SET DEFAULT 'new',
  ALTER COLUMN source SET DEFAULT 'merch-page';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'merch_orders_quantity_safe'
      AND conrelid = 'public.merch_orders'::regclass
  ) THEN
    ALTER TABLE public.merch_orders
      ADD CONSTRAINT merch_orders_quantity_safe CHECK (quantity > 0 AND quantity <= 99);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'merch_orders_insert_defaults_safe'
      AND conrelid = 'public.merch_orders'::regclass
  ) THEN
    ALTER TABLE public.merch_orders
      ADD CONSTRAINT merch_orders_insert_defaults_safe
      CHECK (
        payment_status IN ('pending','paid','failed','refunded','cancelled')
        AND order_status IN ('new','contacted','awaiting_payment','paid','fulfilled','cancelled')
        AND length(trim(source)) BETWEEN 1 AND 80
      );
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.force_merch_order_insert_defaults()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.payment_status := 'pending';
  NEW.order_status := 'new';
  NEW.source := 'merch-page';
  NEW.created_at := COALESCE(NEW.created_at, NOW());
  NEW.updated_at := COALESCE(NEW.updated_at, NOW());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_merch_orders_force_insert_defaults ON public.merch_orders;
CREATE TRIGGER trg_merch_orders_force_insert_defaults
  BEFORE INSERT ON public.merch_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.force_merch_order_insert_defaults();

CREATE OR REPLACE FUNCTION public.update_merch_orders_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_merch_orders_updated_at ON public.merch_orders;
CREATE TRIGGER trg_merch_orders_updated_at
  BEFORE UPDATE ON public.merch_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_merch_orders_updated_at();

ALTER TABLE public.merch_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "merch_orders: public insert" ON public.merch_orders;
CREATE POLICY "merch_orders: public insert"
  ON public.merch_orders
  FOR INSERT
  TO anon
  WITH CHECK (
    payment_status = 'pending'
    AND order_status = 'new'
    AND source = 'merch-page'
    AND quantity > 0
    AND quantity <= 99
  );

-- Remove older broad policies if this file is re-run after a previous version.
DROP POLICY IF EXISTS "merch_orders: auth select" ON public.merch_orders;
DROP POLICY IF EXISTS "merch_orders: auth update" ON public.merch_orders;

REVOKE ALL ON TABLE public.merch_orders FROM anon, authenticated;
GRANT INSERT ON TABLE public.merch_orders TO anon;
