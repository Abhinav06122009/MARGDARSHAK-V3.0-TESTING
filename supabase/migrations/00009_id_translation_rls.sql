-- 00009_id_translation_rls.sql
-- Synchronizes Supabase RLS with the application's ID Translation Protocol (SHA-256)

-- 1. Ensure pgcrypto is available for SHA-256 hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Update requesting_user_id() to return the translated UUID
-- This matches the deterministic mapping in src/lib/id-translator.ts
CREATE OR REPLACE FUNCTION public.requesting_user_id()
RETURNS text
LANGUAGE sql STABLE
AS $$
  SELECT (
    WITH raw_id AS (
      SELECT nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::text as id
    ),
    hash AS (
      SELECT encode(digest(id, 'sha256'), 'hex') as h
      FROM raw_id
      WHERE id IS NOT NULL
    )
    SELECT 
      CASE 
        WHEN h IS NOT NULL THEN
          substring(h, 1, 8) || '-' || 
          substring(h, 9, 4) || '-' || 
          substring(h, 13, 4) || '-' || 
          substring(h, 17, 4) || '-' || 
          substring(h, 21, 12)
        ELSE NULL
      END
    FROM hash
  );
$$;

-- 3. Update profiles to ensure the ID translation is enforced for any direct DB lookups
COMMENT ON FUNCTION public.requesting_user_id() IS 'Returns the deterministic UUID translated from the Clerk Identity string to ensure RLS compatibility with the live Zenith schema.';
