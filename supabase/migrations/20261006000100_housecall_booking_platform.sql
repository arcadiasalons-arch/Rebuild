alter table if exists public.appointment_requests
  add column if not exists site_slug text not null default 'housecall',
  add column if not exists location_type text not null default 'studio',
  add column if not exists approval_state text not null default 'pending',
  add column if not exists calendar_sync_state text not null default 'pending',
  add column if not exists approved_at timestamptz,
  add column if not exists calendar_google_url text,
  add column if not exists calendar_ics_url text;

create index if not exists appointment_requests_site_slug_idx
  on public.appointment_requests (site_slug);

create index if not exists appointment_requests_location_type_idx
  on public.appointment_requests (location_type);
