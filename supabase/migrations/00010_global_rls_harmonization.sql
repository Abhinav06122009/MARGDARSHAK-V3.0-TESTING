-- 00010_global_rls_harmonization.sql
-- Force-syncs all Row Level Security policies to use the deterministic UUID identity standard.
-- This migration drops and recreates policies for all academic and personal data tables.

-- 1. UTILITY: Drop all policies for a table
CREATE OR REPLACE FUNCTION public.drop_all_policies(p_table_name text) 
RETURNS void AS $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = p_table_name AND schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, p_table_name);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 2. HARMONIZE TABLES
DO $$
DECLARE
    v_tables text[] := ARRAY[
        'profiles', 'courses', 'attendance', 'notes', 'note_folders', 'tasks', 'todos', 
        'ai_neural_memory', 'exams', 'grades', 'assignments', 'submissions', 
        'study_sessions', 'user_timetables', 'enrollments', 'announcements', 
        'medications', 'symptoms', 'reports', 'timetable_events', 'study_plans', 
        'smart_notes', 'syllabi', 'deadlines', 'blocked_users', 'admin_reports', 
        'admin_users', 'security_threats', 'support_tickets', 'user_activity_logs', 
        'security_logs'
    ];
    v_table text;
    v_user_id_col text;
BEGIN
    FOREACH v_table IN ARRAY v_tables LOOP
        -- Clear existing policies
        PERFORM public.drop_all_policies(v_table);
        
        -- Determine user_id column name (profiles uses 'id', others use 'user_id', 'student_id', etc.)
        IF v_table = 'profiles' THEN
            v_user_id_col := 'id';
        ELSIF v_table = 'enrollments' OR v_table = 'submissions' THEN
            v_user_id_col := 'student_id';
        ELSIF v_table = 'assignments' THEN
            v_user_id_col := 'created_by';
        ELSIF v_table = 'announcements' THEN
            v_user_id_col := 'author_id';
        ELSE
            v_user_id_col := 'user_id';
        END IF;

        -- Create Standard Granular Policies
        
        -- SELECT
        EXECUTE format('CREATE POLICY "Standard SELECT for %I" ON public.%I FOR SELECT USING (%I = public.requesting_user_id())', v_table, v_table, v_user_id_col);
        
        -- INSERT
        EXECUTE format('CREATE POLICY "Standard INSERT for %I" ON public.%I FOR INSERT WITH CHECK (%I = public.requesting_user_id())', v_table, v_table, v_user_id_col);
        
        -- UPDATE
        EXECUTE format('CREATE POLICY "Standard UPDATE for %I" ON public.%I FOR UPDATE USING (%I = public.requesting_user_id())', v_table, v_table, v_user_id_col);
        
        -- DELETE
        EXECUTE format('CREATE POLICY "Standard DELETE for %I" ON public.%I FOR DELETE USING (%I = public.requesting_user_id())', v_table, v_table, v_user_id_col);
        
        -- Special Overrides
        IF v_table = 'profiles' THEN
            EXECUTE 'CREATE POLICY "Public profile visibility" ON public.profiles FOR SELECT USING (true)';
        ELSIF v_table = 'courses' THEN
            EXECUTE 'CREATE POLICY "Teacher access for courses" ON public.courses FOR ALL USING (teacher_id = public.requesting_user_id())';
        END IF;
    END LOOP;
END $$;

-- 3. ADMINISTRATIVE MASTER BYPASS
-- Admins and CEOs need access to everything for support and moderation
DO $$
DECLARE
    v_table text;
    v_tables text[] := ARRAY[
        'profiles', 'courses', 'attendance', 'notes', 'note_folders', 'tasks', 'todos', 
        'ai_neural_memory', 'exams', 'grades', 'assignments', 'submissions', 
        'study_sessions', 'user_timetables', 'enrollments', 'announcements', 
        'medications', 'symptoms', 'reports', 'timetable_events', 'study_plans', 
        'smart_notes', 'syllabi', 'deadlines', 'blocked_users', 'admin_reports', 
        'admin_users', 'security_threats', 'support_tickets', 'user_activity_logs', 
        'security_logs'
    ];
BEGIN
    FOREACH v_table IN ARRAY v_tables LOOP
        EXECUTE format('CREATE POLICY "Admin Master Override for %I" ON public.%I FOR ALL USING (public.get_current_user_role() = ''admin'')', v_table, v_table);
    END LOOP;
END $$;

-- 4. CLEANUP
DROP FUNCTION IF EXISTS public.drop_all_policies(text);
