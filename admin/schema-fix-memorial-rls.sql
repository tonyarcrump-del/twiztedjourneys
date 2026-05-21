-- ============================================================
--  schema-fix-memorial-rls.sql
--  Fix overly permissive RLS on public.memorial_submissions
-- ============================================================
--
--  Run this in: supabase.com → your project → SQL Editor
--
--  The Security Advisor flagged an "always true" RLS policy on
--  the memorial_submissions table. This replaces it with proper
--  role-based policies:
--    • Anyone can INSERT (submit a memorial — public form)
--    • Only authenticated admins can SELECT / UPDATE / DELETE
-- ============================================================

-- Step 1: Drop all existing policies on memorial_submissions
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'memorial_submissions'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.memorial_submissions', pol.policyname);
  END LOOP;
END $$;

-- Step 2: Make sure RLS is enabled
ALTER TABLE public.memorial_submissions ENABLE ROW LEVEL SECURITY;

-- Step 3: Create correct policies

-- Anyone can submit a memorial (public form)
CREATE POLICY "memorial_submissions: public insert"
  ON public.memorial_submissions
  FOR INSERT
  WITH CHECK (true);

-- Only authenticated users (admins) can read submissions
CREATE POLICY "memorial_submissions: auth select"
  ON public.memorial_submissions
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only authenticated users can update (e.g. approve/status changes)
CREATE POLICY "memorial_submissions: auth update"
  ON public.memorial_submissions
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Only authenticated users can delete
CREATE POLICY "memorial_submissions: auth delete"
  ON public.memorial_submissions
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================================
-- After running: go to Security Advisor → Rerun linter
-- The "RLS Policy Always True" warning should be gone.
-- ============================================================
