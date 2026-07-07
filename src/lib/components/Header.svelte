<script lang="ts">
  import { Coins, ChartBar, Plus, Gift, Key } from "lucide-svelte";
  import type { UserData } from "$types";
  import { goto } from "$app/navigation";
  import ProfileDropDown from "$components/ProfileDropDown.svelte";
  import Logo from "$components/ui/Logo.svelte";

  export let userData: Partial<UserData>;
  export let onOpenStats: (() => void) | undefined = undefined;
  export let onOpenDailyRewards: (() => void) | undefined = undefined;
  export let showPass = false;

  function navigateToDashboard() {
    goto("/dashboard");
  }

  function navigateToMarketplace() {
    goto("/marketplace/coins");
  }

  function handleStatsClick() {
    if (onOpenStats) {
      onOpenStats();
    }
  }
</script>

<header class="border-b border-obsidian-accent/20 bg-obsidian-bg-light/85 backdrop-blur-2xl sticky top-0 z-50" data-tour="dashboard-header">
  <div class="w-full max-w-[1200px] px-4 py-3 md:px-6 lg:px-8 lg:py-4 flex items-center justify-between mx-auto">
    <!-- Logo -->
    <button on:click={navigateToDashboard} class="flex-shrink-0 text-left">
      <Logo markClass="w-12 h-12" textClass="text-xl" subtitle="Developer Simulation" />
    </button>


    <!-- User Section -->
    <div class="flex items-center gap-2 md:gap-3">
      <!-- Daily Rewards Button -->
      {#if onOpenDailyRewards}
        <div class="tip-wrap">
          <button
            on:click={onOpenDailyRewards}
            class="btn-cyber btn-cyber-outline flex items-center justify-center !p-2.5 group"
            aria-label="Daily Rewards"
          >
            <div class="relative">
              <Gift class="w-4 h-4 transition-transform group-hover:scale-110" />
              <span class="absolute -top-1 -right-1 flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-cyan opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-cyber-cyan"></span>
              </span>
            </div>
          </button>
          <span class="nav-tooltip" aria-hidden="true">Daily Rewards</span>
        </div>
      {/if}

      <!-- My Pass Button -->
      {#if showPass}
        <div class="tip-wrap">
          <button
            on:click={() => goto("/pass")}
            class="btn-cyber btn-cyber-outline flex items-center justify-center !p-2.5"
            aria-label="My Pass"
          >
            <Key class="w-4 h-4" />
          </button>
          <span class="nav-tooltip" aria-hidden="true">My Pass</span>
        </div>
      {/if}

      <!-- Stats Button -->
      {#if onOpenStats}
        <div class="tip-wrap">
          <button
            on:click={handleStatsClick}
            class="btn-cyber btn-cyber-outline flex items-center justify-center !p-2.5 group"
            aria-label="Stats"
          >
            <ChartBar class="w-4 h-4 text-obsidian-accent group-hover:text-obsidian-bg" />
          </button>
          <span class="nav-tooltip" aria-hidden="true">Stats</span>
        </div>
      {/if}

      <!-- Coins -->
      <div class="tip-wrap">
        <button
          on:click={navigateToMarketplace}
          class="flex items-center gap-2 bg-obsidian-surface/80 border border-cyber-warn/30 px-3 py-2 rounded-card shadow-[0_0_12px_rgba(255,180,0,0.1)] hover:bg-cyber-warn/10 transition-all duration-300 group"
          aria-label="Buy coins"
        >
          <Coins class="w-4 h-4 text-cyber-warn group-hover:scale-110 transition-transform" />
          <span class="font-orbitron font-semibold text-cyber-warn text-sm">{userData.coins?.toLocaleString()}</span>
          <span
            class="w-4 h-4 rounded-full bg-cyber-warn/15 border border-cyber-warn/40 flex items-center justify-center text-cyber-warn group-hover:bg-cyber-warn group-hover:text-obsidian-bg transition-colors"
            aria-hidden="true"
          >
            <Plus class="w-3 h-3" />
          </span>
        </button>
        <span class="nav-tooltip" aria-hidden="true">Buy Coins</span>
      </div>

      <!-- Divider -->
      <div class="w-px h-6 bg-obsidian-accent/20 mx-1 hidden sm:block" aria-hidden="true"></div>

      <!-- User Avatar -->
      <ProfileDropDown {userData} />
    </div>
  </div>
</header>

<style>
  .tip-wrap {
    position: relative;
  }

  .nav-tooltip {
    position: absolute;
    top: calc(100% + 10px);
    left: 50%;
    transform: translate(-50%, 4px);
    padding: 0.3rem 0.65rem;
    background: var(--bg-light);
    border: 1px solid rgba(7, 165, 201, 0.35);
    border-radius: 4px;
    color: var(--accent);
    font-family: var(--font-heading);
    font-size: 0.6rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s ease, transform 0.15s ease;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), 0 0 12px rgba(7, 165, 201, 0.12);
    z-index: 60;
  }

  .tip-wrap:hover .nav-tooltip,
  .tip-wrap:focus-within .nav-tooltip {
    opacity: 1;
    transform: translate(-50%, 0);
  }
</style>
