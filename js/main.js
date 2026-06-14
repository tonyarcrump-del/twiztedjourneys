// Twizted Journeys — Main JS

// Mobile nav toggle
function toggleNav(btn) {
  const nav = document.getElementById('nav-links');
  const isOpen = nav.classList.toggle('open');
  btn.setAttribute('aria-expanded', isOpen);
  btn.textContent = isOpen ? '✕' : '☰';
}

// Close nav when a link is clicked on mobile
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    const nav = document.getElementById('nav-links');
    const btn = document.querySelector('.nav-toggle');
    if (nav.classList.contains('open')) {
      nav.classList.remove('open');
      if (btn) { btn.setAttribute('aria-expanded', false); btn.textContent = '☰'; }
    }
  });
});

// Highlight active nav link based on current page
(function () {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')) {
      a.classList.add('active');
    } else {
      a.classList.remove('active');
    }
  });
})();


/* Emergency merch link guard - 2026-06-14 */
(function () {
  const BAD_HOST = 'shop.twiztedjourneys.org';
  const GOOD_PATH = '/merch.html';

  function fixMerchLinks() {
    document.querySelectorAll('a[href]').forEach((a) => {
      const href = a.getAttribute('href') || '';
      const text = (a.textContent || '').toLowerCase();

      if (
        href.includes(BAD_HOST) ||
        href.includes('/twizted-merch') ||
        text.includes('merch')
      ) {
        a.setAttribute('href', GOOD_PATH);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', fixMerchLinks);
  window.addEventListener('load', fixMerchLinks);
  setTimeout(fixMerchLinks, 500);
  setTimeout(fixMerchLinks, 1500);

  document.addEventListener('click', function (e) {
    const link = e.target.closest && e.target.closest('a[href]');
    if (!link) return;

    const href = link.getAttribute('href') || '';

    if (href.includes(BAD_HOST) || href.includes('/twizted-merch')) {
      e.preventDefault();
      window.location.href = GOOD_PATH;
    }
  }, true);
})();
