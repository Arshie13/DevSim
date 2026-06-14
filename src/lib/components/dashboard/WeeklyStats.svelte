<script lang="ts">
  import { Clock, ChartBar} from "lucide-svelte";
  import type { WeeklyStats } from "$types";

  export let stats: WeeklyStats;

  $: maxCount = Math.max(...stats.counts, 1);
</script>

<div class="card-cyber shadow-[0_0_20px_rgba(0,229,160,0.08)] hover:shadow-[0_0_35px_rgba(0,229,160,0.16)] transition-shadow duration-500" style="border-color: rgba(0,229,160,0.15);">
  <!-- Header -->
  <div class="flex items-center justify-between px-5 py-4 border-b border-[var(--card-border)]">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-card bg-cyber-success/15 flex items-center justify-center border border-cyber-success/30">
        <ChartBar class="w-4 h-4 text-cyber-success" />
      </div>
      <div>
        <h3 class="text-sm font-orbitron font-bold text-obsidian-text-muted">Weekly Activity</h3>
        <p class="text-xs font-mono text-[var(--text-muted)]">Files changed this week</p>
      </div>
    </div>
    <div class="tag-cyber tag-green flex items-center gap-1">
      <Clock class="w-3 h-3" />
      <span>{stats.total}</span>
    </div>
  </div>

  <!-- Chart -->
  <div class="p-4">
    <!-- Bar Chart -->
    <div class="flex items-end justify-between gap-2 h-20 mb-2">
      {#each stats.counts as count, i}
        {@const height = (count / maxCount) * 100}
        {@const isToday = i === stats.days.length - 1}
        <div class="flex-1 h-full flex flex-col justify-end relative group">
          <!-- Tooltip -->
          <div class="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-1 bg-obsidian-bg font-mono text-xs text-obsidian-text-muted rounded-card opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border border-[var(--card-border)]">
            {count}
          </div>
          <!-- Bar -->
          <div
            class="w-full rounded-t transition-all duration-300 hover:opacity-80
              {isToday
                ? 'bg-gradient-to-t from-cyber-success to-[#00ffb3] shadow-[0_0_10px_rgba(0,229,160,0.3)]'
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
        <div class="flex-1 text-center font-mono text-[10px] {isToday ? 'text-cyber-success font-medium' : 'text-[var(--text-muted)]'}">
          {day}
        </div>
      {/each}
    </div>

    <!-- Stats Summary -->
    <div class="flex items-center justify-between mt-4 pt-3 border-t border-[var(--card-border)]">
      <div class="text-xs font-mono text-[var(--text-muted)]">
        Avg: <span class="text-obsidian-text-muted font-orbitron font-medium">{stats.avgPerDay}/day</span>
      </div>
      <div class="tag-cyber tag-green">
        {stats.growthLabel ?? "+0%"} from last week
      </div>
    </div>
  </div>
</div>
