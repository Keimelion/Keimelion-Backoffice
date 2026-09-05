---
name: build-feature
description: Orchestrates the Dev → Lead Dev → DevOps → Tester pipeline for a Backoffice Notion ticket. A triage step routes low-risk tickets through a slim Dev → Tester pipeline. Reviewers fix issues directly — no feedback loops back to Dev.
argument-hint: <Notion ticket URL or ID>
---

# Workflow: Build Feature (Backoffice)

**Backlog kanban**: `66c4450ed2d04ad68c1b06e522169e6c`

Implement and validate the ticket: **$ARGUMENTS**

**Language**: all output must be in English — code, commit messages, PR titles and descriptions, Notion updates, GitHub comments.

## Commit + PR title convention

Every commit that ships the ticket AND the PR title must follow this pattern — same rule as the API repo, adapted to the Backoffice (which has routes and features instead of endpoints):

```
<type>: <identifier> <short description> (<TICKET-ID>)
```

- `<type>` — Conventional Commits: `feat` | `fix` | `refactor` | `chore` | `docs` | `perf` | `test` | `style` | `build` | `ci`. No scope in parens.
- `<identifier>` — the primary thing the ticket touches. Pick the most specific form that fits:
  - **Route path** for page work: `/login`, `/users`, `/lists`
  - **Component or feature name** when no dedicated route: `LoginForm`, `Sidebar`, `RequireAuth`
  - **Folder or module path** for infra/refactor work: `_client`, `_auth-storage`, `middleware`, `styles/tokens`
- `<short description>` — plain sentence, no period, no filler ("wire", "add", "fix", "extract"…)
- `<TICKET-ID>` — always at the end in parens: `(KEI-N)`

Examples:
- `feat: /login wire login form + client-side auth guard (KEI-41)`
- `feat: /users list all Keimelion accounts (KEI-42)`
- `fix: /products broken filter on category (KEI-43)`
- `refactor: _auth-storage consolidate saveSession + role cookie (KEI-44)`
- `chore: styles/tokens drop unused brand colors (KEI-45)`

Follow-up / intra-branch commits (fixing review feedback, DevOps fixes, etc.) also follow the pattern; keep the identifier consistent with the parent PR when possible:
- `fix: /login clear password field on error (KEI-41)`

**Valid Notion statuses** (exact values, case-sensitive):
`Todo` | `In Progress` | `In Review` | `Done` | `Validated`

**Status flow**: `Todo` → `In Progress` → `In Review` → `Validated`

All review stages (Lead Dev, DevOps, Tester) leave the ticket at `In Review` until the Tester validates. Only the Tester moves it to `Validated`. Reviewers fix issues directly on the branch — no feedback loops back to Dev.

## Pipeline lanes

Two lanes exist. The lane is decided in Step 0.5 and cannot be changed mid-run.

- **FULL** (default): Dev → Lead Dev → DevOps → Tester
- **SLIM**: Dev → Tester (skips Lead Dev and DevOps)

---

## Step 0 — Context fetch and dependency check (YOU do this, before delegating to any agent)

Fetch the ticket **$ARGUMENTS** yourself using your Notion MCP tools and store its full content (description, acceptance criteria, technical notes, status, all comments).

**Repo check**: confirm the ticket's `Repo` property is `BackOffice`. If it targets `API`, `Frontend`, or `Extension`, stop and inform the user — the wrong build-feature skill was invoked.

**Dependency check**: if the ticket has entries in "Blocked By", fetch each of those tickets and check their status. If any dependency is neither `Done` nor `Validated`:
- Leave a comment listing which dependencies are not yet done/validated and their current status
- **Stop the pipeline** and inform the user — do not proceed with implementation

Pay special attention to **API dependencies**: a Backoffice ticket often consumes an API endpoint that must exist first. If the blocking API ticket is not yet Done/Validated, the Backoffice ticket cannot proceed even if the frontend work is straightforward.

---

## Step 0.5 — Triage: choose the pipeline lane (YOU do this)

Based on the ticket content (description, acceptance criteria, technical notes) and a quick read of the files it is likely to touch, classify the ticket.

**Route to SLIM only if ALL of the following are true:**
- No new page or route added (`src/app/**/page.tsx`, `src/app/**/layout.tsx`, `src/app/**/route.ts`) — only behaviour changes to existing screens, refactors, or bug fixes
- No changes to authentication, session handling, or the auth cookie/localStorage strategy (`src/features/auth/`, `src/lib/api-client.ts` auth headers)
- No new data-access module or new API endpoint consumed (`src/data-access/**`)
- No handling of PII, tokens, or secrets in form state or client-side storage
- No changes to `next.config.ts`, `middleware.ts`, security headers, or CSP
- No new `NEXT_PUBLIC_*` env var introduced
- No changes to the QueryClient config or global providers (`src/lib/query-client.ts`, root layout providers)
- No new global state / context / provider
- No shadcn primitive added or `components/ui/**` modification
- No new third-party dependency in `package.json`
- Expected diff is small (roughly < 100 lines of production code)

**Otherwise route to FULL.** When in doubt, choose FULL — the slim lane is an optimisation, not a shortcut.

Record the decision:
- Post a Notion comment on the ticket: `Pipeline lane: SLIM` or `Pipeline lane: FULL` with a one-line justification (which criterion pushed it to FULL, or a confirmation of all slim criteria).
- Store the lane — it is referenced in Steps 2 and 3.

---

## Step 1 — Dev: Implementation

Delegate to the Dev agent. Pass:
- The full ticket content (from Step 0)

Dev agent tasks:
- **Sync `dev` first** — run `git fetch origin dev` then `git checkout dev && git merge --ff-only origin/dev`. If the fast-forward fails (local `dev` has diverged), stop and report — do NOT force-update or rebase without explicit user approval.
- Create a branch following the naming convention, from the up-to-date `dev`
- Read existing files (feature folders, sibling pages, shared components) to understand patterns before writing any code
- Implement in order: `data-access` → hooks → components → page wiring
- Run `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build` — all must be clean
- Smoke-test manually in the browser (start `npm run dev`, walk the feature, kill the server)
- Commit and push the branch, then create a PR targeting `dev` with `gh pr create --base dev`. Commit messages and the PR title must follow the **Commit + PR title convention** documented at the top of this skill.
- Update ticket status → `In Review`, update the **"PR URL"** field, leave a comment with the PR URL and all files created/modified

**Capture** (concise — bullet points only): branch name, PR URL, files created/modified, new shadcn primitives added (if any), new dependencies (if any).

---

## Step 2 — Lead Dev: Code Review

**FULL lane only.** If the lane recorded in Step 0.5 is SLIM, skip this step and continue to Step 4.

Before delegating, YOU (the orchestrator) read all files listed in the Dev summary using your Read tool and include their full contents inline in the prompt. This avoids the Lead Dev agent re-reading them from scratch and reduces token consumption.

Delegate to the Lead Dev agent. Pass:
- Ticket acceptance criteria and technical notes if available (from Step 0)
- Dev summary from Step 1
- Full contents of every file created/modified (read by you in the step above)

Lead Dev agent tasks:
- Review the provided file contents against the project standards checklist (no need to re-read files) — pay special attention to Server/Client boundaries, TanStack Query patterns, loading/empty/error states, and prop-drilling vs composition
- Run `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build`
- Produce a structured review report (✅ positives / ⚠️ suggestions / ❌ blockers)
- Update the Notion ticket with the report and one of two outcomes:

**If APPROVED** → leave status at `In Review`, leave a comment "Lead Dev approved — ready for DevOps review", continue to Step 3

**If CHANGES REQUIRED** → fix the blocking issues directly, re-run checks, commit and push. The commit message must follow the **Commit + PR title convention** — reuse the same identifier as the parent PR, e.g. `fix: /login clear password field on error (KEI-41)`. Then leave status at `In Review`, leave a comment "Lead Dev approved (after fixes) — ready for DevOps review" listing what was changed, continue to Step 3

**Capture** (concise — bullet points only): verdict, files modified (if any), key issues found/fixed.

---

## Step 3 — DevOps: Security & Integrity Review

**FULL lane only.** If the lane recorded in Step 0.5 is SLIM, skip this step and continue to Step 4.

Delegate to the DevOps agent. Pass:
- Ticket acceptance criteria and technical notes if available (from Step 0)
- Dev summary from Step 1
- Lead Dev summary from Step 2

DevOps agent tasks:
- Review security (XSS, CSRF, secret exposure, auth token handling, open redirects), client-cache data integrity (query keys, invalidation, cross-user cache leak on logout), and deployment readiness (`npm run build` succeeds, no leftover `console.log`, all env vars documented)
- Run `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build`
- Produce a structured DevOps review report
- Update the Notion ticket with one of two outcomes:

**If APPROVED** → leave status at `In Review`, leave a comment "DevOps approved — ready for testing", continue to Step 4

**If ISSUES FOUND** → fix the issues directly, re-run checks, commit and push. Commit message follows the **Commit + PR title convention** with the parent PR's identifier, e.g. `fix: _client harden 401 handling (KEI-41)`. Then leave status at `In Review`, leave a comment "DevOps approved (after fixes) — ready for testing" listing what was changed, continue to Step 4

**Capture** (concise — bullet points only): verdict, files modified (if any), key issues found/fixed.

---

## Step 4 — Tester: Final Validation

Delegate to the Tester agent. Pass:
- Ticket acceptance criteria (from Step 0)
- Dev summary from Step 1 (pages, features, files)
- The pipeline lane (SLIM or FULL) recorded in Step 0.5

Tester agent tasks:
- Run `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build`
- Manually test each screen in a browser (happy path + error cases + edge cases + UX states: loading / empty / error)
- Check every acceptance criterion
- **If lane is SLIM**: also verify that the actual diff still matches the slim criteria (no new page, no auth change, no new API integration, no security-sensitive surface, no new dependency). If it does not, stop, leave a Notion comment `Slim lane misclassified — re-run with FULL lane` and do NOT validate.
- Produce a structured test report
- Update the Notion ticket with one of two outcomes:

**If VALIDATED** → update status to `Validated`

**If BUGS FOUND** → fix the bugs directly, re-run browser walk-through + static checks, commit and push. Commit message follows the **Commit + PR title convention** with the parent PR's identifier, e.g. `fix: /login toast keeps showing after retry (KEI-41)`. Then status → `Validated`, leave a comment with the test report listing what was fixed

---

## Final Summary

Once the pipeline completes, present:
1. Notion ticket final status
2. Pipeline lane used (SLIM or FULL)
3. PR URL (ready to merge into `dev`)
4. Branch name and files created/modified
5. Commits added per stage (Dev, Lead Dev if FULL and fixes, DevOps if FULL and fixes, Tester if fixes)
6. Static-check results + browser smoke summary
