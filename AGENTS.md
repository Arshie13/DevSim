# AGENTS.md

## UI work is governed by `docs/ui_ux.md`

**Before editing any component, route or stylesheet, read `docs/ui_ux.md`.** It is the
single source of truth for colour tokens, typography, spacing, cards, responsiveness and
texture. It supersedes `docs/ui_ux_plan.md`, which is historical.

Do not invent values. If a colour, font size, spacing step or card pattern you need is not
in that document, stop and ask rather than picking one.

### Non-negotiables

- **No hardcoded colours.** Use `var(--token)` or `rgb(var(--token-rgb) / alpha)`. Never
  write a hex value or `rgba()` literal in a component.
- **No font family names in components.** Use `var(--font-body)`, `var(--font-heading)`,
  `var(--font-mono)` or the `.font-body` / `.font-heading` / `.font-label` classes.
- **Card padding goes on `.card-cyber-body`, never on `.card-cyber`.**
- **Spacing and type come from the scale.** `p-5` for card bodies, `gap-5` between cards,
  `mb-8` between sections.
- **Anything layout-related that should scale is `rem`.** `px` is reserved for `1px`
  borders, `clip-path` offsets, icons, and Monaco/xterm dimensions.
- **Never reintroduce `body { zoom }`.** The fluid root font size in `src/app.css`
  replaced it.
- **Textures live only in `src/app.css`.** Use `.bg-grid-cyber`, `.scanlines` and
  `.ambient-glow`; never redeclare them locally.
- **No light theme.** Dark only. Do not add `[data-theme]`, a toggle, or
  `prefers-color-scheme` branches.

### Before opening a UI pull request

```bash
pnpm check:design   # design-consistency gate
pnpm check          # svelte-check
pnpm validate       # tsc --noEmit
```

Then verify the changed routes at **1280 · 1440 · 1920 · 2560** px. See
`docs/ui_ux.md` §9 for the full checklist.

`pnpm check:design` is a **ratchet**, not a ban: it fails if hardcoded-colour, `rgba()` or
`font-family` counts increase, and hard-fails a small set of already-clean rules. Convert
literals to tokens as you touch files and lower `scripts/design-baseline.json` in the same
commit. Never raise a baseline.

### Scope

Learner-facing routes and `src/lib/components/**` are in scope. `/admin/*` is excluded from
sweeps by decision — do not sweep it unless asked, though it inherits global tokens.
