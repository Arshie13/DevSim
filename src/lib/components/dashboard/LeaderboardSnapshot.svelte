<script lang="ts">
  import { Trophy, Crown, Medal, ChevronRight } from "lucide-svelte";
  import type { LeaderboardEntry } from "$types";

  export let entries: LeaderboardEntry[];

  function getRankIcon(rank: number) {
    if (rank === 1) return { icon: Crown, color: "text-yellow-400" };
    if (rank === 2) return { icon: Medal, color: "text-gray-300" };
    if (rank === 3) return { icon: Medal, color: "text-amber-600" };
    return null;
  }

  function getRankBg(rank: number) {
    if (rank === 1) return "bg-yellow-500/10 border-yellow-500/30";
    if (rank === 2) return "bg-gray-400/10 border-gray-400/30";
    if (rank === 3) return "bg-amber-600/10 border-amber-600/30";
    return "bg-obsidian-surface/60 border-obsidian-border/40";
  }
</script>

<div class="relative bg-obsidian-surface/40 border border-yellow-500/25 rounded-xl overflow-hidden shadow-[0_0_35px_rgba(234,179,8,0.12)] hover:shadow-[0_0_45px_rgba(234,179,8,0.2)] transition-shadow duration-500">
  <!-- Top edge glow -->
  <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-obsidian-text-primary/40 to-transparent"></div>
  <!-- Header -->
  <div class="flex items-center justify-between px-4 py-3 border-b border-obsidian-border/60">
    <div class="flex items-center gap-2">
      <div class="w-7 h-7 rounded-lg bg-yellow-500/20 flex items-center justify-center">
        <Trophy class="w-3.5 h-3.5 text-yellow-400" />
      </div>
      <div>
        <h3 class="text-sm font-semibold text-obsidian-text-muted">Leaderboard</h3>
        <p class="text-[10px] text-obsidian-text-primary/50">Top developers this season</p>
      </div>
    </div>
  </div>

  <!-- Leaderboard List -->
  <div class="p-2 space-y-1.5">
    {#each entries as entry}
      {@const rankInfo = getRankIcon(entry.rank)}
      <div 
        class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all
          {entry.isCurrentUser 
            ? 'bg-obsidian-accent/10 border-obsidian-accent/40 shadow-[0_0_10px_rgba(7,165,201,0.1)]' 
            : getRankBg(entry.rank)
          }"
      >
        <!-- Rank -->
        <div class="w-5 flex justify-center">
          {#if rankInfo}
            <svelte:component this={rankInfo.icon} class="w-3.5 h-3.5 {rankInfo.color}" />
          {:else}
            <span class="text-[10px] font-medium text-obsidian-text-primary/50">#{entry.rank}</span>
          {/if}
        </div>

        <!-- Avatar -->
        <div class="w-6 h-6 rounded-full bg-obsidian-bg flex items-center justify-center text-sm">
          {entry.avatar}
        </div>

        <!-- User Info -->
        <div class="flex-1 min-w-0">
          <p class="text-xs font-medium truncate {entry.isCurrentUser ? 'text-obsidian-accent' : 'text-obsidian-text-muted'}">
            {entry.username}
            {#if entry.isCurrentUser}
              <span class="text-[10px] text-obsidian-accent/70">(You)</span>
            {/if}
          </p>
          <p class="text-[10px] text-obsidian-text-primary/50">Level {entry.level}</p>
        </div>

        <!-- XP -->
        <div class="text-right">
          <p class="text-xs font-semibold text-obsidian-text-muted">{(entry.xp / 1000).toFixed(1)}K</p>
          <p class="text-[9px] text-obsidian-text-primary/40">XP</p>
        </div>
      </div>
    {/each}
  </div>

  <!-- View Full Leaderboard Button -->
  <div class="px-2 pb-2">
    <button 
      class="w-full flex items-center justify-center gap-1.5 py-2 bg-obsidian-bg/60 hover:bg-obsidian-bg border border-obsidian-border/60 hover:border-obsidian-accent/40 rounded-lg transition-all group"
    >
      <span class="text-[10px] font-medium text-obsidian-text-primary/70 group-hover:text-obsidian-accent transition-colors">
        View Full Leaderboard
      </span>
      <ChevronRight class="w-2.5 h-2.5 text-obsidian-text-primary/50 group-hover:text-obsidian-accent group-hover:translate-x-0.5 transition-all" />
    </button>
  </div>
</div>
