<script lang="ts">
  import { Trophy, Crown, Medal, ArrowLeft } from "lucide-svelte";
  import { fade, fly } from "svelte/transition";
  import Header from "$lib/components/Header.svelte";
  import type { LeaderboardEntry, UserData } from "$types";

  export let data: {
    entries: LeaderboardEntry[];
    currentUserEntry: LeaderboardEntry | null;
    user: UserData;
    userCoins: number;
  };

  $: headerUserData = {
    ...data.user,
    coins: data.userCoins,
  } as UserData;

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

  function goBack() {
    window.history.back();
  }
</script>

<svelte:head>
  <title>Leaderboards | DevSim</title>
</svelte:head>

<div class="min-h-screen bg-obsidian-bg scanlines ambient-glow bg-grid-cyber">
  <Header userData={headerUserData} />

  <main class="relative z-10 py-8 lg:py-12">
    <div class="max-w-[1200px] mx-auto px-6">

      <!-- Top Header -->
      <div class="mb-10" in:fade={{ duration: 400 }}>
        <button
          on:click={goBack}
          class="flex items-center gap-2 text-obsidian-text-primary/50 hover:text-obsidian-accent transition-colors mb-4 group font-mono text-xs uppercase tracking-widest"
        >
          <ArrowLeft size={14} class="transition-transform group-hover:-translate-x-1" />
          Back
        </button>
        <div class="flex items-center gap-4 mb-2">
          <div class="p-3 rounded-card bg-[rgba(255,215,0,0.10)] border border-[rgba(255,215,0,0.30)] text-[#ffd700]">
            <Trophy size={24} />
          </div>
          <div>
            <h1 class="text-3xl font-orbitron font-bold text-obsidian-text-muted tracking-tight">Leaderboards</h1>
            <p class="text-sm font-rajdhani text-obsidian-text-primary/50">Top 10 developers, ranked by XP this season.</p>
          </div>
        </div>
      </div>

      <!-- Leaderboard Panel -->
      <div
        class="card-cyber shadow-[0_0_20px_rgba(255,215,0,0.08)] transition-shadow duration-500"
        style="border-color: rgba(255,215,0,0.15);"
        in:fade={{ delay: 100, duration: 400 }}
      >
        <!-- Panel Header -->
        <div class="flex items-center justify-between px-6 py-5 border-b border-[var(--card-border)]">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-card bg-[rgba(255,215,0,0.15)] flex items-center justify-center border border-[rgba(255,215,0,0.30)]">
              <Trophy class="w-5 h-5 text-[#ffd700]" />
            </div>
            <div>
              <h2 class="text-base font-orbitron font-bold text-obsidian-text-muted">Top Players</h2>
              <p class="text-xs font-mono text-[var(--text-muted)] uppercase tracking-widest">Season 01</p>
            </div>
          </div>
          <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-card bg-obsidian-accent/10 border border-obsidian-accent/30">
            <span class="text-xs font-mono text-obsidian-accent uppercase tracking-widest">Live</span>
            <span class="w-2 h-2 rounded-full bg-obsidian-accent animate-pulse"></span>
          </div>
        </div>

        <!-- Rows -->
        <div class="p-3 space-y-2">
          {#each data.entries as entry, index (entry.rank)}
            {@const rankInfo = getRankIcon(entry.rank)}
            <div
              class="flex items-center gap-4 px-4 py-3 rounded-card border transition-all hover:translate-x-1 duration-300
                {entry.isCurrentUser
                  ? 'bg-obsidian-accent/10 border-obsidian-accent/40 shadow-[0_0_12px_rgba(7,165,201,0.15)]'
                  : getRankBg(entry.rank)}"
              in:fly={{ y: 20, delay: 50 * index, duration: 500 }}
            >
              <!-- Rank -->
              <div class="w-10 flex justify-center">
                {#if rankInfo}
                  <svelte:component this={rankInfo.icon} class="w-6 h-6 {rankInfo.color}" />
                {:else}
                  <span class="text-base font-orbitron font-bold text-[var(--text-muted)]">#{entry.rank}</span>
                {/if}
              </div>

              <!-- Avatar -->
              <div class="w-12 h-12 rounded-full bg-obsidian-bg border border-obsidian-accent/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                {#if entry.avatar}
                  <img src={entry.avatar} alt="{entry.username}'s avatar" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
                {:else}
                  <span class="text-lg">🧑‍💻</span>
                {/if}
              </div>

              <!-- User Info -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-mono font-medium truncate {entry.isCurrentUser ? 'text-obsidian-accent' : 'text-obsidian-text-muted'}">
                  {entry.name ?? entry.username}
                  {#if entry.isCurrentUser}
                    <span class="text-xs text-obsidian-accent/70 ml-1">(You)</span>
                  {/if}
                </p>
                <p class="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider">Level {entry.level}</p>
              </div>

              <!-- XP -->
              <div class="text-right">
                <p class="text-lg font-orbitron font-bold {entry.rank === 1 ? 'text-[#ffd700]' : 'text-obsidian-accent'}">
                  {(entry.xp / 1000).toFixed(1)}K
                </p>
                <p class="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">XP</p>
              </div>
            </div>
          {:else}
            <div class="py-20 flex flex-col items-center justify-center opacity-50" in:fade>
              <Trophy size={64} class="mb-4 text-obsidian-text-primary/20" />
              <p class="font-orbitron text-lg text-obsidian-text-primary/40 uppercase tracking-widest">No players ranked yet</p>
            </div>
          {/each}
        </div>

        <!-- Current User Row (outside top 10) -->
        {#if data.currentUserEntry}
          <div class="px-3 pb-3 pt-2 border-t border-[var(--card-border)]" in:fade={{ delay: 400, duration: 400 }}>
            <p class="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest mb-2 px-2">Your Rank</p>
            <div class="flex items-center gap-4 px-4 py-3 rounded-card border bg-obsidian-accent/10 border-obsidian-accent/40 shadow-[0_0_12px_rgba(7,165,201,0.15)]">
              <div class="w-10 flex justify-center">
                <span class="text-base font-orbitron font-bold text-obsidian-accent">#{data.currentUserEntry.rank}</span>
              </div>
              <div class="w-12 h-12 rounded-full bg-obsidian-bg border border-obsidian-accent/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                {#if data.currentUserEntry.avatar}
                  <img src={data.currentUserEntry.avatar} alt="Your avatar" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
                {:else}
                  <span class="text-lg">🧑‍💻</span>
                {/if}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-mono font-medium truncate text-obsidian-accent">
                  {data.currentUserEntry.name ?? data.currentUserEntry.username}
                  <span class="text-xs text-obsidian-accent/70 ml-1">(You)</span>
                </p>
                <p class="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider">Level {data.currentUserEntry.level}</p>
              </div>
              <div class="text-right">
                <p class="text-lg font-orbitron font-bold text-obsidian-accent">
                  {(data.currentUserEntry.xp / 1000).toFixed(1)}K
                </p>
                <p class="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">XP</p>
              </div>
            </div>
          </div>
        {/if}
      </div>

    </div>
  </main>

  <!-- Ambient Background Effects -->
  <div class="fixed inset-0 pointer-events-none overflow-hidden -z-10">
    <div class="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-[120px]" style="background: rgba(7,165,201,0.12);"></div>
    <div class="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full blur-[120px]" style="background: rgba(168,85,247,0.08);"></div>
  </div>
</div>

<style>
  :global(.scanlines::before) {
    opacity: 0.03;
  }
</style>
