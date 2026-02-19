<script lang="ts">
  import { Code, Coins, ChartBar } from "lucide-svelte";
  import type { UserData } from "$types";
  import { goto } from "$app/navigation";

  export let userData: UserData;
  export let onOpenStats: (() => void) | undefined = undefined;

  function navigateToDashboard() {
    goto("/dashboard");
  }

  function navigateToProfile() {
    goto("/profile");
  }

  function handleStatsClick() {
    if (onOpenStats) {
      onOpenStats();
    }
  }

  $: hasProfileImage = Boolean(userData.avatar && /^https?:\/\//i.test(userData.avatar));

</script>

<header class="border-b border-obsidian-accent/20 bg-obsidian-bg-light sticky top-0 z-50">
  <div class="w-full max-w-[1200px] px-4 py-3 md:px-6 lg:px-8 lg:py-4 flex items-center justify-between mx-auto">
    <!-- Logo -->
    <div class="flex items-center gap-3">
      <div class="relative">
        <button on:click={navigateToDashboard} class="relative z-10">
        <div class="bg-obsidian-text-muted p-2 rounded-lg">
          <Code class="w-5 h-5 text-obsidian-bg" />
        </div>
        </button>
        <!-- Animated pulse -->
        <div class="absolute inset-0 bg-obsidian-text-muted rounded-lg animate-ping opacity-20"></div>
      </div>
      <div>
        <h1 class="text-xl font-bold text-obsidian-text-muted tracking-tight">DevSim</h1>
        <p class="text-xs text-obsidian-text-primary/50 uppercase tracking-widest">Developer Simulation</p>
      </div>
    </div>


    <!-- User Section -->
    <div class="flex items-center gap-4">
      <!-- Stats Button -->
      {#if onOpenStats}
        <button
          on:click={handleStatsClick}
          class="flex items-center gap-2 bg-obsidian-surface/80 hover:bg-obsidian-surface border border-obsidian-border hover:border-obsidian-accent/40 px-4 py-2 rounded-xl transition-all group"
        >
          <ChartBar class="w-4 h-4 text-obsidian-accent group-hover:text-obsidian-accent/80" />
          <span class="text-sm font-medium text-obsidian-text-muted">Stats</span>
        </button>
      {/if}
      
      <!-- Coins -->
      <div class="flex items-center gap-2 bg-obsidian-surface/80 border border-obsidian-border px-4 py-2 rounded-xl">
        <Coins class="w-4 h-4 text-amber-400" />
        <span class="font-semibold text-obsidian-text-muted">{userData.coins.toLocaleString()}</span>
      </div>
      
      <!-- User Avatar -->
      <div class="flex items-center gap-3">
        <div class="text-right hidden sm:block">
          <p class="text-sm font-semibold text-obsidian-text-muted">{userData.name}</p>
          <p class="text-xs text-obsidian-text-primary/50 uppercase tracking-wider">Developer</p>
        </div>
        <div class="relative">
          <button on:click={navigateToProfile} class="relative z-10">
          <div
            class="text-2xl w-11 h-11 bg-obsidian-surface border-2 border-obsidian-border rounded-full flex items-center justify-center"
          >
            {#if hasProfileImage}
              <img src={userData.avatar} alt={userData.name} class="w-full h-full rounded-full object-cover" />
            {:else}
              {userData.avatar}
            {/if}
          </div>
          </button>
          <!-- Online indicator -->
          <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-obsidian-bg"></div>
        </div>
      </div>
    </div>
  </div>
</header>
