-- 00010_identity_re_stabilization.sql
-- Re-stabilizes identity resolution after salt removal

-- 1. Ensure the translation function is UNSALTED (Confirming previous work)
CREATE OR REPLACE FUNCTION public.translate_clerk_id_to_uuid(p_clerk_id text)
RETURNS uuid
LANGUAGE plpgsql STABLE
AS $$
DECLARE
    v_h text;
BEGIN
    -- If it is already a UUID, return it
    IF p_clerk_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
        RETURN p_clerk_id::uuid;
    END IF;

    -- Generate UNSALTED SHA-256 hash
    v_h := encode(extensions.digest(p_clerk_id, 'sha256'), 'hex');
    
    RETURN (
        substring(v_h, 1, 8) || '-' || 
        substring(v_h, 9, 4) || '-' || 
        '4' || substring(v_h, 14, 3) || '-' || 
        '8' || substring(v_h, 18, 3) || '-' || 
        substring(v_h, 21, 12)
    )::uuid;
END;
$$;

-- 2. RE-MAP THE PROFILES TABLE
-- We use clerk_id to find the correct user and update their primary key (id)
-- This will CASCADE to all other tables because of the ON UPDATE CASCADE foreign keys created in 00009.
DO $$
BEGIN
    -- If clerk_id is NULL for some reason but id looks like a Clerk ID, fix it first
    UPDATE public.profiles SET clerk_id = id WHERE clerk_id IS NULL AND id LIKE 'user_%';

    -- Re-translate all IDs using the NEW unsalted logic
    -- We join on clerk_id to ensure we are updating the right record
    UPDATE public.profiles 
    SET id = public.translate_clerk_id_to_uuid(clerk_id)::text
    WHERE clerk_id IS NOT NULL;
END $$;

-- 3. ENSURE user_calendar_events TABLE IS CORRECTLY LINKED
-- If the table was renamed manually, it might be missing the FK or RLS policies.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_calendar_events' AND table_schema = 'public') THEN
        -- Add user_id column if missing (unlikely but safe)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_calendar_events' AND column_name = 'user_id') THEN
            ALTER TABLE public.user_calendar_events ADD COLUMN user_id text;
        END IF;

        -- Ensure FK exists and CASCADES
        ALTER TABLE public.user_calendar_events DROP CONSTRAINT IF EXISTS user_calendar_events_user_id_fkey;
        ALTER TABLE public.user_calendar_events ADD CONSTRAINT user_calendar_events_user_id_fkey 
            FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE CASCADE;

        -- Enable RLS
        ALTER TABLE public.user_calendar_events ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 4. RE-RUN RLS STABILIZATION FOR THE NEW TABLE NAME
DO $$
DECLARE
    v_table text := 'user_calendar_events';
    v_user_id_col text := 'user_id';
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = v_table AND table_schema = 'public') THEN
        EXECUTE format('DROP POLICY IF EXISTS "Standard SELECT for %I" ON public.%I', v_table, v_table);
        EXECUTE format('CREATE POLICY "Standard SELECT for %I" ON public.%I FOR SELECT USING (%I::text = public.requesting_user_id()::text)', v_table, v_table, v_user_id_col);
        
        EXECUTE format('DROP POLICY IF EXISTS "Standard INSERT for %I" ON public.%I', v_table, v_table);
        EXECUTE format('CREATE POLICY "Standard INSERT for %I" ON public.%I FOR INSERT WITH CHECK (%I::text = public.requesting_user_id()::text)', v_table, v_table, v_user_id_col);
        
        EXECUTE format('DROP POLICY IF EXISTS "Standard UPDATE for %I" ON public.%I', v_table, v_table);
        EXECUTE format('CREATE POLICY "Standard UPDATE for %I" ON public.%I FOR UPDATE USING (%I::text = public.requesting_user_id()::text)', v_table, v_table, v_user_id_col);
        
        EXECUTE format('DROP POLICY IF EXISTS "Standard DELETE for %I" ON public.%I', v_table, v_table);
        EXECUTE format('CREATE POLICY "Standard DELETE for %I" ON public.%I FOR DELETE USING (%I::text = public.requesting_user_id()::text)', v_table, v_table, v_user_id_col);
        
        -- Admin Override
        EXECUTE format('DROP POLICY IF EXISTS "Admin Master Override for %I" ON public.%I', v_table, v_table);
        EXECUTE format('CREATE POLICY "Admin Master Override for %I" ON public.%I FOR ALL USING (public.get_current_user_role()::text = ''admin'')', v_table, v_table);
    END IF;
END $$;
