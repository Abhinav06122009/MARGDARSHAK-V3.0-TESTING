-- 99999_final_rls_stabilization.sql
-- ZENITH ARCHITECTURE: CRITICAL IDENTITY ALIGNMENT & TYPE-SAFE RESOLUTION
-- This migration ensures that the Postgres identity translation perfectly matches the JS implementation.
-- It resolves the "column user_id is of type uuid but expression is of type text" error by returning UUID type.

-- 1. CLEANUP EXISTING IDENTITY CHAIN
-- We must DROP with CASCADE because policies and other functions depend on these.
DROP FUNCTION IF EXISTS public.requesting_user_id() CASCADE;
DROP FUNCTION IF EXISTS public.translate_clerk_id_to_uuid(text) CASCADE;

-- 2. RE-ESTABLISH THE DETERMINISTIC IDENTITY FUNCTION
-- We return UUID type now to satisfy Postgres type strictness on UUID columns.
CREATE OR REPLACE FUNCTION public.translate_clerk_id_to_uuid(p_clerk_id text)
RETURNS uuid
LANGUAGE plpgsql STABLE
AS $$
DECLARE
    v_salt text;
    v_combined text;
    v_h text;
    v_clean_clerk_id text;
    v_uuid_str text;
BEGIN
    -- Handle null/empty inputs immediately
    IF p_clerk_id IS NULL OR p_clerk_id = '' THEN
        RETURN NULL;
    END IF;

    v_clean_clerk_id := trim(p_clerk_id);

    -- 1. UUID Check: If already a valid UUID, return it as a UUID type.
    IF v_clean_clerk_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
        RETURN v_clean_clerk_id::uuid;
    END IF;

    -- 2. Get Salt (Must match VITE_ID_SALT in .env)
    v_salt := current_setting('app.settings.id_salt', true);
    IF v_salt IS NULL OR v_salt = '' THEN
        v_salt := 'b8236e1f-1918-4447-9de9-9e363a37ff0d1d05da6b-ad8a-4734-bcd8-c10c7bdf39aa';
    END IF;
    
    v_salt := trim(v_salt);

    -- 3. Deterministic Hashing
    v_combined := v_clean_clerk_id || v_salt;
    v_h := encode(extensions.digest(v_combined::text, 'sha256'::text), 'hex');

    -- 4. UUID Construction (8-4-4-4-12 format)
    v_uuid_str := 
      substring(v_h, 1, 8) || '-' || 
      substring(v_h, 9, 4) || '-' || 
      '4' || substring(v_h, 14, 3) || '-' || 
      '8' || substring(v_h, 18, 3) || '-' || 
      substring(v_h, 21, 12);
      
    RETURN v_uuid_str::uuid;
END;
$$;

-- 3. RE-ESTABLISH THE REQUESTING USER IDENTITY HELPER
CREATE OR REPLACE FUNCTION public.requesting_user_id()
RETURNS uuid
LANGUAGE sql STABLE
AS $$
  SELECT public.translate_clerk_id_to_uuid(nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::text);
$$;

-- 4. RESTORE ALL POLICIES (Required because of CASCADE drop)
DO $$
DECLARE
    v_table text;
    v_tables text[] := ARRAY[
        'profiles', 'courses', 'notes', 'note_folders', 'tasks', 'todos', 
        'ai_neural_memory', 'exams', 'grades', 'assignments', 'submissions', 
        'study_sessions', 'user_timetables', 'enrollments', 'announcements', 
        'medications', 'symptoms', 'reports', 'timetable_events', 'study_plans', 
        'smart_notes', 'syllabi', 'deadlines', 'blocked_users', 'admin_reports', 
        'admin_users', 'security_threats', 'support_tickets', 'user_activity_logs', 
        'security_logs'
    ];
    v_user_id_col text;
BEGIN
    FOREACH v_table IN ARRAY v_tables LOOP
        -- Determine user_id column name
        IF v_table = 'profiles' THEN v_user_id_col := 'id';
        ELSIF v_table = 'enrollments' OR v_table = 'submissions' THEN v_user_id_col := 'student_id';
        ELSIF v_table = 'assignments' THEN v_user_id_col := 'created_by';
        ELSIF v_table = 'announcements' THEN v_user_id_col := 'author_id';
        ELSE v_user_id_col := 'user_id';
        END IF;

        -- Check if table exists before creating policies
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = v_table AND table_schema = 'public') THEN
            -- Use ::text = ::text comparison for maximum compatibility across column types
            EXECUTE format('DROP POLICY IF EXISTS "Standard SELECT for %I" ON public.%I', v_table, v_table);
            EXECUTE format('CREATE POLICY "Standard SELECT for %I" ON public.%I FOR SELECT USING (%I::text = public.requesting_user_id()::text)', v_table, v_table, v_user_id_col);
            
            EXECUTE format('DROP POLICY IF EXISTS "Standard INSERT for %I" ON public.%I', v_table, v_table);
            EXECUTE format('CREATE POLICY "Standard INSERT for %I" ON public.%I FOR INSERT WITH CHECK (%I::text = public.requesting_user_id()::text)', v_table, v_table, v_user_id_col);
            
            EXECUTE format('DROP POLICY IF EXISTS "Standard UPDATE for %I" ON public.%I', v_table, v_table);
            EXECUTE format('CREATE POLICY "Standard UPDATE for %I" ON public.%I FOR UPDATE USING (%I::text = public.requesting_user_id()::text)', v_table, v_table, v_user_id_col);
            
            EXECUTE format('DROP POLICY IF EXISTS "Standard DELETE for %I" ON public.%I', v_table, v_table);
            EXECUTE format('CREATE POLICY "Standard DELETE for %I" ON public.%I FOR DELETE USING (%I::text = public.requesting_user_id()::text)', v_table, v_table, v_user_id_col);
            
            -- Admin Master Override
            EXECUTE format('DROP POLICY IF EXISTS "Admin Master Override for %I" ON public.%I', v_table, v_table);
            EXECUTE format('CREATE POLICY "Admin Master Override for %I" ON public.%I FOR ALL USING (public.get_current_user_role()::text = ''admin'')', v_table, v_table);
        END IF;
    END LOOP;

    -- Special Visibility Overrides
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Public profile visibility" ON public.profiles;
        CREATE POLICY "Public profile visibility" ON public.profiles FOR SELECT USING (true);
    END IF;
END $$;

COMMENT ON FUNCTION public.translate_clerk_id_to_uuid(text) IS 'Deterministic UUID translation harmonized with frontend id-translator.ts. Returns UUID type.';
COMMENT ON FUNCTION public.requesting_user_id() IS 'Security-hardened identity resolver for RLS policies. Returns UUID type.';
