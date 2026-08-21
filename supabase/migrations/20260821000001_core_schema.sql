-- Core tenancy + billing schema. See product-plan docs for the full model.

-- 1. profiles ----------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'One row per auth user; mirrors a subset of auth.users for app-level profile data.';

-- 2. organizations -------------------------------------------------------
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  logo_path text,
  email text,
  phone text,
  website text,
  gst_enabled boolean not null default false,
  gstin text,
  pan text,
  address_line_1 text,
  address_line_2 text,
  city text,
  state text,
  pincode text,
  country text not null default 'IN',
  currency text not null default 'INR',
  timezone text not null default 'Asia/Kolkata',
  invoice_prefix text not null default 'INV',
  quotation_prefix text not null default 'QTN',
  next_invoice_number integer not null default 1,
  next_quotation_number integer not null default 1,
  bank_account_name text,
  bank_account_number text,
  bank_ifsc text,
  bank_name text,
  upi_id text,
  default_payment_terms text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organizations_next_invoice_number_positive check (next_invoice_number > 0),
  constraint organizations_next_quotation_number_positive check (next_quotation_number > 0)
);

-- 3. organization_members -------------------------------------------------
create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create index organization_members_organization_id_idx on public.organization_members (organization_id);
create index organization_members_user_id_idx on public.organization_members (user_id);

-- 4. clients ---------------------------------------------------------------
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  type text not null default 'company' check (type in ('company', 'individual')),
  name text not null,
  contact_name text,
  email text,
  phone text,
  gstin text,
  address_line_1 text,
  address_line_2 text,
  city text,
  state text,
  pincode text,
  country text not null default 'IN',
  notes text,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index clients_organization_id_idx on public.clients (organization_id);

-- 5. projects ----------------------------------------------------------------
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete restrict,
  source_quotation_id uuid,
  name text not null,
  description text,
  contract_value numeric(15, 2) not null default 0,
  currency text not null default 'INR',
  billing_type text not null default 'full' check (billing_type in ('full', 'advance_balance', 'milestone', 'recurring')),
  status text not null default 'active' check (status in ('active', 'completed', 'on_hold', 'cancelled')),
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_organization_id_idx on public.projects (organization_id);
create index projects_client_id_idx on public.projects (client_id);

-- 6. quotations ----------------------------------------------------------
create table public.quotations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete restrict,
  project_id uuid references public.projects(id) on delete set null,
  quotation_number text not null,
  version integer not null default 1,
  issue_date date not null default current_date,
  valid_until date,
  status text not null default 'draft' check (status in ('draft', 'sent', 'viewed', 'accepted', 'rejected', 'changes_requested', 'expired')),
  currency text not null default 'INR',
  subtotal numeric(15, 2) not null default 0,
  discount_total numeric(15, 2) not null default 0,
  tax_total numeric(15, 2) not null default 0,
  grand_total numeric(15, 2) not null default 0,
  scope_of_work text,
  deliverables text,
  timeline text,
  assumptions text,
  exclusions text,
  notes text,
  terms text,
  public_token uuid not null unique default gen_random_uuid(),
  sent_at timestamptz,
  viewed_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, quotation_number)
);

create index quotations_organization_id_idx on public.quotations (organization_id);
create index quotations_client_id_idx on public.quotations (client_id);
create index quotations_project_id_idx on public.quotations (project_id);
create index quotations_public_token_idx on public.quotations (public_token);

alter table public.projects
  add constraint projects_source_quotation_id_fkey
  foreign key (source_quotation_id) references public.quotations(id) on delete set null;

create index projects_source_quotation_id_idx on public.projects (source_quotation_id);

-- 7. quotation_items ---------------------------------------------------
create table public.quotation_items (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references public.quotations(id) on delete cascade,
  sort_order integer not null default 0,
  type text not null default 'item' check (type in ('section', 'item')),
  title text not null,
  description text,
  quantity numeric(12, 2) not null default 1,
  unit text,
  unit_price numeric(15, 2) not null default 0,
  discount_type text check (discount_type in ('percentage', 'fixed')),
  discount_value numeric(15, 2) not null default 0,
  tax_rate numeric(5, 2) not null default 0,
  line_total numeric(15, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index quotation_items_quotation_id_idx on public.quotation_items (quotation_id);

-- 8. milestones ----------------------------------------------------------
create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  description text,
  amount numeric(15, 2) not null,
  sort_order integer not null default 0,
  due_date date,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed')),
  invoiced_amount numeric(15, 2) not null default 0,
  paid_amount numeric(15, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint milestones_amount_positive check (amount >= 0)
);

create index milestones_project_id_idx on public.milestones (project_id);

-- 9. invoices --------------------------------------------------------------
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete restrict,
  project_id uuid references public.projects(id) on delete set null,
  milestone_id uuid references public.milestones(id) on delete set null,
  source_quotation_id uuid references public.quotations(id) on delete set null,
  invoice_number text not null,
  issue_date date not null default current_date,
  due_date date,
  status text not null default 'draft' check (
    status in ('draft', 'sent', 'viewed', 'partially_paid', 'paid', 'overdue', 'cancelled')
  ),
  currency text not null default 'INR',
  subtotal numeric(15, 2) not null default 0,
  discount_total numeric(15, 2) not null default 0,
  tax_total numeric(15, 2) not null default 0,
  grand_total numeric(15, 2) not null default 0,
  amount_paid numeric(15, 2) not null default 0,
  balance_due numeric(15, 2) not null default 0,
  po_number text,
  notes text,
  terms text,
  public_token uuid not null unique default gen_random_uuid(),
  sent_at timestamptz,
  viewed_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, invoice_number)
);

create index invoices_organization_id_idx on public.invoices (organization_id);
create index invoices_client_id_idx on public.invoices (client_id);
create index invoices_project_id_idx on public.invoices (project_id);
create index invoices_milestone_id_idx on public.invoices (milestone_id);
create index invoices_source_quotation_id_idx on public.invoices (source_quotation_id);
create index invoices_public_token_idx on public.invoices (public_token);
create index invoices_status_due_date_idx on public.invoices (status, due_date);

-- 10. invoice_items ------------------------------------------------------
create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  sort_order integer not null default 0,
  description text not null,
  quantity numeric(12, 2) not null default 1,
  unit text,
  unit_price numeric(15, 2) not null default 0,
  discount_type text check (discount_type in ('percentage', 'fixed')),
  discount_value numeric(15, 2) not null default 0,
  tax_rate numeric(5, 2) not null default 0,
  tax_type text check (tax_type in ('cgst_sgst', 'igst', 'none')),
  line_total numeric(15, 2) not null default 0
);

create index invoice_items_invoice_id_idx on public.invoice_items (invoice_id);

-- 11. payments -------------------------------------------------------------
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  amount numeric(15, 2) not null,
  currency text not null default 'INR',
  payment_method text not null check (
    payment_method in ('bank_transfer', 'upi', 'razorpay', 'cash', 'other')
  ),
  payment_reference text,
  gateway text,
  gateway_payment_id text,
  status text not null default 'completed' check (status in ('pending', 'completed', 'failed', 'refunded')),
  paid_at timestamptz not null default now(),
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_amount_positive check (amount > 0)
);

create index payments_organization_id_idx on public.payments (organization_id);
create index payments_invoice_id_idx on public.payments (invoice_id);

-- 12. recurring_invoice_schedules ------------------------------------------
create table public.recurring_invoice_schedules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete restrict,
  project_id uuid references public.projects(id) on delete set null,
  name text not null,
  frequency text not null check (frequency in ('weekly', 'monthly', 'quarterly', 'yearly')),
  interval_count integer not null default 1,
  next_run_at timestamptz not null,
  ends_at timestamptz,
  due_days integer not null default 7,
  currency text not null default 'INR',
  template_data jsonb not null,
  status text not null default 'active' check (status in ('active', 'paused', 'ended')),
  last_invoice_id uuid references public.invoices(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recurring_invoice_schedules_interval_count_positive check (interval_count > 0)
);

create index recurring_invoice_schedules_organization_id_idx on public.recurring_invoice_schedules (organization_id);
create index recurring_invoice_schedules_client_id_idx on public.recurring_invoice_schedules (client_id);
create index recurring_invoice_schedules_project_id_idx on public.recurring_invoice_schedules (project_id);
create index recurring_invoice_schedules_status_next_run_idx on public.recurring_invoice_schedules (status, next_run_at);

-- 13. activity_logs ----------------------------------------------------------
create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index activity_logs_organization_id_idx on public.activity_logs (organization_id);
create index activity_logs_entity_idx on public.activity_logs (entity_type, entity_id);

-- 14. quotation approval events (client accept/reject/request-changes audit trail) --
create table public.quotation_approval_events (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references public.quotations(id) on delete cascade,
  action text not null check (action in ('viewed', 'accepted', 'rejected', 'changes_requested')),
  client_name text,
  client_message text,
  ip_address text,
  created_at timestamptz not null default now()
);

create index quotation_approval_events_quotation_id_idx on public.quotation_approval_events (quotation_id);
