<script lang="ts">
  import { Activity, Zap, Coins } from "lucide-svelte";
  import type { ActivityItem } from "$types";

  export let activities: ActivityItem[];
</script>

<div class="relative bg-obsidian-surface/40 border border-purple-500/25 rounded-xl overflow-hidden shadow-[0_0_35px_rgba(168,85,247,0.12)] hover:shadow-[0_0_45px_rgba(168,85,247,0.2)] transition-shadow duration-500">
  <!-- Top edge glow -->
  <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-obsidian-text-primary/40 to-transparent"></div>
  <!-- Header -->
  <div class="flex items-center gap-3 px-5 py-4 border-b border-obsidian-border/60">
    <div class="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
      <Activity class="w-4 h-4 text-purple-400" />
    </div>
    <div>
      <h3 class="text-sm font-semibold text-obsidian-text-muted">Recent Activity</h3>
      <p class="text-xs text-obsidian-text-primary/50">Your latest achievements</p>
    </div>
  </div>

  <!-- Activity List -->
  <div class="p-3 space-y-2">
    {#each activities as activity}
      <div class="group flex items-start gap-3 p-3 rounded-lg bg-obsidian-bg-light/50 hover:bg-obsidian-bg-light transition-colors">
        <!-- Icon -->
        <div class="w-9 h-9 rounded-lg bg-obsidian-surface flex items-center justify-center text-lg shrink-0">
          {activity.icon}
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <div>
              <h4 class="text-sm font-medium text-obsidian-text-muted truncate">{activity.title}</h4>
              <p class="text-xs text-obsidian-text-primary/50">{activity.description}</p>
            </div>
            <span class="text-[10px] text-obsidian-text-primary/40 whitespace-nowrap">{activity.timestamp}</span>
          </div>

          <!-- Rewards -->
          {#if activity.xp || activity.coins}
            <div class="flex items-center gap-3 mt-1.5">
              {#if activity.xp}
                <div class="flex items-center gap-1 text-xs text-cyan-400">
                  <Zap class="w-3 h-3" />
                  <span>+{activity.xp}</span>
                </div>
              {/if}
              {#if activity.coins}
                <div class="flex items-center gap-1 text-xs text-amber-400">
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
