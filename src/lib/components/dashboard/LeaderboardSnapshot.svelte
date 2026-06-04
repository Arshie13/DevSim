<script lang="ts">
  import { Trophy, Crown, Medal, ChevronRight, Zap } from "lucide-svelte";
  import type { LeaderboardEntry } from "$types";
  import { computeLevel } from "$lib/utils/level";

  export let entries: LeaderboardEntry[];

  function getRankIcon(rank: number) {
    if (rank === 1) return { icon: Crown, color: "text-[#ffd700]" };
    if (rank === 2) return { icon: Medal, color: "text-[#c0c0c0]" };
    if (rank === 3) return { icon: Medal, color: "text-[#cd7f32]" };
    return null;
  }

  function getRankBorder(rank: number) {
    if (rank === 1) return "border-[#ffd700]/30 bg-[#ffd700]/5";
    if (rank === 2) return "border-[#c0c0c0]/25 bg-[#c0c0c0]/5";
    if (rank === 3) return "border-[#cd7f32]/25 bg-[#cd7f32]/5";
    return "border-transparent";
  }

  function formatXP(xp: number) {
    if (xp >= 1000) return `${(xp / 1000).toFixed(1)}K`;
    return xp.toString();
  }
</script>

<div class="card-cyber border rounded-card overflow-hidden hover:shadow-[0_0_30px_rgba(255,215,0,0.12)] transition-all duration-500" style="border-color: rgba(255,215,0,0.15);">
  <!-- Header -->
  <div class="flex items-center justify-between px-5 py-4 border-b border-[var(--card-border)]">
    <div class="flex items-center gap-3">
      <div class="relative">
        <div class="w-9 h-9 rounded-card bg-[var(--accent-dim)] flex items-center justify-center border border-[var(--accent)]/30">
          <Trophy class="w-4 h-4 text-[var(--accent)]" />
        </div>
        <div class="absolute inset-0 rounded-card bg-[var(--accent)]/20 blur-md animate-pulse"></div>
      </div>
      <div>
        <h3 class="text-sm font-heading font-bold text-[var(--text-primary)]">Leaderboard</h3>
        <p class="text-xs font-label text-[var(--text-muted)]">Top developers this season</p>
      </div>
    </div>
    <div class="flex items-center gap-2 px-2.5 py-1 rounded-card bg-[var(--success)]/10 border border-[var(--success)]/30">
      <span class="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse"></span>
      <span class="text-[10px] font-label text-[var(--success)] uppercase tracking-wider">Live</span>
    </div>
  </div>

  <!-- Leaderboard List -->
  <div class="p-2 space-y-1.5">
    {#each entries as entry}
      {@const rankInfo = getRankIcon(entry.rank)}
      {@const levelInfo = computeLevel(entry.xp)}
      <div 
        class="flex items-center gap-2.5 px-3 py-2 rounded-card border transition-all duration-300 hover:translate-x-1 {entry.isCurrentUser ? 'bg-[var(--accent-dim)] border-[var(--accent)]/40 shadow-[0_0_10px_rgba(7,165,201,0.15)]' : getRankBorder(entry.rank) + ' hover:border-[var(--accent)]/20'}"
      >
        <!-- Rank -->
        <div class="w-6 flex justify-center flex-shrink-0">
          {#if rankInfo}
            <svelte:component this={rankInfo.icon} class="w-4 h-4 {rankInfo.color}" />
          {:else}
            <span class="text-xs font-heading font-bold text-[var(--text-muted)]">#{entry.rank}</span>
          {/if}
        </div>

        <!-- Avatar -->
        <div class="relative flex-shrink-0">
          <div class="w-9 h-9 rounded-full bg-obsidian-bg border {entry.isCurrentUser ? 'border-[var(--accent)] shadow-[0_0_15px_rgba(7,165,201,0.3)]' : 'border-[var(--accent)]/20'} flex items-center justify-center overflow-hidden">
            {#if entry.avatar}
              <img src={entry.avatar} alt="{entry.username}'s avatar" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
            {:else}
              <span class="text-sm">🧑‍💻</span>
            {/if}
          </div>
          {#if entry.rank === 1}
            <div class="absolute -inset-0.5 rounded-full border border-t-[#ffd700] border-r-transparent border-b-transparent border-l-transparent animate-[spin_6s_linear_infinite]"></div>
          {/if}
        </div>

        <!-- User Info -->
        <div class="flex-1 min-w-0">
          <p class="text-xs font-label font-medium truncate {entry.isCurrentUser ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}">
            {entry.name?.split(' ')[0] ?? entry.username}
            {#if entry.isCurrentUser}
              <span class="text-[10px] text-[var(--accent)]/70 ml-1">(You)</span>
            {/if}
          </p>
          <div class="flex items-center gap-2 mt-0.5">
            <span class="text-[10px] font-label text-[var(--text-muted)]">Lvl {levelInfo.level}</span>
            <div class="flex-1 max-w-[60px] xp-track">
              <div class="xp-fill" style="width: {Math.min((levelInfo.xpIntoLevel / levelInfo.xpForLevel) * 100, 100)}%;"></div>
            </div>
          </div>
        </div>

        <!-- XP -->
        <div class="text-right flex-shrink-0">
          <div class="flex items-center gap-1">
            <Zap size={12} class="text-[var(--accent)]" fill="currentColor" />
            <span class="text-xs font-heading font-semibold text-[var(--accent)]">{formatXP(entry.xp)}</span>
          </div>
        </div>
      </div>
    {/each}
  </div>

  <!-- View Full Leaderboard Button -->
  <div class="px-2 pb-3">
    <a
      href="/leaderboards"
      class="btn-cyber btn-cyber-outline w-full !py-2.5 group inline-flex items-center justify-center gap-2"
    >
      <span class="text-xs group-hover:text-[var(--bg)] transition-colors">
        View Full Leaderboard
      </span>
      <ChevronRight class="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-all" />
    </a>
  </div>
</div>

<style>
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
