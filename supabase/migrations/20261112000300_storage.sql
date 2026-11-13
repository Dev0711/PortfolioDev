-- ============================================================================
-- 0003 · Storage
-- One public-read bucket for portfolio media. File type and size limits are
-- enforced by the bucket itself (in addition to server-side validation).
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  52428800, -- 50 MB hard ceiling (videos); images are capped at 8 MB in the app
  array[
    'image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/svg+xml',
    'video/mp4', 'video/webm',
    'application/pdf'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Objects are served through the public bucket URL, so no anon SELECT policy
-- is needed (and listing the bucket stays admin-only).
create policy "media bucket: admin read"
  on storage.objects for select to authenticated
  using (bucket_id = 'media' and public.is_admin());

create policy "media bucket: admin upload"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());

create policy "media bucket: admin update"
  on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

create policy "media bucket: admin delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());
