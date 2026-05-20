/**
 * Twizted Journeys — Admin Config
 * ================================
 * Replace SUPABASE_URL_HERE and SUPABASE_ANON_KEY_HERE with your real values.
 *
 * Where to get them:
 *   supabase.com → your project → Settings → API
 *   Copy "Project URL" and "anon public" key.
 *
 * NEVER use the service_role key here. Only the anon key.
 * RLS policies in Supabase control what each user can read/write.
 *
 * This file is safe to commit to GitHub — the anon key is designed to be public.
 */

const TJ_CONFIG = {
  supabaseUrl:     'SUPABASE_URL_HERE',
  supabaseAnonKey: 'SUPABASE_ANON_KEY_HERE'
};

window.TJ_CONFIG = TJ_CONFIG;
