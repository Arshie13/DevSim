<script lang="ts">
  import { Code, Coins, ChartBar } from "lucide-svelte";
  import type { UserData } from "$types";
  import { goto } from "$app/navigation";
  import ProfileDropDown from "$components/ProfileDropDown.svelte";

  export let userData: Partial<UserData>;
  export let onOpenStats: (() => void) | undefined = undefined;

  function navigateToDashboard() {
    goto("/dashboard");
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
    <div class="flex items-center gap-3">
      <div class="relative">
        <button on:click={navigateToDashboard} class="relative z-10">
        <div class="bg-gradient-to-br from-obsidian-accent to-cyber-bright p-2 rounded-card shadow-accent-glow">
          <Code class="w-5 h-5 text-obsidian-bg" />
        </div>
        </button>
        <!-- Animated pulse -->
        <div class="absolute inset-0 bg-obsidian-accent rounded-card animate-ping opacity-20"></div>
      </div>
      <div>
        <h1 class="text-xl font-orbitron font-bold text-obsidian-text-muted tracking-tight">DEVSIM</h1>
        <p class="text-xs font-mono text-obsidian-text-primary/50 uppercase tracking-widest">Developer Simulation</p>
      </div>
    </div>


    <!-- User Section -->
    <div class="flex items-center gap-4">
      <!-- Stats Button -->
      {#if onOpenStats}
        <button
          on:click={handleStatsClick}
          class="btn-cyber btn-cyber-outline flex items-center gap-2 !px-4 !py-2 group"
        >
          <ChartBar class="w-4 h-4 text-obsidian-accent group-hover:text-obsidian-bg" />
          <span class="text-sm font-orbitron">Stats</span>
        </button>
      {/if}
      
      <!-- Coins -->
      <div class="flex items-center gap-2 bg-obsidian-surface/80 border border-cyber-warn/30 px-4 py-2 rounded-card shadow-[0_0_12px_rgba(255,180,0,0.1)]">
        <Coins class="w-4 h-4 text-cyber-warn" />
        <span class="font-orbitron font-semibold text-cyber-warn text-sm">{userData.coins?.toLocaleString()}</span>
      </div>
      
      <!-- User Avatar -->
      <div class="flex items-center gap-3">
         <div class="text-right hidden sm:block">
           <p class="text-sm font-orbitron font-semibold text-obsidian-text-muted">{userData.name}</p>
           <p class="text-xs font-mono text-obsidian-text-primary/50 uppercase tracking-wider">Developer</p>
         </div>
        <ProfileDropDown {userData} />
      </div>
    </div>
  </div>
</header>
