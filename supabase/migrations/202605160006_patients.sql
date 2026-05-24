create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  email text,
  phone text not null,
  normalized_phone text not null unique,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.appointments
  add column if not exists patient_id uuid references public.patients(id) on delete set null;

create index if not exists patients_normalized_phone_idx
on public.patients (normalized_phone);

create index if not exists patients_email_idx
on public.patients (lower(email));

create index if not exists appointments_patient_id_idx
on public.appointments (patient_id);

create trigger set_patients_updated_at
before update on public.patients
for each row execute function public.set_updated_at();

alter table public.patients enable row level security;

create policy "admins manage patients"
on public.patients for all
to authenticated
using (true)
with check (true);

with source_patients as (
  select distinct on (
    case
      when regexp_replace(patient_phone, '\D', '', 'g') like '0030%' then substring(regexp_replace(patient_phone, '\D', '', 'g') from 5)
      when regexp_replace(patient_phone, '\D', '', 'g') like '30%' and length(regexp_replace(patient_phone, '\D', '', 'g')) = 12 then substring(regexp_replace(patient_phone, '\D', '', 'g') from 3)
      else regexp_replace(patient_phone, '\D', '', 'g')
    end
  )
    patient_name,
    patient_email,
    patient_phone,
    case
      when regexp_replace(patient_phone, '\D', '', 'g') like '0030%' then substring(regexp_replace(patient_phone, '\D', '', 'g') from 5)
      when regexp_replace(patient_phone, '\D', '', 'g') like '30%' and length(regexp_replace(patient_phone, '\D', '', 'g')) = 12 then substring(regexp_replace(patient_phone, '\D', '', 'g') from 3)
      else regexp_replace(patient_phone, '\D', '', 'g')
    end as normalized_phone,
    created_at
  from public.appointments
  where regexp_replace(patient_phone, '\D', '', 'g') <> ''
  order by
    case
      when regexp_replace(patient_phone, '\D', '', 'g') like '0030%' then substring(regexp_replace(patient_phone, '\D', '', 'g') from 5)
      when regexp_replace(patient_phone, '\D', '', 'g') like '30%' and length(regexp_replace(patient_phone, '\D', '', 'g')) = 12 then substring(regexp_replace(patient_phone, '\D', '', 'g') from 3)
      else regexp_replace(patient_phone, '\D', '', 'g')
    end,
    created_at desc
)
insert into public.patients (display_name, email, phone, normalized_phone, created_at, updated_at)
select patient_name, patient_email, patient_phone, normalized_phone, created_at, now()
from source_patients
where normalized_phone <> ''
on conflict (normalized_phone) do nothing;

update public.appointments as appointment
set patient_id = patient.id
from public.patients as patient
where appointment.patient_id is null
  and patient.normalized_phone = case
    when regexp_replace(appointment.patient_phone, '\D', '', 'g') like '0030%' then substring(regexp_replace(appointment.patient_phone, '\D', '', 'g') from 5)
    when regexp_replace(appointment.patient_phone, '\D', '', 'g') like '30%' and length(regexp_replace(appointment.patient_phone, '\D', '', 'g')) = 12 then substring(regexp_replace(appointment.patient_phone, '\D', '', 'g') from 3)
    else regexp_replace(appointment.patient_phone, '\D', '', 'g')
  end;
