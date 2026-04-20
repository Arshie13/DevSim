# Onboarding Tutorial Feature

## Overview

A tutorial system that guides users through a stack before they work on a real project. Think of it like a game tutorial — you learn the controls before playing a real match.

The tutorial runs in a **separate project instance** from the real workspace.

For each stack, tutorials run from a dedicated tutorial image. When a tutorial starts, that image is mounted to a tutorial container and the full tutorial runs there. The real project workspace container is only created after tutorial completion.

Implementation status: **live** (PERN, NestJS + Postgres + Prisma)

---

## User Flows

### New User

```
Select Stack
  → Select Scenario
  → [New User Detected]
  → Tutorial opens automatically (required)
  → Finish Tutorial Modal: "Ready? Proceed to the real workspace."
  → Workspace
    → Crash Course
    → Practical Tasks
```

### Existing User (Trying a New Stack)

```
Select Stack
  → Select Scenario
  → [Existing User Detected]
  → Prompt: "Want to take a tutorial before starting?"
  → [User enables tutorial]
  → Tutorial opens
  → Finish Tutorial Modal: "Ready? Proceed to the real workspace."
  → Workspace
    → Crash Course
    → Practical Tasks
```

---

## Rules

| Condition | Tutorial Required? |
|---|---|
| New account (first time ever) | ✅ Yes — mandatory |
| First project for a specific stack | ✅ Yes — mandatory |
| Existing user, same stack they've used | ❌ No — optional |
| Existing user, new/different stack | ⚠️ Optional — prompted |

Mandatory vs. optional is controlled by the `tutorialRequired` URL param (`?tutorialRequired=1`) passed from scenario selection. When `tutorialRequired=1`, the tutorial's "Skip Tutorial" button is hidden (`allowSkip=false`).

---

## Detection Logic

Tutorial requirement is determined by `hasCompletedTutorial` (a boolean on the `User` model). When `false`, the tutorial is required for new users. The server-side logic checks this field and passes `tutorialRequired=1` in the URL when needed.

| Field | Type | Purpose |
|---|---|---|
| `hasCompletedTutorial` | `Boolean @default(false)` | Whether the user has ever completed any tutorial |

When the tutorial sprint is submitted, `POST /api/user/onboarding` sets `hasCompletedTutorial = true` on the user record. Subsequent logins skip the mandatory tutorial gate.

---

## Tutorial Instances

- Each stack has its **own unique tutorial** — tutorials are not shared across stacks.
- Tutorial content, tasks, and flow are specific to the stack being used.
- A user who has completed Tutorial A (Stack A) will still see Tutorial B when starting Stack B for the first time.
- Tutorial and real workspace must use separate containers and separate source context.

### PERN Tutorial Source

- Tutorial source: `submodules/projects/tech-stacks/react-express-postgres-prisma/tutorial/`
- PERN tutorial containers mount content from this tutorial source.
- Uses a dedicated prebuilt **to-do-list tutorial image** as the base runtime.

### NestJS + Postgres + Prisma Tutorial Source

- Tutorial source: `submodules/projects/tech-stacks/nestjs-postgres-prisma/tutorial/TO_DO_LIST/`
- Project: A minimal NestJS REST API for managing todos, with Prisma ORM and PostgreSQL.
- NestJS tutorial containers mount content from this tutorial source.
- Tutorial tasks:
  - **Task 1 — Prepare Development Environment**: install dependencies, copy `.env`, generate Prisma client, run migrations, seed database, start dev server.
  - **Task 2 — Add Priority Field to Todo**: edit `prisma/schema.prisma` to add `priority Int @default(0)`, stop the server, run a named migration, restart the dev server.

---

## Tutorial Completion

When a user finishes a tutorial, a modal appears:

> **"Tutorial Complete!"**
> You've finished the tutorial for [Stack Name].
> Proceed to the real workspace when you're ready.

**Actions:**
- **Proceed to Workspace** — starts the actual project
- **Replay Tutorial** — lets user go through the guided steps again from the beginning (does not re-show the welcome intro modal)

### Container Lifecycle (Tutorial Flow)

1. Start tutorial container from the stack's tutorial image.
2. Run full tutorial inside that tutorial container (guided by the stack's `*Tutorial.svelte` step system).
3. User completes and submits the sprint (`SubmitSprintModal`).
4. `handleTutorialCompleted()` is called — tutorial container is **destroyed** via `DELETE /api/docker/container/:id/destroy`.
5. Completion modal appears with "Proceed to Workspace" and "Replay Tutorial".
6. On "Proceed to Workspace", `proceedToWorkspace()` creates the real workspace container from normal project flow and navigates to `/workspace/:newContainerId?fromTutorial=1`.

---

## Feature Specs

### Tutorial Instance
- Mirrors the main workspace UI
- Runs in isolation — no real project data is affected
- Stack-specific content loaded dynamically based on selected stack

### Tutorial Runtime Separation Rules

- Tutorial flow must not reuse the real workspace container.
- Real workspace creation happens only after tutorial completion and user confirmation.
- Non-tutorial flow keeps existing behavior: create workspace container directly.

### Tutorial Stages (Happy Path) — PERN

1. **Board / Kanban** — Open Task 1, review requirements
2. **README** — Open and read setup guide
3. **Terminal** — `npm install` (root, client, server), `npx prisma generate`, `npx prisma migrate dev`, `npx prisma db seed`, `npm run dev`
4. **Preview** — Verify app is live
5. **Tests (Task 1)** — Run Task 1 tests, review results
6. **Board / Kanban** — Open Task 2, review requirements
7. **Search** — Locate `TodoPage.tsx`
8. **Editor** — Change page heading text, save file
9. **Preview (Task 2)** — Verify UI change
10. **Tests (Task 2)** — Run Task 2 tests, review results
11. **Submit Sprint** — Fill mastery reflection, select Frontend + Database layers, submit
12. **Finish** — Review completion modal, proceed to real workspace

### Tutorial Stages (Happy Path) — NestJS + Postgres + Prisma

1. **Board / Kanban** — Open Task 1, review requirements
2. **README** — Open and read setup guide
3. **Terminal** — `npm install`, `cp .env.example .env`, `npx prisma generate`, `npm run prisma:migrate`, `npm run prisma:seed`, `npm run dev`
4. **Preview** — Verify API responds at `/api/todos`
5. **Tests (Task 1)** — Run Task 1 tests, review results
6. **Board / Kanban** — Open Task 2, review requirements
7. **Search** — Search for `"completed Boolean"` to locate `prisma/schema.prisma`
8. **Editor** — Add `priority Int @default(0)` field to Todo model, save file
9. **Terminal** — Press Ctrl+C to stop server, `npx prisma migrate dev --name add-priority-to-todo`, `npm run dev`
10. **Preview (Task 2)** — Verify API still responds with priority field
11. **Tests (Task 2)** — Run Task 2 tests, review results
12. **Submit Sprint** — Fill mastery reflection, select Backend + Database layers, submit
13. **Finish** — Review completion modal, proceed to real workspace

Full step definitions live in the stack's `*TutorialData.ts` (`STEPS` array). The generic engine is in `TutorialHelper.svelte`.

---

## Implementation

| File | Role |
|---|---|
| `src/lib/components/tutorial/TutorialHelper.svelte` | Generic reusable tutorial engine — spotlight, callout panel, all step logic and UI. Stack-agnostic; accepts any `TutorialStep[]` and an optional `onPrepareStep` callback for stack-specific side effects. |
| `src/lib/components/tutorial/tutorialTypes.ts` | Shared `TutorialStep` interface used by `TutorialHelper` and all stack tutorial data files. |
| `src/lib/components/tutorial/PERN/PERNTutorial.svelte` | Thin PERN wrapper — passes `STEPS` and PERN-specific `onPrepareStep` to `TutorialHelper`. |
| `src/lib/components/tutorial/PERN/PERNTutorialData.ts` | PERN step definitions (`STEPS`), task data (`getTutorialWorkspaceData`), and re-exports `TutorialStep` as `InteractiveStep`. |
| `src/lib/components/tutorial/NESTJS_POSTGRES_PRISMA/NestjsPostgresPrismaTutorial.svelte` | NestJS wrapper — passes `STEPS` and NestJS-specific `onPrepareStep` to `TutorialHelper`. |
| `src/lib/components/tutorial/NESTJS_POSTGRES_PRISMA/NestjsPostgresPrismaTutorialData.ts` | NestJS step definitions (`STEPS`), task data (`NESTJS_POSTGRES_PRISMA_TUTORIAL_DATA`). |
| `src/lib/components/onboarding/OnboardingController.svelte` | Wrapper that selects and renders the correct stack tutorial based on `stackKey`. |
| `src/routes/tutorial/[containerId]/+page.svelte` | Tutorial workspace page — boots container, renders workspace UI + `OnboardingController`. Detects stack type to pick the right tutorial data and type. |
| `src/routes/tutorial/[containerId]/+page.server.ts` | Server load — validates container is tutorial status, redirects otherwise. |

## Adding a New Stack Tutorial

To add a tutorial for a new stack (e.g. MERN, T3):

1. Create `src/lib/components/tutorial/<STACK>/<STACK>TutorialData.ts` — define your `TutorialStep[]` array and workspace data. Import `TutorialStep` from `$components/tutorial/tutorialTypes`.
2. Create `src/lib/components/tutorial/<STACK>/<STACK>Tutorial.svelte` — import `TutorialHelper` and pass your steps plus an `onPrepareStep` callback for any stack-specific DOM side effects (opening panels, dispatching custom events, etc.).
3. Register the new tutorial in `OnboardingController.svelte`:
   - Add a `$: isYourStack = stackKey === 'your-stack-key'` reactive declaration.
   - Extend `resolvedStackTutorialType` to return `'your-stack'` for that key.
   - Add an `{:else if resolvedStackTutorialType === 'your-stack'}` branch rendering your component.
   - Update the `stackTutorialType` prop type to include `'your-stack'`.
4. Update `src/routes/tutorial/[containerId]/+page.svelte`:
   - Import your tutorial data export.
   - Extend the `tutorialData` picker to return your data when the stack name includes your keyword.
   - Extend the `tutorialStackType` type and detection regex/condition.

---

## Out of Scope (For Now)

- Tutorial progress saving mid-session
- Tutorial skipping for mandatory cases
- Admin-managed tutorial content

---

## Resolved Questions

- **Can a user re-take a tutorial?** Yes — via the "Replay Tutorial" button in the completion modal.
- **Is there a time limit or step requirement?** No hard requirement. Completion is triggered by sprint submission.
- **Who manages tutorial content per stack?** Developers update the stack's `*TutorialData.ts` — the `STEPS` array and task builder functions. Generic engine behavior lives in `TutorialHelper.svelte`.
