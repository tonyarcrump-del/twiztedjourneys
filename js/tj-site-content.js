/**
 * tj-site-content.js - Applies public site_content overrides.
 *
 * Hard-coded page content remains the fallback. If Supabase is unavailable,
 * misconfigured, or returns an error, this script exits silently.
 */
(function() {
  function getConfig() {
    var cfg = window.TJ_PUBLIC_CONFIG;
    if (!cfg || !cfg.supabaseUrl || !cfg.supabaseAnonKey) return null;
    if (String(cfg.supabaseUrl).indexOf('SUPABASE') !== -1) return null;
    return cfg;
  }

  function cleanPhone(value) {
    return String(value || '').replace(/[^\d+]/g, '');
  }

  function hrefFor(key, value) {
    if (key === 'contact_email') return 'mailto:' + value;
    if (key === 'contact_phone') return 'tel:' + cleanPhone(value);
    return value;
  }

  function applyContent(rows) {
    var values = {};
    rows.forEach(function(row) {
      if (!row || !row.key) return;
      var value = String(row.value || '').trim();
      if (value) values[row.key] = value;
    });

    document.querySelectorAll('[data-sc]').forEach(function(el) {
      var key = el.getAttribute('data-sc');
      if (!values[key]) return;
      el.textContent = values[key];
    });

    document.querySelectorAll('[data-sc-href]').forEach(function(el) {
      var key = el.getAttribute('data-sc-href');
      if (!values[key]) return;
      el.setAttribute('href', hrefFor(key, values[key]));
    });
  }

  async function loadSiteContent() {
    var cfg = getConfig();
    if (!cfg) return;

    try {
      var url = cfg.supabaseUrl.replace(/\/$/, '') + '/rest/v1/site_content?select=key,value';
      var res = await fetch(url, {
        headers: {
          apikey: cfg.supabaseAnonKey,
          Authorization: 'Bearer ' + cfg.supabaseAnonKey
        }
      });
      if (!res.ok) return;
      var data = await res.json();
      if (Array.isArray(data)) applyContent(data);
    } catch (e) {
      // Keep the public page stable if the content service is unavailable.
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSiteContent);
  } else {
    loadSiteContent();
  }
})();

