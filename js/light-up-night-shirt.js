/* light-up-night-shirt.js — Twizted Journeys
 * Single source of truth for the Light Up the Night Memorial Shirt:
 * product identity and size-based pricing, shared by merch.html and
 * light-up-the-night.html. Wires each [data-lun-shirt-widget] instance's
 * size select to the visible price and the Order Now button's
 * data-order-* attributes consumed by js/merch-orders.js.
 */
(function () {
  "use strict";

  var PRODUCT = {
    code: "LUN-SHIRT",
    name: "Light Up the Night Memorial Shirt",
    subtitle: "Remembering Lives Lost to Suicide"
  };

  // S–XL = $30, 2X and up = $35
  var SIZE_PRICES = {
    S:  30, M:  30, L:  30, XL: 30,
    "2X": 35, "3X": 35, "4X": 35
  };

  window.TJ_LUN_SHIRT = { product: PRODUCT, sizePrices: SIZE_PRICES };

  function priceForSize(size) {
    return Object.prototype.hasOwnProperty.call(SIZE_PRICES, size)
      ? SIZE_PRICES[size]
      : SIZE_PRICES.S;
  }

  function updateWidget(root) {
    var select = root.querySelector("[data-lun-size-select]");
    if (!select) return;

    var size = select.value;
    var price = priceForSize(size);
    var priceLabel = "$" + price;

    var priceEl = root.querySelector("[data-lun-price-display]");
    if (priceEl) priceEl.textContent = priceLabel;

    var button = root.querySelector("[data-lun-order-button]");
    if (button) {
      button.dataset.orderCode = PRODUCT.code;
      button.dataset.orderName = PRODUCT.name + " — Size " + size;
      button.dataset.orderPrice = priceLabel;
    }
  }

  function swapImage(root, thumb) {
    if (!thumb) return;
    var main = root.querySelector("[data-lun-main-img]");
    var src = thumb.getAttribute("data-img");
    var alt = thumb.getAttribute("data-alt");

    if (main && src) main.setAttribute("src", src);
    if (main && alt) main.setAttribute("alt", alt);

    var thumbs = root.querySelectorAll("[data-lun-thumb]");
    for (var i = 0; i < thumbs.length; i++) {
      thumbs[i].classList.toggle("is-active", thumbs[i] === thumb);
    }
  }

  function initWidget(root) {
    updateWidget(root);

    var select = root.querySelector("[data-lun-size-select]");
    if (select) {
      select.addEventListener("change", function () { updateWidget(root); });
    }

    var thumbs = root.querySelectorAll("[data-lun-thumb]");
    for (var i = 0; i < thumbs.length; i++) {
      thumbs[i].addEventListener("click", (function (thumb) {
        return function () { swapImage(root, thumb); };
      })(thumbs[i]));
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var widgets = document.querySelectorAll("[data-lun-shirt-widget]");
    for (var i = 0; i < widgets.length; i++) initWidget(widgets[i]);
  });
})();
