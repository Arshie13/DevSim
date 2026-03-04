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
      class="group relative bg-obsidian-surface/60 border border-obsidian-accent/25 rounded-card p-4 hover:border-obsidian-accent/50 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden shadow-[0_0_30px_rgba(7,165,201,0.15)] hover:shadow-[0_0_40px_rgba(7,165,201,0.25)] cursor-default"
    >
      <!-- Inner glow -->
      <div class="absolute inset-0 bg-gradient-to-br from-obsidian-accent/[0.06] to-transparent"></div>
      <!-- Hover shimmer -->
      <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-obsidian-accent/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

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

      <!-- Accent bottom line -->
      <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-obsidian-accent/30 to-transparent opacity-60"></div>
    </div>
  {/each}
</section>
