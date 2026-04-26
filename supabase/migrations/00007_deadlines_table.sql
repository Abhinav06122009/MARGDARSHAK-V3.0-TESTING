-- SQL Migration: 00007_deadlines_table
-- Purpose: Create table for tracking exam and application deadlines.

CREATE TABLE IF NOT EXISTS public.deadlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    date DATE NOT NULL,
    registration_deadline DATE,
    notes TEXT,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.deadlines ENABLE ROW LEVEL SECURITY;

-- Select/Insert/Update/Delete policies (User manages their own deadlines)
DROP POLICY IF EXISTS deadlines_manage_own ON public.deadlines;
CREATE POLICY deadlines_manage_own ON public.deadlines
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Grants
GRANT ALL ON public.deadlines TO authenticated;
GRANT ALL ON public.deadlines TO service_role;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_deadlines_user_id ON public.deadlines(user_id);
CREATE INDEX IF NOT EXISTS idx_deadlines_date ON public.deadlines(date ASC);
