-- 00021_calendar_synchronization.sql
-- Dedicated table for user-defined calendar events

create table if not exists public.calendar_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  event_date timestamptz not null,
  end_date timestamptz,
  category text default 'personal', -- 'personal', 'academic', 'exam', 'holiday'
  priority text default 'medium', -- 'low', 'medium', 'high'
  color text,
  is_all_day boolean default false,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Ensure user_id is uuid even if it was created as text previously
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'calendar_events' 
        AND column_name = 'user_id' 
        AND data_type = 'text'
    ) THEN
        ALTER TABLE public.calendar_events ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
    END IF;
END $$;

-- Enable RLS
alter table public.calendar_events enable row level security;

-- RLS Policies
drop policy if exists "Users can manage their own calendar events" on public.calendar_events;
create policy "Users can manage their own calendar events" on public.calendar_events 
  for all using ( user_id = requesting_user_id() );

-- Trigger for updated_at
drop trigger if exists on_calendar_events_updated on public.calendar_events;
create trigger on_calendar_events_updated before update on public.calendar_events 
  for each row execute procedure public.handle_updated_at();

-- Index for performance
create index if not exists calendar_events_user_id_idx on public.calendar_events(user_id);
create index if not exists calendar_events_date_idx on public.calendar_events(event_date);
