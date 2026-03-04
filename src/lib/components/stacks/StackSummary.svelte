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
  $: backendOption = getOption(BACKEND_OPTIONS, selection.backend);
  $: databaseOption = getOption(DATABASE_OPTIONS, selection.database);
  $: servicesOption = getOption(SERVICES_OPTIONS, selection.services);

  $: selectedCount = [
    selection.frontend,
    selection.backend,
    selection.database,
    selection.services,
  ].filter(Boolean).length;

  // At least 2 selections required to form a proper stack
  $: hasValidStack = selectedCount >= 2;

  // XP bonus for more complete stacks
  $: xpMultiplier = selectedCount === 4 ? 2.0 : selectedCount === 3 ? 1.5 : selectedCount === 2 ? 1.25 : 1.0;
</script>

<div
  class="fixed bottom-0 left-0 right-0 bg-obsidian-bg-light border-t border-obsidian-accent/20 py-3 z-40"
>
  <div class="w-full max-w-[1200px] px-4 flex items-center justify-between mx-auto">
    <!-- Selected Stack Preview -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-xs text-obsidian-text-primary/60 uppercase tracking-wider">Your Stack</span>
        
        <!-- XP Multiplier Badge -->
        {#if selectedCount > 0}
          <div class="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30">
            <Zap class="w-3 h-3 text-amber-400" />
            <span class="text-xs font-bold text-amber-400">{xpMultiplier}x XP</span>
          </div>
        {/if}
        
        <span
          class="text-xs px-2 py-0.5 rounded-full {selectedCount >= 1
            ? 'bg-obsidian-accent/20 text-obsidian-accent border border-obsidian-accent/30'
            : 'bg-obsidian-border text-obsidian-text-primary/50'}"
        >
          {selectedCount}/4
        </span>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <!-- Frontend -->
        {#if frontendOption}
          <div
            class="flex items-center gap-1.5 bg-obsidian-surface border border-obsidian-border rounded-md px-2.5 py-1.5 shadow-[0_0_10px_rgba(7,165,201,0.1)]"
          >
            <span class="text-sm">{frontendOption.icon}</span>
            <span class="text-xs text-obsidian-text-muted font-medium">{frontendOption.name}</span>
            <button
              on:click={() => onClear("frontend")}
              class="text-obsidian-text-primary/50 hover:text-red-400 transition-colors ml-0.5"
            >
              <X class="w-3 h-3" />
            </button>
          </div>
        {:else}
          <div
            class="flex items-center gap-1.5 bg-obsidian-surface/30 border border-dashed border-obsidian-border rounded-md px-2.5 py-1.5 opacity-50"
          >
            <span class="text-xs text-obsidian-text-primary/50">Frontend</span>
          </div>
        {/if}

        <span class="text-obsidian-text-primary/40 text-xs">→</span>

        <!-- Backend -->
        {#if backendOption}
          <div
            class="flex items-center gap-1.5 bg-obsidian-surface border border-obsidian-border rounded-md px-2.5 py-1.5 shadow-[0_0_10px_rgba(7,165,201,0.1)]"
          >
            <span class="text-sm">{backendOption.icon}</span>
            <span class="text-xs text-obsidian-text-muted font-medium">{backendOption.name}</span>
            <button
              on:click={() => onClear("backend")}
              class="text-obsidian-text-primary/50 hover:text-red-400 transition-colors ml-0.5"
            >
              <X class="w-3 h-3" />
            </button>
          </div>
        {:else}
          <div
            class="flex items-center gap-1.5 bg-obsidian-surface/30 border border-dashed border-obsidian-border rounded-md px-2.5 py-1.5 opacity-50"
          >
            <span class="text-xs text-obsidian-text-primary/50">Backend</span>
          </div>
        {/if}

        <span class="text-obsidian-text-primary/40 text-xs">→</span>

        <!-- Database -->
        {#if databaseOption}
          <div
            class="flex items-center gap-1.5 bg-obsidian-surface border border-obsidian-border rounded-md px-2.5 py-1.5 shadow-[0_0_10px_rgba(7,165,201,0.1)]"
          >
            <span class="text-sm">{databaseOption.icon}</span>
            <span class="text-xs text-obsidian-text-muted font-medium">{databaseOption.name}</span>
            <button
              on:click={() => onClear("database")}
              class="text-obsidian-text-primary/50 hover:text-red-400 transition-colors ml-0.5"
            >
              <X class="w-3 h-3" />
            </button>
          </div>
        {:else}
          <div
            class="flex items-center gap-1.5 bg-obsidian-surface/30 border border-dashed border-obsidian-border rounded-md px-2.5 py-1.5 opacity-50"
          >
            <span class="text-xs text-obsidian-text-primary/50">Database</span>
          </div>
        {/if}

        <span class="text-obsidian-text-primary/40 text-xs">→</span>

        <!-- Services -->
        {#if servicesOption}
          <div
            class="flex items-center gap-1.5 bg-obsidian-surface border border-obsidian-border rounded-md px-2.5 py-1.5 shadow-[0_0_10px_rgba(7,165,201,0.1)]"
          >
            <span class="text-sm">{servicesOption.icon}</span>
            <span class="text-xs text-obsidian-text-muted font-medium">{servicesOption.name}</span>
            <button
              on:click={() => onClear("services")}
              class="text-obsidian-text-primary/50 hover:text-red-400 transition-colors ml-0.5"
            >
              <X class="w-3 h-3" />
            </button>
          </div>
        {:else}
          <div
            class="flex items-center gap-1.5 bg-obsidian-surface/30 border border-dashed border-obsidian-border rounded-md px-2.5 py-1.5 opacity-50"
          >
            <span class="text-xs text-obsidian-text-primary/50">Services</span>
          </div>
        {/if}
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex items-center gap-3 flex-shrink-0">
      <!-- Stack Info Button -->
      {#if selectedCount > 0}
        <button
          on:click={onShowInfo}
          class="flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-300 bg-obsidian-surface border border-obsidian-border text-obsidian-text-primary hover:bg-obsidian-bg-light hover:text-obsidian-text-muted"
        >
          <Info class="w-4 h-4" />
          <span>Stack Info</span>
        </button>
      {/if}

      <!-- Start Button -->
      <button
        on:click={handleStart}
        disabled={!hasValidStack || isLoading}
        aria-disabled={!hasValidStack || isLoading}
        aria-busy={isLoading}
        class="flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 {hasValidStack && !isLoading
          ? 'bg-gradient-to-r from-obsidian-accent to-emerald-500 text-white hover:from-obsidian-accent hover:to-emerald-400 shadow-[0_0_25px_rgba(7,165,201,0.3)]'
          : 'bg-obsidian-surface text-obsidian-text-primary/50 cursor-not-allowed border border-obsidian-border'}"
      >
        {#if isLoading}
          <Loader class="w-4 h-4 animate-spin" />
          <span>Starting...</span>
        {:else}
          <Rocket class="w-4 h-4" />
          <span>{hasValidStack ? 'Start Sprint' : `Select ${2 - selectedCount} more`}</span>
        {/if}
      </button>
    </div>
  </div>
</div>
