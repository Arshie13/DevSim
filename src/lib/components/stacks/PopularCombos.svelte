<script lang="ts">
  import type { StackSelection, TechOption } from "$types";
  import {
    POPULAR_COMBOS,
    FRONTEND_OPTIONS,
    BACKEND_OPTIONS,
    DATABASE_OPTIONS,
    SERVICES_OPTIONS,
  } from "$mocks";
  import { Zap } from "lucide-svelte";

  export let onSelectCombo: (combo: StackSelection) => void;

  function getOption(options: TechOption[], id: string): TechOption | null {
    return options.find((o) => o.id === id) || null;
  }
</script>

<div class="mb-6">
  <div class="flex items-center gap-2 mb-3">
    <Zap class="w-4 h-4" style="color: #ffb400;" />
    <h3 class="section-label">Quick Select — Popular Stacks</h3>
  </div>

  <div class="flex flex-wrap gap-2">
    {#each POPULAR_COMBOS as combo}
      {@const frontend = getOption(FRONTEND_OPTIONS, combo.frontend || "")}
      {@const backend  = getOption(BACKEND_OPTIONS,  combo.backend  || "")}
      {@const database = getOption(DATABASE_OPTIONS, combo.database || "")}
      {@const services = getOption(SERVICES_OPTIONS, combo.services || "")}

      <button
        on:click={() => onSelectCombo(combo)}
        class="combo-card group relative"
      >
        <!-- Top shimmer -->
        <div class="shimmer"></div>

        <div class="flex items-center gap-2.5">
          <!-- Stacked tech icons -->
          <div class="flex items-center -space-x-1.5">
            {#if frontend}
              <span class="icon-chip">{frontend.icon}</span>
            {/if}
            {#if backend}
              <span class="icon-chip">{backend.icon}</span>
            {/if}
            {#if database}
              <span class="icon-chip">{database.icon}</span>
            {/if}
            {#if services}
              <span class="icon-chip">{services.icon}</span>
            {/if}
          </div>

          <!-- Combo name -->
          <span class="combo-name">{combo.name}</span>
        </div>
      </button>
    {/each}
  </div>
</div>

<style>
  .section-label {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.10em;
    color: rgba(208, 215, 221, 0.50);
  }

  .combo-card {
    position: relative;
    overflow: hidden;
    background: #12192a;
    border: 1px solid rgba(7, 165, 201, 0.15);
    border-radius: 4px;
    padding: 0.5rem 0.85rem;
    transition: border-color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
    cursor: pointer;
  }
  .combo-card:hover {
    border-color: rgba(7, 165, 201, 0.45);
    transform: translateX(4px);
    box-shadow: 0 0 16px rgba(7, 165, 201, 0.12);
  }

  .shimmer {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, #07a5c9, transparent);
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  .combo-card:hover .shimmer {
    opacity: 1;
  }

  .icon-chip {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    font-size: 0.85rem;
    background: #0a0e1a;
    border: 1px solid rgba(7, 165, 201, 0.18);
    border-radius: 50%;
  }

  .combo-name {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.72rem;
    color: #d0d7dd;
    white-space: nowrap;
    letter-spacing: 0.04em;
    transition: color 0.15s ease;
  }
  .combo-card:hover .combo-name {
    color: #07a5c9;
  }
</style>
