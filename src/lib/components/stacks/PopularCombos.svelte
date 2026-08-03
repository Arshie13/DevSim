<script lang="ts">
  import type { StackSelection, TechOption } from "$types";
  import { CircleCheck, CircuitBoard } from "lucide-svelte";

  export let onSelectCombo: (combo: StackSelection) => void;
  export let selection: StackSelection = { frontend: null, backend: null, database: null, services: null };
  export let combos: StackSelection[] = [];
  export let techCategories: { id: string; options: TechOption[] }[] = [];

  const ICON_OVERRIDE: Record<string, string> = {
    express: "⬡",
    nestjs: "🐱",
    prisma: "◆",
    "shadcn-ui": "◻",
  };

  $: allOptions = techCategories.flatMap(c => c.options);

  function getOption(id: string | null): TechOption | null {
    if (!id) return null;
    return allOptions.find((o) => o.id === id) ?? null;
  }

  function isSelected(combo: StackSelection): boolean {
    return (
      combo.frontend === selection.frontend &&
      combo.backend  === selection.backend  &&
      combo.database === selection.database &&
      combo.services === selection.services
    );
  }

  function buildIcons(combo: StackSelection): string[] {
    const icons: string[] = [];
    if (combo.frontend) {
      const t = getOption(combo.frontend);
      if (t) icons.push(ICON_OVERRIDE[combo.frontend] ?? t.icon);
    }
    if (combo.backend) {
      const t = getOption(combo.backend);
      if (t) icons.push(ICON_OVERRIDE[combo.backend] ?? t.icon);
    }
    if (combo.database) {
      const t = getOption(combo.database);
      if (t) icons.push(ICON_OVERRIDE[combo.database] ?? t.icon);
    }
    if (combo.services) {
      const t = getOption(combo.services);
      if (t) icons.push(ICON_OVERRIDE[combo.services] ?? t.icon);
    }
    return icons;
  }

  function getRarityLabel(combo: StackSelection): string {
    const count = [combo.frontend, combo.backend, combo.database, combo.services].filter(Boolean).length;
    if (count === 4) return 'EPIC';
    if (count === 3) return 'RARE';
    return 'COMMON';
  }

  const TYPE_LABEL: Record<string, string> = {
    fullstack: "FULL STACK",
    backend:   "BACKEND",
    frontend:  "FRONTEND",
  };
  const TYPE_ACCENT: Record<string, string> = {
    fullstack: "#07a5c9",
    backend:   "#a855f7",
    frontend:  "#f97316",
  };
  const TYPE_RGB: Record<string, string> = {
    fullstack: "7,165,201",
    backend:   "168,85,247",
    frontend:  "249,115,22",
  };
</script>

<div class="preset-area">
  <div class="preset-header">
    <CircuitBoard size={14} style="color: #07a5c9;" />
    <span>AVAILABLE LOADOUTS</span>
    <div class="header-line"></div>
  </div>

  <div class="preset-list">
    {#each combos as combo}
      {@const sel = isSelected(combo)}
      {@const tk = combo.stackType ?? "fullstack"}
      {@const icons = buildIcons(combo)}
      {@const rarity = getRarityLabel(combo)}
      {@const layerCount = [combo.frontend, combo.backend, combo.database, combo.services].filter(Boolean).length}
      <button
        class="preset-row"
        class:is-sel={sel}
        style="--accent:{TYPE_ACCENT[tk]};--rgb:{TYPE_RGB[tk]};"
        on:click={() => onSelectCombo(combo)}
      >
        <!-- Top shimmer line -->
        <div class="row-shimmer"></div>

        <!-- Left: badges + name -->
        <div class="row-left">
          <div class="row-badges">
            <span class="type-badge">{TYPE_LABEL[tk]}</span>
            <span class="rarity-badge {rarity.toLowerCase()}">{rarity}</span>
          </div>
          <h3 class="row-name">{combo.name}</h3>
        </div>

        <!-- Center: tech icons -->
        <div class="row-icons">
          {#each icons as icon}
            <span class="row-icon">{icon}</span>
          {/each}
        </div>

        <!-- Right: selected badge -->
        <div class="row-right">
          {#if sel}
            <span class="row-sel">
              <CircleCheck size={10} />
              <span>SELECTED</span>
            </span>
          {/if}
        </div>
      </button>
    {/each}
  </div>

  <div class="preset-foot">
    <span>{combos.length} STACKS AVAILABLE</span>
  </div>
</div>

<style>
  .preset-area {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    height: 100%;
    padding: 0.9rem 1.1rem;
    background: #12192a;
    border: 1px solid rgba(7, 165, 201, 0.20);
    border-radius: 6px;
  }

  .preset-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding-bottom: 0.35rem;
    border-bottom: 1px solid rgba(7,165,201,0.09);
    flex-shrink: 0;
  }
  .preset-header span {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    color: rgba(208,215,221,0.50);
  }
  .header-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, rgba(7,165,201,0.15), transparent);
  }

  .preset-list {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    flex: 1;
    min-height: 0;
  }

  .preset-row {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0 0.9rem;
    background: linear-gradient(145deg, rgba(9,14,24,0.92) 0%, rgba(12,18,30,0.92) 100%);
    border: 1px solid rgba(7,165,201,0.10);
    border-radius: 5px;
    text-align: left;
    cursor: pointer;
    overflow: hidden;
    transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
    isolation: isolate;
    flex: 1;
    min-height: 0;
  }
  .preset-row:hover {
    transform: translateX(3px);
    border-color: rgba(var(--rgb), 0.40);
    box-shadow: 0 4px 20px rgba(var(--rgb), 0.10), inset 0 0 20px rgba(var(--rgb), 0.03);
  }
  .preset-row.is-sel {
    border-color: var(--accent);
    background: linear-gradient(145deg, rgba(var(--rgb), 0.08) 0%, rgba(9,14,24,0.92) 100%);
    box-shadow: 0 0 22px rgba(var(--rgb), 0.14), inset 0 0 16px rgba(var(--rgb), 0.04), 0 0 0 1px rgba(var(--rgb), 0.18);
  }

  .row-shimmer {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--accent), transparent);
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  .preset-row:hover .row-shimmer,
  .preset-row.is-sel .row-shimmer { opacity: 0.55; }

  .row-left {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
    flex: 1;
  }

  .row-badges {
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  .type-badge {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.55rem;
    letter-spacing: 0.10em;
    padding: 0.1rem 0.35rem;
    color: var(--accent);
    background: rgba(var(--rgb), 0.08);
    border: 1px solid rgba(var(--rgb), 0.2);
    border-radius: 2px;
  }

  .rarity-badge {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.55rem;
    letter-spacing: 0.08em;
    padding: 0.1rem 0.35rem;
    border-radius: 2px;
    font-weight: 700;
  }
  .rarity-badge.epic {
    color: #a855f7;
    background: rgba(168,85,247,0.10);
    border: 1px solid rgba(168,85,247,0.25);
  }
  .rarity-badge.rare {
    color: #ffb400;
    background: rgba(255,180,0,0.10);
    border: 1px solid rgba(255,180,0,0.25);
  }
  .rarity-badge.common {
    color: rgba(208,215,221,0.45);
    background: rgba(208,215,221,0.06);
    border: 1px solid rgba(208,215,221,0.12);
  }

  .row-name {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.88rem;
    font-weight: 600;
    color: #d0d7dd;
    letter-spacing: 0.02em;
    line-height: 1.2;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color 0.15s ease;
  }
  .preset-row:hover .row-name { color: #ffffff; }
  .preset-row.is-sel .row-name { color: var(--accent); text-shadow: 0 0 8px rgba(var(--rgb), 0.20); }

  .row-icons {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    flex-shrink: 0;
  }
  .row-icon {
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(var(--rgb), 0.07);
    border: 1px solid rgba(var(--rgb), 0.15);
    border-radius: 4px;
    font-size: 0.85rem;
    line-height: 1;
  }

  .row-right {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    flex-shrink: 0;
  }

  .row-sel {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.6rem;
    letter-spacing: 0.08em;
    color: var(--accent);
    padding: 0.15rem 0.45rem;
    background: rgba(var(--rgb), 0.10);
    border: 1px solid rgba(var(--rgb), 0.28);
    border-radius: 2px;
  }

  .preset-foot {
    padding-top: 0.3rem;
    border-top: 1px solid rgba(7,165,201,0.05);
    flex-shrink: 0;
  }
  .preset-foot span {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.55rem;
    letter-spacing: 0.12em;
    color: rgba(7,165,201,0.25);
  }
</style>
