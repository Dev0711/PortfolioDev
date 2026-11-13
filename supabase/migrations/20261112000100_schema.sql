-- ============================================================================
-- 0001 · Core schema
-- Portfolio content model. Row Level Security is enabled in the next migration.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Authorisation: administrators
-- A row here grants CMS access to an existing auth user. Roles are an enum so
-- additional roles (e.g. "editor") can be given narrower policies later.
-- ---------------------------------------------------------------------------
create type public.admin_role as enum ('owner', 'editor');

create table public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  role       public.admin_role not null default 'owner',
  created_at timestamptz not null default now()
);

comment on table public.admins is
  'Allow-list of auth users who may manage content. There is no public sign-up.';

-- ---------------------------------------------------------------------------
-- Singleton: profile
-- ---------------------------------------------------------------------------
create table public.profile (
  id               smallint primary key default 1 check (id = 1),
  name             text not null default '',
  title            text not null default '',
  hero_headline    text not null default '',
  hero_description text not null default '',
  availability     text not null default '',
  location         text not null default '',
  timezone         text not null default 'UTC',
  about_intro      text not null default '',
  about_body       text not null default '',          -- sanitised HTML
  journey          text not null default '',          -- sanitised HTML
  interests        jsonb not null default '[]'::jsonb, -- [{title, body}]
  philosophy       jsonb not null default '[]'::jsonb, -- [{title, body}]
  contact_intro    text not null default '',
  email            text not null default '',
  socials          jsonb not null default '[]'::jsonb, -- [{label, url}]
  avatar_url       text,
  resume_url       text,
  updated_at       timestamptz not null default now()
);

create trigger profile_updated_at before update on public.profile
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Singleton: site settings
-- ---------------------------------------------------------------------------
create table public.site_settings (
  id              smallint primary key default 1 check (id = 1),
  nav             jsonb not null default '[]'::jsonb,  -- [{label, href, visible}]
  home_sections   jsonb not null default '[]'::jsonb,  -- ordered [{key, visible, eyebrow, heading, body, cta_label, cta_href}]
  hero_cta        jsonb not null default '{}'::jsonb,  -- {primary_label, primary_href, secondary_label, secondary_href}
  hero_media_url  text,
  hero_media_type text check (hero_media_type in ('image', 'video')),
  accent          text not null default '#FF6A3D' check (accent ~ '^#[0-9A-Fa-f]{6}$'),
  accent_alt      text not null default '#8B9CFF' check (accent_alt ~ '^#[0-9A-Fa-f]{6}$'),
  footer          jsonb not null default '{}'::jsonb,  -- {headline, note, links: [{label, url}]}
  seo_title       text not null default '',
  seo_description text not null default '',
  updated_at      timestamptz not null default now()
);

create trigger site_settings_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Projects
-- ---------------------------------------------------------------------------
create type public.publish_status as enum ('draft', 'published');

create table public.projects (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title           text not null,
  summary         text not null default '',
  category        text not null default '',
  role            text not null default '',
  timeframe       text not null default '',
  status          public.publish_status not null default 'draft',
  featured        boolean not null default false,
  sort_order      integer not null default 0,
  cover_url       text,
  cover_video_url text,
  gallery         jsonb not null default '[]'::jsonb,  -- [{url, alt}]
  technologies    text[] not null default '{}',
  github_url      text,
  live_url        text,
  sections        jsonb not null default '[]'::jsonb,  -- ordered [{id, heading, html}]
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index projects_public_idx on public.projects (status, sort_order);

create trigger projects_updated_at before update on public.projects
  for each row execute function public.set_updated_at();

-- Stamp published_at the first time a project goes live.
create or replace function public.stamp_published_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at = now();
  end if;
  return new;
end;
$$;

create trigger projects_published_at before insert or update on public.projects
  for each row execute function public.stamp_published_at();

-- ---------------------------------------------------------------------------
-- Experience / education / certifications
-- ---------------------------------------------------------------------------
create table public.experience (
  id           uuid primary key default gen_random_uuid(),
  company      text not null,
  role         text not null,
  location     text not null default '',
  start_date   date not null,
  end_date     date,                       -- null = present
  summary      text not null default '',
  highlights   text[] not null default '{}',
  technologies text[] not null default '{}',
  company_url  text,
  published    boolean not null default true,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  check (end_date is null or end_date >= start_date)
);

create trigger experience_updated_at before update on public.experience
  for each row execute function public.set_updated_at();

create table public.education (
  id          uuid primary key default gen_random_uuid(),
  institution text not null,
  degree      text not null default '',
  field       text not null default '',
  start_year  smallint,
  end_year    smallint,
  notes       text not null default '',
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create table public.certifications (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  issuer     text not null default '',
  year       smallint,
  url        text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Skills
-- ---------------------------------------------------------------------------
create table public.skill_categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text not null default '',
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create table public.skills (
  id          uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.skill_categories (id) on delete cascade,
  name        text not null,
  icon        text not null default 'box',   -- key into the app icon registry
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create index skills_category_idx on public.skills (category_id, sort_order);

-- ---------------------------------------------------------------------------
-- Media library (metadata for objects in the "media" storage bucket)
-- ---------------------------------------------------------------------------
create table public.media (
  id         uuid primary key default gen_random_uuid(),
  path       text not null unique,          -- object path inside the bucket
  url        text not null,                 -- public URL
  name       text not null,
  mime_type  text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  alt        text not null default '',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Contact messages
-- ---------------------------------------------------------------------------
create table public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 1 and 120),
  email      text not null check (char_length(email) between 3 and 254),
  subject    text not null default '' check (char_length(subject) <= 200),
  message    text not null check (char_length(message) between 10 and 5000),
  ip_hash    text,                           -- salted hash, used only for rate limiting
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

create index contact_messages_recent_idx on public.contact_messages (created_at desc);
create index contact_messages_rate_idx on public.contact_messages (ip_hash, created_at desc);
