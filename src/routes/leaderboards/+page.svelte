<script lang="ts">
  import { Trophy, Crown, Medal, ArrowLeft, Zap, TrendingUp, Users } from "lucide-svelte";
  import { fade, fly, scale } from "svelte/transition";
  import { elasticOut, backOut } from "svelte/easing";
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

  $: topThree = data.entries.slice(0, 3);
  $: restOfList = data.entries.slice(3);

  function getRankIcon(rank: number) {
    if (rank === 1) return { icon: Crown, color: "text-[#ffd700]" };
    if (rank === 2) return { icon: Medal, color: "text-[#c0c0c0]" };
    if (rank === 3) return { icon: Medal, color: "text-[#cd7f32]" };
    return null;
  }

  function getRankGradient(rank: number) {
    if (rank === 1) return "from-[#ffd700]/20 to-[#ffd700]/5";
    if (rank === 2) return "from-[#c0c0c0]/20 to-[#c0c0c0]/5";
    if (rank === 3) return "from-[#cd7f32]/20 to-[#cd7f32]/5";
    return "from-obsidian-surface/60 to-obsidian-bg/40";
  }

  function getRankBorder(rank: number) {
    if (rank === 1) return "border-[#ffd700]/40 shadow-[0_0_30px_rgba(255,215,0,0.2)]";
    if (rank === 2) return "border-[#c0c0c0]/30 shadow-[0_0_25px_rgba(192,192,192,0.15)]";
    if (rank === 3) return "border-[#cd7f32]/30 shadow-[0_0_25px_rgba(205,127,50,0.15)]";
    return "border-obsidian-border/40";
  }

  function getAvatarGlow(rank: number) {
    if (rank === 1) return "shadow-[0_0_30px_rgba(255,215,0,0.4)] border-[#ffd700]";
    if (rank === 2) return "shadow-[0_0_25px_rgba(192,192,192,0.3)] border-[#c0c0c0]";
    if (rank === 3) return "shadow-[0_0_25px_rgba(205,127,50,0.3)] border-[#cd7f32]";
    return "shadow-[0_0_20px_rgba(7,165,201,0.3)] border-obsidian-accent";
  }

  function formatXP(xp: number) {
    if (xp >= 1000) return `${(xp / 1000).toFixed(1)}K`;
    return xp.toString();
  }

  function getPodiumHeight(rank: number) {
    if (rank === 1) return "h-64";
    if (rank === 2) return "h-52";
    if (rank === 3) return "h-44";
    return "";
  }

  function goBack() {
    window.history.back();
  }
</script>

<svelte:head>
  <title>Leaderboards | DevSim</title>
</svelte:head>

<div class="min-h-screen bg-obsidian-bg scanlines ambient-glow bg-grid-cyber overflow-x-hidden">
  <Header userData={headerUserData} />

  <main class="relative z-10 py-8 lg:py-12">
    <div class="max-w-[1400px] mx-auto px-6">

      <!-- Page Header -->
      <div class="mb-12" in:fade={{ duration: 400 }}>
        <button
          on:click={goBack}
          class="flex items-center gap-2 text-[var(--text-muted)]/50 hover:text-[var(--accent)] transition-colors mb-6 group font-label text-xs uppercase tracking-widest"
        >
          <ArrowLeft size={14} class="transition-transform group-hover:-translate-x-1" />
          Back
        </button>
        
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-5">
            <div class="relative">
              <div class="p-4 rounded-card bg-[var(--accent-dim)] border border-[var(--accent)]/30 text-[var(--accent)]">
                <Trophy size={28} />
              </div>
              <div class="absolute inset-0 rounded-card bg-[var(--accent)]/20 blur-xl animate-pulse"></div>
            </div>
            <div>
              <h1 class="text-4xl font-heading font-bold text-[var(--text-primary)] tracking-tight mb-1">Leaderboards</h1>
              <div class="flex items-center gap-3">
                <p class="text-sm font-body text-[var(--text-muted)]">Top developers ranked by XP</p>
                <span class="tag-cyber tag-label">Season 01</span>
                <div class="flex items-center gap-2 px-3 py-1 rounded-card bg-[var(--success)]/10 border border-[var(--success)]/30">
                  <span class="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse"></span>
                  <span class="text-xs font-label text-[var(--success)] uppercase tracking-widest">Live</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Stats Summary -->
          <div class="hidden lg:flex items-center gap-6">
            <div class="text-right">
              <p class="text-2xl font-heading font-bold text-[var(--accent)]">{data.entries.length}</p>
              <p class="text-xs font-label text-[var(--text-muted)] uppercase tracking-wider">Players</p>
            </div>
            <div class="w-px h-10 bg-[var(--border)]"></div>
            <div class="text-right">
              <p class="text-2xl font-heading font-bold text-[var(--warn)]">{data.entries.length > 0 ? formatXP(data.entries[0].xp) : '0'}</p>
              <p class="text-xs font-label text-[var(--text-muted)] uppercase tracking-wider">Top XP</p>
            </div>
          </div>
        </div>
      </div>

      {#if data.entries.length > 0}
        <!-- Podium Section (Top 3) -->
        <section class="mb-12" in:scale={{ duration: 600, delay: 200, easing: elasticOut }}>
          <div class="flex items-end justify-center gap-4 lg:gap-6 max-w-4xl mx-auto">
            
            <!-- #2 Silver -->
            {#if topThree[1]}
              {@const entry = topThree[1]}
              <div class="flex-1 max-w-[280px]">
                <div
                  class="card-cyber border rounded-card overflow-hidden relative group hover:-translate-y-2 transition-all duration-500 {getRankBorder(2)}"
                  style="background: linear-gradient(180deg, rgba(192,192,192,0.08) 0%, var(--bg-light) 100%);"
                  in:fly={{ y: 40, delay: 300, duration: 600, easing: elasticOut }}
                >
                  <!-- Rank Crown -->
                  <div class="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-[#c0c0c0] to-[#808080] flex items-center justify-center border-2 border-[var(--bg)] shadow-lg">
                      <span class="text-sm font-heading font-bold text-[var(--bg)]">#2</span>
                    </div>
                  </div>

                  <div class="pt-6 pb-5 px-5">
                    <!-- Avatar -->
                    <div class="flex justify-center mb-4">
                      <div class="relative">
                        <div class="w-20 h-20 rounded-full bg-obsidian-bg border-2 {getAvatarGlow(2)} flex items-center justify-center overflow-hidden">
                          {#if entry.avatar}
                            <img src={entry.avatar} alt="{entry.username}'s avatar" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
                          {:else}
                            <span class="text-3xl">🧑‍💻</span>
                          {/if}
                        </div>
                        <!-- Spinning Ring -->
                        <div class="absolute inset-0 rounded-full border border-t-[#c0c0c0] border-r-transparent border-b-transparent border-l-transparent animate-[spin_8s_linear_infinite]"></div>
                      </div>
                    </div>

                    <!-- Info -->
                    <div class="text-center mb-4">
                      <p class="text-base font-heading font-bold text-[var(--text-primary)] truncate">
                        {entry.name ?? entry.username}
                      </p>
                      <p class="text-xs font-label text-[var(--text-muted)] uppercase tracking-wider mt-1">Level {entry.level}</p>
                    </div>

                    <!-- XP Display -->
                    <div class="flex items-center justify-center gap-2 mb-3">
                      <Zap size={16} class="text-[#c0c0c0]" fill="currentColor" />
                      <span class="text-xl font-heading font-bold text-[#c0c0c0]">{formatXP(entry.xp)}</span>
                      <span class="text-xs font-label text-[var(--text-muted)]">XP</span>
                    </div>

                    <!-- XP Progress Bar -->
                    <div class="xp-track mb-2">
                      <div class="xp-fill" style="width: {(entry.xp % 1000) / 10}%; background: linear-gradient(90deg, #c0c0c0, #e8e8e8); box-shadow: 0 0 8px rgba(192,192,192,0.4);"></div>
                    </div>
                    <p class="text-[10px] font-label text-[var(--text-muted)] text-center uppercase tracking-wider">{entry.xp % 1000}/1000 to next level</p>
                  </div>

                  <!-- Podium Base -->
                  <div class="h-2 bg-gradient-to-r from-[#c0c0c0]/30 via-[#c0c0c0]/50 to-[#c0c0c0]/30"></div>
                </div>
              </div>
            {/if}

            <!-- #1 Gold (Center, Elevated) -->
            {#if topThree[0]}
              {@const entry = topThree[0]}
              <div class="flex-1 max-w-[300px] -mt-8">
                <div
                  class="card-cyber border rounded-card overflow-hidden relative group hover:-translate-y-3 transition-all duration-500 {getRankBorder(1)}"
                  style="background: linear-gradient(180deg, rgba(255,215,0,0.12) 0%, var(--bg-light) 100%);"
                  in:scale={{ delay: 400, duration: 600, easing: elasticOut }}
                >
                  <!-- Glow Effect -->
                  <div class="absolute inset-0 bg-[#ffd700]/5 blur-2xl group-hover:bg-[#ffd700]/10 transition-all duration-500"></div>
                  
                  <!-- Crown Icon -->
                  <div class="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <div class="relative">
                      <div class="w-12 h-12 rounded-full bg-gradient-to-br from-[#ffd700] to-[#ffed4e] flex items-center justify-center border-2 border-[var(--bg)] shadow-[0_0_20px_rgba(255,215,0,0.5)]">
                        <Crown class="w-6 h-6 text-[var(--bg)]" fill="currentColor" />
                      </div>
                      <div class="absolute inset-0 rounded-full bg-[#ffd700]/30 blur-md animate-pulse"></div>
                    </div>
                  </div>

                  <div class="pt-8 pb-6 px-6 relative z-10">
                    <!-- Avatar -->
                    <div class="flex justify-center mb-5">
                      <div class="relative">
                        <div class="w-24 h-24 rounded-full bg-obsidian-bg border-2 {getAvatarGlow(1)} flex items-center justify-center overflow-hidden">
                          {#if entry.avatar}
                            <img src={entry.avatar} alt="{entry.username}'s avatar" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
                          {:else}
                            <span class="text-4xl">🧑‍💻</span>
                          {/if}
                        </div>
                        <!-- Double Spinning Ring -->
                        <div class="absolute -inset-1 rounded-full border-2 border-t-[#ffd700] border-r-transparent border-b-transparent border-l-transparent animate-[spin_6s_linear_infinite]"></div>
                        <div class="absolute -inset-2 rounded-full border border-t-transparent border-r-[#ffd700]/50 border-b-transparent border-l-transparent animate-[spin_10s_linear_infinite_reverse]"></div>
                      </div>
                    </div>

                    <!-- Info -->
                    <div class="text-center mb-5">
                      <p class="text-lg font-heading font-bold text-[#ffd700] truncate">
                        {entry.name ?? entry.username}
                      </p>
                      <p class="text-xs font-label text-[var(--text-muted)] uppercase tracking-wider mt-1">Level {entry.level} · Elite Developer</p>
                    </div>

                    <!-- XP Display -->
                    <div class="flex items-center justify-center gap-2 mb-4">
                      <Zap size={18} class="text-[#ffd700]" fill="currentColor" />
                      <span class="text-3xl font-heading font-bold text-[#ffd700]">{formatXP(entry.xp)}</span>
                      <span class="text-xs font-label text-[var(--text-muted)]">XP</span>
                    </div>

                    <!-- XP Progress Bar -->
                    <div class="xp-track mb-2">
                      <div class="xp-fill" style="width: {(entry.xp % 1000) / 10}%; background: linear-gradient(90deg, #ffd700, #ffed4e); box-shadow: 0 0 12px rgba(255,215,0,0.5);"></div>
                    </div>
                    <p class="text-[10px] font-label text-[var(--text-muted)] text-center uppercase tracking-wider">{entry.xp % 1000}/1000 to next level</p>
                  </div>

                  <!-- Podium Base -->
                  <div class="h-2 bg-gradient-to-r from-[#ffd700]/40 via-[#ffd700]/60 to-[#ffd700]/40"></div>
                </div>
              </div>
            {/if}

            <!-- #3 Bronze -->
            {#if topThree[2]}
              {@const entry = topThree[2]}
              <div class="flex-1 max-w-[280px]">
                <div
                  class="card-cyber border rounded-card overflow-hidden relative group hover:-translate-y-2 transition-all duration-500 {getRankBorder(3)}"
                  style="background: linear-gradient(180deg, rgba(205,127,50,0.08) 0%, var(--bg-light) 100%);"
                  in:fly={{ y: 40, delay: 500, duration: 600, easing: elasticOut }}
                >
                  <!-- Rank Badge -->
                  <div class="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-[#cd7f32] to-[#8b4513] flex items-center justify-center border-2 border-[var(--bg)] shadow-lg">
                      <span class="text-sm font-heading font-bold text-[var(--bg)]">#3</span>
                    </div>
                  </div>

                  <div class="pt-6 pb-5 px-5">
                    <!-- Avatar -->
                    <div class="flex justify-center mb-4">
                      <div class="relative">
                        <div class="w-20 h-20 rounded-full bg-obsidian-bg border-2 {getAvatarGlow(3)} flex items-center justify-center overflow-hidden">
                          {#if entry.avatar}
                            <img src={entry.avatar} alt="{entry.username}'s avatar" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
                          {:else}
                            <span class="text-3xl">🧑‍💻</span>
                          {/if}
                        </div>
                        <!-- Spinning Ring -->
                        <div class="absolute inset-0 rounded-full border border-t-[#cd7f32] border-r-transparent border-b-transparent border-l-transparent animate-[spin_8s_linear_infinite]"></div>
                      </div>
                    </div>

                    <!-- Info -->
                    <div class="text-center mb-4">
                      <p class="text-base font-heading font-bold text-[var(--text-primary)] truncate">
                        {entry.name ?? entry.username}
                      </p>
                      <p class="text-xs font-label text-[var(--text-muted)] uppercase tracking-wider mt-1">Level {entry.level}</p>
                    </div>

                    <!-- XP Display -->
                    <div class="flex items-center justify-center gap-2 mb-3">
                      <Zap size={16} class="text-[#cd7f32]" fill="currentColor" />
                      <span class="text-xl font-heading font-bold text-[#cd7f32]">{formatXP(entry.xp)}</span>
                      <span class="text-xs font-label text-[var(--text-muted)]">XP</span>
                    </div>

                    <!-- XP Progress Bar -->
                    <div class="xp-track mb-2">
                      <div class="xp-fill" style="width: {(entry.xp % 1000) / 10}%; background: linear-gradient(90deg, #cd7f32, #e8a862); box-shadow: 0 0 8px rgba(205,127,50,0.4);"></div>
                    </div>
                    <p class="text-[10px] font-label text-[var(--text-muted)] text-center uppercase tracking-wider">{entry.xp % 1000}/1000 to next level</p>
                  </div>

                  <!-- Podium Base -->
                  <div class="h-2 bg-gradient-to-r from-[#cd7f32]/30 via-[#cd7f32]/50 to-[#cd7f32]/30"></div>
                </div>
              </div>
            {/if}

          </div>
        </section>

        <!-- Rest of Leaderboard List -->
        <section class="max-w-3xl mx-auto" in:fade={{ delay: 600, duration: 400 }}>
          <div class="flex items-center gap-3 mb-6">
            <Users size={18} class="text-[var(--accent)]" />
            <h2 class="text-lg font-heading font-bold text-[var(--text-primary)]">Rankings</h2>
            <div class="flex-1 h-px bg-gradient-to-r from-[var(--accent)]/30 to-transparent"></div>
            <span class="text-xs font-label text-[var(--text-muted)] uppercase tracking-wider">#4 - #{data.entries.length}</span>
          </div>

          <div class="card-cyber border rounded-card overflow-hidden" style="border-color: var(--card-border);">
            <div class="p-3 space-y-2">
              {#each restOfList as entry, index (entry.rank)}
                <div
                  class="flex items-center gap-4 px-5 py-3.5 rounded-card border transition-all duration-300 hover:translate-x-2 hover:bg-[var(--accent-dim)]/50 {entry.isCurrentUser ? 'bg-[var(--accent-dim)] border-[var(--accent)]/40 shadow-[0_0_15px_rgba(7,165,201,0.2)]' : 'border-transparent hover:border-[var(--accent)]/20'}"
                  in:fly={{ y: 20, delay: 700 + (index * 50), duration: 400, easing: elasticOut }}
                >
                  <!-- Rank Number -->
                  <div class="w-10 flex justify-center">
                    <span class="text-base font-heading font-bold text-[var(--text-muted)]">#{entry.rank}</span>
                  </div>

                  <!-- Avatar -->
                  <div class="relative flex-shrink-0">
                    <div class="w-12 h-12 rounded-full bg-obsidian-bg border {entry.isCurrentUser ? 'border-[var(--accent)] shadow-[0_0_20px_rgba(7,165,201,0.3)]' : 'border-[var(--accent)]/20'} flex items-center justify-center overflow-hidden">
                      {#if entry.avatar}
                        <img src={entry.avatar} alt="{entry.username}'s avatar" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
                      {:else}
                        <span class="text-lg">🧑‍💻</span>
                      {/if}
                    </div>
                    {#if entry.isCurrentUser}
                      <div class="absolute inset-0 rounded-full border border-t-[var(--accent)] border-r-transparent border-b-transparent border-l-transparent animate-[spin_6s_linear_infinite]"></div>
                    {/if}
                  </div>

                  <!-- User Info -->
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-label font-medium truncate {entry.isCurrentUser ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}">
                      {entry.name ?? entry.username}
                      {#if entry.isCurrentUser}
                        <span class="text-xs text-[var(--accent)]/70 ml-2">(You)</span>
                      {/if}
                    </p>
                    <div class="flex items-center gap-3 mt-1">
                      <p class="text-xs font-label text-[var(--text-muted)] uppercase tracking-wider">Level {entry.level}</p>
                      <!-- XP Progress Bar (Mini) -->
                      <div class="flex-1 max-w-[120px] xp-track">
                        <div class="xp-fill" style="width: {(entry.xp % 1000) / 10}%;"></div>
                      </div>
                    </div>
                  </div>

                  <!-- XP -->
                  <div class="text-right flex-shrink-0">
                    <div class="flex items-center gap-1.5">
                      <TrendingUp size={14} class="text-[var(--accent)]" />
                      <span class="text-lg font-heading font-bold text-[var(--accent)]">{formatXP(entry.xp)}</span>
                    </div>
                    <p class="text-[10px] font-label text-[var(--text-muted)] uppercase tracking-widest">XP</p>
                  </div>
                </div>
              {/each}
            </div>

            <!-- Current User (outside top 10) -->
            {#if data.currentUserEntry && !data.entries.find(e => e.isCurrentUser)}
              <div class="px-3 pb-3 pt-2 border-t border-[var(--card-border)]" in:fade={{ delay: 400, duration: 400 }}>
                <p class="text-[10px] font-label text-[var(--text-muted)] uppercase tracking-widest mb-2 px-2 flex items-center gap-2">
                  <TrendingUp size={12} />
                  Your Rank
                </p>
                <div class="flex items-center gap-4 px-5 py-4 rounded-card border bg-[var(--accent-dim)] border-[var(--accent)]/40 shadow-[0_0_15px_rgba(7,165,201,0.2)]">
                  <div class="w-10 flex justify-center">
                    <span class="text-base font-heading font-bold text-[var(--accent)]">#{data.currentUserEntry.rank}</span>
                  </div>
                  <div class="relative flex-shrink-0">
                    <div class="w-12 h-12 rounded-full bg-obsidian-bg border border-[var(--accent)] shadow-[0_0_20px_rgba(7,165,201,0.3)] flex items-center justify-center overflow-hidden">
                      {#if data.currentUserEntry.avatar}
                        <img src={data.currentUserEntry.avatar} alt="Your avatar" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
                      {:else}
                        <span class="text-lg">🧑‍💻</span>
                      {/if}
                    </div>
                    <div class="absolute inset-0 rounded-full border border-t-[var(--accent)] border-r-transparent border-b-transparent border-l-transparent animate-[spin_6s_linear_infinite]"></div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-label font-medium truncate text-[var(--accent)]">
                      {data.currentUserEntry.name ?? data.currentUserEntry.username}
                      <span class="text-xs text-[var(--accent)]/70 ml-2">(You)</span>
                    </p>
                    <div class="flex items-center gap-3 mt-1">
                      <p class="text-xs font-label text-[var(--text-muted)] uppercase tracking-wider">Level {data.currentUserEntry.level}</p>
                      <div class="flex-1 max-w-[120px] xp-track">
                        <div class="xp-fill" style="width: {(data.currentUserEntry.xp % 1000) / 10}%;"></div>
                      </div>
                    </div>
                  </div>
                  <div class="text-right flex-shrink-0">
                    <div class="flex items-center gap-1.5">
                      <TrendingUp size={14} class="text-[var(--accent)]" />
                      <span class="text-lg font-heading font-bold text-[var(--accent)]">{formatXP(data.currentUserEntry.xp)}</span>
                    </div>
                    <p class="text-[10px] font-label text-[var(--text-muted)] uppercase tracking-widest">XP</p>
                  </div>
                </div>
              </div>
            {/if}
          </div>
        </section>
      {:else}
        <!-- Empty State -->
        <div class="py-32 flex flex-col items-center justify-center" in:fade>
          <div class="relative mb-6">
            <Trophy size={80} class="text-[var(--text-muted)]/20" />
            <div class="absolute inset-0 animate-pulse text-[var(--accent)]/10">
              <Trophy size={80} />
            </div>
          </div>
          <p class="font-heading text-xl text-[var(--text-muted)]/40 uppercase tracking-widest mb-2">No players ranked yet</p>
          <p class="text-sm font-body text-[var(--text-muted)]/30">Be the first to claim the top spot!</p>
        </div>
      {/if}

    </div>
  </main>

  <!-- Enhanced Ambient Background Effects -->
  <div class="fixed inset-0 pointer-events-none overflow-hidden -z-10">
    <div class="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-[120px] animate-[pulse_8s_ease-in-out_infinite]" style="background: rgba(7,165,201,0.12);"></div>
    <div class="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full blur-[120px] animate-[pulse_10s_ease-in-out_infinite_2s]" style="background: rgba(168,85,247,0.08);"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[150px] animate-[pulse_12s_ease-in-out_infinite_4s]" style="background: rgba(255,215,0,0.04);"></div>
  </div>
</div>

<style>
  :global(.scanlines::before) {
    opacity: 0.03;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
