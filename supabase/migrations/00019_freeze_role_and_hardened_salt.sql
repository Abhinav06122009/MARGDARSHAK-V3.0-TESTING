-- 00019_freeze_role_and_hardened_salt.sql
-- ZENITH ARCHITECTURE: IMMUTABLE ROLE & SECURE IDENTITY PROTOCOL
-- 1. Prevents privilege escalation by locking sensitive fields.
-- 2. Enforces mandatory salt for identity translation.

-- 1. ROLE PROTECTION TRIGGER
-- Prevents users from changing their own user_type or subscription_tier via the client.
-- Only the 'service_role' (used by webhooks and admin functions) can modify these.
CREATE OR REPLACE FUNCTION public.protect_user_privileges()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the request is NOT from the service_role
    -- In Supabase, the service_role has 'service_role' in the JWT claims or 'postgres' role.
    -- We check current_setting('role') which is set by PostgREST.
    IF current_setting('role') != 'service_role' THEN
        -- Revert sensitive changes
        IF NEW.user_type IS DISTINCT FROM OLD.user_type THEN
            NEW.user_type := OLD.user_type;
        END IF;
        
        IF NEW.subscription_tier IS DISTINCT FROM OLD.subscription_tier THEN
            NEW.subscription_tier := OLD.subscription_tier;
        END IF;
        
        IF NEW.subscription_status IS DISTINCT FROM OLD.subscription_status THEN
            NEW.subscription_status := OLD.subscription_status;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_protect_user_privileges ON public.profiles;
CREATE TRIGGER tr_protect_user_privileges
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE PROCEDURE public.protect_user_privileges();

-- 2. HARDEN IDENTITY TRANSLATION
-- Removes the hardcoded fallback salt. The function will now FAIL if the salt is missing.
-- This ensures that production environments MUST be configured correctly.
CREATE OR REPLACE FUNCTION public.translate_clerk_id_to_uuid(p_clerk_id text)
RETURNS text
LANGUAGE plpgsql STABLE
AS $$
DECLARE
    v_salt text;
    v_combined text;
    v_h text;
BEGIN
    v_salt := current_setting('app.settings.id_salt', true);
    
    -- MANDATORY SALT CHECK
    -- If salt is missing, we raise an exception to prevent using a predictable fallback.
    IF v_salt IS NULL OR v_salt = '' THEN
        RAISE EXCEPTION 'CRITICAL SECURITY ERROR: app.settings.id_salt is not configured. Identity resolution is disabled for safety.';
    END IF;

    v_combined := p_clerk_id || v_salt;
    v_h := encode(digest(v_combined, 'sha256'), 'hex');

    RETURN 
      substring(v_h, 1, 8) || '-' || 
      substring(v_h, 9, 4) || '-' || 
      '4' || substring(v_h, 14, 3) || '-' || 
      '8' || substring(v_h, 18, 3) || '-' || 
      substring(v_h, 21, 12);
END;
$$;

COMMENT ON TRIGGER tr_protect_user_privileges ON public.profiles IS 'Prevents non-administrative modification of user roles and subscription statuses.';
COMMENT ON FUNCTION public.translate_clerk_id_to_uuid(text) IS 'Deterministic UUID translation requiring a mandatory database-level salt for security.';
