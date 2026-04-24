<script lang="ts">
  import { X } from "lucide-svelte";
  import { fly, fade } from "svelte/transition";
  import ActivityFeed from "./ActivityFeed.svelte";
  import WeeklyStats from "./WeeklyStats.svelte";
  import LeaderboardSnapshot from "./LeaderboardSnapshot.svelte";
  import type { ActivityItem, WeeklyStats as WeeklyStatsType, LeaderboardEntry, AchievementFeedItem } from "$types";

  export let isOpen = false;
  export let activities: ActivityItem[];
  export let weeklyStats: WeeklyStatsType;
  export let leaderboard: LeaderboardEntry[];
  export let achievementItems: AchievementFeedItem[] = [];

  function closeDrawer() {
    isOpen = false;
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      closeDrawer();
    }
  }

  function handleEscape(event: KeyboardEvent) {
    if (event.key === "Escape" && isOpen) {
      closeDrawer();
    }
  }
</script>

<svelte:window on:keydown={handleEscape} />

{#if isOpen}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
    on:click={handleBackdropClick}
    on:keydown={handleEscape}
    role="button"
    tabindex="-1"
    transition:fade={{ duration: 200 }}
  ></div>

  <!-- Drawer -->
  <div
    class="fixed top-0 right-0 h-full w-full max-w-2xl bg-obsidian-bg border-l border-obsidian-accent/20 z-50 shadow-[-10px_0_50px_rgba(0,0,0,0.5),0_0_40px_rgba(7,165,201,0.08)]"
    transition:fly={{ x: 500, duration: 300 }}
  >
    <!-- Header -->
    <div class="border-b border-[var(--card-border)] bg-obsidian-bg-light/85 backdrop-blur-2xl">
      <div class="w-full px-16 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-card bg-gradient-to-br from-obsidian-accent to-cyber-bright flex items-center justify-center shadow-accent-glow">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-obsidian-bg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
          </div>
          <div>
            <h2 class="text-xl font-orbitron font-bold text-obsidian-text-muted tracking-tight">Stats & Activity</h2>
            <p class="text-xs font-mono text-[var(--text-muted)] uppercase tracking-widest">Your performance overview</p>
          </div>
        </div>
        <button
          on:click={closeDrawer}
          class="w-9 h-9 flex items-center justify-center rounded-card hover:bg-obsidian-accent/10 border border-transparent hover:border-obsidian-accent/30 transition-all group"
          aria-label="Close drawer"
        >
          <X class="w-5 h-5 text-obsidian-text-primary/50 group-hover:text-obsidian-accent" />
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="h-[calc(100%-90px)] overflow-y-auto px-16 py-6 space-y-6">
      <!-- Leaderboard Snapshot -->
      <div>
        <LeaderboardSnapshot entries={leaderboard} />
      </div>

      <!-- Weekly Stats -->
      <div>
        <WeeklyStats stats={weeklyStats} />
      </div>

      <!-- Activity Feed -->
      <div class="pb-6">
        <ActivityFeed {activities} {achievementItems} />
      </div>
    </div>
  </div>
{/if}

<style>
  /* Custom scrollbar for drawer content */
  .overflow-y-auto::-webkit-scrollbar {
    width: 8px;
  }

  .overflow-y-auto::-webkit-scrollbar-track {
    background: rgba(14, 22, 33, 0.3);
    border-radius: 4px;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb {
    background: rgba(7, 165, 201, 0.3);
    border-radius: 4px;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: rgba(7, 165, 201, 0.5);
  }
</style>
