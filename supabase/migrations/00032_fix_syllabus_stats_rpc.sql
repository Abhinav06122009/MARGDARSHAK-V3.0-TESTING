-- 00032_fix_syllabus_stats_rpc.sql
-- IDENTITY PARITY: RPC HARMONIZATION
-- This migration updates syllabus-related RPCs to use the UUID-based identity resolver.
-- It also fixes cross-user leakage in statistics subqueries.

-- 1. REPAIR get_syllabus_statistics
CREATE OR REPLACE FUNCTION public.get_syllabus_statistics()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    v_user_id uuid;
    result json;
BEGIN
    v_user_id := public.requesting_user_id_uuid();

    SELECT json_build_object(
        'total_syllabi', count(*),
        'published_syllabi', count(*) FILTER (WHERE status = 'published'),
        'draft_syllabi', count(*) FILTER (WHERE status = 'draft'),
        'archived_syllabi', count(*) FILTER (WHERE status = 'archived'),
        'public_syllabi', count(*) FILTER (WHERE is_public = true),
        'departments', (SELECT json_agg(DISTINCT department) FROM public.syllabi WHERE department IS NOT NULL AND user_id = v_user_id AND is_deleted = false),
        'semesters', (SELECT json_agg(DISTINCT semester) FROM public.syllabi WHERE semester IS NOT NULL AND user_id = v_user_id AND is_deleted = false),
        'academic_years', (SELECT json_agg(DISTINCT academic_year) FROM public.syllabi WHERE academic_year IS NOT NULL AND user_id = v_user_id AND is_deleted = false),
        'popular_tags', (
            SELECT json_agg(tag)
            FROM (
                SELECT unnest(tags) as tag, count(*) as count
                FROM public.syllabi
                WHERE tags IS NOT NULL AND user_id = v_user_id AND is_deleted = false
                GROUP BY tag
                ORDER BY count DESC
                LIMIT 10
            ) as popular_tags
        )
    ) INTO result
    FROM public.syllabi
    WHERE is_deleted = false AND user_id = v_user_id;

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

-- 2. REPAIR search_syllabi
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
        AND (user_id = public.requesting_user_id_uuid() OR is_public = true)
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

-- 3. GRANTS
GRANT EXECUTE ON FUNCTION public.get_syllabus_statistics() TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_syllabi(text, text, text, int) TO authenticated;
