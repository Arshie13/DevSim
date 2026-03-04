<script lang="ts">
  import { TrendingUp, TrendingDown } from "lucide-svelte";
  import type { KPIData } from "$types";

  export let kpis: KPIData[];
</script>

<div class="grid grid-cols-4 gap-4">
  {#each kpis as kpi}
    <div class="group card-cyber p-4 hover:translate-y-[-2px]">
      <!-- Subtle inner glow -->
      <div class="absolute inset-0 rounded-card bg-gradient-to-br from-obsidian-accent/[0.04] to-transparent"></div>

      <div class="relative flex items-start justify-between">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xl">{kpi.icon}</span>
            <p class="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider">{kpi.label}</p>
          </div>
          <p class="text-3xl font-orbitron font-bold text-obsidian-accent tracking-tight">{kpi.value}</p>
        </div>

        {#if kpi.trend}
          <div class="tag-cyber {kpi.trend.isPositive ? 'tag-green' : 'bg-[rgba(255,56,96,0.08)] border border-cyber-danger/40 text-cyber-danger'} flex items-center gap-1">
            {#if kpi.trend.isPositive}
              <TrendingUp class="w-3 h-3" />
            {:else}
              <TrendingDown class="w-3 h-3" />
            {/if}
            <span>{kpi.trend.value}%</span>
          </div>
        {/if}
      </div>

      <!-- Accent line at bottom -->
      <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r {kpi.color} opacity-60"></div>
    </div>
  {/each}
</div>
