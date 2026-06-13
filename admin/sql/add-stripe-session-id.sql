-- Migration: add stripe_session_id to merch_orders
-- Run this in the Supabase SQL Editor after the Edge Function is deployed.
-- This column stores the Stripe Checkout Session ID so orders can be
-- reconciled against Stripe payments.

ALTER TABLE public.merch_orders
  ADD COLUMN IF NOT EXISTS stripe_session_id TEXT
    CHECK (stripe_session_id IS NULL OR length(trim(stripe_session_id)) <= 255);

-- Index for fast lookup by session id (e.g. from webhook or admin)
CREATE INDEX IF NOT EXISTS idx_merch_orders_stripe_session
  ON public.merch_orders (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

-- NOTE: The create-merch-checkout Edge Function does NOT write stripe_session_id
-- back to the row because the anon key only has INSERT permission, not UPDATE.
-- To store the session ID, use a Stripe webhook (payment_intent.succeeded or
-- checkout.session.completed) running as a service-role function.
-- This column is here for future use and for manual admin reconciliation.
