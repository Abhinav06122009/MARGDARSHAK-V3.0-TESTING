-- Migration 00014: Firewall and Automated Banning System
-- Goal: Automated detection and neutralization of penetration testing and hostile attacks.

-- 1. SECURITY BLACKLIST (Network Level Blocking)
CREATE TABLE IF NOT EXISTS public.security_blacklist (
    ip_address TEXT PRIMARY KEY,
    reason TEXT NOT NULL,
    threat_level TEXT DEFAULT 'HIGH', -- LOW, MEDIUM, HIGH, CRITICAL
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

-- Enable RLS (Only admins can see/edit the blacklist)
ALTER TABLE public.security_blacklist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage blacklist" ON public.security_blacklist
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = public.requesting_user_id()
            AND user_type = 'admin'
        )
    );

-- 2. AUTOMATED BANNING LOGIC
-- If a security event with risk_score >= 80 is logged, ban the IP for 24 hours.
CREATE OR REPLACE FUNCTION public.process_security_threat()
RETURNS TRIGGER AS $$
BEGIN
    -- Only auto-ban if risk is CRITICAL (>= 90) or frequent HIGH (>= 70)
    IF NEW.risk_score >= 90 OR (NEW.risk_score >= 70 AND EXISTS (
        SELECT 1 FROM public.security_logs 
        WHERE ip_address = NEW.ip_address 
        AND created_at > NOW() - INTERVAL '1 hour'
        HAVING COUNT(*) > 3
    )) THEN
        INSERT INTO public.security_blacklist (ip_address, reason, threat_level, expires_at, metadata)
        VALUES (
            NEW.ip_address, 
            'Automated ban: Hostile activity detected (Risk: ' || NEW.risk_score || ')',
            'CRITICAL',
            NOW() + INTERVAL '24 hours',
            jsonb_build_object('event_type', NEW.event_type, 'last_log_id', NEW.id)
        )
        ON CONFLICT (ip_address) DO UPDATE 
        SET expires_at = GREATEST(security_blacklist.expires_at, EXCLUDED.expires_at),
            reason = EXCLUDED.reason;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind to security_logs (assuming we also log frontend anomalies there)
DROP TRIGGER IF EXISTS trigger_auto_ban ON public.security_logs;
CREATE TRIGGER trigger_auto_ban
AFTER INSERT ON public.security_logs
FOR EACH ROW EXECUTE FUNCTION public.process_security_threat();

-- 3. HELPER FOR BACKEND FIREWALL
CREATE OR REPLACE FUNCTION public.is_ip_banned(p_ip TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.security_blacklist
        WHERE ip_address = p_ip
        AND expires_at > NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. PRIVILEGED ACCESS ENFORCEMENT
-- Function to check if a user is a "High Ranked Official" (Admin or Superadmin)
CREATE OR REPLACE FUNCTION public.is_high_ranked(p_user_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = p_user_id
        AND (user_type = 'admin' OR subscription_tier = 'premium_elite')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. APPLY STRICT RLS TO SENSITIVE TABLES (RE-ENFORCE)
-- Ensure even "authenticated" users cannot perform penetration tests on system tables.
DO $$
DECLARE
    v_table TEXT;
BEGIN
    FOR v_table IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
        AND tablename IN ('security_logs', 'admin_reports', 'security_blacklist')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Strict access for %I" ON public.%I', v_table, v_table);
        EXECUTE format('CREATE POLICY "Strict access for %I" ON public.%I 
            FOR ALL USING (public.is_high_ranked(public.requesting_user_id()))', v_table, v_table);
    END LOOP;
END $$;
