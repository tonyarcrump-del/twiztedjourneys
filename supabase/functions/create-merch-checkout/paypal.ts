const paypalOrigin = "https://api-m.paypal.com";

export const isMerchOrderId = (id: unknown): id is string =>
  typeof id === "string" && /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id);

export type SavedMerchOrder = {
  id: string;
  item_code: string;
  item_name: string;
  quantity: number;
  customer_email: string;
  shipping_address: string;
  payment_status: string;
};

function orderRecordUrl(orderId: string): URL {
  const url = new URL("/rest/v1/merch_orders", Deno.env.get("SUPABASE_URL"));
  url.searchParams.set("id", `eq.${orderId}`);
  return url;
}

function serviceHeaders() {
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!key) throw new Error("Merch order service is unavailable");
  return { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
}

export async function readMerchOrder(id: string): Promise<SavedMerchOrder | undefined> {
  const url = orderRecordUrl(id);
  url.searchParams.set("select", "id,item_code,item_name,quantity,customer_email,shipping_address,payment_status");
  const response = await fetch(url, { headers: serviceHeaders() });
  if (!response.ok) throw new Error("Could not read saved merch order");
  const rows: SavedMerchOrder[] = await response.json();
  return rows[0];
}

export function paypalAvailable(): boolean {
  return Boolean(Deno.env.get("PAYPAL_CLIENT_ID") && Deno.env.get("PAYPAL_CLIENT_SECRET") &&
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") && Deno.env.get("SUPABASE_URL"));
}

type Money = { currency_code: string; value: string };
type PurchaseUnit = {
  custom_id?: string;
  amount?: Money;
  shipping?: { address?: Record<string, string> };
  payments?: { captures?: Array<{ status: string; amount: Money }> };
};
type PaypalOrder = {
  status: string;
  purchase_units?: PurchaseUnit[];
  links?: Array<{ rel: string; href: string }>;
};

async function paypalAccessToken(): Promise<string> {
  const credentials = btoa(`${Deno.env.get("PAYPAL_CLIENT_ID")}:${Deno.env.get("PAYPAL_CLIENT_SECRET")}`);
  const response = await fetch(paypalOrigin + "/v1/oauth2/token", {
    method: "POST",
    headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  const data = await response.json();
  if (!response.ok || typeof data.access_token !== "string") {
    throw new Error(`PayPal authentication failed (${response.status})`);
  }
  return data.access_token;
}

async function paypalRequest(
  accessToken: string, path: string, body?: object, requestId?: string,
): Promise<PaypalOrder> {
  const headers = new Headers({ Authorization: `Bearer ${accessToken}`, Accept: "application/json" });
  if (body) {
    headers.set("Content-Type", "application/json");
    headers.set("Prefer", "return=representation");
    if (requestId) headers.set("PayPal-Request-Id", requestId);
  }
  const response = await fetch(paypalOrigin + "/v2/checkout/orders" + path, {
    method: body ? "POST" : "GET",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) throw new Error(`PayPal order request failed (${response.status})`);
  return response.json();
}

export async function startPaypalCheckout(
  order: SavedMerchOrder, amountCents: number, baseUrl: string,
): Promise<string> {
  const accessToken = await paypalAccessToken();
  const payment = await paypalRequest(accessToken, "", {
    intent: "CAPTURE",
    purchase_units: [{
      custom_id: `tj-merch:${order.id}`,
      description: `${order.item_code} ×${order.quantity} · ${order.item_name}`.substring(0, 127),
      amount: { currency_code: "USD", value: (amountCents / 100).toFixed(2) },
    }],
    payment_source: {
      paypal: {
        experience_context: {
          brand_name: "Twizted Journeys",
          shipping_preference: "GET_FROM_FILE",
          user_action: "PAY_NOW",
          return_url: `${baseUrl}/merch-payment-success.html?provider=paypal&order_id=${order.id}`,
          cancel_url: `${baseUrl}/merch.html?order_cancelled=1`,
        },
      },
    },
  }, "c" + order.id.replaceAll("-", ""));
  const approvalLink = payment.links?.find((link) => link.rel === "payer-action" || link.rel === "approve");
  if (!approvalLink || new URL(approvalLink.href).origin !== "https://www.paypal.com") {
    throw new Error("PayPal did not return a checkout link");
  }
  return approvalLink.href;
}

export async function finishPaypalCheckout(
  orderId: string, paypalOrderId: string,
): Promise<"paid" | "pending" | "not_approved" | "unknown_order"> {
  const saved = await readMerchOrder(orderId);
  if (!saved) return "unknown_order";
  const accessToken = await paypalAccessToken();
  const paypalPath = "/" + paypalOrderId;
  let payment = await paypalRequest(accessToken, paypalPath);
  const unit = payment.purchase_units?.[0];
  if (payment.purchase_units?.length !== 1 || unit?.custom_id !== `tj-merch:${orderId}` ||
      unit.amount?.currency_code !== "USD") return "unknown_order";
  if (saved.payment_status !== "pending" && saved.payment_status !== "paid") return "not_approved";
  if (payment.status === "APPROVED" && saved.payment_status === "pending") {
    try {
      payment = await paypalRequest(accessToken, paypalPath + "/capture", {}, "pay-" + orderId.replaceAll("-", ""));
    } catch {
      // A timeout can happen after capture. Read PayPal's status before allowing a retry.
      payment = await paypalRequest(accessToken, paypalPath);
      if (payment.status === "APPROVED") throw new Error("PayPal capture has not completed");
    }
  }
  const paidUnit = payment.purchase_units?.[0];
  const captures = paidUnit?.payments?.captures;
  const capture = captures?.[0];
  if (capture?.status === "PENDING") return "pending";
  if (payment.status !== "COMPLETED" || capture?.status !== "COMPLETED" || captures?.length !== 1 ||
      capture.amount.currency_code !== "USD" || capture.amount.value !== unit.amount.value) {
    return "not_approved";
  }
  if (saved.payment_status !== "paid") {
    const url = orderRecordUrl(orderId);
    url.searchParams.set("payment_status", "eq.pending");
    const address = (paidUnit?.shipping ?? unit.shipping)?.address;
    const shipping = address && [
      address.address_line_1, address.address_line_2,
      [address.admin_area_2, address.admin_area_1, address.postal_code].filter(Boolean).join(" "),
      address.country_code,
    ].filter(Boolean).join("\n");
    const response = await fetch(url, {
      method: "PATCH",
      headers: serviceHeaders(),
      body: JSON.stringify({ payment_status: "paid", ...(shipping ? { shipping_address: shipping } : {}) }),
    });
    if (!response.ok) throw new Error("PayPal payment is complete, but the shop order could not be updated");
  }
  return "paid";
}
