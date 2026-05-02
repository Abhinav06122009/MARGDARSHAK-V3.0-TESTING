-- 00021_calendar_synchronization.sql
-- Dedicated table for user-defined calendar events

-- 1. Ensure Profiles ID is UUID (The root cause of type mismatch)
DO $$
BEGIN
    -- Only attempt conversion if profiles.id is still text
    IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'id') = 'text' THEN
        RAISE NOTICE 'Converting profiles.id to UUID...';
        
        -- We must drop dependent foreign keys temporarily or use a cascade approach
        -- However, for a safer approach in a migration, we just ensure it's castable.
        -- If this fails, it's likely due to existing text-based FKs in other tables.
        
        -- To be truly safe and non-destructive, we'll use a type-agnostic FK if possible, 
        -- but Postgres doesn't support that. 
        -- So we force the cast if the table is already in a semi-migrated state.
        ALTER TABLE public.profiles ALTER COLUMN id TYPE uuid USING id::uuid;
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping profiles.id conversion: %', SQLERRM;
END $$;

-- 2. Create the calendar_events table
create table if not exists public.calendar_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid, -- We add the constraint later to avoid creation-time failures
  title text not null,
  description text,
  event_date timestamptz not null,
  end_date timestamptz,
  category text default 'personal',
  priority text default 'medium',
  color text,
  is_all_day boolean default false,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Transition user_id to UUID if it's text (for existing tables)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'calendar_events' AND column_name = 'user_id' AND data_type = 'text'
    ) THEN
        ALTER TABLE public.calendar_events ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
    END IF;
END $$;

-- 4. Re-establish the Foreign Key with explicit type matching
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'calendar_events_user_id_fkey'
    ) THEN
        ALTER TABLE public.calendar_events 
        ADD CONSTRAINT calendar_events_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Enable RLS
alter table public.calendar_events enable row level security;

-- RLS Policies (Type-safe comparison)
drop policy if exists "Users can manage their own calendar events" on public.calendar_events;
create policy "Users can manage their own calendar events" on public.calendar_events 
  for all using ( user_id::text = requesting_user_id()::text );

-- Trigger for updated_at
drop trigger if exists on_calendar_events_updated on public.calendar_events;
create trigger on_calendar_events_updated before update on public.calendar_events 
  for each row execute procedure public.handle_updated_at();

-- Index for performance
create index if not exists calendar_events_user_id_idx on public.calendar_events(user_id);
create index if not exists calendar_events_date_idx on public.calendar_events(event_date);
