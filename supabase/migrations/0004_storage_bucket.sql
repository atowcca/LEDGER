-- CA Ledger — document storage bucket
-- Private bucket; files live at /{firm_id}/{client_id}/{document_id}/{filename}.
-- Access is via signed URLs generated server-side (lib/documents/storage.ts),
-- never a public bucket URL (spec section 38).

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- A user may read/write objects whose path starts with their own firm_id.
create policy "documents_bucket_firm_scoped_select" on storage.objects
  for select using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = public.current_firm_id()::text
  );

create policy "documents_bucket_firm_scoped_insert" on storage.objects
  for insert with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = public.current_firm_id()::text
  );

-- Note: the upload and retry Route Handlers use the service-role client,
-- which bypasses these policies entirely — they exist so that any future
-- direct-from-browser upload flow is still safely firm-scoped.
