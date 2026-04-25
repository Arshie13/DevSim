<!--
  ProgressSection.svelte — XP level progress ring + stat pills.
  Level is computed from total accumulated XP so the display stays correct
  even when the DB level field lags behind.
-->
<script lang="ts">
  import { Zap, Coins, Flame, TrendingUp } from "lucide-svelte";
  import type { UserData } from "$types";

  export let user: UserData;
  export let streakDays: number = 7;
  export let weeklyGrowth: string = "+12%";

  function xpRequiredForLevel(level: number): number {
    return Math.floor(100 * Math.pow(1.5, level - 1));
  }

  function computeLevel(totalXp: number): { level: number; xpIntoLevel: number; xpForLevel: number } {
    let level = 1;
    let accumulated = 0;
    while (level < 200) {
      const needed = xpRequiredForLevel(level);
      if (accumulated + needed > totalXp) {
        return { level, xpIntoLevel: totalXp - accumulated, xpForLevel: needed };
      }
      accumulated += needed;
      level++;
    }
    const xpForLevel = xpRequiredForLevel(level);
    return { level, xpIntoLevel: totalXp - accumulated, xpForLevel };
  }

  $: computed       = computeLevel(user.xp);
  $: effectiveLevel = computed.level;
  $: xpIntoLevel    = computed.xpIntoLevel;
  $: xpForLevel     = computed.xpForLevel;
  $: xpPercentage   = Math.min((xpIntoLevel / xpForLevel) * 100, 100);
  $: circumference  = 2 * Math.PI * 34;
  $: dashOffset     = circumference * (1 - xpPercentage / 100);
</script>

<section
  class="relative bg-obsidian-bg-light border border-obsidian-accent/25 rounded-card overflow-hidden shadow-[0_0_30px_rgba(7,165,201,0.15)] hover:shadow-[0_0_40px_rgba(7,165,201,0.25)] transition-shadow duration-500"
>
  <!-- Top accent bar -->
  <div class="absolute top-0 left-0 right-0 h-[2px] z-10 bg-gradient-to-r from-transparent via-obsidian-accent/50 to-transparent"></div>

  <div class="relative z-10 p-5">
    <div class="flex items-center gap-6">

      <!-- Level ring -->
      <div class="relative shrink-0 w-20 h-20">
        <svg class="w-full h-full -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(39,39,42,0.8)" stroke-width="5" />
          <circle
            cx="40" cy="40" r="34" fill="none"
            stroke="url(#progressGrad)" stroke-width="5"
            stroke-linecap="round"
            stroke-dasharray="{circumference}"
            stroke-dashoffset="{dashOffset}"
            class="transition-all duration-700"
          />
          <defs>
            <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#07a5c9" />
              <stop offset="100%" stop-color="#34d399" />
            </linearGradient>
          </defs>
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span class="text-lg font-orbitron font-bold text-obsidian-text-muted leading-none">{effectiveLevel}</span>
          <span class="text-[0.55rem] font-mono text-obsidian-text-primary/40 uppercase tracking-wider">Level</span>
        </div>
      </div>

      <!-- XP details -->
      <div class="flex-1 min-w-0">
        <div class="flex items-baseline gap-2 mb-1">
          <h3 class="text-sm font-orbitron font-semibold text-obsidian-text-muted">Level Progress</h3>
          <span class="text-[0.65rem] font-mono text-obsidian-text-primary/40">
            {xpPercentage.toFixed(0)}% to Level {effectiveLevel + 1}
          </span>
        </div>

        <!-- XP bar -->
        <div class="xp-track mb-2">
          <div class="xp-fill" style="width: {xpPercentage}%"></div>
        </div>

        <!-- Stat pills -->
        <div class="flex flex-wrap items-center gap-4 text-[0.65rem] font-mono text-obsidian-text-primary/50 uppercase tracking-wide">
          <span class="flex items-center gap-1">
            <Zap class="w-3 h-3 text-obsidian-accent" />
            {xpIntoLevel.toLocaleString()} / {xpForLevel.toLocaleString()} XP
          </span>
          <span class="flex items-center gap-1">
            <Coins class="w-3 h-3 text-amber-400" />
            {user.coins.toLocaleString()} coins
          </span>
          <span class="flex items-center gap-1">
            <Flame class="w-3 h-3 text-orange-400" />
            {streakDays} day streak
          </span>
        </div>
      </div>

      <!-- Trend -->
      <div class="flex flex-col items-center gap-1 shrink-0 bg-emerald-500/10 border border-emerald-500/20 rounded-card px-4 py-3">
        <TrendingUp class="w-5 h-5 text-emerald-400" />
        <span class="text-[0.65rem] font-orbitron font-semibold text-emerald-400">{weeklyGrowth}</span>
        <span class="text-[0.55rem] font-mono text-obsidian-text-primary/40 uppercase">This week</span>
      </div>

    </div>
  </div>
</section>

<style>
  .xp-track {
    height: 4px;
    background: rgba(39, 39, 42, 0.8);
    border-radius: 2px;
    overflow: hidden;
  }
  .xp-fill {
    height: 100%;
    background: linear-gradient(90deg, #07a5c9, #34d399);
    border-radius: 2px;
    box-shadow: 0 0 8px rgba(7,165,201,0.4);
    transition: width 0.7s ease;
  }
</style>
