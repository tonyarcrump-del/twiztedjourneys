(function () {
  "use strict";
  var config = window.TJ_PUBLIC_CONFIG || window.TJ_CONFIG;
  if (!config || !config.supabaseUrl || !config.supabaseAnonKey) return;

  var endpoint = config.supabaseUrl + "/functions/v1/create-merch-checkout";
  var headers = {
    apikey: config.supabaseAnonKey,
    Authorization: "Bearer " + config.supabaseAnonKey,
    "Content-Type": "application/json"
  };
  window.TJ_MERCH_CHECKOUT = {
    request: function (data) {
      return fetch(endpoint, { method: "POST", headers: headers, body: JSON.stringify(data) });
    }
  };
  if (document.querySelector("[data-be-the-light-card], #merch-order-form")) {
    window.TJ_MERCH_CHECKOUT.options = fetch(endpoint, { headers: headers })
      .then(function (response) { return response.ok ? response.json() : {}; })
      .catch(function () { return {}; })
      .then(function (options) {
        document.querySelectorAll("[data-be-the-light-card]").forEach(function (element) {
          element.hidden = options.be_the_light_card !== true;
        });
        return options;
      });
  }
})();
