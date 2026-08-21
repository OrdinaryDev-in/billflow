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

Phase-by-phase against [`docs/build-plan.md`](docs/build-plan.md#16-mvp-development-phases).
Complete phases are marked **Done**; for **Incomplete** phases only the
still-pending items are listed (everything else in that phase is built and
verified).

| Phase | Status |
|---|---|
| 0 — Foundation | Incomplete — deploy to Vercel |
| 1 — Authentication & Organization | Incomplete — enable the Google provider in the Supabase Auth dashboard (code path is built) |
| 2 — Clients | Done |
| 3 — Quotations | Incomplete — PDF generation, email sending, quotation templates |
| 4 — Projects | Done |
| 5 — Invoices | Incomplete — invoice PDF, invoice email |
| 6 — Payments | Done |
| 7 — Recurring Invoices | Incomplete — scheduled execution (the `/api/jobs/recurring-invoices` endpoint is built and idempotent; nothing calls it on a schedule yet — needs Vercel Cron after deployment) |
| 8 — Dashboard & Product Hardening | Incomplete — recent activity feed, error handling, loading states, RLS security review, mobile responsiveness, performance review, production monitoring |
| Beyond MVP | Not started — Razorpay payment links, automated payment reminders |
