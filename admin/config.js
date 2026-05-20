/**
 * Twizted Journeys — Admin Config
 * ================================
 * Replace the PLACEHOLDER values below with your real Supabase credentials
 * BEFORE enabling admin access.
 *
 * How to get these:
 *  1. Create a Supabase project at https://supabase.com
 *  2. Go to Project Settings → API
 *  3. Copy "Project URL" → SUPABASE_URL
 *  4. Copy "anon public" key → SUPABASE_ANON_KEY
 *
 * NEVER put the service_role key here. Only anon key is safe in client code.
 * Row-Level Security policies in Supabase control what anon users can see.
 *
 * Netlify Identity handles authentication separately.
 * Admin pages check for a logged-in Netlify Identity user before making any
 * Supabase request. Unauthenticated visitors cannot read or write admin data.
 */

const TJ_CONFIG = {
  supabaseUrl:     'SUPABASE_URL_HERE',
  supabaseAnonKey: 'SUPABASE_ANON_KEY_HERE',

  // Netlify Identity site URL (set to your Netlify subdomain or custom domain)
  // Example: 'https://twiztedjourneys.netlify.app' or 'https://www.twiztedjourneys.org'
  siteUrl: 'https://www.twiztedjourneys.org',

  // Admin email addresses allowed to access this panel
  // (Netlify Identity invite-only enforces this — this is an extra guard)
  adminEmails: [
    'tonyarcrump@gmail.com'
  ]
};

// Expose for admin pages
window.TJ_CONFIG = TJ_CONFIG;
