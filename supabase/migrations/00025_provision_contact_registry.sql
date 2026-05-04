-- 00025_provision_contact_registry.sql
-- Creates the contact_messages table to resolve "Database Latency Detected" errors on /contact

CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    first_name TEXT,
    last_name TEXT,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow Public Submissions (INSERT only)
DROP POLICY IF EXISTS "Allow public contact submissions" ON public.contact_messages;
CREATE POLICY "Allow public contact submissions" ON public.contact_messages 
    FOR INSERT 
    WITH CHECK (true);

-- Allow Admins to View Messages (SELECT)
DROP POLICY IF EXISTS "Allow admins to view contact messages" ON public.contact_messages;
CREATE POLICY "Allow admins to view contact messages" ON public.contact_messages 
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id::text = auth.uid()::text
            WHERE id::text = auth.uid()::text
            AND (
                user_type ILIKE '%admin%' OR 
                user_type ILIKE '%ceo%' OR 
                user_type ILIKE '%manager%' OR 
                user_type ILIKE '%moderator%' OR 
                user_type ILIKE '%hr%' OR 
                user_type ILIKE '%official%'
            )
        )
    );

-- Add to Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_messages;
