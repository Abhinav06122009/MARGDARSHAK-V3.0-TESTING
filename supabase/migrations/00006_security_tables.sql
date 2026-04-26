-- SQL Migration: 00006_security_tables
-- Purpose: Create missing tables for security logging and activity tracking.

-- 1. Security Logs (Main log for all security-related events)
CREATE TABLE IF NOT EXISTS public.security_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    ip_address TEXT,
    location TEXT,
    device_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    risk_score INT DEFAULT 0,
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    flags TEXT[] DEFAULT '{}',
    summary TEXT,
    ai_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Security Threats (Specific table for high-risk events)
CREATE TABLE IF NOT EXISTS public.security_threats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    ip_address TEXT,
    threat_level TEXT CHECK (threat_level IN ('low', 'medium', 'high', 'critical')),
    threat_score INT DEFAULT 0,
    flags TEXT[] DEFAULT '{}',
    summary TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. User Activity Logs (General activity tracking)
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    activity_type TEXT NOT NULL,
    ip_address TEXT,
    device_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. IP Logs (Tracking IP-based activity and proxy status)
CREATE TABLE IF NOT EXISTS public.ip_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address TEXT,
    city TEXT,
    country TEXT,
    is_proxy BOOLEAN DEFAULT false,
    event_type TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Admin Reports (Reports for manual review by administrators)
CREATE TABLE IF NOT EXISTS public.admin_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    category TEXT NOT NULL,
    severity TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- --- RLS SETUP ---

ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_threats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ip_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_reports ENABLE ROW LEVEL SECURITY;

-- Select policies (User can see their own logs, Admins see all)
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN SELECT unnest(ARRAY['security_logs', 'security_threats', 'user_activity_logs', 'admin_reports']) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I_select ON public.%I', t, t);
        EXECUTE format('CREATE POLICY %I_select ON public.%I FOR SELECT USING (auth.uid() = user_id OR public.get_user_role() = ''admin'')', t, t);
    END LOOP;
END $$;

-- IP logs are admin-only
DROP POLICY IF EXISTS ip_logs_select ON public.ip_logs;
CREATE POLICY ip_logs_select ON public.ip_logs FOR SELECT USING (public.get_user_role() = 'admin');

-- Grant full access to service_role (for Edge Functions)
GRANT ALL ON public.security_logs TO service_role;
GRANT ALL ON public.security_threats TO service_role;
GRANT ALL ON public.user_activity_logs TO service_role;
GRANT ALL ON public.ip_logs TO service_role;
GRANT ALL ON public.admin_reports TO service_role;

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON public.security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON public.security_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_threats_user_id ON public.security_threats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ip_logs_address ON public.ip_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_admin_reports_resolved ON public.admin_reports(resolved) WHERE NOT resolved;
