-- CA Ledger — Row Level Security
-- Firm-level isolation. Every table except `firms` is scoped by firm_id.
-- Role-based restrictions (e.g. only partners approving) are enforced in the
-- application layer for this MVP, not in RLS — see README for the tradeoff.

-- Resolves the calling user's firm_id from their Supabase auth session.
-- security definer so it can read `users` even though `users` itself has RLS.
create or replace function public.current_firm_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select firm_id from users where auth_user_id = auth.uid() limit 1;
$$;

-- ---------------------------------------------------------------------------
-- firms — a user may only see their own firm row
-- ---------------------------------------------------------------------------

alter table firms enable row level security;

create policy "firms_select_own" on firms
  for select using (id = public.current_firm_id());

-- No insert/update/delete policy: firm creation/changes go through a
-- service-role process (onboarding), never directly from the browser.

-- ---------------------------------------------------------------------------
-- users — a user may see other users in their own firm
-- ---------------------------------------------------------------------------

alter table users enable row level security;

create policy "users_select_same_firm" on users
  for select using (firm_id = public.current_firm_id());

create policy "users_update_self" on users
  for update using (auth_user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Generic firm-scoped tables
-- Every table below follows the same pattern: full CRUD for any
-- authenticated user belonging to the row's firm.
-- ---------------------------------------------------------------------------

do $$
declare
  t text;
begin
  foreach t in array array[
    'clients',
    'documents',
    'transactions',
    'reconciliations',
    'reconciliation_results',
    'exceptions',
    'tasks',
    'evidence',
    'activity_log'
  ]
  loop
    execute format('alter table %I enable row level security;', t);

    execute format(
      'create policy "%s_select_own_firm" on %I for select using (firm_id = public.current_firm_id());',
      t, t
    );
    execute format(
      'create policy "%s_insert_own_firm" on %I for insert with check (firm_id = public.current_firm_id());',
      t, t
    );
    execute format(
      'create policy "%s_update_own_firm" on %I for update using (firm_id = public.current_firm_id());',
      t, t
    );
    execute format(
      'create policy "%s_delete_own_firm" on %I for delete using (firm_id = public.current_firm_id());',
      t, t
    );
  end loop;
end $$;

-- Note: the service role key (used only in server-side code, never the
-- browser — see lib/supabase/server.ts) bypasses RLS entirely by design.
-- That is where the document-processing and reconciliation-engine jobs run.
