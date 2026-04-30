-- 00017_salted_id_translation.sql
-- ZENITH ARCHITECTURE: ID OBFUSCATION PROTOCOL
-- Adds a salt to the ID translation logic to prevent predictable internal UUIDs.

-- Note: In a production environment, you would set this salt via:
-- ALTER DATABASE postgres SET "app.settings.id_salt" = 'your-secret-salt-here';

CREATE OR REPLACE FUNCTION public.translate_clerk_id_to_uuid(p_clerk_id text)
RETURNS text
LANGUAGE plpgsql STABLE
AS $$
DECLARE
    v_salt text;
    v_combined text;
    v_h text;
BEGIN
    -- Get salt from database settings, fallback to a default if not set (not ideal but ensures function works)
    v_salt := current_setting('app.settings.id_salt', true);
    IF v_salt IS NULL OR v_salt = '' THEN
        v_salt := 'mg_default_internal_salt_v1'; 
    END IF;

    v_combined := p_clerk_id || v_salt;
    v_h := encode(extensions.digest(v_combined::text, 'sha256'::text), 'hex');

    RETURN 
      substring(v_h, 1, 8) || '-' || 
      substring(v_h, 9, 4) || '-' || 
      '4' || substring(v_h, 14, 3) || '-' || 
      '8' || substring(v_h, 18, 3) || '-' || 
      substring(v_h, 21, 12);
END;
$$;

COMMENT ON FUNCTION public.translate_clerk_id_to_uuid(text) IS 'Deterministic UUID translation with salt-based obfuscation to prevent ID predictability.';
