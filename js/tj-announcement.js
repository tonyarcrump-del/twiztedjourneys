/**
 * tj-announcement.js — Dynamic site-wide announcement banner
 *
 * Include AFTER tj-public-config.js and supabase-js on any public page:
 *   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *   <script src="js/tj-public-config.js"></script>
 *   <script src="js/tj-announcement.js"></script>
 *
 * The banner reads announcement_text, announcement_active, announcement_type,
 * and announcement_link from the Supabase site_content table.
 * Tonya controls all of these from the admin panel (admin/content.html).
 *
 * No banner element is needed in the HTML — this script injects it.
 */

(function() {
  'use strict';

  // Inject the CSS on first load
  var style = document.createElement('style');
  style.textContent = `
    #tj-announcement-bar {
      display: none;
      width: 100%;
      padding: 11px 20px;
      text-align: center;
      font-size: 0.9rem;
      font-weight: 600;
      line-height: 1.5;
      position: relative;
      z-index: 200;
      box-sizing: border-box;
      letter-spacing: 0.01em;
    }
    #tj-announcement-bar.ann-event {
      background: rgba(138,43,239,0.18);
      border-bottom: 1px solid rgba(138,43,239,0.35);
      color: #e9d5ff;
    }
    #tj-announcement-bar.ann-info {
      background: rgba(59,130,246,0.15);
      border-bottom: 1px solid rgba(59,130,246,0.3);
      color: #bfdbfe;
    }
    #tj-announcement-bar.ann-urgent {
      background: rgba(239,68,68,0.15);
      border-bottom: 1px solid rgba(239,68,68,0.35);
      color: #fca5a5;
    }
    #tj-announcement-bar.ann-success {
      background: rgba(16,185,129,0.13);
      border-bottom: 1px solid rgba(86,224,210,0.3);
      color: #6ee7b7;
    }
    #tj-announcement-bar a {
      color: inherit;
      text-decoration: underline;
    }
    #tj-announcement-bar a:hover {
      opacity: 0.85;
    }
    #tj-ann-close {
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: inherit;
      opacity: 0.6;
      cursor: pointer;
      font-size: 1.1rem;
      padding: 4px 8px;
      line-height: 1;
    }
    #tj-ann-close:hover { opacity: 1; }
  `;
  document.head.appendChild(style);

  // Create the banner element
  var bar = document.createElement('div');
  bar.id = 'tj-announcement-bar';
  bar.setAttribute('role', 'status');
  bar.setAttribute('aria-live', 'polite');

  // Inject into DOM — before <nav> or at top of <body>
  function injectBanner() {
    var nav = document.querySelector('nav, .site-nav, header');
    if (nav && nav.parentNode) {
      nav.parentNode.insertBefore(bar, nav);
    } else {
      document.body.insertBefore(bar, document.body.firstChild);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectBanner);
  } else {
    injectBanner();
  }

  // Load and render announcement
  function loadAnnouncement() {
    var cfg = window.TJ_PUBLIC_CONFIG;
    if (!cfg || !cfg.supabaseUrl || cfg.supabaseUrl.includes('SUPABASE')) return;

    try {
      var db = supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
      db.from('site_content')
        .select('key,value')
        .in('key', ['announcement_text', 'announcement_active', 'announcement_type', 'announcement_link'])
        .then(function(res) {
          if (!res.data) return;
          var kv = {};
          res.data.forEach(function(r) { kv[r.key] = r.value; });

          if (kv.announcement_active !== 'true') return;
          var text = (kv.announcement_text || '').trim();
          if (!text) return;

          var type = kv.announcement_type || 'event';
          var link = kv.announcement_link || '';

          bar.className = 'ann-' + type;

          // Close button
          var closeBtn = document.createElement('button');
          closeBtn.id = 'tj-ann-close';
          closeBtn.setAttribute('aria-label', 'Dismiss announcement');
          closeBtn.textContent = '✕';
          closeBtn.onclick = function() { bar.style.display = 'none'; };

          // Content — wrap in <a> if link provided
          var content = link
            ? '<a href="' + esc(link) + '" target="_blank" rel="noopener">' + esc(text) + '</a>'
            : esc(text);

          bar.innerHTML = content;
          bar.appendChild(closeBtn);
          bar.style.display = 'block';
        })
        .catch(function() { /* silent — don't break the page */ });
    } catch(e) {
      // Supabase not available or error — silent
    }
  }

  function esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // Wait for both DOM and supabase to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      if (typeof supabase !== 'undefined') {
        loadAnnouncement();
      } else {
        // supabase CDN may still be loading
        window.addEventListener('load', loadAnnouncement);
      }
    });
  } else {
    if (typeof supabase !== 'undefined') {
      loadAnnouncement();
    } else {
      window.addEventListener('load', loadAnnouncement);
    }
  }
})();
