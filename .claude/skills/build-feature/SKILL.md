---
name: build-feature
description: Ships a Backoffice Notion ticket end-to-end via the single senior Dev agent. The Dev owns implementation + self-review + smoke test + validation on one pass — no separate Lead Dev, DevOps, or Tester agent.
argument-hint: <Notion ticket URL or ID>
---

# Workflow: Build Feature (Backoffice)

**Backlog kanban**: `66c4450ed2d04ad68c1b06e522169e6c`

Ship the ticket: **$ARGUMENTS**

**Language**: all output must be in English — code, commit messages, PR titles and descriptions, Notion updates, GitHub comments.

**Valid Notion statuses** (exact values, case-sensitive):
`Todo` | `In Progress` | `In Review` | `Done` | `Validated`

**Status flow**: `Todo` → `In Progress` → `In Review` → `Validated`

The Dev agent owns every stage. It does not hand off to a Lead Dev / DevOps / Tester agent — those hats are worn by the same Dev in the same session.

## Notion access

All Notion interactions go through the local wrapper (Notion MCP is not used):

```bash
node scripts/notion/notion.mjs get-page <page-id>
node scripts/notion/notion.mjs set-status <page-id> "<status>"
node scripts/notion/notion.mjs set-property <page-id> "<field>" "<value>"
node scripts/notion/notion.mjs add-comment <page-id> "<text>"
```

Requires `NOTION_TOKEN` in the shell env.

## Commit + PR title convention

```
<type>: <identifier> <short description> (<TICKET-ID>)
```

- `<type>` — Conventional Commits: `feat` | `fix` | `refactor` | `chore` | `docs` | `perf` | `test` | `style` | `build` | `ci`
- `<identifier>` — the primary thing the ticket touches (route path, component name, or module path)
- `<short description>` — plain sentence, no period, no filler
- `<TICKET-ID>` — always at the end in parens: `(KEI-N)`

Examples:
- `feat: /login wire login form + client-side auth guard (KEI-41)`
- `feat: /users list all Keimelion accounts (KEI-42)`
- `refactor: _auth-storage consolidate saveSession + role cookie (KEI-44)`

Intra-branch fix-up commits reuse the parent PR's identifier: `fix: /login clear password field on error (KEI-41)`.

---

## Step 0 — Context fetch and dependency check (YOU, before delegating)

Fetch the ticket **$ARGUMENTS** yourself with the wrapper and store its full content:

```bash
node scripts/notion/notion.mjs get-page <page-id>
```

Extract: title, status, priority, epic, `Repo`, description, acceptance criteria, technical notes, files involved, PR URL, blocked-by, comments.

**Repo check**: confirm `Repo` is `BackOffice`. If it targets `API`, `Frontend`, or `Extension`, stop and inform the user — the wrong build-feature skill was invoked.

**Dependency check**: inspect the `blocked_by` array. If any entry is not `Done` or `Validated`:
- `add-comment` listing the blockers and their current status
- Stop the pipeline and inform the user — do not proceed with implementation

Pay special attention to API dependencies: a Backoffice ticket often consumes an API endpoint that must exist first. If the blocking API ticket is not yet Done/Validated, the Backoffice ticket cannot proceed.

---

## Step 1 — Delegate to the Dev agent

Delegate to the Dev agent. Pass in the prompt:
- The full ticket content (from Step 0) — title, description, acceptance criteria, technical notes, files involved
- Any comments on the ticket that add context
- The page ID (so the Dev can update Notion via the wrapper without another fetch)

The Dev agent then executes its full workflow (documented in `.claude/agents/dev.md`):
1. Sync `dev`, create the branch, mark ticket `In Progress`
2. Read existing patterns
3. Implement `data-access` → hooks → components → page wiring
4. **Self-review** against the merged Lead Dev + DevOps + Tester checklist
5. Run static checks (`npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build`)
6. Smoke-test in the browser against every acceptance criterion
7. Commit, push, open the PR
8. Mark `In Review` + attach PR URL + Files Involved on the ticket
9. Mark `Validated` + post the test report as the final Notion comment

The Dev is expected to fix issues found in its own self-review directly, on the same branch, in the same session — there is no separate reviewer to bounce back to.

---

## Final Summary

Once the pipeline completes, present:
1. Notion ticket final status (must be `Validated`)
2. PR URL (ready to merge into `dev`)
3. Branch name and files created/modified
4. Static-check results + browser smoke summary
5. Any items the Dev flagged as follow-ups (out-of-scope refactors, tech debt) — the user decides whether to file a new ticket
