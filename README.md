# Billflow

Quotation and invoice platform for Indian software freelancers, consultants
and small agencies:

> Client → Quotation → Approval → Project → Work Tracking → Invoice → Payment

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

## Contributing & security

See [CONTRIBUTING.md](CONTRIBUTING.md) for the dev workflow and PR
expectations, and [SECURITY.md](SECURITY.md) to report a vulnerability
privately. This project follows the [Code of Conduct](CODE_OF_CONDUCT.md).

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
| 0 — Foundation | Done |
| 1 — Authentication & Organization | Incomplete — enable the Google provider in the Supabase Auth dashboard (code path is built) |
| 2 — Clients | Done |
| 3 — Quotations | Done — PDF generation, Resend-backed email sending (set `RESEND_API_KEY` to enable live delivery; no-ops until then), and 6 starter templates (website/mobile/UI-UX/maintenance/retainer/consulting) |
| 4 — Projects (+ Work Items) | Done — includes project-scoped work items: grouped list, inline status, project/dashboard summaries |
| 5 — Invoices | Incomplete — invoice PDF, invoice email |
| 6 — Payments | Done — manual tracking only, by design (see "Payment gateway" below) |
| 7 — Recurring Invoices | Done — Vercel Cron calls `/api/jobs/recurring-invoices` daily (see `vercel.json`); set `CRON_SECRET` in the Vercel project's env vars |
| 8 — Dashboard & Product Hardening | Incomplete — production monitoring (needs a deployment + an APM service; error boundaries already log to console as the wiring point) |
| Payment gateway | Deliberately out of MVP scope — moved to the future backlog (`docs/future-phases-backlog.md`, Epic 3.2). Manual payment tracking (bank transfer/UPI/cash, user-recorded) is the MVP's payment model; no gateway button, payment link, or webhook exists in the app. |
| Beyond MVP | Not started — Razorpay payment links, automated payment reminders |
