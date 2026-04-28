-- 00001_initial_schema.sql
-- Reconstruction of Margdarshak V3.0 Backend Schema

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. HELPER FUNCTIONS
-- Function to extract Clerk User ID from the Custom JWT
create or replace function public.requesting_user_id()
returns text
language sql stable
as $$
  select nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
$$;

-- Function to handle updated_at timestamps
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;



-- 3. CLEANUP (Ensures fresh reconstruction)
drop table if exists public.security_logs cascade;
drop table if exists public.announcements cascade;
drop table if exists public.enrollments cascade;
drop table if exists public.user_timetables cascade;
drop table if exists public.study_sessions cascade;
drop table if exists public.submissions cascade;
drop table if exists public.assignments cascade;
drop table if exists public.grades cascade;
drop table if exists public.exams cascade;
drop table if exists public.todos cascade;
drop table if exists public.tasks cascade;
drop table if exists public.note_folders cascade;
drop table if exists public.notes cascade;
drop table if exists public.attendance cascade;
drop table if exists public.courses cascade;
drop table if exists public.profiles cascade;
drop table if exists public.medications cascade;
drop table if exists public.symptoms cascade;
drop table if exists public.timetable cascade;
drop table if exists public.timetables cascade;
drop table if exists public.study_plans cascade;
drop table if exists public.smart_notes cascade;
drop table if exists public.syllabi cascade;
drop table if exists public.deadlines cascade;
drop table if exists public.blocked_users cascade;
drop table if exists public.contact_messages cascade;
drop table if exists public.security_settings cascade;
drop table if exists public.moderation_queue cascade;
drop table if exists public.daily_metrics cascade;
drop table if exists public.ai_neural_memory cascade;
drop table if exists public.timetable_events cascade;
drop table if exists public.admin_reports cascade;
drop table if exists public.admin_users cascade;
drop table if exists public.blocked_ips cascade;
drop table if exists public.ip_logs cascade;
drop table if exists public.security_threats cascade;
drop table if exists public.support_tickets cascade;
drop table if exists public.user_activity_logs cascade;

-- 4. CORE TABLES

-- PROFILES: Primary user table linked to Clerk
create table if not exists public.profiles (
  id text primary key,
  email text unique,
  full_name text,
  avatar_url text,
  user_type text not null default 'student',
  subscription_tier text default 'free',
  subscription_status text default 'inactive',
  subscription_period_end timestamptz,
  student_id text,
  department text,
  grade_level text,
  is_blocked boolean default false,
  blocked_reason text,
  failed_login_attempts int default 0,
  last_login_at timestamptz,
  last_login_ip text,
  risk_level text default 'low',
  security_score int default 100,
  study_streak int default 0,
  security_settings jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Function to get the current user's role
create or replace function public.get_current_user_role()
returns text
language sql stable
security definer
as $$
  select user_type from public.profiles where id = public.requesting_user_id();
$$;

-- COURSES
create table if not exists public.courses (
  id uuid primary key default uuid_generate_v4(),
  user_id text references public.profiles(id) on delete cascade,
  teacher_id text references public.profiles(id) on delete set null,
  name text not null,
  code text unique not null,
  description text,
  grade_level text,
  academic_year text,
  semester text,
  credits int default 3,
  color text,
  priority text default 'medium',
  status text default 'active',
  difficulty text default 'intermediate',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ATTENDANCE
create table if not exists public.attendance (
  id uuid primary key default uuid_generate_v4(),
  user_id text references public.profiles(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  date date not null default current_date,
  status text not null, -- 'present', 'absent', 'late', 'excused'
  notes text,
  marked_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- NOTES
create table if not exists public.notes (
  id uuid primary key default uuid_generate_v4(),
  user_id text references public.profiles(id) on delete cascade,
  course_id uuid references public.courses(id) on delete set null,
  title text not null,
  content text,
  folder text,
  tags text[],
  is_highlighted boolean default false,
  is_favorite boolean default false,
  is_deleted boolean default false,
  deleted_at timestamptz,
  color text,
  is_public boolean default false,
  last_accessed timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- NOTE FOLDERS
create table if not exists public.note_folders (
  id text primary key,
  user_id text references public.profiles(id) on delete cascade,
  name text not null,
  color text,
  icon text,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- TASKS & TODOS
create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id text references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'pending',
  priority text default 'medium',
  category text default 'general',
  tags text[] default '{}',
  progress_percentage int default 0,
  estimated_time int,
  time_spent int default 0,
  timer_active boolean default false,
  timer_start timestamptz,
  parent_task_id uuid references public.tasks(id) on delete cascade,
  course_id uuid references public.courses(id) on delete set null,
  depends_on uuid[] default '{}',
  is_favorited boolean default false,
  is_deleted boolean default false,
  deleted_at timestamptz,
  due_date timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.todos (
  id uuid primary key default uuid_generate_v4(),
  user_id text references public.profiles(id) on delete cascade,
  course_id uuid references public.courses(id) on delete set null,
  title text not null,
  description text,
  status text default 'pending',
  priority text default 'medium',
  due_date timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- AI NEURAL MEMORY
create table if not exists public.ai_neural_memory (
  id uuid primary key default uuid_generate_v4(),
  user_id text references public.profiles(id) on delete cascade,
  role text not null, -- 'user', 'assistant', 'system'
  content text not null,
  created_at timestamptz default now()
);

-- EXAMS & GRADES
create table if not exists public.exams (
  id uuid primary key default uuid_generate_v4(),
  user_id text references public.profiles(id) on delete cascade,
  subject text not null,
  date date not null,
  time time not null,
  duration int, -- in minutes
  location text,
  priority text default 'medium',
  status text default 'scheduled',
  syllabus text[],
  study_plan jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.grades (
  id uuid primary key default uuid_generate_v4(),
  user_id text references public.profiles(id) on delete cascade,
  subject text not null,
  assignment_name text not null,
  grade decimal not null,
  total_points decimal default 100,
  grade_type text, -- 'exam', 'assignment', 'quiz'
  semester text,
  academic_year text,
  weight decimal default 1.0,
  notes text,
  is_extra_credit boolean default false,
  date_recorded date default current_date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ASSIGNMENTS & SUBMISSIONS
create table if not exists public.assignments (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references public.courses(id) on delete cascade,
  created_by text references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  due_date timestamptz,
  max_points int,
  assignment_type text,
  created_at timestamptz default now()
);

create table if not exists public.submissions (
  id uuid primary key default uuid_generate_v4(),
  assignment_id uuid references public.assignments(id) on delete cascade,
  student_id text references public.profiles(id) on delete cascade,
  content text,
  file_url text,
  status text default 'submitted',
  grade decimal,
  feedback text,
  submitted_at timestamptz default now()
);

-- STUDY SESSIONS & TIMETABLES
create table if not exists public.study_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id text references public.profiles(id) on delete cascade,
  subject text,
  session_type text,
  start_time timestamptz not null,
  end_time timestamptz,
  duration int, -- in minutes
  created_at timestamptz default now()
);

create table if not exists public.user_timetables (
  id uuid primary key default uuid_generate_v4(),
  user_id text references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  day int not null, -- 0-6
  start_time time not null,
  end_time time not null,
  color text,
  location text,
  instructor text,
  room_number text,
  building text,
  category text default 'class',
  priority text default 'medium',
  status text default 'active',
  recurrence_type text default 'none',
  week_type text default 'all',
  semester text,
  academic_year text default '2024-25',
  credits int,
  attendance_required boolean default true,
  online_meeting_link text,
  meeting_password text,
  notes text,
  reminder_minutes int default 15,
  reminder_enabled boolean default true,
  is_public boolean default false,
  is_exam boolean default false,
  exam_type text,
  preparation_time int default 0,
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ENROLLMENTS & ANNOUNCEMENTS
create table if not exists public.enrollments (
  id uuid primary key default uuid_generate_v4(),
  student_id text references public.profiles(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  enrollment_date timestamptz default now(),
  status text default 'active',
  unique(student_id, course_id)
);

create table if not exists public.announcements (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references public.courses(id) on delete cascade,
  author_id text references public.profiles(id) on delete cascade,
  title text not null,
  content text not null,
  target_audience text,
  is_urgent boolean default false,
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- HEALTH & REPORTS
create table if not exists public.medications (
  id uuid primary key default uuid_generate_v4(),
  user_id text references public.profiles(id) on delete cascade,
  name text not null,
  dosage text not null,
  frequency text not null,
  start_date date not null,
  end_date date,
  next_dose timestamptz not null,
  status text not null,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.symptoms (
  id uuid primary key default uuid_generate_v4(),
  user_id text references public.profiles(id) on delete cascade,
  name text not null,
  severity int not null, -- 1-10
  date date not null,
  created_at timestamptz default now()
);

create table if not exists public.reports (
  id uuid primary key default uuid_generate_v4(),
  user_id text references public.profiles(id) on delete cascade,
  category text not null,
  file_name text not null,
  file_url text not null,
  file_type text not null,
  file_size text not null,
  notes text,
  created_at timestamptz default now()
);

-- LEGACY TIMETABLES
create table if not exists public.timetable (
  id uuid primary key default uuid_generate_v4(),
  user_id text references public.profiles(id) on delete cascade,
  subject text not null,
  day text not null,
  start_time time not null,
  end_time time not null,
  created_at timestamptz default now()
);

create table if not exists public.timetables (
  id uuid primary key default uuid_generate_v4(),
  user_id text references public.profiles(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  day_of_week int,
  start_time time not null,
  end_time time not null,
  room_number text,
  created_at timestamptz default now()
);

-- STUDY PLANS
create table if not exists public.study_plans (
  id uuid primary key default uuid_generate_v4(),
  user_id text references public.profiles(id) on delete cascade,
  plan jsonb not null,
  config jsonb,
  completed_sessions text[], -- array of session keys
  created_at timestamptz default now()
);

-- SMART NOTES
create table if not exists public.smart_notes (
  id uuid primary key default uuid_generate_v4(),
  user_id text references public.profiles(id) on delete cascade,
  title text not null,
  content text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- SYLLABI
create table if not exists public.syllabi (
  id uuid primary key default uuid_generate_v4(),
  user_id text references public.profiles(id) on delete cascade,
  course_name text not null,
  topics text[],
  objectives text[],
  is_deleted boolean default false,
  created_at timestamptz default now()
);

-- DEADLINES
create table if not exists public.deadlines (
  id uuid primary key default uuid_generate_v4(),
  user_id text references public.profiles(id) on delete cascade,
  name text not null,
  category text,
  date date not null,
  registration_deadline date,
  notes text,
  is_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- BLOCKED USERS
create table if not exists public.blocked_users (
  id uuid primary key default uuid_generate_v4(),
  user_id text references public.profiles(id) on delete cascade,
  blocked_by text references public.profiles(id) on delete set null,
  reason text,
  created_at timestamptz default now()
);

-- CONTACT MESSAGES
create table if not exists public.contact_messages (
  id uuid primary key default uuid_generate_v4(),
  first_name text,
  last_name text,
  email text not null,
  message text not null,
  status text default 'new',
  created_at timestamptz default now()
);

-- SECURITY SETTINGS
create table if not exists public.security_settings (
  id text primary key, -- 'global'
  rate_limit int default 100,
  ai_sensitivity int default 50,
  updated_at timestamptz default now()
);

-- MODERATION QUEUE
create table if not exists public.moderation_queue (
  id uuid primary key default uuid_generate_v4(),
  content_id uuid,
  content_type text,
  title text,
  summary text,
  level text, -- 'low', 'medium', 'high', 'critical'
  status text default 'pending',
  created_at timestamptz default now()
);

-- DAILY METRICS
create table if not exists public.daily_metrics (
  id uuid primary key default uuid_generate_v4(),
  date date unique default current_date,
  threats_count int default 0,
  logins_count int default 0,
  updated_at timestamptz default now()
);

-- ADMIN REPORTS
create table if not exists public.admin_reports (
  id uuid primary key default uuid_generate_v4(),
  user_id text references public.profiles(id) on delete cascade,
  category text not null,
  severity text default 'low',
  status text default 'pending',
  details jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ADMIN USERS
create table if not exists public.admin_users (
  id uuid primary key default uuid_generate_v4(),
  user_id text references public.profiles(id) on delete cascade,
  role text default 'moderator',
  created_at timestamptz default now()
);

-- BLOCKED IPS
create table if not exists public.blocked_ips (
  id uuid primary key default uuid_generate_v4(),
  ip_address text not null unique,
  reason text,
  blocked_by text references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- IP LOGS
create table if not exists public.ip_logs (
  id uuid primary key default uuid_generate_v4(),
  ip_address text,
  event_type text,
  country text,
  city text,
  is_proxy boolean default false,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- SECURITY THREATS
create table if not exists public.security_threats (
  id uuid primary key default uuid_generate_v4(),
  user_id text references public.profiles(id) on delete cascade,
  ip_address text,
  event_type text not null,
  threat_level text default 'low',
  threat_score int default 0,
  summary text,
  flags text[],
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- SUPPORT TICKETS
create table if not exists public.support_tickets (
  id uuid primary key default uuid_generate_v4(),
  user_id text references public.profiles(id) on delete cascade,
  subject text,
  message text,
  status text default 'open',
  priority text default 'medium',
  created_at timestamptz default now()
);

-- USER ACTIVITY LOGS
create table if not exists public.user_activity_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id text references public.profiles(id) on delete cascade,
  activity_type text not null,
  ip_address text,
  device_id text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- SECURITY LOGS
create table if not exists public.security_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id text references public.profiles(id) on delete cascade,
  event_type text,
  device_id text,
  risk_level text,
  risk_score int,
  summary text,
  ai_summary text,
  flags text[],
  metadata jsonb,
  created_at timestamptz default now()
);

-- TIMETABLE EVENTS
create table if not exists public.timetable_events (
  id uuid primary key default uuid_generate_v4(),
  user_id text references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  day int not null, -- 0-6
  start_time time not null,
  end_time time not null,
  color text,
  location text,
  instructor text,
  course_code text,
  course_id uuid references public.courses(id) on delete set null,
  room_number text,
  building text,
  category text default 'class',
  priority text default 'medium',
  status text default 'active',
  recurrence_type text default 'none',
  recurrence_end date,
  week_type text default 'all',
  semester text,
  academic_year text default '2024-25',
  credits float,
  attendance_required boolean default true,
  online_meeting_link text,
  meeting_password text,
  notes text,
  reminder_minutes int default 15,
  reminder_enabled boolean default true,
  is_public boolean default false,
  is_exam boolean default false,
  exam_type text,
  preparation_time int default 0,
  tags text[] default '{}',
  attachments text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. TRIGGERS
drop trigger if exists on_profiles_updated on public.profiles;
create trigger on_profiles_updated before update on public.profiles for each row execute procedure public.handle_updated_at();

drop trigger if exists on_courses_updated on public.courses;
create trigger on_courses_updated before update on public.courses for each row execute procedure public.handle_updated_at();

drop trigger if exists on_notes_updated on public.notes;
create trigger on_notes_updated before update on public.notes for each row execute procedure public.handle_updated_at();

drop trigger if exists on_tasks_updated on public.tasks;
create trigger on_tasks_updated before update on public.tasks for each row execute procedure public.handle_updated_at();

drop trigger if exists on_todos_updated on public.todos;
create trigger on_todos_updated before update on public.todos for each row execute procedure public.handle_updated_at();

drop trigger if exists on_exams_updated on public.exams;
create trigger on_exams_updated before update on public.exams for each row execute procedure public.handle_updated_at();

drop trigger if exists on_grades_updated on public.grades;
create trigger on_grades_updated before update on public.grades for each row execute procedure public.handle_updated_at();

drop trigger if exists on_user_timetables_updated on public.user_timetables;
create trigger on_user_timetables_updated before update on public.user_timetables for each row execute procedure public.handle_updated_at();

drop trigger if exists on_admin_reports_updated on public.admin_reports;
create trigger on_admin_reports_updated before update on public.admin_reports for each row execute procedure public.handle_updated_at();

drop trigger if exists on_support_tickets_updated on public.support_tickets;
create trigger on_support_tickets_updated before update on public.support_tickets for each row execute procedure public.handle_updated_at();

drop trigger if exists on_security_settings_updated on public.security_settings;
create trigger on_security_settings_updated before update on public.security_settings for each row execute procedure public.handle_updated_at();

-- 5. ROW LEVEL SECURITY (RLS)
-- Note: RLS disabled for Clerk integration. Authorization handled at application level.
alter table public.profiles disable row level security;
alter table public.courses enable row level security;
alter table public.attendance enable row level security;
alter table public.notes enable row level security;
alter table public.tasks enable row level security;
alter table public.todos enable row level security;
alter table public.exams enable row level security;
alter table public.grades enable row level security;
alter table public.assignments enable row level security;
alter table public.submissions enable row level security;
alter table public.study_sessions enable row level security;
alter table public.user_timetables enable row level security;
alter table public.enrollments enable row level security;
alter table public.announcements enable row level security;
alter table public.security_logs enable row level security;
alter table public.medications enable row level security;
alter table if exists public.ai_neural_memory enable row level security;
alter table public.symptoms enable row level security;
alter table public.reports enable row level security;
alter table public.timetable enable row level security;
alter table if exists public.attendance enable row level security;
alter table if exists public.courses enable row level security;
alter table if exists public.study_plans enable row level security;
alter table if exists public.tasks enable row level security;
alter table if exists public.todos enable row level security;
alter table if exists public.note_folders enable row level security;
alter table if exists public.syllabi enable row level security;
alter table if exists public.deadlines enable row level security;
alter table if exists public.blocked_users enable row level security;
alter table if exists public.contact_messages enable row level security;
alter table if exists public.security_settings enable row level security;
alter table if exists public.moderation_queue enable row level security;
alter table if exists public.daily_metrics enable row level security;
alter table if exists public.timetable_events enable row level security;
alter table if exists public.admin_reports enable row level security;
alter table if exists public.admin_users enable row level security;
alter table if exists public.blocked_ips enable row level security;
alter table if exists public.ip_logs enable row level security;
alter table if exists public.security_threats enable row level security;
alter table if exists public.support_tickets enable row level security;
alter table if exists public.user_activity_logs enable row level security;

-- PROFILES POLICIES (Disabled - handled at application level)
-- drop policy if exists "Users can view their own profile" on public.profiles;
-- drop policy if exists "Users can update their own profile" on public.profiles;
-- drop policy if exists "Users can insert their own profile" on public.profiles;
-- drop policy if exists "Allow profile creation with valid id" on public.profiles;

-- NOTES POLICIES
drop policy if exists "Users can manage their own notes" on public.notes;
create policy "Users can manage their own notes" on public.notes for all using ( user_id = requesting_user_id() );

-- NOTE FOLDERS POLICIES
drop policy if exists "Users can manage their own folders" on public.note_folders;
create policy "Users can manage their own folders" on public.note_folders for all using ( user_id = requesting_user_id() );

-- TASKS & TODOS POLICIES
drop policy if exists "Users can manage their own tasks" on public.tasks;
create policy "Users can manage their own tasks" on public.tasks for all using ( user_id = requesting_user_id() );

drop policy if exists "Users can manage their own todos" on public.todos;
create policy "Users can manage their own todos" on public.todos for all using ( user_id = requesting_user_id() );

-- EXAMS & GRADES POLICIES
drop policy if exists "Users can manage their own exams" on public.exams;
create policy "Users can manage their own exams" on public.exams for all using ( user_id = requesting_user_id() );

drop policy if exists "Users can view their own grades" on public.grades;
create policy "Users can view their own grades" on public.grades for select using ( user_id = requesting_user_id() );

-- STUDY SESSIONS & TIMETABLES POLICIES
drop policy if exists "Users can manage their own study sessions" on public.study_sessions;
create policy "Users can manage their own study sessions" on public.study_sessions for all using ( user_id = requesting_user_id() );

drop policy if exists "Users can manage their own timetables" on public.user_timetables;
create policy "Users can manage their own timetables" on public.user_timetables for all using ( user_id = requesting_user_id() );

-- SUBMISSIONS POLICIES
drop policy if exists "Students can manage their own submissions" on public.submissions;
create policy "Students can manage their own submissions" on public.submissions for all using ( student_id = requesting_user_id() );

-- COURSES & ENROLLMENTS
drop policy if exists "Users can manage their own courses" on public.courses;
create policy "Users can manage their own courses" on public.courses for all using ( user_id = requesting_user_id() );

drop policy if exists "Students can view enrolled courses" on public.courses;
create policy "Students can view enrolled courses" on public.courses for select using ( exists ( select 1 from public.enrollments where course_id = public.courses.id and student_id = requesting_user_id() ) );

drop policy if exists "Users can view their own enrollments" on public.enrollments;
create policy "Users can view their own enrollments" on public.enrollments for select using ( student_id = requesting_user_id() );

-- HEALTH & REPORTS POLICIES
drop policy if exists "Users can manage their own medications" on public.medications;
create policy "Users can manage their own medications" on public.medications for all using ( user_id = requesting_user_id() );

drop policy if exists "Users can manage their own symptoms" on public.symptoms;
create policy "Users can manage their own symptoms" on public.symptoms for all using ( user_id = requesting_user_id() );

drop policy if exists "Users can manage their own reports" on public.reports;
create policy "Users can manage their own reports" on public.reports for all using ( user_id = requesting_user_id() );

-- TIMETABLE POLICIES
drop policy if exists "Users can manage their own legacy timetable" on public.timetable;
create policy "Users can manage their own legacy timetable" on public.timetable for all using ( user_id = requesting_user_id() );

drop policy if exists "Users can manage their own extended timetables" on public.timetables;
create policy "Users can manage their own extended timetables" on public.timetables for all using ( user_id = requesting_user_id() );

-- ATTENDANCE POLICIES
drop policy if exists "Users can manage their own attendance" on public.attendance;
create policy "Users can manage their own attendance" on public.attendance for all using ( user_id = requesting_user_id() );


drop policy if exists "Teachers can manage attendance for their courses" on public.attendance;
create policy "Teachers can manage attendance for their courses" on public.attendance for all using ( exists ( select 1 from public.courses where id = public.attendance.course_id and user_id = requesting_user_id() ) );

-- SECURITY LOGS
drop policy if exists "Users can view their own security logs" on public.security_logs;
create policy "Users can view their own security logs" on public.security_logs for select using ( user_id = requesting_user_id() );

-- STUDY PLANS POLICIES
drop policy if exists "Users can manage their own study plans" on public.study_plans;
create policy "Users can manage their own study plans" on public.study_plans for all using ( user_id = requesting_user_id() );

-- SMART NOTES POLICIES
drop policy if exists "Users can manage their own smart notes" on public.smart_notes;
create policy "Users can manage their own smart notes" on public.smart_notes for all using ( user_id = requesting_user_id() );

-- SYLLABI POLICIES
drop policy if exists "Users can manage their own syllabi" on public.syllabi;
create policy "Users can manage their own syllabi" on public.syllabi for all using ( user_id = requesting_user_id() );

-- DEADLINES POLICIES
drop policy if exists "Users can manage their own deadlines" on public.deadlines;
create policy "Users can manage their own deadlines" on public.deadlines for all using ( user_id = requesting_user_id() );

-- BLOCKED USERS POLICIES
drop policy if exists "Admins can manage blocked users" on public.blocked_users;
create policy "Admins can manage blocked users" on public.blocked_users for all using ( exists ( select 1 from public.profiles where id = requesting_user_id() and user_type = 'admin' ) );

-- CONTACT MESSAGES POLICIES
drop policy if exists "Anyone can submit contact messages" on public.contact_messages;
create policy "Anyone can submit contact messages" on public.contact_messages for insert with check ( true );

drop policy if exists "Admins can manage contact messages" on public.contact_messages;
create policy "Admins can manage contact messages" on public.contact_messages for all using ( exists ( select 1 from public.profiles where id = requesting_user_id() and user_type = 'admin' ) );

-- GLOBAL ADMIN POLICIES
drop policy if exists "Admins can manage security settings" on public.security_settings;
create policy "Admins can manage security settings" on public.security_settings for all using ( exists ( select 1 from public.profiles where id = requesting_user_id() and user_type = 'admin' ) );

drop policy if exists "Admins can manage moderation queue" on public.moderation_queue;
create policy "Admins can manage moderation queue" on public.moderation_queue for all using ( exists ( select 1 from public.profiles where id = requesting_user_id() and user_type = 'admin' ) );

-- DAILY METRICS POLICIES
drop policy if exists "Admins can manage daily metrics" on public.daily_metrics;
create policy "Admins can manage daily metrics" on public.daily_metrics for all using ( exists ( select 1 from public.profiles where id = requesting_user_id() and user_type = 'admin' ) );

-- TIMETABLE EVENTS POLICIES
drop policy if exists "Users can manage their own timetable" on public.timetable_events;
create policy "Users can manage their own timetable" on public.timetable_events for all using ( user_id = requesting_user_id() );

drop policy if exists "Users can see if they are blocked" on public.blocked_users;
create policy "Users can see if they are blocked" on public.blocked_users for select using ( user_id = requesting_user_id() );

-- AI NEURAL MEMORY POLICIES
drop policy if exists "Users can manage their own neural memory" on public.ai_neural_memory;
create policy "Users can manage their own neural memory" on public.ai_neural_memory for all using ( user_id = requesting_user_id() );
-- ADMIN REPORTS POLICIES
drop policy if exists "Users can view their own reports" on public.admin_reports;
create policy "Users can view their own reports" on public.admin_reports for select using ( user_id = requesting_user_id() );

drop policy if exists "Admins can manage all reports" on public.admin_reports;
create policy "Admins can manage all reports" on public.admin_reports for all using ( exists ( select 1 from public.profiles where id = requesting_user_id() and user_type = 'admin' ) );

-- SUPPORT TICKETS POLICIES
drop policy if exists "Users can manage their own support tickets" on public.support_tickets;
create policy "Users can manage their own support tickets" on public.support_tickets for all using ( user_id = requesting_user_id() );

drop policy if exists "Admins can manage all support tickets" on public.support_tickets;
create policy "Admins can manage all support tickets" on public.support_tickets for all using ( exists ( select 1 from public.profiles where id = requesting_user_id() and user_type = 'admin' ) );

-- ACTIVITY LOGS POLICIES
drop policy if exists "Users can view their own activity logs" on public.user_activity_logs;
create policy "Users can view their own activity logs" on public.user_activity_logs for select using ( user_id = requesting_user_id() );

-- SECURITY THREATS POLICIES
drop policy if exists "Admins can manage security threats" on public.security_threats;
create policy "Admins can manage security threats" on public.security_threats for all using ( exists ( select 1 from public.profiles where id = requesting_user_id() and user_type = 'admin' ) );

-- IP LOGS POLICIES
drop policy if exists "Admins can view all IP logs" on public.ip_logs;
create policy "Admins can view all IP logs" on public.ip_logs for select using ( exists ( select 1 from public.profiles where id = requesting_user_id() and user_type = 'admin' ) );

-- ADMIN USERS POLICIES
drop policy if exists "Admins can manage admin users" on public.admin_users;
create policy "Admins can manage admin users" on public.admin_users for all using ( exists ( select 1 from public.profiles where id = requesting_user_id() and user_type = 'admin' ) );
