-- Fix Admin RLS Policies for Support & Messages

-- 1. Contact Messages (Public can insert, Admin can manage)
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert contact messages" ON public.contact_messages;
CREATE POLICY "Anyone can insert contact messages" 
ON public.contact_messages FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage contact messages" ON public.contact_messages;
CREATE POLICY "Admins can manage contact messages" 
ON public.contact_messages FOR ALL 
USING (get_current_user_role() = 'admin');

-- 2. Support Tickets (Users can manage own, Admin can manage all)
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage all support tickets" ON public.support_tickets;
CREATE POLICY "Admins can manage all support tickets" 
ON public.support_tickets FOR ALL 
USING (get_current_user_role() = 'admin');

-- 3. Admin Reports (Users can view own, Admin can manage all)
ALTER TABLE public.admin_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage all admin reports" ON public.admin_reports;
CREATE POLICY "Admins can manage all admin reports" 
ON public.admin_reports FOR ALL 
USING (get_current_user_role() = 'admin');

-- 4. Security Logs (Admin can view all)
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all security logs" ON public.security_logs;
CREATE POLICY "Admins can view all security logs" 
ON public.security_logs FOR SELECT 
USING (get_current_user_role() = 'admin');

-- 5. Profiles (Admin can manage all)
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles" 
ON public.profiles FOR ALL 
USING (get_current_user_role() = 'admin');
