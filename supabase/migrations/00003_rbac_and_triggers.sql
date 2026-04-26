-- Secure profile creation and RBAC + RLS hardening

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    user_type
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''),
      split_part(COALESCE(NEW.email, ''), '@', 1)
    ),
    'student'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_auth_user();
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  SELECT COALESCE(
    (SELECT p.user_type::text FROM public.profiles p WHERE p.id = auth.uid()),
    'student'
  );
$$;

REVOKE ALL ON FUNCTION public.get_user_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO anon, authenticated, service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_access ON public.profiles;
DROP POLICY IF EXISTS profiles_insert_access ON public.profiles;
DROP POLICY IF EXISTS profiles_update_access ON public.profiles;
DROP POLICY IF EXISTS profiles_delete_access ON public.profiles;

CREATE POLICY profiles_select_access
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id
  OR public.get_user_role() IN ('admin', 'teacher')
);

CREATE POLICY profiles_insert_access
ON public.profiles
FOR INSERT
WITH CHECK (
  public.get_user_role() = 'admin'
);

CREATE POLICY profiles_update_access
ON public.profiles
FOR UPDATE
USING (
  auth.uid() = id
  OR public.get_user_role() IN ('admin', 'teacher')
)
WITH CHECK (
  public.get_user_role() = 'admin'
  OR (public.get_user_role() = 'teacher' AND user_type <> 'admin')
  OR (
    auth.uid() = id
    AND user_type = (
      SELECT p.user_type
      FROM public.profiles p
      WHERE p.id = auth.uid()
    )
  )
);

CREATE POLICY profiles_delete_access
ON public.profiles
FOR DELETE
USING (
  public.get_user_role() = 'admin'
);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS attendance_select_access ON public.attendance;
DROP POLICY IF EXISTS attendance_insert_access ON public.attendance;
DROP POLICY IF EXISTS attendance_update_access ON public.attendance;
DROP POLICY IF EXISTS attendance_delete_access ON public.attendance;

CREATE POLICY attendance_select_access
ON public.attendance
FOR SELECT
USING (
  auth.uid() = student_id
  OR public.get_user_role() IN ('admin', 'teacher')
);

CREATE POLICY attendance_insert_access
ON public.attendance
FOR INSERT
WITH CHECK (
  auth.uid() = student_id
  OR public.get_user_role() IN ('admin', 'teacher')
);

CREATE POLICY attendance_update_access
ON public.attendance
FOR UPDATE
USING (
  auth.uid() = student_id
  OR public.get_user_role() IN ('admin', 'teacher')
)
WITH CHECK (
  auth.uid() = student_id
  OR public.get_user_role() IN ('admin', 'teacher')
);

CREATE POLICY attendance_delete_access
ON public.attendance
FOR DELETE
USING (
  auth.uid() = student_id
  OR public.get_user_role() IN ('admin', 'teacher')
);
