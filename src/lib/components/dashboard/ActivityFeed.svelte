<script lang="ts">
  import { Activity, Zap, Coins, ChevronRight, Award, Check } from "lucide-svelte";
  import type { AchievementFeedItem, ActivityItem } from "$types";

  export const activities: ActivityItem[] = [];
  export let achievementItems: AchievementFeedItem[] = [];

  const TIER_COLOR: Record<string, string> = {
    ROOKIE:  "#8b5cf6",
    AMATEUR: "#c084fc",
    PRO:     "#e9d5ff",
  };
</script>

<div class="card-cyber shadow-[0_0_20px_rgba(168,85,247,0.08)] hover:shadow-[0_0_35px_rgba(168,85,247,0.16)] transition-shadow duration-500" style="border-color: rgba(168,85,247,0.15);">
  <!-- Header -->
  <div class="flex items-center justify-between px-5 py-4 border-b border-[var(--card-border)]">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-card bg-cyber-purple/15 flex items-center justify-center border border-cyber-purple/30">
        <Activity class="w-4 h-4 text-cyber-purple" />
      </div>
      <div>
        <h3 class="text-sm font-orbitron font-bold text-obsidian-text-muted">Achievement Progress</h3>
        <p class="text-xs font-mono text-[var(--text-muted)]">Your 5 latest unlocks</p>
      </div>
    </div>
  </div>

  <!-- View all achievements -->
  <div class="px-3 pt-3">
    <a
      href="/achievements"
      class="group flex items-center justify-between gap-3 p-3 rounded-card bg-cyber-purple/10 border border-cyber-purple/30 hover:border-cyber-purple/60 hover:bg-cyber-purple/15 transition-all duration-300"
    >
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-card bg-cyber-purple/20 border border-cyber-purple/40 flex items-center justify-center shrink-0">
          <Award class="w-4 h-4 text-cyber-purple" />
        </div>
        <div>
          <h4 class="text-sm font-rajdhani font-medium text-obsidian-text-muted">View All Achievements</h4>
          <p class="text-xs font-mono text-[var(--text-muted)]">Browse tiers and current progress</p>
        </div>
      </div>
      <ChevronRight class="w-4 h-4 text-cyber-purple/70 group-hover:translate-x-1 transition-transform" />
    </a>
  </div>

  <!-- Achievement Feed -->
  <div class="p-3 space-y-2">
    {#if achievementItems.length === 0}
      <p class="text-xs font-mono text-[var(--text-muted)] text-center py-6">
        No achievements unlocked yet.
      </p>
    {/if}
    {#each achievementItems as item (item.id)}
      {@const pct = Math.round(item.progress * 100)}
      {@const tierColor = item.isCompleted ? "#22c55e" : (TIER_COLOR[item.nextTier] ?? "#8b5cf6")}
      <div class="group flex items-start gap-3 p-3 rounded-card bg-obsidian-bg/60 border border-transparent hover:border-[var(--card-border)] hover:translate-x-1 transition-all duration-300"
        class:completed-item={item.isCompleted}
      >
        <!-- Icon -->
        <div class="w-9 h-9 rounded-card bg-obsidian-surface/60 border border-[var(--card-border)] flex items-center justify-center text-lg shrink-0 relative">
          {item.icon}
          {#if item.isCompleted}
            <div class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center border border-obsidian-bg">
              <Check class="w-2.5 h-2.5 text-white" />
            </div>
          {/if}
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-2 mb-1">
            <h4 class="text-sm font-rajdhani font-medium text-obsidian-text-muted truncate">{item.name}</h4>
            <span class="text-[10px] font-mono shrink-0 flex items-center gap-1" style="color: {TIER_COLOR[item.unlockedTier]}">
              {#if item.isCompleted}
                <Check class="w-3 h-3 text-green-400" />
              {/if}
              {item.unlockedTier}
            </span>
          </div>

          <p class="text-xs font-rajdhani text-[var(--text-muted)] mb-2 truncate">{item.nextTierDescription}</p>

          <!-- Progress bar -->
          <div class="flex items-center gap-2">
            <div class="flex-1 h-1.5 rounded-full bg-obsidian-surface overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                style="width: {pct}%; background: {tierColor};"
              ></div>
            </div>
            <span class="text-[10px] font-mono text-[var(--text-muted)] whitespace-nowrap">
              {#if item.isCompleted}
                DONE
              {:else}
                {item.currentValue}/{item.targetValue}
              {/if}
            </span>
          </div>

          <!-- Rewards / status -->
          <div class="flex items-center gap-3 mt-1.5">
            {#if item.isCompleted}
              <span class="text-[10px] font-mono text-green-400 flex items-center gap-1">
                <Check class="w-3 h-3" /> Completed
              </span>
              <div class="tag-cyber tag-cyan flex items-center gap-1 ml-auto opacity-50">
                <Zap class="w-3 h-3" />
                <span>+{item.xpReward}</span>
              </div>
              <div class="tag-cyber tag-warn flex items-center gap-1 opacity-50">
                <Coins class="w-3 h-3" />
                <span>+{item.coinReward}</span>
              </div>
            {:else}
              <div class="tag-cyber tag-cyan flex items-center gap-1">
                <Zap class="w-3 h-3" />
                <span>+{item.xpReward}</span>
              </div>
              <div class="tag-cyber tag-warn flex items-center gap-1">
                <Coins class="w-3 h-3" />
                <span>+{item.coinReward}</span>
              </div>
              <span class="text-[10px] font-mono ml-auto" style="color: {tierColor}">→ {item.nextTier}</span>
            {/if}
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .completed-item {
    border-color: rgba(34, 197, 94, 0.12) !important;
  }
  .completed-item:hover {
    border-color: rgba(34, 197, 94, 0.3) !important;
  }
</style>
