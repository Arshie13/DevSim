<!--
  ProgressSection.svelte — XP level progress ring + stat pills.
  Level is computed from total accumulated XP so the display stays correct
  even when the DB level field lags behind.
-->
<script lang="ts">
  import { Zap, Coins, Flame, TrendingUp } from "lucide-svelte";
  import type { UserData } from "$types";
  import { computeLevel } from "$lib/utils/level";

  export let user: UserData;
  export let streakDays: number = 7;
  export let weeklyGrowth: string = "+12%";

  $: computed = computeLevel(user.xp);
  $: effectiveLevel = computed.level;
  $: xpIntoLevel = computed.xpIntoLevel;
  $: xpForLevel = computed.xpForLevel;
  $: xpPercentage = Math.min((xpIntoLevel / xpForLevel) * 100, 100);
  $: circumference = 2 * Math.PI * 34;
  $: dashOffset = circumference * (1 - xpPercentage / 100);
</script>

<section
  class="relative bg-obsidian-bg-light border border-obsidian-accent/25 rounded-card overflow-hidden shadow-accent-glow-lg hover:shadow-accent-glow-hover transition-shadow duration-500"
>
  <!-- Top accent bar -->
  <div
    class="absolute top-0 left-0 right-0 h-[2px] z-10 bg-gradient-to-r from-transparent via-obsidian-accent/50 to-transparent"
  ></div>

  <div class="relative z-10 p-5">
    <div class="flex items-center gap-6">
      <!-- Level ring -->
      <div class="relative shrink-0 w-28 h-28">
        <svg class="w-full h-full -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke="rgb(var(--border-rgb) / 0.8)"
            stroke-width="5"
          />
          <circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke="url(#progressGrad)"
            stroke-width="5"
            stroke-linecap="round"
            stroke-dasharray={circumference}
            stroke-dashoffset={dashOffset}
            class="transition-all duration-700"
          />
          <defs>
            <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="var(--accent)" />
              <stop offset="100%" stop-color="var(--success)" />
            </linearGradient>
          </defs>
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span
            class="text-2xl font-heading font-bold text-obsidian-text-muted leading-none"
            >{effectiveLevel}</span
          >
          <span
            class="text-[0.55rem] font-label text-obsidian-text-primary/40 uppercase tracking-wider"
            >Level</span
          >
        </div>
      </div>

      <!-- XP details -->
      <div class="flex-1 min-w-0">
        <div class="flex items-baseline gap-2 mb-1">
          <h3
            class="text-sm font-heading font-semibold text-obsidian-text-muted"
          >
            Level Progress
          </h3>
          <span class="text-[0.65rem] font-label text-obsidian-text-primary/40">
            {xpPercentage.toFixed(0)}% to Level {effectiveLevel + 1}
          </span>
        </div>

        <!-- XP bar -->
        <div class="xp-track mb-2">
          <div class="xp-fill" style="width: {xpPercentage}%"></div>
        </div>

        <!-- Stat pills -->
        <div
          class="flex flex-wrap items-center gap-4 text-[0.65rem] font-label text-obsidian-text-primary/50 uppercase tracking-wide"
        >
          <span class="flex items-center gap-1">
            <Zap class="w-3 h-3 text-obsidian-accent" />
            {xpIntoLevel.toLocaleString()} / {xpForLevel.toLocaleString()} XP
          </span>
          <span class="flex items-center gap-1">
            <Coins class="w-3 h-3 text-cyber-warn" />
            {user.coins} coins
          </span>
          <span class="flex items-center gap-1">
            <Flame class="w-3 h-3 text-cyber-warn" />
            {streakDays} day streak
          </span>
        </div>
      </div>

      <!-- Trend -->
      <div
        class="flex flex-col items-center gap-1 shrink-0 bg-cyber-success/10 border border-cyber-success/20 rounded-card px-4 py-3"
      >
        <TrendingUp class="w-5 h-5 text-cyber-success" />
        <span
          class="text-[0.65rem] font-heading font-semibold text-cyber-success"
          >{weeklyGrowth}</span
        >
        <span
          class="text-[0.55rem] font-label text-obsidian-text-primary/40 uppercase"
          >This week</span
        >
      </div>
    </div>
  </div>
</section>

<style>
  .xp-track {
    height: 4px;
    background: rgb(var(--border-rgb) / 0.8);
    border-radius: 2px;
    overflow: hidden;
  }
  .xp-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent), var(--success));
    border-radius: 2px;
    box-shadow: 0 0 8px rgb(var(--accent-rgb) / 0.4);
    transition: width 0.7s ease;
  }
</style>
