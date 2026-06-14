-- Twizted Journeys admin merch order access
-- ============================================================
-- Run this manually in the Supabase SQL Editor after confirming
-- that authenticated users in this project are trusted admins.
--
-- Purpose:
-- - Keep public/anonymous merch order INSERT working.
-- - Keep anonymous SELECT/UPDATE/DELETE blocked.
-- - Let authenticated admin users view merch_orders in admin/shop.html.
-- - Let authenticated admin users update ONLY order_status.
-- - Do not allow deleting orders from the admin panel.
--
-- This file does not contain service_role keys, Stripe secrets, or
-- Supabase keys.

ALTER TABLE public.merch_orders ENABLE ROW LEVEL SECURITY;

-- Preserve the existing public order-capture path.
-- This intentionally allows anonymous INSERT only when the submitted row
-- is still a new pending merch-page order.
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

-- Remove older broad authenticated policies before installing the narrower
-- admin view/update policies below.
DROP POLICY IF EXISTS "merch_orders: auth select" ON public.merch_orders;
DROP POLICY IF EXISTS "merch_orders: auth update" ON public.merch_orders;
DROP POLICY IF EXISTS "merch_orders: admin select" ON public.merch_orders;
DROP POLICY IF EXISTS "merch_orders: admin update order_status" ON public.merch_orders;

-- Lock down table privileges first, then grant only the minimum needed.
REVOKE ALL ON TABLE public.merch_orders FROM anon, authenticated;

-- Public checkout/order capture still needs insert.
GRANT INSERT ON TABLE public.merch_orders TO anon;

-- Admin panel needs to display customer/order details.
-- IMPORTANT: This assumes only trusted admin users can sign in to Supabase
-- Auth for this project. If Supabase Auth is opened to non-admin users later,
-- replace auth.role() = 'authenticated' with an admin claim/email allowlist.
GRANT SELECT ON TABLE public.merch_orders TO authenticated;

CREATE POLICY "merch_orders: admin select"
  ON public.merch_orders
  FOR SELECT
  TO authenticated
  USING (auth.role() = 'authenticated');

-- Admin panel may update order_status only.
-- RLS controls which rows can be updated; column-level GRANT controls which
-- columns can be updated. Do not grant table-wide UPDATE here.
GRANT UPDATE (order_status) ON TABLE public.merch_orders TO authenticated;

CREATE POLICY "merch_orders: admin update order_status"
  ON public.merch_orders
  FOR UPDATE
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (
    auth.role() = 'authenticated'
    AND order_status IN (
      'new',
      'contacted',
      'awaiting_payment',
      'paid',
      'fulfilled',
      'cancelled'
    )
  );

-- No DELETE grant and no DELETE policy are created.
-- No anonymous SELECT grant or SELECT policy is created.
--
-- Optional hardening for a future multi-user Auth setup:
-- Replace both auth.role() checks above with a stricter predicate such as:
--   auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
-- after adding that claim to admin users.
