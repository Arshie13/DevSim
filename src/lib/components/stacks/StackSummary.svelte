<script lang="ts">
  import type { StackSelection, TechOption } from "$types";
  import {
    FRONTEND_OPTIONS,
    BACKEND_OPTIONS,
    DATABASE_OPTIONS,
    SERVICES_OPTIONS,
  } from "$mocks";
  import { Rocket, X, Info, Zap, Loader } from "lucide-svelte";

  export let selection: StackSelection;
  export let onClear: (category: keyof StackSelection) => void;
  export let onStart: () => Promise<void>;
  export let onShowInfo: () => void;

  let isLoading = false;

  async function handleStart() {
    if (isLoading || !hasValidStack) return;
    isLoading = true;
    try {
      await onStart();
    } finally {
      isLoading = false;
    }
  }

  function getOption(
    options: TechOption[],
    id: string | null
  ): TechOption | null {
    if (!id) return null;
    return options.find((o) => o.id === id) || null;
  }

  $: frontendOption = getOption(FRONTEND_OPTIONS, selection.frontend);
  $: backendOption  = getOption(BACKEND_OPTIONS,  selection.backend);
  $: databaseOption = getOption(DATABASE_OPTIONS, selection.database);
  $: servicesOption = getOption(SERVICES_OPTIONS, selection.services);

  $: selectedCount = [
    selection.frontend,
    selection.backend,
    selection.database,
    selection.services,
  ].filter(Boolean).length;

  $: hasValidStack = selectedCount >= 2;

  $: xpMultiplier =
    selectedCount === 4 ? 2.0 :
    selectedCount === 3 ? 1.5 :
    selectedCount === 2 ? 1.25 : 1.0;
</script>

<div class="summary-bar">
  <div class="w-full max-w-[1200px] px-4 flex items-center justify-between mx-auto gap-4">

    <!-- Stack preview -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 mb-2">
        <span class="bar-label">Your Stack</span>

        {#if selectedCount > 0}
          <div class="xp-badge">
            <Zap class="w-3 h-3" style="color:#ffb400;" />
            <span>{xpMultiplier}x XP</span>
          </div>
        {/if}

        <span class="count-tag {selectedCount >= 1 ? 'count-tag--active' : ''}">
          {selectedCount}/4
        </span>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <!-- Frontend pill -->
        {#if frontendOption}
          <div class="stack-pill">
            <span class="text-sm">{frontendOption.icon}</span>
            <span class="pill-name">{frontendOption.name}</span>
            <button class="pill-clear" on:click={() => onClear("frontend")}>
              <X class="w-3 h-3" />
            </button>
          </div>
        {:else}
          <div class="stack-pill stack-pill--empty"><span class="pill-empty-label">Frontend</span></div>
        {/if}

        <span class="arrow">→</span>

        <!-- Backend pill -->
        {#if backendOption}
          <div class="stack-pill">
            <span class="text-sm">{backendOption.icon}</span>
            <span class="pill-name">{backendOption.name}</span>
            <button class="pill-clear" on:click={() => onClear("backend")}>
              <X class="w-3 h-3" />
            </button>
          </div>
        {:else}
          <div class="stack-pill stack-pill--empty"><span class="pill-empty-label">Backend</span></div>
        {/if}

        <span class="arrow">→</span>

        <!-- Database pill -->
        {#if databaseOption}
          <div class="stack-pill">
            <span class="text-sm">{databaseOption.icon}</span>
            <span class="pill-name">{databaseOption.name}</span>
            <button class="pill-clear" on:click={() => onClear("database")}>
              <X class="w-3 h-3" />
            </button>
          </div>
        {:else}
          <div class="stack-pill stack-pill--empty"><span class="pill-empty-label">Database</span></div>
        {/if}

        <span class="arrow">→</span>

        <!-- Services pill -->
        {#if servicesOption}
          <div class="stack-pill">
            <span class="text-sm">{servicesOption.icon}</span>
            <span class="pill-name">{servicesOption.name}</span>
            <button class="pill-clear" on:click={() => onClear("services")}>
              <X class="w-3 h-3" />
            </button>
          </div>
        {:else}
          <div class="stack-pill stack-pill--empty"><span class="pill-empty-label">Services</span></div>
        {/if}
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-3 flex-shrink-0">
      {#if selectedCount > 0}
        <button class="btn-cyber btn-cyber-outline flex items-center gap-1.5" on:click={onShowInfo}>
          <Info class="w-4 h-4" />
          Stack Info
        </button>
      {/if}

      <button
        on:click={handleStart}
        disabled={!hasValidStack || isLoading}
        aria-disabled={!hasValidStack || isLoading}
        aria-busy={isLoading}
        class="btn-cyber flex items-center gap-1.5 {hasValidStack && !isLoading
          ? 'btn-cyber-solid'
          : 'btn-cyber-disabled'}"
      >
        {#if isLoading}
          <Loader class="w-4 h-4 animate-spin" />
          <span>Loading...</span>
        {:else}
          <Rocket class="w-4 h-4" />
          <span>{hasValidStack ? 'View Scenarios' : `Select ${2 - selectedCount} more`}</span>
        {/if}
      </button>
    </div>
  </div>
</div>

<style>
  .summary-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #12192a;
    border-top: 1px solid rgba(7, 165, 201, 0.20);
    padding: 0.75rem 0;
    z-index: 40;
    backdrop-filter: blur(8px);
  }

  .bar-label {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.10em;
    color: rgba(208, 215, 221, 0.45);
  }

  /* XP multiplier badge */
  .xp-badge {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.15rem 0.5rem;
    background: rgba(255, 180, 0, 0.10);
    border: 1px solid rgba(255, 180, 0, 0.30);
    border-radius: 2px;
  }
  .xp-badge span {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.78rem;
    font-weight: 700;
    color: #ffb400;
    letter-spacing: 0.06em;
  }

  /* Count tag */
  .count-tag {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.78rem;
    padding: 0.15rem 0.5rem;
    border-radius: 2px;
    color: rgba(208, 215, 221, 0.45);
    background: transparent;
    border: 1px solid rgba(208, 215, 221, 0.12);
  }
  .count-tag--active {
    color: #07a5c9;
    border-color: rgba(7, 165, 201, 0.35);
    background: rgba(7, 165, 201, 0.08);
  }

  /* Stack pills — accent border + accent-dim bg */
  .stack-pill {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.3rem 0.65rem;
    background: rgba(7, 165, 201, 0.08);
    border: 1px solid rgba(7, 165, 201, 0.35);
    border-radius: 4px;
    box-shadow: 0 0 10px rgba(7, 165, 201, 0.08);
  }
  .stack-pill--empty {
    background: transparent;
    border-style: dashed;
    border-color: rgba(208, 215, 221, 0.12);
    opacity: 0.5;
  }

  .pill-name {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.84rem;
    color: #d0d7dd;
    letter-spacing: 0.04em;
  }
  .pill-empty-label {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.8rem;
    color: rgba(208, 215, 221, 0.40);
  }

  .pill-clear {
    color: rgba(208, 215, 221, 0.40);
    transition: color 0.15s ease;
    line-height: 0;
  }
  .pill-clear:hover {
    color: #ff3860;
  }

  .arrow {
    font-family: 'Share Tech Mono', monospace;
    color: rgba(208, 215, 221, 0.25);
    font-size: 0.9rem;
  }

  /* Buttons — cyberpunk clip-path */
  .btn-cyber {
    clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
    font-family: 'Orbitron', sans-serif;
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.10em;
    text-transform: uppercase;
    padding: 0.65rem 1.2rem;
    transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
    cursor: pointer;
  }
  .btn-cyber-outline {
    border: 1px solid #07a5c9;
    color: #07a5c9;
    background: transparent;
  }
  .btn-cyber-outline:hover {
    background: #07a5c9;
    color: #0a0e1a;
    box-shadow: 0 0 20px rgba(7, 165, 201, 0.30);
  }
  .btn-cyber-solid {
    background: #07a5c9;
    color: #0a0e1a;
    border: none;
    font-weight: 700;
  }
  .btn-cyber-solid:hover {
    background: #00f5ff;
    box-shadow: 0 0 25px rgba(7, 165, 201, 0.40);
  }
  .btn-cyber-disabled {
    background: rgba(208, 215, 221, 0.06);
    color: rgba(208, 215, 221, 0.30);
    border: 1px solid rgba(208, 215, 221, 0.10);
    cursor: not-allowed;
  }
</style>