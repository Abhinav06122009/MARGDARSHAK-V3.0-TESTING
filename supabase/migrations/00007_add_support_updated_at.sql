-- ADD UPDATED_AT COLUMNS TO ADMIN AND SUPPORT TABLES
-- These columns are required for status updates, triage tracking, and moderation history.

-- 1. Support Tables
ALTER TABLE public.contact_messages ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 2. Admin & Moderation Tables
ALTER TABLE public.admin_reports ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE public.moderation_queue ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 3. Security Tables (for tracking when settings/threats were last updated)
ALTER TABLE public.security_settings ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 4. Attach handle_updated_at triggers to all modified tables
DO $$ 
BEGIN
    -- contact_messages
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_updated_at_contact_messages') THEN
        CREATE TRIGGER handle_updated_at_contact_messages BEFORE UPDATE ON public.contact_messages
        FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;

    -- support_tickets
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_updated_at_support_tickets') THEN
        CREATE TRIGGER handle_updated_at_support_tickets BEFORE UPDATE ON public.support_tickets
        FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;

    -- admin_reports
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_updated_at_admin_reports') THEN
        CREATE TRIGGER handle_updated_at_admin_reports BEFORE UPDATE ON public.admin_reports
        FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;

    -- moderation_queue
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_updated_at_moderation_queue') THEN
        CREATE TRIGGER handle_updated_at_moderation_queue BEFORE UPDATE ON public.moderation_queue
        FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;

    -- security_settings
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_updated_at_security_settings') THEN
        CREATE TRIGGER handle_updated_at_security_settings BEFORE UPDATE ON public.security_settings
        FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;
END $$;
