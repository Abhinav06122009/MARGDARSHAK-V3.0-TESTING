
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing environment variables. Check .env file.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function repair() {
  console.log('🛡️ Initializing Zenith Identity Repair...');
  
  const sql = `
    -- 1. Restore standard requesting_user_id to TEXT (Fixes RLS/Other functions)
    CREATE OR REPLACE FUNCTION public.requesting_user_id()
    RETURNS TEXT AS $$
    BEGIN
        RETURN (current_setting('request.jwt.claims', true)::jsonb ->> 'sub');
    EXCEPTION
        WHEN OTHERS THEN
            RETURN NULL;
    END;
    $$ LANGUAGE plpgsql STABLE;

    -- 2. Create specialized UUID version for Audit Logs
    CREATE OR REPLACE FUNCTION public.requesting_user_id_uuid()
    RETURNS UUID AS $$
    DECLARE
        v_raw_id TEXT;
    BEGIN
        v_raw_id := public.requesting_user_id();
        IF v_raw_id IS NULL THEN RETURN NULL; END IF;
        
        IF v_raw_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
            RETURN v_raw_id::UUID;
        END IF;
        
        RETURN public.translate_clerk_id_to_uuid(v_raw_id)::UUID;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN NULL;
    END;
    $$ LANGUAGE plpgsql STABLE;

    -- 3. Patch the audit trigger to use the UUID proxy
    CREATE OR REPLACE FUNCTION public.log_sensitive_change()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
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
                    'old_data', to_jsonb(OLD) - 'email' - 'full_name' - 'phone_number',
                    'new_data', to_jsonb(NEW) - 'email' - 'full_name' - 'phone_number'
                )
            );
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
        RETURN NEW;
    END;
    $$;
  `;

  // Note: Supabase JS client doesn't have an 'sql' method, 
  // so we have to use an RPC or hope the user has one.
  // Since we can't run raw SQL via JS client easily without an RPC, 
  // we will try to use the npx supabase CLI with the SERVICE_ROLE_KEY if possible.
  
  console.log('⚠️  Please run the SQL above in your Supabase SQL Editor to restore access.');
}

repair();
