create extension if not exists btree_gist;

alter table public.appointments
  add column if not exists cancel_token_expires_at timestamptz not null default (now() + interval '14 days'),
  add column if not exists reschedule_token_expires_at timestamptz not null default (now() + interval '14 days');

update public.appointments
set
  cancel_token_expires_at = coalesce(cancel_token_expires_at, created_at + interval '14 days'),
  reschedule_token_expires_at = coalesce(reschedule_token_expires_at, created_at + interval '14 days');

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'appointments_no_confirmed_overlap'
      and conrelid = 'public.appointments'::regclass
  ) then
    alter table public.appointments
      add constraint appointments_no_confirmed_overlap
      exclude using gist (
        tstzrange(start_at, end_at, '[)') with &&
      )
      where (status = 'confirmed');
  end if;
end $$;

drop policy if exists "admins manage doctor profile" on public.doctor_profile;
drop policy if exists "admins manage appointment types" on public.appointment_types;
drop policy if exists "admins manage schedule" on public.doctor_schedule;
drop policy if exists "admins manage breaks" on public.schedule_breaks;
drop policy if exists "admins manage blocked slots" on public.blocked_slots;
drop policy if exists "admins manage booking settings" on public.booking_settings;
drop policy if exists "admins manage appointments" on public.appointments;
drop policy if exists "admins manage notification settings" on public.notification_settings;
drop policy if exists "admins manage google calendar connections" on public.google_calendar_connections;
drop policy if exists "admins read analytics events" on public.analytics_events;
