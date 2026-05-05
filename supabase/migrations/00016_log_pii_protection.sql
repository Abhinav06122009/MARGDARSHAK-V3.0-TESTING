-- 00016_log_pii_protection.sql
-- ZENITH ARCHITECTURE: PII PROTECTION PROTOCOL
-- Refines forensic logging to exclude sensitive PII from security logs.

CREATE OR REPLACE FUNCTION public.log_sensitive_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_old_data jsonb;
    v_new_data jsonb;
    v_excluded_cols text[] := ARRAY['email', 'phone_number', 'clerk_id', 'security_settings', 'metadata', 'avatar_url'];
    v_col text;
BEGIN
    v_old_data := to_jsonb(OLD);
    v_new_data := to_jsonb(NEW);

    -- Remove sensitive columns from log payloads
    FOREACH v_col IN ARRAY v_excluded_cols LOOP
        v_old_data := v_old_data - v_col;
        v_new_data := v_new_data - v_col;
    END LOOP;

    BEGIN
        INSERT INTO public.security_logs (
            user_id,
            event_type,
            risk_level,
            summary,
            metadata
        ) VALUES (
            public.requesting_user_id_uuid(),
            'DATA_MUTATION',
            'low',
            format('User modified table %s (ID: %s)', TG_TABLE_NAME, OLD.id),
            jsonb_build_object(
                'table', TG_TABLE_NAME,
                'operation', TG_OP,
                'old_data_scrubbed', v_old_data,
                'new_data_scrubbed', v_new_data
            )
        );
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.log_sensitive_change() IS 'Logs data mutations while scrubbing PII columns to prevent data duplication of sensitive information.';
