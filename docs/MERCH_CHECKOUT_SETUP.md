# Merch Checkout Setup — Twizted Journeys
*Last updated: June 2026 · Maintained by NoCapsAI*

Stripe Checkout for merch orders is powered by a **Supabase Edge Function**
(`create-merch-checkout`). The frontend saves the order to Supabase first,
then calls this function to get a Stripe Checkout Session URL, then
redirects the customer to Stripe. No Stripe keys ever touch a frontend file.

---

## Architecture at a glance

```
Customer clicks Order Now
  → Modal opens, item data prefilled
  → Customer fills form, clicks "Save & Pay"
  → js/merch-orders.js saves row to Supabase merch_orders (payment_status='pending')
  → Calls POST supabase.co/functions/v1/create-merch-checkout
      (sends: order_id, item_code, item_name, quantity, customer_email, price_label, amount_cents)
  → Edge Function validates amount server-side, calls Stripe API with secret key
  → Returns { checkout_url }
  → Browser redirects to Stripe Checkout
  → Customer pays
  → Stripe redirects to merch-payment-success.html?order_id=...&session_id=...
```

---

## 1. Prerequisites

| Tool | Install |
|------|---------|
| Node.js 18+ | https://nodejs.org |
| Supabase CLI | `npm install -g supabase` |
| Deno (optional for local function dev) | https://deno.land |

---

## 2. Set the Stripe secret key in Supabase

**This is the only step that touches a real secret.**

### Option A — Supabase Dashboard (easiest)

1. Go to [supabase.com](https://supabase.com) → your project
2. Click **Edge Functions** in the left sidebar
3. Click **Secrets** (or **Manage secrets**)
4. Click **New secret**
5. Name: `STRIPE_SECRET_KEY`
6. Value: your Stripe secret key (your Stripe secret key from Stripe Dashboard)
7. Save

### Option B — Supabase CLI

```bash
supabase secrets set STRIPE_SECRET_KEY=<YOUR_STRIPE_SECRET_KEY> \
  --project-ref ypzmckccroiffhtoofgr
```

> **Never paste your secret key into any file in this repo.**

---

## 3. Deploy the Edge Function

```bash
# From the repo root (C:\Projects\twiztedjourneys-official)
supabase functions deploy create-merch-checkout \
  --project-ref ypzmckccroiffhtoofgr
```

Your project ref is `ypzmckccroiffhtoofgr` (from `js/tj-public-config.js`).

After deploying, the function is live at:
```
https://ypzmckccroiffhtoofgr.supabase.co/functions/v1/create-merch-checkout
```

`js/merch-orders.js` builds this URL automatically from `TJ_PUBLIC_CONFIG.supabaseUrl`.
No additional config file changes are needed.

---

## 4. Run the SQL migration

In the Supabase SQL Editor, run:
```
admin/sql/add-stripe-session-id.sql
```

This adds a `stripe_session_id` column to `merch_orders` for future
Stripe webhook reconciliation. It is safe to run; it uses `ADD COLUMN IF NOT EXISTS`.

---

## 5. Configure Stripe success/cancel URLs

The Edge Function uses these redirect URLs:

| Event | URL |
|-------|-----|
| Payment success | `https://twiztedjourneys.org/merch-payment-success.html?order_id=...&session_id=...` |
| Payment cancelled | `https://twiztedjourneys.org/merch.html?order_cancelled=1#merch-order-modal` |

No Stripe dashboard config is required for these — they are set programmatically
in the checkout session. However, in your Stripe Dashboard you should:

1. Go to **Stripe Dashboard → Settings → Checkout → Client-only integration** (if using)
2. Ensure your domain `twiztedjourneys.org` is added to allowed redirect domains
   (Stripe may require this for production)

---

## 6. Local test steps

### Quick test (no Deno required)

1. Start local server:
   ```bash
   cd C:\Projects\twiztedjourneys-official
   python -m http.server 8080
   ```
2. Open `http://localhost:8080/merch.html`
3. Click any **Order Now** with a real price (e.g., Lapis Lazuli Mushroom Set — $3 each)
4. Fill in the order form and click **Save & Pay**
5. Because the Edge Function is deployed on Supabase (not localhost), the
   frontend will call the live function URL. You should be redirected to Stripe Checkout.
6. Use Stripe test card: `4242 4242 4242 4242` · any future expiry · any CVC
7. After payment, you should land on `merch-payment-success.html`

### Test "Price coming soon" items

1. Click **Order Now** on HP2–HP11 (the hat pins — "Price coming soon")
2. Fill form, click **Save & Pay**
3. Expected: order saves to Supabase, modal shows inquiry-received message, **no** Stripe redirect

### Verify order in Supabase

1. Go to supabase.com → your project → **Table Editor** → `merch_orders`
2. Confirm new row with correct `item_code`, `customer_email`, `quantity`
3. For paid orders: `payment_status` will still show `pending` until a webhook updates it
   (see section 7 below)

### Test Stripe metadata

1. In the Stripe Dashboard → **Payments** (test mode)
2. Click the payment → **Metadata** tab
3. Confirm: `order_id`, `item_code`, `item_name`, `quantity`, `source`

---

## 7. Production readiness — what's still needed

### Stripe webhook (recommended, not required for launch)

Right now, after a successful Stripe payment, `payment_status` in `merch_orders`
stays `pending`. To auto-update it to `paid`, set up a Stripe webhook:

1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**
2. URL: `https://ypzmckccroiffhtoofgr.supabase.co/functions/v1/stripe-merch-webhook`
   *(this is a second Edge Function you would write later)*
3. Event: `checkout.session.completed`
4. In the webhook function, read `metadata.order_id` and UPDATE `merch_orders`
   set `payment_status='paid'`, `order_status='awaiting_payment'` where `id = order_id`
   (this needs `service_role` key, not `anon`)

For MVP launch, Tonya can manually mark orders paid in Supabase Table Editor.

### Email confirmation

Add a Supabase trigger or a second Edge Function on INSERT to `merch_orders`
to send a confirmation email via Resend or SendGrid.

---

## 8. Pricing reference

| Item / label | Pricing rule |
|---|---|
| `$9.99 each` | $9.99 × quantity |
| `$17.99` | $17.99 × quantity |
| `$19.99` | $19.99 × quantity |
| `$24.99 each` | $24.99 × quantity |
| `$29.99` | $29.99 × quantity |
| `$32.99` | $32.99 × quantity |
| `$3 each · 2 for $5` | pairs × $5.00 + leftover × $3.00 |
| `Price coming soon` | Save inquiry only, no Stripe redirect |

The pricing logic lives in both `js/merch-orders.js` (frontend, for display)
and `supabase/functions/create-merch-checkout/index.ts` (server-side, for
Stripe charge validation). Both must stay in sync if prices change.

---

## 9. File map

| File | Purpose |
|------|---------|
| `js/merch-orders.js` | Modal logic, pricing calc, Supabase insert, Edge Function call |
| `supabase/functions/create-merch-checkout/index.ts` | Edge Function: validates amount, creates Stripe session |
| `merch-payment-success.html` | Post-payment thank-you page |
| `admin/sql/create-merch-orders.sql` | Original table creation (already run) |
| `admin/sql/add-stripe-session-id.sql` | Migration: adds `stripe_session_id` column |
| `supabase/config.toml` | Supabase CLI project config |
| `supabase/functions/.env.example` | Local dev secret template (never commit real `.env`) |
