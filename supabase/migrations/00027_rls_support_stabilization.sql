-- 00027_rls_support_stabilization.sql
-- Harmonizes administrative permissions for support and contact tables

-- 1. Create a unified admin check function if it doesn't exist (to avoid repeating roles)
CREATE OR REPLACE FUNCTION public.is_admin_staff(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_uuid::text
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

-- 2. Stabilize contact_messages Policies
DROP POLICY IF EXISTS "Allow admins to view contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can manage contact messages" ON public.contact_messages;

CREATE POLICY "Admins can manage contact messages" 
ON public.contact_messages 
FOR ALL 
TO authenticated 
USING (public.is_admin_staff(auth.uid()));

-- 3. Stabilize support_tickets Policies
DROP POLICY IF EXISTS "Admins can manage all support tickets" ON public.support_tickets;

CREATE POLICY "Admins can manage all support tickets" 
ON public.support_tickets 
FOR ALL 
TO authenticated 
USING (public.is_admin_staff(auth.uid()));

-- 4. Ensure updated_at triggers exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_support_tickets_updated_at') THEN
        CREATE TRIGGER handle_support_tickets_updated_at
            BEFORE UPDATE ON public.support_tickets
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_updated_at();
    END IF;
END $$;
