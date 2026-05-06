-- 00032_zenith_admin_alignment.sql
-- ZENITH ARCHITECTURE: ROBUST ADMINISTRATIVE IDENTITY RESOLUTION
-- This migration repairs the 403 Forbidden errors by ensuring that "owner", "superadmin", 
-- and other high-level roles are correctly identified as 'admin' for RLS purposes.

-- 1. RE-ESTABLISH ROBUST ROLE RESOLUTION
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_type text;
    v_email text;
    v_target_id text;
BEGIN
    -- 0. Resolve Identity (Standardized Zenith Protocol)
    -- We attempt to use the salted UUID version if available, otherwise fall back to raw translation.
    BEGIN
        v_target_id := public.requesting_user_id_uuid()::text;
    EXCEPTION WHEN OTHERS THEN
        v_target_id := public.translate_clerk_id_to_uuid(public.requesting_user_id())::text;
    END;

    -- 1. Get user profile data
    SELECT user_type, email INTO v_user_type, v_email
    FROM public.profiles 
    WHERE id::text = v_target_id;

    -- 2. Handle null profile (default to student)
    IF v_user_type IS NULL THEN
        RETURN 'student';
    END IF;

    -- 3. Standardize for comparison
    v_user_type := lower(v_user_type);

    -- 4. Keyword-Based Admin Resolution
    -- If the user_type string contains any of these keywords, they are treated as 'admin' 
    -- for the purposes of the "Admin Master Override" RLS policies.
    IF v_user_type ~ '(admin|owner|ceo|superadmin|bdo|moderator|manager|official|hr)' THEN
        RETURN 'admin';
    END IF;

    -- 5. Master Email Override (Hardcoded fail-safe for system owners)
    IF v_email IN ('abhinavjha393@gmail.com', 'abhinav.vsavwe4899@gmail.com') THEN
        RETURN 'admin';
    END IF;

    RETURN v_user_type;
END;
$$;

-- 2. HARMONIZE ADDITIONAL SECURITY HELPERS
-- Function to check if a user is a "High Ranked Official" (Admin, Superadmin, Owner, or Elite Tier)
CREATE OR REPLACE FUNCTION public.is_high_ranked(p_user_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (public.get_current_user_role() = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a user is Admin Staff (Harmonized with Zenith Identity)
CREATE OR REPLACE FUNCTION public.is_admin_staff(p_user_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (public.get_current_user_role() = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. RE-SYNCHRONIZE MASTER OVERRIDE POLICIES
-- We re-run the stabilization logic to ensure all tables are using the updated role function.
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
        'security_logs', 'progress_goals', 'progress_entries', 'user_calendar_events',
        'calendar_events'
    ];
BEGIN
    FOREACH v_table IN ARRAY v_tables LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = v_table AND table_schema = 'public') THEN
            -- Re-apply the Admin Master Override
            -- This policy allows full access if get_current_user_role() returns 'admin'
            -- We now include 'profiles' to ensure admins can see all users.
            IF v_table != 'security_logs' THEN
                EXECUTE format('DROP POLICY IF EXISTS "Admin Master Override for %I" ON public.%I', v_table, v_table);
                EXECUTE format('CREATE POLICY "Admin Master Override for %I" ON public.%I FOR ALL USING (public.get_current_user_role() = ''admin'')', v_table, v_table);
            END IF;
        END IF;
    END LOOP;
END $$;

-- 3. GRANT PERMISSIONS
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO anon, authenticated, service_role;

COMMENT ON FUNCTION public.get_current_user_role() IS 'Robust role resolver that maps high-level roles (owner, superadmin, etc.) to ''admin'' for platform-wide RLS compatibility.';
