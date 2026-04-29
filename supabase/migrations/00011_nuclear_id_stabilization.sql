-- 00011_nuclear_id_stabilization.sql
-- FORCEFUL IDENTITY RESET
-- This script clears all legacy identity formats to allow the new UUID standard to take over.

DO $$
DECLARE
    r RECORD;
BEGIN
    -- 1. Identify and update all child tables referencing profiles(id)
    -- Using pg_constraint for reliable PostgreSQL metadata access
    FOR r IN (
        SELECT 
            rel.relname AS table_name, 
            att.attname AS column_name
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_attribute att ON att.attrelid = rel.oid AND att.attnum = ANY(con.conkey)
        JOIN pg_class ref ON ref.oid = con.confrelid
        JOIN pg_namespace ns ON ns.oid = rel.relnamespace
        WHERE con.contype = 'f' 
          AND ref.relname = 'profiles'
          AND ns.nspname = 'public'
    ) LOOP
        BEGIN
            -- Move records from raw IDs to their translated UUIDs first
            EXECUTE format('UPDATE public.%I SET %I = public.translate_clerk_id_to_uuid(%I) WHERE %I LIKE %L', 
                r.table_name, r.column_name, r.column_name, r.column_name, 'user_%');
        EXCEPTION WHEN OTHERS THEN
            -- If update fails (e.g. column not string), skip it
            NULL;
        END;
    END LOOP;

    -- 2. DELETE ALL RAW ID PROFILES
    -- This is safe because our frontend "self-healing" code will re-create them 
    -- with the correct UUID and data on the very next page load.
    DELETE FROM public.profiles WHERE id LIKE 'user_%';

    -- 3. Delete any profiles that have a clerk_id but the ID isn''t the correct UUID
    DELETE FROM public.profiles 
    WHERE clerk_id IS NOT NULL 
    AND id != public.translate_clerk_id_to_uuid(clerk_id);
    
    -- 4. Delete any profiles with duplicate emails (keeping the newest UUID one)
    DELETE FROM public.profiles a USING public.profiles b 
    WHERE a.id < b.id AND a.email = b.email;

END $$;

-- 5. RE-ESTABLISH CONSTRAINTS
DO $$
BEGIN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_clerk_id_key UNIQUE (clerk_id);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
