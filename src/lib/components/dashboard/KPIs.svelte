<script lang="ts">
  import { TrendingUp, TrendingDown } from "lucide-svelte";
  import type { KPIData } from "$types";

  export let kpis: KPIData[];
</script>

<div class="grid grid-cols-4 gap-4">
  {#each kpis as kpi}
    <div class="group relative bg-obsidian-surface/60 border border-obsidian-accent/25 rounded-xl p-4 hover:border-obsidian-accent/50 transition-all duration-300 overflow-hidden shadow-[0_0_30px_rgba(7,165,201,0.15)] hover:shadow-[0_0_40px_rgba(7,165,201,0.25)]">
      <!-- Glow effect on hover -->
      <div class="absolute inset-0 bg-gradient-to-br {kpi.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
      <!-- Subtle inner glow -->
      <div class="absolute inset-0 rounded-xl bg-gradient-to-br from-obsidian-accent/[0.06] to-transparent"></div>
      
      <!-- Cyber grid pattern -->
      <div class="absolute inset-0 opacity-5">
        <div class="absolute inset-0" style="background-image: linear-gradient(rgba(7, 165, 201, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(7, 165, 201, 0.1) 1px, transparent 1px); background-size: 20px 20px;"></div>
      </div>

      <div class="relative flex items-start justify-between">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xl">{kpi.icon}</span>
            <p class="text-xs text-obsidian-text-primary/60 uppercase tracking-wider font-medium">{kpi.label}</p>
          </div>
          <p class="text-3xl font-bold text-obsidian-text-muted tracking-tight">{kpi.value}</p>
        </div>

        {#if kpi.trend}
          <div class="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium {kpi.trend.isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}">
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
