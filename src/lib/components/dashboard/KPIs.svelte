<script lang="ts">
  import { Award, Flame, Trophy, Zap } from "lucide-svelte";
  import type { KPIData } from "$types";

  export let kpis: KPIData[];

  interface KpiAccent {
    icon: typeof Trophy;
    valueClass: string;
    borderClass: string;
    borderStyle: string;
  }

  const accentXp: KpiAccent = {
    icon: Zap,
    valueClass: "text-obsidian-accent",
    borderClass: "border-obsidian-accent/15",
    borderStyle: ""
  };

  const kpiAccents = new Map<string, KpiAccent>([
    [
      "stacks-completed",
      {
        icon: Trophy,
        valueClass: "text-cyber-success",
        borderClass: "",
        borderStyle: "border-color: rgb(var(--success-rgb) / 0.15)"
      }
    ],
    ["total-xp", accentXp],
    [
      "day-streak",
      {
        icon: Flame,
        valueClass: "text-cyber-warn",
        borderClass: "",
        borderStyle: "border-color: rgb(var(--warn-rgb) / 0.15)"
      }
    ],
    [
      "achievements-unlocked",
      {
        icon: Award,
        valueClass: "text-cyber-purple",
        borderClass: "",
        borderStyle: "border-color: rgb(var(--purple-rgb) / 0.15)"
      }
    ]
  ]);

  function accentFor(id: string): KpiAccent {
    return kpiAccents.get(id) ?? accentXp;
  }
</script>

<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
  {#each kpis as kpi}
    {@const accent = accentFor(kpi.id)}
    <div class="card-cyber {accent.borderClass}" style={accent.borderStyle}>
      <div class="card-cyber-body !p-4">
        <div class="flex items-start justify-between gap-2">
          <p class="font-label text-xs text-obsidian-text-muted uppercase tracking-[0.04em] mb-2">{kpi.label}</p>
          <div
            class="w-7 h-7 shrink-0 rounded-card bg-obsidian-accent/10 border {accent.borderClass} flex items-center justify-center"
            style={accent.borderStyle}
          >
            <svelte:component this={accent.icon} class="w-3.5 h-3.5 {accent.valueClass}" />
          </div>
        </div>
        <p class="text-2xl font-heading font-bold {accent.valueClass} tracking-tight tabular-nums">{kpi.value}</p>
      </div>
    </div>
  {/each}
</div>
