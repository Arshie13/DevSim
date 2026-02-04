<script lang="ts">
  import { Clock, ChartBar} from "lucide-svelte";
  import type { WeeklyStats } from "$types";

  export let stats: WeeklyStats;

  $: maxHours = Math.max(...stats.codingHours);
</script>

<div class="relative bg-obsidian-surface/40 border border-emerald-500/25 rounded-xl overflow-hidden shadow-[0_0_35px_rgba(16,185,129,0.12)] hover:shadow-[0_0_45px_rgba(16,185,129,0.2)] transition-shadow duration-500">
  <!-- Top edge glow -->
  <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-obsidian-text-primary/40 to-transparent"></div>
  <!-- Header -->
  <div class="flex items-center justify-between px-5 py-4 border-b border-obsidian-border/60">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
        <ChartBar class="w-4 h-4 text-emerald-400" />
      </div>
      <div>
        <h3 class="text-sm font-semibold text-obsidian-text-muted">Weekly Activity</h3>
        <p class="text-xs text-obsidian-text-primary/50">Coding hours this week</p>
      </div>
    </div>
    <div class="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 rounded-md">
      <Clock class="w-3 h-3 text-emerald-400" />
      <span class="text-xs font-medium text-emerald-400">{stats.totalHours}h</span>
    </div>
  </div>

  <!-- Chart -->
  <div class="p-4">
    <!-- Bar Chart -->
    <div class="flex items-end justify-between gap-2 h-20 mb-2">
      {#each stats.codingHours as hours, i}
        {@const height = maxHours > 0 ? (hours / maxHours) * 100 : 0}
        {@const isToday = i === stats.days.length - 1}
        <div class="flex-1 h-full flex flex-col justify-end relative group">
          <!-- Tooltip -->
          <div class="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-1 bg-obsidian-bg text-xs text-obsidian-text-muted rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border border-obsidian-border">
            {hours}h
          </div>
          <!-- Bar -->
          <div 
            class="w-full rounded-t transition-all duration-300 hover:opacity-80
              {isToday 
                ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                : 'bg-gradient-to-t from-obsidian-accent/60 to-obsidian-accent/40'
              }"
            style="height: {Math.max(height, 8)}%"
          ></div>
        </div>
      {/each}
    </div>

    <!-- Day Labels -->
    <div class="flex justify-between gap-2">
      {#each stats.days as day, i}
        {@const isToday = i === stats.days.length - 1}
        <div class="flex-1 text-center text-[10px] {isToday ? 'text-emerald-400 font-medium' : 'text-obsidian-text-primary/40'}">
          {day}
        </div>
      {/each}
    </div>

    <!-- Stats Summary -->
    <div class="flex items-center justify-between mt-4 pt-3 border-t border-obsidian-border/60">
      <div class="text-xs text-obsidian-text-primary/50">
        Avg: <span class="text-obsidian-text-muted font-medium">{stats.avgPerDay}h/day</span>
      </div>
      <div class="text-xs text-emerald-400">
        +12% from last week
      </div>
    </div>
  </div>
</div>
