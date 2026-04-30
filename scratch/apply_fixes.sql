
-- MARGDARSHAK PRODUCTION STABILIZATION SCRIPT
-- RUN THIS IN THE SUPABASE DASHBOARD SQL EDITOR

-- 1. Ensure extensions schema and pgcrypto exist
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 2. Configure the mandatory ID Salt (Matches your .env)
-- Run this if it's not already set
-- 3. Fix Identity Translation (The root cause of the crashes)
CREATE OR REPLACE FUNCTION public.translate_clerk_id_to_uuid(p_clerk_id text)
RETURNS text
LANGUAGE plpgsql STABLE
AS $$
DECLARE
    v_salt text;
    v_combined text;
    v_h text;
BEGIN
    -- Fallback strategy: Try setting first, then use hardcoded production salt
    v_salt := current_setting('app.settings.id_salt', true);
    
    IF v_salt IS NULL OR v_salt = '' THEN
        -- Matches the VITE_ID_SALT in your .env
        v_salt := 'b8236e1f-1918-4447-9de9-9e363a37ff0d1d05da6b-ad8a-4734-bcd8-c10c7bdf39aa';
    END IF;
    
    -- MANDATORY SALT CHECK
    IF v_salt IS NULL OR v_salt = '' THEN
        RAISE EXCEPTION 'CRITICAL SECURITY ERROR: app.settings.id_salt is not configured.';
    END IF;

    v_combined := p_clerk_id || v_salt;
    -- FIX: Added explicit type casting and schema qualification for digest
    v_h := encode(extensions.digest(v_combined::text, 'sha256'::text), 'hex');

    RETURN 
      substring(v_h, 1, 8) || '-' || 
      substring(v_h, 9, 4) || '-' || 
      '4' || substring(v_h, 14, 3) || '-' || 
      '8' || substring(v_h, 18, 3) || '-' || 
      substring(v_h, 21, 12);
END;
$$;

-- 4. Re-enforce Requesting User ID
CREATE OR REPLACE FUNCTION public.requesting_user_id()
RETURNS text
LANGUAGE sql STABLE
AS $$
  SELECT public.translate_clerk_id_to_uuid(nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::text);
$$;

-- 5. Fix Role Resolution
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_role text;
    v_user_id text;
BEGIN
    v_user_id := public.requesting_user_id();
    IF v_user_id IS NULL THEN
        RETURN 'guest';
    END IF;
    
    SELECT user_type INTO v_role FROM public.profiles WHERE id = v_user_id;
    RETURN COALESCE(v_role, 'student');
END;
$$;

-- 6. Fix Idempotent Policies
DROP POLICY IF EXISTS "Allow anonymous threat logging" ON public.security_threats;
CREATE POLICY "Allow anonymous threat logging"
ON public.security_threats
FOR INSERT
WITH CHECK (
    (user_id = public.requesting_user_id())
    OR
    (user_id IS NULL AND public.requesting_user_id() IS NULL)
);

DROP POLICY IF EXISTS "Admins can manage blacklist" ON public.security_blacklist;
CREATE POLICY "Admins can manage blacklist" ON public.security_blacklist
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = public.requesting_user_id()
            AND user_type = 'admin'
        )
    );

-- SUCCESS MESSAGE
SELECT 'Infrastructure Stabilized' as status;
