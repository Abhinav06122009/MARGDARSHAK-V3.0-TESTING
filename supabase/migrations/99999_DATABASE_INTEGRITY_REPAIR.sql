-- MASTER PLATFORM RESTORATION SCRIPT (ZENITH ARCHITECTURE)
-- VERSION 10.0: EMERGENCY RECOVERY OF DELETED SECURITY POLICIES

-- 1. EXTENSIONS & SCHEMA
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- 2. IDENTITY TRANSLATION (SALTED & HARDENED)
DROP FUNCTION IF EXISTS public.translate_clerk_id_to_uuid(text) CASCADE;
CREATE OR REPLACE FUNCTION public.translate_clerk_id_to_uuid(p_clerk_id text)
RETURNS text
LANGUAGE plpgsql STABLE
AS $$
DECLARE
    v_salt TEXT := 'b8236e1f-1918-4447-9de9-9e363a37ff0d1d05da6b-ad8a-4734-bcd8-c10c7bdf39aa';
BEGIN
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
RETURNS text
LANGUAGE sql STABLE
AS $$
  SELECT public.translate_clerk_id_to_uuid(nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::text)::text;
$$;

-- 3. ADMINISTRATIVE RPCs
DROP FUNCTION IF EXISTS public.get_current_user_role() CASCADE;
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT user_type FROM public.profiles 
    WHERE id::text = public.requesting_user_id()::text
  );
END;
$$;

DROP FUNCTION IF EXISTS public.get_my_calendar_events() CASCADE;
CREATE OR REPLACE FUNCTION public.get_my_calendar_events()
RETURNS SETOF json
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT row_to_json(t) FROM (
    SELECT * FROM public.profiles WHERE id = public.requesting_user_id()
  ) t;
END;
$$;

-- 4. CORE TABLE RESTORATION (THE 404 FIX)
CREATE TABLE IF NOT EXISTS public.profiles (
  id text primary key,
  clerk_id text unique,
  email text,
  full_name text,
  avatar_url text,
  user_type text default 'student',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id text,
  title text not null,
  description text,
  completed boolean default false,
  due_date timestamptz,
  priority text default 'medium',
  created_at timestamptz default now()
);

-- 5. UNIFIED ADMIN CHECK (TYPE-SAFE)
CREATE OR REPLACE FUNCTION public.is_admin_staff(p_user_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id::TEXT = public.translate_clerk_id_to_uuid(p_user_id)::TEXT
        AND (user_type ILIKE ANY (ARRAY['%admin%', '%ceo%', '%manager%', '%moderator%', '%official%', '%hr%']))
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. GLOBAL SECURITY RESTORATION (THE FIX)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage their own profiles" ON public.profiles;
CREATE POLICY "Users can manage their own profiles" ON public.profiles FOR ALL USING (id::TEXT = public.requesting_user_id()::TEXT);

-- Tasks Policies
DROP POLICY IF EXISTS "Users can manage their own tasks" ON public.tasks;
CREATE POLICY "Users can manage their own tasks" ON public.tasks FOR ALL USING (user_id::TEXT = public.requesting_user_id()::TEXT);

-- 7. SUPPORT INFRASTRUCTURE
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

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage contact messages" ON public.contact_messages;
CREATE POLICY "Admins can manage contact messages" ON public.contact_messages FOR ALL USING (public.is_admin_staff(nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')));

DROP POLICY IF EXISTS "Admins can manage support tickets" ON public.support_tickets;
CREATE POLICY "Admins can manage support tickets" ON public.support_tickets FOR ALL USING (public.is_admin_staff(nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')));
