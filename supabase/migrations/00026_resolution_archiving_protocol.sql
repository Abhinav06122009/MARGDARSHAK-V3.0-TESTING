-- 00026_resolution_archiving_protocol.sql
-- Adds resolution_text column to capture official responses for both contacts and tickets

-- Update contact_messages
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contact_messages' AND column_name='resolution_text') THEN
        ALTER TABLE public.contact_messages ADD COLUMN resolution_text TEXT;
    END IF;
END $$;

-- Update support_tickets (if it exists)
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='support_tickets') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='support_tickets' AND column_name='resolution_text') THEN
            ALTER TABLE public.support_tickets ADD COLUMN resolution_text TEXT;
        END IF;
    END IF;
END $$;
