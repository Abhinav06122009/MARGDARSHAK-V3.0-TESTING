-- PHASE 2: Database Zero-Trust (Supabase RLS + RBAC)
-- Ownership checks remain enforced, with explicit admin/teacher read bypasses.

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  jwt_role text := nullif(auth.jwt() -> 'app_metadata' ->> 'user_type', '');
  claim_role text := nullif(auth.jwt() ->> 'role', '');
BEGIN
  IF jwt_role IN ('admin', 'teacher', 'student') THEN
    RETURN jwt_role;
  END IF;

  IF claim_role IN ('admin', 'teacher', 'student') THEN
    RETURN claim_role;
  END IF;

  IF auth.uid() IS NULL THEN
    RETURN 'anon';
  END IF;

  RETURN 'student';
END;
$$;

REVOKE ALL ON FUNCTION public.get_user_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO anon, authenticated, service_role;

DO $$
DECLARE
  rec RECORD;
  owner_check text;
  select_expr text;
  write_expr text;
BEGIN
  FOR rec IN
    SELECT * FROM (
      VALUES
        ('announcements', 'author_id', false, true, false),
        ('assignments', 'created_by', false, true, false),
        ('attendance', 'student_id', false, true, true),
        ('courses', 'teacher_id', false, true, false),
        ('enrollments', 'student_id', false, true, true),
        ('exams', 'user_id', false, true, false),
        ('grades', 'user_id', true, true, true),
        ('medications', 'user_id', false, false, false),
        ('notes', 'user_id', false, true, false),
        ('profiles', 'id', false, true, false),
        ('admin_reports', 'user_id', false, true, false),
        ('admin_users', 'user_id', false, false, false),
        ('blocked_users', 'user_id', false, true, false),
        ('security_logs', 'user_id', false, true, false),
        ('security_threats', 'user_id', false, true, false),
        ('support_tickets', 'user_id', false, true, false),
        ('user_activity_logs', 'user_id', false, true, false),
        ('reports', 'user_id', false, true, false),
        ('study_sessions', 'user_id', true, true, false),
        ('submissions', 'student_id', false, true, true),
        ('symptoms', 'user_id', false, false, false),
        ('tasks', 'user_id', false, true, false),
        ('timetable', 'user_id', false, true, false),
        ('timetables', 'user_id', false, true, false),
        ('todos', 'user_id', false, true, false),
        ('user_timetables', 'user_id', false, true, false),
        ('users', 'id', false, false, false)
    ) AS t(table_name, owner_column, immutable_history, teacher_can_read, teacher_can_write)
  LOOP
    IF to_regclass(format('public.%I', rec.table_name)) IS NULL THEN
      RAISE NOTICE 'Skipping RLS setup for public.%: table does not exist', rec.table_name;
      CONTINUE;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns c
      WHERE c.table_schema = 'public'
        AND c.table_name = rec.table_name
        AND c.column_name = rec.owner_column
    ) THEN
      RAISE NOTICE 'Skipping RLS setup for public.%: owner column % does not exist', rec.table_name, rec.owner_column;
      CONTINUE;
    END IF;

    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', rec.table_name);
    EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY;', rec.table_name);

    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', rec.table_name || '_select_own', rec.table_name);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', rec.table_name || '_insert_own', rec.table_name);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', rec.table_name || '_update_own', rec.table_name);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', rec.table_name || '_delete_own', rec.table_name);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', rec.table_name || '_select_access', rec.table_name);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', rec.table_name || '_insert_access', rec.table_name);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', rec.table_name || '_update_access', rec.table_name);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', rec.table_name || '_delete_access', rec.table_name);

    owner_check := format('auth.uid() = %I', rec.owner_column);

    select_expr := owner_check || ' OR public.get_user_role() = ''admin''';
    IF rec.teacher_can_read THEN
      select_expr := select_expr || ' OR public.get_user_role() = ''teacher''';
    END IF;

    write_expr := owner_check || ' OR public.get_user_role() = ''admin''';
    IF rec.teacher_can_write THEN
      write_expr := write_expr || ' OR public.get_user_role() = ''teacher''';
    END IF;

    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT USING (%s);',
      rec.table_name || '_select_access',
      rec.table_name,
      select_expr
    );

    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR INSERT WITH CHECK (%s);',
      rec.table_name || '_insert_access',
      rec.table_name,
      write_expr
    );

    IF NOT rec.immutable_history THEN
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR UPDATE USING (%s) WITH CHECK (%s);',
        rec.table_name || '_update_access',
        rec.table_name,
        write_expr,
        write_expr
      );

      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR DELETE USING (%s);',
        rec.table_name || '_delete_access',
        rec.table_name,
        write_expr
      );
    END IF;
  END LOOP;
END
$$;

-- Profile hardening: prevent non-admin role escalation from student/teacher to admin.
DO $$
BEGIN
  IF to_regclass('public.profiles') IS NULL THEN
    RAISE NOTICE 'Skipping profile hardening: public.profiles does not exist';
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.table_name = 'profiles'
      AND c.column_name = 'id'
  ) OR NOT EXISTS (
    SELECT 1
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.table_name = 'profiles'
      AND c.column_name = 'user_type'
  ) THEN
    RAISE NOTICE 'Skipping profile hardening: required columns (id, user_type) are missing';
    RETURN;
  END IF;

  DROP POLICY IF EXISTS profiles_insert_access ON public.profiles;
  CREATE POLICY profiles_insert_access
  ON public.profiles
  FOR INSERT
  WITH CHECK (
    public.get_user_role() = 'admin'
  );

  DROP POLICY IF EXISTS profiles_update_access ON public.profiles;
  CREATE POLICY profiles_update_access
  ON public.profiles
  FOR UPDATE
  USING (
    auth.uid() = id
    OR public.get_user_role() = 'admin'
  )
  WITH CHECK (
    public.get_user_role() = 'admin'
    OR (
      auth.uid() = id
      AND public.get_user_role() IN ('admin', 'teacher', 'student')
      AND user_type = public.get_user_role()
    )
  );
END
$$;
