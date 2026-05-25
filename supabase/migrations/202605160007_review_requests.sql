alter table public.notification_settings
  add column if not exists patient_review_request_email_enabled boolean not null default true;

alter table public.appointments
  add column if not exists patient_review_request_sent_at timestamptz;

create index if not exists appointments_review_request_idx
on public.appointments (status, end_at, patient_review_request_sent_at);
