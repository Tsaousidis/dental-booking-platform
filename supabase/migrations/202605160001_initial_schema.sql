create extension if not exists pgcrypto;

create type public.appointment_status as enum (
  'confirmed',
  'completed',
  'cancelled',
  'no_show'
);

create table public.doctor_profile (
  id uuid primary key default gen_random_uuid(),
  doctor_name text not null,
  clinic_name text not null,
  email text not null,
  phone text not null,
  address text not null,
  city text not null,
  timezone text not null default 'Europe/Athens',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.appointment_types (
  id uuid primary key default gen_random_uuid(),
  name_el text not null,
  name_en text not null,
  duration_minutes integer not null check (duration_minutes > 0),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.doctor_schedule (
  id uuid primary key default gen_random_uuid(),
  day_of_week integer not null unique check (day_of_week between 0 and 6),
  is_working boolean not null default false,
  start_time time,
  end_time time,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint working_hours_required check (
    (is_working = false and start_time is null and end_time is null)
    or
    (is_working = true and start_time is not null and end_time is not null and start_time < end_time)
  )
);

create table public.schedule_breaks (
  id uuid primary key default gen_random_uuid(),
  day_of_week integer not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint schedule_break_valid_range check (start_time < end_time)
);

create table public.blocked_slots (
  id uuid primary key default gen_random_uuid(),
  start_at timestamptz not null,
  end_at timestamptz not null,
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint blocked_slot_valid_range check (start_at < end_at)
);

create table public.booking_settings (
  id uuid primary key default gen_random_uuid(),
  booking_horizon_days integer not null default 60 check (booking_horizon_days > 0),
  buffer_minutes integer not null default 15 check (buffer_minutes >= 0),
  min_notice_hours integer not null default 12 check (min_notice_hours >= 0),
  timezone text not null default 'Europe/Athens',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  appointment_type_id uuid references public.appointment_types(id) on delete set null,
  patient_name text not null,
  patient_email text not null,
  patient_phone text not null,
  patient_note text,
  start_at timestamptz not null,
  end_at timestamptz not null,
  status public.appointment_status not null default 'confirmed',
  cancel_token text not null unique default encode(gen_random_bytes(32), 'hex'),
  reschedule_token text not null unique default encode(gen_random_bytes(32), 'hex'),
  google_event_id text,
  patient_reminder_sent_at timestamptz,
  doctor_reminder_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint appointment_valid_range check (start_at < end_at)
);

create table public.notification_settings (
  id uuid primary key default gen_random_uuid(),
  doctor_new_booking_email_enabled boolean not null default true,
  doctor_reminder_email_enabled boolean not null default true,
  doctor_cancellation_email_enabled boolean not null default true,
  doctor_reschedule_email_enabled boolean not null default true,
  patient_confirmation_email_enabled boolean not null default true,
  patient_reminder_email_enabled boolean not null default true,
  patient_cancellation_email_enabled boolean not null default true,
  patient_reschedule_email_enabled boolean not null default true,
  reminder_hours_before integer not null default 24 check (reminder_hours_before > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.google_calendar_connections (
  id uuid primary key default gen_random_uuid(),
  google_account_email text,
  access_token text,
  refresh_token text,
  expiry_date timestamptz,
  calendar_id text,
  is_connected boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_doctor_profile_updated_at
before update on public.doctor_profile
for each row execute function public.set_updated_at();

create trigger set_appointment_types_updated_at
before update on public.appointment_types
for each row execute function public.set_updated_at();

create trigger set_doctor_schedule_updated_at
before update on public.doctor_schedule
for each row execute function public.set_updated_at();

create trigger set_schedule_breaks_updated_at
before update on public.schedule_breaks
for each row execute function public.set_updated_at();

create trigger set_blocked_slots_updated_at
before update on public.blocked_slots
for each row execute function public.set_updated_at();

create trigger set_booking_settings_updated_at
before update on public.booking_settings
for each row execute function public.set_updated_at();

create trigger set_appointments_updated_at
before update on public.appointments
for each row execute function public.set_updated_at();

create trigger set_notification_settings_updated_at
before update on public.notification_settings
for each row execute function public.set_updated_at();

create trigger set_google_calendar_connections_updated_at
before update on public.google_calendar_connections
for each row execute function public.set_updated_at();

create index appointment_types_active_sort_idx
on public.appointment_types (is_active, sort_order);

create index doctor_schedule_day_idx
on public.doctor_schedule (day_of_week);

create index schedule_breaks_day_idx
on public.schedule_breaks (day_of_week);

create index blocked_slots_range_idx
on public.blocked_slots (start_at, end_at);

create index appointments_time_status_idx
on public.appointments (start_at, end_at, status);

create index appointments_type_idx
on public.appointments (appointment_type_id);

create index appointments_cancel_token_idx
on public.appointments (cancel_token);

create index appointments_reschedule_token_idx
on public.appointments (reschedule_token);

create index analytics_events_type_created_idx
on public.analytics_events (event_type, created_at);

alter table public.doctor_profile enable row level security;
alter table public.appointment_types enable row level security;
alter table public.doctor_schedule enable row level security;
alter table public.schedule_breaks enable row level security;
alter table public.blocked_slots enable row level security;
alter table public.booking_settings enable row level security;
alter table public.appointments enable row level security;
alter table public.notification_settings enable row level security;
alter table public.google_calendar_connections enable row level security;
alter table public.analytics_events enable row level security;

create policy "public can read active appointment types"
on public.appointment_types for select
to anon, authenticated
using (is_active = true);

create policy "public can read schedule"
on public.doctor_schedule for select
to anon, authenticated
using (true);

create policy "public can read breaks"
on public.schedule_breaks for select
to anon, authenticated
using (true);

create policy "public can read booking settings"
on public.booking_settings for select
to anon, authenticated
using (true);

create policy "admins manage doctor profile"
on public.doctor_profile for all
to authenticated
using (true)
with check (true);

create policy "admins manage appointment types"
on public.appointment_types for all
to authenticated
using (true)
with check (true);

create policy "admins manage schedule"
on public.doctor_schedule for all
to authenticated
using (true)
with check (true);

create policy "admins manage breaks"
on public.schedule_breaks for all
to authenticated
using (true)
with check (true);

create policy "admins manage blocked slots"
on public.blocked_slots for all
to authenticated
using (true)
with check (true);

create policy "admins manage booking settings"
on public.booking_settings for all
to authenticated
using (true)
with check (true);

create policy "admins manage appointments"
on public.appointments for all
to authenticated
using (true)
with check (true);

create policy "admins manage notification settings"
on public.notification_settings for all
to authenticated
using (true)
with check (true);

create policy "admins manage google calendar connections"
on public.google_calendar_connections for all
to authenticated
using (true)
with check (true);

create policy "admins read analytics events"
on public.analytics_events for select
to authenticated
using (true);
