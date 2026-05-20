/**
 * admin/auth.js — Shared Supabase auth guard for all admin pages
 *
 * Usage (include AFTER supabase-js CDN and config.js):
 *   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *   <script src="config.js"></script>
 *   <script src="auth.js"></script>
 *   <script>
 *     initAdmin(function(user, db) {
 *       // page is authenticated — user and supabase client available
 *     });
 *   </script>
 */

async function initAdmin(onReady) {
  const cfg = window.TJ_CONFIG;

  // Config not set yet — show setup message
  if (!cfg || cfg.supabaseUrl === 'SUPABASE_URL_HERE') {
    document.getElementById('admin-loading')?.remove();
    const msg = document.getElementById('setup-msg');
    if (msg) msg.style.display = 'block';
    return;
  }

  // Create Supabase client
  const db = supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
  window.TJ_SUPABASE = db;

  // Check for existing session
  const { data: { session } } = await db.auth.getSession();

  if (!session) {
    // Not logged in — go to login page
    window.location.href = '/admin/index.html';
    return;
  }

  // Update user display
  const emailEl = document.getElementById('user-email');
  if (emailEl) emailEl.textContent = session.user.email;

  // Hide loading state if present
  document.getElementById('admin-loading')?.remove();

  // Call the page's ready callback
  if (typeof onReady === 'function') onReady(session.user, db);
}

async function adminSignOut() {
  const db = window.TJ_SUPABASE;
  if (db) await db.auth.signOut();
  window.location.href = '/admin/index.html';
}
