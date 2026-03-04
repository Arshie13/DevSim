<script lang="ts">
  import { Activity, Zap, Coins } from "lucide-svelte";
  import type { ActivityItem } from "$types";

  export let activities: ActivityItem[];
</script>

<div class="card-cyber shadow-[0_0_20px_rgba(168,85,247,0.08)] hover:shadow-[0_0_35px_rgba(168,85,247,0.16)] transition-shadow duration-500" style="border-color: rgba(168,85,247,0.15);">
  <!-- Header -->
  <div class="flex items-center justify-between px-5 py-4 border-b border-[var(--card-border)]">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-card bg-cyber-purple/15 flex items-center justify-center border border-cyber-purple/30">
        <Activity class="w-4 h-4 text-cyber-purple" />
      </div>
      <div>
        <h3 class="text-sm font-orbitron font-bold text-obsidian-text-muted">Recent Activity</h3>
        <p class="text-xs font-mono text-[var(--text-muted)]">Your latest achievements</p>
      </div>
    </div>
  </div>

  <!-- Activity List -->
  <div class="p-3 space-y-2">
    {#each activities as activity}
      <div class="group flex items-start gap-3 p-3 rounded-card bg-obsidian-bg/60 border border-transparent hover:border-[var(--card-border)] hover:translate-x-1 transition-all duration-300">
        <!-- Icon -->
        <div class="w-9 h-9 rounded-card bg-obsidian-surface/60 border border-[var(--card-border)] flex items-center justify-center text-lg shrink-0">
          {activity.icon}
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <div>
              <h4 class="text-sm font-rajdhani font-medium text-obsidian-text-muted truncate">{activity.title}</h4>
              <p class="text-xs font-rajdhani text-[var(--text-muted)]">{activity.description}</p>
            </div>
            <span class="text-[10px] font-mono text-[var(--text-muted)] whitespace-nowrap">{activity.timestamp}</span>
          </div>

          <!-- Rewards -->
          {#if activity.xp || activity.coins}
            <div class="flex items-center gap-3 mt-1.5">
              {#if activity.xp}
                <div class="tag-cyber tag-cyan flex items-center gap-1">
                  <Zap class="w-3 h-3" />
                  <span>+{activity.xp}</span>
                </div>
              {/if}
              {#if activity.coins}
                <div class="tag-cyber tag-warn flex items-center gap-1">
                  <Coins class="w-3 h-3" />
                  <span>+{activity.coins}</span>
                </div>
              {/if}
            </div>
          {/if}
        </div>
      </div>
    {/each}
  </div>
</div>
