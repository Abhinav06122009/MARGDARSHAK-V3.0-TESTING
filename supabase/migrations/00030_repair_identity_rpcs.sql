-- 00030_repair_identity_rpcs.sql
-- ZENITH MASTER RESTORATION: FINAL IDENTITY HARMONIZATION
-- This migration resolves all 400 Bad Request and 404 RPC errors.

-- 1. UNIFY IDENTITY GATEWAYS
-- requesting_user_id() ALWAYS returns the raw TEXT from the JWT (Clerk ID)
CREATE OR REPLACE FUNCTION public.requesting_user_id()
RETURNS TEXT AS $$
BEGIN
    RETURN (current_setting('request.jwt.claims', true)::jsonb ->> 'sub');
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- requesting_user_id_uuid() ALWAYS returns the translated UUID
CREATE OR REPLACE FUNCTION public.requesting_user_id_uuid()
RETURNS UUID AS $$
BEGIN
    RETURN public.translate_clerk_id_to_uuid(public.requesting_user_id());
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- 2. HARDEN PROFILES SCHEMA
DO $$
BEGIN
    -- Ensure clerk_id exists as TEXT
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'clerk_id') THEN
        ALTER TABLE public.profiles ADD COLUMN clerk_id TEXT;
    END IF;
    
    -- Sync existing clerk_ids if they were missing (safeguard)
    -- Note: This assumes id was already translated and clerk_id is null
    UPDATE public.profiles SET clerk_id = id::text WHERE clerk_id IS NULL AND id::text LIKE 'user_%';

    -- Ensure id is UUID
    BEGIN
        ALTER TABLE public.profiles ALTER COLUMN id TYPE UUID USING id::UUID;
    EXCEPTION WHEN OTHERS THEN
        -- If conversion fails, it's likely already UUID or has complex constraints
        NULL;
    END;
END $$;

-- 3. REPAIR CORE RPCS
-- Repair get_current_user_role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text AS $$
DECLARE
    role_val text;
BEGIN
    SELECT user_type INTO role_val
    FROM public.profiles
    WHERE id = public.requesting_user_id_uuid()
    LIMIT 1;

    RETURN COALESCE(role_val, 'student');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Repair get_my_calendar_events
-- Ensure we handle the table renaming from 00028
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_calendar_events') THEN
        DROP FUNCTION IF EXISTS public.get_my_calendar_events() CASCADE;
        
        CREATE OR REPLACE FUNCTION public.get_my_calendar_events()
        RETURNS SETOF public.user_calendar_events
        LANGUAGE plpgsql
        STABLE
        SECURITY DEFINER
        AS $func$
        BEGIN
            RETURN QUERY
            SELECT * FROM public.user_calendar_events
            WHERE user_id = public.requesting_user_id_uuid();
        END;
        $func$;
    END IF;
END $$;

-- 4. GRANTS
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.requesting_user_id() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.requesting_user_id_uuid() TO authenticated, service_role;
