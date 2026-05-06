-- 00031_repair_syllabi_rls.sql
-- IDENTITY PARITY RECONCILIATION: PHASE 2
-- This migration repairs RLS policies for syllabi and other modules missed in 00030.
-- It ensures they use the requesting_user_id_uuid() helper for consistent UUID resolution.

DO $$
DECLARE
    v_table text;
    -- Tables missed in 00030 stabilization
    v_tables text[] := ARRAY[
        'syllabi', 'note_folders', 'todos', 'medications', 'symptoms', 'reports', 
        'study_plans', 'smart_notes', 'deadlines', 'blocked_users', 'admin_reports', 
        'admin_users', 'security_threats', 'support_tickets', 'user_activity_logs', 
        'security_logs', 'calendar_events'
    ];
    v_user_id_col text;
BEGIN
    FOREACH v_table IN ARRAY v_tables LOOP
        -- Determine user_id column name
        IF v_table = 'profiles' THEN v_user_id_col := 'id';
        ELSIF v_table = 'enrollments' OR v_table = 'submissions' THEN v_user_id_col := 'student_id';
        ELSIF v_table = 'assignments' THEN v_user_id_col := 'created_by';
        ELSIF v_table = 'announcements' THEN v_user_id_col := 'author_id';
        ELSE v_user_id_col := 'user_id';
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = v_table AND table_schema = 'public') THEN
            -- 1. Ensure user_id column is UUID if it exists and is currently text
            -- This handles the transition from legacy Clerk ID strings to translated UUIDs
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = v_table AND column_name = v_user_id_col AND data_type = 'text') THEN
                BEGIN
                    -- Attempt conversion. This might fail if there are invalid UUID strings, so we wrap in BEGIN/EXCEPTION
                    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN %I TYPE UUID USING %I::UUID', v_table, v_user_id_col, v_user_id_col);
                EXCEPTION WHEN OTHERS THEN
                    RAISE NOTICE 'Could not convert %I.%I to UUID. Continuing with text comparison.', v_table, v_user_id_col;
                END;
            END IF;

            -- 2. Apply Standard UUID Policies
            EXECUTE format('DROP POLICY IF EXISTS "Standard SELECT for %I" ON public.%I', v_table, v_table);
            EXECUTE format('CREATE POLICY "Standard SELECT for %I" ON public.%I FOR SELECT USING (%I::uuid = public.requesting_user_id_uuid())', v_table, v_table, v_user_id_col);
            
            EXECUTE format('DROP POLICY IF EXISTS "Standard INSERT for %I" ON public.%I', v_table, v_table);
            EXECUTE format('CREATE POLICY "Standard INSERT for %I" ON public.%I FOR INSERT WITH CHECK (%I::uuid = public.requesting_user_id_uuid())', v_table, v_table, v_user_id_col);
            
            EXECUTE format('DROP POLICY IF EXISTS "Standard UPDATE for %I" ON public.%I', v_table, v_table);
            EXECUTE format('CREATE POLICY "Standard UPDATE for %I" ON public.%I FOR UPDATE USING (%I::uuid = public.requesting_user_id_uuid())', v_table, v_table, v_user_id_col);
            
            EXECUTE format('DROP POLICY IF EXISTS "Standard DELETE for %I" ON public.%I', v_table, v_table);
            EXECUTE format('CREATE POLICY "Standard DELETE for %I" ON public.%I FOR DELETE USING (%I::uuid = public.requesting_user_id_uuid())', v_table, v_table, v_user_id_col);
            
            -- 3. Admin/CEO Override (Consistent with 00030)
            IF v_table NOT IN ('profiles', 'security_logs') THEN
                EXECUTE format('DROP POLICY IF EXISTS "Admin Master Override for %I" ON public.%I', v_table, v_table);
                EXECUTE format('CREATE POLICY "Admin Master Override for %I" ON public.%I FOR ALL USING (public.get_current_user_role() IN (''ceo'', ''admin''))', v_table, v_table);
            END IF;
            
            RAISE NOTICE 'Stabilized RLS for table: %', v_table;
        END IF;
    END LOOP;
END $$;
