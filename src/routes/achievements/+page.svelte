<script lang="ts">
  import { ArrowLeft } from "lucide-svelte";
  import AchievementsSection from "$components/achivements/AchievementsSection.svelte";
  import AchievementFilter   from "$components/achivements/AchievementFilter.svelte";
  import type { PageData } from "./$types";

  export let data: PageData;

  let filter: "default" | "category" | "completed" | "in-progress" = "default";

  $: achievements = data.achievements;
  $: totalTiers   = achievements.reduce((sum, a) => sum + a.tiers.length, 0);
  $: unlockedTiers = achievements.reduce(
    (sum, a) => sum + a.tiers.filter((t) => t.unlocked).length,
    0,
  );

  // For "completed" and "in-progress" we filter the list; for the rest we pass everything.
  $: filtered = (() => {
    if (filter === "completed") {
      return achievements.filter((a) => a.tiers.length > 0 && a.tiers.every((t) => t.unlocked));
    }
    if (filter === "in-progress") {
      return achievements.filter((a) => {
        const done = a.tiers.length > 0 && a.tiers.every((t) => t.unlocked);
        return !done;
      });
    }
    return achievements;
  })();

  // "default" → flat sorted, "category" → grouped by category
  $: sectionMode = (filter === "category" ? "category" : "default") as "default" | "category";

  function backToDashboard() {
    history.back();
  }
</script>

<svelte:head>
  <title>Achievements | DevSim</title>
</svelte:head>

<div class="min-h-screen bg-obsidian-bg text-obsidian-text-primary text-sm scanlines ambient-glow bg-grid-cyber">
  <!-- Back button -->
  <div class="page-container pt-4">
    <button
      on:click={backToDashboard}
      class="inline-flex items-center gap-2 font-heading text-xs uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors group"
    >
      <ArrowLeft size={14} class="transition-transform group-hover:-translate-x-1" />
      <span>Back</span>
    </button>
  </div>

  <main class="page-container py-6">
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

    <AchievementsSection achievements={filtered} mode={sectionMode} />
  </main>

  <!-- Ambient background -->
  <div class="fixed inset-0 pointer-events-none overflow-hidden -z-10">
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
