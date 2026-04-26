-- Create resources table
CREATE TABLE IF NOT EXISTS public.resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    notes TEXT,
    category TEXT NOT NULL,
    subcategory TEXT,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT,
    file_size BIGINT,
    language TEXT DEFAULT 'en',
    grade_level TEXT,
    subject TEXT,
    difficulty_level TEXT DEFAULT 'intermediate',
    tags TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    thumbnail_url TEXT,
    download_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own resources"
    ON public.resources
    FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Public resources are viewable by everyone"
    ON public.resources
    FOR SELECT
    USING (is_public = true AND is_deleted = false);

-- Create storage bucket for resources if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('school-files', 'school-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for school-files
CREATE POLICY "Public Access" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'school-files');

CREATE POLICY "Authenticated users can upload files" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'school-files' AND auth.role() = 'authenticated');

CREATE POLICY "Users can manage their own files" 
    ON storage.objects FOR ALL 
    USING (bucket_id = 'school-files' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Functions and RPCs
CREATE OR REPLACE FUNCTION get_resource_statistics()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_resources', COUNT(*),
        'total_downloads', COALESCE(SUM(download_count), 0),
        'total_likes', COALESCE(SUM(like_count), 0),
        'total_storage_used', COALESCE(SUM(file_size), 0),
        'categories', COALESCE((SELECT jsonb_agg(DISTINCT category) FROM resources WHERE is_deleted = false), '[]'::jsonb)
    ) INTO result
    FROM resources
    WHERE is_deleted = false;
    
    RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION search_resources(p_query TEXT, p_category TEXT DEFAULT NULL, p_language TEXT DEFAULT NULL, p_limit INTEGER DEFAULT 50)
RETURNS SETOF public.resources
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT *
    FROM public.resources
    WHERE 
        is_deleted = false AND
        (p_query IS NULL OR 
         title ILIKE '%' || p_query || '%' OR 
         description ILIKE '%' || p_query || '%' OR 
         file_name ILIKE '%' || p_query || '%') AND
        (p_category IS NULL OR category = p_category) AND
        (p_language IS NULL OR language = p_language)
    ORDER BY created_at DESC
    LIMIT p_limit;
$$;

CREATE OR REPLACE FUNCTION track_resource_download(p_resource_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.resources 
    SET download_count = download_count + 1
    WHERE id = p_resource_id;
END;
$$;

CREATE OR REPLACE FUNCTION toggle_resource_like(p_resource_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_likes INTEGER;
BEGIN
    UPDATE public.resources 
    SET like_count = like_count + 1
    WHERE id = p_resource_id
    RETURNING like_count INTO v_likes;
    
    RETURN v_likes;
END;
$$;
