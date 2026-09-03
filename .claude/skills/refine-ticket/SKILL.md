---
name: refine-ticket
description: Collaborative refinement of a Backoffice ticket — the PO, Lead Dev, DevOps, and Dev discuss a Notion ticket together to clarify requirements, identify edge cases, agree on technical approach, and update the ticket with a refined spec before implementation starts.
argument-hint: <Notion ticket URL or ID>
---

# Workflow: Refine Ticket (Backoffice)

**Backlog kanban**: `66c4450ed2d04ad68c1b06e522169e6c`
**Features spec**: `336355b4-4d03-8185-9406-c5b4502a20fe`
**MVP scope**: `336355b4-4d03-81d1-818e-e68530984a2a`
**Architecture**: `336355b4-4d03-81b6-8ab1-c89eddc63c1b`
**Conventions**: `336355b4-4d03-81a2-97e6-f9fc18df0d87`

Run a refinement session for ticket: **$ARGUMENTS**

**Language**: all output must be in English — ticket descriptions, acceptance criteria, technical notes, Notion comments.

Each agent reviews the ticket from their own perspective, raises questions and concerns, and the ticket is updated with a complete, unambiguous spec ready for implementation.

---

## Step 0 — Context fetch and dependency check (YOU do this, before delegating to any agent)

Fetch the following pages yourself using your Notion MCP tools and store their full content:
1. The ticket: **$ARGUMENTS**
2. Features spec: `336355b4-4d03-8185-9406-c5b4502a20fe` — for PO only
3. MVP scope: `336355b4-4d03-81d1-818e-e68530984a2a` — for PO only
4. Architecture: `336355b4-4d03-81b6-8ab1-c89eddc63c1b` — for Lead Dev and Dev only
5. Conventions: `336355b4-4d03-81a2-97e6-f9fc18df0d87` — for Lead Dev and Dev only

**Repo check**: confirm the ticket's `Repo` property is `BackOffice`. If it targets `API`, `Frontend`, or `Extension`, stop and inform the user — the wrong refine-ticket skill was invoked.

**Dependency check**: if the ticket has entries in "Blocked By", fetch each of those tickets and check their status. If any dependency is not `Done` or `Validated`:
- Leave a comment listing which dependencies are not yet done and their current status
- **Stop the refinement** and inform the user — a ticket cannot be refined if its dependencies are not yet implemented

Pay special attention to **API dependencies**: a Backoffice ticket often consumes an API endpoint. If the required endpoint is not implemented yet, refinement should stop until the API side lands.

Each agent receives only the pages relevant to their role (see steps below) — **no agent should call notion-fetch or notion-search**.

---

## Step 1 — PO: Requirements review

Delegate to the PO agent. Pass:
- The full ticket content (from Step 0)
- The features spec and MVP scope content (from Step 0)

PO agent tasks:
- Assess clarity of the description and acceptance criteria:
  - Are the acceptance criteria complete, measurable, and testable from a browser-observable perspective?
  - Is the scope clear — what is IN and what is OUT?
  - Are there missing business rules or undefined edge cases?
  - Which API endpoint(s) does the feature consume, and are they ready?
- Produce a list of open questions and clarifications
- Do NOT modify the ticket yet — only report findings

**Capture** (concise — bullet points only): open questions, scope concerns, missing acceptance criteria, API endpoints consumed.

---

## Step 2 — Lead Dev: Technical review

Delegate to the Lead Dev agent. Pass:
- The full ticket content (from Step 0)
- The architecture and conventions content (from Step 0)
- PO summary from Step 1

Lead Dev agent tasks:
- Assess technical feasibility and approach:
  - Which files need to be created or modified (`data-access`, hooks, components, page)?
  - Are there Server/Client boundary decisions to lock in now?
  - Which shadcn primitives are needed — any missing?
  - Does this touch shared components or providers that could ripple through the app?
  - Are the acceptance criteria technically testable in a browser?
  - Are there missing technical constraints (validation rules, error states, TanStack Query invalidation targets)?
- Produce a technical assessment and a proposed implementation approach
- Raise any blocking questions or dependencies

**Capture** (concise — bullet points only): proposed implementation approach, files to create/modify, Server/Client boundary plan, architectural concerns, blocking questions.

---

## Step 3 — DevOps: Security & Infra review

Delegate to the DevOps agent. Pass:
- Ticket acceptance criteria and technical approach (from Step 0)
- Lead Dev summary from Step 2 (proposed approach and files)

DevOps agent tasks:
- Identify security and infra constraints upfront:
  - Does this feature introduce new user inputs that need Zod validation?
  - Are there sensitive fields (tokens, PII) in form state or cache — how are they handled?
  - Are there new `NEXT_PUBLIC_*` env vars needed — is any of them secret-adjacent?
  - Are there auth or permission requirements (protected route, admin-only)?
  - Does the flow include any redirect that could become an open-redirect risk?
  - Any CSP or `next.config.ts` change needed (new external image domain, script source)?
- Produce a list of security/infra constraints and recommendations to include in the spec
- Do NOT modify the ticket yet — only report findings

**Capture** (concise — bullet points only): security constraints, validation rules, auth requirements, env vars, redirect concerns.

---

## Step 4 — Dev: Implementation review

Delegate to the Dev agent. Pass:
- The full ticket content (from Step 0)
- The architecture and conventions content (from Step 0)
- Lead Dev summary from Step 2
- DevOps summary from Step 3

Dev agent tasks:
- Review the proposed implementation approach:
  - Is it consistent with existing patterns in the codebase?
  - Are there simpler or more idiomatic ways to implement it (existing shared components, existing hooks)?
  - Identify any missing details needed to start coding without ambiguity
- Estimate complexity: Simple / Medium / Complex
- Flag anything that would block implementation

---

## Step 5 — User validation (REQUIRED before updating the ticket)

Before touching the Notion ticket, present a consolidated summary to the user:

- **PO findings**: key questions, scope concerns, API dependencies
- **Lead Dev assessment**: proposed implementation approach, Server/Client boundaries, dependencies
- **DevOps constraints**: security, validation, auth, env vars, redirect handling
- **Dev review**: complexity estimate, missing details, implementation blockers
- **Open questions**: anything unresolved that the user needs to answer

Then ask the user:
1. Do you agree with the proposed approach?
2. Are there any open questions you can answer now?
3. Anything to add or change before the ticket is updated?

**Wait for the user's response before proceeding to Step 6.** Incorporate their answers into the final update.

---

## Step 6 — Synthesis and ticket update

Based on all four perspectives and the user's input, update the Notion ticket with:

**Refined description** — clear, complete, unambiguous

**Acceptance criteria** — each criterion must be:
- Written as a testable statement from the user's perspective in the browser ("Given X, when Y, then Z")
- Covering the happy path, error cases, and UX states (loading / empty / error)

**Technical approach** — agreed implementation plan:
- Files to create/modify following the layered structure (`data-access` → hooks → components → page)
- Server/Client boundary decisions
- Which shadcn primitives to add/reuse
- TanStack Query invalidation targets
- Any constraints or warnings

**Security & infra constraints** — from the DevOps review:
- Validation rules, sensitive fields, auth requirements, env vars, redirect handling

**Open questions** — if any questions remain unresolved, list them explicitly with the name of whoever needs to answer them

**Status update** — only if the current ticket status is `Todo` or has no status set, update it to `Todo` to signal it is ready for implementation. If the ticket is already in any other status (e.g. `In Progress`, `In Review`), leave the status unchanged.

Leave a comment: "Refinement completed on [date] — ticket is ready for implementation." and include any key decisions made by the user during the validation step.

---

## Output

Present a summary of:
1. Key decisions made during refinement
2. Security/infra constraints identified by DevOps
3. Open questions still pending (if any)
4. Link to the updated Notion ticket
