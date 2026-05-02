-- 00022_final_database_sync.sql
-- ZENITH STABILIZATION: FINAL ARCHITECTURAL SYNCHRONIZATION
-- This migration ensures all critical tables and functions exist for the production environment.

-- 1. Ensure clerk_id exists in profiles
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='clerk_id') THEN
        ALTER TABLE public.profiles ADD COLUMN clerk_id text;
    END IF;
END $$;

-- 2. Ensure get_current_user_role function exists
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_type FROM public.profiles WHERE id::text = public.requesting_user_id()::text;
$$;

GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO anon, authenticated, service_role;

-- 3. Ensure Progress Goals Table exists
CREATE TABLE IF NOT EXISTS public.progress_goals (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    target_value NUMERIC NOT NULL DEFAULT 0,
    current_value NUMERIC NOT NULL DEFAULT 0,
    unit TEXT NOT NULL,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    target_date DATE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Ensure Progress Entries Table exists
CREATE TABLE IF NOT EXISTS public.progress_entries (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    goal_id UUID NOT NULL REFERENCES public.progress_goals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    value NUMERIC NOT NULL,
    notes TEXT,
    date_recorded DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Re-enable RLS on progress tables
ALTER TABLE public.progress_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_entries ENABLE ROW LEVEL SECURITY;

-- 6. Ensure requesting_user_id() is correctly defined and returns UUID
-- (Harmonized with 99999_final_rls_stabilization.sql)
CREATE OR REPLACE FUNCTION public.requesting_user_id()
RETURNS uuid
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.translate_clerk_id_to_uuid(nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::text);
$$;

-- 7. Ensure Standard Policies for Progress Tables
DO $$
DECLARE
    v_table text;
    v_tables text[] := ARRAY['progress_goals', 'progress_entries'];
BEGIN
    FOREACH v_table IN ARRAY v_tables LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Standard SELECT for %I" ON public.%I', v_table, v_table);
        EXECUTE format('CREATE POLICY "Standard SELECT for %I" ON public.%I FOR SELECT USING (user_id::text = public.requesting_user_id()::text)', v_table, v_table);
        
        EXECUTE format('DROP POLICY IF EXISTS "Standard INSERT for %I" ON public.%I', v_table, v_table);
        EXECUTE format('CREATE POLICY "Standard INSERT for %I" ON public.%I FOR INSERT WITH CHECK (user_id::text = public.requesting_user_id()::text)', v_table, v_table);
        
        EXECUTE format('DROP POLICY IF EXISTS "Standard UPDATE for %I" ON public.%I', v_table, v_table);
        EXECUTE format('CREATE POLICY "Standard UPDATE for %I" ON public.%I FOR UPDATE USING (user_id::text = public.requesting_user_id()::text)', v_table, v_table);
        
        EXECUTE format('DROP POLICY IF EXISTS "Standard DELETE for %I" ON public.%I', v_table, v_table);
        EXECUTE format('CREATE POLICY "Standard DELETE for %I" ON public.%I FOR DELETE USING (user_id::text = public.requesting_user_id()::text)', v_table, v_table);
    END LOOP;
END $$;

-- 8. Final Grant for Progress Tracking
GRANT ALL ON public.progress_goals TO authenticated;
GRANT ALL ON public.progress_entries TO authenticated;
GRANT ALL ON public.progress_goals TO service_role;
GRANT ALL ON public.progress_entries TO se