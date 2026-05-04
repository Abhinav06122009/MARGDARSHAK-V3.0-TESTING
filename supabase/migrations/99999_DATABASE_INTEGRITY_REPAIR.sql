-- MASTER PLATFORM RESTORATION SCRIPT (ZENITH ARCHITECTURE)
-- VERSION 19.0: MASTER OVERRIDE AND RESOLUTION AUTHORING BRIDGE

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- 2. IDENTITY TRANSLATION (SALTED)
DROP FUNCTION IF EXISTS public.translate_clerk_id_to_uuid(text) CASCADE;
CREATE OR REPLACE FUNCTION public.translate_clerk_id_to_uuid(p_clerk_id text)
RETURNS text
LANGUAGE plpgsql STABLE
AS $$
DECLARE
    v_salt TEXT := 'b8236e1f-1918-4447-9de9-9e363a37ff0d1d05da6b-ad8a-4734-bcd8-c10c7bdf39aa';
BEGIN
  IF p_clerk_id IS NULL OR p_clerk_id = '' THEN RETURN NULL; END IF;
  IF p_clerk_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    RETURN p_clerk_id;
  END IF;

  RETURN (
    WITH hash AS (
      SELECT encode(extensions.digest((p_clerk_id || v_salt)::text, 'sha256'::text), 'hex') as h
    )
    SELECT 
      substring(h, 1, 8) || '-' || 
      substring(h, 9, 4) || '-' || 
      '4' || substring(h, 14, 3) || '-' || 
      '8' || substring(h, 18, 3) || '-' || 
      substring(h, 21, 12)
    FROM hash
  );
END;
$$;

DROP FUNCTION IF EXISTS public.requesting_user_id() CASCADE;
CREATE OR REPLACE FUNCTION public.requesting_user_id()
RETURNS UUID AS $$
DECLARE
    v_raw_id TEXT;
BEGIN
    -- Extract the 'sub' from the JWT claim
    v_raw_id := (current_setting('request.jwt.claims', true)::jsonb ->> 'sub');
    
    IF v_raw_id IS NULL THEN
        RETURN NULL;
    END IF;

    -- If it's already a valid UUID, return it
    IF v_raw_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
        RETURN v_raw_id::UUID;
    END IF;

    -- Otherwise, translate it using the deterministic salt protocol
    RETURN public.translate_clerk_id_to_uuid(v_raw_id)::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- 3. MASTER OVERRIDE AUTH (THE "WORK EVERYTHING PERFECTLY" FIX)
CREATE OR REPLACE FUNCTION public.is_admin_staff(p_user_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_email TEXT;
BEGIN
    -- 1. Check Profile Rank
    IF EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id::TEXT = public.translate_clerk_id_to_uuid(p_user_id)::TEXT
        AND (user_type ILIKE ANY (ARRAY['%admin%', '%ceo%', '%manager%', '%moderator%', '%official%', '%hr%']))
    ) THEN RETURN TRUE; END IF;

    -- 2. Master Override Fail-safe (By Email)
    SELECT email INTO v_email FROM public.profiles WHERE id::TEXT = public.translate_clerk_id_to_uuid(p_user_id)::TEXT;
    IF v_email IN ('abhinavjha393@gmail.com', 'abhinav.vsavwe4899@gmail.com') THEN RETURN TRUE; END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. SUPPORT INFRASTRUCTURE (WITH RESOLUTION COLUMNS)
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT, 
    subject TEXT,
    message TEXT,
    status TEXT DEFAULT 'open',
    priority TEXT DEFAULT 'medium',
    resolution_text TEXT,
    resolved_at TIMESTAMPTZ,
    resolved_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. IDENTITY MIGRATION ENGINE
DO $$
DECLARE
    r RECORD;
    v_new_id TEXT;
BEGIN
    FOR r IN (
        SELECT id, clerk_id, email, full_name, avatar_url, user_type 
        FROM public.profiles 
        WHERE id::text != public.translate_clerk_id_to_uuid(clerk_id)::text
    ) LOOP
        v_new_id := public.translate_clerk_id_to_uuid(r.clerk_id);
        DELETE FROM public.profiles WHERE email = r.email AND id::text != v_new_id::text;
        INSERT INTO public.profiles (id, clerk_id, email, full_name, avatar_url, user_type)
        VALUES (v_new_id::uuid, r.clerk_id, r.email, r.full_name, r.avatar_url, r.user_type)
        ON CONFLICT (id) DO UPDATE SET user_type = EXCLUDED.user_type;
        UPDATE public.support_tickets SET user_id = v_new_id::text WHERE user_id::text = r.id::text;
        DELETE FROM public.profiles WHERE id::text = r.id::text;
    END LOOP;
END $$;

-- 6. SECURITY POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage support tickets" ON public.support_tickets;
CREATE POLICY "Admins can manage support tickets" ON public.support_tickets 
FOR ALL USING (public.is_admin_staff(nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')));
