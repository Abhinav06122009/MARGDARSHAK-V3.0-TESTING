-- Security Events Table for Fraud Prevention
-- Stores login events, suspicious activity, and device fingerprints
-- for authenticated users who have accepted the Terms of Service.
-- IP addresses are stored server-side (from Netlify function headers),
-- not from the browser, making them reliable for fraud detection.
--
-- NOTE: If the table already exists from a prior migration attempt, we
-- add any missing columns via ALTER TABLE … ADD COLUMN IF NOT EXISTS
-- before creating indexes, so this script is fully idempotent.

-- 1. Create the table if it doesn't exist at all
CREATE TABLE IF NOT EXISTS public.security_events (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Add every column that may be missing (safe to run multiple times)
ALTER TABLE public.security_events
  ADD COLUMN IF NOT EXISTS email             text,
  ADD COLUMN IF NOT EXISTS full_name         text,
  ADD COLUMN IF NOT EXISTS ip_address        inet,
  ADD COLUMN IF NOT EXISTS user_agent        text,
  ADD COLUMN IF NOT EXISTS device_fingerprint jsonb,
  ADD COLUMN IF NOT EXISTS risk_score        int  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS anomalies         text[],
  ADD COLUMN IF NOT EXISTS metadata          jsonb DEFAULT '{}';

-- 3. Indexes (all use IF NOT EXISTS so re-runs are safe)
CREATE INDEX IF NOT EXISTS security_events_user_id_idx    ON public.security_events (user_id);
CREATE INDEX IF NOT EXISTS security_events_email_idx      ON public.security_events (email);
CREATE INDEX IF NOT EXISTS security_events_event_type_idx ON public.security_events (event_type);
CREATE INDEX IF NOT EXISTS security_events_ip_idx         ON public.security_events (ip_address);
CREATE INDEX IF NOT EXISTS security_events_created_at_idx ON public.security_events (created_at DESC);

-- 4. Enable Row-Level Security
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events FORCE ROW LEVEL SECURITY;

-- 5. Policies — drop first so re-runs don't error
DROP POLICY IF EXISTS security_events_select ON public.security_events;
CREATE POLICY security_events_select
  ON public.security_events FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.get_user_role() = 'admin'
  );

-- Only the service role (used by Netlify functions) may insert events.
-- Regular authenticated users cannot self-insert — the server writes on
-- their behalf after verifying the JWT, preventing manipulation.
DROP POLICY IF EXISTS security_events_insert ON public.security_events;
CREATE POLICY security_events_insert
  ON public.security_events FOR INSERT
  WITH CHECK (
    public.get_user_role() = 'admin'
  );

-- Only admins may delete (e.g. GDPR erasure via admin console)
DROP POLICY IF EXISTS security_events_delete ON public.security_events;
CREATE POLICY security_events_delete
  ON public.security_events FOR DELETE
  USING (public.get_user_role() = 'admin');

-- 6. Grant service_role full access so the Netlify function can bypass RLS
GRANT ALL ON public.security_events TO service_role;
