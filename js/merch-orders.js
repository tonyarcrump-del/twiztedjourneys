/* merch-orders.js — Twizted Journeys
 * Merch order modal: open, prefill, save to Supabase, then redirect to
 * Stripe Checkout via the create-merch-checkout Edge Function.
 *
 * Pricing tiers (mirrored server-side in the Edge Function):
 *   Fixed:  $9.99 · $17.99 · $19.99 · $24.99 · $29.99 · $32.99
 *   Bundle: "$3 each · 2 for $5"
 *             qty 1 → $3.00    qty 2 → $5.00    qty 3 → $8.00
 *             qty 4 → $10.00   qty 5 → $13.00   (pairs=$5, odd=$3)
 *   Unknown / "Price coming soon" → save order, show follow-up message
 */
(function () {
  "use strict";

  console.log("Merch order script loaded");

  /* ── Config ─────────────────────────────────────────────────────────── */
  var ORDER_TABLE = "merch_orders";

  // Edge Function URL: replace SUPABASE_PROJECT_REF with your project ref
  // (the part before .supabase.co in your Project URL).
  // Example: https://ypzmckccroiffhtoofgr.supabase.co/functions/v1/create-merch-checkout
  var CHECKOUT_FUNCTION_URL = (function () {
    var cfg = window.TJ_PUBLIC_CONFIG || window.TJ_CONFIG;
    if (!cfg || !cfg.supabaseUrl || cfg.supabaseUrl === "SUPABASE_URL_HERE") return "";
    return cfg.supabaseUrl + "/functions/v1/create-merch-checkout";
  })();

  /* ── Supabase REST ───────────────────────────────────────────────────── */
  function getConfig() {
    var c = window.TJ_PUBLIC_CONFIG || window.TJ_CONFIG;
    if (!c || c.supabaseUrl === "SUPABASE_URL_HERE") return null;
    return c;
  }

  function generateOrderId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }

    if (window.crypto && typeof window.crypto.getRandomValues === "function") {
      var bytes = new Uint8Array(16);
      window.crypto.getRandomValues(bytes);
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;

      var hex = Array.from(bytes, function (b) {
        return b.toString(16).padStart(2, "0");
      }).join("");

      return [
        hex.slice(0, 8),
        hex.slice(8, 12),
        hex.slice(12, 16),
        hex.slice(16, 20),
        hex.slice(20)
      ].join("-");
    }

    throw new Error("secure-uuid-unavailable");
  }

  // POST a row without reading it back. Public inserts cannot SELECT by design.
  async function insertToSupabase(table, payload) {
    var cfg = getConfig();
    if (!cfg) throw new Error("not-configured");

    var res = await fetch(cfg.supabaseUrl + "/rest/v1/" + table, {
      method: "POST",
      headers: {
        "apikey": cfg.supabaseAnonKey,
        "Authorization": "Bearer " + cfg.supabaseAnonKey,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      var body = await res.text();
      throw new Error("supabase-insert: " + body);
    }

    return true;
  }

  /* ── Pricing logic ───────────────────────────────────────────────────── */

  // Returns price in cents, or null if price is unknown/coming-soon
  function calcAmountCents(priceLabel, quantity) {
    var label = (priceLabel || "").toLowerCase().trim();

    if (!label || label === "price coming soon" || label === "price pending") {
      return null;
    }

    // Bundle pricing: "$3 each · 2 for $5"
    if (label.indexOf("$3 each") !== -1 && label.indexOf("2 for $5") !== -1) {
      var pairs    = Math.floor(quantity / 2);
      var leftover = quantity % 2;
      return (pairs * 500) + (leftover * 300);
    }

    // Semicolon charm pricing: "1 for $5 · 3 for $12 · 10 for $30"
    if (label.indexOf("1 for $5") !== -1 &&
        label.indexOf("3 for $12") !== -1 &&
        label.indexOf("10 for $30") !== -1) {
      var best = new Array(quantity + 1).fill(Infinity);
      best[0] = 0;
      for (var i = 1; i <= quantity; i += 1) {
        best[i] = Math.min(
          best[i],
          best[i - 1] + 500,
          i >= 3 ? best[i - 3] + 1200 : Infinity,
          i >= 10 ? best[i - 10] + 3000 : Infinity
        );
      }
      return best[quantity];
    }

    // Fixed-price label — extract first dollar amount
    var m = label.match(/\$(\d+(?:\.\d{1,2})?)/);
    if (m) {
      var singleCents = Math.round(parseFloat(m[1]) * 100);
      return singleCents * quantity;
    }

    return null; // cannot calculate
  }

  // Human-readable price display for the order summary
  function formatCents(cents) {
    return "$" + (cents / 100).toFixed(2);
  }

  /* ── DOM helpers ─────────────────────────────────────────────────────── */
  function text(el, fallback) {
    return el ? (el.textContent.trim() || fallback || "") : (fallback || "");
  }

  function getCardCode(card) {
    if (!card) return "";
    if (card.dataset.csku) return card.dataset.csku;
    if (card.dataset.msku) return card.dataset.msku;
    if (card.dataset.hsku) return card.dataset.hsku;
    if (card.dataset.hp) return "HP" + card.dataset.hp;
    return "";
  }

  function getItemFromCard(el) {
    var card = el ? el.closest(".tt-card") : null;
    if (!card) return null;
    return {
      code:  getCardCode(card) || text(card.querySelector(".tt-hp-badge"), "Merch"),
      name:  text(card.querySelector(".tt-card-name"),  "Twizted Journeys merch item"),
      price: text(card.querySelector(".tt-card-price"), "Price pending")
    };
  }

  function getItemFromModal(el) {
    var info = el ? el.closest(".tt-modal-info") : null;
    if (!info) return null;
    return {
      code:  el.dataset.orderCode || text(info.querySelector(".tt-modal-badge"), "Merch"),
      name:  text(info.querySelector(".tt-modal-title"),  "Twizted Journeys merch item"),
      price: text(info.querySelector(".tt-modal-price"),  "Price pending")
    };
  }

  function getItemFromButton(el) {
    if (!el || (!el.dataset.orderCode && !el.dataset.orderName && !el.dataset.orderPrice)) return null;
    return {
      code:  el.dataset.orderCode || "Merch",
      name:  el.dataset.orderName || "Twizted Journeys merch item",
      price: el.dataset.orderPrice || "Price pending"
    };
  }

  /* ── Message helpers ─────────────────────────────────────────────────── */
  function setMessage(kind, html) {
    var el = document.getElementById("merch-order-message");
    if (!el) return;
    el.className = "merch-order-message is-" + kind;
    el.innerHTML = html;
  }

  function clearMessage() {
    var el = document.getElementById("merch-order-message");
    if (!el) return;
    el.className = "merch-order-message";
    el.innerHTML = "";
  }

  /* ── Detail-modal close ──────────────────────────────────────────────── */
  function closeDetailModals() {
    ["tt-modal", "tm-modal", "th-modal", "tc-modal"].forEach(function (id) {
      var m = document.getElementById(id);
      if (m) m.classList.remove("is-open");
    });
  }

  /* ── Order modal open / close ────────────────────────────────────────── */
  window.openMerchOrderModal = function (item) {
    var modal = document.getElementById("merch-order-modal");
    var form  = document.getElementById("merch-order-form");
    if (!modal || !form) return;

    item = item || { code: "Merch", name: "Twizted Journeys merch item", price: "Price pending" };

    closeDetailModals();
    clearMessage();
    form.reset();

    document.getElementById("merch-order-item-code").value   = item.code;
    document.getElementById("merch-order-item-name").value   = item.name;
    document.getElementById("merch-order-price-label").value = item.price;
    document.getElementById("merch-order-quantity").value    = "1";

    document.getElementById("merch-order-summary-name").textContent  = item.name;
    document.getElementById("merch-order-summary-code").textContent  = "Item: " + item.code;
    document.getElementById("merch-order-summary-price").textContent = item.price ? " | " + item.price : "";

    // Show or hide price note based on whether we can calculate amount
    updatePriceNote(item.price, 1);

    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
    console.log("Merch order modal opened", item);

    setTimeout(function () {
      var qty = document.getElementById("merch-order-quantity");
      if (qty) qty.focus();
    }, 50);
  };

  window.closeMerchOrderModal = function () {
    var modal = document.getElementById("merch-order-modal");
    if (modal) modal.classList.remove("is-open");
    document.body.style.overflow = "";
  };

  // Update the calculated price note when quantity changes
  function updatePriceNote(priceLabel, quantity) {
    var noteEl = document.getElementById("merch-order-price-note");
    if (!noteEl) return;
    var cents = calcAmountCents(priceLabel, quantity);
    if (cents !== null) {
      noteEl.textContent = "Calculated total: " + formatCents(cents);
      noteEl.style.display = "";
    } else {
      noteEl.textContent = "";
      noteEl.style.display = "none";
    }
  }

  /* ── Capture-phase click delegation ─────────────────────────────────── */
  document.addEventListener("click", function (e) {
    var target = e.target;
    var button =
      target.closest("[data-merch-order-button]") ||
      (target.closest("a[href='#merch-order']") &&
       !target.closest("#merch-order-modal") &&
       target.closest("a[href='#merch-order']"));

    if (!button) return;

    console.log("Merch order button clicked", button);
    e.preventDefault();
    e.stopPropagation();

    var item = getItemFromButton(button) || getItemFromCard(button) || getItemFromModal(button);
    window.openMerchOrderModal(item);
  }, true);

  /* Escape key closes order modal */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") window.closeMerchOrderModal();
  });

  /* ── Quantity change — update price note live ────────────────────────── */
  document.addEventListener("DOMContentLoaded", function () {
    var qtyInput = document.getElementById("merch-order-quantity");
    if (qtyInput) {
      qtyInput.addEventListener("input", function () {
        var priceLabel = (document.getElementById("merch-order-price-label") || {}).value || "";
        var qty = parseInt(this.value, 10) || 1;
        updatePriceNote(priceLabel, qty);
      });
    }
  });

  /* ── Form submit ─────────────────────────────────────────────────────── */
  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("merch-order-form");
    if (!form) return;

    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      var btn = form.querySelector("[type=submit]");
      btn.disabled = true;
      btn.dataset.original = btn.dataset.original || btn.textContent;
      btn.textContent = "Saving\u2026";
      clearMessage();

      var priceLabel = form.elements.price_label.value.trim();
      var quantity   = Number(form.elements.quantity.value || 1);
      var amountCents = calcAmountCents(priceLabel, quantity);
      var hasPriceComingSoon = !priceLabel ||
        priceLabel.toLowerCase() === "price coming soon" ||
        priceLabel.toLowerCase() === "price pending";

      var orderId = "";
      var orderSaved = false;
      var payload = null;

      try {
        orderId = generateOrderId();
        payload = {
          id:               orderId,
          item_code:        form.elements.item_code.value.trim(),
          item_name:        form.elements.item_name.value.trim(),
          price_label:      priceLabel,
          quantity:         quantity,
          customer_name:    form.elements.customer_name.value.trim(),
          customer_email:   form.elements.customer_email.value.trim(),
          customer_phone:   form.elements.customer_phone.value.trim() || null,
          shipping_address: form.elements.shipping_address.value.trim(),
          notes:            form.elements.notes.value.trim() || null,
          payment_status:   "pending",
          order_status:     "new",
          source:           "merch-page"
        };

        // Step 1: Save order to Supabase (always happens first)
        btn.textContent = "Saving order\u2026";
        await insertToSupabase(ORDER_TABLE, payload);
        orderSaved = true;
        console.log("Merch order saved, id:", orderId);

        // Step 2: If price is "coming soon" or unknown, skip Stripe
        if (hasPriceComingSoon || amountCents === null) {
          setMessage("success",
            "<strong>Order inquiry received!</strong> Your details have been saved. " +
            "Because this item\u2019s price is still being finalized, Tonya will follow up " +
            "with payment information. Thank you for your support!"
          );
          form.reset();
          return;
        }

        // Step 3: Call Edge Function to get Stripe Checkout URL
        if (!CHECKOUT_FUNCTION_URL) {
          // Not yet deployed — show pending message but order is saved
          setMessage("success",
            "<strong>Order saved!</strong> Online payment is not yet enabled. " +
            "Tonya will follow up with payment information. Thank you!"
          );
          form.reset();
          return;
        }

        btn.textContent = "Redirecting to payment\u2026";
        var cfg = getConfig();
        if (!cfg) throw new Error("not-configured");

        var checkoutRes = await fetch(CHECKOUT_FUNCTION_URL, {
          method: "POST",
          headers: {
            "apikey": cfg.supabaseAnonKey,
            "Authorization": "Bearer " + cfg.supabaseAnonKey,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            order_id:       orderId,
            item_code:      payload.item_code,
            item_name:      payload.item_name,
            quantity:       quantity,
            customer_email: payload.customer_email,
            price_label:    priceLabel
          })
        });

        var checkoutBody = await checkoutRes.text();
        var checkoutData = {};

        if (checkoutBody) {
          try {
            checkoutData = JSON.parse(checkoutBody);
          } catch (parseErr) {
            checkoutData = {};
          }
        }

        if (!checkoutRes.ok) {
          console.warn("Merch checkout failed", {
            status: checkoutRes.status,
            body: checkoutBody
          });
          throw new Error(checkoutData.error || "Checkout function returned an error");
        }

        // If server says to skip checkout (price_coming_soon, price_unknown)
        if (checkoutData.skip_checkout) {
          setMessage("success",
            "<strong>Order inquiry received!</strong> Your details have been saved. " +
            "Tonya will follow up with payment information shortly. Thank you!"
          );
          form.reset();
          return;
        }

        if (!checkoutData.checkout_url) {
          throw new Error("No checkout URL returned from payment system");
        }

        // Step 4: Redirect to Stripe Checkout
        window.location.assign(checkoutData.checkout_url);

      } catch (err) {
        console.error("Merch order submit error:", err);

        if (err.message === "not-configured") {
          setMessage("error",
            "Merch orders are not yet configured. Please contact " +
            "<a href=\"mailto:info@twiztedjourneys.org\">info@twiztedjourneys.org</a>."
          );
        } else if (orderSaved && orderId) {
          // Order was saved but payment redirect failed — order is NOT lost
          setMessage("error",
            "<strong>Your order was saved</strong> (order ID: " + orderId + ") but the " +
            "payment redirect encountered an issue. Please contact " +
            "<a href=\"mailto:info@twiztedjourneys.org\">info@twiztedjourneys.org</a> " +
            "and reference your order ID so Tonya can follow up with payment instructions."
          );
        } else {
          setMessage("error",
            "The order could not be saved. Please try again or contact " +
            "<a href=\"mailto:info@twiztedjourneys.org\">info@twiztedjourneys.org</a> directly."
          );
        }
      } finally {
        btn.disabled = false;
        btn.textContent = btn.dataset.original;
      }
    });
  });

})();
