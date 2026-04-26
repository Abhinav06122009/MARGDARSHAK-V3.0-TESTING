-- Create syllabi table
CREATE TABLE IF NOT EXISTS public.syllabi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_name TEXT NOT NULL,
    course_code TEXT NOT NULL,
    semester TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    instructor_name TEXT NOT NULL,
    instructor_email TEXT,
    department TEXT,
    credits INTEGER DEFAULT 3,
    course_type TEXT,
    description TEXT NOT NULL,
    prerequisites TEXT[] DEFAULT '{}',
    objectives TEXT[] NOT NULL DEFAULT '{}',
    topics TEXT[] NOT NULL DEFAULT '{}',
    assignments TEXT[] DEFAULT '{}',
    grading_criteria TEXT NOT NULL DEFAULT '',
    textbooks TEXT[] DEFAULT '{}',
    supplementary_materials TEXT[] DEFAULT '{}',
    schedule JSONB DEFAULT '{}'::jsonb,
    office_hours TEXT,
    contact_info JSONB DEFAULT '{}'::jsonb,
    course_policies TEXT,
    attendance_policy TEXT,
    file_url TEXT,
    file_name TEXT,
    version INTEGER DEFAULT 1,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'under_review')),
    is_public BOOLEAN DEFAULT false,
    approval_status TEXT DEFAULT 'pending',
    tags TEXT[] DEFAULT '{}',
    language TEXT DEFAULT 'en',
    difficulty_level TEXT DEFAULT 'intermediate',
    estimated_workload_hours INTEGER,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.syllabi ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own syllabi"
    ON public.syllabi
    FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Public syllabi are viewable by everyone"
    ON public.syllabi
    FOR SELECT
    USING (is_public = true AND status = 'published');

-- Functions and RPCs
CREATE OR REPLACE FUNCTION get_syllabus_statistics()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_syllabi', COUNT(*),
        'published_syllabi', COUNT(*) FILTER (WHERE status = 'published'),
        'draft_syllabi', COUNT(*) FILTER (WHERE status = 'draft'),
        'archived_syllabi', COUNT(*) FILTER (WHERE status = 'archived'),
        'public_syllabi', COUNT(*) FILTER (WHERE is_public = true),
        'departments', COALESCE((SELECT array_agg(DISTINCT department) FROM syllabi WHERE department IS NOT NULL), '{}'),
        'semesters', COALESCE((SELECT array_agg(DISTINCT semester) FROM syllabi WHERE semester IS NOT NULL), '{}'),
        'academic_years', COALESCE((SELECT array_agg(DISTINCT academic_year) FROM syllabi WHERE academic_year IS NOT NULL), '{}'),
        'popular_tags', COALESCE((SELECT array_agg(DISTINCT t) FROM syllabi, unnest(tags) t WHERE t IS NOT NULL LIMIT 10), '{}')
    ) INTO result
    FROM syllabi
    WHERE is_deleted = false;
    
    RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION search_syllabi(p_query TEXT, p_semester TEXT DEFAULT NULL, p_academic_year TEXT DEFAULT NULL, p_limit INTEGER DEFAULT 50)
RETURNS SETOF public.syllabi
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT *
    FROM public.syllabi
    WHERE 
        is_deleted = false AND
        (p_query IS NULL OR 
         course_name ILIKE '%' || p_query || '%' OR 
         course_code ILIKE '%' || p_query || '%' OR 
         instructor_name ILIKE '%' || p_query || '%') AND
        (p_semester IS NULL OR semester = p_semester) AND
        (p_academic_year IS NULL OR academic_year = p_academic_year)
    LIMIT p_limit;
$$;

CREATE OR REPLACE FUNCTION create_syllabus_revision(p_syllabus_id UUID, p_changes_summary TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update version and timestamp on main table
    UPDATE public.syllabi 
    SET version = version + 1, updated_at = now()
    WHERE id = p_syllabus_id;
END;
$$;
