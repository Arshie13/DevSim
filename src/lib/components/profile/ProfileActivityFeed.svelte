<!--
  ProfileActivityFeed.svelte — Compact activity timeline for the profile/rivals right column.
  Shows 5 most recent task completions and achievement unlocks.
-->
<script lang="ts">
  import { Activity, Zap, Coins } from "lucide-svelte";
  import type { ActivityItem } from "$types";

  export let activities: ActivityItem[] = [];

  const TYPE_BG: Record<ActivityItem["type"], string> = {
    achievement:    "rgb(var(--purple-rgb) / 0.12)",
    challenge:      "rgb(var(--accent-rgb) / 0.12)",
    level_up:       "rgb(var(--success-rgb) / 0.12)",
    stack_complete: "rgb(var(--warn-rgb) / 0.12)",
    daily_login:    "rgb(var(--cyan-bright-rgb) / 0.12)",
  };

  const TYPE_BORDER: Record<ActivityItem["type"], string> = {
    achievement:    "rgb(var(--purple-rgb) / 0.3)",
    challenge:      "rgb(var(--accent-rgb) / 0.3)",
    level_up:       "rgb(var(--success-rgb) / 0.3)",
    stack_complete: "rgb(var(--warn-rgb) / 0.3)",
    daily_login:    "rgb(var(--cyan-bright-rgb) / 0.3)",
  };
</script>

<section
  class="relative h-full bg-obsidian-bg-light border border-obsidian-accent/25 rounded-card overflow-hidden shadow-accent-glow-lg hover:shadow-accent-glow-hover transition-shadow duration-500 flex flex-col"
>
  <!-- Top accent bar -->
  <div class="absolute top-0 left-0 right-0 h-[2px] z-10 bg-gradient-to-r from-transparent via-obsidian-accent/40 to-transparent"></div>

  <!-- Header -->
  <div class="relative z-10 flex items-center gap-3 px-5 py-3.5 border-b border-obsidian-border/60 shrink-0">
    <div class="flex items-center justify-center w-8 h-8 rounded-card bg-obsidian-accent/15 border border-obsidian-accent/30 shrink-0">
      <Activity class="w-4 h-4 text-obsidian-accent" />
    </div>
    <div class="flex-1 min-w-0">
      <h3 class="text-lg font-heading font-semibold text-obsidian-text-muted">Recent Activity</h3>
      <p class="text-[0.65rem] font-label text-obsidian-text-primary/30 uppercase tracking-wider">
        {activities.length} {activities.length === 1 ? "item" : "items"}
      </p>
    </div>
  </div>

  <!-- Activity List — fixed 4 slots; empty slots keep their assigned space -->
  <div class="relative z-10 flex-1 min-h-0 overflow-y-auto">
    <div class="flex h-full flex-col py-1">
      {#each Array(4) as _, i (i)}
        {@const item = activities[i]}
        <div
          class="flex flex-1 items-center gap-3 px-5 py-2 min-h-[2.75rem] {item ? 'hover:bg-obsidian-bg/40' : ''} transition-colors
            {i < 3 ? 'border-b border-obsidian-border/20' : ''}"
        >
          {#if item}
            <!-- Icon badge -->
            <div
              class="w-9 h-9 rounded-card flex items-center justify-center text-lg shrink-0"
              style="background: {TYPE_BG[item.type]}; border: 1px solid {TYPE_BORDER[item.type]};"
            >
              {item.icon}
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <p class="font-heading text-sm font-medium text-obsidian-text-primary truncate">
                {item.title}
              </p>
              <p class="text-xs font-body text-obsidian-text-primary/40 truncate">
                {item.description}
              </p>
            </div>

            <!-- Timestamp + Rewards -->
            <div class="flex items-center gap-2 shrink-0">
              <span class="text-xs font-label text-obsidian-text-primary/30 whitespace-nowrap">
                {item.timestamp}
              </span>
              {#if item.xp}
                <span class="text-xs font-label text-obsidian-text-primary/50 flex items-center gap-0.5">
                  <Zap class="w-2.5 h-2.5 text-obsidian-accent" />
                  {item.xp}
                </span>
              {/if}
              {#if item.coins}
                <span class="text-xs font-label text-obsidian-text-primary/50 flex items-center gap-0.5">
                  <Coins class="w-2.5 h-2.5 text-obsidian-accent" />
                  {item.coins}
                </span>
              {/if}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  .overflow-y-auto::-webkit-scrollbar {
    width: 6px;
  }
  .overflow-y-auto::-webkit-scrollbar-track {
    background: rgb(var(--surface-rgb) / 0.3);
    border-radius: var(--radius-chrome);
  }
  .overflow-y-auto::-webkit-scrollbar-thumb {
    background: rgb(var(--accent-rgb) / 0.3);
    border-radius: var(--radius-chrome);
  }
  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: rgb(var(--accent-rgb) / 0.5);
  }
</style>
