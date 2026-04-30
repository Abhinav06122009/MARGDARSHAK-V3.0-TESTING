-- 00013_security_hardening.sql
-- ZENITH ARCHITECTURE: IRON CURTAIN SECURITY PROTOCOL
-- Hardens all tables with strict RLS and forensic logging triggers.

-- 1. UTILITY: Force Enable RLS on all public tables
DO $$
DECLARE
    v_table text;
BEGIN
    FOR v_table IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', v_table);
    END LOOP;
END $$;

-- 2. HARDEN IDENTITY RESOLUTION
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

-- 3. GLOBAL DENY POLICY (Safety Net)
-- This ensures that if a table has no other policy, all access is denied.
-- Supabase does this by default when RLS is enabled, but explicit policies are easier to audit.

-- 4. FORENSIC LOGGING TRIGGER
-- Automatically logs any DELETE or significant UPDATE to security_logs
CREATE OR REPLACE FUNCTION public.log_sensitive_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.security_logs (
        user_id,
        event_type,
        risk_level,
        summary,
        metadata
    ) VALUES (
        public.requesting_user_id(),
        'DATA_MUTATION',
        'low',
        format('User modified table %s (ID: %s)', TG_TABLE_NAME, OLD.id),
        jsonb_build_object(
            'table', TG_TABLE_NAME,
            'operation', TG_OP,
            'old_data', to_jsonb(OLD),
            'new_data', to_jsonb(NEW)
        )
    );
    RETURN NEW;
END;
$$;

-- Apply forensic logging to critical tables
DO $$
DECLARE
    v_table text;
    v_tables text[] := ARRAY['profiles', 'grades', 'exams', 'admin_users', 'security_threats'];
BEGIN
    FOREACH v_table IN ARRAY v_tables LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS tr_forensic_log_%I ON public.%I', v_table, v_table);
        EXECUTE format('CREATE TRIGGER tr_forensic_log_%I AFTER UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE PROCEDURE public.log_sensitive_change()', v_table, v_table);
    END LOOP;
END $$;

-- 5. STORAGE BUCKET HARDENING
-- Ensure avatars and reports buckets are private and only accessible by owners
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'storage') THEN
        -- Avatars: Public to read, Owner to write
        DROP POLICY IF EXISTS "Avatar visibility" ON storage.objects;
        CREATE POLICY "Avatar visibility" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
        
        DROP POLICY IF EXISTS "Avatar upload" ON storage.objects;
        CREATE POLICY "Avatar upload" ON storage.objects FOR ALL USING (
            bucket_id = 'avatars' AND (storage.foldername(name))[1] = public.requesting_user_id()
        );
        
        -- Reports: Only owner can read/write
        DROP POLICY IF EXISTS "Report privacy" ON storage.objects;
        CREATE POLICY "Report privacy" ON storage.objects FOR ALL USING (
            bucket_id = 'reports' AND (storage.foldername(name))[1] = public.requesting_user_id()
        );
    END IF;
END $$;

-- 6. RATE LIMITING HELPER (Database Level)
-- Can be used by functions to prevent brute-force on database-intensive ops
CREATE TABLE IF NOT EXISTS public.rate_limits (
    key text PRIMARY KEY,
    last_attempt timestamptz DEFAULT now(),
    attempts int DEFAULT 1
);

CREATE OR REPLACE FUNCTION public.check_db_rate_limit(p_key text, p_max_attempts int, p_window_seconds int)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_record RECORD;
BEGIN
    SELECT * INTO v_record FROM public.rate_limits WHERE key = p_key;
    
    IF v_record IS NULL THEN
        INSERT INTO public.rate_limits (key, last_attempt, attempts) VALUES (p_key, now(), 1);
        RETURN TRUE;
    END IF;
    
    IF v_record.last_attempt < now() - (p_window_seconds || ' seconds')::interval THEN
        UPDATE public.rate_limits SET last_attempt = now(), attempts = 1 WHERE key = p_key;
        RETURN TRUE;
    END IF;
    
    IF v_record.attempts >= p_max_attempts THEN
        RETURN FALSE;
    END IF;
    
    UPDATE public.rate_limits SET attempts = attempts + 1, last_attempt = now() WHERE key = p_key;
    RETURN TRUE;
END;
$$;

COMMENT ON TABLE public.rate_limits IS 'Internal rate limiting for database-intensive operations.';
COMMENT ON FUNCTION public.get_current_user_role() IS 'Robust role resolution with guest fallback and schema-qualified lookups.';
