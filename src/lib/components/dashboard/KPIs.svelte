<script lang="ts">
  import type { KPIData } from "$types";

  export let kpis: KPIData[];
</script>

<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
  {#each kpis as kpi}
    <div class="card-cyber p-4">
      <p class="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider mb-2">{kpi.label}</p>
      <p class="text-3xl font-orbitron font-bold text-obsidian-accent tracking-tight">{kpi.value}</p>
    </div>
  {/each}
</div>
