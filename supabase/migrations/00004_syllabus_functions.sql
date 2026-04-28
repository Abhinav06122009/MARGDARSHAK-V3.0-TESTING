-- Syllabus Statistics & Search RPCs

-- 1. Get Syllabus Statistics
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
    WHERE is_deleted = false AND user_id = requesting_user_id();

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

-- 2. Search Syllabi
CREATE OR REPLACE FUNCTION public.search_syllabi(
    p_query text,
    p_semester text DEFAULT NULL,
    p_academic_year text DEFAULT NULL,
    p_limit int DEFAULT 50
)
RETURNS SETOF public.syllabi
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT *
    FROM public.syllabi
    WHERE 
        is_deleted = false 
        AND (user_id = requesting_user_id() OR is_public = true)
        AND (
            p_query IS NULL OR 
            course_name ILIKE '%' || p_query || '%' OR 
            course_code ILIKE '%' || p_query || '%' OR
            instructor_name ILIKE '%' || p_query || '%' OR
            description ILIKE '%' || p_query || '%'
        )
        AND (p_semester IS NULL OR semester = p_semester)
        AND (p_academic_year IS NULL OR academic_year = p_academic_year)
    ORDER BY updated_at DESC
    LIMIT p_limit;
$$;

-- 3. Create Syllabus Revision
CREATE OR REPLACE FUNCTION public.create_syllabus_revision(
    p_syllabus_id uuid,
    p_changes_summary text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_revision_id uuid;
    v_version int;
BEGIN
    -- Get current version
    SELECT version INTO v_version FROM public.syllabi WHERE id = p_syllabus_id;
    
    -- Increment version
    UPDATE public.syllabi 
    SET version = version + 1, updated_at = now() 
    WHERE id = p_syllabus_id;

    -- Return the syllabus ID (as the revision is tracked by versioning in this schema)
    RETURN p_syllabus_id;
END;
$$;
