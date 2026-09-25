<script lang="ts">
  import {
    ArrowLeft,
    GitCommitHorizontalIcon,
    Award,
    Target,
    Coins,
  } from "lucide-svelte";
  import type { PageData } from "./$types";
  import type { UserData, ProfileMetricsData, RivalEntry } from "$types";
  

  // ── Modular profile components ────────────────────────────────────────────
  import ProfileCard from "$components/profile/ProfileCard.svelte";
  import MetricsSection from "$components/profile/MetricsSection.svelte";
  import FriendsSection from "$components/profile/FriendsSection.svelte";
  import AchievementSnapshot from "$components/achivements/AchievementSnapshot.svelte";
  import ProfileActivityFeed from "$components/profile/ProfileActivityFeed.svelte";
  import { goto, afterNavigate } from "$app/navigation";

  export let data: PageData;

  // Hide the back button when the page was opened directly (e.g. a shared
  // profile link) — there is no in-app history to return to.
  let canGoBack = false;
  afterNavigate(({ from }) => {
    canGoBack = from !== null;
  });

  // ── User state ────────────────────────────────────────────────────────────
  $: targetUser = data.targetUser as UserData;
  $: isOwnProfile = data.isOwnProfile;

  // ── Derived ───────────────────────────────────────────────────────────────
  $: metrics = data.metrics as ProfileMetricsData;
  $: rivals = data.rivals as RivalEntry[];

  $: memberSince = new Date(metrics.memberSince).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  $: leaderboardRank = metrics.leaderboardRank;

  $: metricCards = [
    {
      label: "Tasks Completed",
      value: String(metrics.tasksCompleted),
      icon: Target,
      color: "#07a5c9",
      bg: "rgba(7,165,201,0.12)",
    },
    {
      label: "File Edits",
      value: String(metrics.fileEdits),
      icon: GitCommitHorizontalIcon,
      color: "#a855f7",
      bg: "rgba(168,85,247,0.12)",
    },
    {
      label: "Coins Earned",
      value: String(metrics.coinsEarned),
      icon: Coins,
      color: "#ffb400",
      bg: "rgba(255,180,0,0.12)",
    },
    {
      label: "Achievements",
      value: String(metrics.achievementsCount),
      icon: Award,
      color: "#00e5a0",
      bg: "rgba(0,229,160,0.12)",
    },
  ];

 function handleBack() {
    if (window.history.length > 1) {
      history.back();
    } else {
      goto('/dashboard');
    }
  }
</script>

<svelte:head>
  <title>{targetUser.name}'s Profile | DevSim</title>
</svelte:head>

<div
  class="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col bg-obsidian-bg bg-grid-cyber scanlines ambient-glow text-obsidian-text-primary text-sm"
>

  <!-- Back button bar -->
  {#if canGoBack}
    <div class="page-container shrink-0 pt-8">
      <button
        on:click={handleBack}
        class="inline-flex items-center gap-2 font-heading text-xs uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors group"
      >
        <ArrowLeft size={14} class="transition-transform group-hover:-translate-x-1" />
        <span>Back</span>
      </button>
    </div>
  {/if}

  <!-- ── Main asymmetric grid ─────────────────────────────────────────────── -->
  <main
    class="flex-1 min-h-0 w-full page-container py-3 grid grid-cols-1 lg:[grid-template-columns:clamp(18rem,30%,24rem)_1fr] gap-3 lg:gap-4"
  >
    <!-- LEFT COLUMN — Profile + Snapshot -->
    <div class="flex flex-col gap-3 lg:gap-4 min-h-0">
      <!-- S1: Profile data -->
      <div class="flex-[3] min-h-0">
        <ProfileCard
          user={targetUser}
          {memberSince}
          {leaderboardRank}
          {isOwnProfile}
        />
      </div>

      <!-- S2: Achievement snapshot -->
      <div class="flex-[2] min-h-0">
        <AchievementSnapshot snapshots={data.topAchievements ?? []} />
      </div>
    </div>

    <!-- RIGHT COLUMN (70%) — KPIs + Rivals + Activity -->
    <div class="flex flex-col gap-3 lg:gap-4 min-h-0">
      <!-- S3: KPIs (metric cards) -->
      <div class="shrink-0">
        <MetricsSection metrics={metricCards} />
      </div>

      <!-- S4: Top rivals -->
      <div class="shrink-0 flex flex-col">
        <FriendsSection {rivals} />
      </div>

      <!-- S5: Recent activity -->
      <div class="flex-1 min-h-0">
        <ProfileActivityFeed activities={data.activity ?? []} />
      </div>
    </div>
  </main>

  <!-- Ambient background -->
  <div class="fixed inset-0 pointer-events-none overflow-hidden -z-10">
    <div
      class="absolute top-1/4 -left-32 w-96 h-96 bg-obsidian-accent/10 rounded-full blur-[120px]"
    ></div>
    <div
      class="absolute bottom-1/3 -right-32 w-80 h-80 bg-purple-500/8 rounded-full blur-[100px]"
    ></div>
  </div>
</div>

<style>
  :global(.btn-cyber-secondary) {
    border: 1px solid rgba(39, 39, 42, 0.8);
    color: rgba(208, 215, 221, 0.6);
    background: #12192a;
  }
  :global(.btn-cyber-secondary:hover) {
    border-color: rgba(7, 165, 201, 0.35);
    color: #d0d7dd;
    background: rgba(7, 165, 201, 0.08);
  }
</style>
