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

<div class="card-cyber shadow-[0_0_20px_rgba(255,215,0,0.08)] hover:shadow-[0_0_35px_rgba(255,215,0,0.16)] transition-shadow duration-500" style="border-color: rgba(255,215,0,0.15);">
  <!-- Header -->
  <div class="flex items-center justify-between px-5 py-4 border-b border-[var(--card-border)]">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-card bg-[rgba(255,215,0,0.15)] flex items-center justify-center border border-[rgba(255,215,0,0.30)]">
        <Trophy class="w-4 h-4 text-[#ffd700]" />
      </div>
      <div>
        <h3 class="text-sm font-orbitron font-bold text-obsidian-text-muted">Leaderboard</h3>
        <p class="text-xs font-mono text-[var(--text-muted)]">Top developers this season</p>
      </div>
    </div>
  </div>

  <!-- Leaderboard List -->
  <div class="p-2 space-y-1.5">
    {#each entries as entry}
      {@const rankInfo = getRankIcon(entry.rank)}
      <div 
        class="flex items-center gap-2 px-2.5 py-1.5 rounded-card border transition-all hover:translate-x-1 duration-300
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
            <span class="text-[10px] font-orbitron font-medium text-[var(--text-muted)]">#{entry.rank}</span>
          {/if}
        </div>

        <!-- Avatar -->
        <div class="w-8 h-8 rounded-full bg-obsidian-bg border border-obsidian-accent/20 flex items-center justify-center overflow-hidden">
          <img src={entry.avatar} alt="{entry.username}'s avatar" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
        </div>

        <!-- User Info -->
        <div class="flex-1 min-w-0">
          <p class="text-xs font-mono font-medium truncate {entry.isCurrentUser ? 'text-obsidian-accent' : 'text-obsidian-text-muted'}">
            {entry.name?.split(' ')[0] ?? entry.username}
            {#if entry.isCurrentUser}
              <span class="text-[10px] text-obsidian-accent/70">(You)</span>
            {/if}
          </p>
          <p class="text-[10px] font-mono text-[var(--text-muted)]">Level {entry.level}</p>
        </div>

        <!-- XP -->
        <div class="text-right">
          <p class="text-xs font-orbitron font-semibold text-obsidian-accent">{(entry.xp / 1000).toFixed(1)}K</p>
          <p class="text-[9px] font-mono text-[var(--text-muted)]">XP</p>
        </div>
      </div>
    {/each}
  </div>

  <!-- View Full Leaderboard Button -->
  <div class="px-2 pb-2">
    <a
      href="/leaderboards"
      class="btn-cyber btn-cyber-outline w-full !py-2 group inline-flex items-center justify-center gap-1"
    >
      <span class="text-[10px] group-hover:text-obsidian-bg transition-colors">
        View Full Leaderboard
      </span>
      <ChevronRight class="w-2.5 h-2.5 inline-block group-hover:translate-x-0.5 transition-all" />
    </a>
  </div>
</div>
