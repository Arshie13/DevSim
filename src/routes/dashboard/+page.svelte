<script lang="ts">
  import { goto } from "$app/navigation";
  import type { IContainer, UserData, KPIData, WeeklyStats, ActivityItem, LeaderboardEntry, UserKpis } from "$types";
  import { Plus, ArrowRight } from "lucide-svelte";
  import Header from "$components/Header.svelte";
  import KPIs from "$components/dashboard/KPIs.svelte";
  import CurrentStacks from "$components/dashboard/CurrentStacks.svelte";
  import FinishedStacks from "$components/dashboard/FinishedStacks.svelte";
  import StatsDrawer from "$components/dashboard/StatsDrawer.svelte";

  interface DashboardProps {
    user: UserData;
    userContainerList: IContainer[];
    archivedStacks: IContainer[];
    userCoins: number;
    kpis: UserKpis;
    weekly: WeeklyStats;
    activity: ActivityItem[];
    leaderboard: LeaderboardEntry[];
  }

  export let data: DashboardProps;

  let isStatsDrawerOpen = false;

  const headerUserData: UserData = {
    id: data.user.id,
    name: data.user.name ?? "No Name",
    email: data.user.email,
    image: data.user.image,
    avatar: data.user.avatar ?? data.user.image ?? "",
    coins: data.userCoins,
    xp: data.user.xp,
    level: data.user.level,
    ownedAvatars: data.user.ownedAvatars,
    hasCompletedOnboarding: data.user.hasCompletedOnboarding,
  };

  function formatCompact(n: number): string {
    return n < 1000 ? `${n}` : `${Math.floor(n / 100) / 10}K`;
  }

  const kpis: KPIData[] = [
    { id: "stacks-completed",      label: "Stacks Completed",      value: data.kpis.stacksCompleted,          icon: "🏆", color: "from-amber-500 to-orange-600" },
    { id: "total-xp",              label: "Total XP",               value: formatCompact(data.kpis.totalXp),   icon: "⚡", color: "from-cyan-500 to-blue-600" },
    { id: "day-streak",            label: "Day Streak",             value: data.kpis.dayStreak,                icon: "🔥", color: "from-rose-500 to-pink-600" },
    { id: "achievements-unlocked", label: "Achievements Unlocked",  value: data.kpis.achievementsUnlocked,    icon: "🏅", color: "from-purple-500 to-fuchsia-600" },
  ];

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
    activities={data.activity}
    weeklyStats={data.weekly}
    leaderboard={data.leaderboard}
  />

  <!-- Main Content -->
  <main class="relative z-10 py-6">
    <div class="max-w-[1200px] mx-auto px-6">
    <!-- Top Section: Welcome + New Stack Button -->
    <div class="flex items-center justify-between mb-4 lg:mb-6">
      <div>
        <h2 class="text-2xl font-orbitron font-bold text-obsidian-text-muted">
          Welcome back, <span class="text-cyber-cyan">{headerUserData.name}</span>
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
      <KPIs {kpis} />
    </div>

    <!-- Stacks Section - Side by Side -->
    <div class="grid grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
      <CurrentStacks containers={data.userContainerList} currentStacks={data.archivedStacks} maxVisible={2} />
      <FinishedStacks containers={data.archivedStacks} userCoins={data.userCoins} maxVisible={3} />
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
