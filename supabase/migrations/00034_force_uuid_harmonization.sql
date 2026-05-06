-- 00034_force_uuid_harmonization.sql
-- FORCE IDENTITY HARMONIZATION: Nuke all remaining string IDs in profiles.
-- This migration ensures profiles.id is strictly UUID and matches the deterministic translation.

DO $$
DECLARE
    r RECORD;
    v_correct_id uuid;
    v_table text;
    v_col text;
    v_pol RECORD;
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
BEGIN
    -- 0. DROP ALL POLICIES THAT DEPEND ON PROFILES.ID
    FOR v_pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', v_pol.policyname);
    END LOOP;

    -- 1. PRE-SYNC CLERK_ID
    -- If 'id' is a Clerk string, move it to 'clerk_id' before we overwrite it
    UPDATE public.profiles SET clerk_id = id::text WHERE id::text LIKE 'user_%' AND clerk_id IS NULL;
    
    -- 2. CASCADE UPDATE ALL TABLES
    -- We must update foreign keys BEFORE we change the profile ID
    FOR r IN (SELECT clerk_id, id, email FROM public.profiles WHERE clerk_id IS NOT NULL) LOOP
        v_correct_id := public.translate_clerk_id_to_uuid(r.clerk_id)::uuid;
        
        IF r.id::text != v_correct_id::text THEN
            RAISE NOTICE 'Harmonizing ID for %: % -> %', r.clerk_id, r.id, v_correct_id;
            
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
    END LOOP;

    -- 3. FORCE COLUMN TYPE TO UUID
    -- Cleanup rows that might still have non-UUID format
    DELETE FROM public.profiles WHERE id::text NOT LIKE '________-____-____-____-____________' AND email NOT IN ('abhinavjha393@gmail.com', 'abhinav.vsavwe4899@gmail.com');
    
    -- Final fallback: if ID is still not UUID, just generate one (last resort)
    UPDATE public.profiles SET id = public.translate_clerk_id_to_uuid(clerk_id)::text WHERE id::text NOT LIKE '________-____-____-____-____________';

    ALTER TABLE public.profiles ALTER COLUMN id TYPE UUID USING id::UUID;

    -- 4. RE-ESTABLISH RLS (Strict UUID)
    CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated
    USING (id = public.requesting_user_id_uuid());

    CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated
    WITH CHECK (id = public.requesting_user_id_uuid());

    CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated
    USING (id = public.requesting_user_id_uuid());
    
    -- Add generic "Admins can manage profiles" policy
    CREATE POLICY "Admins can manage profiles" ON public.profiles FOR ALL TO authenticated
    USING (public.is_admin_staff(public.requesting_user_id()));

END $$;
