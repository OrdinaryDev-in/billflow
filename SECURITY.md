# Security Policy

Billflow handles invoicing, quotations and payment data for freelancers and
small agencies, so we take security issues seriously and appreciate
responsible disclosure.

## Supported versions

Billflow is deployed continuously from the `main` branch — there are no
separate maintained release lines. Only the latest deployed version on
`main` receives security fixes.

| Version         | Supported          |
| --------------- | ------------------- |
| `main` (latest) | :white_check_mark:  |
| Older commits   | :x:                  |

## Reporting a vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Instead, report it privately using one of these channels:

1. **Preferred:** [GitHub Security Advisories](https://github.com/OrdinaryDev-in/billflow/security/advisories/new) —
   use "Report a vulnerability" on this repository.
2. **Email:** security@ordinarydev.in (or mubashir585@gmail.com if that
   address is unreachable) with a description of the issue, steps to
   reproduce, and any proof-of-concept code.

Please include as much of the following as you can:

- The type of issue (e.g. SQL injection, broken auth/RLS, XSS, IDOR, secret
  leakage, SSRF)
- Affected file(s)/route(s) or a URL
- Step-by-step reproduction, or a PoC
- Impact you believe the issue has (e.g. cross-tenant data access, ability
  to bypass payment/invoice authorization)

### What to expect

- **Acknowledgement:** within 3 business days.
- **Triage & status update:** within 7 business days of acknowledgement.
- **Fix timeline:** depends on severity — critical issues (auth bypass,
  cross-tenant data exposure, RCE, secret leakage) are prioritized for a fix
  within days; lower-severity issues are scheduled into regular work.
- We'll credit you in the fix (commit/release notes) if you'd like, unless
  you prefer to stay anonymous.

### Scope

In scope:

- This repository's application code (`src/`, `supabase/migrations/`,
  API routes, server actions)
- Authentication, authorization and Row Level Security (RLS) policies
- Multi-tenant data isolation (organizations/clients/invoices/quotations)
- Payment and webhook handling

Out of scope:

- Findings that require physical access to a user's device
- Social engineering / phishing of maintainers or users
- Denial-of-service via volumetric/flooding attacks
- Issues in third-party services we depend on (Supabase, Vercel, Razorpay,
  Resend) — please report those directly to the respective vendor
- Missing security headers or best-practice suggestions with no
  demonstrated exploit (feel free to open a normal issue for these instead)

## Handling secrets

If you find a **leaked credential or secret** (API key, service role key,
webhook secret, etc.) committed to this repository or exposed by a
deployed endpoint, treat it as critical and report it immediately via the
private channels above — do not attempt to use it beyond confirming it is
live.
