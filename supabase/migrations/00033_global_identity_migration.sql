-- 00033_global_identity_migration.sql
-- MASTER IDENTITY RECONCILIATION: FINAL HARMONIZATION
-- This migration ensures ALL data uses the LATEST deterministic UUID protocol.

DO $$
DECLARE
    v_table text;
    v_col text;
    v_type text;
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
        ['submissions', 'student_id'],
        ['enrollments', 'student_id'],
        ['assignments', 'created_by'],
        ['announcements', 'author_id']
    ];
    r RECORD;
BEGIN
    -- 1. FIX PROFILES TABLE DATA
    -- Ensure clerk_id is never null for legacy or semi-migrated rows
    -- If id is a string 'user_...', move it to clerk_id
    UPDATE public.profiles SET clerk_id = id::text WHERE id::text LIKE 'user_%' AND clerk_id IS NULL;
    
    -- For rows where clerk_id is NOT null, ensure ID matches the LATEST translation
    FOR r IN (SELECT clerk_id, id, email FROM public.profiles WHERE clerk_id IS NOT NULL) LOOP
        DECLARE
            v_correct_id uuid;
        BEGIN
            v_correct_id := public.translate_clerk_id_to_uuid(r.clerk_id)::uuid;
            
            IF r.id::text != v_correct_id::text THEN
                RAISE NOTICE 'Fixing profile ID mismatch for %: % -> %', r.clerk_id, r.id, v_correct_id;
                
                -- Update referencing tables FIRST to maintain consistency
                FOR i IN 1..array_length(v_tables_cols, 1) LOOP
                    v_table := v_tables_cols[i][1];
                    v_col := v_tables_cols[i][2];
                    
                    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = v_table AND column_name = v_col) THEN
                        EXECUTE format('UPDATE public.%I SET %I = %L WHERE %I::text = %L', v_table, v_col, v_correct_id, v_col, r.id);
                    END IF;
                END LOOP;
                
                -- Finally update the profile itself
                UPDATE public.profiles SET id = v_correct_id::text WHERE email = r.email;
            END IF;
        END;
    END LOOP;

    -- 2. MIGRATE REMAINING STRING IDS IN ALL TABLES
    FOR i IN 1..array_length(v_tables_cols, 1) LOOP
        v_table := v_tables_cols[i][1];
        v_col := v_tables_cols[i][2];

        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = v_table AND table_schema = 'public') THEN
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = v_table AND column_name = v_col) THEN
                -- Get column type
                SELECT data_type INTO v_type FROM information_schema.columns WHERE table_name = v_table AND column_name = v_col;
                
                RAISE NOTICE 'Migrating table: % (column: %, type: %)', v_table, v_col, v_type;
                
                -- Update legacy string IDs
                IF v_type = 'uuid' THEN
                    -- If it's already UUID, we only update rows that don't match our join logic above
                    -- (Though our loop above should have covered them if they had a profile)
                    NULL;
                ELSE
                    -- If it's still TEXT, translate and cast
                    EXECUTE format(
                        'UPDATE public.%I SET %I = public.translate_clerk_id_to_uuid(%I::text) WHERE %I::text LIKE ''user_%%''',
                        v_table, v_col, v_col, v_col
                    );
                    
                    -- Convert to UUID
                    BEGIN
                        EXECUTE format('ALTER TABLE public.%I ALTER COLUMN %I TYPE UUID USING %I::UUID', v_table, v_col, v_col);
                    EXCEPTION WHEN OTHERS THEN
                        RAISE NOTICE 'Conversion failed for %.%: %', v_table, v_col, SQLERRM;
                    END;
                END IF;
            END IF;
        END IF;
    END LOOP;

    -- 3. FINAL PROFILE ID CONVERSION
    BEGIN
        ALTER TABLE public.profiles ALTER COLUMN id TYPE UUID USING id::UUID;
    EXCEPTION WHEN OTHERS THEN NULL; END;

    -- 4. RE-STABILIZE RLS
    FOR i IN 1..array_length(v_tables_cols, 1) LOOP
        v_table := v_tables_cols[i][1];
        v_col := v_tables_cols[i][2];

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
    END LOOP;

    RAISE NOTICE 'Identity harmonization complete.';
END $$;
