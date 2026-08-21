# Billflow

Quotation and invoice platform for Indian software freelancers, consultants
and small agencies:

> Client → Quotation → Approval → Project → Invoice → Payment

See [`docs/`](docs) for the full product plan, technical build plan and
future-phases backlog this build follows.

## Stack

- **Next.js** (App Router, TypeScript, Server Components/Actions)
- **Supabase** (Postgres, Auth, Storage, RLS)
- **Tailwind CSS v4**, styled to the Billflow design system
- **Vercel** for deployment

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in Supabase project keys
npm run dev
```

The Supabase project (`billflow`, org OrdinaryDev, `ap-southeast-2`) already
has the schema, RLS policies and storage buckets applied via migrations in
[`supabase/migrations`](supabase/migrations). Grab the service role key from
the [project API settings](https://supabase.com/dashboard/project/oxkmzrmuibafjzfnjaad/settings/api)
and put it in `.env.local` — it's the one secret the tooling can't fetch for
you.

## Project structure

```text
src/
  app/
    (marketing)/   # public marketing site
    (auth)/        # login, sign-up, password reset
    (app)/         # authenticated app shell (dashboard, clients, ...)
    api/            # webhooks, public token-gated actions, scheduled jobs
    q/[token]/      # public quotation view
    i/[token]/      # public invoice view
  components/      # shared UI primitives
  features/        # feature modules (clients, quotations, invoices, ...)
  lib/             # supabase clients, validation, calculations, permissions
  actions/         # Server Actions
  types/           # database.ts (generated), shared types
supabase/
  migrations/      # SQL migrations, applied in order
docs/
  product-plan.md            # product vision, users, MVP feature set
  build-plan.md               # architecture + the Phase 0-8 MVP checklist
  future-phases-backlog.md    # post-MVP roadmap (Phases 2-12)
```

## Design system

All UI work follows the `billflow-design-system` skill — Billflow Blue
(`#2563EB`) primary, Inter typeface, slate neutrals, calm/structured
financial UI. Brand SVGs live in `public/brand/`.

## Status

Building against the phase-by-phase MVP roadmap: Foundation → Auth &
Organization → Clients → Quotations → Projects → Invoices → Payments →
Recurring → Dashboard → hardening.

### ✅ Phase 0 — Foundation
- Next.js 16 (App Router, TypeScript, Turbopack) scaffolded with the full
  route-group structure (`(marketing)`, `(auth)`, `(app)`, `api/`,
  `q/[token]`, `i/[token]`) plus `features/`, `lib/`, `actions/`, `types/`.
- Supabase project `billflow` (org OrdinaryDev, `ap-southeast-2`) created;
  full MVP schema, RLS (via `private.is_organization_member` /
  `has_organization_role` helpers), atomic invoice/quotation numbering
  functions, invoice-totals-recalc trigger, and two private storage buckets
  applied through the migrations in [`supabase/migrations`](supabase/migrations).
- Supabase browser/server/admin clients and `proxy.ts` session middleware.
- Billflow design tokens wired into Tailwind v4, Inter font, brand SVGs,
  favicon.

### ✅ Phase 1 — Authentication & Organization
- Email/password sign-up and login, Google OAuth button, logout,
  forgot/reset password, `/auth/callback` route handler for email-link and
  OAuth code exchange, auto-profile-on-signup DB trigger.
- Organization onboarding via an atomic `create_organization_with_owner`
  RPC, cookie-based "current organization" resolution, `requireOrganization()`
  guard, app shell with sidebar nav (pinned/sticky, independent of page
  length).
- Business settings page: name/address, GST/PAN, bank/UPI details, invoice
  and quotation numbering prefixes.
- Verified end-to-end against the live Supabase project (sign-up → profile
  trigger → onboarding → org + owner membership → dashboard → settings
  save).

### ✅ Phase 2 — Clients
- List page with search (`?q=`) and status filter (active/archived/all),
  empty state, status badges.
- Create and edit via a shared `ClientForm` (company/individual, contact,
  GSTIN, address, notes).
- Archive/reactivate toggle (`useTransition`, no page reload).
- Client detail page (outstanding balance and linked
  projects/quotations/invoices are placeholders until those features land).
- Verified end-to-end against the live Supabase project (create → list →
  search → edit → archive → reactivate).

### 🟡 Phase 3 — Quotations (core flow done, PDF/email pending)
- Shared line-item calculation engine (`lib/calculations/quotation.ts`):
  per-line discount + GST, subtotal/discount/tax/grand total.
- Quotation list, draft creation (atomic numbering via
  `next_quotation_number` RPC), details form (scope, deliverables, timeline,
  assumptions, exclusions, terms), interactive line-item editor (sections,
  reordering, live totals), save/duplicate.
- Draft is editable; once sent, details and items lock (duplicate to
  revise).
- Public quotation page at `/q/[token]` (admin-client, token-gated, no
  auth) — branded proposal view, auto view-tracking, Accept / Request
  changes / Decline actions posted to
  `/api/public/quotation/[token]/action`, full client-activity audit trail
  shown on the internal detail page.
- Verified end-to-end: create draft → add line item → GST calculates live
  → save → mark sent → public page renders → client accepts → status and
  activity feed update correctly on both sides.
- **Not yet built**: quotation templates, branded PDF export, and email
  sending (needs `RESEND_API_KEY`) — the quotation is shareable via its
  public link in the meantime.

### ✅ Phase 4 — Projects
- Project list, manual creation, edit, financial summary tiles (contract
  value, invoiced, paid, outstanding — invoiced/paid aggregate from
  `invoices` once that table has rows) and remaining-to-invoice note.
- One-click "Convert to project" on an accepted quotation — atomically
  creates the project (contract value = quotation grand total, linked via
  `source_quotation_id`) and links it back onto the quotation.
- Milestone manager for `billing_type = milestone` projects: add, change
  status (pending/in progress/completed), delete.
- Verified end-to-end: accept quotation → convert to project → contract
  value carried over correctly → switch to milestone billing → add/complete
  a milestone.
- Along the way, fixed a real bug: the milestone quick-add form had no
  `description` field, so `formData.get("description")` returned `null`
  (not `""`), which failed Zod's `optional()` (only `undefined` passes) —
  now defaulted to `""` before validation.

### 🟡 Phase 5 — Invoices (core flow done, PDF/email pending)
- Invoice list (with a computed "Overdue" badge layered on top of the
  persisted status once `due_date` has passed — `lib/calculations/invoice-status.ts`),
  draft creation, details form (client/project/PO/due date/terms), line-item
  editor with per-line GST rate **and** tax type (CGST+SGST / IGST / none).
- Place-of-supply helper (`lib/calculations/invoice.ts`): compares
  organization vs. client state to default new lines to CGST+SGST
  (intra-state) or IGST (inter-state).
- Generate an invoice straight from an **accepted quotation** (copies line
  items, totals, terms) or from an **unpaid milestone** (single line item
  for the remaining amount, updates `milestones.invoiced_amount`).
- Draft-editable / locked-once-sent lifecycle; cancel while unpaid.
- Public invoice page at `/i/[token]` — branded view, balance due, bank/UPI
  payment details (shown only when configured), auto view-tracking.
- **Not yet built**: invoice PDF export and email sending (same
  `RESEND_API_KEY` gap as quotations).

### ✅ Phase 6 — Payment tracking
- Record full/partial payments against an invoice (method, reference, date,
  notes) and delete them; `invoices.amount_paid` / `balance_due` / `status`
  (draft → sent → partially_paid → paid) are recalculated by the
  `recalculate_invoice_totals` DB trigger from Phase 0, not application code.
- Global payments list across all invoices.
- Verified end-to-end: quotation → invoice → mark sent → partial payment
  (`partially_paid`, correct balance) → full payment (`paid`, ₹0 balance) →
  project's Invoiced/Paid/Outstanding tiles reflect it correctly.
- Along the way, fixed the same class of bug as Phase 4: the payment
  quick-add form has no `notes` field, so `formData.get("notes")` was
  `null` and failed Zod's `optional()` — defaulted to `""` before
  validation. (Worth grepping for elsewhere if new quick-add forms are
  added without every schema field present as an input.)

### ✅ Phase 7 — Recurring invoices
- Schedule CRUD: name, client, project, frequency (weekly/monthly/
  quarterly/yearly), interval count, next-run date, optional end date,
  payment-due days.
- Invoice template editor (line items + notes/terms) stored as JSONB on the
  schedule, independent of the invoice_items table.
- Idempotent generation core (`lib/recurring/generate.ts`), shared by the
  manual "Generate invoice now" button and the scheduled-job endpoint:
  `next_run_at` is always advanced from its *previous* value (never from
  "now"), so a second automated call before the next period starts safely
  no-ops. The manual button intentionally passes `force: true` to bypass
  the due-date check — that's a deliberate off-cycle override, not a gap
  in the idempotency guarantee.
- `POST /api/jobs/recurring-invoices`, bearer-token gated via
  `CRON_SECRET`, generates invoices for every due schedule — ready for a
  Vercel Cron / scheduled function once deployed; fails closed (500) if
  `CRON_SECRET` isn't configured, verified locally.
- Added `invoices.recurring_schedule_id` (migration
  `20260821000007_recurring_invoice_link.sql`) so each schedule's detail
  page shows its full generation history, not just the latest invoice.
- Verified end-to-end: create schedule → save template → Generate now →
  invoice created with correct total/due date → `next_run_at` advances by
  exactly one interval → history list shows it after a fresh page load.

### ✅ Phase 8 (partial) — Dashboard metrics
- Outstanding, Overdue, Paid this month and Quote pipeline tiles now query
  live data (previously hard-coded ₹0) — outstanding/overdue from
  `invoices.balance_due`, paid-this-month from `payments`, pipeline from
  sent/viewed `quotations`.
- Upcoming due invoices and Recent payments widgets.
- Verified against real data end-to-end (see Phase 6).
- Still open from Phase 8: empty/loading states beyond the basics, RLS
  security review pass, mobile responsiveness pass, error handling
  hardening, production monitoring.

---

## MVP checklist

Full checkbox list from [`docs/build-plan.md`](docs/build-plan.md#16-mvp-development-phases),
marked against what's actually built and verified. Unchecked items are the
honest remaining scope — most are blocked on external setup (Resend,
Razorpay, a Vercel deployment) rather than more application code.

### Phase 0 — Foundation
- [x] Create Next.js project
- [x] Configure TypeScript
- [x] Configure Supabase project
- [x] Configure Supabase Auth
- [x] Create database migrations
- [x] Create organization tenancy model
- [x] Implement RLS policies
- [x] Configure Supabase Storage
- [x] Configure environment variables
- [ ] Deploy development environment to Vercel

### Phase 1 — Authentication and Organization
- [x] Sign up
- [x] Login
- [x] Logout
- [x] Password reset
- [x] Google login *(code path built; needs the Google provider enabled in the Supabase Auth dashboard to actually work)*
- [x] Profile creation
- [x] Organization creation
- [x] Owner membership
- [x] Business settings
- [x] GST settings
- [x] Invoice numbering

### Phase 2 — Clients
- [x] Client database
- [x] Client RLS
- [x] Client list
- [x] Create client
- [x] Edit client
- [x] Archive client
- [x] Client detail page
- [x] Search clients

### Phase 3 — Quotations
- [x] Quotation schema
- [x] Quotation items
- [x] Quotation editor
- [x] GST calculations
- [x] Discounts
- [x] Proposal sections
- [x] Draft saving
- [x] Quotation list
- [x] Quotation details
- [x] Public token
- [x] Public quotation page
- [ ] PDF generation
- [ ] Email sending

### Phase 4 — Projects
- [x] Project schema
- [x] Project creation
- [x] Quote-to-project conversion
- [x] Contract value tracking
- [x] Project detail page
- [x] Project financial summary

### Phase 5 — Invoices
- [x] Invoice schema
- [x] Invoice items
- [x] Invoice editor
- [x] GST calculations
- [x] Invoice numbering
- [ ] Invoice PDF
- [x] Public invoice page
- [ ] Invoice email
- [x] Due dates
- [x] Status calculation

### Phase 6 — Payments
- [x] Manual payment recording
- [x] Partial payments
- [x] Payment history
- [x] Invoice balance calculation
- [x] Paid status
- [x] Partial payment status
- [x] Overdue calculation *(computed at display time from `due_date`; the persisted `status` column itself isn't flipped by a background job yet — see Phase 8)*

### Phase 7 — Recurring Invoices
- [x] Schedule model
- [x] Recurring schedule UI
- [ ] Scheduled execution *(the `/api/jobs/recurring-invoices` endpoint exists and is idempotent; nothing calls it on a schedule yet — needs Vercel Cron after deployment)*
- [x] Automatic invoice generation *(via the endpoint above, or the manual "Generate now" button)*
- [x] Duplicate prevention
- [x] Recurring invoice history
- [x] Pause/resume

### Phase 8 — Dashboard and Product Hardening
- [x] Dashboard metrics
- [ ] Recent activity *(dashboard shows Upcoming due invoices + Recent payments instead; the `activity_logs` table exists but nothing writes to it yet)*
- [x] Outstanding calculation
- [x] Overdue calculation
- [ ] Error handling *(happy-path only; no dedicated error boundaries/toasts pass)*
- [ ] Empty states *(present on list pages; not audited everywhere)*
- [ ] Loading states
- [ ] RLS security review
- [ ] Mobile responsiveness
- [ ] Performance review
- [ ] Production monitoring

### Beyond the Phase 0-8 checklist
- [ ] Razorpay payment links (build order step 18)
- [ ] Automated payment reminders (future-phases-backlog Epic 2.2 — needs the same cron + email infra as recurring invoices)
- [ ] Quotation templates (product-plan §6.4)
