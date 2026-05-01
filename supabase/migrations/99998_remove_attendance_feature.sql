-- 99998_remove_attendance_feature.sql
-- ZENITH ARCHITECTURE: FEATURE DECOMMISSIONING
-- This migration permanently removes the Attendance feature and its associated database objects.

DO $$
BEGIN
    -- 1. DROP THE ATTENDANCE TABLE
    -- CASCADE will automatically remove foreign keys and triggers depending on it.
    DROP TABLE IF EXISTS public.attendance CASCADE;

    -- 2. CLEANUP RELATED RLS POLICIES
    -- (The 99999 migration will also handle this, but it's good to be explicit here)
    DROP POLICY IF EXISTS "Standard SELECT for attendance" ON public.attendance;
    DROP POLICY IF EXISTS "Standard INSERT for attendance" ON public.attendance;
    DROP POLICY IF EXISTS "Standard UPDATE for attendance" ON public.attendance;
    DROP POLICY IF EXISTS "Standard DELETE for attendance" ON public.attendance;
    DROP POLICY IF EXISTS "Admin Master Override for attendance" ON public.attendance;

    -- 3. REMOVE FROM PERMISSIONS (if any custom ones existed)
    -- ...
END $$;

COMMENT ON TABLE public.attendance IS NULL; -- Clear comments
