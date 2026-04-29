-- 00011_nuclear_id_stabilization.sql
-- THE GLOBAL HARMONIZER: Fixes identity for ALL users at once.

DO $$
DECLARE
    v_row RECORD;
    v_correct_id uuid;
    v_table RECORD;
    v_column RECORD;
BEGIN
    RAISE NOTICE '🚀 Starting Global Identity Harmonization...';

    -- 1. Loop through all profiles that have a Clerk ID
    FOR v_row IN (SELECT * FROM public.profiles WHERE clerk_id IS NOT NULL) LOOP
        
        -- Calculate what the ID SHOULD be
        v_correct_id := public.translate_clerk_id_to_uuid(v_row.clerk_id);
        
        -- If the ID is wrong, we need to move the data
        IF v_row.id::text != v_correct_id::text THEN
            RAISE NOTICE 'Found Mismatched User: % (Old ID: %, New ID: %)', v_row.email, v_row.id, v_correct_id;
            
            -- A. Create the correct profile row (copying data)
            INSERT INTO public.profiles (id, clerk_id, email, full_name, user_type, subscription_tier)
            VALUES (v_correct_id, v_row.clerk_id, v_row.email, v_row.full_name, v_row.user_type, v_row.subscription_tier)
            ON CONFLICT (id) DO UPDATE SET clerk_id = EXCLUDED.clerk_id, email = EXCLUDED.email;

            -- B. Move data in ALL child tables
            FOR v_table IN (
                SELECT DISTINCT rel.relname AS table_name, att.attname AS column_name
                FROM pg_attribute att
                JOIN pg_class rel ON rel.oid = att.attrelid
                JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
                WHERE nsp.nspname = 'public' 
                  AND rel.relkind = 'r' 
                  AND (att.attname = 'user_id' OR att.attname = 'student_id' OR att.attname = 'created_by')
                  AND rel.relname != 'profiles'
            ) LOOP
                EXECUTE format('UPDATE public.%I SET %I = %L WHERE %I = %L', 
                               v_table.table_name, v_table.column_name, v_correct_id, v_table.column_name, v_row.id);
            END LOOP;

            -- C. Delete the old incorrect profile
            DELETE FROM public.profiles WHERE id = v_row.id;
            
            RAISE NOTICE '✅ Successfully harmonized user: %', v_row.email;
        END IF;
    END LOOP;

    RAISE NOTICE '🏁 Global Harmonization Complete!';
END $$;
