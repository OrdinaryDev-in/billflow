# Contributing to Billflow

Thanks for your interest in improving Billflow. This project is currently
maintained by a small team at OrdinaryDev; the notes below apply to both
internal contributors and outside pull requests.

## Before you start

- For anything non-trivial (new feature, schema change, behavior change),
  please open an issue first to discuss the approach.
- For bugs or small fixes, feel free to go straight to a pull request.
- **Security issues:** do not open a public issue — see [SECURITY.md](SECURITY.md).

## Getting set up

```bash
npm install
cp .env.example .env.local   # fill in Supabase project keys
npm run dev
```

See the [README](README.md) for the project structure and
[`docs/`](docs) for the product and technical plan.

## Development workflow

1. Branch off `main`: `git checkout -b your-change`.
2. Make your change, following the conventions already used in the file
   you're editing (naming, comment density, structure).
3. If you change the database schema, add a new SQL migration under
   [`supabase/migrations`](supabase/migrations) rather than editing an
   applied one.
4. Run the checks that CI will run before opening a PR:

   ```bash
   npm run lint
   npm run typecheck
   npm run build
   ```

5. Commit with a clear, imperative message (e.g. `Add client search filter`,
   not `fixed stuff`).
6. Open a pull request against `main` and fill in the PR template.

## Pull request expectations

- Keep PRs focused — one logical change per PR is easier to review.
- All CI checks (lint, typecheck, build, CodeQL, dependency review) must
  pass before merge.
- Describe *why* the change is needed, not just what changed, especially
  for behavior or schema changes.
- Screenshots or a short clip are appreciated for UI changes.
- New server actions / API routes that touch data must respect existing
  multi-tenant isolation (organization scoping + RLS) — see
  [`docs/`](docs) and existing code under `src/lib` and `src/actions` for
  the patterns in use.

## Code style

- TypeScript, App Router conventions, Server Components/Actions by default.
- Formatting and lint rules are enforced by `eslint.config.mjs` — run
  `npm run lint` before pushing.
- Prefer editing existing patterns over introducing new ones; check
  neighboring files for the established idiom before adding a library or
  abstraction.

## Reporting bugs / requesting features

Use the issue templates in this repository. Include repro steps, expected
vs. actual behavior, and environment details for bugs.

## Code of Conduct

This project follows the [Code of Conduct](CODE_OF_CONDUCT.md). By
participating, you're expected to uphold it.
