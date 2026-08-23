# Complete Product Specification & MVP Build Plan
# Quotation and Invoice Platform for Indian Software Businesses
## Next.js + Supabase + Vercel Architecture

## 1. Executive Summary

### Product goal

Build a SaaS platform for Indian software freelancers, consultants and agencies that manages the commercial lifecycle:

> Client → Quotation → Approval → Project → Work Tracking → Invoice → Payment

### Updated MVP technology stack

The MVP architecture is based on:

- **Frontend and application framework:** Next.js
- **Primary backend:** Supabase
- **Database:** Supabase PostgreSQL
- **Authentication:** Supabase Auth
- **Authorization:** Supabase Row Level Security (RLS)
- **File storage:** Supabase Storage
- **Deployment:** Vercel
- **Server-side API layer:** Next.js Route Handlers
- **Server-side mutations:** Next.js Server Actions where appropriate
- **Background jobs:** Supabase Cron / scheduled Edge Functions or a Vercel-compatible job provider when required
- **Email:** Transactional email provider such as Resend
- **Payments:** manual tracking only in the MVP (bank transfer/UPI/cash, user-recorded); Razorpay is a future phase, not MVP — see section 14
- **PDF generation:** HTML/CSS templates rendered to PDF through a server-side compatible service/library

### Architecture principle

Avoid building and maintaining a separate NestJS backend during the MVP.

Use Supabase as the backend platform and Next.js as the application/server layer:

```text
Browser
   ↓
Next.js Application
   ├── Server Components
   ├── Server Actions
   ├── Route Handlers
   └── Server-side business logic
           ↓
       Supabase
       ├── PostgreSQL
       ├── Auth
       ├── Storage
       ├── RLS
       └── Scheduled/server-side functions
           ↓
        External Services
       ├── Email
       ├── Payments
       └── PDF generation
```

---

# 2. Recommended MVP Stack

## Application

### Next.js

Use Next.js with:

- App Router
- TypeScript
- Server Components by default
- Client Components only for interactive UI
- Server Actions for authenticated mutations where suitable
- Route Handlers for public APIs, webhooks and integrations

Recommended project structure:

```text
src/
  app/
    (marketing)/
    (auth)/
    (app)/
    api/
    q/
    i/
  components/
  features/
    auth/
    organizations/
    clients/
    quotations/
    projects/
    invoices/
    payments/
  lib/
    supabase/
    validation/
    calculations/
    permissions/
  actions/
  types/
```

---

## Backend Platform

### Supabase

Use Supabase for:

- PostgreSQL database
- Authentication
- Row Level Security
- File storage
- Realtime where useful
- Scheduled jobs/functions
- Database migrations

### Why this architecture fits the MVP

It minimizes operational complexity and works naturally with Vercel deployment.

The core application becomes:

```text
Next.js + Supabase
```

rather than:

```text
Angular + NestJS + PostgreSQL + Redis + object storage + separate API deployment
```

---

# 3. Authentication and Authorization

## Authentication

Use Supabase Auth for:

- Email/password
- Google login
- Password reset
- Email verification
- Session management

## Organization tenancy

The product is multi-tenant.

Every business user belongs to one or more organizations.

Core relationship:

```text
auth.users
   ↓
profiles
   ↓
organization_members
   ↓
organizations
```

## Authorization

Use:

- Supabase RLS as the database-level security boundary
- Organization membership checks
- Application-level permission checks for UI and business actions

Example rule:

A user can access a client only when they belong to the organization that owns the client.

---

# 4. Updated Database Schema

The MVP should use Supabase PostgreSQL.

## 4.1 profiles

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

---

## 4.2 organizations

```sql
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  logo_path text,
  email text,
  phone text,
  website text,
  gst_enabled boolean default false,
  gstin text,
  pan text,
  address_line_1 text,
  address_line_2 text,
  city text,
  state text,
  pincode text,
  country text default 'IN',
  currency text default 'INR',
  timezone text default 'Asia/Kolkata',
  invoice_prefix text default 'INV',
  quotation_prefix text default 'QTN',
  next_invoice_number integer default 1,
  next_quotation_number integer default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

---

## 4.3 organization_members

```sql
create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner',
  created_at timestamptz default now(),
  unique (organization_id, user_id)
);
```

MVP roles:

- owner
- admin
- member

---

## 4.4 clients

```sql
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  type text not null default 'company',
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
  country text default 'IN',
  notes text,
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

---

## 4.5 projects

```sql
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  client_id uuid not null references clients(id),
  source_quotation_id uuid,
  name text not null,
  description text,
  contract_value numeric(15,2) not null default 0,
  currency text default 'INR',
  billing_type text not null default 'full',
  status text default 'active',
  start_date date,
  end_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

Billing types:

- full
- advance_balance
- milestone
- recurring

---

## 4.6 quotations

```sql
create table public.quotations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  client_id uuid not null references clients(id),
  project_id uuid references projects(id),
  quotation_number text not null,
  version integer not null default 1,
  issue_date date not null default current_date,
  valid_until date,
  status text not null default 'draft',
  currency text default 'INR',
  subtotal numeric(15,2) default 0,
  discount_total numeric(15,2) default 0,
  tax_total numeric(15,2) default 0,
  grand_total numeric(15,2) default 0,
  scope_of_work text,
  deliverables text,
  timeline text,
  assumptions text,
  exclusions text,
  notes text,
  terms text,
  public_token uuid unique default gen_random_uuid(),
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

---

## 4.7 quotation_items

```sql
create table public.quotation_items (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references quotations(id) on delete cascade,
  sort_order integer not null default 0,
  type text default 'item',
  title text not null,
  description text,
  quantity numeric(12,2) default 1,
  unit text,
  unit_price numeric(15,2) default 0,
  discount_type text,
  discount_value numeric(15,2) default 0,
  tax_rate numeric(5,2) default 0,
  line_total numeric(15,2) default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

---

## 4.8 milestones

```sql
create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  description text,
  amount numeric(15,2) not null,
  sort_order integer default 0,
  due_date date,
  status text default 'pending',
  invoiced_amount numeric(15,2) default 0,
  paid_amount numeric(15,2) default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

---

## 4.9 invoices

```sql
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  client_id uuid not null references clients(id),
  project_id uuid references projects(id),
  milestone_id uuid references milestones(id),
  source_quotation_id uuid references quotations(id),
  invoice_number text not null,
  issue_date date not null default current_date,
  due_date date,
  status text not null default 'draft',
  currency text default 'INR',
  subtotal numeric(15,2) default 0,
  discount_total numeric(15,2) default 0,
  tax_total numeric(15,2) default 0,
  grand_total numeric(15,2) default 0,
  amount_paid numeric(15,2) default 0,
  balance_due numeric(15,2) default 0,
  po_number text,
  notes text,
  terms text,
  public_token uuid unique default gen_random_uuid(),
  sent_at timestamptz,
  viewed_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

---

## 4.10 invoice_items

```sql
create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  sort_order integer default 0,
  description text not null,
  quantity numeric(12,2) default 1,
  unit text,
  unit_price numeric(15,2) default 0,
  discount_type text,
  discount_value numeric(15,2) default 0,
  tax_rate numeric(5,2) default 0,
  tax_type text,
  line_total numeric(15,2) default 0
);
```

---

## 4.11 payments

```sql
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  invoice_id uuid not null references invoices(id) on delete cascade,
  amount numeric(15,2) not null,
  currency text default 'INR',
  payment_method text not null,
  payment_reference text,
  gateway text,
  gateway_payment_id text,
  status text default 'completed',
  paid_at timestamptz,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

---

## 4.12 recurring_invoice_schedules

```sql
create table public.recurring_invoice_schedules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  client_id uuid not null references clients(id),
  project_id uuid references projects(id),
  name text not null,
  frequency text not null,
  interval_count integer default 1,
  next_run_at timestamptz not null,
  ends_at timestamptz,
  due_days integer default 7,
  currency text default 'INR',
  template_data jsonb not null,
  status text default 'active',
  last_invoice_id uuid references invoices(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

---

## 4.13 activity_logs

```sql
create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  actor_user_id uuid references auth.users(id),
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
```

---

## 4.14 work_items

Lightweight, project-scoped task tracking — one actionable unit of work
inside a project. Not a general-purpose PM system: no subtasks,
dependencies, assignees, or time tracking in the MVP.

```sql
create table public.work_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo',
  priority text not null default 'medium',
  due_date date,
  completed_at timestamptz,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint work_items_status_check
    check (status in ('todo', 'in_progress', 'blocked', 'completed')),
  constraint work_items_priority_check
    check (priority in ('low', 'medium', 'high', 'urgent'))
);

create index idx_work_items_organization_id on work_items(organization_id);
create index idx_work_items_project_id on work_items(project_id);
create index idx_work_items_status on work_items(status);
create index idx_work_items_due_date on work_items(due_date);
create index idx_work_items_org_status on work_items(organization_id, status);
```

Business rules:
- A work item must belong to a project in the same organization.
- Defaults to status `todo`, priority `medium`.
- `completed_at` is set/cleared automatically by a DB trigger whenever
  `status` transitions into/out of `completed` — never by application
  code, so every write path (app, future API, admin fix) gets it for free.
- Completing every work item does **not** automatically complete the
  project — delivery, review, invoicing and payment steps may remain.
- Project progress = completed work items ÷ total work items (null/"No
  work items yet" when there are none — never a misleading 0%).

---

# 5. Row Level Security Strategy

RLS must be enabled on all tenant-owned tables.

Example:

```sql
alter table public.clients enable row level security;
```

The access model should verify organization membership.

Example policy concept:

```text
User can read a client only when:
- the client belongs to an organization
- the authenticated user belongs to that organization
```

Create reusable PostgreSQL helper functions such as:

```text
is_organization_member(organization_id)
has_organization_role(organization_id, role)
```

Then reuse them in RLS policies.

### Important security rule

Never expose the Supabase service role key to the browser.

Use the service role only inside trusted server-side execution for administrative operations that require it.

---

# 6. Updated Next.js Application Architecture

## Server Components

Use for:

- Dashboard data loading
- Lists
- Detail pages
- Authenticated page rendering

## Client Components

Use only for:

- Form interactions
- Invoice/quotation line item editing
- Dynamic calculations
- Modals
- Drag-and-drop/reordering
- Charts requiring client interactivity

## Server Actions

Use for:

- Create client
- Update client
- Create quotation
- Update quotation
- Create invoice
- Record manual payment
- Organization settings

## Route Handlers

Use for:

- Public APIs (`/q/[token]`, `/i/[token]` and their action endpoints)
- External integrations
- Scheduled-job endpoints (recurring invoice generation; built)
- Razorpay webhooks and public payment actions (future phase, not MVP)

---

# 7. API and Server Module Plan

The architecture does not require a traditional separate REST backend for internal application operations.

Use feature modules:

```text
features/
  auth/
  organizations/
  clients/
  projects/
  quotations/
  invoices/
  payments/
  recurring-invoices/
  activity/
```

Public/integration APIs remain under:

```text
app/api/
```

Recommended routes:

```http
POST /api/public/quotation/:token/action      # built
POST /api/jobs/recurring-invoices              # built (idempotent; not yet on a schedule)
POST /api/webhooks/razorpay                    # future — payment gateway integration
POST /api/public/invoice/:token/payment        # future — payment gateway integration
POST /api/jobs/payment-reminders               # future — automated reminders
```

Internal CRUD operations should primarily use typed server-side functions and Server Actions instead of creating unnecessary REST endpoints.

---

# 8. Supabase Storage Plan

Create storage buckets:

```text
organization-assets
generated-documents
```

## organization-assets

Store:

- Logos
- Branding assets

## generated-documents

Store:

- Quotation PDFs
- Invoice PDFs
- Future credit notes

Access strategy:

- Private by default
- Signed URLs for authenticated access
- Public client links should resolve document access through token validation rather than exposing unrestricted bucket URLs

---

# 9. PDF Generation Architecture

The product needs high-quality branded PDFs.

## Recommended flow

```text
Quotation / Invoice Data
       ↓
Server-side HTML Template
       ↓
Render PDF
       ↓
Upload to Supabase Storage
       ↓
Return signed download URL
```

### Requirements

- A4 support
- Organization logo
- Brand colors
- GST breakdown
- Bank details
- UPI details
- Professional typography
- Print-safe layout

Do not generate final production PDFs in the browser because consistent rendering and security are more difficult.

---

# 10. Email Architecture

Use a transactional email provider.

Recommended email categories:

- Welcome
- Email verification
- Password reset
- Quotation sent
- Quotation accepted
- Invoice sent
- Payment received
- Payment reminder

Next.js server-side code should trigger emails.

Store relevant events in `activity_logs`.

---

# 11. Background Jobs Without a Dedicated NestJS/Redis Worker

The original Redis + BullMQ architecture is replaced for this deployment model.

## MVP scheduled jobs

- Generate recurring invoices
- Update overdue statuses
- Send payment reminders
- Retry failed scheduled tasks

Recommended approach:

```text
Scheduled Trigger
      ↓
Supabase function / cron-compatible execution
      ↓
Query PostgreSQL
      ↓
Run job
      ↓
Update records
```

For Vercel-hosted scheduled handlers, protect endpoints with secrets and ensure jobs are idempotent.

## Job design rule

Every scheduled operation must be safe to run more than once.

Example:

Before generating a recurring invoice, verify that an invoice has not already been generated for the relevant billing period.

---

# 12. Updated User Flows

## Flow A — Onboarding

```text
Sign Up
  ↓
Supabase Auth Account
  ↓
Create Profile
  ↓
Create Organization
  ↓
Create Owner Membership
  ↓
Enter Business Details
  ↓
Configure GST
  ↓
Configure Invoice Numbering
  ↓
Add Payment Details
  ↓
Dashboard
```

---

## Flow B — Create Quotation

```text
Dashboard
  ↓
Create Quotation
  ↓
Select/Create Client
  ↓
Add Services and Sections
  ↓
Calculate Tax
  ↓
Add Terms
  ↓
Save
  ↓
Generate PDF
  ↓
Send Email
```

---

## Flow C — Public Quotation

Public route:

```text
/q/[publicToken]
```

Actions:

- View
- Download PDF
- Accept
- Reject
- Request changes

The public token must be unguessable.

---

## Flow D — Invoice

```text
Project / Client
  ↓
Create Invoice
  ↓
Add Items or Copy from Quotation
  ↓
Calculate Totals
  ↓
Generate PDF
  ↓
Send
```

Public route:

```text
/i/[publicToken]
```

---

# 13. Page-by-Page UI Plan

## 13.1 Authentication

Routes:

```text
/login
/sign-up
/forgot-password
/reset-password
```

Use Supabase Auth.

---

## 13.2 Application Shell

Suggested authenticated routes:

```text
/dashboard
/clients
/clients/[id]
/quotations
/quotations/new
/quotations/[id]
/projects
/projects/[id]
/projects/[id]/work
/invoices
/invoices/new
/invoices/[id]
/payments
/recurring
/settings
```

---

## 13.3 Dashboard

Data should be loaded server-side.

Metrics:

- Outstanding
- Overdue
- Paid this month
- Quote pipeline

Widgets:

- Recent activity
- Upcoming due invoices
- Upcoming recurring invoices
- Recent payments

---

## 13.4 Quotation Editor

Interactive client component for:

- Line items
- Totals
- Tax
- Reordering
- Live preview

Persist through server-side mutation.

---

## 13.5 Public Quotation Page

Route:

```text
/q/[token]
```

Use server-side token lookup.

Do not use client-side database credentials or privileged access.

---

## 13.6 Public Invoice Page

Route:

```text
/i/[token]
```

Show:

- Invoice
- Balance due
- Payment instructions
- Payment action
- Download PDF

---

# 14. Payment Architecture

## MVP — manual tracking only

```text
Invoice
  ↓
Client pays externally (bank transfer / UPI / cash / other)
  ↓
User records the payment (method, reference, date, notes)
  ↓
invoices.amount_paid / balance_due / status recalculated
```

No payment gateway, payment link generation, or webhook endpoint is part
of the MVP. `POST /api/webhooks/razorpay` from the route-handler plan in
section 7 is **not built** for this reason.

## Payment gateway integration — future phase, not MVP

Deferred to the future-phases backlog (Epic 3.2 — Payment Gateway
Integration). Planned flow, for reference:

```text
Invoice
  ↓
Create Razorpay payment/order link
  ↓
Client Pays
  ↓
Razorpay Webhook
  ↓
Next.js Route Handler
  ↓
Verify Signature
  ↓
Create Payment Record
  ↓
Update Invoice
```

Webhook endpoint (future): `POST /api/webhooks/razorpay`. All webhook
processing must be idempotent when this is built.

---

# 15. State and Data Calculation Strategy

Use PostgreSQL as the source of truth.

Critical calculations:

```text
invoice.amount_paid =
SUM(successful payments)

invoice.balance_due =
grand_total - amount_paid
```

These calculations should be updated transactionally when payments are recorded.

Use database transactions/RPC functions where multiple financial records must change atomically.

---

# 16. MVP Development Phases

# Phase 0 — Foundation

- [ ] Create Next.js project
- [ ] Configure TypeScript
- [ ] Configure Supabase project
- [ ] Configure Supabase Auth
- [ ] Create database migrations
- [ ] Create organization tenancy model
- [ ] Implement RLS policies
- [ ] Configure Supabase Storage
- [ ] Configure environment variables
- [x] Deploy development environment to Vercel

---

# Phase 1 — Authentication and Organization

- [ ] Sign up
- [ ] Login
- [ ] Logout
- [ ] Password reset
- [ ] Google login
- [ ] Profile creation
- [ ] Organization creation
- [ ] Owner membership
- [ ] Business settings
- [ ] GST settings
- [ ] Invoice numbering

---

# Phase 2 — Clients

- [ ] Client database
- [ ] Client RLS
- [ ] Client list
- [ ] Create client
- [ ] Edit client
- [ ] Archive client
- [ ] Client detail page
- [ ] Search clients

---

# Phase 3 — Quotations

- [ ] Quotation schema
- [ ] Quotation items
- [ ] Quotation editor
- [ ] GST calculations
- [ ] Discounts
- [ ] Proposal sections
- [ ] Draft saving
- [ ] Quotation list
- [ ] Quotation details
- [ ] Public token
- [ ] Public quotation page
- [ ] PDF generation
- [ ] Email sending

---

# Phase 4 — Projects

- [ ] Project schema
- [ ] Project creation
- [ ] Quote-to-project conversion
- [ ] Contract value tracking
- [ ] Project detail page
- [ ] Project financial summary
- [ ] Work items schema (`work_items`, RLS, indexes)
- [ ] Work items CRUD (create/edit/delete, inline status updates)
- [ ] Project Work tab (`/projects/[id]/work`), grouped by status
- [ ] Project overview work summary (progress %, next work, blocked/due-soon)
- [ ] Projects list work indicators (progress %, blocked/due-soon)
- [ ] Dashboard "My work" + "Attention required" (work items, overdue
      invoices, quotations expiring soon)
- [ ] Work item activity logging

---

# Phase 5 — Invoices

- [ ] Invoice schema
- [ ] Invoice items
- [ ] Invoice editor
- [ ] GST calculations
- [ ] Invoice numbering
- [ ] Invoice PDF
- [ ] Public invoice page
- [ ] Invoice email
- [ ] Due dates
- [ ] Status calculation

---

# Phase 6 — Payments

Manual tracking only — no payment gateway in the MVP (see section 14).

- [ ] Manual payment recording
- [ ] Partial payments
- [ ] Payment history
- [ ] Invoice balance calculation
- [ ] Paid status
- [ ] Partial payment status
- [ ] Overdue calculation

---

# Phase 7 — Recurring Invoices

- [x] Schedule model
- [x] Recurring schedule UI
- [x] Scheduled execution
- [x] Automatic invoice generation
- [x] Duplicate prevention
- [x] Recurring invoice history
- [x] Pause/resume

---

# Phase 8 — Dashboard and Product Hardening

- [ ] Dashboard metrics
- [ ] Recent activity
- [ ] Outstanding calculation
- [ ] Overdue calculation
- [ ] Error handling
- [ ] Empty states
- [ ] Loading states
- [ ] RLS security review
- [ ] Mobile responsiveness
- [ ] Performance review
- [ ] Production monitoring

---

# 17. Updated 12-Week MVP Build Schedule

## Weeks 1–2 — Foundation

- Next.js setup
- Supabase setup
- Auth
- Organizations
- RLS
- Deployment pipeline

## Weeks 3–4 — Clients and Quotations

- Client management
- Quotation schema
- Quotation editor
- Calculation engine

## Weeks 5–6 — Documents

- PDF generation
- Supabase Storage
- Public quotation pages
- Email delivery

## Weeks 7–8 — Projects and Invoices

- Projects
- Quote conversion
- Invoice engine
- Invoice pages

## Weeks 9–10 — Payments and Recurring Billing

- Manual payments
- Partial payments
- Recurring invoice schedules
- Scheduled jobs

## Week 11 — Dashboard and Quality

- Dashboard
- Security review
- RLS testing
- Mobile testing
- Performance testing

## Week 12 — Production Beta

- Vercel production deployment
- Supabase production configuration
- Monitoring
- Error tracking
- Beta user onboarding

---

# 18. Vercel Deployment Plan

## Environments

```text
Local
Development
Preview
Production
```

## Deployment flow

```text
Git Push
   ↓
GitHub
   ↓
Vercel
   ├── Preview deployment for pull requests
   └── Production deployment for main branch
```

## Supabase environments

Use separate Supabase projects or clearly separated environments for:

- Development
- Production

Production secrets must only exist in Vercel/server-side environments.

---

# 19. Updated Architecture Decisions

## Selected

- Next.js instead of Angular
- Supabase instead of a separate NestJS backend
- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage
- Supabase RLS
- Vercel deployment
- Next.js Route Handlers
- Next.js Server Actions
- Supabase-compatible scheduled jobs/functions

## Removed from MVP architecture

- Angular frontend
- Separate NestJS backend
- Dedicated Redis + BullMQ infrastructure
- Separate S3 infrastructure for MVP
- Separate backend container deployment

---

# 20. Final MVP Architecture

```text
                        USERS
                          │
                          ▼
                    NEXT.JS APP
                     (VERCEL)
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
        Server Actions  Route API   Public Pages
              │           │           │
              └───────────┼───────────┘
                          ▼
                      SUPABASE
             ┌────────────┼────────────┐
             ▼            ▼            ▼
        PostgreSQL       Auth        Storage
             │            │            │
             └────────────┼────────────┘
                          ▼
                       RLS SECURITY
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
            Email       Payments   Scheduled Jobs
```

---

# 21. Recommended Build Order

```text
1. Next.js foundation
2. Supabase project
3. Supabase Auth
4. Organization multi-tenancy
5. RLS
6. Business settings
7. Clients
8. Quotation engine
9. Public quotation page
10. Projects
11. Work items
12. Invoice engine
13. Payment tracking (manual)
14. Recurring invoices
15. Dashboard
16. Production hardening
```

PDF generation and email sending (previously steps 9/11) and Razorpay
(previously step 18) are deferred to a future phase — see the
future-phases backlog. They are not required for MVP acceptance below.

---

# 22. MVP Acceptance Criteria

The MVP is complete when a user can:

1. Sign up using Supabase Auth
2. Create a business organization
3. Securely access only their organization's data
4. Add business information
5. Add clients
6. Create quotations
7. Add GST/non-GST pricing
8. Send quotations
9. Share a secure public quotation link
10. Create a project from an accepted quotation
11. Track work items inside a project and see its progress
12. Create invoices
13. Record full or partial payments
14. View outstanding balances
15. Create recurring invoice schedules
16. View dashboard metrics, including work and attention summaries
17. Use the application in production on Vercel

Branded PDF export, transactional email sending and payment gateway
integration are explicitly **not** required for MVP acceptance — see the
future-phases backlog.

---

# Final Implementation Direction

The MVP stack is intentionally optimized for fast SaaS development and low infrastructure overhead:

> **Next.js + Supabase + Vercel**

The architecture should use Supabase as the managed backend foundation and PostgreSQL source of truth, while Next.js owns the product UI, server-side application logic, public routes, integrations and webhooks.

The product remains focused on:

> **Proposal → Approval → Project → Work Tracking → Invoice → Payment**

The post-MVP roadmap can build on this foundation without requiring a rewrite of the core application architecture.
