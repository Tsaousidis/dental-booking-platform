create table public.api_rate_limits (
  id uuid primary key default gen_random_uuid(),
  route text not null,
  identifier_hash text not null,
  window_start timestamptz not null,
  request_count integer not null default 1 check (request_count > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (route, identifier_hash, window_start)
);

create trigger set_api_rate_limits_updated_at
before update on public.api_rate_limits
for each row execute function public.set_updated_at();

create index api_rate_limits_lookup_idx
on public.api_rate_limits (route, identifier_hash, window_start);

alter table public.api_rate_limits enable row level security;
