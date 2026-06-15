<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import type { IContainer, UserData, KPIData, WeeklyStats, ActivityItem, LeaderboardEntry, UserKpis, AchievementFeedItem } from "$types";
  import { Plus, ArrowRight, Gift, Key } from "lucide-svelte";
  import Header from "$components/Header.svelte";
  import KPIs from "$components/dashboard/KPIs.svelte";
  import CurrentStacks from "$components/dashboard/CurrentStacks.svelte";
  import FinishedStacks from "$components/dashboard/FinishedStacks.svelte";
  import StatsDrawer from "$components/dashboard/StatsDrawer.svelte";
  import DailyRewardsModal from "$lib/components/dailyRewards/DailyRewardsModal.svelte";
  import DashboardWelcomeModal from "$components/onboarding/DashboardWelcomeModal.svelte";
  import DashboardTour from "$components/onboarding/DashboardTour.svelte";

  interface DashboardProps {
    user: UserData;
    userContainerList: IContainer[];
    archivedStacks: IContainer[];
    userCoins: number;
    kpis: UserKpis;
    weekly: WeeklyStats;
    activity: ActivityItem[];
    leaderboard: LeaderboardEntry[];
    achievementItems: AchievementFeedItem[];
  }

  export let data: DashboardProps;

   let isStatsDrawerOpen = false;
   let isDailyRewardsModalOpen = false;

   let headerUserData: UserData = {
     id: data.user.id,
     name: data.user.name ?? "No Name",
     email: data.user.email,
     image: data.user.image,
     avatar: data.user.avatar ?? data.user.image ?? "",
     coins: data.userCoins,
     xp: data.user.xp,
     level: data.user.level,
     ownedAvatars: data.user.ownedAvatars,
     hasCompletedTutorial: data.user.hasCompletedTutorial,
     hasSeenDashboardOnboarding: data.user.hasSeenDashboardOnboarding ?? false,
   };

   // Make headerUserData reactive to reward claims
   $: if (typeof headerUserData !== 'undefined') {
     // Initialized
   }

   $: firstName = data.user.givenName?.split(' ')[0] || data.user.name?.split(' ')[0] || 'Developer';

    // ── Dashboard Onboarding State ──
    type OnboardingPhase = 'welcome' | 'tour' | 'done';
    let onboardingPhase: OnboardingPhase = 'done';
    let tourMode: 'tour' | 'highlight' = 'tour';
    let tourStartStep = 0;

    $: shouldShowOnboarding = !data.user.hasSeenDashboardOnboarding && data.userContainerList.length === 0;

    onMount(() => {
      if (shouldShowOnboarding) {
        onboardingPhase = 'welcome';
      }
    });

    async function markOnboardingComplete() {
      try {
        await fetch('/api/user/dashboard-onboarding', { method: 'POST' });
      } catch {
        // Non-critical — ignore
      }
    }

    function onWelcomeSkip() {
      void markOnboardingComplete();
      onboardingPhase = 'done';
    }

    function onWelcomeComplete() {
      tourMode = 'tour';
      tourStartStep = 0;
      onboardingPhase = 'tour';
    }

    function onWelcomeHighlightStack() {
      void markOnboardingComplete();
      tourMode = 'highlight';
      tourStartStep = 5; // index of dashboard-start-stack-btn step (last of 6)
      onboardingPhase = 'tour';
    }

    function onTourComplete() {
      void markOnboardingComplete();
      onboardingPhase = 'done';
    }

    function onTourSkip() {
      void markOnboardingComplete();
      onboardingPhase = 'done';
    }

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

  function openDailyRewardsModal() {
    isDailyRewardsModalOpen = true;
  }

  function closeDailyRewardsModal() {
    isDailyRewardsModalOpen = false;
  }

  function handleRewardClaim(e: CustomEvent<{ day: number; coins: number; xp: number; newCoins?: number; newXp?: number }>) {
    console.log(`Reward claimed: Day ${e.detail.day}, +${e.detail.coins} coins, +${e.detail.xp} XP`);

    // Update header values if API returned new totals
    if (e.detail.newCoins !== undefined) {
      headerUserData = { ...headerUserData, coins: e.detail.newCoins };
    }
    if (e.detail.newXp !== undefined) {
      headerUserData = { ...headerUserData, xp: e.detail.newXp };
    }
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
    achievementItems={data.achievementItems}
  />

  <!-- Main Content -->
  <main class="relative z-10 py-6">
    <div class="max-w-[1200px] mx-auto px-6">
    <!-- Top Section: Welcome + New Stack Button -->
    <div class="flex items-center justify-between mb-4 lg:mb-6">
      <div>
        <h2 class="text-2xl font-orbitron font-bold text-obsidian-text-muted">
          {#if shouldShowOnboarding}
            Welcome to DevSim, <span class="text-cyber-cyan">{firstName}!</span>
          {:else}
            Welcome back, <span class="text-cyber-cyan">{firstName}!</span>
          {/if}
        </h2>
        <p class="text-sm font-rajdhani text-obsidian-text-primary/50 mt-1">
          {#if shouldShowOnboarding}
            Your simulated development journey begins here.
          {:else}
            Ready to continue your developer journey? Your progress awaits.
          {/if}
        </p>
      </div>

      <div class="flex items-center gap-3">
        <!-- Daily Rewards Button -->
        <button
          on:click={openDailyRewardsModal}
          class="btn-cyber btn-cyber-outline group flex items-center gap-2 !px-4 !py-2.5"
        >
          <div class="relative">
            <Gift class="w-5 h-5 text-cyber-cyan transition-transform group-hover:scale-110" />
            <span class="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-cyan opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyber-cyan"></span>
            </span>
          </div>
          <div class="text-left">
            <p class="text-[0.65rem] font-orbitron font-semibold text-cyber-cyan uppercase tracking-wider">Daily Rewards</p>
          </div>
        </button>

        <!-- Pass Button -->
        <button
          on:click={() => goto("/pass")}
          class="btn-cyber btn-cyber-solid group flex items-center gap-3 !px-5 !py-3"
        >
          <div class="w-10 h-10 rounded-card bg-obsidian-bg/30 flex items-center justify-center">
            <Key class="w-5 h-5 text-white" />
          </div>
          <div class="text-left">
            <p class="text-sm font-orbitron font-semibold text-obsidian-bg">My Pass</p>
            <p class="text-[0.6rem] font-mono text-obsidian-bg/70 normal-case tracking-normal">Access your benefits</p>
          </div>
          <ArrowRight class="w-4 h-4 text-obsidian-bg group-hover:translate-x-1 transition-transform ml-2" />
        </button>

        <!-- Start New Stack Button -->
        <button
          on:click={navigateToStacks}
          class="btn-cyber btn-cyber-solid group flex items-center gap-3 !px-5 !py-3"
          data-tour="dashboard-start-stack-btn"
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
    </div>

    <!-- KPIs Row -->
    <div class="mb-5 lg:mb-8" data-tour="dashboard-kpis">
      <KPIs {kpis} />
    </div>

    <!-- Stacks Section - Side by Side -->
    <div class="grid grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
      <div data-tour="dashboard-current-stacks">
        <CurrentStacks containers={data.userContainerList} currentStacks={data.archivedStacks} maxVisible={2} />
      </div>
      <div data-tour="dashboard-finished-stacks">
        <FinishedStacks containers={data.archivedStacks} userCoins={data.userCoins} maxVisible={3} />
      </div>
    </div>
    </div><!-- end max-width wrapper -->
  </main>

   <!-- Daily Rewards Modal Component -->
   <DailyRewardsModal
     bind:isOpen={isDailyRewardsModalOpen}
     on:claim={handleRewardClaim}
   />

   <!-- Dashboard Onboarding -->
   {#if shouldShowOnboarding}
     {#if onboardingPhase === 'welcome'}
        <DashboardWelcomeModal
          allowSkip={true}
          on:skip={onWelcomeSkip}
          on:complete={onWelcomeComplete}
          on:highlightStack={onWelcomeHighlightStack}
        />
      {:else if onboardingPhase === 'tour'}
        <DashboardTour
          mode={tourMode}
          startStep={tourStartStep}
          allowSkip={true}
          on:complete={onTourComplete}
          on:skip={onTourSkip}
          on:openDrawer={() => { isStatsDrawerOpen = true; }}
          on:closeDrawer={() => { isStatsDrawerOpen = false; }}
        />
     {/if}
   {/if}

   <!-- Ambient Background Effects -->
   <div class="fixed inset-0 pointer-events-none overflow-hidden -z-10">
     <!-- Glow orbs -->
     <div class="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-[120px]" style="background: rgba(7,165,201,0.12);"></div>
     <div class="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full blur-[120px]" style="background: rgba(168,85,247,0.08);"></div>
   </div>
</div>
