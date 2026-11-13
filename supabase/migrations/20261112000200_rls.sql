-- ============================================================================
-- 0002 · Row Level Security
--   · anonymous visitors: read published portfolio content only
--   · administrators:     full access to content, read access to messages
--   · contact messages:   never readable or writable by anon directly; inserts
--                         go through public.submit_contact_message() (0004)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Role helpers. SECURITY DEFINER so policies can consult public.admins without
-- granting visitors any access to that table. search_path is pinned.
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins a where a.user_id = (select auth.uid())
  );
$$;

create or replace function public.has_admin_role(required public.admin_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins a
    where a.user_id = (select auth.uid()) and a.role = required
  );
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.has_admin_role(public.admin_role) from public;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.has_admin_role(public.admin_role) to authenticated;

-- ---------------------------------------------------------------------------
-- Enable RLS everywhere
-- ---------------------------------------------------------------------------
alter table public.admins            enable row level security;
alter table public.profile           enable row level security;
alter table public.site_settings     enable row level security;
alter table public.projects          enable row level security;
alter table public.experience        enable row level security;
alter table public.education         enable row level security;
alter table public.certifications    enable row level security;
alter table public.skill_categories  enable row level security;
alter table public.skills            enable row level security;
alter table public.media             enable row level security;
alter table public.contact_messages  enable row level security;

-- ---------------------------------------------------------------------------
-- admins: a signed-in user can see only their own row (used to verify access).
-- Only owners manage the list. Nobody can self-enrol: there is no insert
-- policy for non-owners, and the first owner is created with the service role.
-- ---------------------------------------------------------------------------
create policy "admins: read own row"
  on public.admins for select to authenticated
  using (user_id = (select auth.uid()));

create policy "admins: owners manage"
  on public.admins for all to authenticated
  using (public.has_admin_role('owner'))
  with check (public.has_admin_role('owner'));

-- ---------------------------------------------------------------------------
-- Public read + admin write for always-public content
-- ---------------------------------------------------------------------------
create policy "profile: public read"        on public.profile          for select to anon, authenticated using (true);
create policy "settings: public read"       on public.site_settings    for select to anon, authenticated using (true);
create policy "education: public read"      on public.education        for select to anon, authenticated using (true);
create policy "certifications: public read" on public.certifications   for select to anon, authenticated using (true);
create policy "skill_categories: public read" on public.skill_categories for select to anon, authenticated using (true);
create policy "skills: public read"         on public.skills           for select to anon, authenticated using (true);

create policy "profile: admin write"          on public.profile          for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "settings: admin write"         on public.site_settings    for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "education: admin write"        on public.education        for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "certifications: admin write"   on public.certifications   for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "skill_categories: admin write" on public.skill_categories for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "skills: admin write"           on public.skills           for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Draft-aware content
-- ---------------------------------------------------------------------------
create policy "projects: public read published"
  on public.projects for select to anon, authenticated
  using (status = 'published' or public.is_admin());

create policy "projects: admin write"
  on public.projects for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "experience: public read published"
  on public.experience for select to anon, authenticated
  using (published or public.is_admin());

create policy "experience: admin write"
  on public.experience for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Media metadata: URLs are referenced from public content, but the library
-- listing itself is admin-only.
-- ---------------------------------------------------------------------------
create policy "media: admin all"
  on public.media for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Contact messages: admin read / update (mark read) / delete. No anon policy.
-- ---------------------------------------------------------------------------
create policy "messages: admin read"
  on public.contact_messages for select to authenticated
  using (public.is_admin());

create policy "messages: admin update"
  on public.contact_messages for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "messages: admin delete"
  on public.contact_messages for delete to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Table privileges (RLS still applies on top of these grants)
-- ---------------------------------------------------------------------------
revoke all on all tables in schema public from anon;
grant select on
  public.profile, public.site_settings, public.projects, public.experience,
  public.education, public.certifications, public.skill_categories, public.skills
to anon;

grant select, insert, update, delete on all tables in schema public to authenticated;
