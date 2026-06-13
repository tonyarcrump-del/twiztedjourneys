/**
 * create-merch-checkout — Supabase Edge Function
 * Twizted Journeys · Merch Stripe Checkout
 *
 * Security model:
 *   The charge amount is determined ENTIRELY by item_code looked up in
 *   ITEM_CATALOG on this server. The frontend's amount_cents and price_label
 *   fields are IGNORED for pricing — they are logged for debugging only.
 *   A tampered request cannot alter the Stripe charge amount.
 *
 * Required secret (Supabase Dashboard → Edge Functions → Secrets):
 *   STRIPE_SECRET_KEY  — Stripe secret key from Supabase Edge Function Secrets
 *
 * For local dev, copy supabase/functions/.env.example → .env and fill it in.
 *
 * CORS: requests accepted only from twiztedjourneys.org and localhost.
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno&no-check";

// ── Allowed origins ───────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  "https://twiztedjourneys.org",
  "https://www.twiztedjourneys.org",
  "http://localhost:8080",
  "http://localhost:3000",
];

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed =
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
  };
}

// ── Server-side item catalog ──────────────────────────────────────────────────
// This is the ONLY place that determines what Stripe charges.
// Frontend price fields are never used to set the charge amount.

type BundleItem  = { kind: "bundle" };
type FixedItem   = { kind: "fixed"; cents: number }; // per-unit, before qty
type InquiryItem = { kind: "inquiry" };

type CatalogEntry = BundleItem | FixedItem | InquiryItem;

// Bundle pricing: every pair of units = 500 cents, every leftover single = 300 cents
// qty 1 → $3.00  qty 2 → $5.00  qty 3 → $8.00  qty 4 → $10.00  qty 5 → $13.00
const BUNDLE_ITEMS = new Set([
  "HOC", "HOWC", "HO", "HPBC", "HPC", "HPC2", "HA",  // crystal hearts
  "MY2", "MGRU", "MU2", "MP", "MBL", "MOP",           // stone mushrooms
]);

// Fixed-price items: unit price in cents (quantity multiplier applied below)
const FIXED_ITEMS: Record<string, number> = {
  JB7:  3299, // $32.99
  BEAR: 1999, // $19.99
  UT4:   999, // $9.99
  VDD2: 1799, // $17.99
  U1:   2999, // $29.99
  U22P: 2499, // $24.99
  GP5:  2999, // $29.99
};

// Price-coming-soon items: save inquiry, skip Stripe
const INQUIRY_ITEMS = new Set([
  "HP2", "HP3", "HP4", "HP5", "HP6",
  "HP7", "HP8", "HP9", "HP10", "HP11",
]);

function lookupItem(itemCode: string): CatalogEntry | null {
  const code = itemCode.trim().toUpperCase();
  if (BUNDLE_ITEMS.has(code))        return { kind: "bundle" };
  if (FIXED_ITEMS[code] !== undefined) return { kind: "fixed", cents: FIXED_ITEMS[code] };
  if (INQUIRY_ITEMS.has(code))       return { kind: "inquiry" };
  return null; // unknown item
}

function calcAmountCents(entry: CatalogEntry, quantity: number): number | null {
  if (entry.kind === "inquiry") return null;

  if (entry.kind === "bundle") {
    const pairs    = Math.floor(quantity / 2);
    const leftover = quantity % 2;
    return pairs * 500 + leftover * 300;
  }

  // fixed
  return entry.cents * quantity;
}

// ── Request body shape ────────────────────────────────────────────────────────
interface CheckoutRequest {
  order_id:       string;
  item_code:      string;
  item_name:      string;
  quantity:       number;
  customer_email: string;
  // The following are accepted for logging/debugging but NEVER used for pricing.
  price_label?:   string;
  amount_cents?:  number;
}

// ── JSON response helpers ─────────────────────────────────────────────────────
function json(
  body: unknown,
  status: number,
  extraHeaders: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });
}

// ── Main handler ──────────────────────────────────────────────────────────────
serve(async (req: Request) => {
  const origin  = req.headers.get("origin");
  const cors    = corsHeaders(origin);

  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405, cors);
  }

  // ── Parse body ──────────────────────────────────────────────────────────────
  let body: CheckoutRequest;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400, cors);
  }

  const { order_id, item_code, item_name, quantity, customer_email } = body;

  // ── Validate required fields ────────────────────────────────────────────────
  if (!order_id || typeof order_id !== "string" || !order_id.trim()) {
    return json({ error: "Missing required field: order_id" }, 400, cors);
  }

  if (!item_code || typeof item_code !== "string" || !item_code.trim()) {
    return json({ error: "Missing required field: item_code" }, 400, cors);
  }

  if (!item_name || typeof item_name !== "string" || !item_name.trim()) {
    return json({ error: "Missing required field: item_name" }, 400, cors);
  }

  if (
    typeof quantity !== "number" ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 99
  ) {
    return json(
      { error: "quantity must be an integer between 1 and 99" },
      400,
      cors
    );
  }

  // Log frontend pricing fields for debugging — never used for the charge
  console.log("create-merch-checkout request:", {
    order_id,
    item_code,
    quantity,
    frontend_price_label: body.price_label ?? "(not sent)",
    frontend_amount_cents: body.amount_cents ?? "(not sent)",
  });

  // ── Server-side price lookup by item_code ───────────────────────────────────
  const catalogEntry = lookupItem(item_code);

  if (catalogEntry === null) {
    // Unknown item code — do not create Stripe session
    console.warn("Unknown item_code:", item_code);
    return json({ skip_checkout: true, reason: "price_unknown" }, 200, cors);
  }

  if (catalogEntry.kind === "inquiry") {
    // Price coming soon — save inquiry only, no Stripe session
    return json({ skip_checkout: true, reason: "price_coming_soon" }, 200, cors);
  }

  // ── Calculate authoritative charge amount ───────────────────────────────────
  const amountCents = calcAmountCents(catalogEntry, quantity)!;

  // Stripe minimum charge is $0.50 (50 cents)
  if (amountCents < 50) {
    console.error("Calculated amount below Stripe minimum:", { item_code, quantity, amountCents });
    return json(
      { error: "Calculated amount is below Stripe minimum ($0.50). Contact info@twiztedjourneys.org." },
      400,
      cors
    );
  }

  // ── Init Stripe ─────────────────────────────────────────────────────────────
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) {
    console.error("STRIPE_SECRET_KEY secret is not set in this environment");
    return json(
      { error: "Payment system is not configured. Please contact info@twiztedjourneys.org." },
      500,
      cors
    );
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: "2024-04-10",
    httpClient: Stripe.createFetchHttpClient(),
  });

  // ── Build redirect URLs ──────────────────────────────────────────────────────
  const baseUrl =
    origin && ALLOWED_ORIGINS.includes(origin)
      ? origin
      : "https://twiztedjourneys.org";

  const successUrl = `${baseUrl}/merch-payment-success.html` +
    `?order_id=${encodeURIComponent(order_id.trim())}` +
    `&session_id={CHECKOUT_SESSION_ID}`;

  const cancelUrl = `${baseUrl}/merch.html?order_cancelled=1`;

  // ── Create Stripe Checkout Session ──────────────────────────────────────────
  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: customer_email?.trim() || undefined,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: amountCents, // server-calculated, not from frontend
            product_data: {
              name: `${item_name.trim()} (×${quantity})`,
              description:
                `Twizted Journeys merch · Item ${item_code.toUpperCase().trim()} · Qty ${quantity}`,
            },
          },
          quantity: 1, // amountCents already incorporates quantity math
        },
      ],
      metadata: {
        order_id:   order_id.trim(),
        item_code:  item_code.toUpperCase().trim(),
        item_name:  item_name.trim().substring(0, 500),
        quantity:   String(quantity),
        amount_cents: String(amountCents), // record the server-authoritative amount
        source:     "twizted-merch-page",
      },
      success_url: successUrl,
      cancel_url:  cancelUrl,
    });
  } catch (err) {
    console.error("Stripe session create error:", err);
    return json(
      {
        error:
          "Could not create payment session. Please try again or contact info@twiztedjourneys.org.",
      },
      502,
      cors
    );
  }

  console.log("Stripe session created:", {
    session_id: session.id,
    order_id,
    item_code,
    quantity,
    amountCents,
  });

  return json({ checkout_url: session.url }, 200, cors);
});
