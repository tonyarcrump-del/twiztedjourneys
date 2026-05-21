-- ============================================================
--  Fix: Function Search Path Mutable
--  Supabase Security Advisor — Error fix
--  Run in Supabase SQL Editor
-- ============================================================
--
--  The update_site_content function has a mutable search_path,
--  which can allow schema injection. This recreates it with a
--  fixed search_path = public, '' to lock it down.
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_site_content(p_key TEXT, p_value TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, ''
AS $$
BEGIN
  INSERT INTO public.site_content (key, value, updated_at)
  VALUES (p_key, p_value, NOW())
  ON CONFLICT (key)
  DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
END;
$$;
