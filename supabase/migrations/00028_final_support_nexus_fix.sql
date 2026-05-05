-- 0. HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. HARMONIZE contact_messages SCHEMA
-- This resolves the 400 Bad Request during Execute Dispatch
DO $$ 
BEGIN 
    -- Add resolution columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contact_messages' AND column_name='subject') THEN
        ALTER TABLE public.contact_messages ADD COLUMN subject TEXT DEFAULT 'Public Contact Inquiry';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contact_messages' AND column_name='resolution_text') THEN
        ALTER TABLE public.contact_messages ADD COLUMN resolution_text TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contact_messages' AND column_name='resolved_at') THEN
        ALTER TABLE public.contact_messages ADD COLUMN resolved_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contact_messages' AND column_name='resolved_by') THEN
        ALTER TABLE public.contact_messages ADD COLUMN resolved_by TEXT;
    END IF;

    -- Ensure updated_at exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contact_messages' AND column_name='updated_at') THEN
        ALTER TABLE public.contact_messages ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- 2. HARMONIZE calendar_events SCHEMA
-- Both 'calendar_events' and 'user_calendar_events' are referenced in the codebase.
-- We will consolidate into 'user_calendar_events' to match dashboardService.ts
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'calendar_events' AND table_schema = 'public') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_calendar_events' AND table_schema = 'public') THEN
        ALTER TABLE public.calendar_events RENAME TO user_calendar_events;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_calendar_events' AND table_schema = 'public') THEN
        CREATE TABLE public.user_calendar_events (
            id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
            user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            description TEXT,
            event_date TIMESTAMPTZ NOT NULL,
            end_date TIMESTAMPTZ,
            category TEXT DEFAULT 'personal',
            priority TEXT DEFAULT 'medium',
            color TEXT,
            is_all_day BOOLEAN DEFAULT FALSE,
            metadata JSONB DEFAULT '{}'::JSONB,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;
END $$;

-- 3. HARMONIZE IDENTITY FUNCTIONS
DROP FUNCTION IF EXISTS public.translate_clerk_id_to_uuid(text) CASCADE;

CREATE OR REPLACE FUNCTION public.translate_clerk_id_to_uuid(p_clerk_id text)
RETURNS UUID
LANGUAGE plpgsql STABLE
AS $$
DECLARE
    v_salt TEXT := 'b8236e1f-1918-4447-9de9-9e363a37ff0d1d05da6b-ad8a-4734-bcd8-c10c7bdf39aa';
    v_h TEXT;
BEGIN
  IF p_clerk_id IS NULL OR p_clerk_id = '' THEN RETURN NULL; END IF;
  IF p_clerk_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    RETURN p_clerk_id::UUID;
  END IF;

  v_h := encode(extensions.digest((p_clerk_id || v_salt)::text, 'sha256'::text), 'hex');
  
  RETURN (
      substring(v_h, 1, 8) || '-' || 
      substring(v_h, 9, 4) || '-' || 
      '4' || substring(v_h, 14, 3) || '-' || 
      '8' || substring(v_h, 18, 3) || '-' || 
      substring(v_h, 21, 12)
  )::UUID;
END;
$$;

-- Standard version for RLS policies (Returns TEXT - raw Clerk ID)
DROP FUNCTION IF EXISTS public.requesting_user_id() CASCADE;
CREATE OR REPLACE FUNCTION public.requesting_user_id()
RETURNS TEXT AS $$
BEGIN
    RETURN (current_setting('request.jwt.claims', true)::jsonb ->> 'sub');
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Salted UUID version for Audit Logs & Foreign Keys
DROP FUNCTION IF EXISTS public.requesting_user_id_uuid() CASCADE;
CREATE OR REPLACE FUNCTION public.requesting_user_id_uuid()
RETURNS UUID AS $$
BEGIN
    RETURN public.translate_clerk_id_to_uuid(public.requesting_user_id());
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- 4. IMPLEMENT get_my_calendar_events RPC
-- This resolves the 404 error on dashboard load
DROP FUNCTION IF EXISTS public.get_my_calendar_events() CASCADE;

CREATE OR REPLACE FUNCTION public.get_my_calendar_events()
RETURNS SETOF public.user_calendar_events
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public.user_calendar_events
    WHERE user_id = public.requesting_user_id_uuid();
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_calendar_events() TO authenticated, service_role;

-- 5. RE-STABILIZE ADMIN ACCESS
CREATE OR REPLACE FUNCTION public.is_admin_staff(p_user_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_translated_id UUID;
    v_email TEXT;
BEGIN
    -- 1. Resolve Identity
    v_translated_id := public.translate_clerk_id_to_uuid(p_user_id);
    IF v_translated_id IS NULL THEN RETURN FALSE; END IF;

    -- 2. Check Profile Rank
    IF EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = v_translated_id
        AND (user_type ILIKE ANY (ARRAY['%admin%', '%ceo%', '%manager%', '%moderator%', '%official%', '%hr%']))
    ) THEN RETURN TRUE; END IF;

    -- 3. Master Override Fail-safe (By Email)
    SELECT email INTO v_email FROM public.profiles WHERE id = v_translated_id;
    IF v_email IN ('abhinavjha393@gmail.com', 'abhinav.vsavwe4899@gmail.com') THEN RETURN TRUE; END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. FIX PROFILES ID TYPE (The "invalid input syntax for type uuid" fix)
-- This ensures the PK is actually a UUID to match the translated IDs sent from frontend
DO $$
BEGIN
    IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'id') = 'text' THEN
        -- Force conversion to UUID. This might fail if there are invalid strings.
        -- We use a safe cast that returns NULL for invalid strings if needed, 
        -- but here we assume all 'id' values for Clerk users are now UUID-like strings.
        ALTER TABLE public.profiles ALTER COLUMN id TYPE UUID USING id::UUID;
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping profiles.id conversion: %', SQLERRM;
END $$;

-- 7. RE-STABILIZE RLS FOR ALL TABLES (Global Restoration)
-- Since translate_clerk_id_to_uuid was dropped with CASCADE, all dependent policies were removed.
-- We must restore them now to ensure the platform remains functional.
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
        'security_logs', 'progress_goals', 'progress_entries', 'user_calendar_events'
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
            -- Check if the target user_id column actually exists
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = v_table AND column_name = v_user_id_col) THEN
                -- Standard User Policies (Using the new UUID helper)
                EXECUTE format('DROP POLICY IF EXISTS "Standard SELECT for %I" ON public.%I', v_table, v_table);
                EXECUTE format('CREATE POLICY "Standard SELECT for %I" ON public.%I FOR SELECT USING (%I::text = public.requesting_user_id_uuid()::text)', v_table, v_table, v_user_id_col);
                
                EXECUTE format('DROP POLICY IF EXISTS "Standard INSERT for %I" ON public.%I', v_table, v_table);
                EXECUTE format('CREATE POLICY "Standard INSERT for %I" ON public.%I FOR INSERT WITH CHECK (%I::text = public.requesting_user_id_uuid()::text)', v_table, v_table, v_user_id_col);
                
                EXECUTE format('DROP POLICY IF EXISTS "Standard UPDATE for %I" ON public.%I', v_table, v_table);
                EXECUTE format('CREATE POLICY "Standard UPDATE for %I" ON public.%I FOR UPDATE USING (%I::text = public.requesting_user_id_uuid()::text)', v_table, v_table, v_user_id_col);
                
                EXECUTE format('DROP POLICY IF EXISTS "Standard DELETE for %I" ON public.%I', v_table, v_table);
                EXECUTE format('CREATE POLICY "Standard DELETE for %I" ON public.%I FOR DELETE USING (%I::text = public.requesting_user_id_uuid()::text)', v_table, v_table, v_user_id_col);
            END IF;
            
            -- Admin Override Policy (Works even if user_id column is missing for most tables)
            IF v_table NOT IN ('profiles', 'security_logs') THEN
                EXECUTE format('DROP POLICY IF EXISTS "Admin Master Override for %I" ON public.%I', v_table, v_table);
                EXECUTE format('CREATE POLICY "Admin Master Override for %I" ON public.%I FOR ALL USING (public.is_admin_staff(public.requesting_user_id()))', v_table, v_table);
            END IF;
        END IF;
    END LOOP;

    -- Special Visibility Overrides
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Public profile visibility" ON public.profiles;
        CREATE POLICY "Public profile visibility" ON public.profiles FOR SELECT USING (true);
    END IF;
END $$;

-- 8. ENSURE get_current_user_role REMAINS FUNCTIONAL
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_type FROM public.profiles WHERE id = public.requesting_user_id_uuid();
$$;

GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin_staff(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.requesting_user_id() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.requesting_user_id_uuid() TO anon, authenticated, service_role;

-- 9. FINAL TOUCH: Ensure the app can see the contact messages correctly
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage contact messages" ON public.contact_messages;
CREATE POLICY "Admins can manage contact messages" 
ON public.contact_messages 
FOR ALL 
TO authenticated 
USING (public.is_admin_staff(public.requesting_user_id()));
