# Billflow

Quotation and invoice platform for Indian software freelancers, consultants
and small agencies:

> Client → Quotation → Approval → Project → Invoice → Payment

See the product plan, technical build plan and future backlog for full
context (kept outside this repo).

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

### ⏳ Not started yet
Projects · Invoices (+ public `/i/[token]` page) · Payment tracking ·
Recurring invoices · Automated reminders · Dashboard metrics · Razorpay
integration · quotation templates/PDF/email · production hardening.

See the product/build-plan docs (kept outside this repo) for full detail on
each phase.
