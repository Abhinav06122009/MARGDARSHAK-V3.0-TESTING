-- 00029_fix_profiles_rls_uuid.sql
-- Fixes the 'invalid input syntax for type uuid' error during profile sync
-- Harmonizes the profiles RLS policies with the deterministic UUID translation layer.

-- 1. Ensure we are using the UUID version of the requester for the UUID column
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- SELECT: Allow both raw Clerk ID comparison (on clerk_id column) and UUID comparison (on id column)
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
TO authenticated
USING (
    clerk_id = public.requesting_user_id() OR 
    id = public.requesting_user_id_uuid()
);

-- INSERT: Use the UUID translator for the 'id' column check
CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
TO authenticated
WITH CHECK ( 
    id = public.requesting_user_id_uuid() 
);

-- UPDATE: Use the UUID translator for the 'id' column check
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
TO authenticated
USING ( 
    id = public.requesting_user_id_uuid() 
);

-- 2. Clean up any other potential UUID mismatches in standard tables
-- This ensures that users can always manage their own data using the translated UUID
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
CREATE POLICY "Users can view their own tasks" ON public.tasks FOR SELECT USING (user_id::text = public.requesting_user_id_uuid()::text);

DROP POLICY IF EXISTS "Users can insert their own tasks" ON public.tasks;
CREATE POLICY "Users can insert their own tasks" ON public.tasks FOR INSERT WITH CHECK (user_id::text = public.requesting_user_id_uuid()::text);

DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
CREATE POLICY "Users can update their own tasks" ON public.tasks FOR UPDATE USING (user_id::text = public.requesting_user_id_uuid()::text);

DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;
CREATE POLICY "Users can delete their own tasks" ON public.tasks FOR DELETE USING (user_id::text = public.requesting_user_id_uuid()::text);
