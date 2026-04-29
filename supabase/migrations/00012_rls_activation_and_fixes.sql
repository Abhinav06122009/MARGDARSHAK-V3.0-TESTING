-- 00012_rls_activation_and_fixes.sql
-- Enables RLS for announcements, assignments, and submissions with corrected visibility policies.

-- 1. ENABLE RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- 2. FIX ANNOUNCEMENTS VISIBILITY
-- Everyone should be able to see announcements
DROP POLICY IF EXISTS "Standard SELECT for announcements" ON public.announcements;
CREATE POLICY "Standard SELECT for announcements" ON public.announcements 
    FOR SELECT USING (true);

-- 3. FIX ASSIGNMENTS VISIBILITY
-- Students need to see assignments
DROP POLICY IF EXISTS "Standard SELECT for assignments" ON public.assignments;
CREATE POLICY "Standard SELECT for assignments" ON public.assignments 
    FOR SELECT USING (true);

-- 4. FIX SUBMISSIONS VISIBILITY
-- Students see their own, Teachers see all
DROP POLICY IF EXISTS "Standard SELECT for submissions" ON public.submissions;
CREATE POLICY "Standard SELECT for submissions" ON public.submissions 
    FOR SELECT USING (
        student_id = public.requesting_user_id() OR 
        public.get_current_user_role() IN ('admin', 'teacher')
    );

-- 5. VERIFY OTHER TABLES
-- Ensure profiles is enabled (it usually is but let's be safe)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Ensure requesting_user_id() is robust (already exists usually, but good for context)
-- This assumes the function exists and uses the translated Clerk ID correctly.
