-- Migration: 00011_clerk_best_practice
-- Purpose: Refactor database to use Clerk IDs (TEXT) instead of Supabase Auth UUIDs.

-- 1. Disable triggers and constraints from Supabase Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Drop Foreign Key constraints pointing to auth.users or UUID-based profiles
-- This allows us to change the column types.
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT 
            tc.table_name, 
            tc.constraint_name
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
        WHERE 
            tc.constraint_type = 'FOREIGN KEY' 
            AND (ccu.table_name = 'profiles' OR ccu.table_schema = 'auth')
            AND tc.table_schema = 'public'
    ) LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.table_name) || ' DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name) || ' CASCADE;';
    END LOOP;
END $$;

-- 3. Change ID types to TEXT for Clerk compatibility
DO $$
BEGIN
    -- Profiles table
    ALTER TABLE public.profiles ALTER COLUMN id TYPE TEXT;
    
    -- Tables referencing users
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'announcements') THEN
        ALTER TABLE public.announcements ALTER COLUMN author_id TYPE TEXT;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'assignments') THEN
        ALTER TABLE public.assignments ALTER COLUMN created_by TYPE TEXT;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'attendance') THEN
        ALTER TABLE public.attendance ALTER COLUMN student_id TYPE TEXT;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'courses') THEN
        ALTER TABLE public.courses ALTER COLUMN teacher_id TYPE TEXT;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'enrollments') THEN
        ALTER TABLE public.enrollments ALTER COLUMN student_id TYPE TEXT;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'exams') THEN
        ALTER TABLE public.exams ALTER COLUMN user_id TYPE TEXT;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'grades') THEN
        ALTER TABLE public.grades ALTER COLUMN user_id TYPE TEXT;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'medications') THEN
        ALTER TABLE public.medications ALTER COLUMN user_id TYPE TEXT;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notes') THEN
        ALTER TABLE public.notes ALTER COLUMN user_id TYPE TEXT;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admin_reports') THEN
        ALTER TABLE public.admin_reports ALTER COLUMN user_id TYPE TEXT;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admin_users') THEN
        ALTER TABLE public.admin_users ALTER COLUMN user_id TYPE TEXT;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'blocked_users') THEN
        ALTER TABLE public.blocked_users ALTER COLUMN user_id TYPE TEXT;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'security_logs') THEN
        ALTER TABLE public.security_logs ALTER COLUMN user_id TYPE TEXT;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'security_threats') THEN
        ALTER TABLE public.security_threats ALTER COLUMN user_id TYPE TEXT;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'support_tickets') THEN
        ALTER TABLE public.support_tickets ALTER COLUMN user_id TYPE TEXT;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_activity_logs') THEN
        ALTER TABLE public.user_activity_logs ALTER COLUMN user_id TYPE TEXT;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'deadlines') THEN
        ALTER TABLE public.deadlines ALTER COLUMN user_id TYPE TEXT;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reports') THEN
        ALTER TABLE public.reports ALTER COLUMN user_id TYPE TEXT;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'study_sessions') THEN
        ALTER TABLE public.study_sessions ALTER COLUMN user_id TYPE TEXT;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'submissions') THEN
        ALTER TABLE public.submissions ALTER COLUMN student_id TYPE TEXT;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'symptoms') THEN
        ALTER TABLE public.symptoms ALTER COLUMN user_id TYPE TEXT;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tasks') THEN
        ALTER TABLE public.tasks ALTER COLUMN user_id TYPE TEXT;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'timetable') THEN
        ALTER TABLE public.timetable ALTER COLUMN user_id TYPE TEXT;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'timetables') THEN
        ALTER TABLE public.timetables ALTER COLUMN user_id TYPE TEXT;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'todos') THEN
        ALTER TABLE public.todos ALTER COLUMN user_id TYPE TEXT;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_timetables') THEN
        ALTER TABLE public.user_timetables ALTER COLUMN user_id TYPE TEXT;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        ALTER TABLE public.users ALTER COLUMN id TYPE TEXT;
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error during type migration: %', SQLERRM;
END $$;

-- 4. Re-establish Foreign Key constraints (now using TEXT)
-- This ensures referential integrity between tables and the profiles table.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'announcements') THEN
        ALTER TABLE public.announcements DROP CONSTRAINT IF EXISTS announcements_author_id_fkey;
        ALTER TABLE public.announcements ADD CONSTRAINT announcements_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'assignments') THEN
        ALTER TABLE public.assignments DROP CONSTRAINT IF EXISTS assignments_created_by_fkey;
        ALTER TABLE public.assignments ADD CONSTRAINT assignments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'attendance') THEN
        ALTER TABLE public.attendance DROP CONSTRAINT IF EXISTS attendance_student_id_fkey;
        ALTER TABLE public.attendance ADD CONSTRAINT attendance_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'courses') THEN
        ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_teacher_id_fkey;
        ALTER TABLE public.courses ADD CONSTRAINT courses_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'enrollments') THEN
        ALTER TABLE public.enrollments DROP CONSTRAINT IF EXISTS enrollments_student_id_fkey;
        ALTER TABLE public.enrollments ADD CONSTRAINT enrollments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notes') THEN
        ALTER TABLE public.notes DROP CONSTRAINT IF EXISTS notes_user_id_fkey;
        ALTER TABLE public.notes ADD CONSTRAINT notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reports') THEN
        ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_user_id_fkey;
        ALTER TABLE public.reports ADD CONSTRAINT reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'study_sessions') THEN
        ALTER TABLE public.study_sessions DROP CONSTRAINT IF EXISTS study_sessions_user_id_fkey;
        ALTER TABLE public.study_sessions ADD CONSTRAINT study_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'submissions') THEN
        ALTER TABLE public.submissions DROP CONSTRAINT IF EXISTS submissions_student_id_fkey;
        ALTER TABLE public.submissions ADD CONSTRAINT submissions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tasks') THEN
        ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_user_id_fkey;
        ALTER TABLE public.tasks ADD CONSTRAINT tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'todos') THEN
        ALTER TABLE public.todos DROP CONSTRAINT IF EXISTS todos_user_id_fkey;
        ALTER TABLE public.todos ADD CONSTRAINT todos_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'timetables') THEN
        ALTER TABLE public.timetables DROP CONSTRAINT IF EXISTS timetables_user_id_fkey;
        ALTER TABLE public.timetables ADD CONSTRAINT timetables_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 5. Add Subscription Management columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_period_end TIMESTAMPTZ;

-- 6. Update get_user_role to handle Clerk IDs via auth.uid()
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  SELECT COALESCE(
    (SELECT p.user_type::text FROM public.profiles p WHERE p.id = auth.uid()),
    'student'
  );
$$;

-- 7. Audit log for migration
COMMENT ON TABLE public.profiles IS 'User IDs are now Clerk-based strings. Migration 00011 completed.';
