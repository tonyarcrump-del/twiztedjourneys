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
import { finishPaypalCheckout, isMerchOrderId, paypalAvailable, readMerchOrder, startPaypalCheckout } from "./paypal.ts";

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
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
  };
}

// ── Server-side item catalog ──────────────────────────────────────────────────
// This is the ONLY place that determines what Stripe charges.
// Frontend price fields are never used to set the charge amount.

type BundleItem = { kind: "bundle" };
type CharmBundleItem = { kind: "charm-bundle" };
type HatPinItem = { kind: "hat-pin" };
type FixedItem = { kind: "fixed"; cents: number }; // per-unit, before qty
type ShirtItem = { kind: "shirt" };
type InquiryItem = { kind: "inquiry" };

type CatalogEntry = BundleItem | CharmBundleItem | HatPinItem | FixedItem | ShirtItem | InquiryItem;

// Bundle pricing: every pair of units = 500 cents, every leftover single = 300 cents
// qty 1 → $3.00  qty 2 → $5.00  qty 3 → $8.00  qty 4 → $10.00  qty 5 → $13.00
const BUNDLE_ITEMS = new Set([
  "HOC", "HOWC", "HO", "HPBC", "HPC", "HPC2", "HA",  // crystal hearts
  "MY2", "MGRU", "MU2", "MP", "MBL", "MOP",           // stone mushrooms
]);

// Hat pins are limited to one or two per checkout line.
const HAT_PIN_ITEMS = new Set([
  "HP2", "HP3", "HP4", "HP5", "HP6",
  "HP7", "HP8", "HP9", "HP10", "HP11",
]);

const HAT_PIN_PRICES: Record<number, number> = {
  1: 300,
  2: 500,
};

// Signature semicolon charm pricing. Only these package quantities are allowed.
const CHARM_12MM_BUNDLE_PRICES: Record<number, number> = {
  1: 500,
  3: 1200,
  10: 3000,
};

// Fixed-price items: unit price in cents (quantity multiplier applied below)
const FIXED_ITEMS: Record<string, number> = {
  JB7:  3299, // $32.99
  BEAR: 1999, // $19.99
  BRACELETS: 200, // $2.00
  SKULL: 1999, // $19.99
  SF1: 699, // $6.99
  SF2: 699, // $6.99
  SF3: 699, // $6.99
  SF4: 699, // $6.99
  SF5: 699, // $6.99
  FD11: 399, // $3.99
  FD21: 499, // $4.99
  FD22: 499, // $4.99
  SHK01: 599, // $5.99
  SHK02: 599, // $5.99
  SHK03: 599, // $5.99
  SHK04: 599, // $5.99
  SHK06: 599, // $5.99
  ARK01: 599, // $5.99
  ARK02: 599, // $5.99
  ARK03: 599, // $5.99
  ARK04: 599, // $5.99
  ARK05: 599, // $5.99
  ARK06: 599, // $5.99
  ARK07: 599, // $5.99
  PG01: 1000, // $10.00
  PG02: 1000, // $10.00
  PG03: 1000, // $10.00
  PG04: 1000, // $10.00
  PG05: 1000, // $10.00
  PG06: 1000, // $10.00
  PG07: 1000, // $10.00
  PG08: 1000, // $10.00
  PG09: 1000, // $10.00
  PG10: 1000, // $10.00
};

// Variant-priced apparel. The selected size is parsed from item_name and
// validated against this server-side allowlist before Stripe checkout.
const LUN_SHIRT_SIZE_PRICES: Record<string, number> = {
  S: 3000,
  M: 3000,
  L: 3000,
  XL: 3000,
  "2X": 3500,
  "3X": 3500,
  "4X": 3500,
};

// Match the Be the Light rates already active in the PayPal cart.
const BE_THE_LIGHT_SHIPPING = [
  { states: "IL IN KY OH", cents: [1070, 1270, 1315, 1445, 1620] },
  { states: "DC DE IA MD MI MO NC PA SC TN VA WI WV", cents: [1110, 1350, 1420, 1565, 1790] },
  { states: "AL AR CT GA KS LA MA ME MN MS NE NH NJ NY OK RI SD VT", cents: [1170, 1485, 1570, 1780, 2085] },
  { states: "CO FL ND NM TX WY", cents: [1210, 1585, 1720, 1970, 2395] },
  { states: "AZ ID MT UT", cents: [1270, 1720, 1970, 2230, 2765] },
  { states: "AK CA HI NV OR WA", cents: [1365, 1980, 2315, 2565, 3200] },
];

function getBeTheLightShipping(address: string, quantity: number): number | undefined {
  const lastLine = address.trim().split(/\r?\n/).at(-1) ?? "";
  const match = lastLine.match(/\b([A-Z]{2})[ ,]+\d{5}(?:-\d{4})?$/i);
  const state = match?.[1].toUpperCase();
  const region = state && BE_THE_LIGHT_SHIPPING.find((entry) => entry.states.split(" ").includes(state));
  const tier = quantity === 1 ? 0 : quantity <= 3 ? 1 : quantity === 4 ? 2 : quantity <= 6 ? 3 : 4;
  return region ? region.cents[tier] : undefined;
}

// Price-coming-soon items: save inquiry, skip Stripe
const INQUIRY_ITEMS = new Set<string>([]);

function lookupItem(itemCode: string): CatalogEntry | null {
  const code = itemCode.trim().toUpperCase();
  if (BUNDLE_ITEMS.has(code))        return { kind: "bundle" };
  if (code === "CHARM-12MM")         return { kind: "charm-bundle" };
  if (HAT_PIN_ITEMS.has(code))       return { kind: "hat-pin" };
  if (code === "LUN-SHIRT" || code === "BTL-SHIRT") return { kind: "shirt" };
  if (FIXED_ITEMS[code] !== undefined) return { kind: "fixed", cents: FIXED_ITEMS[code] };
  if (INQUIRY_ITEMS.has(code))       return { kind: "inquiry" };
  return null; // unknown item
}

function getLunShirtSize(itemName: string): string | null {
  const match = itemName.match(/\bSize\s+(S|M|L|XL|2X|3X|4X)\b/i);
  if (!match) return null;

  const size = match[1].toUpperCase();
  return LUN_SHIRT_SIZE_PRICES[size] !== undefined ? size : null;
}

function calcAmountCents(
  entry: CatalogEntry,
  quantity: number,
  shirtSize: string | null = null,
): number | null {
  if (entry.kind === "inquiry") return null;

  if (entry.kind === "bundle") {
    const pairs    = Math.floor(quantity / 2);
    const leftover = quantity % 2;
    return pairs * 500 + leftover * 300;
  }

  if (entry.kind === "charm-bundle") {
    return CHARM_12MM_BUNDLE_PRICES[quantity] ?? null;
  }

  if (entry.kind === "hat-pin") {
    return HAT_PIN_PRICES[quantity] ?? null;
  }

  if (entry.kind === "shirt") {
    if (!shirtSize || LUN_SHIRT_SIZE_PRICES[shirtSize] === undefined) return null;
    return LUN_SHIRT_SIZE_PRICES[shirtSize] * quantity;
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
  provider?:      "stripe" | "paypal";
  action?:        "capture_paypal";
  paypal_order_id?: string;
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

  if (req.method === "GET") {
    const card = Boolean(Deno.env.get("STRIPE_SECRET_KEY") && Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
    return json({ paypal: paypalAvailable(), be_the_light_card: card }, 200, cors);
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

  if (!body || typeof body !== "object") return json({ error: "Invalid checkout request" }, 400, cors);
  const { order_id } = body;
  if (body.action === "capture_paypal") {
    if (!paypalAvailable()) return json({ error: "PayPal checkout is unavailable." }, 503, cors);
    if (!isMerchOrderId(order_id) || typeof body.paypal_order_id !== "string" ||
        !/^[A-Z0-9]{10,30}$/.test(body.paypal_order_id)) {
      return json({ error: "Invalid payment reference." }, 400, cors);
    }
    try {
      const status = await finishPaypalCheckout(order_id, body.paypal_order_id);
      return json({ status }, status === "unknown_order" ? 404 : 200, cors);
    } catch (error) {
      console.warn("Merch PayPal confirmation failed:", error instanceof Error ? error.message : error);
      return json({ error: "Payment confirmation is temporarily unavailable." }, 502, cors);
    }
  }
  let { item_code, item_name, quantity, customer_email } = body;
  const provider = body.provider ?? "stripe";
  if (provider !== "stripe" && provider !== "paypal") {
    return json({ error: "Invalid payment method." }, 400, cors);
  }

  // ── Validate required fields ────────────────────────────────────────────────
  if (!order_id || typeof order_id !== "string" || !order_id.trim()) {
    return json({ error: "Missing required field: order_id" }, 400, cors);
  }

  const baseUrl = origin && ALLOWED_ORIGINS.includes(origin) ? origin : "https://twiztedjourneys.org";
  const isBeTheLight = typeof item_code === "string" && item_code.trim().toUpperCase() === "BTL-SHIRT";
  let savedOrder;
  if (provider === "paypal" || isBeTheLight) {
    if (provider === "paypal" && !paypalAvailable()) {
      return json({ error: "PayPal checkout is unavailable. You can pay by card." }, 503, cors);
    }
    if (!isMerchOrderId(order_id)) return json({ error: "Invalid order reference." }, 400, cors);
    try {
      savedOrder = await readMerchOrder(order_id);
    } catch {
      return json({ error: "Could not load the saved order." }, 502, cors);
    }
    if (!savedOrder || savedOrder.payment_status !== "pending" || savedOrder.item_code !== item_code) {
      return json({ error: "This order is unavailable for payment." }, 409, cors);
    }
    ({ item_code, item_name, quantity, customer_email } = savedOrder);
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
    item_name,
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

  const shirtSize = catalogEntry.kind === "shirt" ? getLunShirtSize(item_name) : null;
  if (catalogEntry.kind === "shirt" && !shirtSize) {
    return json({ error: "Invalid or missing shirt size." }, 400, cors);
  }

  if (
    catalogEntry.kind === "charm-bundle" &&
    CHARM_12MM_BUNDLE_PRICES[quantity] === undefined
  ) {
    console.warn("Invalid CHARM-12MM bundle quantity:", { item_code, quantity });
    return json({ error: "Invalid bundle quantity for CHARM-12MM" }, 400, cors);
  }

  if (
    catalogEntry.kind === "hat-pin" &&
    HAT_PIN_PRICES[quantity] === undefined
  ) {
    console.warn("Invalid hat pin quantity:", { item_code, quantity });
    return json({ error: "Hat pin quantity must be 1 or 2" }, 400, cors);
  }

  // ── Calculate authoritative charge amount ───────────────────────────────────
  const amountCents = calcAmountCents(catalogEntry, quantity, shirtSize)!;

  // Stripe minimum charge is $0.50 (50 cents)
  if (amountCents < 50) {
    console.error("Calculated amount below Stripe minimum:", { item_code, quantity, amountCents });
    return json(
      { error: "Calculated amount is below Stripe minimum ($0.50). Contact info@twiztedjourneys.org." },
      400,
      cors
    );
  }

  if (provider === "paypal" && savedOrder) {
    if (isBeTheLight) return json({ error: "Use the PayPal cart on the Be the Light shirt page." }, 400, cors);
    try {
      return json({ checkout_url: await startPaypalCheckout(savedOrder, amountCents, baseUrl) }, 200, cors);
    } catch (error) {
      console.warn("Merch PayPal order failed:", error instanceof Error ? error.message : error);
      return json({ error: "PayPal could not open checkout. Please try again." }, 502, cors);
    }
  }

  const shippingCents = isBeTheLight ? getBeTheLightShipping(savedOrder!.shipping_address, quantity) : 0;
  if (shippingCents === undefined) {
    return json({ error: "Use a U.S. shipping address ending with city, state abbreviation, and ZIP code." }, 400, cors);
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
  const successUrl = `${baseUrl}/merch-payment-success.html` +
    `?order_id=${encodeURIComponent(order_id.trim())}` +
    `&session_id={CHECKOUT_SESSION_ID}`;

  const cancelUrl = `${baseUrl}/merch.html?order_cancelled=1${isBeTheLight ? "#be-the-light-card" : ""}`;

  // ── Create Stripe Checkout Session ──────────────────────────────────────────
  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: customer_email?.trim() || undefined,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: amountCents, // server-calculated, not from frontend
            product_data: {
              name: `${item_name.trim()} (×${quantity})`,
              description:
                `Twizted Journeys merch · Item ${item_code.toUpperCase().trim()} · Qty ${quantity}` +
                (shirtSize ? ` · Size ${shirtSize}` : ""),
            },
          },
          quantity: 1, // amountCents already incorporates quantity math
        },
        ...(shippingCents ? [{
          price_data: {
            currency: "usd",
            unit_amount: shippingCents,
            product_data: { name: "Ground shipping" },
          },
          quantity: 1,
        }] : []),
      ],
      metadata: {
        order_id:   order_id.trim(),
        item_code:  item_code.toUpperCase().trim(),
        item_name:  item_name.trim().substring(0, 500),
        quantity:   String(quantity),
        ...(shirtSize ? { shirt_size: shirtSize } : {}),
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
    shirtSize,
    amountCents,
  });

  return json({ checkout_url: session.url }, 200, cors);
});
