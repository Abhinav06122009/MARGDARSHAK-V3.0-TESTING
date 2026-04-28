-- 00003_expand_syllabi_schema.sql
-- Expanding the syllabi table to include all fields required by the frontend

ALTER TABLE public.syllabi 
ADD COLUMN IF NOT EXISTS course_code text,
ADD COLUMN IF NOT EXISTS semester text,
ADD COLUMN IF NOT EXISTS academic_year text,
ADD COLUMN IF NOT EXISTS instructor_name text,
ADD COLUMN IF NOT EXISTS instructor_email text,
ADD COLUMN IF NOT EXISTS department text,
ADD COLUMN IF NOT EXISTS credits decimal default 3.0,
ADD COLUMN IF NOT EXISTS course_type text default 'Theory',
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS prerequisites text,
ADD COLUMN IF NOT EXISTS assignments jsonb default '[]'::jsonb,
ADD COLUMN IF NOT EXISTS grading_criteria jsonb default '[]'::jsonb,
ADD COLUMN IF NOT EXISTS textbooks jsonb default '[]'::jsonb,
ADD COLUMN IF NOT EXISTS supplementary_materials jsonb default '[]'::jsonb,
ADD COLUMN IF NOT EXISTS office_hours text,
ADD COLUMN IF NOT EXISTS course_policies text,
ADD COLUMN IF NOT EXISTS attendance_policy text,
ADD COLUMN IF NOT EXISTS status text default 'draft',
ADD COLUMN IF NOT EXISTS is_public boolean default false,
ADD COLUMN IF NOT EXISTS tags text[] default '{}',
ADD COLUMN IF NOT EXISTS language text default 'English',
ADD COLUMN IF NOT EXISTS difficulty_level text default 'Intermediate',
ADD COLUMN IF NOT EXISTS estimated_workload_hours int,
ADD COLUMN IF NOT EXISTS is_deleted boolean default false,
ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
ADD COLUMN IF NOT EXISTS updated_at timestamptz default now();

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS on_syllabi_updated ON public.syllabi;
CREATE TRIGGER on_syllabi_updated BEFORE UPDATE ON public.syllabi FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Ensure RLS is active and has full manage policy (using the helper from 00001)
ALTER TABLE public.syllabi ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own syllabi" ON public.syllabi;
CREATE POLICY "Users can manage their own syllabi" ON public.syllabi FOR ALL USING (user_id = requesting_user_id());
