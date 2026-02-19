<script lang="ts">
  import { goto } from "$app/navigation";
  import type { PageData } from "./$types";
  import type { UserData } from "$types";
  import { Plus, ArrowRight } from "lucide-svelte";
  import Header from "$components/Header.svelte";
  import KPIs from "$components/dashboard/KPIs.svelte";
  import CurrentStacks from "$components/dashboard/CurrentStacks.svelte";
  import FinishedStacks from "$components/dashboard/FinishedStacks.svelte";
  import StatsDrawer from "$components/dashboard/StatsDrawer.svelte";
  import { 
    kpiData, 
    finishedStacks, 
    weeklyStats,
    recentActivity,
    leaderboardSnapshot,
    userData
  } from "$mocks";

  export let data: PageData;

  let isStatsDrawerOpen = false;

  const headerUserData: UserData = {
    ...userData,
    name: data.user?.name ?? "No Name",
    avatar: data.user?.image ?? ''
  };

  function openStatsDrawer() {
    isStatsDrawerOpen = true;
  }

  function navigateToStacks() {
    goto("/stacks");
  }
</script>

<svelte:head>
  <title>Dashboard | DevSim</title>
</svelte:head>

<div class="min-h-screen bg-obsidian-bg">
  <!-- Header -->
  <Header userData={headerUserData} onOpenStats={openStatsDrawer} />

  <!-- Stats Drawer -->
  <StatsDrawer 
    bind:isOpen={isStatsDrawerOpen}
    activities={recentActivity}
    weeklyStats={weeklyStats}
    leaderboard={leaderboardSnapshot}
  />

  <!-- Main Content -->
  <main class="px-4 py-4 md:px-6 md:py-5 lg:px-8 lg:py-6 max-w-[1200px] mx-auto">
    <!-- Top Section: Welcome + New Stack Button -->
    <div class="flex items-center justify-between mb-4 lg:mb-6">
      <div>
        <h2 class="text-xl lg:text-2xl font-bold text-obsidian-text-muted">
          Welcome back, <span class="text-obsidian-accent">{headerUserData.name}</span>
        </h2>
        <p class="text-sm text-obsidian-text-primary/50 mt-1">
          Ready to continue your developer journey? Your progress awaits.
        </p>
      </div>
      
      <!-- Start New Stack Button -->
      <button
        on:click={navigateToStacks}
        class="group flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-obsidian-accent/20 to-cyan-500/10 border border-obsidian-accent/40 hover:border-obsidian-accent/60 rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(7,165,201,0.2)]"
      >
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-obsidian-accent to-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(7,165,201,0.3)]">
          <Plus class="w-5 h-5 text-white" />
        </div>
        <div class="text-left">
          <p class="text-sm font-semibold text-obsidian-text-muted">Start New Stack</p>
          <p class="text-xs text-obsidian-text-primary/50">Begin a new simulation</p>
        </div>
        <ArrowRight class="w-4 h-4 text-obsidian-accent group-hover:translate-x-1 transition-transform ml-2" />
      </button>
    </div>

    <!-- KPIs Row -->
    <div class="mb-5 lg:mb-8">
      <KPIs kpis={kpiData} />
    </div>

    <!-- Stacks Section - Side by Side -->
    <div class="grid grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
      <CurrentStacks containers={data.userContainerList} {finishedStacks} maxVisible={2} />
      <FinishedStacks stacks={finishedStacks} maxVisible={3} />
    </div>
  </main>

  <!-- Ambient Background Effects -->
  <div class="fixed inset-0 pointer-events-none overflow-hidden -z-10">
    <!-- Grid pattern -->
    <div class="absolute inset-0 opacity-[0.02]" style="background-image: linear-gradient(rgba(7, 165, 201, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(7, 165, 201, 0.5) 1px, transparent 1px); background-size: 50px 50px;"></div>
    
    <!-- Glow orbs -->
    <div class="absolute top-1/4 -left-32 w-96 h-96 bg-obsidian-accent/10 rounded-full blur-[120px]"></div>
    <div class="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]"></div>
  </div>
</div>
