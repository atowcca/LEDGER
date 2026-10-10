-- CA Ledger — team invites
-- A partner generates a link; the invitee signs up against it instead of
-- creating a new firm. No email sending — the partner shares the link
-- themselves (spec section 53: avoid building infrastructure this MVP
-- doesn't need).

create table invites (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references firms(id) on delete cascade,
  token text not null unique,
  role user_role not null,
  invited_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  accepted_by uuid references users(id) on delete set null
);

create index invites_firm_id_idx on invites(firm_id);
create unique index invites_token_idx on invites(token);

alter table invites enable row level security;

-- Partners can see and create invites for their own firm. There is
-- deliberately no public/anon select policy — looking up an invite by its
-- token (for someone who isn't signed in yet) goes through
-- app/api/invites/[token]/route.ts using the service-role client instead,
-- so an invite row is never broadly queryable by anyone holding a token.
create policy "invites_select_own_firm" on invites
  for select using (firm_id = public.current_firm_id());

create policy "invites_insert_own_firm" on invites
  for insert with check (firm_id = public.current_firm_id());
