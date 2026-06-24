create extension if not exists "pgcrypto";
create extension if not exists "citext";

drop view if exists public.users cascade;

drop function if exists public.get_public_report_tracking(text) cascade;
drop function if exists public.can_access_report(uuid) cascade;
drop function if exists public.current_user_office_ids() cascade;
drop function if exists public.is_staff() cascade;
drop function if exists public.current_app_role() cascade;
drop function if exists public.handle_new_auth_user() cascade;
drop function if exists public.set_updated_at() cascade;
drop function if exists public.generate_tracking_number() cascade;

drop table if exists public.drafts cascade;
drop table if exists public.audit_logs cascade;
drop table if exists public.notifications cascade;
drop table if exists public.report_media cascade;
drop table if exists public.report_updates cascade;
drop table if exists public.assignments cascade;
drop table if exists public.routing_rules cascade;
drop table if exists public.reports cascade;
drop table if exists public.locations cascade;
drop table if exists public.handlers cascade;
drop table if exists public.profiles cascade;
drop table if exists public.offices cascade;
drop table if exists public.wards cascade;
drop table if exists public.lgas cascade;
drop table if exists public.categories cascade;
drop table if exists public.report_types cascade;
drop table if exists public.citizen_profiles cascade;
drop table if exists public.users cascade;

drop type if exists public.moderation_flag cascade;
drop type if exists public.update_visibility cascade;
drop type if exists public.notification_status cascade;
drop type if exists public.notification_channel cascade;
drop type if exists public.notification_kind cascade;
drop type if exists public.assignment_mode cascade;
drop type if exists public.office_type cascade;
drop type if exists public.media_kind cascade;
drop type if exists public.report_severity cascade;
drop type if exists public.report_status cascade;
drop type if exists public.app_role cascade;

create type public.app_role as enum (
  'citizen',
  'super_admin',
  'moderator',
  'government_handler',
  'viewer_analyst'
);

create type public.report_status as enum (
  'Received',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
  'Closed',
  'Rejected'
);

create type public.report_severity as enum ('routine', 'urgent', 'critical');
create type public.media_kind as enum ('image', 'video', 'document');
create type public.office_type as enum ('ministry', 'department', 'agency', 'moderation', 'default_queue');
create type public.assignment_mode as enum ('routing', 'manual', 'escalation', 'moderation');
create type public.notification_kind as enum (
  'submission_confirmation',
  'assignment',
  'status',
  'notice',
  'system'
);
create type public.notification_channel as enum ('in_app', 'email', 'sms', 'whatsapp');
create type public.notification_status as enum ('queued', 'sent', 'failed', 'read');
create type public.update_visibility as enum ('public', 'internal');
create type public.moderation_flag as enum ('none', 'review', 'sensitive', 'abusive', 'duplicate');

create table public.report_types (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  label text not null unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null unique,
  description text,
  icon_key text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.lgas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null unique,
  headquarters text,
  state_name text not null default 'Ekiti State',
  created_at timestamptz not null default now()
);

create table public.wards (
  id uuid primary key default gen_random_uuid(),
  lga_id uuid not null references public.lgas(id) on delete cascade,
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default now(),
  unique (lga_id, name)
);

create table public.offices (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null unique,
  office_type public.office_type not null,
  description text,
  email citext,
  phone text,
  is_active boolean not null default true,
  is_public boolean not null default true,
  is_default_queue boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'citizen',
  full_name text,
  phone text,
  email citext,
  preferred_lga_id uuid references public.lgas(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.handlers (
  id uuid primary key default gen_random_uuid(),
  office_id uuid not null references public.offices(id) on delete cascade,
  user_id uuid unique references auth.users(id) on delete set null,
  full_name text not null,
  email citext,
  phone text,
  title text,
  escalation_level integer not null default 1,
  is_primary boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.locations (
  id uuid primary key default gen_random_uuid(),
  state_name text not null default 'Ekiti State',
  lga_id uuid not null references public.lgas(id) on delete restrict,
  ward_id uuid references public.wards(id) on delete set null,
  community text,
  area text,
  street_address text,
  landmark text,
  latitude double precision,
  longitude double precision,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  tracking_number text not null unique,
  submitted_by uuid references auth.users(id) on delete set null,
  report_type_id uuid not null references public.report_types(id) on delete restrict,
  category_id uuid not null references public.categories(id) on delete restrict,
  location_id uuid not null references public.locations(id) on delete restrict,
  assigned_office_id uuid references public.offices(id) on delete set null,
  current_assignment_id uuid,
  current_status public.report_status not null default 'Received',
  severity public.report_severity not null default 'routine',
  title text not null,
  description text not null,
  landmark_note text,
  is_anonymous boolean not null default false,
  contact_name text,
  contact_phone text,
  contact_email citext,
  public_tracking_enabled boolean not null default true,
  moderation_flag public.moderation_flag not null default 'none',
  duplicate_of_report_id uuid references public.reports(id) on delete set null,
  estimated_response_text text,
  source_channel text not null default 'web',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.routing_rules (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  category_id uuid references public.categories(id) on delete cascade,
  lga_id uuid references public.lgas(id) on delete cascade,
  ward_id uuid references public.wards(id) on delete cascade,
  office_id uuid not null references public.offices(id) on delete cascade,
  priority integer not null default 0,
  is_active boolean not null default true,
  is_fallback boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  office_id uuid not null references public.offices(id) on delete cascade,
  handler_id uuid references public.handlers(id) on delete set null,
  routing_rule_id uuid references public.routing_rules(id) on delete set null,
  assigned_by_user_id uuid references auth.users(id) on delete set null,
  assignment_mode public.assignment_mode not null default 'routing',
  is_current boolean not null default true,
  escalated boolean not null default false,
  note text,
  assigned_at timestamptz not null default now(),
  closed_at timestamptz
);

alter table public.reports
  add constraint reports_current_assignment_fk
  foreign key (current_assignment_id) references public.assignments(id) on delete set null;

create table public.report_updates (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  assignment_id uuid references public.assignments(id) on delete set null,
  status public.report_status not null,
  title text not null,
  note text not null,
  visibility public.update_visibility not null default 'public',
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_name_snapshot text not null,
  actor_role_snapshot text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.report_media (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  bucket_name text not null default 'report-media',
  storage_path text not null,
  media_kind public.media_kind not null,
  file_name text not null,
  mime_type text,
  file_size_bytes bigint,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references public.reports(id) on delete cascade,
  recipient_user_id uuid references auth.users(id) on delete cascade,
  recipient_handler_id uuid references public.handlers(id) on delete cascade,
  recipient_office_id uuid references public.offices(id) on delete cascade,
  kind public.notification_kind not null,
  channel public.notification_channel not null default 'in_app',
  delivery_status public.notification_status not null default 'queued',
  title text not null,
  body text not null,
  recipient_email citext,
  recipient_phone text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  read_at timestamptz
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references public.reports(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  actor_role_snapshot text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  client_key text,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (user_id is not null or client_key is not null)
);

create unique index drafts_user_unique_idx on public.drafts(user_id) where user_id is not null;
create unique index drafts_client_unique_idx on public.drafts(client_key) where client_key is not null;
create unique index assignments_one_current_per_report_idx on public.assignments(report_id) where is_current;

create index profiles_role_idx on public.profiles(role);
create index handlers_office_idx on public.handlers(office_id, is_active);
create index locations_lga_ward_idx on public.locations(lga_id, ward_id);
create index reports_status_created_idx on public.reports(current_status, created_at desc);
create index reports_office_status_idx on public.reports(assigned_office_id, current_status, updated_at desc);
create index reports_category_idx on public.reports(category_id, created_at desc);
create index reports_submitted_by_idx on public.reports(submitted_by, created_at desc);
create index reports_search_idx
  on public.reports
  using gin (to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, '')));
create index routing_rules_match_idx on public.routing_rules(category_id, lga_id, ward_id, priority desc);
create index assignments_office_active_idx on public.assignments(office_id, is_current, assigned_at desc);
create index report_updates_report_idx on public.report_updates(report_id, created_at asc);
create index report_media_report_idx on public.report_media(report_id, created_at asc);
create index notifications_recipient_idx on public.notifications(recipient_user_id, read_at, created_at desc);
create index notifications_office_idx on public.notifications(recipient_office_id, created_at desc);
create index audit_logs_report_idx on public.audit_logs(report_id, created_at desc);

create or replace function public.generate_tracking_number()
returns text
language plpgsql
as $$
declare
  local_date text;
  suffix text;
begin
  local_date := to_char(timezone('Africa/Lagos', now()), 'YYYYMMDD');
  suffix := upper(substring(encode(gen_random_bytes(4), 'hex') from 1 for 6));
  return format('EKI-%s-%s', local_date, suffix);
end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at_offices
before update on public.offices
for each row execute function public.set_updated_at();

create trigger set_updated_at_profiles
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_updated_at_handlers
before update on public.handlers
for each row execute function public.set_updated_at();

create trigger set_updated_at_locations
before update on public.locations
for each row execute function public.set_updated_at();

create trigger set_updated_at_reports
before update on public.reports
for each row execute function public.set_updated_at();

create trigger set_updated_at_routing_rules
before update on public.routing_rules
for each row execute function public.set_updated_at();

create trigger set_updated_at_drafts
before update on public.drafts
for each row execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), '')
  )
  on conflict (id) do update
    set email = excluded.email;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid()),
    'citizen'::public.app_role
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_app_role() in (
    'super_admin',
    'moderator',
    'government_handler',
    'viewer_analyst'
  );
$$;

create or replace function public.current_user_office_ids()
returns uuid[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(array_agg(office_id), '{}'::uuid[])
  from public.handlers
  where user_id = auth.uid()
    and is_active = true;
$$;

create or replace function public.can_access_report(target_report_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.reports r
    where r.id = target_report_id
      and (
        public.is_staff()
        or r.submitted_by = auth.uid()
        or r.assigned_office_id = any(public.current_user_office_ids())
      )
  );
$$;

create or replace view public.users
with (security_invoker = true)
as
select
  au.id,
  au.email,
  p.role,
  p.full_name,
  p.phone,
  au.created_at,
  p.updated_at
from auth.users au
left join public.profiles p on p.id = au.id;

create or replace function public.get_public_report_tracking(tracking_number_input text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  payload jsonb;
begin
  select jsonb_build_object(
    'id', r.id,
    'trackingNumber', r.tracking_number,
    'title', r.title,
    'description', r.description,
    'status', r.current_status,
    'severity', r.severity,
    'reportType', rt.label,
    'category', c.name,
    'location', jsonb_build_object(
      'state', l.state_name,
      'lga', l.name,
      'ward', w.name,
      'community', loc.community,
      'area', loc.area,
      'street', loc.street_address,
      'landmark', loc.landmark,
      'latitude', loc.latitude,
      'longitude', loc.longitude
    ),
    'assignedOffice', o.name,
    'submittedAt', r.created_at,
    'lastUpdatedAt', r.updated_at,
    'estimatedResponse', r.estimated_response_text,
    'timeline', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', u.id,
          'status', u.status,
          'title', u.title,
          'note', u.note,
          'actorName', u.actor_name_snapshot,
          'actorRole', u.actor_role_snapshot,
          'createdAt', u.created_at
        )
        order by u.created_at asc
      )
      from public.report_updates u
      where u.report_id = r.id
        and u.visibility = 'public'
    ), '[]'::jsonb),
    'media', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', m.id,
          'fileName', m.file_name,
          'mediaKind', m.media_kind,
          'bucket', m.bucket_name,
          'storagePath', m.storage_path,
          'createdAt', m.created_at
        )
        order by m.created_at asc
      )
      from public.report_media m
      where m.report_id = r.id
    ), '[]'::jsonb)
  )
  into payload
  from public.reports r
  join public.report_types rt on rt.id = r.report_type_id
  join public.categories c on c.id = r.category_id
  join public.locations loc on loc.id = r.location_id
  join public.lgas l on l.id = loc.lga_id
  left join public.wards w on w.id = loc.ward_id
  left join public.offices o on o.id = r.assigned_office_id
  where upper(r.tracking_number) = upper(trim(tracking_number_input))
    and r.public_tracking_enabled = true;

  return payload;
end;
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'report-media',
  'report-media',
  false,
  52428800,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/quicktime',
    'application/pdf'
  ]
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

alter table public.report_types enable row level security;
alter table public.categories enable row level security;
alter table public.lgas enable row level security;
alter table public.wards enable row level security;
alter table public.offices enable row level security;
alter table public.profiles enable row level security;
alter table public.handlers enable row level security;
alter table public.locations enable row level security;
alter table public.reports enable row level security;
alter table public.routing_rules enable row level security;
alter table public.assignments enable row level security;
alter table public.report_updates enable row level security;
alter table public.report_media enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.drafts enable row level security;

create policy "Public read report types"
on public.report_types
for select
to anon, authenticated
using (is_active);

create policy "Public read categories"
on public.categories
for select
to anon, authenticated
using (is_active);

create policy "Public read LGAs"
on public.lgas
for select
to anon, authenticated
using (true);

create policy "Public read wards"
on public.wards
for select
to anon, authenticated
using (true);

create policy "Public read offices"
on public.offices
for select
to anon, authenticated
using (is_active and is_public);

create policy "Profiles read own or staff"
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.is_staff());

create policy "Profiles update own or staff"
on public.profiles
for update
to authenticated
using (id = auth.uid() or public.is_staff())
with check (id = auth.uid() or public.is_staff());

create policy "Handlers read by staff or self"
on public.handlers
for select
to authenticated
using (public.is_staff() or user_id = auth.uid());

create policy "Locations read through accessible reports"
on public.locations
for select
to authenticated
using (
  public.is_staff()
  or exists (
    select 1
    from public.reports r
    where r.location_id = locations.id
      and public.can_access_report(r.id)
  )
);

create policy "Reports read by owner or staff"
on public.reports
for select
to authenticated
using (public.can_access_report(id));

create policy "Reports insert by authenticated owner"
on public.reports
for insert
to authenticated
with check (submitted_by = auth.uid());

create policy "Reports update by staff only"
on public.reports
for update
to authenticated
using (public.is_staff())
with check (public.is_staff());

create policy "Routing rules read by staff"
on public.routing_rules
for select
to authenticated
using (public.is_staff());

create policy "Assignments read by staff or assigned office"
on public.assignments
for select
to authenticated
using (
  public.is_staff()
  or office_id = any(public.current_user_office_ids())
);

create policy "Assignments mutate by staff"
on public.assignments
for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

create policy "Report updates read by owner or staff"
on public.report_updates
for select
to authenticated
using (
  public.is_staff()
  or (
    visibility = 'public'
    and public.can_access_report(report_id)
  )
);

create policy "Report updates mutate by staff"
on public.report_updates
for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

create policy "Report media read by owner or staff"
on public.report_media
for select
to authenticated
using (
  public.is_staff()
  or public.can_access_report(report_id)
);

create policy "Report media mutate by staff"
on public.report_media
for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

create policy "Notifications read by recipient or staff"
on public.notifications
for select
to authenticated
using (
  public.is_staff()
  or recipient_user_id = auth.uid()
);

create policy "Notifications update own or staff"
on public.notifications
for update
to authenticated
using (
  public.is_staff()
  or recipient_user_id = auth.uid()
)
with check (
  public.is_staff()
  or recipient_user_id = auth.uid()
);

create policy "Notifications insert by staff"
on public.notifications
for insert
to authenticated
with check (public.is_staff());

create policy "Audit logs read by staff"
on public.audit_logs
for select
to authenticated
using (public.is_staff());

create policy "Audit logs insert by staff"
on public.audit_logs
for insert
to authenticated
with check (public.is_staff());

create policy "Drafts read by owner"
on public.drafts
for select
to authenticated
using (user_id = auth.uid());

create policy "Drafts mutate by owner"
on public.drafts
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

grant execute on function public.get_public_report_tracking(text) to anon, authenticated;
