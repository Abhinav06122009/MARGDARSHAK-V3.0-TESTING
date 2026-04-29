-- 99999_super_diagnostic.sql
-- Run this in Supabase SQL Editor and check the "Results" tab.
-- It will tell us exactly what is blocking your account.

SELECT 
    id, 
    clerk_id, 
    email, 
    full_name,
    public.translate_clerk_id_to_uuid(COALESCE(clerk_id, id)) as expected_uuid
FROM public.profiles
WHERE email ILIKE '%ceo%' OR email ILIKE '%abhinav%' OR clerk_id IS NOT NULL OR id LIKE 'user_%';

-- Check for any other unique constraints
SELECT
    conname as constraint_name,
    pg_get_constraintdef(c.oid) as constraint_definition
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
WHERE n.nspname = 'public' AND contype = 'u' AND conrelid = 'public.profiles'::regclass;
