/**
 * tj-public-config.js — Public Supabase config for form submissions
 *
 * Replace the placeholder values with your real Supabase credentials.
 * The anon key is designed to be public — Supabase RLS controls access.
 *
 * How to get these:
 *   supabase.com → your project → Settings → API
 *   Copy "Project URL" and "anon public" key.
 */

window.TJ_PUBLIC_CONFIG = {
  supabaseUrl:     'SUPABASE_URL_HERE',
  supabaseAnonKey: 'SUPABASE_ANON_KEY_HERE'
};
