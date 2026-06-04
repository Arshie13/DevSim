<!--
  MetricsSection.svelte — Grid of key profile metric cards.
-->
<script context="module" lang="ts">
  import type { ComponentType } from "svelte";

  export interface Metric {
    label: string;
    value: string;
    icon: ComponentType;
    color: string;
    bg: string;
  }
</script>

<script lang="ts">
  export let metrics: Metric[] = [];
</script>

<section class="grid grid-cols-2 lg:grid-cols-4 gap-3">
  {#each metrics as metric (metric.label)}
    <div
      class="group relative bg-obsidian-bg-light border border-obsidian-accent/25 rounded-card p-4 hover:border-obsidian-accent/50 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden shadow-[0_0_20px_rgba(7,165,201,0.10)] hover:shadow-[0_0_30px_rgba(7,165,201,0.22)] cursor-default"
    >
      <!-- Top accent bar — always visible, brightens on hover -->
      <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-obsidian-accent/35 to-transparent group-hover:via-obsidian-accent/60 transition-all duration-300"></div>

      <!-- Inner tint -->
      <div class="absolute inset-0 bg-gradient-to-br from-obsidian-accent/[0.05] to-transparent pointer-events-none"></div>

      <!-- Bottom accent bar -->
      <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-obsidian-accent/25 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>

      <div class="relative flex items-center gap-3">
        <div
          class="w-9 h-9 rounded-card border border-obsidian-border/40 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300"
          style="background: {metric.bg};"
        >
          <svelte:component this={metric.icon} class="w-4 h-4" style="color: {metric.color};" />
        </div>
        <div>
          <p class="text-xl font-orbitron font-bold text-obsidian-text-muted leading-tight">{metric.value}</p>
          <p class="text-[0.6rem] font-mono text-obsidian-text-primary/50 uppercase tracking-wider">{metric.label}</p>
        </div>
      </div>
    </div>
  {/each}
</section>
