-- 00009_id_translation_stabilization.sql
-- Comprehensive ID Normalization for Zenith Architecture
-- Migrates all Clerk Identity strings to Deterministic UUIDs (SHA-256)

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. HELPER FUNCTION: Deterministic ID Translation
CREATE OR REPLACE FUNCTION public.translate_clerk_id_to_uuid(p_clerk_id text)
RETURNS text
LANGUAGE sql STABLE
AS $$
  SELECT (
    WITH hash AS (
      SELECT encode(extensions.digest(p_clerk_id::text, 'sha256'::text), 'hex') as h
    )
    SELECT 
      substring(h, 1, 8) || '-' || 
      substring(h, 9, 4) || '-' || 
      '4' || substring(h, 14, 3) || '-' || 
      '8' || substring(h, 18, 3) || '-' || 
      substring(h, 21, 12)
    FROM hash
  );
$$;

-- 3. CASCADING IDENTITY NORMALIZATION
-- We must drop and recreate foreign keys with ON UPDATE CASCADE to allow the ID translation to propagate.

-- Helper procedure to ensure ON UPDATE CASCADE for a foreign key
CREATE OR REPLACE FUNCTION public.enable_cascading_id_updates(
    p_table_name text, 
    p_column_name text, 
    p_ref_table text, 
    p_ref_column text
) RETURNS void AS $$
DECLARE
    v_constraint_record RECORD;
    v_new_constraint_name text := p_table_name || '_' || p_column_name || '_fkey';
BEGIN
    -- 1. Find and drop ALL existing foreign keys on this column
    FOR v_constraint_record IN 
        SELECT tc.constraint_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name = p_table_name
          AND kcu.column_name = p_column_name
          AND tc.table_schema = 'public'
    LOOP
        EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT IF EXISTS %I', p_table_name, v_constraint_record.constraint_name);
    END LOOP;

    -- 2. Specifically drop the target name if it still exists (e.g. if it was not a FK)
    EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT IF EXISTS %I', p_table_name, v_new_constraint_name);

    -- 3. Create the new cascading FK
    EXECUTE format('ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES public.%I(%I) ON UPDATE CASCADE ON DELETE CASCADE', 
        p_table_name, v_new_constraint_name, p_column_name, p_ref_table, p_ref_column);
END;
$$ LANGUAGE plpgsql;

-- Apply cascading updates to all identity-linked tables
SELECT public.enable_cascading_id_updates('courses', 'user_id', 'profiles', 'id');
SELECT public.enable_cascading_id_updates('courses', 'teacher_id', 'profiles', 'id');
SELECT public.enable_cascading_id_updates('attendance', 'user_id', 'profiles', 'id');
SELECT public.enable_cascading_id_updates('notes', 'user_id', 'profiles', 'id');
SELECT public.enable_cascading_id_updates('note_folders', 'user_id', 'profiles', 'id');
SELECT public.enable_cascading_id_updates('tasks', 'user_id', 'profiles', 'id');
SELECT public.enable_cascading_id_updates('todos', 'user_id', 'profiles', 'id');
SELECT public.enable_cascading_id_updates('ai_neural_memory', 'user_id', 'profiles', 'id');
SELECT public.enable_cascading_id_updates('exams', 'user_id', 'profiles', 'id');
SELECT public.enable_cascading_id_updates('grades', 'user_id', 'profiles', 'id');
SELECT public.enable_cascading_id_updates('assignments', 'created_by', 'profiles', 'id');
SELECT public.enable_cascading_id_updates('submissions', 'student_id', 'profiles', 'id');
SELECT public.enable_cascading_id_updates('study_sessions', 'user_id', 'profiles', 'id');
SELECT public.enable_cascading_id_updates('user_timetables', 'user_id', 'profiles', 'id');
SELECT public.enable_cascading_id_updates('enrollments', 'student_id', 'profiles', 'id');
SELECT public.enable_cascading_id_updates('announcements', 'author_id', 'profiles', 'id');
SELECT public.enable_cascading_id_updates('medications', 'user_id', 'profiles', 'id');
SELECT public.enable_cascading_id_updates('symptoms', 'user_id', 'profiles', 'id');
SELECT public.enable_cascading_id_updates('reports', 'user_id', 'profiles', 'id');
SELECT public.enable_cascading_id_updates('timetable', 'user_id', 'profiles', 'id');
SELECT public.enable_cascading_id_updates('timetables', 'user_id', 'profiles', 'id');
SELECT public.enable_cascading_id_updates('study_plans', 'user_id', 'profiles', 'id');
SELECT public.enable_cascading_id_updates('smart_notes', 'user_id', 'profiles', 'id');
SELECT public.enable_cascading_id_updates('syllabi', 'user_id', 'profiles', 'id');
SELECT public.enable_cascading_id_updates('deadlines', 'user_id', 'profiles', 'id');
SELECT public.enable_cascading_id_updates('blocked_users', 'user_id', 'profiles', 'id');
SELECT public.enable_cascading_id_updates('admin_reports', 'user_id', 'profiles', 'id');
SELECT public.enable_cascading_id_updates('admin_users', 'user_id', 'profiles', 'id');
SELECT public.enable_cascading_id_updates('security_threats', 'user_id', 'profiles', 'id');
SELECT public.enable_cascading_id_updates('support_tickets', 'user_id', 'profiles', 'id');
SELECT public.enable_cascading_id_updates('user_activity_logs', 'user_id', 'profiles', 'id');
SELECT public.enable_cascading_id_updates('security_logs', 'user_id', 'profiles', 'id');
SELECT public.enable_cascading_id_updates('timetable_events', 'user_id', 'profiles', 'id');

-- 4. EXECUTE IDENTITY TRANSLATION
-- Add clerk_id column for identity mapping and future recovery
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS clerk_id text;

-- Recovery: If 'id' is still a raw Clerk ID, preserve it in clerk_id
UPDATE public.profiles 
SET clerk_id = id 
WHERE id LIKE 'user_%';

-- Translate any remaining raw IDs in the profiles table
-- Note: If IDs were already translated with the previous (slightly different) logic, 
-- they will be correctly re-synced when the user next logs in via the updated profile-sync function.
UPDATE public.profiles 
SET id = public.translate_clerk_id_to_uuid(id) 
WHERE id LIKE 'user_%';

-- 5. SYNCHRONIZE RLS IDENTITY RESOLUTION
CREATE OR REPLACE FUNCTION public.requesting_user_id()
RETURNS text
LANGUAGE sql STABLE
AS $$
  SELECT public.translate_clerk_id_to_uuid(nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::text);
$$;

-- 6. ADMINISTRATIVE OVERRIDES
-- Ensure Admins/CEOs can manage critical academic infrastructure
DROP POLICY IF EXISTS "Admins can manage all courses" ON public.courses;
CREATE POLICY "Admins can manage all courses" 
ON public.courses FOR ALL 
USING (public.get_current_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can manage all syllabi" ON public.syllabi;
CREATE POLICY "Admins can manage all syllabi" 
ON public.syllabi FOR ALL 
USING (public.get_current_user_role() = 'admin');

-- 7. CLEANUP
DROP FUNCTION IF EXISTS public.enable_cascading_id_updates(text, text, text, text);
COMMENT ON FUNCTION public.requesting_user_id() IS 'Returns the deterministic UUID translated from the Clerk Identity string to ensure platform-wide RLS compatibility.';
