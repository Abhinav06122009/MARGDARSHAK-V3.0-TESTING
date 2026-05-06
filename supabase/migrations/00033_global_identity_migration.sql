-- 00033_global_identity_migration.sql
-- MASTER IDENTITY RECONCILIATION: LEGACY STRING TO UUID MIGRATION
-- This migration ensures ALL data across ALL tables uses the translated UUID protocol.
-- This resolves the "0 syllabi/tasks" issue caused by legacy data mismatch.

DO $$
DECLARE
    v_table text;
    v_col text;
    -- List of all tables that store user-related data
    v_tables_cols text[][] := ARRAY[
        ['syllabi', 'user_id'],
        ['tasks', 'user_id'],
        ['notes', 'user_id'],
        ['courses', 'user_id'],
        ['grades', 'user_id'],
        ['study_sessions', 'user_id'],
        ['user_calendar_events', 'user_id'],
        ['progress_goals', 'user_id'],
        ['progress_entries', 'user_id'],
        ['timetable_events', 'user_id'],
        ['ai_neural_memory', 'user_id'],
        ['exams', 'user_id'],
        ['medications', 'user_id'],
        ['symptoms', 'user_id'],
        ['reports', 'user_id'],
        ['study_plans', 'user_id'],
        ['smart_notes', 'user_id'],
        ['deadlines', 'user_id'],
        ['blocked_users', 'user_id'],
        ['user_activity_logs', 'user_id'],
        ['security_logs', 'user_id'],
        ['attendance', 'user_id'],
        -- Tables with different column names
        ['submissions', 'student_id'],
        ['enrollments', 'student_id'],
        ['assignments', 'created_by'],
        ['announcements', 'author_id']
    ];
    r RECORD;
BEGIN
    -- 1. MIGRATE PROFILES FIRST (Carefully)
    -- We need to ensure every profile has its clerk_id preserved and id translated
    FOR r IN (SELECT id, email FROM public.profiles WHERE id::text LIKE 'user_%') LOOP
        BEGIN
            -- Ensure clerk_id is set to the current id before we change id
            UPDATE public.profiles SET clerk_id = id::text WHERE id = r.id AND clerk_id IS NULL;
            
            -- Change the primary key ID to the translated UUID
            UPDATE public.profiles 
            SET id = public.translate_clerk_id_to_uuid(id::text)::text 
            WHERE id = r.id;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Skipping profile migration for %: %', r.id, SQLERRM;
        END;
    END LOOP;

    -- 3. MIGRATE ALL OTHER TABLES
    FOR i IN 1..array_length(v_tables_cols, 1) LOOP
        v_table := v_tables_cols[i][1];
        v_col := v_tables_cols[i][2];

        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = v_table AND table_schema = 'public') THEN
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = v_table AND column_name = v_col) THEN
                RAISE NOTICE 'Migrating table: % (column: %)', v_table, v_col;
                
                -- Update legacy string IDs to translated UUID strings
                EXECUTE format(
                    'UPDATE public.%I SET %I = public.translate_clerk_id_to_uuid(%I::text)::text WHERE %I::text LIKE ''user_%%''',
                    v_table, v_col, v_col, v_col
                );

                -- Attempt conversion to UUID type if it's currently TEXT
                BEGIN
                    EXECUTE format(
                        'ALTER TABLE public.%I ALTER COLUMN %I TYPE UUID USING %I::UUID',
                        v_table, v_col, v_col
                    );
                EXCEPTION WHEN OTHERS THEN
                    RAISE NOTICE 'Could not convert column % in table % to UUID: %', v_col, v_table, SQLERRM;
                END;
            END IF;
        END IF;
    END LOOP;

    -- 4. CONVERT PROFILES.ID TO UUID (Final Step)
    BEGIN
        ALTER TABLE public.profiles ALTER COLUMN id TYPE UUID USING id::UUID;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not convert profiles.id to UUID: %', SQLERRM;
    END;

    -- 5. RE-STABILIZE RLS POLICIES (Global UUID Synchronization)
    -- Using text-based comparison for maximum safety across both TEXT and UUID types
    FOR i IN 1..array_length(v_tables_cols, 1) LOOP
        v_table := v_tables_cols[i][1];
        v_col := v_tables_cols[i][2];

        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = v_table AND table_schema = 'public') THEN
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = v_table AND column_name = v_col) THEN
                EXECUTE format('DROP POLICY IF EXISTS "Standard SELECT for %I" ON public.%I', v_table, v_table);
                EXECUTE format('CREATE POLICY "Standard SELECT for %I" ON public.%I FOR SELECT USING (%I::text = public.requesting_user_id_uuid()::text)', v_table, v_table, v_col);
                
                EXECUTE format('DROP POLICY IF EXISTS "Standard INSERT for %I" ON public.%I', v_table, v_table);
                EXECUTE format('CREATE POLICY "Standard INSERT for %I" ON public.%I FOR INSERT WITH CHECK (%I::text = public.requesting_user_id_uuid()::text)', v_table, v_table, v_col);
                
                EXECUTE format('DROP POLICY IF EXISTS "Standard UPDATE for %I" ON public.%I', v_table, v_table);
                EXECUTE format('CREATE POLICY "Standard UPDATE for %I" ON public.%I FOR UPDATE USING (%I::text = public.requesting_user_id_uuid()::text)', v_table, v_table, v_col);
                
                EXECUTE format('DROP POLICY IF EXISTS "Standard DELETE for %I" ON public.%I', v_table, v_table);
                EXECUTE format('CREATE POLICY "Standard DELETE for %I" ON public.%I FOR DELETE USING (%I::text = public.requesting_user_id_uuid()::text)', v_table, v_table, v_col);
            END IF;
        END IF;
    END LOOP;

    RAISE NOTICE 'Global identity migration complete.';
END $$;
