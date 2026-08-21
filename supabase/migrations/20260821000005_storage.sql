-- Storage buckets. Both are private; access goes through signed URLs
-- (authenticated app) or token-validated route handlers (public /q, /i
-- pages), never unauthenticated bucket URLs.

insert into storage.buckets (id, name, public)
values
  ('organization-assets', 'organization-assets', false),
  ('generated-documents', 'generated-documents', false)
on conflict (id) do nothing;

-- organization-assets: path convention "<organization_id>/logo.<ext>"
create policy organization_assets_select_member on storage.objects
  for select to authenticated
  using (
    bucket_id = 'organization-assets'
    and private.is_organization_member(((storage.foldername(name))[1])::uuid)
  );

create policy organization_assets_write_member on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'organization-assets'
    and private.is_organization_member(((storage.foldername(name))[1])::uuid)
  );

create policy organization_assets_update_member on storage.objects
  for update to authenticated
  using (
    bucket_id = 'organization-assets'
    and private.is_organization_member(((storage.foldername(name))[1])::uuid)
  )
  with check (
    bucket_id = 'organization-assets'
    and private.is_organization_member(((storage.foldername(name))[1])::uuid)
  );

create policy organization_assets_delete_member on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'organization-assets'
    and private.is_organization_member(((storage.foldername(name))[1])::uuid)
  );

-- generated-documents: path convention "<organization_id>/<quotations|invoices>/<id>.pdf"
-- Written only by trusted server code (service role) during PDF generation.
-- Org members may read their own organization's generated documents.
create policy generated_documents_select_member on storage.objects
  for select to authenticated
  using (
    bucket_id = 'generated-documents'
    and private.is_organization_member(((storage.foldername(name))[1])::uuid)
  );
