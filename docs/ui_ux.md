# DevSim Design System

The single source of truth for UI consistency in DevSim. **Read this before editing any
component or route.** If a change here is not reflected in this document, the document is
wrong and should be updated in the same commit.

- `src/app.css` is the single source of truth for **tokens and textures**.
- `tailwind.config.ts` maps tokens to utility classes.
- This document is the single source of truth for **how to use them**.
- `docs/ui_ux_plan.md` is the historical implementation plan. It is
  **not** authoritative — this document supersedes it.

Run `pnpm check:design` before opening a UI pull request.

---

## 1. Scope

**In scope** (swept and held consistent):

`/` · `/login` · `/dashboard` · `/projects` · `/stacks` · `/scenario` · `/leaderboards` ·
`/rivals` · `/profile` · `/achievements` · `/pretest` · `/postassessment` ·
`/workspace/[containerId]` · `/tutorial/[containerId]` · `landing/*` · shared components in
`src/lib/components/**`

**Out of scope for sweeps**: `/admin/*`. Admin keeps its own layout and is not swept in this
pass. Note that changes to `app.css` and `tailwind.config.ts` are global, so admin inherits
tokens, the fluid scale and the grid regardless.

**Dark theme only.** There is no light theme, no `[data-theme]`, no theme toggle and no
theme persistence. Do not introduce them. Do not write `prefers-color-scheme` branches.
Everything in this document assumes the dark theme.

---

## 2. Colour tokens

All colour lives in `:root` in `src/app.css`. Never write a hex value or an `rgba()` literal
in a component.

### Base palette

| Token | Value | Use for |
| --- | --- | --- |
| `--bg` | `#0a0e1a` | Page background |
| `--bg-light` | `#12192a` | Card, panel and modal surfaces |
| `--surface` | `#2d3446` | Raised surface (inputs, wells) |
| `--border` | `#27272a` | Neutral structural borders |
| `--text-primary` | `#d0d7dd` | Body and heading text |
| `--text-muted` | `#8892a0` | Secondary text, captions, metadata |
| `--accent` | `#07a5c9` | Primary interactive colour |
| `--cyan-bright` | `#00f5ff` | Accent hover / emphasis only |
| `--success` | `#00e5a0` | Success, completion, positive deltas |
| `--warn` | `#ffb400` | Warnings, streaks, attention |
| `--danger` | `#ff3860` | Errors, destructive actions |
| `--purple` | `#a855f7` | Activity, AI, tertiary category |
| `--gold` | `#ffd700` | Rank / first place / leaderboard only |

Each colour also has a channel triplet for alpha-aware utilities:
`--bg-rgb`, `--bg-light-rgb`, `--surface-rgb`, `--border-rgb`, `--text-primary-rgb`,
`--text-muted-rgb`, `--accent-rgb`, `--cyan-bright-rgb`, `--success-rgb`, `--warn-rgb`,
`--danger-rgb`, `--purple-rgb`, `--gold-rgb`.

### How to apply a colour

```svelte
<!-- preferred: Tailwind utility, alpha-capable -->
<div class="bg-obsidian-bg-light text-obsidian-text-primary border-obsidian-accent/20">

<!-- correct: token reference -->
<div style="border-color: var(--card-border)">
<div class="text-[var(--success)]">

<!-- correct: token + alpha, for inline styles -->
<div style="border-color: rgb(var(--gold-rgb) / 0.15)">

<!-- WRONG: hardcoded, theme-dead, fails review -->
<div style="border-color: rgba(255, 215, 0, 0.15)">
<div class="text-[#00f5ff]">
```

**Never** use `--gold` or `--cyan-bright` as a general-purpose accent. `--gold` means rank,
`--cyan-bright` means emphasis on hover.

### Derived tokens

| Token | Value | Use for |
| --- | --- | --- |
| `--accent-glow` | `rgba(7,165,201,0.10)` | Shadows, glow |
| `--accent-dim` | `rgba(7,165,201,0.08)` | Faint accent fills |
| `--grid-line` | `rgba(7,165,201,0.04)` | Background grid (see §3) |
| `--card-border` | `rgba(7,165,201,0.15)` | Resting card border |
| `--card-hover` | `rgba(7,165,201,0.16)` | Card border on hover |

Neon is **present but soft**. Do not increase these values without changing this document.

---

## 3. Grid and texture

Three textures exist, all defined **only** in `src/app.css`. Apply them by class name and
never redeclare them in a component:

| Class | Effect |
| --- | --- |
| `.bg-grid-cyber` | Fixed cyan grid, `--grid-line` |
| `.scanlines` | `::after` scanline overlay |
| `.ambient-glow` | `::before` radial glow |

```svelte
<div class="min-h-screen bg-obsidian-bg bg-grid-cyber scanlines ambient-glow">
```

**Rules**

- Do not redeclare `.bg-grid-cyber`, `.scanlines` or `.ambient-glow` in a component's
  `<style>`. This was done historically in `pretest`, `postassessment`, `leaderboards`,
  `rivals`, `scenario`, `stacks`, `StackSummary`, `StackInfoModal` and `PreviewImages`.
  Delete local copies and use the shared classes.
- Do not override `.scanlines::before`. The shared definition uses `::after`.
- Grid **cells are `2.5rem`**, so density stays constant as the root font scales
  (`40px` at the 1920px reference, `32.5px` at 1280, `47.5px` at 2560).
- `--grid-line` is `0.04`. Wrapper opacity **multiplies** it, so the effective alpha is
  what you see:

| Wrapper | Effective alpha at 1920 |
| --- | --- |
| none (page roots) | `0.040` |
| `opacity-70` | `0.028` |
| `opacity-60` | `0.024` |

If a grid reads as invisible behind a modal, raise the wrapper opacity — do not raise
`--grid-line`, which is tuned for full-page backgrounds.

---

## 4. Typography

### Families

| Token | Family | Class | Use for |
| --- | --- | --- | --- |
| `--font-body` | Inter | `.font-body` | Body copy, descriptions, inputs |
| `--font-heading` | Inter | `.font-heading` | Page titles, headings, buttons |
| `--font-mono` | JetBrains Mono | `.font-label` | Labels, tags, code, numerics |

Headings and body are the **same family**, separated by weight and tracking — not by a
different typeface.

**Never** name a font family directly in a component. `'Orbitron'`, `'Share Tech Mono'`,
`'Rajdhani'`, `'Chakra Petch'` and `'Exo 2'` are retired and must not reappear.

```svelte
<!-- correct -->
<h2 class="font-heading text-xl font-semibold tracking-tight">
<span class="font-label text-xs uppercase tracking-[0.04em]">

<!-- WRONG -->
<h2 style="font-family: 'Orbitron'">
```

Only Inter and JetBrains Mono are loaded, in `src/app.html`. Adding a family means adding
it there **and** to this table.

### Type scale

Body and supporting copy deliberately stay where they are. Titles, headings and numerics
are larger.

| Role | Size | Weight | Notes |
| --- | --- | --- | --- |
| Hero (landing) | `text-5xl` → `text-4xl` at ≤1280 | `700` | `tracking-tight` |
| Page title (H1) | `text-3xl` | `700` | One per page |
| Section heading (H2) | `text-xl` | `600` | `text-2xl` only on landing |
| Card title | `text-lg` | `600` | `text-xl` when it is the card's focus |
| Stat / KPI value | `text-3xl` | `700` | `.font-heading`, `tabular-nums` |
| Body copy | `text-base` | `400` | **unchanged** |
| Supporting / metadata | `text-sm` | `400` | `--text-muted` |
| Micro-label / tag | `text-xs` | `500`–`600` | `.font-label`, uppercase |

**Rules**

- Important text is made prominent by **size and weight**, not by colour or glow.
- Never use `--cyan-bright` for body text.
- Numeric stats always get `tabular-nums` so digits do not shift as values change.
- Keep micro-labels uppercase; they are part of the identity.
- Cap headings at one `text-4xl` per view. Dense pages (Leaderboards, Dashboard,
  Achievements) must be re-checked for reflow after any heading step-up.

---

## 5. Spacing

Use the Tailwind spacing scale, which is rem-based and therefore scales with the fluid root.

| Context | Value |
| --- | --- |
| Card content padding | `1.25rem` (`p-5`) via `.card-cyber-body` |
| Gap between cards | `gap-5` (`1.25rem`) |
| Gap between page sections | `mb-8` (`2rem`) |
| Grid / stack lists | `gap-5` |
| Inline control gaps | `gap-2` / `gap-3` |

**Do not compress spacing to fit more content.** Reduce card count, shorten copy, or let the
page scroll. On 1280px screens the root is 13px, so all rem spacing is already ~19% tighter
than at 1920 — do not stack additional media-query overrides on top of that.

---

## 6. Cards

Cards use `.card-cyber` (border, hover lift, top shimmer) plus `.card-cyber-body` for
padding.

```svelte
<div class="card-cyber" style="border-color: rgb(var(--success-rgb) / 0.15)">
  <div class="card-cyber-body">
    <h3 class="font-heading text-lg font-semibold">Weekly stats</h3>
    <p class="text-sm text-obsidian-text-muted">...</p>
  </div>
</div>
```

**Rules**

- Padding goes on `.card-cyber-body`, **never** on `.card-cyber`. A card containing a
  full-bleed header, table or image row omits the wrapper and keeps padding in markup.
- Every card has an **explicit** accent. Do not leave a card accent implicit.
- Per-card accents are allowed but must be tokenised. The dashboard previously hardcoded
  four different accents inline — green, gold, purple and cyan — where the gold
  (`rgba(255,215,0)`) matched no token at all. That is now `--gold`.
- Cards lift `translateY(-2px)` on hover and show a top shimmer. Do not add competing
  hover effects.
- `border-radius` is `4px` (`rounded-card`). Do not introduce other radii for cards.

---

## 7. Buttons, tags and bars

| Element | Class | Notes |
| --- | --- | --- |
| Button base | `.btn-cyber` | Clip-path bevel, uppercase, `0.06em` tracking |
| Outline button | `.btn-cyber .btn-cyber-outline` | Default for secondary actions |
| Solid button | `.btn-cyber .btn-cyber-solid` | One per view wherever possible |
| Tag | `.tag-cyber` + `.tag-cyan`/`.tag-green`/`.tag-warn`/`.tag-purple` | Mono, uppercase |
| Progress bar | `.xp-track` + `.xp-fill` | `4px` tall |

Buttons are always uppercase with `0.06em` tracking. Tags always use `.font-label`.

---

## 8. Responsive scaling

The root font size is fluid and scales with the viewport. **1920px is the reference
viewport**, where `1rem = 16px`.

```css
/* src/app.css */
html {
  font-size: clamp(13px, calc(7px + 0.46875vw), 19px);
}
```

| Viewport | Root | Relative to 1920 |
| --- | --- | --- |
| 1280 | 13.0px | −19% |
| 1366 | 13.4px | −16% |
| 1440 | 13.8px | −14% |
| 1680 | 14.9px | −7% |
| 1920 | 16.0px | 0% (reference) |
| 2560 | 19.0px | +19% |
| >2560 | 19.0px | capped |

**Consequences you must design around**

- Every rem-based utility scales together: type, padding, gaps, widths, `text-*`, `p-*`,
  `gap-*`, `w-*`. A layout that works at 1920 works proportionally at 1280 and 2560.
- Tailwind **breakpoints are unaffected** — media queries resolve `rem` against the initial
  font size, not `html`.
- `vw` includes the scrollbar, so the root shifts by well under a tenth of a pixel when a
  scrollbar appears. This is below perceptual threshold; do **not** add
  `scrollbar-gutter` to "fix" it, as reserving a gutter costs 15px on non-scrolling pages
  like the workspace.

### rem or px?

| Use `rem` | Use `px` |
| --- | --- |
| Anything that should scale with content density: font sizes, padding, margins, gaps, card and modal widths, panel heights | Things that must stay visually crisp or physically fixed: `1px` borders, `clip-path` offsets, icon sizes, Monaco and xterm dimensions |

Hardcoded px in a layout container defeats the fluid scale. Modal, drawer, dropdown and
panel widths must be `rem`:

```svelte
<!-- WRONG: fixed 560px while its contents scale 19% -->
<div class="w-[min(560px,95vw)]">

<!-- correct: 35rem = 560px at the 1920 reference -->
<div class="w-[min(35rem,95vw)]">
```

### Banned

- **Do not reintroduce `body { zoom }`.** It was removed because it rescales fixed-position
  overlays and editor pixel math. Tutorial and onboarding overlays were never compensated
  for it, so they were silently misaligned on 1024–1399px screens.
- Do not add viewport-width media queries to compensate for the fluid root. Solve density
  with `rem` and the spacing scale instead.
- Do not set a static `html { font-size }` override in a component or layout.
- Do not use px `clamp()` values for type — reuse the scale in §4.

---

## 9. Verification

Before opening a UI pull request:

1. `pnpm check:design` — design-consistency gate (§10).
2. `pnpm check` — svelte-check.
3. `pnpm validate` — TypeScript.
4. Walk the changed routes at **1280 · 1440 · 1920 · 2560**, and check
   `/workspace/[containerId]` and `/tutorial/[containerId]` separately, since those carry
   fixed-position overlays and editor surfaces.
5. Confirm no Flash of Unstyled Text on a hard reload (fonts are loaded from Google Fonts).

The workspace is the highest-risk surface: Monaco and xterm are sized in real pixels while
the surrounding chrome is rem-based, so verify the editor and terminal still fill their
panels at both 1280 and 2560.

---

## 10. The design gate

`pnpm check:design` runs `scripts/check-design.ts`. It enforces two classes of rule.

**Hard rules (zero tolerance).** These are fully clean today; a single occurrence fails the
build:

| Rule | Expected |
| --- | --- |
| Retired font families (`Orbitron`, `Share Tech Mono`, `Rajdhani`, `Chakra Petch`, `Exo 2`) | 0 |
| Quoted `font-family: '...'` literals in components | 0 |
| Misspelled token `var(--font-head,` (should be `--font-heading`) | 0 |
| Undefined token `var(--bg-primary)` (should be `--bg`) | 0 |

**Ratchet rules.** These count pre-existing debt. The counts live in
`scripts/design-baseline.json`. The gate fails if a count **increases** — removing debt
passes and should be followed by lowering the baseline.

| Rule | Baseline |
| --- | --- |
| Raw hex colours in `src/**/*.{svelte,ts}` | 883 |
| `rgb()` / `rgba()` literals in `src/**/*.{svelte,ts}` | 1718 |
| `font-family` declarations in `src/**/*.svelte` | 448 |

To intentionally lower a baseline after a cleanup, or to accept a one-off exception:

```bash
pnpm check:design --update
```

The ratchet is deliberately a **floor, not a ban**. A blanket ban would fail on day one
across ~2600 occurrences. Convert literals to tokens as you touch files, and lower the
baseline in the same commit — never raise it.

---

## 11. Known debt

- **~2600 hardcoded colour literals** across 117 files. Convert opportunistically.
- **448 `font-family` declarations** remain. Most already reference `var(--font-*)`; the
  rest should.
- Textures are still redeclared locally in the files listed in §3.
- `/admin/*` has never been swept and uses its own ad-hoc styling and ~300 type utilities.
  It is excluded from the current scope by decision, not by oversight.
- The type-scale step-up in §4 has **not** yet been applied across the app; it is the
  target for the component sweep. Until then, treat §4 as the specification.
