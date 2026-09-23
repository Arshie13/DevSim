# DevSim UI/UX Redesign — Plan

> **Historical document.** This plan records how the token, typography and neon work was
> carried out. It is **not** authoritative — `docs/ui_ux.md` is the living design system
> and supersedes it. Light mode was cancelled and is no longer planned.

**Status:** Stages 1–2 delivered
**Branch:** `style/enhance-ui`
**Scope:** Typography, neon reduction, token centralization, design docs

## Goal

1. Replace the current typography with a readable font system.
2. **Reduce** (not remove) the neon/cyber styling so the UI is calmer and friendlier.
3. Centralize design tokens and textures so they reach every screen.
4. Produce `docs/ui_ux.md` as a durable design system guide.

---

## Findings That Drive This Plan

These are verified facts, not assumptions:

- **`src/app.html` loads only three fonts**: Chakra Petch, Exo 2, Space Mono. No `@font-face`, nothing self-hosted.
- **151 references point at fonts that are never loaded**: `'Orbitron'` (67 refs across 30 files) and `'Share Tech Mono'` (84 refs across 29 files). Every one of these silently falls back to a generic system font — this is very likely the real cause of the "hard to read" complaint. `tailwind.config.ts` quietly aliases the `orbitron`/`rajdhani` *utilities* to loaded fonts, but inline `style="font-family:'Orbitron'"` usages are not covered and are genuinely broken.
- **447 `font-family` declarations across 70 files** — massive duplication, many bypassing tokens.
- **`DisclaimerModal.svelte:122`** reads `var(--font-head, ...)` — a typo for `--font-heading`, so it always uses the fallback.
- **`tailwind.config.ts` colors and `boxShadow` are static hex** — so `bg-obsidian-*` / `text-cyber-*` utility classes could not be token-driven.
- **Textures are duplicated locally**: `pretest` and `postassessment` re-declare `.bg-grid-cyber` / `.scanlines` / `.ambient-glow`; `leaderboards:469` and `rivals:143` override `.scanlines::before`; `scenario:79`, `stacks:247`, `StackSummary:323`, `StackInfoModal:573`, `PreviewImages:373` define their own `.bg-scanlines` / `.modal-scanlines`. 21 declarations across 9 files.
- **`TerminalInitializer.ts:58`** hardcodes an inline dark xterm theme; **line 41** already requests `JetBrains Mono`, which is also never loaded.
- **`Header.svelte` appears on only 7 routes** (dashboard, projects, stacks, scenario, rivals, leaderboards, marketplace/coins).

### Resolved since this plan was written

These findings were accurate when written but are now fixed:

- `DisclaimerModal.svelte:122` — now correctly reads `var(--font-heading)`.
- `admin/+layout.svelte:25` — now correctly uses `var(--bg)`; `--bg-primary` no longer appears anywhere.
- The grid wrappers carry `opacity-60` / `opacity-70`, **not** the `opacity-30` / `opacity-35`
  stated below. Effective grid alpha is `--grid-line` multiplied by the wrapper opacity.

---

## Locked Decisions

| Decision | Choice |
| --- | --- |
| Refactor depth | Full token migration |
| Fonts | Inter (body + headings), JetBrains Mono (mono/labels) |
| Hierarchy | Inter for both; headings differ by weight (600–700) + tracking |
| Neon | Reduce, do not remove — "visible but soft" |
| Textures | Centralize into `app.css`, delete local copies |
| Docs | Full design system guide at `docs/ui_ux.md` |
| Rollout | 3 staged commits; docs committed last |

---

## Stage 1 — Tokens & Typography

**Files:** `src/app.css`, `src/app.html`, `tailwind.config.ts`, plus a sweep across ~70 component files.

1. **`src/app.css` `:root`** — re-point font tokens:
   - `--font-body: 'Inter', system-ui, sans-serif`
   - `--font-heading: 'Inter', system-ui, sans-serif`
   - `--font-mono: 'JetBrains Mono', ui-monospace, monospace`

2. **`src/app.html`** — replace the Google Fonts link with Inter + JetBrains Mono (weights 400/500/600/700, `display=swap`, Latin subset). Keep both `preconnect` hints. This removes three families and adds two, so payload roughly holds.

3. **`tailwind.config.ts`**:
   - Re-point `heading`, `orbitron`, `rajdhani`, `body` → Inter; `mono` → JetBrains Mono. Keeping the alias names means no markup has to change for utility-class usages.
   - **Convert the palette to CSS-var backed.** Add channel-triplet companion tokens in `app.css` (`--bg-rgb: 10 14 26;` etc.) and point Tailwind at them: `'rgb(var(--bg-rgb) / <alpha-value>)'`. Keeping the existing hex vars (`--bg`, `--accent`, …) intact means direct `var(--accent)` usage in component styles keeps working.

4. **Font sweep across components** — replace literal families with tokens:
   - `'Orbitron'` → `var(--font-heading)`
   - `'Share Tech Mono'` → `var(--font-mono)`
   - `'Rajdhani'` / `'Exo 2'` → `var(--font-body)`
   - `'Chakra Petch'` → `var(--font-heading)`, `'Space Mono'` → `var(--font-mono)`
   - Prefer the existing `font-heading` / `font-label` / `font-body` utility classes for class-based usage.
   - `TerminalInitializer.ts:41` already says JetBrains Mono — leave it, it becomes correct once loaded.

5. **Fix latent token bugs**: `DisclaimerModal.svelte:122` `var(--font-head, ...)` → `var(--font-heading, ...)`, and `admin/+layout.svelte:25` `var(--bg-primary)` → `var(--bg)`.

6. **Verification**: `grep` must return zero `Orbitron` / `Share Tech Mono` / `Rajdhani` / `Chakra Petch` / `Exo 2` references outside docs.

---

## Stage 2 — Neon Reduction ("visible but soft")

Apply these exact numbers (locked). Do **not** remove the elements.

| Element | Token / rule | From | To |
| --- | --- | --- | --- |
| Accent glow | `--accent-glow` (alpha) | 0.30 | 0.10 |
| Card hover | `--card-hover` (alpha) | 0.40 | 0.16 |
| Accent dim | `--accent-dim` (alpha) | 0.15 | 0.08 |
| Grid line | `--grid-line` (alpha) | 0.06 | 0.025 |
| Scanlines | `.scanlines::after` alpha | 0.015 | 0.008 |
| Ambient glow | `.ambient-glow::before` alpha | 0.08 | 0.03 |
| Button bevel | `.btn-cyber` clip-path | 8px | 6px |
| Button tracking | `.btn-cyber` letter-spacing | 0.12em | 0.06em |
| Tag tracking | `.tag-cyber` letter-spacing | 0.08em | 0.04em |

Also mirror in `tailwind.config.ts` `boxShadow`: `accent-glow` 0.30→0.10, `accent-glow-lg` 0.30→0.12, `accent-glow-hover` 0.40→0.16, `card-glow` 0.12→0.06, `card-glow-hover` 0.22→0.10.

Keep uppercase micro-labels, just with reduced tracking. Keep `translateY(-2px)` hover.

**Centralize textures.** Delete the local re-declarations and switch their markup to the shared `scanlines` / `bg-grid-cyber` / `ambient-glow` classes from `app.css`:

- `src/routes/pretest/+page.svelte` (~344–380)
- `src/routes/postassessment/+page.svelte` (~351–380)
- `src/routes/leaderboards/+page.svelte:469` (`:global(.scanlines::before)`)
- `src/routes/rivals/+page.svelte:143`
- `src/routes/scenario/+page.svelte:79` (`.bg-scanlines`)
- `src/routes/stacks/+page.svelte:247` (`.bg-scanlines`)
- `src/lib/components/stacks/StackSummary.svelte:323` (`.modal-scanlines`)
- `src/lib/components/stacks/StackInfoModal.svelte:573` (`.modal-scanlines`)
- `src/lib/components/scenario/PreviewImages.svelte:373` (`.scanlines`)

Note the inconsistency to reconcile: `app.css` defines `.scanlines::after`, while `leaderboards`/`rivals` override a `::before`. Consolidate to the single `::after` definition. `LoadingSteps.svelte:146` only applies the classes (does not redefine) — leave it, it inherits automatically.

Watch for compounding: several wrappers apply `bg-grid-cyber` with `opacity-30`/`opacity-35` (e.g. `TestSelectionModal:75`, `TestResultModal:92`, `TriviaModal:92`, `achievements:74`, `profile:143`, `rivals/[username]:150`). Lowering `--grid-line` compounds with these; bump the wrapper opacities if the grid disappears entirely.


## Verification

- `pnpm dev`, then walk the main routes: `/`, `/login`, `/dashboard`, `/projects`, `/stacks`, `/scenario`, `/leaderboards`, `/rivals`, `/profile`, `/admin/*`, `/workspace/[containerId]`, `/tutorial/[containerId]`.
- `pnpm check:design` passes — see `docs/ui_ux.md` §10.
- `grep` assertions: no `Orbitron`, `Share Tech Mono`, `Rajdhani`, `Chakra Petch`, or `Exo 2` outside `docs/`.
- `pnpm check` (svelte-check) and `pnpm validate` (tsc) pass.
- Quick axe / DevTools contrast check on dashboard, workspace, and login.

## Risks

- The ~151 broken font references mean typography will visibly change; that is the intended fix, but screenshots will differ significantly.
- The component sweep is large (~70 files); review per stage rather than as one diff.

## Addendum — Strict page container

After Stage 5, the nav (`Header`/`LandingNav`) and every in-scope page were moved onto a
shared `.page-container` class in `src/app.css` (`max-width: 1440px; margin-inline: auto;
padding-inline: 1.5rem`) so the logo and content left edges coincide exactly at every
viewport. `/stacks` (was `max-w-[1320px]`) and `/rivals/[username]` (was `max-w-[1400px]`)
were converged, and the landing page sections were aligned to the same container (narrower
reading columns keep their width via `max-w-*` overrides on the same element). The
authoritative spec is `docs/ui_ux.md` §8.
