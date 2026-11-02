# Security Policy

## Reporting a vulnerability

If you believe you have found a security vulnerability in this repository, **do not open a public GitHub issue**.

Instead, use GitHub's private vulnerability reporting:

1. Go to the **Security** tab of this repository.
2. Click **Report a vulnerability**.
3. Fill in the form with as much detail as possible: reproduction steps, affected routes, impact, and your assessment.

You can also email the maintainer directly at `pro.pierson.alban@gmail.com` with `[SECURITY] Keimelion-Backoffice` in the subject line.

We will acknowledge your report within **3 business days** and provide a status update within **10 business days**. Once a fix is released, we will credit you (unless you prefer to stay anonymous) in the release notes and the GitHub security advisory.

## Scope

In scope:

- The Backoffice web application (this repo).
- Authentication, authorization, session handling, and CSRF defenses.
- Dependencies with a known CVE that is reachable from production code.
- Any route under `/(dashboard)` and `/(auth)` route groups.

Out of scope:

- The Keimelion REST API — report issues there to the API repository.
- Rate limiting at the infrastructure layer (CDN, reverse proxy).
- Vulnerabilities that require physical access to the user's device.
- Issues in third-party services (Notion, GitHub Actions runners, etc.).
- Automated scanner output without a working proof of concept.

## Supported versions

Only the `main` branch receives security fixes. The `dev` branch is actively developed and may contain unreleased vulnerabilities.

## Hardening already in place

- HTTP security headers (HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`).
- CI blocks merges that fail lint, typecheck, tests, or build.
- Dependabot alerts and secret scanning are enabled.
- CodeQL static analysis runs on every PR and weekly on `dev`.
- Session cookie uses `SameSite=Lax` and `Secure` when served over HTTPS.
