<script lang="ts">
  import type { StackSelection, TechOption } from "$types";
  import {
    POPULAR_COMBOS,
    FRONTEND_OPTIONS,
    BACKEND_OPTIONS,
    DATABASE_OPTIONS,
    SERVICES_OPTIONS,
  } from "$lib/mocks";
  import { Zap } from "lucide-svelte";

  export let onSelectCombo: (combo: StackSelection) => void;

  function getOption(options: TechOption[], id: string): TechOption | null {
    return options.find((o) => o.id === id) || null;
  }
</script>

<div class="mb-6">
  <div class="flex items-center gap-2 mb-3">
    <Zap class="w-4 h-4 text-amber-400" />
    <h3 class="text-xs font-semibold text-obsidian-text-primary/60 uppercase tracking-wider">
      Quick Select — Popular Stacks
    </h3>
    <span class="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-medium">+50 XP Bonus</span>
  </div>

  <div class="flex flex-wrap gap-2">
    {#each POPULAR_COMBOS as combo}
      {@const frontend = getOption(FRONTEND_OPTIONS, combo.frontend || "")}
      {@const backend = getOption(BACKEND_OPTIONS, combo.backend || "")}
      {@const database = getOption(DATABASE_OPTIONS, combo.database || "")}
      {@const services = getOption(SERVICES_OPTIONS, combo.services || "")}

      <button
        on:click={() => onSelectCombo(combo)}
        class="group flex items-center gap-3 bg-obsidian-surface border border-obsidian-border hover:border-obsidian-accent/50 rounded-lg px-3 py-2 transition-all duration-200 hover:shadow-[0_0_15px_rgba(7,165,201,0.1)] hover:bg-obsidian-surface/80"
      >
        <div class="flex items-center -space-x-1.5">
          {#if frontend}
            <span
              class="text-sm w-7 h-7 flex items-center justify-center bg-obsidian-bg-light rounded-full border border-obsidian-border"
            >
              {frontend.icon}
            </span>
          {/if}
          {#if backend}
            <span
              class="text-sm w-7 h-7 flex items-center justify-center bg-obsidian-bg-light rounded-full border border-obsidian-border"
            >
              {backend.icon}
            </span>
          {/if}
          {#if database}
            <span
              class="text-sm w-7 h-7 flex items-center justify-center bg-obsidian-bg-light rounded-full border border-obsidian-border"
            >
              {database.icon}
            </span>
          {/if}
          {#if services}
            <span
              class="text-sm w-7 h-7 flex items-center justify-center bg-obsidian-bg-light rounded-full border border-obsidian-border"
            >
              {services.icon}
            </span>
          {/if}
        </div>
        <span
          class="text-sm font-medium text-obsidian-text-primary group-hover:text-obsidian-text-muted transition-colors"
        >
          {combo.name}
        </span>
      </button>
    {/each}
  </div>
</div>
