/* Merch order modal — Twizted Journeys
   Handles: open modal from card/detail buttons, prefill item data,
   save order to Supabase merch_orders, show payment-pending message.
*/
(function () {
  "use strict";

  console.log("Merch order script loaded");

  var STRIPE_MERCH_PAYMENT_URL = "";
  var ORDER_TABLE = "merch_orders";

  /* ── Supabase config ──────────────────────────────────────── */
  function getConfig() {
    var c = window.TJ_PUBLIC_CONFIG || window.TJ_CONFIG;
    if (!c || c.supabaseUrl === "SUPABASE_URL_HERE") return null;
    return c;
  }

  async function postToSupabase(table, payload) {
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

    if (!res.ok) throw new Error(await res.text());
    return true;
  }

  /* ── Helpers ──────────────────────────────────────────────── */
  function text(el, fallback) {
    var value = el ? el.textContent.trim() : "";
    return value || fallback || "";
  }

  /* Pull item data from the nearest .tt-card ancestor */
  function getItemFromCard(el) {
    var card = el ? el.closest(".tt-card") : null;
    if (!card) return null;
    return {
      code:  text(card.querySelector(".tt-hp-badge"),  "Merch"),
      name:  text(card.querySelector(".tt-card-name"), "Twizted Journeys merch item"),
      price: text(card.querySelector(".tt-card-price"), "Price pending")
    };
  }

  /* Pull item data from an open detail modal */
  function getItemFromModal(el) {
    var info = el ? el.closest(".tt-modal-info") : null;
    if (!info) return null;
    return {
      code:  text(info.querySelector(".tt-modal-badge"),  "Merch"),
      name:  text(info.querySelector(".tt-modal-title"),  "Twizted Journeys merch item"),
      price: text(info.querySelector(".tt-modal-price"),  "Price pending")
    };
  }

  /* ── Message helpers ──────────────────────────────────────── */
  function setMessage(kind, message) {
    var el = document.getElementById("merch-order-message");
    if (!el) return;
    el.className = "merch-order-message is-" + kind;
    el.textContent = message;
  }

  function clearMessage() {
    var el = document.getElementById("merch-order-message");
    if (!el) return;
    el.className = "merch-order-message";
    el.textContent = "";
  }

  /* ── Close any open detail modals ────────────────────────── */
  function closeDetailModals() {
    ["tt-modal", "tm-modal", "th-modal", "tc-modal"].forEach(function (id) {
      var m = document.getElementById(id);
      if (m) m.classList.remove("is-open");
    });
  }

  /* ── Open / close merch order modal ──────────────────────── */
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

  /* ── Click delegation — CAPTURE PHASE ────────────────────────
     Using capture:true so we intercept clicks before any inline
     stopPropagation() calls on parent elements (.tt-card-actions,
     modal Order Now anchors) can kill bubbling.
  ─────────────────────────────────────────────────────────────── */
  document.addEventListener("click", function (e) {
    var target = e.target;

    /* Match the clicked element OR any ancestor up to the button/anchor */
    var button =
      target.closest("[data-merch-order-button]") ||
      (target.closest("a[href='#merch-order']") &&
       !target.closest("#merch-order-modal") &&
       target.closest("a[href='#merch-order']"));

    if (!button) return;

    console.log("Merch order button clicked", button);

    e.preventDefault();
    e.stopPropagation(); /* prevent card detail modal from also opening */

    var item = getItemFromCard(button) || getItemFromModal(button);
    window.openMerchOrderModal(item);

  }, true /* useCapture — fires before inline stopPropagation */);

  /* Escape key closes order modal */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") window.closeMerchOrderModal();
  });

  /* ── Form submit ──────────────────────────────────────────── */
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

      var payload = {
        item_code:        form.elements.item_code.value.trim(),
        item_name:        form.elements.item_name.value.trim(),
        price_label:      form.elements.price_label.value.trim(),
        quantity:         Number(form.elements.quantity.value || 1),
        customer_name:    form.elements.customer_name.value.trim(),
        customer_email:   form.elements.customer_email.value.trim(),
        customer_phone:   form.elements.customer_phone.value.trim() || null,
        shipping_address: form.elements.shipping_address.value.trim(),
        notes:            form.elements.notes.value.trim() || null,
        payment_status:   "pending",
        order_status:     "new",
        source:           "merch-page"
      };

      try {
        await postToSupabase(ORDER_TABLE, payload);

        if (STRIPE_MERCH_PAYMENT_URL) {
          window.location.href = STRIPE_MERCH_PAYMENT_URL;
          return;
        }

        setMessage(
          "success",
          "Order saved! Your order details have been received. " +
          "Payment setup is still pending — Tonya will follow up with payment " +
          "information once it is ready. Thank you for your support!"
        );
        form.reset();
      } catch (err) {
        console.error("Merch order submit error:", err);
        if (err.message === "not-configured") {
          setMessage("error",
            "Merch orders are not yet configured. Please check back soon.");
        } else {
          setMessage("error",
            "The order could not be saved. Please try again or contact " +
            "info@twiztedjourneys.org directly.");
        }
      } finally {
        btn.disabled = false;
        btn.textContent = btn.dataset.original;
      }
    });
  });

})();
