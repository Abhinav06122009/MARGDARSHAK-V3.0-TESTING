-- SQL Migration: 00008_fix_security_logs_schema
-- Purpose: Ensure all required columns exist in security_logs table.

DO $$
BEGIN
    -- Add ai_summary if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'security_logs' AND column_name = 'ai_summary') THEN
        ALTER TABLE public.security_logs ADD COLUMN ai_summary TEXT;
    END IF;

    -- Add risk_score if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'security_logs' AND column_name = 'risk_score') THEN
        ALTER TABLE public.security_logs ADD COLUMN risk_score INT DEFAULT 0;
    END IF;

    -- Add risk_level if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'security_logs' AND column_name = 'risk_level') THEN
        ALTER TABLE public.security_logs ADD COLUMN risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical'));
    END IF;

    -- Add flags if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'security_logs' AND column_name = 'flags') THEN
        ALTER TABLE public.security_logs ADD COLUMN flags TEXT[] DEFAULT '{}';
    END IF;

    -- Add summary if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'security_logs' AND column_name = 'summary') THEN
        ALTER TABLE public.security_logs ADD COLUMN summary TEXT;
    END IF;

    -- Add device_id if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'security_logs' AND column_name = 'device_id') THEN
        ALTER TABLE public.security_logs ADD COLUMN device_id TEXT;
    END IF;

    -- Add ip_address if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'security_logs' AND column_name = 'ip_address') THEN
        ALTER TABLE public.security_logs ADD COLUMN ip_address TEXT;
    END IF;

    -- Add location if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'security_logs' AND column_name = 'location') THEN
        ALTER TABLE public.security_logs ADD COLUMN location TEXT;
    END IF;

    -- --- SECURITY THREATS FIXES ---
    
    -- Add threat_level if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'security_threats' AND column_name = 'threat_level') THEN
        ALTER TABLE public.security_threats ADD COLUMN threat_level TEXT CHECK (threat_level IN ('low', 'medium', 'high', 'critical'));
    END IF;

    -- Add threat_score if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'security_threats' AND column_name = 'threat_score') THEN
        ALTER TABLE public.security_threats ADD COLUMN threat_score INT DEFAULT 0;
    END IF;

    -- Add flags if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'security_threats' AND column_name = 'flags') THEN
        ALTER TABLE public.security_threats ADD COLUMN flags TEXT[] DEFAULT '{}';
    END IF;

    -- Add device_id if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'security_threats' AND column_name = 'device_id') THEN
        ALTER TABLE public.security_threats ADD COLUMN device_id TEXT;
    END IF;
END $$;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
