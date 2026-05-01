-- 00020_progress_and_syllabus_stats.sql
-- ZENITH STABILIZATION: PROGRESS TRACKING & SYLLABUS ANALYTICS

-- 1. Create Progress Goals Table
CREATE TABLE IF NOT EXISTS public.progress_goals (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID NOT NULL, -- Will be enforced via RLS
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    target_value NUMERIC NOT NULL DEFAULT 0,
    current_value NUMERIC NOT NULL DEFAULT 0,
    unit TEXT NOT NULL,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    target_date DATE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Progress Entries Table
CREATE TABLE IF NOT EXISTS public.progress_entries (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    goal_id UUID NOT NULL REFERENCES public.progress_goals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    value NUMERIC NOT NULL,
    notes TEXT,
    date_recorded DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Ensure get_syllabus_statistics exists and is robust
-- Re-defining it here to ensure it uses the hardened requesting_user_id() correctly
DROP FUNCTION IF EXISTS public.get_syllabus_statistics();
CREATE OR REPLACE FUNCTION public.get_syllabus_statistics()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    result json;
BEGIN
    SELECT json_build_object(
        'total_syllabi', count(*),
        'published_syllabi', count(*) FILTER (WHERE status = 'published'),
        'draft_syllabi', count(*) FILTER (WHERE status = 'draft'),
        'archived_syllabi', count(*) FILTER (WHERE status = 'archived'),
        'public_syllabi', count(*) FILTER (WHERE is_public = true),
        'departments', (SELECT json_agg(DISTINCT department) FROM public.syllabi WHERE department IS NOT NULL),
        'semesters', (SELECT json_agg(DISTINCT semester) FROM public.syllabi WHERE semester IS NOT NULL),
        'academic_years', (SELECT json_agg(DISTINCT academic_year) FROM public.syllabi WHERE academic_year IS NOT NULL),
        'popular_tags', (
            SELECT json_agg(tag)
            FROM (
                SELECT unnest(tags) as tag, count(*) as count
                FROM public.syllabi
                WHERE tags IS NOT NULL
                GROUP BY tag
                ORDER BY count DESC
                LIMIT 10
            ) as popular_tags
        )
    ) INTO result
    FROM public.syllabi
    WHERE is_deleted = false AND user_id = public.requesting_user_id();

    RETURN COALESCE(result, json_build_object(
        'total_syllabi', 0,
        'published_syllabi', 0,
        'draft_syllabi', 0,
        'archived_syllabi', 0,
        'public_syllabi', 0,
        'departments', '[]'::json,
        'semesters', '[]'::json,
        'academic_years', '[]'::json,
        'popular_tags', '[]'::json
    ));
END;
$$;

-- 4. Grant access to authenticated users
GRANT ALL ON public.progress_goals TO authenticated;
GRANT ALL ON public.progress_entries TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_syllabus_statistics() TO authenticated;
