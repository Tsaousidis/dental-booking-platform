alter table public.appointments
  alter column cancel_token_expires_at set default (now() + interval '14 days'),
  alter column reschedule_token_expires_at set default (now() + interval '14 days');

update public.appointments
set cancel_token_expires_at = least(cancel_token_expires_at, created_at + interval '14 days')
where cancel_token_expires_at > created_at + interval '14 days';

update public.appointments
set reschedule_token_expires_at = least(reschedule_token_expires_at, created_at + interval '14 days')
where reschedule_token_expires_at > created_at + interval '14 days';
