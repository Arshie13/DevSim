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
    avatar: data.user?.image ?? '',
    coins: data.userCoins,
  };

  function firstName (fullName: string) {
    return fullName.split(" ")[0];
  }

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

<div class="min-h-screen bg-obsidian-bg scanlines ambient-glow bg-grid-cyber">
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
  <main class="relative z-10 py-6">
    <div class="max-w-[1200px] mx-auto px-6">
    <!-- Top Section: Welcome + New Stack Button -->
    <div class="flex items-center justify-between mb-4 lg:mb-6">
      <div>
        <h2 class="text-2xl font-orbitron font-bold text-obsidian-text-muted">
          Welcome back, <span class="bg-gradient-to-r from-white via-obsidian-accent to-cyber-bright bg-clip-text text-transparent">{firstName(headerUserData.name)  }</span>
        </h2>
        <p class="text-sm font-rajdhani text-obsidian-text-primary/50 mt-1">
          Ready to continue your developer journey? Your progress awaits.
        </p>
      </div>
      
      <!-- Start New Stack Button -->
      <button
        on:click={navigateToStacks}
        class="btn-cyber btn-cyber-solid group flex items-center gap-3 !px-5 !py-3"
      >
        <div class="w-10 h-10 rounded-card bg-obsidian-bg/30 flex items-center justify-center">
          <Plus class="w-5 h-5 text-white" />
        </div>
        <div class="text-left">
          <p class="text-sm font-orbitron font-semibold text-obsidian-bg">Start New Stack</p>
          <p class="text-[0.6rem] font-mono text-obsidian-bg/70 normal-case tracking-normal">Begin a new simulation</p>
        </div>
        <ArrowRight class="w-4 h-4 text-obsidian-bg group-hover:translate-x-1 transition-transform ml-2" />
      </button>
    </div>

    <!-- KPIs Row -->
    <div class="mb-5 lg:mb-8">
      <KPIs kpis={kpiData} />
    </div>

    <!-- Stacks Section - Side by Side -->
    <div class="grid grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
      <CurrentStacks containers={data.userContainerList} finishedStacks={data.archivedStacks} maxVisible={2} />
      <FinishedStacks stacks={data.archivedStacks} userCoins={data.userCoins} maxVisible={3} />
    </div>
    </div><!-- end max-width wrapper -->
  </main>

  <!-- Ambient Background Effects -->
  <div class="fixed inset-0 pointer-events-none overflow-hidden -z-10">
    <!-- Glow orbs -->
    <div class="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-[120px]" style="background: rgba(7,165,201,0.12);"></div>
    <div class="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full blur-[120px]" style="background: rgba(168,85,247,0.08);"></div>
  </div>
</div>
