-- 00002_add_rls_policies.sql

-- 1. Ensure basic permissions for the standard Supabase roles
-- This ensures the roles can access the schema and tables before RLS is even checked
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- 2. Enable Row Level Security for profiles (previously disabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Profiles Policies (Clerk Compatible)
-- DROP existing to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- SELECT: Allow users to see their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING ( id = requesting_user_id() );

-- SELECT: Allow public viewing of names/avatars for leaderboard (Standard for this app)
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING ( true );

-- INSERT: Crucial for the profile-sync Netlify function to create new user records
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK ( id = requesting_user_id() );

-- UPDATE: Allow users to update their own data
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING ( id = requesting_user_id() );

-- 4. Tasks Policies (Clerk Compatible)
-- Enable RLS (already enabled but ensuring)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing catch-all policy from initial schema to replace with granular ones
DROP POLICY IF EXISTS "Users can manage their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Public can view completed task counts" ON public.tasks;

-- SELECT: View own tasks
CREATE POLICY "Users can view their own tasks" 
ON public.tasks FOR SELECT 
USING ( user_id = requesting_user_id() );

-- SELECT: Allow public viewing of completed task counts for leaderboard
CREATE POLICY "Public can view completed task counts" 
ON public.tasks FOR SELECT 
USING ( status = 'completed' );

-- INSERT: Create own tasks
CREATE POLICY "Users can insert their own tasks" 
ON public.tasks FOR INSERT 
WITH CHECK ( user_id = requesting_user_id() );

-- UPDATE: Update own tasks
CREATE POLICY "Users can update their own tasks" 
ON public.tasks FOR UPDATE 
USING ( user_id = requesting_user_id() );

-- DELETE: Delete own tasks
CREATE POLICY "Users can delete their own tasks" 
ON public.tasks FOR DELETE 
USING ( user_id = requesting_user_id() );

-- 5. Notes & Folders Policies
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_folders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can view their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can insert their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON public.notes;

CREATE POLICY "Users can view their own notes" ON public.notes FOR SELECT USING (user_id = requesting_user_id());
CREATE POLICY "Users can insert their own notes" ON public.notes FOR INSERT WITH CHECK (user_id = requesting_user_id());
CREATE POLICY "Users can update their own notes" ON public.notes FOR UPDATE USING (user_id = requesting_user_id());
CREATE POLICY "Users can delete their own notes" ON public.notes FOR DELETE USING (user_id = requesting_user_id());

DROP POLICY IF EXISTS "Users can manage their own folders" ON public.note_folders;
DROP POLICY IF EXISTS "Users can manage their own note_folders" ON public.note_folders;
CREATE POLICY "Users can manage their own folders" ON public.note_folders FOR ALL USING (user_id = requesting_user_id());

-- 6. Enrollments & Courses Policies
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own courses" ON public.courses;
CREATE POLICY "Users can manage their own courses" ON public.courses FOR ALL USING (user_id = requesting_user_id());

DROP POLICY IF EXISTS "Students can view enrolled courses" ON public.courses;
CREATE POLICY "Students can view enrolled courses" ON public.courses FOR SELECT USING (EXISTS (SELECT 1 FROM public.enrollments WHERE course_id = public.courses.id AND student_id = requesting_user_id()));

-- Allow students to view their own enrollments
DROP POLICY IF EXISTS "Users can view their own enrollments" ON public.enrollments;
CREATE POLICY "Users can view their own enrollments" 
ON public.enrollments FOR SELECT 
USING ( student_id = requesting_user_id() );

-- Allow students to enroll themselves (INSERT)
DROP POLICY IF EXISTS "Students can enroll themselves" ON public.enrollments;
CREATE POLICY "Students can enroll themselves" 
ON public.enrollments FOR INSERT 
WITH CHECK ( student_id = requesting_user_id() );

-- Allow teachers to manage enrollments for their courses
DROP POLICY IF EXISTS "Teachers can manage enrollments" ON public.enrollments;
CREATE POLICY "Teachers can manage enrollments" 
ON public.enrollments FOR ALL 
USING ( exists ( select 1 from public.courses where id = public.enrollments.course_id and user_id = requesting_user_id() ) );

-- 7. Exams & Grades Policies
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own exams" ON public.exams;
DROP POLICY IF EXISTS "Users can view their own exams" ON public.exams;
DROP POLICY IF EXISTS "Users can insert their own exams" ON public.exams;
DROP POLICY IF EXISTS "Users can update their own exams" ON public.exams;
DROP POLICY IF EXISTS "Users can delete their own exams" ON public.exams;

CREATE POLICY "Users can view their own exams" ON public.exams FOR SELECT USING (user_id = requesting_user_id());
CREATE POLICY "Users can insert their own exams" ON public.exams FOR INSERT WITH CHECK (user_id = requesting_user_id());
CREATE POLICY "Users can update their own exams" ON public.exams FOR UPDATE USING (user_id = requesting_user_id());
CREATE POLICY "Users can delete their own exams" ON public.exams FOR DELETE USING (user_id = requesting_user_id());

DROP POLICY IF EXISTS "Users can view their own grades" ON public.grades;
CREATE POLICY "Users can view their own grades" ON public.grades FOR SELECT USING (user_id = requesting_user_id());
DROP POLICY IF EXISTS "Users can insert their own grades" ON public.grades;
CREATE POLICY "Users can insert their own grades" ON public.grades FOR INSERT WITH CHECK (user_id = requesting_user_id());
DROP POLICY IF EXISTS "Users can update their own grades" ON public.grades;
CREATE POLICY "Users can update their own grades" ON public.grades FOR UPDATE USING (user_id = requesting_user_id());
DROP POLICY IF EXISTS "Users can delete their own grades" ON public.grades;
CREATE POLICY "Users can delete their own grades" ON public.grades FOR DELETE USING (user_id = requesting_user_id());

-- 8. Study Sessions & Timetables
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own study sessions" ON public.study_sessions;
CREATE POLICY "Users can manage their own study sessions" ON public.study_sessions FOR ALL USING (user_id = requesting_user_id());

DROP POLICY IF EXISTS "Users can manage their own timetables" ON public.user_timetables;
CREATE POLICY "Users can manage their own timetables" ON public.user_timetables FOR ALL USING (user_id = requesting_user_id());

DROP POLICY IF EXISTS "Users can manage their own timetable events" ON public.timetable_events;
DROP POLICY IF EXISTS "Users can manage their own timetable" ON public.timetable_events;
CREATE POLICY "Users can manage their own timetable events" ON public.timetable_events FOR ALL USING (user_id = requesting_user_id());

-- 9. Attendance, Todos & Learning Tools
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syllabi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own attendance" ON public.attendance;
CREATE POLICY "Users can manage their own attendance" ON public.attendance FOR ALL USING (user_id = requesting_user_id());

DROP POLICY IF EXISTS "Users can manage their own todos" ON public.todos;
CREATE POLICY "Users can manage their own todos" ON public.todos FOR ALL USING (user_id = requesting_user_id());

DROP POLICY IF EXISTS "Users can manage their own smart notes" ON public.smart_notes;
CREATE POLICY "Users can manage their own smart notes" ON public.smart_notes FOR ALL USING (user_id = requesting_user_id());

DROP POLICY IF EXISTS "Users can manage their own syllabi" ON public.syllabi;
CREATE POLICY "Users can manage their own syllabi" ON public.syllabi FOR ALL USING (user_id = requesting_user_id());

DROP POLICY IF EXISTS "Users can manage their own deadlines" ON public.deadlines;
CREATE POLICY "Users can manage their own deadlines" ON public.deadlines FOR ALL USING (user_id = requesting_user_id());

DROP POLICY IF EXISTS "Users can manage their own study plans" ON public.study_plans;
CREATE POLICY "Users can manage their own study plans" ON public.study_plans FOR ALL USING (user_id = requesting_user_id());

-- 10. Health & Support Logs
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own medications" ON public.medications;
CREATE POLICY "Users can manage their own medications" ON public.medications FOR ALL USING (user_id = requesting_user_id());

DROP POLICY IF EXISTS "Users can manage their own symptoms" ON public.symptoms;
CREATE POLICY "Users can manage their own symptoms" ON public.symptoms FOR ALL USING (user_id = requesting_user_id());

DROP POLICY IF EXISTS "Users can manage their own reports" ON public.reports;
CREATE POLICY "Users can manage their own reports" ON public.reports FOR ALL USING (user_id = requesting_user_id());
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can view their own support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can insert their own support tickets" ON public.support_tickets;
CREATE POLICY "Users can view their own support tickets" ON public.support_tickets FOR SELECT USING (user_id = requesting_user_id());
CREATE POLICY "Users can insert their own support tickets" ON public.support_tickets FOR INSERT WITH CHECK (user_id = requesting_user_id());

DROP POLICY IF EXISTS "Users can view their own activity logs" ON public.user_activity_logs;
DROP POLICY IF EXISTS "Users can insert their own activity logs" ON public.user_activity_logs;
CREATE POLICY "Users can view their own activity logs" ON public.user_activity_logs FOR SELECT USING (user_id = requesting_user_id());
CREATE POLICY "Users can insert their own activity logs" ON public.user_activity_logs FOR INSERT WITH CHECK (user_id = requesting_user_id());

DROP POLICY IF EXISTS "Users can view their own security logs" ON public.security_logs;
CREATE POLICY "Users can view their own security logs" ON public.security_logs FOR SELECT USING (user_id = requesting_user_id());

DROP POLICY IF EXISTS "Users can view their own reports" ON public.admin_reports;
CREATE POLICY "Users can view their own reports" ON public.admin_reports FOR SELECT USING (user_id = requesting_user_id());
