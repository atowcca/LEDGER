-- CA Ledger — core schema
-- Demo MVP. Multi-tenant by firm_id. No real client data — see README for scope.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type user_role as enum ('PARTNER', 'SENIOR', 'STAFF');

create type client_status as enum ('ACTIVE', 'ONBOARDING', 'PAUSED');

create type document_type as enum (
  'GST Invoice',
  'Bank Statement',
  'Purchase Register',
  'GSTR-2B'
);

create type processing_status as enum ('Processing', 'Processed', 'Ready', 'Failed');

create type reconciliation_status as enum ('DRAFT', 'RUNNING', 'COMPLETE', 'FAILED');

create type recon_result_type as enum (
  'MATCHED',
  'PARTIAL_MATCH',
  'AMOUNT_MISMATCH',
  'MISSING_IN_2B',
  'GSTIN_MISMATCH',
  'DUPLICATE'
);

create type exception_severity as enum ('HIGH', 'MEDIUM', 'LOW');

create type exception_status as enum (
  'OPEN',
  'ASSIGNED',
  'AWAITING_CLIENT',
  'UNDER_REVIEW',
  'RESOLVED',
  'REJECTED'
);

create type evidence_status as enum ('RECEIVED', 'REQUESTED', 'PENDING');

-- ---------------------------------------------------------------------------
-- Core tables
-- ---------------------------------------------------------------------------

create table firms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- One row per Supabase auth user, scoped to a firm.
create table users (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references firms(id) on delete cascade,
  auth_user_id uuid unique references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  role user_role not null,
  created_at timestamptz not null default now()
);

create index users_firm_id_idx on users(firm_id);
create unique index users_email_per_firm_idx on users(firm_id, email);

create table clients (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references firms(id) on delete cascade,
  -- stable, human-readable identifier used in URLs; unique per firm
  slug text not null,
  name text not null,
  gstin text not null,
  pan text,
  industry text,
  engagement text,
  status client_status not null default 'ONBOARDING',
  created_at timestamptz not null default now()
);

create index clients_firm_id_idx on clients(firm_id);
create unique index clients_slug_per_firm_idx on clients(firm_id, slug);

create table documents (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references firms(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  file_name text not null,
  storage_path text not null,
  document_type document_type not null,
  processing_status processing_status not null default 'Processing',
  extracted_data jsonb,
  extracted_confidence numeric(3, 2),
  uploaded_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index documents_firm_id_idx on documents(firm_id);
create index documents_client_id_idx on documents(client_id);

create table transactions (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references firms(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  source text not null, -- e.g. 'PURCHASE_REGISTER' | 'GSTR_2B'
  vendor_name text not null,
  vendor_gstin text not null,
  invoice_number text not null,
  invoice_date date not null,
  taxable_value numeric(14, 2) not null,
  cgst numeric(14, 2) not null default 0,
  sgst numeric(14, 2) not null default 0,
  igst numeric(14, 2) not null default 0,
  total_amount numeric(14, 2) not null,
  source_document_id uuid references documents(id) on delete set null,
  created_at timestamptz not null default now()
);

create index transactions_firm_id_idx on transactions(firm_id);
create index transactions_client_id_idx on transactions(client_id);
create index transactions_invoice_idx on transactions(client_id, invoice_number);

create table reconciliations (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references firms(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  name text not null,
  period text not null, -- e.g. 'August 2026'
  source_a text not null default 'PURCHASE_REGISTER',
  source_b text not null default 'GSTR_2B',
  status reconciliation_status not null default 'DRAFT',
  run_at timestamptz,
  created_at timestamptz not null default now()
);

create index reconciliations_firm_id_idx on reconciliations(firm_id);
create index reconciliations_client_id_idx on reconciliations(client_id);

create table reconciliation_results (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references firms(id) on delete cascade,
  reconciliation_id uuid not null references reconciliations(id) on delete cascade,
  transaction_id uuid references transactions(id) on delete set null,       -- purchase-side row
  matched_transaction_id uuid references transactions(id) on delete set null, -- GSTR-2B-side row, if any
  result_type recon_result_type not null,
  difference_amount numeric(14, 2),
  explanation text,
  created_at timestamptz not null default now()
);

create index reconciliation_results_firm_id_idx on reconciliation_results(firm_id);
create index reconciliation_results_recon_id_idx on reconciliation_results(reconciliation_id);
create index reconciliation_results_type_idx on reconciliation_results(result_type);

create table exceptions (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references firms(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  reconciliation_id uuid references reconciliations(id) on delete set null,
  reconciliation_result_id uuid references reconciliation_results(id) on delete set null,
  transaction_id uuid references transactions(id) on delete set null,
  display_code text not null, -- e.g. 'EX-1042', shown in the UI
  exception_type recon_result_type not null,
  severity exception_severity not null default 'MEDIUM',
  description text,
  why_explanation text[] not null default '{}',
  ai_suggested_steps text[] not null default '{}',
  status exception_status not null default 'OPEN',
  assigned_to uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index exceptions_firm_id_idx on exceptions(firm_id);
create index exceptions_client_id_idx on exceptions(client_id);
create index exceptions_status_idx on exceptions(status);
create index exceptions_assigned_to_idx on exceptions(assigned_to);
create unique index exceptions_display_code_per_firm_idx on exceptions(firm_id, display_code);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references firms(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  exception_id uuid not null references exceptions(id) on delete cascade,
  assigned_to uuid not null references users(id) on delete cascade,
  title text not null,
  description text,
  status exception_status not null default 'OPEN',
  due_date date,
  created_at timestamptz not null default now()
);

create index tasks_firm_id_idx on tasks(firm_id);
create index tasks_client_id_idx on tasks(client_id);
create index tasks_assigned_to_idx on tasks(assigned_to);

create table evidence (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references firms(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  exception_id uuid not null references exceptions(id) on delete cascade,
  document_id uuid references documents(id) on delete set null,
  label text not null,
  status evidence_status not null default 'PENDING',
  description text,
  uploaded_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index evidence_firm_id_idx on evidence(firm_id);
create index evidence_exception_id_idx on evidence(exception_id);

create table activity_log (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references firms(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  exception_id uuid references exceptions(id) on delete set null,
  user_id uuid references users(id) on delete set null,
  action text not null,
  description text not null,
  created_at timestamptz not null default now()
);

create index activity_log_firm_id_idx on activity_log(firm_id);
create index activity_log_client_id_idx on activity_log(client_id);
create index activity_log_exception_id_idx on activity_log(exception_id);
create index activity_log_created_at_idx on activity_log(created_at desc);
