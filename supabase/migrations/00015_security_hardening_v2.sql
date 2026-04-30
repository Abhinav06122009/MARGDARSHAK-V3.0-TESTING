-- 00015_security_hardening_v2.sql
-- ZENITH ARCHITECTURE: IRON CURTAIN SECURITY PROTOCOL (V2)
-- Fixes critical privilege escalation and data leak vulnerabilities.

-- 1. FIX: Restrict High-Ranked Check (Remove subscription-tier leak)
CREATE OR REPLACE FUNCTION public.is_high_ranked(p_user_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = p_user_id
        AND user_type = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. FIX: Protect sensitive profile fields from unauthorized modification
CREATE OR REPLACE FUNCTION public.protect_profile_integrity()
RETURNS TRIGGER AS $$
DECLARE
    v_is_admin BOOLEAN;
BEGIN
    -- Check if the current user is an admin or using service role
    -- auth.role() returns 'service_role' for administrative operations
    v_is_admin := (public.get_current_user_role() = 'admin') 
               OR (current_setting('role', true) = 'service_role')
               OR (auth.role() = 'service_role')
               OR (current_user = 'service_role')
               OR (current_user = 'postgres');

    -- DEBUG (Visible in Supabase Logs)
    -- RAISE NOTICE 'Security Check: User: %, Role: %, CurrentUser: %, IsAdmin: %', public.requesting_user_id(), auth.role(), current_user, v_is_admin;

    -- If not admin, prevent modification of sensitive fields
    IF NOT v_is_admin THEN
        IF (NEW.user_type IS DISTINCT FROM OLD.user_type) THEN
            RAISE EXCEPTION 'Unauthorized: Cannot change user_type.';
        END IF;
        
        IF (NEW.subscription_tier IS DISTINCT FROM OLD.subscription_tier) THEN
            RAISE EXCEPTION 'Unauthorized: Cannot change subscription_tier.';
        END IF;

        IF (NEW.is_blocked IS DISTINCT FROM OLD.is_blocked) THEN
            RAISE EXCEPTION 'Unauthorized: Cannot change blocked status.';
        END IF;

        IF (NEW.risk_level IS DISTINCT FROM OLD.risk_level) THEN
            NEW.risk_level := OLD.risk_level; -- Silently revert instead of crashing if possible
        END IF;

        IF (NEW.security_score IS DISTINCT FROM OLD.security_score) THEN
            NEW.security_score := OLD.security_score;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind the integrity trigger to the profiles table
DROP TRIGGER IF EXISTS tr_protect_profile_integrity ON public.profiles;
CREATE TRIGGER tr_protect_profile_integrity
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE PROCEDURE public.protect_profile_integrity();

-- 3. RE-ENFORCE: Admin role resolution fallback
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
    
    -- Cache lookup in profiles
    SELECT user_type INTO v_role FROM public.profiles WHERE id = v_user_id;
    
    -- If user_type is null or user doesn't exist, default to student
    RETURN COALESCE(v_role, 'student');
END;
$$;

COMMENT ON FUNCTION public.is_high_ranked(TEXT) IS 'Strictly restricts administrative data access to verified admin users only.';
COMMENT ON FUNCTION public.protect_profile_integrity() IS 'Security trigger to prevent non-admin users from escalating their own privileges.';
