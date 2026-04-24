<script lang="ts">
  import { ArrowLeft } from "lucide-svelte";
  import AchievementsSection from "$components/achivements/AchievementsSection.svelte";
  import AchievementFilter   from "$components/achivements/AchievementFilter.svelte";
  import type { PageData } from "./$types";

  export let data: PageData;

  let filter: "all" | "completed" | "in-progress" = "all";

  $: achievements = data.achievements;
  $: totalTiers   = achievements.reduce((sum, a) => sum + a.tiers.length, 0);
  $: unlockedTiers = achievements.reduce(
    (sum, a) => sum + a.tiers.filter((t) => t.unlocked).length,
    0,
  );

  $: filtered = filter === "all"
    ? achievements
    : achievements.filter((a) => {
        const done = a.tiers.length > 0 && a.tiers.every((t) => t.unlocked);
        return filter === "completed" ? done : !done;
      });

  function backToDashboard() {
    history.back();
  }
</script>

<svelte:head>
  <title>Achievements | DevSim</title>
</svelte:head>

<div class="min-h-screen bg-obsidian-bg text-obsidian-text-primary text-sm">
  <!-- Back button -->
  <div class="w-full max-w-[1200px] mx-auto px-4 pt-4 md:px-6 lg:px-8">
    <button
      on:click={backToDashboard}
      class="btn-cyber btn-cyber-secondary inline-flex items-center gap-2 !py-2 !px-4"
    >
      <ArrowLeft class="w-4 h-4" />
      <span>Back</span>
    </button>
  </div>

  <main class="w-full max-w-[1200px] mx-auto px-4 py-6 md:px-6 lg:px-8">
    <header class="mb-5">
      <h1 class="font-orbitron font-bold text-2xl text-obsidian-text-primary">All Achievements</h1>
      <p class="font-mono text-xs text-obsidian-text-primary/50 uppercase tracking-wider mt-1">
        {unlockedTiers} / {totalTiers} tiers unlocked
      </p>
    </header>

    <!-- Filter bar -->
    <div class="mb-5">
      <AchievementFilter bind:filter />
    </div>

    <AchievementsSection achievements={filtered} />
  </main>

  <!-- Ambient background -->
  <div class="fixed inset-0 pointer-events-none overflow-hidden -z-10">
    <div class="absolute inset-0 bg-grid-cyber"></div>
    <div class="absolute top-1/4 -left-32 w-96 h-96 bg-obsidian-accent/10 rounded-full blur-[120px]"></div>
    <div class="absolute bottom-1/3 -right-32 w-80 h-80 bg-purple-500/8 rounded-full blur-[100px]"></div>
  </div>
</div>

<style>
  :global(.btn-cyber-secondary) {
    border: 1px solid rgba(39, 39, 42, 0.80);
    color: rgba(208, 215, 221, 0.60);
    background: #12192a;
  }
  :global(.btn-cyber-secondary:hover) {
    border-color: rgba(7, 165, 201, 0.35);
    color: #d0d7dd;
    background: rgba(7, 165, 201, 0.08);
  }
</style>
