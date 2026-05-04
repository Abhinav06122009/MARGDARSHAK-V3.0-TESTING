-- MASTER DATABASE INTEGRITY REPAIR SCRIPT (SYNC STABILIZATION)
-- VERSION 4.0: CRITICAL FIX FOR ID-SALT DESYNCHRONIZATION

-- 1. Ensure Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Identity Translation Logic (ZENITH SYNC - MATCHES FRONTEND SALT)
DROP FUNCTION IF EXISTS public.translate_clerk_id_to_uuid(text) CASCADE;
CREATE OR REPLACE FUNCTION public.translate_clerk_id_to_uuid(p_clerk_id text)
RETURNS text
LANGUAGE plpgsql STABLE
AS $$
DECLARE
    v_salt TEXT := 'b8236e1f-1918-4447-9de9-9e363a37ff0d1d05da6b-ad8a-4734-bcd8-c10c7bdf39aa';
    v_combined TEXT;
    v_hash TEXT;
BEGIN
  -- If it's already a UUID, return it
  IF p_clerk_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    RETURN p_clerk_id;
  END IF;

  -- MATCH FRONTEND LOGIC: ID + SALT
  v_combined := p_clerk_id || v_salt;
  v_hash := encode(digest(v_combined, 'sha256'), 'hex');

  RETURN (
    SELECT 
      substring(v_hash, 1, 8) || '-' || 
      substring(v_hash, 9, 4) || '-' || 
      '4' || substring(v_hash, 14, 3) || '-' || 
      '8' || substring(v_hash, 18, 3) || '-' || 
      substring(v_hash, 21, 12)
  );
END;
$$;

-- 3. Update Requesting User Resolution
CREATE OR REPLACE FUNCTION public.requesting_user_id()
RETURNS text
LANGUAGE sql STABLE
AS $$
  SELECT public.translate_clerk_id_to_uuid(nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::text);
$$;

-- 4. Unified Admin Check Function
CREATE OR REPLACE FUNCTION public.is_admin_staff(p_user_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_translated_id TEXT;
BEGIN
    v_translated_id := public.translate_clerk_id_to_uuid(p_user_id);
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = v_translated_id
        AND (
            user_type ILIKE '%admin%' OR 
            user_type ILIKE '%ceo%' OR 
            user_type ILIKE '%manager%' OR 
            user_type ILIKE '%moderator%' OR 
            user_type ILIKE '%hr%' OR 
            user_type ILIKE '%official%'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Infrastructure Check (No-Destructive)
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT,
    last_name TEXT,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    resolution_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT, 
    subject TEXT,
    message TEXT,
    status TEXT DEFAULT 'open',
    priority TEXT DEFAULT 'medium',
    resolution_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. RLS Policy Sync
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage contact messages" ON public.contact_messages;
CREATE POLICY "Admins can manage contact messages" ON public.contact_messages FOR ALL USING (public.is_admin_staff(nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')));

DROP POLICY IF EXISTS "Admins can manage support tickets" ON public.support_tickets;
CREATE POLICY "Admins can manage support tickets" ON public.support_tickets FOR ALL USING (public.is_admin_staff(nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')));

-- 7. Realtime Sync
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'contact_messages') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_messages;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'support_tickets') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;
    END IF;
END $$;
